# Setup Requirements

This template needs a few tools for full functionality. Hooks carry on without
an optional tool and lose only the check it powers. The required ones are
required: without Python 3 every setting falls back to its default and a commit
that stages data JSON is blocked; without Bash no hook script runs at all.

## Required

| Tool | Purpose | Install |
| ---- | ---- | ---- |
| **Git** | Version control, branch management | [git-scm.com](https://git-scm.com/) |
| **OpenCode V2** | The agent runtime this template is built for | Install the CLI from [opencode.ai](https://opencode.ai), or use it through **OpenChamber** |
| **Python 3** | Reads `project.yaml` for every skill and hook | [python.org](https://www.python.org/). Without it every setting silently falls back to its default, and a commit that stages data JSON is blocked because it cannot be validated |
| **Bash** | Runs every hook script | Built into macOS and Linux. On Windows, install [Git for Windows](https://git-scm.com/downloads/win) and make sure `bash` is on `PATH` — OpenCode runs without it, but no CCGS hook does |

## Recommended

| Tool | Used By | Purpose | Install |
| ---- | ---- | ---- | ---- |
| **jq** | Hooks (8 of 12) | JSON parsing in commit/push/asset/agent hooks | See below |

### Installing jq

**Windows** (any of these):
```
winget install jqlang.jq
choco install jq
scoop install jq
```

**macOS**:
```
brew install jq
```

**Linux**:
```
sudo apt install jq     # Debian/Ubuntu
sudo dnf install jq     # Fedora
sudo pacman -S jq       # Arch
```

## Platform Notes

### Windows
- Git for Windows includes **Git Bash**, which provides the `bash` command the
  plugin uses to run every script in `.opencode/hooks/`
- The plugin launches scripts with `bash`; if that resolves to the wrong
  interpreter or fails, fix `PATH` so `bash.exe` comes from Git for Windows

### macOS / Linux
- Bash is available natively
- Install `jq` via your package manager for full hook support

## Verifying Your Setup

Run these commands to check prerequisites:

```bash
git --version          # Should show git version
bash --version         # Should show bash version
jq --version           # Should show jq version (optional)
python --version       # Required: Python 3 (python3 or py also work)
```

## What Happens Without Optional Tools

| Missing Tool | Effect |
| ---- | ---- |
| **jq** | Nothing is lost: every hook falls back to `grep` to read its JSON input. jq is only more robust with unusual input. |
| **Python 3** | Not optional (see Required). Every setting falls back to its default, because `project.yaml` is read through Python; the asset hook skips JSON validation and says so; a commit that stages data JSON is blocked. |
| **Both** | As without Python. |

## Configuration Files

The port has two kinds of configuration:

| File | Holds | Read by |
| ---- | ---- | ---- |
| `project.yaml` (+ gitignored `project.local.yaml`) | Studio settings: rigor, workflow, review mode, QA level, team size | Every skill, through `.opencode/hooks/yaml-helper.sh resolve_config` |
| `opencode.jsonc` | OpenCode configuration: permission rules, plugin list | OpenCode itself |
| `.opencode/plugins/ccgs.ts` | The hook wiring: scripts, rules injection, session injection | OpenCode itself |

OpenCode discovers `opencode.jsonc` and `.opencode/` from the workspace directory
up to the project root. Open a session inside this project (root or any
subfolder) and everything loads. A session opened **outside** the project gets
none of the hooks, deny rules or agents — the template only applies inside its
own tree.

## Permission Rules

`opencode.jsonc` ships a conservative permission policy:

- test runs are allowed without prompting (`pytest`, `python -m pytest`);
- dangerous commands are **denied** — `rm -rf` variants, force pushes, `git
  reset --hard`, `git clean -f`, `sudo`, `chmod 777`, and reads of `.env` files.

Deny rules are final: no client prompt can override them. The plugin adds its
own validation on top (commit checks, push warnings) — see
`.opencode/docs/hooks-reference.md`.

An "ask" decision is resolved in the client. OpenChamber shows the request; the
CLI asks in the terminal. The framework's "May I write?" convention is an
instruction to the model on top of that, not a replacement for it.

## Recommended IDE

OpenCode works with any editor, but the template is optimized for:

- **OpenChamber** — the desktop interface this template was ported for
- **VS Code** or **Cursor** with an OpenCode integration
- The terminal-based OpenCode CLI/TUI
