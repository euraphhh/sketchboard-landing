# Sketchboard landing

Landing page for [Sketchboard](https://github.com/kaikynetto/sketchboard), the lightweight open source whiteboard. Its job is to show the app and get people to the right installer.

Built with [Astro](https://astro.build), React islands and [Motion](https://motion.dev). Deployed on Vercel.

## Run locally

Requires Node.js 22 or newer.

```bash
npm install
npm run dev       # http://localhost:4321
npm run check     # type check
npm run build     # static build in dist/
```

## How downloads work

At build time, `src/lib/release.ts` reads the latest release of `kaikynetto/sketchboard` from the GitHub API and renders the installer links into the static page. If the API is unavailable, links fall back to the releases page.

To keep the page current:

1. In Vercel, create a Deploy Hook for `main` and save its URL as the `VERCEL_DEPLOY_HOOK_URL` secret in the app repo. The app's release workflow calls it after publishing, so every release rebuilds this site.
2. Optionally set a read-only `GITHUB_TOKEN` environment variable in Vercel to avoid GitHub API rate limits during builds.

## Project layout

| Path | Purpose |
|---|---|
| `src/pages/index.astro` | The page: composes the sections |
| `src/components/*.astro` | Static sections (no JavaScript shipped) |
| `src/components/*.tsx` | Interactive islands animated with Motion |
| `src/lib/` | Release data and OS detection |
| `src/styles/global.css` | Design tokens and all styles |
| `public/` | Icon and static assets |

## License

[MIT](LICENSE) © Kaiky Netto and Raphael Xavier
