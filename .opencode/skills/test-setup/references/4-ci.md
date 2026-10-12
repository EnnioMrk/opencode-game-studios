# /test-setup — Phase 4: Create CI/CD Workflow

> Part of `/test-setup`. `SKILL.md` names when to read this file; the settings it
> resolved and the rules under its later headings still apply here.

## Phase 4: Create CI/CD Workflow

Create `.github/workflows/tests.yml`:

```yaml
name: Automated Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v7

      - name: Install Bun
        uses: oven-sh/setup-bun@v2

      - name: Install dependencies
        run: bun install --frozen-lockfile

      # The project's test command: `commands.test` from project.yaml when set,
      # else the `test` script in package.json (`bun test`).
      - name: Run tests
        run: bun test
```

The workflow runs the tests only. Keep the project's other gates (typecheck,
lint, build) in their own workflow, or add them here as further steps.

---
