# Habit Tracker PWA

## Project Overview

This repository contains a mobile-first Habit Tracker Progressive Web App. The app uses Next.js App Router, React, TypeScript, Tailwind CSS, `localStorage`, Vitest, React Testing Library, and Playwright.

Implemented product behavior:

- splash boot route at `/`
- local signup, login, and logout
- protected dashboard at `/dashboard`
- user-scoped habit creation, editing, deletion, and completion toggling
- current streak calculation
- persistence across reloads with `localStorage`
- installable PWA metadata and offline-safe cached app shell

## Setup Instructions

1. Install dependencies:

```bash
npm install
```

2. Install Playwright browsers:

```bash
npx playwright install
```

## Run The App

Development:

```bash
npm run dev
```

Production build:

```bash
npm run build
```

Production server:

```bash
npm run start
```

Default local URL:

```text
http://localhost:3000
```

## Run The Tests

Unit tests with coverage:

```bash
npm run test:unit
```

Integration tests:

```bash
npm run test:integration
```

End-to-end tests:

```bash
npm run test:e2e
```

Full test pipeline:

```bash
npm run test
```

## Local Persistence Structure

The app uses `localStorage` only, as required by the technical document.

- `habit-tracker-users`: JSON array of users with `id`, `email`, `password`, and `createdAt`
- `habit-tracker-session`: `null` or the active session object with `userId` and `email`
- `habit-tracker-habits`: JSON array of habits with `id`, `userId`, `name`, `description`, `frequency`, `createdAt`, and `completions`

Data rules implemented:

- habit ids and user ids are generated uniquely
- each habit belongs to one user through `userId`
- `frequency` is fixed to `daily`
- completion dates are stored as unique `YYYY-MM-DD` strings

## PWA Implementation

PWA support is implemented with:

- `public/manifest.json` for install metadata
- `public/sw.js` for app-shell and GET-request caching
- client-side service worker registration from the root layout
- icons in `public/icons/icon-192.png` and `public/icons/icon-512.png`

Offline behavior:

- once the app shell has been loaded at least once, the service worker can serve cached shell routes offline
- the app is designed not to hard-crash when offline

## Assumptions And Trade-offs

- Authentication is intentionally local and deterministic because the stage requires a front-end-only solution with no remote auth provider.
- Passwords are stored in `localStorage` in plain text because this is a technical exercise, not a production security model.
- Dashboard protection is client-side because the session source of truth is also client-side.
- The splash screen delay is intentionally fixed to be testable and to satisfy the required redirect timing window.
- The service worker is deliberately minimal. It covers the required offline app-shell behavior, but it does not implement advanced cache invalidation, sync, or push features.
- The app prioritizes deterministic behavior and testability over broader production concerns such as server validation, encryption, and multi-device sync.

## Technical Requirements Mapping

This section maps the implementation to the technical requirements document.

- Required stack:
  Next.js App Router, React, TypeScript, Tailwind CSS, `localStorage`, Vitest, React Testing Library, and Playwright are all used in this repository.
- Route contract:
  `/`, `/login`, `/signup`, and `/dashboard` are implemented under `src/app/`.
- Splash route behavior:
  `/` renders a visible splash screen first, then redirects to `/dashboard` when a session exists or `/login` when it does not.
- Persistence contract:
  `src/lib/storage.ts` uses the required `localStorage` keys and shapes.
- Type contracts:
  `src/types/auth.ts` and `src/types/habit.ts` export the required types.
- Utility contracts:
  `src/lib/slug.ts`, `src/lib/validators.ts`, `src/lib/streaks.ts`, and `src/lib/habits.ts` export the required functions with the expected behavior.
- UI contract:
  required components, form controls, and `data-testid` hooks are implemented in `src/components/`.
- Auth behavior rules:
  duplicate signup is rejected, invalid login shows the required message, logout clears session state, and redirects are handled in the app.
- Habit behavior rules:
  create, edit, delete with confirmation, and today-only completion toggling are implemented in the dashboard UI and persistence layer.
- PWA contract:
  manifest, icons, service worker, and client registration are implemented.
- Testing contract:
  all required test files exist under `tests/unit`, `tests/integration`, and `tests/e2e` with the exact required titles.

## Required Test Files

This section lists where each required test file is located and what it verifies.

- `tests/unit/slug.test.ts`
  Verifies `getHabitSlug` normalization, spacing behavior, lowercase conversion, and removal of unsupported characters.
- `tests/unit/validators.test.ts`
  Verifies `validateHabitName` for empty input, max-length rejection, and trimmed valid output.
- `tests/unit/streaks.test.ts`
  Verifies `calculateCurrentStreak` for empty completions, missing-today behavior, consecutive streak counting, duplicate-date handling, and streak breaks.
- `tests/unit/habits.test.ts`
  Verifies `toggleHabitCompletion` for add/remove behavior, immutability, and duplicate prevention.
- `tests/integration/auth-flow.test.tsx`
  Verifies signup session creation, duplicate signup error handling, login session creation, and invalid credential handling.
- `tests/integration/habit-form.test.tsx`
  Verifies habit form validation, creation, editing while preserving immutable fields, delete confirmation, and immediate streak updates after completion toggles.
- `tests/e2e/app.spec.ts`
  Verifies splash and redirect behavior, route protection, signup and login flows, user-scoped habit loading, habit creation, completion and streak updates, reload persistence, logout, and offline cached shell behavior.

## Repository Notes

Key implementation areas:

- routing: `src/app/`
- UI components: `src/components/`
- pure logic and persistence helpers: `src/lib/`
- type contracts: `src/types/`
- tests: `tests/`
