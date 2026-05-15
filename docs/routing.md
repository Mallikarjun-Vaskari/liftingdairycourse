# Routing Standards

## Route Structure

**All application routes must live under `/dashboard`.**

- The root `/` route may redirect to `/dashboard` or to a login page, but no application functionality is served at the root.
- Every page that displays user data or application features must be nested under `src/app/dashboard/`.

```
src/app/
├── page.tsx              # Root — redirect only (to /dashboard or /login)
├── login/
│   └── page.tsx          # Public — login page
└── dashboard/
    ├── page.tsx          # Protected — main dashboard
    └── [feature]/
        └── page.tsx      # Protected — all sub-pages
```

## Route Protection

**All `/dashboard` routes are protected and require an authenticated user.**

Route protection MUST be implemented via **Next.js Middleware** (`src/middleware.ts`). Do NOT:

- Check authentication inside individual page components
- Use a layout component to redirect unauthenticated users
- Use a higher-order component or custom hook to enforce auth

The middleware is the single enforcement point. If a user is not authenticated and attempts to access any `/dashboard` route, the middleware must redirect them to `/login`.

### Middleware Implementation

```ts
// src/middleware.ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

> The `matcher` must cover `/dashboard` and all sub-paths. Adjust the pattern if additional protected paths are added.

## Summary Checklist

Before adding a new route, verify:

- [ ] The route is nested under `src/app/dashboard/` (if it requires authentication)
- [ ] No auth check has been added inside the page component — middleware handles it
- [ ] The middleware `matcher` covers the new route path
- [ ] Public routes (login, landing) are outside `/dashboard` and are NOT listed in the matcher
