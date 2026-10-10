# Release checklist: the website step

Part of every episode's release. Do it the day the episode goes up on YouTube.

- [ ] **Episodes:** add the episode to the top of `src/content/episodes.js` (YouTube title, video id, upload date, a one- or two-sentence description with no spoilers past the first act).
- [ ] **Thumbnail:** copy the YouTube thumbnail to `public/images/show/ep-<id>.jpg` (1280 × 720).
- [ ] **Frames:** copy the episode's frame sheet to `public/images/show/sheet-<id>.jpg` (resize to 1800 px wide).
- [ ] **Breakdown:** add one breakdown to the top of `src/content/breakdowns.js` with `episodeId` set. Write it from the episode report and the show bible, not from memory: what was new in the world, the one idea the episode dug into, what was built for it, and the numbers as measured (length, shots, lines of dialogue).
- [ ] **Tool spotlight:** if the episode built a new tool worth showing (a walk system, a seat, a crowd), add or update a Tools breakdown.
- [ ] **Unreleased episodes:** no breakdown, picture or plot for an episode that is not public yet.
- [ ] **No private paths:** nothing from the production folders' paths, reports' file names, or session links goes on the site.
- [ ] **Negative phrasing:** read the new copy once for negative phrasing and send it to Mook to approve before it goes live.
- [ ] **Links:** the GeoV Studio tab and the "Made in GeoV Studio" button still open `/geov/`.
- [ ] **Build and check:** `npm run build`, open `/`, `/#/episodes`, `/#/breakdowns` and the new breakdown, at desktop and phone width.
