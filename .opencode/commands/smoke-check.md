---
description: "Critical-path smoke gate before QA hand-off — runs the automated suite. A failed check means the build is not QA-ready."
---
!`bash ".opencode/hooks/yaml-helper.sh" resolve_config --keys automation,workflow,qa.level,testing.strict`

Load the skill with ID `smoke-check` (use the skill tool), then follow it for this request.

Skill arguments (may be empty): $ARGUMENTS
