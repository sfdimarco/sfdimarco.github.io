# Mook and Mush website

The show’s home at https://sfdimarco.github.io/: Home, Episodes, Breakdowns, and About. Built with the existing React + Vite + HashRouter stack.

## Work locally

Use a Node version supported by the locked Vite version (Node 20.19+ or 22.12+).

```sh
npm ci
npm run dev
npm run build
npm run preview
```

The production output is `dist/`. GitHub Pages builds and deploys **pushes to `main`**, through `.github/workflows/pages.yml`. Work on a feature branch until the result is approved for publication.

## Add a cartoon

Edit `src/content/episodes.js`. Add a record at the top of the array with a unique `id`, the YouTube `videoId`, `title`, `publishedAt` in `YYYY-MM-DD` form, and a short `description`. Array order controls the archive and Home’s latest episode. Use the upload’s actual title and date; production episode numbering may differ. The player uses the matching YouTube thumbnail. Every player has a separate direct watch link.

## Add a breakdown

Edit `src/content/breakdowns.js`. Add a record at the top with `slug`, `title`, `publishedAt`, `category`, `summary`, `image`, `imageAlt`, and `body` (an array of paragraph strings). Set `episodeId` to an episode’s `id` to add a related watch link. Put local artwork in `public/images/show/` and reference it as `/images/show/filename.jpg`.

Articles appear in the archive, its search, and the recent posts on Home. Routes use `/#/breakdowns/your-slug`, so GitHub Pages can load shared links directly.

## Visual sources

The flat five-colour palette and original artwork come from the show bible. `src/lib/haloHand.js` preserves the custom `mm_uncial7.js` glyph paths with only their required deterministic helpers from `mm_core.js`. `HaloLettering.jsx` keeps equivalent HTML text, provides a text fallback, and freezes the boil for reduced motion. There are no external font dependencies.

Source references for the initial article drafts and artwork are recorded in [docs/content-sources.md](docs/content-sources.md). Review these drafts with Sean before publishing.

Legacy portfolio pages and standalone tools remain in Git history/source, but the new application’s navigation and routes centre on the show. The old `/work` and `/lab` hash routes redirect to Home.
