# Skill: Debugging Protocol

## Objective
Fix the actual root cause of a failing test, error, or reported bug — with
evidence, not guesswork.

## Process (in order, do not skip steps)
1. **Reproduce**: Run the failing test / trigger the error yourself first.
   Don't trust a description alone — see the actual failure output,
   stack trace, or error message.
2. **Form a hypothesis**: Based on the stack trace / error / failing
   assertion, state in one or two sentences what you think is wrong and
   why, before changing any code.
3. **Verify the hypothesis**: Read the relevant source (and test, if a
   test is failing) to confirm the hypothesis is consistent with the
   actual code — not just plausible-sounding.
4. **Make the minimal fix**: Change only what's needed to resolve the
   root cause. No incidental refactors, renames, or style changes — flag
   those to @refactor separately instead of bundling them in.
5. **Re-run** the failing test/repro to confirm the fix actually resolves
   it, and re-run the broader suite to check for regressions.
6. **Explain**: State the root cause in plain language, then show the
   diff. Don't show the diff first and explain after.

## Escalation rules
- If the fix would require changing a public function signature, API
  response shape, or database schema that other code depends on — STOP
  and flag this to the user before proceeding. This is a contract change,
  not a bug fix, and needs explicit approval.
- If after step 3 the hypothesis turns out to be wrong, go back to step 2
  with a new hypothesis rather than making speculative changes and seeing
  what sticks.
- If the bug can't be reproduced, say so explicitly rather than guessing
  at a fix for something unconfirmed.

## Hard constraints
- No `console.log`/`print` debugging left behind in the final fix.
- No suppressing the symptom (e.g. wrapping in try/catch to silence an
  error) without actually fixing the underlying cause, unless explicitly
  asked for graceful degradation.
