---
description: Run an on-demand security review of the codebase or a specific module
---

When the user types `/security-review [optional: scope]`, orchestrate using
`.agents/agents.md` and `.agents/skills/`.

`[scope]` can be a directory, module, or feature name (e.g. "auth module",
"src/api/"). If omitted, review the entire project.

### Execution Sequence
1. Load `skills/detect_stack.md` and identify the stack(s) involved.
2. Act as **@security**, load `skills/security_review.md`. Run the full
   checklist against the specified scope (or the entire project if no
   scope was given). Apply the stack-specific checks matching the detected
   stack.
3. Act as **@security**, load `skills/dependency_management.md`. Run the
   stack-appropriate dependency audit command (`npm audit`, `yarn audit`,
   `flutter pub outdated`, etc.) and cross-reference with known CVE
   databases.
4. Report findings:
   - Severity-rank all issues (critical / high / medium / low).
   - For each finding, include: location, description, proposed fix, and
     any tradeoff the fix introduces.
   - If **no issues** are found, state that explicitly rather than
     inventing findings.
5. If any critical or high severity issues are found, recommend immediate
   action items. For medium/low, present them as improvement suggestions
   the user can prioritize.
