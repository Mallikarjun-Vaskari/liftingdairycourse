# Data Fetching Standards

## CRITICAL RULE: Server Components Only

ALL data fetching in this application MUST be done exclusively via **Server Components**.

This is non-negotiable. Data fetching via the following methods is strictly forbidden:

- Route handlers (`app/api/` routes) — **DO NOT USE for data fetching**
- Client components (`"use client"`) — **DO NOT FETCH DATA here**
- `useEffect` + `fetch` — **FORBIDDEN**
- SWR, React Query, or any client-side fetching library — **FORBIDDEN**
- `getServerSideProps` / `getStaticProps` — not applicable (App Router), but also forbidden

If you need data in a Client Component, fetch it in a Server Component parent and pass it down as props.

## Database Access: Drizzle ORM via `/data` Helper Functions

All database queries MUST go through helper functions located in the `/data` directory.

### Rules:

1. **Never query the database directly from a component or page** — always call a `/data` helper function.
2. **Never use raw SQL** — all queries MUST use Drizzle ORM's query builder API.
3. **Every helper function MUST scope data to the authenticated user** — a logged-in user must only ever be able to access their own data. Never return data that belongs to another user.

### Enforcing User Scoping

Every `/data` helper function that returns user-specific data MUST:

- Accept the authenticated user's ID as a parameter (or resolve it internally from the session)
- Include a `.where(eq(table.userId, userId))` clause (or equivalent) in every Drizzle query
- Never expose a parameter or code path that allows fetching another user's data

**Example of correct pattern:**

```ts
// src/data/workouts.ts
import { db } from "@/lib/db";
import { workouts } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function getWorkoutsForUser(userId: string) {
  return db.select().from(workouts).where(eq(workouts.userId, userId));
}
```

**Example of correct Server Component usage:**

```tsx
// src/app/dashboard/page.tsx  (Server Component — no "use client")
import { getWorkoutsForUser } from "@/data/workouts";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();
  const workouts = await getWorkoutsForUser(session.user.id);

  return <WorkoutList workouts={workouts} />;
}
```

## Summary Checklist

Before writing any data fetching code, verify:

- [ ] The component fetching data has **no** `"use client"` directive
- [ ] Data is fetched by calling a function from `/data`, not inline in the component
- [ ] The `/data` function uses **Drizzle ORM** — no raw SQL strings
- [ ] The query includes a user ID filter so users can only access their own data
- [ ] No route handler (`app/api/`) is involved in serving this data
