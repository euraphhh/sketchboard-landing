# AGENTS.md

Landing page for Sketchboard (app repo: `kaikynetto/sketchboard`). One page whose job is to show the app and send people to the right installer. Astro + React islands + Motion, deployed on Vercel.

## Commands

```bash
npm install
npm run dev       # dev server on http://localhost:4321
npm run check     # astro check (types); CI runs it
npm run build     # static build in dist/; CI runs it
```

When starting the dev server as an agent, use background mode: `npx astro dev --background`, then `astro dev status`, `astro dev logs`, `astro dev stop`.

## Layout

| Path | Purpose |
|---|---|
| `src/pages/index.astro` | Composes the page, fetches release data at build time |
| `src/layouts/Base.astro` | `<head>`, fonts, meta tags, scroll reveal script |
| `src/components/*.astro` | Static sections: Nav, Features, Footer, AppTile |
| `src/components/*.tsx` | Islands: Hero, LiveDemo, DrawIcon, Downloads, ScrollProgress |
| `src/lib/release.ts` | Latest app release from the GitHub API (with fallback) |
| `src/lib/platform.ts` | OS detection and primary download link |
| `src/styles/global.css` | Tokens and all styles |

## Rules

- **Static first.** A section is `.astro` unless it needs interaction or Motion. Hydrate islands with `client:visible` unless they are above the fold (`client:load`).
- **Identity.** Dark only, monochrome, board grid, one white hand-drawn stroke. Colors come from the tokens in `global.css`, which mirror the app. No accent color, gradients or heavy shadows. Read the `landing-design` skill before visual changes.
- **Motion.** Use `motion/react` in islands; static sections use `data-reveal` (CSS + IntersectionObserver in `Base.astro`). Every animation must respect `prefers-reduced-motion` (`useReducedMotion`, `initial={reduce ? false : ...}`) and the page must read correctly with no JavaScript.
- **Copy.** pt-BR, short and concrete. No claims the app can't back (no size or speed numbers unless measured).
- **Downloads.** Never hard-code installer URLs or versions. Use `getLatestRelease()`; asset names follow `Sketchboard-<version>-<os>-<arch>.<ext>` from the app repo.
- **Dependencies.** Keep them minimal. No UI kits or CSS frameworks.
- **Git.** Branch from `main`, focused PRs, short imperative commits. Do not push or deploy without the maintainer's confirmation.
