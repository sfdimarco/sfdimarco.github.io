# The MisAdventures of Mook and Mush — Website Design

**Status:** Design draft for Sean's review  
**Date:** 2026-10-10

## Purpose

Refit `https://sfdimarco.github.io/` as the show’s home: a show-first blog where visitors can watch the latest cartoons, find the episode archive, read episode breakdowns, and learn about Sean’s work as an animator and creative technologist.

The site should feel like it belongs to *The MisAdventures of Mook and Mush: or; Eat the Rectangle with Finley and Puff*. The public profile should be professional and work-centered. The site should no longer present student games, the former education/job-search focus, or the synesthesia-number visual theme as the primary story.

## Approved site structure

Navigation, in this order:

1. **Home** — the newest cartoon, followed by recent show posts.
2. **Episodes** — an episode archive with YouTube viewing available from the site.
3. **Breakdowns** — a dedicated archive of show articles, including episode explanations and production notes.
4. **About** — a concise professional profile focused on animation, creative technology, and the show’s production workflow.

Home acts as the current blog front page. Breakdowns gives the articles a searchable, browsable home of their own. The Episodes page keeps viewing separate from process writing.

## Visual direction

The show bible and original drawings are the primary design sources. The show’s look is loose black linework, flat fills, and open light space. Generated moodboards can inform composition and atmosphere, but they do not define the drawing style.

### Palette

Use the five-color palette recorded in the show bible:

| Color | Hex |
|---|---|---|
| Yellow | `#FFF03C` |
| Rose | `#EB6D83` |
| Blue | `#6092DB` |
| Gray | `#9FAFB4` |
| Paper | `#FFEDED` |

Use a near-black ink for rules and outlines, sampled from approved show art during implementation. Keep fills flat. Do not use gradients, the old synesthesia-number field, or generated painting as the site’s main visual language.

### Lettering and reading type

Use original show title lettering where the source art provides it. Use the custom `mm_uncial7.js` glyph renderer for display moments that suit its Halo / ancient-pantheon lettering: show or episode headings, section marks, and selected decorative words. The renderer is a canvas path renderer, not an installable font file. Preserve semantic, searchable, screen-reader-readable HTML text alongside any canvas-rendered lettering. Keep long-form copy in a neutral system sans-serif stack for legibility.

### Page composition

Use an editorial layout with left-aligned reading columns, generous paper-colored space, flat color blocks, and confident black outlines. Let episode art and the custom lettering carry personality. Keep navigation and article reading clear and professional. Use hand-drawn rules or framing only where they help connect the site to the source art.

## Page content

### Home

- Lead with the latest cartoon, using an embedded YouTube player so it can be watched on the page.
- Show the title and a short episode description beside or directly under the player.
- Follow with recent show posts and a clear route to the Episodes and Breakdowns pages.
- Use the full show title in the main feature; a compact show mark can use the original title artwork.

### Episodes

- List episodes in a clear newest-first archive.
- Provide a YouTube player or direct YouTube watch link for each episode.
- Use episode artwork from the show project; keep titles and thumbnails associated with the correct video.

### Breakdowns

- Present article entries as posts about the show, not as generic portfolio case studies.
- Support episode explanations, story and character decisions, animation choices, and production-workflow notes.
- Give each post a title, related episode when applicable, publish date, short summary, and article body.

### About

Use this approved draft as the starting copy:

> I’m Sean “Mook” DiMarco, an animator and creative technologist making *The MisAdventures of Mook and Mush: or; Eat the Rectangle with Finley and Puff*.
>
> I use Claude Opus 5.5 with a custom set of tools and skills to develop and produce the show, from story and visual direction through animation, sound, and editing. I build the workflow as I make the episodes, bringing original cartoon-making and creative technology together in one independent production practice.

The page can be refined for tone and accuracy during implementation. Keep useful professional links and selected credits. Replace the job-seeking CTA with **Watch the latest episode** and **Read the breakdowns**.

## Content and maintenance

Keep the site straightforward to update as episodes and articles are published. Use a small, explicit content source for episode metadata and breakdown posts. Choose its exact format after inspecting the website repository; do not add a CMS or backend before confirming a need.

The live YouTube channel currently presents itself as an archive, while new Mook and Mush episodes are being posted. The website should lead with the show and link viewers to the channel. This design does not change the channel itself.

## Retire from the public site

Remove student games and education-focused portfolio material from the main navigation and showcase. Remove the old “Hire me” and job-search copy. Remove the synesthesia-number system and personal synesthesia framing from the site’s core visual identity and About copy. This scope concerns the website’s public presentation; it does not request deleting other project repositories or source history.

## Success criteria

- A first-time visitor can identify the show and start watching its newest cartoon from Home.
- Visitors can find older episodes and watch them through YouTube.
- Breakdowns are easy to browse and read as an ongoing show blog.
- About presents Sean professionally as an animator and creative technologist, with the approved copy as its basis.
- The site’s colors, linework, and title display clearly trace to the show’s own art and custom lettering.
- Episode and post updates remain simple to maintain in the existing website stack.
- The site remains readable and usable on mobile, by keyboard, with reduced motion enabled, and with assistive technology.

## Implementation constraints to resolve from the website repository

The website source is not present in the current workspace. The local `.geo` directory is the animation and production project, not the website checkout. Before planning implementation, inspect the existing Vite/React repository and determine:

- how its current routes, styles, assets, and deployment workflow are organized;
- whether the custom canvas renderer and its dependencies can be integrated cleanly;
- which original show assets are suitable for the public site;
- whether episodes and articles can be managed with the existing static build;
- how existing public content should be removed or retired without altering unrelated repositories.

No code, deployment configuration, or external site content has been changed as part of this design draft.
