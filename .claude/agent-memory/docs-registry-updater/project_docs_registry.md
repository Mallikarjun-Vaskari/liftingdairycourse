---
name: Docs Registry State
description: Tracks the format and current list of entries in the Coding Standards section of CLAUDE.md
type: project
---

Entries in the `## Coding Standards` list in CLAUDE.md use the format `-/docs/filename.md` (hyphen immediately followed by the path, no space, no leading indentation).

Current registered docs (as of 2026-04-27):
- -/docs/ui.md
- -/docs/data-fetching.md
- -/docs/auth.md
- -/docs/data-mutations.md
- -/docs/server-components.md
- -/docs/routing.md

**Why:** Keeping this list accurate ensures agents read the correct standards before generating code.
**How to apply:** When adding a new doc, append at the end of the list in CLAUDE.md using the exact same format.
