// The breakdowns: how the show is actually made, for animators and creative technologists.
// Every fact here comes from the production record (the show bible, the episode reports and
// the measurements made at the time). Newest first. A body block is a paragraph (a string),
// { h } a sub-heading, { list } a bulleted list, or { img, alt } a picture.
// ✅ RELEASE STEP: when an episode goes up on YouTube, add it to episodes.js AND add its
// breakdown here, at the top, with episodeId set. See docs/release-checklist.md.

export const breakdowns = [
  {
    slug: "what-is-geov-studio", title: "What’s GeoV Studio?", publishedAt: "2026-10-10", category: "Tools",
    summary: "The browser animation studio every episode is built in, assembled in and exported from. It started as a tool for kids at summer camp.",
    image: "/images/show/geov-studio.jpg", imageAlt: "GeoV Studio with a new movie open: the studio buttons and clip library, the preview, and the timeline",
    links: [{ href: "/geov/", label: "Open GeoV Studio" }],
    body: [
      "GeoV Studio is a video editor and animation studio that runs in a web browser. There is nothing to install and no server behind it. Mook built it for the kids in his summer film program, who make their movies on iPads and Chromebooks. Today it is also the studio where every Mook and Mush episode is put together.",
      { h: "Everything is a clip" },
      "The idea at the centre of GeoV is simple: everything is a clip. A video is a clip. A sound is a clip. A drawing you made frame by frame is a clip. A piece of code that draws pictures is a clip too. They all sit on one timeline, where sideways means when and stacked means at the same time.",
      { list: [
        "Flipbook: frame-by-frame drawing with onion skin and Apple Pencil pressure.",
        "Vector: shapes and motion with keyframes and easing curves.",
        "Stop motion: a live camera with a ghost of the last frame.",
        "Code clips: little programs that draw the picture, with every number turned into a slider.",
        "3D stage and rig: characters and cards in a real perspective space, with a camera you can move.",
        "Sound deck: record, play notes, and bounce the result to an audio clip.",
      ] },
      "A strip of six chips sits in the same place in every studio, so you can jump from any tool to any other without going back to the start.",
      { h: "How the show uses it" },
      "Every shot in an episode is a code clip. The characters are drawn by code from Mook’s own designs, so a shot is a short program that says where everyone stands, where the camera is, and what each character does at each moment. The voices, the music and the sound effects go in as audio clips under the picture.",
      "The finished episode is a GeoV project. Mook can open it, scrub it, change a shot and see the change. The final film is exported by GeoV’s own exporter, the same one the kids use.",
      { img: "/images/show/mush-bounce-study.jpg", alt: "A motion study for Mush: frames from Mook’s 2021 animatic above the bounce-walk and the big hop as GeoV draws them" },
      "The Mush on the home page is a small piece of that. It is the show’s own drawing code and the show’s own motion code, running live in your browser.",
      { h: "Why build a studio?" },
      "Making the show inside the tool keeps making the tool better. When an episode needs something new, like a walk that never slides or a mouth that moves with a recorded voice, it gets built into GeoV. The next episode, and the next kid, gets it for free.",
    ]
  },
  {
    slug: "how-an-episode-gets-made", title: "From pitch to YouTube: how an episode gets made", publishedAt: "2026-10-10", category: "Process",
    summary: "One producer, an AI production team, and a pipeline that gets a little better with every episode.",
    image: "/images/show/sheet-pool-battle.jpg", imageAlt: "Frames from Mowing Day, Part 2: The Pool Battle",
    body: [
      "Mook and Mush is made by a very small crew. Sean “Mook” DiMarco is the producer. He created the world, drew the characters, wrote the book the show comes from, and gives the notes. Claude, an AI model made by Anthropic, works as the production team: writing, staging, animating, sound and editing, with a set of custom tools and skills built along the way.",
      "Since episode four, Mook’s direction has been: it’s your show. Claude pitches, writes and directs. Mook picks the pitch, approves each stage and watches every cut. Here is the order an episode is made in.",
      { h: "1 · The pitch and the script" },
      "Each episode adds one new character or place to the world and digs into one idea. Claude writes a few pitches; Mook picks one. Then comes the script, with every line written for the voice that will read it.",
      { h: "2 · Engineer it before it is animated" },
      "Before any shot exists, every physical moment in the script gets flagged: sitting, climbing, carrying, opening a door, going up stairs. Each one gets a real, built prop, like a chair with a seat height and a back. Each character and prop is checked turning all the way round. Then every scene gets a top-down staging map, and the cameras are picked on the map before the staging is locked.",
      "This step exists because of Mook’s notes. Problems he kept spotting, like a foot that slid or a character sitting on nothing, became permanent steps in the pipeline instead of fixes for one episode.",
      { h: "3 · Lock the sound first" },
      "The voices are cast and recorded in Google Vids. Each character keeps the same voice from episode to episode. The music is made with Lyria: Claude writes the prompts and Mook makes the songs. Voices, music and sound effects are mixed into an audio lock before any animation starts. There’s more on why in “Sound first, then picture”.",
      { h: "4 · Animate to the sound" },
      "Every shot is a code clip in GeoV. Mouths move on the recorded syllables. Gestures land on the words. Walks are planned so every foot is planted on the ground. Before export, an audit checks every shot: no breaks across the 180-degree line, nobody covering the speaker, no feet through the floor.",
      { h: "5 · Assemble and export in GeoV" },
      "The whole episode is built as one GeoV Studio project: every shot, every line of dialogue and every music cue as a clip. GeoV’s own exporter renders and mixes it.",
      { h: "6 · Measure, then notes" },
      "The finished file is measured: its length to the frame, its loudness, whether every quiet second still has music under it, and whether the sound is in sync. Then Mook watches it and gives notes.",
      "Anything Claude invented that isn’t in Mook’s drawings or writing is listed for him as keep or cut. The characters are his designs. The show bible records every decision, and the open questions stay open on purpose, as ideas for later episodes.",
    ]
  },
  {
    slug: "sound-first-then-picture", title: "Sound first, then picture", publishedAt: "2026-10-10", category: "Process",
    summary: "The one rule that changed the show the most: record the voices and the music before anything moves.",
    image: "/images/show/sheet-groove-machine.jpg", imageAlt: "Frames from The Groove Machine",
    body: [
      "The Groove Machine was the episode where the workflow settled. After it, Mook made it a rule: lock the voice-over and the score first, because the animation is better when there is sound to work from.",
      { h: "The order" },
      { list: [
        "Voices: each role cast by ear in Google Vids, every line recorded and cut on its word times.",
        "Score: songs made with Lyria from prompts Claude writes, then placed on the picture’s big moments.",
        "Sound effects: their own track, under the voices.",
        "The audio lock: one mix of all three, checked so every quiet second still has music under it.",
        "Animation, made to the lock: mouths on the real syllables, gestures on the words.",
        "Assembly and export inside GeoV Studio, then measurement of the finished film.",
      ] },
      { h: "Why it works" },
      "Animators have always worked to a recorded track. Timing a gesture to a real word is easier than guessing how long a word will be. In a code-built shot, the syllable times become data. A mouth opens on the actual vowel, and a hand lands on the actual beat.",
      "The order also made the show cheaper and calmer to make. The picture is built once, to a timeline that won’t change under it.",
      { h: "Measure what you hear" },
      "A file can look finished and still sound wrong. One early cut of The Groove Machine went out with the music missing: the file was written in the wrong format and read as near silence, and nobody had measured it. Since then, every episode’s finished file is measured, not just watched. Loudness, the music under every quiet second, and sync against the audio lock all get checked before Mook sees it.",
    ]
  },
  {
    slug: "drawn-by-mook-built-in-geov", title: "Drawn by Mook, built in GeoV", publishedAt: "2026-10-10", category: "Visual development",
    summary: "How the 2020 drawings became characters that can turn, walk and act, without losing what made them his.",
    image: "/images/show/cast-lineup-2020.jpg", imageAlt: "Mook’s 2020 colour lineup of the cast",
    body: [
      "The cast of Mook and Mush comes from Mook’s own drawings: a 2020 colour lineup, character cards, turnarounds, and a 2021 animatic. Every rig in the show is built from those drawings, and they stay the reference.",
      { h: "A sphere with a line down the middle" },
      "Mook designed his characters to turn. In his words, the head is a sphere with a line down the middle, to make it easy to spin. The seam between the red half and the blue half shows which way the character is facing. As Mook turns away from the camera, the colours swap sides. The rigs are built on that rule, so a turn is just the seam moving round the sphere.",
      { img: "/images/show/mook-turnaround-2020.jpg", alt: "Mook’s 2020 turnaround of his character, with the palette" },
      { h: "The 2020 palette" },
      "The show uses flat fills, no shading and a black outline around everything. Mook’s 2020 palette card has five colours. The first films used a stronger red and a teal; from The Groove Machine on, the cast was recoloured to the 2020 palette and the 2020 details came back. Mush got his long robe, and Mook got his grey legs and black eye rims.",
      { img: "/images/show/recolour-2020.jpg", alt: "The films’ colours, the 2020 palette on the same rigs, and the 2020 drawing" },
      { h: "Turnarounds are instruments" },
      "A quick sketch is for feel. A turnaround is for measuring. The rigs are measured against Mook’s turnarounds, and a new character is judged on a plate beside his drawing, at the same height, before it goes into an episode.",
      { h: "Inventions get flagged" },
      "When a shot needs something the drawings don’t show, like a prop, a detail or a whole new character, it gets built, then listed for Mook as keep or cut. New characters, like Tortimer the tortoise, start from his description and go through his approval before they appear.",
      { img: "/images/show/cast-lineup-ep3.jpg", alt: "The cast as built in GeoV for The Groove Machine" },
    ]
  },
  {
    slug: "giving-the-pipeline-eyes", title: "Giving the pipeline eyes", publishedAt: "2026-10-10", category: "Tools",
    summary: "A fast vision model that looks at frames as a 16 × 16 grid of colour, and what it can and can’t see.",
    image: "/images/show/sheet-square-eyes.jpg", imageAlt: "Frames from Square Eyes",
    body: [
      "Animation made by code has a blind spot: the code knows where everything is, but not how the picture reads. So the pipeline got a pair of eyes. A frame is turned into a quadtree, the quadtree is flattened into a 16 × 16 grid of colours, and a fast vision model answers questions about the grid. Is the character on the left? Is this scene warmer than that one? Are these two pictures the same shot?",
      "Mook calls it visual intuition: a quick, wordless read of a picture, like the first glance a person gives a frame.",
      { h: "Where it came from" },
      "Square Eyes was written to test it. TV Gurl sees the world in a 16 × 16 grid because the eyes do. She answers one question every five minutes and seven seconds because, at the time, that was the real wait between answers. That wait was later fixed by switching services. A whole-film glance now takes seconds and costs about a cent.",
      { h: "What it’s good at" },
      { list: [
        "Placement: where something is, asked as yes or no about a named spot.",
        "Together or apart, and whether two pictures are alike.",
        "Warm against cold, and night against day.",
        "Saying what isn’t there: no false faces in a fence.",
      ] },
      "In Downhill it measured the colour script across the whole film and changed the grade. Two moments that didn’t land, the grey of the Wall and the warmth after letting go, were swept, fixed and checked again.",
      { h: "What it can’t see" },
      "Sixteen squares across is coarse. It can’t see small things: the gumballs flying off-screen in Downhill’s slow-motion shot were caught by looking at the frames, not by the eyes. It can’t tell morning from noon, even with a mist. Short events fall between its samples. And atmosphere is still judged by people: Square Eyes kept its morning mist because Mook liked it, while the eyes only checked that nothing else had moved.",
      "So the eyes check, and people judge. Every question gets a control, like a mirrored or scrambled picture, so a confident answer can be trusted.",
    ]
  },
  {
    slug: "feet-on-the-ground", title: "Feet on the ground: the walk system", publishedAt: "2026-10-10", category: "Tools",
    summary: "Why the characters used to skate, and the peg-bar idea that fixed it.",
    image: "/images/show/sheet-mowing-day.jpg", imageAlt: "Frames from Mowing Day",
    body: [
      "After the first episodes, Mook’s note was that the walks were still skating. Weight and contact with the ground had to be physical. For Mowing Day, the walk was rebuilt from the ground up.",
      { h: "The peg bar, in the world" },
      { list: [
        "Every footfall is a fixed point on the ground. A planted foot stays put until it lifts.",
        "The swinging foot travels from where it lifted to where it will land.",
        "The hips drop when the legs are spread, because legs are only so long. That is where the weight shows.",
        "Nothing slides, from any camera angle.",
      ] },
      { h: "Real reference" },
      "The numbers come from real kids walking: about 130 to 140 steps a minute, a step a little under half their height, a foot on the ground about 60% of the time. Cartoon walks run slower than life. A long, fast step on short legs raises the step rate instead of stretching the legs.",
      "Mush and TV Gurl don’t walk. Their legs are too short to step, so they hop. They sit still while their feet are down and only move in the air. Each hop’s height comes from real flight time, so nothing floats.",
      { h: "Checked, not eyeballed" },
      "A route is planned with one steady pace, rounded corners and smooth starts and stops. An audit then checks every body against every other body and the furniture, and reports any overlap deeper than three centimetres. Later episodes added stairs, chairs and draw-order checks, so characters step on treads, sit on real seats and stop disappearing behind the wrong thing.",
    ]
  },
  {
    slug: "pool-battle", title: "The Pool Battle: teaching a card game on screen", publishedAt: "2026-10-10", category: "Episode breakdown", episodeId: "pool-battle",
    summary: "Fianna, the Fhat, the Dogwoods, and a one-on-one game built so you can follow every move.",
    image: "/images/show/ep-pool-battle.jpg", imageAlt: "Mowing Day, Part 2: The Pool Battle",
    body: [
      "Mook’s note on Mowing Day was that the card game was hard to follow. So the next episode was built around fixing that. The day after Mowing Day, the gang escapes the mowers to the Dogwoods and finds Fianna already in their pool. She won’t play cards; her hat will. It’s Finley against the Fhat, one on one, for the pool.",
      { h: "Making the game readable" },
      { list: [
        "One on one, so there are only two sides to track.",
        "A whole part of the episode teaches the rules: one picture per rule, with the words on screen.",
        "A ring counter stays on screen for the whole game.",
        "Each player has four slots on the table, and the fighters float over their slots in light.",
      ] },
      "Holograms are split into what sits on the table and what floats in the air, so the light never paints over the people around it.",
      { h: "New in the world" },
      "Fianna is split red and blue like Finley. Mook decided that Finley and her sister Fianna are the only others of Mook’s kind. The Dogwoods street goes from lived-in to wild, house by house, built so any shot can ask how wild the street is at that spot.",
      { h: "As made" },
      "11 minutes, 150 shots and 105 lines of dialogue, assembled and exported in GeoV Studio. It is the first episode with its own sound-effects track: plops, card snaps, the gate bang, crickets. Sync against the audio lock measured 0.0 milliseconds at eight checkpoints.",
      { img: "/images/show/sheet-pool-battle.jpg", alt: "Frames from across the episode" },
    ]
  },
  {
    slug: "mowing-day", title: "Mowing Day: the first episode in the captain’s chair", publishedAt: "2026-10-10", category: "Episode breakdown", episodeId: "mowing-day",
    summary: "Tortimer arrives, Mount Clipping looms, and the production team takes over the directing.",
    image: "/images/show/ep-mowing-day.jpg", imageAlt: "Mowing Day",
    body: [
      "Mowing Day was the first episode Claude wrote and directed on its own pitch. Mook’s brief for the season: build out Dwarf and Mowersville, keep it grounded, establish the card game’s rules and the main characters’ friendships, and introduce Tortimer.",
      "The story: it’s Mowing Day, the gang’s chore is Mount Clipping, Mook is allergic to cut grass, and they bet a card game against Tortimer to get out of it.",
      { h: "Tortimer" },
      "Mook described Tortimer as a two-legged Galápagos saddleback tortoise, drawn in the same style as the rest of the show. Claude designed him from that sentence, and Mook approved the design. He runs the card shop, and the shop counter was lowered 15 centimetres so his shell clears it.",
      { h: "The walk system" },
      "This episode is where the characters stopped skating. Every footfall is pinned to the ground, steps are capped by leg length, and Mush hops instead of walking. The full story is in “Feet on the ground”.",
      { h: "As made" },
      "11 minutes, 180 shots and 87 lines of dialogue, with the sound locked first and the film assembled and exported in GeoV Studio. Mook’s verdict: the story was more cohesive and the pacing worked. His notes, that the layering still clipped and the game was hard to follow, became the fix list for the next episode.",
      { img: "/images/show/sheet-mowing-day.jpg", alt: "Frames from across the episode" },
    ]
  },
  {
    slug: "the-groove-machine", title: "The Groove Machine: from the book to the screen", publishedAt: "2026-10-10", category: "Episode breakdown", episodeId: "groove-machine",
    summary: "The first three chapters of Mook’s book, two worlds with their own camera rules, and the episode that set the workflow.",
    image: "/images/show/ep-groove-machine.jpg", imageAlt: "The Groove Machine",
    body: [
      "The Groove Machine adapts chapters one to three of Mook’s book. It is 14 scenes and the longest episode so far, with more than a hundred of his lines kept word for word. Mook’s direction for the visual gags was to push them like Bugs Bunny, as pictures, not narration, with squash and stretch and noodle arms and legs.",
      { h: "Camera rules" },
      { list: [
        "Mook looks away; Finley looks at you. The one time they look at each other is saved for late in the story.",
        "Mook stays on the left and Finley on the right, all episode.",
        "The camera sits where the looker’s eyes are: Barbarossa is seen from kid height, the kids from his.",
        "Two worlds: the paper world is warm, and the hologram is cyan light in dark space. The camera pushes in through the board to go in and pulls out to come back.",
      ] },
      { h: "Colour script" },
      "The light goes down scene by scene: late afternoon, rose sunset, dusk, violet dusk, night. There are no gold skies, because in this story yellow belongs to the Pollen. The pool is lit warm, so the hologram’s cyan is the only cold thing in the frame.",
      { h: "The workflow it set" },
      "This is the episode where the sound-first rule came from, and where assembly moved fully into GeoV Studio: 222 shots and 122 voice clips in one project, with the score as clips under them, exported by GeoV itself. The songs are Mook’s, made with Lyria. Mook called it another huge jump.",
      { img: "/images/show/sheet-groove-machine.jpg", alt: "Frames from across the episode" },
    ]
  },
  {
    slug: "square-eyes", title: "Square Eyes: a cartoon about how a computer sees", publishedAt: "2026-10-10", category: "Episode breakdown", episodeId: "square-eyes",
    summary: "TV Gurl sees in 16 × 16 squares and answers one question every five minutes and seven seconds. Both limits were real.",
    image: "/images/show/ep-square-eyes.jpg", imageAlt: "Square Eyes",
    body: [
      "Square Eyes was written to test a new tool: the pipeline’s eyes, a fast vision model that reads a picture as a 16 × 16 grid of colour. Instead of hiding the tool’s limits, the episode made them into a character. TV Gurl sees in squares, answers only yes-or-no and where-is-it questions, and answers one question every 5:07, which was the measured wait between the eyes’ answers at the time.",
      "So the picture on TV Gurl’s screen is what the eyes actually see. Her hide-and-seek calls were checked against the real eyes before the film was finished. Asked “Is Mush blue?”, the real eyes answered unsure, twice, and that is exactly what TV Gurl says.",
      { h: "Three passes" },
      "The first cut’s day didn’t pass: the eyes read every daytime scene as midday, and so did a human eye. A second pass re-lit the day from morning to night and was checked with the eyes. A third added a morning mist. The eyes couldn’t read the mist as morning, but Mook liked it, so it stayed.",
      { h: "What it changed" },
      "Mook said the characters felt more consistent, the story was easier to follow, and the models felt more like his drawings. It was also the first episode voiced in Google Vids.",
      { img: "/images/show/sheet-square-eyes.jpg", alt: "Frames from across the episode" },
    ]
  },
  {
    slug: "downhill", title: "Downhill: the pilot", publishedAt: "2026-10-10", category: "Episode breakdown", episodeId: "downhill",
    summary: "A box car, a very big hill, and a production built around one rule: one course, every view.",
    image: "/images/show/ep-downhill.jpg", imageAlt: "Downhill",
    body: [
      "Downhill was the pilot. Mook’s brief was to drive the pipeline as fast as it would go, aim for 11 minutes, and put most of the attention on the visuals. Mook falls to the planet Dwarf through a rectangle and has been afraid of speed ever since. Mush signs them up for the Mowersville Downhill anyway, and Mook builds the slowest, safest box car in history.",
      { h: "One course, every view" },
      "A race is hard to keep consistent across 186 shots. So the course was built once, as a single source of truth, and every view reads from it: the chase camera on the road, the side view, the map from above, TV Gurl’s squares. A tag-based clock re-timed every shot when the real voices came in.",
      { h: "Voices and music" },
      "The voices were recorded in Google Vids, and the music is six cues made with Lyria: the cold open, the night before, the chase, letting go, the float and the end credits. Each cue was placed by its own loudness curve onto the picture. The chase’s first break lands on the gumball slow motion, and the let-go swell lands on the flood.",
      { h: "The eyes on board" },
      "TV Gurl rides at the front of the car, and every call she makes is a real answer from the pipeline’s eyes. Across the film they gave about 36,000 answers for about 40 cents, and they changed the grade. More in “Giving the pipeline eyes”.",
      "Downhill also gave the show its first pieces of world: Mount Clipping, the Big Hill, the Wall and the Announcer, all listed for Mook as keep or cut. Mount Clipping became his favourite.",
      { img: "/images/show/sheet-downhill.jpg", alt: "Frames from across the episode" },
    ]
  },
];
