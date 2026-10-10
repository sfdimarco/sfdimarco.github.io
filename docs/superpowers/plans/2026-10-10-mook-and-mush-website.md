# The MisAdventures of Mook and Mush Website Implementation Plan

> **For agentic workers:** Use `superpowers:executing-plans` to implement this plan task by task in an isolated worktree. Steps use checkbox syntax for tracking.

**Goal:** Refit Sean DiMarco’s existing Vite/React website into a show-first home for *The MisAdventures of Mook and Mush: or; Eat the Rectangle with Finley and Puff*.

**Architecture:** Preserve the existing static Vite/React deployment and reshape its routes, shared navigation, styles, assets, and content around the approved four-page information architecture. Keep episode and breakdown data in a small static source that fits the existing repository; do not add a CMS or backend without evidence that static content is insufficient. Use the show’s original art and custom canvas lettering as the visual source, while keeping readable HTML text as the semantic layer.

**Tech Stack:** Existing Vite + React application, current repository styling and deployment workflow, static episode/article content, YouTube embeds or watch links.

**Spec:** [Approved website design](../specs/2026-10-10-mook-and-mush-website.md)

## Global Constraints

- Navigation order: **Home, Episodes, Breakdowns, About**.
- Home leads with the newest cartoon and recent show posts.
- Episodes is a newest-first YouTube viewing archive.
- Breakdowns is a separate, browsable archive of show writing and production notes.
- About frames Sean as an animator and creative technologist, using the approved copy as its starting point.
- Use the show bible’s flat palette: yellow `#FFF03C`, rose `#EB6D83`, blue `#6092DB`, gray `#9FAFB4`, paper `#FFEDED`, with near-black ink sampled from approved art.
- Use `mm_uncial7.js` only for suitable display moments; preserve semantic HTML text and use a neutral system sans-serif for long-form copy.
- Keep the site readable and usable on mobile, by keyboard, with reduced motion enabled, and with assistive technology.
- Retire student-game and education/job-search showcases, the “Hire Me” CTA, and the synesthesia-number visual identity from the public site. Do not delete unrelated repositories or source history.
- Keep the existing static build and deployment architecture unless repository inspection demonstrates a concrete need to change it.
- Do not publish or deploy without a separate user approval of the concrete finished result.
- Do not add or run automated tests unless Sean requests them; use the existing build command and manual review for implementation verification.

## Review Focus

- **Old hash routes bookmarked or visited after navigation changes:** redirect `/work` and `/lab` to `/` so visitors do not land on a blank route.
- **Episode metadata with incomplete or mismatched video details:** only show episode titles, dates, summaries, artwork, and links supported by the production source or Sean’s confirmation.
- **Canvas-rendered lettering without accessible text:** all visible custom lettering must have equivalent semantic HTML text.
- **YouTube embed blocked or unavailable:** each episode must retain a direct watch link.
- **Small screens, keyboard navigation, or reduced motion:** the same content and primary actions must remain accessible without relying on hover or animation.

---

## Repository map

The specified repository has been cloned for read-only planning to `work/sfdimarco.github.io`. It is on `main` at `9aa838aeef4efa6a3f5581eb2942a53b2910c902` (`Host Downhill (Mook & Mush) for the GEOV case study`) with a clean working tree. No `AGENTS.md`, `CLAUDE.md`, or README instruction files are present.

- `src/App.jsx` uses `HashRouter`; current routes are `/` → `Landing`, `/work` → `Work`, `/lab` → `Lab`, `/about` → `About`.
- `src/components/Nav.jsx` contains WORK/LAB/ABOUT, GitHub, HIRE ME, and the dark/light toggle.
- `src/pages/Home.jsx` is an old portfolio/synesthesia home component but is not currently routed. `src/pages/Landing.jsx` is the live portal page.
- `src/pages/Work.jsx`, `src/pages/Lab.jsx`, and `src/constants/projects.js` contain the current portfolio showcases and old project descriptions.
- `src/pages/About.jsx` contains the current educator, synesthesia, and personal framing.
- `src/styles/global.css` contains current theme tokens, global cursor hiding, and responsive rules. `src/components/GamutCursor.jsx` supplies the animated synesthesia cursor.
- `src/components/YouTubeEmbed.jsx` is an existing YouTube player component. `src/constants/images.js` maps local artwork under `public/images/`.
- `index.html` contains the current site title and description. `vite.config.js` uses `base: '/'`, suitable for the user site domain.
- `.github/workflows/pages.yml` builds `dist/` and deploys it to GitHub Pages on pushes to `main` or a manual workflow dispatch.
- `package.json` exposes `npm run build`, `npm run lint`, `npm run dev`, and `npm run preview`; React Router, Framer Motion, and Vite are already installed.
- `D:\Mook\Documents\Claude\Projects\.geo\ep07\blocks\mm_uncial7.js` contains the custom glyph path renderer. It calls `mmH2`, `mmSN1`, and `mmBoil`, defined in the production project’s `squareeyes\blocks_v2\mm_core.js`; neither file is an installable font or an ES module. Preserve the glyph paths and port only these small dependencies into site-owned ES modules if the lettering treatment is implemented. Do not import from the external production path at runtime.

The checkout is for planning only. Before implementation, create or attach an isolated worktree from this repository, preserve its clean starting state, and follow any new repository instructions found there. Do not edit the live site or `.geo` production project as part of repository discovery.

### Task 1: Attach and map the website repository

**Files:**
- Read: `package.json`, `src/App.jsx`, `src/components/Nav.jsx`, `src/components/YouTubeEmbed.jsx`, `src/pages/Landing.jsx`, `src/pages/Home.jsx`, `src/pages/Work.jsx`, `src/pages/Lab.jsx`, `src/pages/About.jsx`, `src/constants/projects.js`, `src/constants/images.js`, `src/styles/global.css`, `index.html`, `vite.config.js`, `.github/workflows/pages.yml`.
- Instruction scan: no `AGENTS.md`, `CLAUDE.md`, or README instruction files were found in the checkout.
- Modify: none.

**Interfaces:**
- Produces: a verified repository root, current branch/worktree status, deployment method, exact file map, current route/content inventory, and a list of usable show assets.
- Consumes: the approved design spec linked above.

- [x] Clone the specified repository and confirm `main` is clean at commit `9aa838aeef4efa6a3f5581eb2942a53b2910c902`.
- [x] Scan for repository instructions and map the current routes, pages, assets, metadata, package scripts, and Pages workflow.
- [ ] Before implementation, create or attach an isolated worktree and recheck its instructions and starting status.
- [x] Inspect the `.geo` renderer and its helper dependencies: it is custom Canvas path lettering, not an installable font or directly importable module.
- [x] Replace the original generic repository discovery with the exact paths below and review the updated plan before implementation.

**Gate:** Implementation still requires an isolated worktree from the website repository and an approved execution approach. Do not edit the live site, the `.geo` production project, or an unrelated repository.

## Implementation tasks

Keep the remaining work inside the isolated website worktree and preserve established repository conventions.

### Task 2: Replace the portfolio frame with the show site shell

**Files:**
- Modify: `src/App.jsx`, `src/components/Nav.jsx`, `src/styles/global.css`, `index.html`.
- Create: `src/lib/haloHand.js` with the original glyph paths and only the required deterministic helper functions adapted as ES module exports; `src/components/HaloLettering.jsx` as an accessible Canvas wrapper.
- Stop importing or rendering: `src/components/GamutCursor.jsx` and the retired `/work` and `/lab` routes; redirect those old hash routes to `/`.

**Interfaces:**
- Consumes: Task 1 route and layout map; approved palette, lettering, and accessibility requirements.
- Produces: shared show identity, four-item navigation, accessible responsive shell, and page metadata using the full show title.

- [ ] Replace public navigation with **Home, Episodes, Breakdowns, About**, in that order.
- [ ] Establish the paper, ink, and flat show palette using the exact hex values in Global Constraints; remove the old number-field visual treatment.
- [ ] Use the custom Halo hand for a short display mark or selected headings only; keep the full show title and all rendered copy as semantic HTML text. Preserve the glyph paths and boil/variation behavior using the `mmH2`, `mmSN1`, and `mmBoil` helper logic from the mapped `.geo` source.
- [ ] Remove education/job-search framing and the “Hire Me” CTA from shared layout and metadata.
- [ ] Manually inspect the shared shell at mobile and desktop widths, through keyboard navigation, and with reduced motion enabled.

### Task 3: Build the Home and Episodes viewing experience

**Files:**
- Modify: `src/App.jsx`, `src/pages/Home.jsx`, `src/components/YouTubeEmbed.jsx` only if its current interface needs adaptation.
- Create: `src/pages/Episodes.jsx`, `src/content/episodes.js`.
- Add only verified episode artwork under `public/images/` and map it in `src/constants/images.js` if a shared mapping is useful.

**Interfaces:**
- Consumes: Task 2 shared shell; verified episode/video/art inventory from Task 1.
- Produces: newest-episode Home feature and newest-first YouTube Episodes archive, backed by static episode metadata.

- [ ] Define `src/content/episodes.js` as an ordered array of records with `id`, `title`, `videoId`, `publishedAt` (nullable ISO date), and `description`; keep newest-first order explicit so missing dates do not create unstable sorting.
- [ ] Add only episode entries whose video/title/art association is verified against the channel or production source.
- [ ] Feature the latest verified episode on Home with an embedded player, title, description, and an explicit direct YouTube watch link.
- [ ] Render Episodes newest first, with each entry linking to its own verified watch target and using its associated artwork where available.
- [ ] Add a clear route from Home to Episodes and Breakdowns.
- [ ] Manually verify player/watch links, mobile layout, keyboard operation, and sensible fallback when an embed cannot load.

### Task 4: Add the Breakdown blog archive and article format

**Files:**
- Modify: `src/App.jsx`, `src/pages/Home.jsx`, `src/styles/global.css`.
- Create: `src/pages/Breakdowns.jsx`, `src/pages/BreakdownPost.jsx`, `src/content/breakdowns.js`.

**Interfaces:**
- Consumes: Task 2 shared shell; Task 3 episode identifiers and verified titles.
- Produces: browsable breakdown archive and readable article pages using a static format already supported by the repository.

- [ ] Store articles as local JavaScript data in `src/content/breakdowns.js`; add no Markdown parser, CMS, or backend.
- [ ] Define each article record with `slug`, `title`, `publishedAt`, `summary`, optional `episodeId`, and `body` as an array of paragraph strings.
- [ ] Add an archive view with clear links and a related episode label where applicable.
- [ ] Render article bodies as show writing: episode explanations, story/character choices, animation decisions, and production workflow notes.
- [ ] Add recent breakdown posts to Home using the same article data, with a clear route to the full archive.
- [ ] Route `/breakdowns/:slug` to `BreakdownPost.jsx`; send an unknown slug back to `/breakdowns` with a clear not-found message.
- [ ] Manually review long-form typography, link focus, headings, related episode links, and mobile reading width.

### Task 5: Reframe About and retire the old showcase

**Files:**
- Modify: `src/pages/About.jsx`, `src/App.jsx`, `src/constants/projects.js` only if any project data remains referenced after route removal, and `index.html` if metadata needs final copy corrections.
- Remove from the app’s route/navigation surface: `/work`, `/lab`, student games, education-focused portfolio sections, and obsolete internal links.
- Do not delete unrelated repositories, source history, or standalone tools during this pass; the approved scope is to retire their old portfolio showcase from the public site.

**Interfaces:**
- Consumes: approved About copy in the design spec; Task 2 shared shell; verified professional links and credits from the existing site.
- Produces: concise professional About page and a public navigation/content surface centered on the show.

- [ ] Use the approved About draft as the baseline and preserve only useful professional links and selected credits that remain accurate.
- [ ] Replace job-seeking links and calls to action with **Watch the latest episode** and **Read the breakdowns**.
- [ ] Remove old student game and education-focused showcases from the public site and generated metadata/sitemap where relevant; preserve their files or history unless removal is clearly limited to an obsolete public route.
- [ ] Remove personal synesthesia framing and synesthesia-number visuals from the public presentation.
- [ ] Manually check About copy, links, old-route behavior, and navigation for broken references.

### Task 6: Verify the static site and prepare the reviewable result

**Files:**
- Read: `package.json`, `.github/workflows/pages.yml`, `vite.config.js`.
- Modify only if a concrete defect is found: `index.html`, `vite.config.js`, `.github/workflows/pages.yml`.
- Review: all touched site files and the final diff.

**Interfaces:**
- Consumes: completed Tasks 2–5.
- Produces: a buildable, reviewable website change with no deployment performed.

- [ ] Run the existing production build command from the repository manifest and resolve build errors caused by this change.
- [ ] Manually review Home, Episodes, Breakdowns, About, all episode/watch targets, responsive layouts, keyboard focus, and reduced-motion behavior.
- [ ] Check page titles/descriptions, internal links, asset paths, and the generated public route/sitemap behavior.
- [ ] Review the Git diff to confirm only intended website files changed and no production `.geo` sources or unrelated projects were altered.
- [ ] Present the concrete result and verification summary to Sean for review; wait for separate approval before publishing or deploying.

## Self-review notes

- Spec coverage: each page, visual tokens, custom lettering/accessibility, retired content, static maintenance model, responsive use, and deployment approval have dedicated steps.
- The source map is now based on a clean clone of the specified repository; implementation still begins in an isolated worktree and rechecks instructions/status.
- No automated tests are added or run, in accordance with the current task instructions. Build and manual review remain in scope.
- No source files, deployment settings, or website content have been changed while writing this plan.
