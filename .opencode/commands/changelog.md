---
description: "Auto-generate a changelog from git commits and sprint data. Internal and player-facing versions."
---
!`bash ".opencode/hooks/yaml-helper.sh" resolve_config --keys automation`

!`git log --oneline -30 2>/dev/null || true`

!`git tag --list --sort=-v:refname 2>/dev/null | head -5`

Load the skill with ID `changelog` (use the skill tool), then follow it for this request.

Skill arguments (may be empty): $ARGUMENTS
