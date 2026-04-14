# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start development server at http://localhost:3000
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test suite is configured yet.

## Stack

- **Next.js 16.2.3** (App Router) with **React 19.2.4**
- **TypeScript** throughout
- **Tailwind CSS v4** (via `@tailwindcss/postcss`)
- **ESLint 9** with flat config (`eslint.config.mjs`) using `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`

## Architecture

This is a Next.js App Router project. All routes live under `src/app/`. The root layout (`src/app/layout.tsx`) sets up Geist fonts (via `next/font/google`) and global CSS. Pages are `page.tsx` files within route directories.

**Important**: This project uses Next.js 16, which may have breaking changes from earlier versions. Always read `node_modules/next/dist/docs/` before implementing Next.js features — the local docs reflect the actual installed version.
