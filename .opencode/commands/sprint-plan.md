---
description: "New or updated sprint plan from the current milestone, completed work, and available capacity."
---
!`bash ".opencode/hooks/yaml-helper.sh" resolve_config --keys review_mode,automation,story_granularity,workflow`

!`ls production/sprints/ 2>/dev/null || echo "(no production/sprints/ directory yet)"`

Load the skill with ID `sprint-plan` (use the skill tool), then follow it for this request.

Skill arguments (may be empty): $ARGUMENTS
