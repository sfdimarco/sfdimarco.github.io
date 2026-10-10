# Content and artwork sources

Initial redesign prepared 2026-10-10. The Home and Breakdowns copy was rewritten the same day from the production record (the show bible `.geo/SHOW-BIBLE/`, the episode reports, the Downhill and Square Eyes eyes reports, the walk-system doc). Every number is as measured at the time.

- Episode records: public YouTube channel feed `https://www.youtube.com/feeds/videos.xml?channel_id=UCDkZnJkP8d8GfOZAx9do2Yg`, retrieved 2026-10-10. Titles are shortened only to remove the repeated series name. Dates are YouTube upload dates.
- Channel branding: [The MisAdventures of Mook and Mush — @MookandMush](https://www.youtube.com/@MookandMush), refreshed 2026-10-10. The handle page identifies the same channel ID as the feed above; all five listed uploads remain the same.
- “A world drawn by hand”: `.geo/SHOW-BIBLE/04-LOOK.md`, `01-THE-SHOW.md`, and `.geo/ep07/blocks/mm_uncial7.js`.
- “Square Eyes: seeing in 16 × 16”: channel description and `.geo/SHOW-BIBLE/06-EPISODES.md` Square Eyes section.
- “The Groove Machine: two worlds, one game”: `.geo/SHOW-BIBLE/04-LOOK.md` Episode 3 camera and colour rules and `06-EPISODES.md`.
- About’s two lead paragraphs: Sean-approved copy in the design specification. Additional show context: `.geo/SHOW-BIBLE/01-THE-SHOW.md`.

Original assets copied unchanged from `.geo/SHOW-BIBLE/art/`:

| Website asset | Original source |
|---|---|
| `public/images/show/title-2020.jpg` | `title/2020-title-card-colour.jpg` |
| `public/images/show/mook-mush-pod.jpg` | `animatic/2021-mook-mush-pod.jpg` |
| `public/images/show/square-eyes-cast.jpg` | `films/square-eyes-cast-plate.jpg` |
| `public/images/show/groove-machine.jpg` | `cast/ep03-episode.jpg` |

The public site does not expose local production paths, private reports, unpublished episode pitches, or workflow session links in its UI. The source lettering comment retains its original authorship context.

Added 2026-10-10 (copy rewrite):

| Website asset | Original source |
|---|---|
| `public/images/show/ep-*.jpg` | `.geo/youtube/thumbnails/MM-thumb-EP*.jpg` |
| `public/images/show/sheet-*.jpg` | `.geo/youtube/_frames/sheet_*.jpg` (resized to 1800 px) |
| `public/images/show/mush-bounce-study.jpg` | `SHOW-BIBLE/art/cast/ep03-motion-mush-bounce.jpg` |
| `public/images/show/recolour-2020.jpg` | `SHOW-BIBLE/art/look/recolour-ab-2020.jpg` |
| `public/images/show/cast-lineup-2020.jpg` | `SHOW-BIBLE/art/cast/2020-cast-lineup-colour.jpg` |
| `public/images/show/mook-turnaround-2020.jpg` | `SHOW-BIBLE/art/cast/2020-mook-turnaround-palette.jpg` |
| `public/images/show/cast-lineup-ep3.jpg` | `SHOW-BIBLE/art/cast/ep03-cast-lineup-after-fixes.jpg` |
| `public/images/show/geov-studio.jpg` | a screenshot of `/geov/` |
| `public/mush/rig.js` | `.geo/ep03/blocks/` mm_core.js, mm_palette2020.js, mm_cast.js, mm_cast2020.js, mm_motion.js, concatenated unedited (plus a one-line `MM_SCN` stub) |

The release step for future episodes is `docs/release-checklist.md`.
