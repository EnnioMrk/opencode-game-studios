---
description: "End-of-story completion review — verifies each acceptance criterion, checks GDD/ADR deviations, prompts code review, updates status."
---
!`bash ".opencode/hooks/yaml-helper.sh" resolve_config --keys review_mode,automation,workflow,story_granularity,qa.level,testing.strict,system_overrides`

Load the skill with ID `story-done` (use the skill tool), then follow it for this request.

Skill arguments (may be empty): $ARGUMENTS
