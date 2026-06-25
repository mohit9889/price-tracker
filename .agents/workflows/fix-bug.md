---
description: Diagnose and fix a reported bug, then verify with tests
---

When the user types `/fix-bug <description>`, orchestrate using
`.agents/agents.md` and `.agents/skills/`.

### Execution Sequence
1. Load `skills/detect_stack.md`.
2. Act as **@debugger**, load `skills/debugging_protocol.md`. Reproduce
   the bug described in `<description>`, form and verify a hypothesis,
   and apply the minimal fix. Explain the root cause before showing the
   diff.
3. Act as **@tester**: if no test currently covers this bug, write one
   that would have caught it (a regression test), then run the full
   relevant suite.
   - If the regression test fails, hand back to **@debugger** for one
     more pass (max **2 debug attempts** total). If it still fails after
     the second attempt, STOP and report the situation to the user with:
     what was tried, the current hypothesis, and a recommendation.
4. If the fix touches a public API/contract or database schema, flag
   this explicitly to the user before considering the task done — do not
   silently ship a contract change.
5. Summarize root cause, fix, and regression test added.
