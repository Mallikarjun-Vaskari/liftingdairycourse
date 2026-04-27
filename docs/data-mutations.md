# Data Mutation Standards

## CRITICAL RULE: Server Actions Only

ALL data mutations in this application MUST be performed via **Server Actions**.

This is non-negotiable. The following approaches are strictly forbidden:

- Route handlers (`app/api/` routes) — **DO NOT USE for mutations**
- Client-side `fetch`/`axios` calls to any endpoint — **FORBIDDEN**
- Directly calling Drizzle ORM from a component or page — **FORBIDDEN**
- `FormData`-typed parameters on any server action — **FORBIDDEN**

## Database Access: Drizzle ORM via `/data` Helper Functions

All database writes (inserts, updates, deletes) MUST go through helper functions located in the `src/data` directory — the same convention used for data fetching.

### Rules:

1. **Never call Drizzle ORM directly from a server action or component** — always delegate to a `src/data` helper function.
2. **Never use raw SQL** — all mutations MUST use Drizzle ORM's query builder API.
3. **Every helper function MUST scope writes to the authenticated user** — a user must only ever be able to mutate their own data. Never accept a bare record ID without verifying ownership.

**Example of a correct `src/data` mutation helper:**

```ts
// src/data/workouts.ts
import { db } from "@/lib/db";
import { workouts } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function createWorkout(userId: string, name: string, date: Date) {
  return db.insert(workouts).values({ userId, name, date }).returning();
}

export async function deleteWorkout(userId: string, workoutId: string) {
  return db
    .delete(workouts)
    .where(eq(workouts.id, workoutId) && eq(workouts.userId, userId));
}
```

## Server Actions

### File Location

Server actions MUST live in a file named `actions.ts` collocated with the route or feature they belong to.

```
src/app/dashboard/workouts/
  page.tsx
  actions.ts   ← server actions go here
```

### File Structure

Every `actions.ts` file MUST begin with the `"use server"` directive.

```ts
"use server";
```

### Typed Parameters — No `FormData`

Server action parameters MUST be explicitly typed TypeScript values. `FormData` is **forbidden** as a parameter type.

```ts
// WRONG — do not do this
export async function createWorkout(data: FormData) { ... }

// CORRECT
export async function createWorkout(params: CreateWorkoutParams) { ... }
```

### No Redirects Inside Server Actions

**`redirect()` must never be called inside a server action.** Server actions MUST return a typed result object. The calling client component is responsible for reading that result and performing any navigation.

```ts
// WRONG — do not do this
export async function createWorkoutAction(params: CreateWorkoutParams) {
  // ...
  await createWorkout(userId, name, startedAt);
  redirect("/dashboard"); // ← FORBIDDEN
}

// CORRECT — return a result, let the client redirect
export async function createWorkoutAction(params: CreateWorkoutParams) {
  // ...
  const workout = await createWorkout(userId, name, startedAt);
  return { success: true, data: workout };
}
```

In the client component, use `useRouter` from `next/navigation` to navigate after the action resolves:

```tsx
const router = useRouter();

const result = await createWorkoutAction(params);
if (result.success) {
  router.push("/dashboard");
}
```

### Validation with Zod

Every server action MUST validate its arguments using **Zod** before doing anything else. Do not trust caller-provided values.

- Define a Zod schema for each action's input at the top of the file (or in a co-located `schemas.ts`).
- Parse and validate at the start of the action body.
- Return a typed error object on validation failure — do not throw.

**Example of a correct server action:**

```ts
// src/app/dashboard/workouts/actions.ts
"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { createWorkout } from "@/data/workouts";

const CreateWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  date: z.coerce.date(),
});

type CreateWorkoutParams = z.infer<typeof CreateWorkoutSchema>;

export async function createWorkoutAction(params: CreateWorkoutParams) {
  const parsed = CreateWorkoutSchema.safeParse(params);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() };
  }

  const session = await auth();
  const workout = await createWorkout(session.user.id, parsed.data.name, parsed.data.date);

  return { success: true, data: workout };
}
```

## Summary Checklist

Before writing any mutation code, verify:

- [ ] The mutation lives in an `actions.ts` file collocated with the relevant route or feature
- [ ] The file starts with `"use server"`
- [ ] No action parameter uses the `FormData` type — all params are typed TypeScript values
- [ ] Every action validates its input with a **Zod** schema before any other work
- [ ] The action delegates database writes to a helper in `src/data`, not Drizzle directly
- [ ] The `src/data` helper scopes the write to the authenticated user (ownership enforced at the DB level)
- [ ] No route handler (`app/api/`) is involved in handling this mutation
- [ ] `redirect()` is NOT called inside the server action — navigation is handled by the client after the action returns
