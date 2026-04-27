# Authentication Standards

## Provider: Clerk

**This application uses Clerk exclusively for authentication.** Do not implement custom auth, use NextAuth, or introduce any other authentication library.

- All auth logic MUST go through Clerk's SDK — `@clerk/nextjs`.
- Do not store passwords, sessions, or tokens manually. Clerk handles all of this.
- Do not create custom login, signup, or callback pages unless Clerk provides no built-in solution.

## Getting the Current User

### In Server Components (preferred)

Use Clerk's `auth()` helper to get the current user's ID:

```ts
import { auth } from "@clerk/nextjs/server";

const { userId } = await auth();
```

- `userId` is `null` when the user is not signed in.
- Always guard against `null` before proceeding with authenticated logic.

### In Client Components

Use the `useAuth` or `useUser` hooks:

```tsx
"use client";
import { useAuth } from "@clerk/nextjs";

const { userId, isLoaded, isSignedIn } = useAuth();
```

Only use these hooks for UI state (showing/hiding elements). Never fetch data from client components — see `data-fetching.md`.

## Protecting Routes

Use Clerk's `clerkMiddleware` in `src/middleware.ts` to protect routes:

```ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
```

- All routes are private by default unless explicitly listed as public.
- Never manually redirect to `/sign-in` — use `auth.protect()` which handles redirects automatically.

## User ID in Data Helpers

Every `/data` helper function that accesses user-specific data MUST receive the `userId` from Clerk and scope queries to that user. See `data-fetching.md` for the required pattern.

```ts
import { auth } from "@clerk/nextjs/server";

const { userId } = await auth();
if (!userId) throw new Error("Unauthenticated");

const data = await getUserData(userId);
```

## Clerk Components

Use Clerk's pre-built UI components for sign-in/sign-up flows:

```tsx
import { SignIn, SignUp, UserButton } from "@clerk/nextjs";
```

- `<UserButton />` — renders the user avatar and sign-out menu.
- `<SignIn />` / `<SignUp />` — full-page auth flows; place in dedicated route files.
- Do not build custom equivalents of these components.

## Summary Checklist

Before writing any auth-related code, verify:

- [ ] Auth is handled by Clerk — no other auth library is imported
- [ ] `userId` is obtained from `auth()` (server) or `useAuth()` (client)
- [ ] `userId` is checked for `null` before use
- [ ] Routes are protected via `clerkMiddleware` in `middleware.ts`, not manual redirects
- [ ] `/data` helpers scope all queries to the authenticated `userId`
- [ ] No passwords, tokens, or sessions are managed manually
