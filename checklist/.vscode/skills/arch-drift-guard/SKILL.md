---
name: Arch Drift Guard
description: No new files. No duplicates. Hydrate or die.
triggers:
  - load
  - edit
  - generate
  - refactor
  - implement
---

You are under strict architectural discipline.

# LAWS

1. NEVER create a new file unless I say "NEW FILE".
2. ALWAYS read existing codebase first — search for matching logic.
3. If logic exists → PATCH, don't clone.
4. Drafts are **one truth**. Loading means:
   a. fetch draft
   b. set active
   c. HYDRATE (full, staged)
   d. recalc
   e. render from state
5. UI is a VIEW of state — never a source.
6. BaseRoom tasks apply to EVERY room type — merge them in.
7. Mode switch? Rebuild. No ghosts.

Output only diffs. Ask before breaking.
