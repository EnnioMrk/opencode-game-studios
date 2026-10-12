---
description: "Configure engine and version. Pins it in AGENTS.md; WebSearch fills reference docs when the version is beyond LLM training data."
---
!`bash ".opencode/hooks/yaml-helper.sh" resolve_config --keys workflow`

Load the skill with ID `setup-engine` (use the skill tool), then follow it for this request.

Skill arguments (may be empty): $ARGUMENTS
