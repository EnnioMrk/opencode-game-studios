/**
 * OpenCode Game Studios — hook wiring plugin.
 *
 * Wires the ported Claude Code hook scripts in `.opencode/hooks/` to OpenCode's
 * V2 plugin API, and adds the two features OpenCode does not have built in:
 *
 *   - path-scoped rules: an edit of a file matching a rule's `paths:` glob
 *     injects that rule's text into the model's context on the next call;
 *   - startup context: `session-start.sh` / `detect-gaps.sh` run once per root
 *     session, and compaction output is queued for the next call.
 *
 * Everything is defensive: a failing hook or unreadable file is logged and
 * ignored — it never breaks a session.
 */
// Type-only import: erased at runtime (Bun transpiles this file), so the plugin
// loads without a node_modules install. `Plugin.define` is just an identity
// helper, and the V2 loader reads `id` and `setup` from the default export.
import type { Plugin } from "@opencode/plugin"
import { spawnSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"

type Rule = {
  name: string
  globs: RegExp[]
  body: string
}

const plugin: Plugin.Plugin = {
  id: "ccgs",
  async setup(ctx) {
    const root = ctx.location.directory

    const hooksDir = path.join(root, ".opencode", "hooks")
    if (!fs.existsSync(path.join(hooksDir, "yaml-helper.sh"))) {
      console.warn("[ccgs] .opencode/hooks not found — the plugin is inactive in", root)
      return
    }

    const log = (...args: unknown[]) => console.warn("[ccgs]", ...args)

    /* ------------------------------------------------------------------ */
    /* helpers                                                            */
    /* ------------------------------------------------------------------ */

    const runHook = (
      script: string,
      payload: Record<string, unknown>,
      timeout = 15000,
    ): { status: number | null; stdout: string; stderr: string } => {
      try {
        const file = path.join(hooksDir, script)
        if (!fs.existsSync(file)) return { status: null, stdout: "", stderr: "" }
        const res = spawnSync("bash", [file], {
          cwd: root,
          input: `${JSON.stringify(payload)}\n`,
          encoding: "utf8",
          timeout,
          env: {
            ...process.env,
            OPENCODE_PROJECT_DIR: root,
            CCGS_ROOT: root,
          },
        })
        return {
          status: res.status,
          stdout: (res.stdout as string) ?? "",
          stderr: (res.stderr as string) ?? "",
        }
      } catch (err) {
        log("hook failed:", script, err)
        return { status: null, stdout: "", stderr: "" }
      }
    }

    /** Queued texts for the next model call, per session. */
    const pending = new Map<string, string[]>()
    const queue = (sessionID: string, text: string) => {
      if (!sessionID) {
        log("dropping queued text (no session id):", text.slice(0, 80))
        return
      }
      if (!text.trim()) return
      log("queued for", sessionID, text.slice(0, 80).replace(/\n/g, " "))
      const list = pending.get(sessionID) ?? []
      list.push(text)
      pending.set(sessionID, list)
    }

    /** Sessions whose startup context already ran (root sessions only). */
    const started = new Set<string>()
    const isRootCache = new Map<string, boolean>()
    const isRoot = async (sessionID: string): Promise<boolean> => {
      if (!sessionID) return false
      const cached = isRootCache.get(sessionID)
      if (cached !== undefined) return cached
      try {
        const info: any = await ctx.session.get({ sessionID } as any)
        const parent = info?.parentID ?? info?.data?.parentID
        const value = !parent
        isRootCache.set(sessionID, value)
        return value
      } catch (err) {
        log("session lookup failed:", sessionID, err)
        return false
      }
    }

    /* ------------------------------------------------------------------ */
    /* rules (path-scoped)                                                */
    /* ------------------------------------------------------------------ */

    const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

    const globToRegex = (glob: string): RegExp | null => {
      try {
        let re = ""
        for (let i = 0; i < glob.length; i++) {
          const c = glob[i]
          if (c === "*") {
            if (glob[i + 1] === "*") {
              if (glob[i + 2] === "/") {
                re += "(?:.*/)?"
                i += 2
              } else {
                re += ".*"
                i += 1
              }
            } else {
              re += "[^/]*"
            }
          } else if (c === "?") {
            re += "[^/]"
          } else if (c === "{") {
            const end = glob.indexOf("}", i)
            if (end === -1) re += "\\{"
            else {
              const options = glob.slice(i + 1, end).split(",").map((o) => escape(o.trim()))
              re += `(?:${options.join("|")})`
              i = end
            }
          } else {
            re += escape(c)
          }
        }
        return new RegExp(`^${re}$`, "i")
      } catch {
        return null
      }
    }

    const loadRules = (): Rule[] => {
      const dir = path.join(root, ".opencode", "rules")
      const rules: Rule[] = []
      try {
        for (const name of fs.readdirSync(dir)) {
          if (!name.endsWith(".md")) continue
          const text = fs.readFileSync(path.join(dir, name), "utf8")
          const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
          if (!match) continue
          const frontmatter = match[1]
          const body = match[2].trim()
          const globs: RegExp[] = []
          let inPaths = false
          for (const line of frontmatter.split(/\r?\n/)) {
            if (/^paths\s*:/.test(line)) {
              inPaths = true
              continue
            }
            if (!inPaths) continue
            const item = line.match(/^\s*-\s*(.+?)\s*$/)
            if (!item) {
              inPaths = false
              continue
            }
            const value = item[1].replace(/^["']|["']$/g, "")
            const regex = globToRegex(value)
            if (regex) globs.push(regex)
          }
          if (globs.length === 0) continue
          rules.push({ name: name.slice(0, -3), globs, body })
        }
      } catch (err) {
        log("rules load failed:", err)
      }
      return rules
    }

    const rules = loadRules()
    const injectedRules = new Map<string, Set<string>>()
    const touchedFiles = new Map<string, Set<string>>()
    const logInjection = (sessionID: string, rule: Rule, file: string) => {
      try {
        const dir = path.join(root, "production", "session-logs")
        fs.mkdirSync(dir, { recursive: true })
        fs.appendFileSync(
          path.join(dir, "instructions-loaded.log"),
          `${new Date().toISOString()} | ${sessionID} | rule: ${rule.name} | file: ${file}\n`,
        )
      } catch {
        /* log only */
      }
    }

    const matchRules = (rule: Rule, file: string) =>
      rule.globs.some((glob) => glob.test(file))

    /** Relative, forward-slash path for a tool input. */
    const fileFromInput = (input: unknown): string | undefined => {
      const value = input as Record<string, unknown> | undefined
      if (!value || typeof value !== "object") return undefined
      const raw =
        (value.filePath as string) ??
        (value.file_path as string) ??
        (value.path as string) ??
        (value.filepath as string)
      if (typeof raw !== "string" || raw.length === 0) return undefined
      let normalized = raw.replace(/\\/g, "/")
      const prefix = root.replace(/\\/g, "/").replace(/\/$/, "") + "/"
      if (normalized.startsWith(prefix)) normalized = normalized.slice(prefix.length)
      return normalized.replace(/^\.\//, "")
    }

    /* ------------------------------------------------------------------ */
    /* tool hooks                                                         */
    /* ------------------------------------------------------------------ */

    const SHELL_TOOLS = /^(bash|shell)$/i
    const EDIT_TOOLS = /^(edit|write|patch|multiedit|apply_patch)$/i
    const SUBAGENT_TOOLS = /^(subagent|task|agent)$/i

    const agentType = (input: unknown): string => {
      const value = input as Record<string, unknown> | undefined
      const raw =
        (value?.agent as string) ??
        (value?.agentID as string) ??
        (value?.agentId as string) ??
        (value?.id as string) ??
        (value?.description as string)
      return typeof raw === "string" && raw.length > 0 ? raw : "unknown"
    }

    await ctx.tool.hook("execute.before", async (event) => {
      try {
        if (SUBAGENT_TOOLS.test(event.tool)) {
          runHook(
            "log-agent.sh",
            {
              hook_event_name: "SubagentStart",
              session_id: event.sessionID,
              agent_type: agentType(event.input),
            },
            5000,
          )
        }
      } catch (err) {
        log("execute.before failed:", err)
      }
    })

    await ctx.tool.hook("execute.after", async (event) => {
      try {
        if (EDIT_TOOLS.test(event.tool)) {
          const file = fileFromInput(event.input)
          if (!file) return
          const list = touchedFiles.get(event.sessionID) ?? new Set<string>()
          list.add(file)
          touchedFiles.set(event.sessionID, list)

          if (event.status === "completed") {
            for (const script of ["validate-assets.sh", "validate-skill-change.sh"]) {
              const res = runHook(
                script,
                {
                  hook_event_name: "PostToolUse",
                  session_id: event.sessionID,
                  tool_name: "Write",
                  tool_input: { file_path: file },
                },
                10000,
              )
              if (res.status === 2) {
                queue(event.sessionID, res.stderr || res.stdout)
              } else if (res.stdout.trim().startsWith("{")) {
                try {
                  const parsed = JSON.parse(res.stdout)
                  const extra =
                    parsed?.hookSpecificOutput?.additionalContext ?? parsed?.systemMessage
                  if (extra) queue(event.sessionID, String(extra))
                } catch {
                  /* not JSON — ignore */
                }
              }
            }
          }
          return
        }

        if (SUBAGENT_TOOLS.test(event.tool)) {
          runHook(
            "log-agent-stop.sh",
            {
              hook_event_name: "SubagentStop",
              session_id: event.sessionID,
              agent_type: agentType(event.input),
            },
            5000,
          )
          return
        }

        if (SHELL_TOOLS.test(event.tool) && event.status === "error") {
          // Failed shell calls are already visible; nothing to add.
          return
        }
      } catch (err) {
        log("execute.after failed:", err)
      }
    })

    /* ------------------------------------------------------------------ */
    /* permission hook: commit + push validation                          */
    /* ------------------------------------------------------------------ */

    await ctx.permission.hook("evaluate", async (event) => {
      try {
        if (event.action !== "shell") return
        const resources = Array.isArray(event.resources) ? event.resources : []
        for (const command of resources) {
          if (typeof command !== "string") continue
          for (const script of ["validate-commit.sh", "validate-push.sh"]) {
            const res = runHook(
              script,
              {
                hook_event_name: "PreToolUse",
                tool_name: "Bash",
                tool_input: { command },
              },
              15000,
            )
            if (res.status === 2) {
              event.effect = "deny"
              event.message = res.stderr.trim() || res.stdout.trim() || "Blocked by project hooks."
              return
            }
            if (res.stdout.trim().startsWith("{")) {
              try {
                const parsed = JSON.parse(res.stdout)
                const extra =
                  parsed?.hookSpecificOutput?.additionalContext ?? parsed?.systemMessage
                if (extra && event.sessionID) queue(event.sessionID, String(extra))
              } catch {
                /* not JSON — ignore */
              }
            }
          }
        }
      } catch (err) {
        log("permission.evaluate failed:", err)
      }
    })

    /* ------------------------------------------------------------------ */
    /* session context hook: startup, compaction, rules                   */
    /* ------------------------------------------------------------------ */

    await ctx.session.hook("context", async (event) => {
      try {
        const sessionID = event.sessionID
        if (!sessionID) return

        if (!started.has(sessionID) && (await isRoot(sessionID))) {
          started.add(sessionID)
          let injected = 0
          for (const script of ["session-start.sh", "detect-gaps.sh"]) {
            const res = runHook(
              script,
              { hook_event_name: "SessionStart", session_id: sessionID, cwd: root },
              10000,
            )
            if (res.stdout.trim()) {
              event.system.push({ type: "text", text: res.stdout.trim() })
              injected += res.stdout.trim().length
            }
          }
          log("startup context injected:", sessionID, injected, "chars")
        }

        // path-scoped rules for files touched since the last call
        const files = touchedFiles.get(sessionID)
        if (files && files.size > 0) {
          const done = injectedRules.get(sessionID) ?? new Set<string>()
          for (const file of files) {
            for (const rule of rules) {
              if (done.has(rule.name)) continue
              if (!matchRules(rule, file)) continue
              done.add(rule.name)
              event.system.push({
                type: "text",
                text: `Project rule \`${rule.name}\` applies to \`${file}\`:\n\n${rule.body}`,
              })
              logInjection(sessionID, rule, file)
            }
          }
          injectedRules.set(sessionID, done)
          touchedFiles.set(sessionID, new Set())
        }

        const queued = pending.get(sessionID)
        if (queued && queued.length > 0) {
          pending.set(sessionID, [])
          for (const text of queued) {
            event.system.push({ type: "text", text })
          }
        }
      } catch (err) {
        log("context hook failed:", err)
      }
    })

    await ctx.session.hook("compaction", async (event) => {
      try {
        if (event.sessionID) {
          runHook(
            "pre-compact.sh",
            { hook_event_name: "PreCompact", session_id: event.sessionID, trigger: "auto" },
            10000,
          )
        }
      } catch (err) {
        log("compaction hook failed:", err)
      }
    })

    /* ------------------------------------------------------------------ */
    /* events: session stop, post-compaction                              */
    /* ------------------------------------------------------------------ */

    const controller = new AbortController()
    void (async () => {
      try {
        for await (const event of ctx.event.subscribe({ signal: controller.signal })) {
          const anyEvent = event as any
          const type = anyEvent?.type as string | undefined
          const sessionID = anyEvent?.data?.sessionID as string | undefined
          if (!type || !sessionID) continue

          const eventDir = anyEvent?.location?.directory
          if (typeof eventDir === "string") {
            const normalize = (value: string) => value.replace(/\\/g, "/").replace(/\/$/, "")
            if (normalize(eventDir) !== normalize(root)) continue
          }

          if (type === "session.compaction.ended") {
            if (!(await isRoot(sessionID))) continue
            const res = runHook(
              "post-compact.sh",
              { hook_event_name: "PostCompact", session_id: sessionID },
              10000,
            )
            if (res.stdout.trim()) queue(sessionID, res.stdout.trim())
            continue
          }

          if (type === "session.idle") {
            if (!started.has(sessionID) && !(await isRoot(sessionID))) continue
            // session.idle fires per turn; run per turn by design (the script
            // guards its own archive with a content hash).
            runHook(
              "session-stop.sh",
              { hook_event_name: "Stop", session_id: sessionID, cwd: root },
              10000,
            )
          }
        }
      } catch (err) {
        const aborted =
          err instanceof Error && (err.name === "AbortError" || /abort/i.test(err.message))
        if (!aborted) log("event stream failed:", err)
      }
    })()

    return () => {
      controller.abort()
      pending.clear()
      started.clear()
      touchedFiles.clear()
    }
  },
}

export default plugin
