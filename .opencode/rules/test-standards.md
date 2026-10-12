---
paths:
  - "tests/**"
---

# Test Standards

- Test naming follows the project's conventions — every name says the scenario
  and the expected result: a flat `tests/*.test.ts` file whose cases are named as
  sentences, such as `test('take damage reduces health', ...)`.
- Every test must have a clear arrange/act/assert structure
- Unit tests must not depend on external state (filesystem, network, database)
- Integration tests must clean up after themselves
- Performance tests must specify acceptable thresholds and fail if exceeded
- Test data must be defined in the test or in dedicated fixtures, never shared mutable state
- Mock external dependencies — tests should be fast and deterministic
- Every bug fix must have a regression test that would have caught the original bug —
  and **you must watch it fail before you trust it.** Run the new test against the
  unfixed code, confirm it fails, then apply the fix and confirm it passes. A
  regression test that has only ever been seen passing is not known to test anything.

  > This is `.opencode/rules/skill-authoring.md`'s "a gate you have not watched fail
  > is not a gate", applied to tests. It is written out here because stating the
  > *goal* is not enough. A regression test for an iteration-order defect can use
  > a fixture where no cell takes part in two transfers per tick — it then passes
  > against the very bug it was written for, and looks authoritative doing it. The
  > fixture, not the assertion, is what makes it useless, and only running it
  > against the unfixed code exposes that.

## Examples

**Correct** (proper naming + Arrange/Act/Assert):

```ts
import { expect, test } from 'bun:test'

test('take damage reduces health', () => {
  // Arrange
  const health = new Health(100)

  // Act
  health.takeDamage(25)

  // Assert
  expect(health.current).toBe(75)
})
```

**Incorrect**:

```ts
test('test1', () => { // VIOLATION: no descriptive name
  const health = new Health() // VIOLATION: no arrange step
  health.takeDamage(25) // VIOLATION: no clear assert
  expect(health.current < 100).toBe(true) // VIOLATION: imprecise assertion
})
```
