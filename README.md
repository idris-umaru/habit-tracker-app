# Habit Tracker PWA

## Project Overview

This project is a mobile-first Habit Tracker Progressive Web App built with Next.js App Router, React, TypeScript, and Tailwind CSS. It supports local signup and login, habit creation and editing, delete confirmation, daily completion toggling, visible streaks, session persistence, and basic offline-safe PWA behavior.

## Setup Instructions

1. Install dependencies with `npm install`.
2. Install Playwright browsers with `npx playwright install`.

## Run Instructions

- Development server: `npm run dev`
- Production build: `npm run build`
- Production server: `npm run start`

## Test Instructions

- Unit tests with coverage: `npm run test:unit`
- Integration tests: `npm run test:integration`
- End-to-end tests: `npm run test:e2e`
- Full test pipeline: `npm run test`

## Local Persistence Structure

The app uses `localStorage` only.

- `habit-tracker-users`: JSON array of users with `id`, `email`, `password`, and `createdAt`
- `habit-tracker-session`: `null` or the active session object with `userId` and `email`
- `habit-tracker-habits`: JSON array of habits with `id`, `userId`, `name`, `description`, `frequency`, `createdAt`, and `completions`

Each habit belongs to one user through `userId`, and `completions` stores unique `YYYY-MM-DD` strings.

## PWA Support

PWA support is implemented with:

- `public/manifest.json` for install metadata
- `public/sw.js` for client-side caching of the app shell and fetched GET requests
- client-side service worker registration from the root layout
- icon assets in `public/icons/`

After the app has been loaded once, the cached shell can be served offline without a hard crash.

## Trade-offs And Limitations

- Authentication is intentionally local and not secure for production use because the stage requires deterministic front-end-only persistence.
- Dashboard protection happens on the client because the session source of truth is `localStorage`.
- The service worker is intentionally minimal and focused on app-shell resilience rather than advanced background sync or update flows.

## Test File Mapping

- `tests/unit/slug.test.ts`: verifies slug generation behavior for habit card identifiers
- `tests/unit/validators.test.ts`: verifies habit name validation and normalization
- `tests/unit/streaks.test.ts`: verifies current streak calculation rules
- `tests/unit/habits.test.ts`: verifies habit completion toggling and immutability
- `tests/integration/auth-flow.test.tsx`: verifies signup and login flows plus local session behavior
- `tests/integration/habit-form.test.tsx`: verifies create, edit, delete, completion toggle, and streak UI behavior
- `tests/e2e/app.spec.ts`: verifies route protection, redirects, auth flows, persistence, logout, and offline app-shell behavior
