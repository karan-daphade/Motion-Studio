EXECUTION PROTOCOL (mandatory)

1. READ FIRST: AGENTS.md, docs/roadmap.md, and every doc this task names. Quote the exact
   requirement IDs you are implementing.
2. NO GUESSING: never invent package names, APIs, flags, versions, file contents or
   results. For any library: run `npm view <pkg> version license`, read its installed
   types/README in node_modules, or open the official docs. If you cannot verify
   something, write UNVERIFIED and ask me.
3. PLAN BEFORE CODE: post a numbered plan (files to touch, commands to run, how each step
   will be verified). Wait for my "approved". Stay strictly in scope.
4. BUILD IN SMALL STEPS: after each step run the check commands (typecheck, lint, tests,
   or the specific command). Paste the real output.
5. FIX LOOP: if a check fails, diagnose from the actual error, fix, and rerun. Maximum
   3 attempts per problem, then stop and report what you tried.
6. SELF-AUDIT: re-read the task and requirements, and list each acceptance criterion
   with PASS or FAIL plus the evidence (command and output, or file path and line).
7. NEVER say "done" or "should work". Only report what you ran and saw.
8. UPDATE DOCS: tick docs/roadmap.md, add a docs/decisions entry for any decision,
   record new packages in LICENSES.md, then commit with a clear message.
9. FINISH WITH: summary, files changed, commands run, open risks, UNVERIFIED items.
   Then STOP and wait for my next instruction.
