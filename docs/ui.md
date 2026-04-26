# UI Coding Standards

## Component Library

**Only shadcn/ui components may be used for UI elements in this project.**

- Do NOT create custom components. If a UI element is needed, use the appropriate shadcn/ui component.
- If a required component is not yet installed, add it via the shadcn CLI:
  ```bash
  npx shadcn@latest add <component-name>
  ```
- Do not wrap shadcn/ui components in custom wrapper components. Use them directly.
- Compose complex UI by combining shadcn/ui primitives together on the page — not by abstracting them into new components.

## Date Formatting

All date formatting must use **date-fns**.

Dates must be displayed using ordinal day, abbreviated month, and full year:

| Date | Formatted Output |
|------|-----------------|
| September 1, 2025 | 1st Sep 2025 |
| August 2, 2025 | 2nd Aug 2025 |
| January 3, 2026 | 3rd Jan 2026 |
| June 4, 2026 | 4th Jun 2026 |

### Implementation

Use the `format` function from `date-fns` with the `do MMM yyyy` format string:

```ts
import { format } from "date-fns";

format(date, "do MMM yyyy"); // e.g. "1st Sep 2025"
```

> `do` produces the ordinal day (1st, 2nd, 3rd, 4th…), `MMM` the abbreviated month, and `yyyy` the four-digit year.
