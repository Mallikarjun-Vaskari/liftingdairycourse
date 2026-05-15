# Server Component Coding Standards

## Params and SearchParams Are Promises

In Next.js 16, `params` and `searchParams` are **Promises** and MUST be awaited before accessing their values.

This is a breaking change from earlier versions. Accessing properties directly without awaiting will result in incorrect or undefined values.

### Page Props Type

Always type `params` and `searchParams` as `Promise<...>`:

```tsx
type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ date?: string }>;
};
```

### Awaiting Params

```tsx
// WRONG — do not do this
export default async function Page({ params }: Props) {
  const { id } = params; // ← params is a Promise, this is undefined
}

// CORRECT
export default async function Page({ params }: Props) {
  const { id } = await params;
}
```

### Awaiting SearchParams

```tsx
// WRONG
export default async function Page({ searchParams }: Props) {
  const date = searchParams.date; // ← undefined, searchParams is a Promise
}

// CORRECT
export default async function Page({ searchParams }: Props) {
  const { date } = await searchParams;
}
```

### Full Example

```tsx
type Props = {
  params: Promise<{ workoutId: string }>;
  searchParams: Promise<{ date?: string }>;
};

export default async function WorkoutPage({ params, searchParams }: Props) {
  const { workoutId } = await params;
  const { date } = await searchParams;

  // ...
}
```

## Server Components Must Not Use Client APIs

Server Components run on the server only. The following are forbidden:

- `useState`, `useEffect`, `useRouter`, `useSearchParams`, and all other React hooks
- Browser APIs (`window`, `document`, `localStorage`, etc.)
- Event handlers (`onClick`, `onChange`, etc.)

If any of these are needed, extract that logic into a separate Client Component (`"use client"`) and pass data to it as props from the Server Component.

## Data Fetching in Server Components

All data fetching must happen in Server Components. See `/docs/data-fetching.md` for full rules.

```tsx
// CORRECT — fetch data in the server component, pass to client component
export default async function Page({ params }: Props) {
  const { id } = await params;
  const data = await getDataById(id);

  return <ClientComponent data={data} />;
}
```
