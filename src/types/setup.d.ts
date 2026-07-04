/**
 * Ensures React and JSX types are available project-wide.
 * Prevents "JSX element implicitly has type 'any'" errors.
 * Next.js creates next-env.d.ts on first run; this file provides fallback
 * when next-env.d.ts does not exist yet (e.g. fresh clone).
 */
/// <reference types="react" />
/// <reference types="react-dom" />
