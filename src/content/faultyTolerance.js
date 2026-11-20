export const FT_ROOT = "/faulty-tolerance";
export const FT_CHANNEL = "https://www.youtube.com/channel/UCOp_nac6IMCymmbiuKt--jg";
export const films = [
  { id: "AX10yoThyrM", title: "One Good Look", image: "one-good-look.jpg", note: "Start here. Meet the world through Kip and Lo's eyes." },
  { id: "yu3lSPA3j6Y", title: "The Missing Beat", image: "missing-beat.jpg", note: "The pilot. Go back to the beginning." },
  { id: "ZnoPZGpP_8A", title: "A Room for Two", image: "room-for-two.jpg", note: "Spend a little more time with the pair." },
];
export const shorts = [
  { id: "agNdizH_Mqc", title: "Courtesy Carry" },
  { id: "bsklAZ-swFg", title: "The Last Drop" },
];
export const craftNotes = [
  {
    slug: "show-the-rule-before-it-breaks", title: "Show the rule before it breaks", category: "Story and staging",
    deck: "A planter, a flag, and one repeated camera angle show how the aqueduct works without asking the viewer to guess.", film: 0,
    paragraphs: [
      "The aqueduct crew can know a rule by heart while the viewer has never heard it. Before a scene asks us to worry, we should know what the crew is trying to do, what tells them it is safe to act, and what happens if that sign is missed. We are testing a simple order: show the rule, show what breaks it, then make the correction visible.",
      "In a recent G-Stack staging test, a flag carries a signal from one work position to another. From a high, all-knowing angle, the flag is easy to see. From the receiver’s eye level, the same lowered flag disappears behind a planter. We hold that receiver angle and use it again after the flag moves. The viewer can compare before and after without having to learn a new layout in the middle of the action.",
      "Seeing the flag and being ready to take the weight aren’t the same thing. The first attempt needs a visible consequence for moving early. On the retry, the count stops long enough for the viewer to notice that the weight is still being held. A clear reply ends that wait. The sound gives the pause its length; the picture makes clear who is waiting and what moves only after the reply.",
      "We also want a test and its larger consequence to look like two different events. A few drops at one joint tell you about that joint, not the whole aqueduct. The next view establishes where the first small flow is actually going. That bit of geography is exposition too. It teaches the viewer what changed rather than simply assuring them that the job worked.",
      "The build keeps the planter, flag, and cameras in an editable GeoV scene. We checked the view with the same camera and real foreground geometry, then rendered the shots in G-Stack against the locked dialogue and effects. The scene remains in private picture review. The exercise below uses a separate public film.",
    ],
    watch: "In One Good Look, pause before a character makes a move and name what they’re trying to do. Resume and look for the shot that tells you whether their move worked.",
    question: "Could a first-time viewer tell you what the crew is waiting for before they hear the reply?",
  },
  {
    slug: "sound-first-one-world", title: "Sound first, one world: a Kip & Lo production update", category: "Production diary",
    deck: "Since the first G-Stack breakdown, we've carried one aqueduct across several chapters and started locking the sound before we animate.", film: 0,
    paragraphs: [
      "The first G-Stack breakdown was about getting back to one editable aqueduct. The work since then has been about making that decision count on screen. Instead of starting each chapter with new scenery, we carry forward the spaces, props, and mechanisms that belong there. That buys us time for the things a viewer feels: a hand taking weight, a change in light as the camera looks down the basin, a pause before somebody commits.",
      "Sound now leads the cut. We record the dialogue with Google Vids, then give it room in a mix with original music, Foley, and the sound of the place itself. We lock that mix before animating. The real takes tell us when mouths open, when a reply needs a beat, and where a sound needs an answer in the picture. In Chapter 17 we could make a small but useful edit on that basis: a brief close-up lands on a latch sound and returns to the wide. Seventeen picture frames changed. The sound and captions stayed exactly as they were.",
      "Picture still comes from Sean DiMarco's G-Stack: the combined GeoV Studio and Geo Runtime pipeline. We render the editable .geo scenes through Node, without a browser. Cameras, character poses and props stay adjustable in the same space. A good wide makes the route clear before we cut in. If a reach is too long or a hand is not carrying the load, we change the action instead of hiding the mistake with a cut.",
      "The process got clearer because some early cuts looked finished before they were. Sean flagged rushed framing, empty areas of the set, clipping, and mouths that did not match the lines. The fix was to restore the order of work, not add a coat of polish at the end: lock sound, stage the action, check the rendered movement and edit, then watch the whole cut before calling it ready. Sean sets the creative direction and decides what locks. The AI production work includes working out the shots, staging the action, rendering and editing, and revising against his notes.",
      "The look work is part of that same process. We give the stone joints, texture and the marks of use, and give the sky and practical lights a job in the shot. The newer mist sits low over the basin and falls into the depth of the set rather than covering the whole image. We can keep the foreground action clear and still feel the distance to the far arches.",
      "Here is where the work stood on November 19, 2026. Chapters 15 and 16 were locked and scheduled for YouTube as a two-part preview, not as the next two releases in sequence. Chapter 17 had a polished cut in review. Chapter 18 was in dialogue and audio preparation, not yet animated. A render, a producer-approved cut, and a public release are three different things.",
    ],
    watch: "One Good Look is a separate public film. Watch it once with the sound on, then again muted. Notice which moments still read and which ones the sound helps you anticipate.",
    question: "What does the sound tell you to look for just before a cut?",
  },
  {
    slug: "one-aqueduct-many-shots", title: "One aqueduct, many shots: how we used G-Stack", category: "Production tools",
    deck: "We kept one editable world, gave each shot a job, and rendered only the changes that earned a place in the cut.", film: 0,
    paragraphs: [
      "The useful breakthrough was getting back to the .geo source. We knew where the characters could stand, what the stone was made of, and what each camera could see. G-Stack is our combined GeoV Studio and Geo Runtime pipeline. For this pass, we ran the native renderer through Node, without a browser. Each job took an editable scene set and a frame plan, then returned a sequence of images and a receipt with timings and warnings. That made it practical to work on several shots without rebuilding the place for each one.",
      "The aqueduct is a shared set built with wave function collapse, a rule-based way to assemble neighboring pieces that fit. Aging it was a separate pass: staggered joints, mineral seepage, old iron fittings, and small pools of light. We could judge the new look with the exact same camera before and after. The walls and water changed in appearance. The surfaces the characters stand on and the space their feet need stayed put.",
      "One fix made the value of that separation obvious. A far wall showed stripes because an old stand-in and the finished masonry occupied the same place. We restored the existing visibility rule for that angle, then checked the repair through the whole move. Keeping the same pose and camera made it clear what fixed the image.",
      "The same method helped the acting. First check what can hold weight: the planted feet, the hand on the rail, the contact that actually moves the object. If it fails, stage a better action or make a clearer cut. Then ask the editing question: what does the audience need to see before the effort, and how long should they wait for the result? A beat of hesitation can do as much work as a new pose.",
      "Here are the production counts. The two-minute test cut had 23 shot slots and 2,784 displayed frames at 24 fps. The shared look pass needed 219 distinct native scene-and-camera renders; repeated pictures were reused in the edit. A later three-beat motion revision left 2,580 picture exposures and the sound unchanged. Those are counts of what we rendered and what we kept, rather than a billing or speed benchmark.",
      "The next things to test are readable outlines where bodies meet stone, more shape in the light and air, and water that tells you what a mechanism is doing. The aim is to spend less time remaking the aqueduct and more time making a scene worth watching.",
    ],
    watch: "One Good Look is a separate, public viewing exercise. Before a move or handoff, watch where the shot puts your attention and what it lets you anticipate.",
    question: "What does the cut let you expect before a character moves?",
  },
  {
    slug: "a-hand-under-the-tray", title: "A hand under the tray", category: "Physical comedy", deck: "Before a handoff can be funny, it has to look possible.", film: 0,
    paragraphs: [
      "A tray is a tiny continuity test. Where is its weight? Which hand supports it now? What happens when that hand lets go? If the picture cannot answer those questions, a careful gesture can look like an object floating through the scene.",
      "The staging pass makes the support readable: establish the surface, show the bracing hand, bring the receiving hand into contact, then release. The camera needs room for the whole exchange. A close-up is useful only if it preserves the important relationship between hand, tray, and landing place.",
      "That clarity gives a joke somewhere to live. Hold the perfectly sensible precaution a beat longer than expected. Let the other robot react. The comedy comes from how much care they bring to a very small problem."
    ], watch: "Watch One Good Look again with your attention on hands and objects. Notice how much of a character's intention you can read before a line is spoken.", question: "Could you follow the action with the dialogue muted?"
  },
  {
    slug: "give-the-camera-a-place", title: "Give the camera a place", category: "Cinematography", deck: "A vast aqueduct. A small landing. Enough room to understand both.", film: 2,
    paragraphs: [
      "Scale is only half the job of an establishing shot. A useful wide also tells us where someone can stand, where an object could land, and how one place connects to the next. Without that geography, the next cut asks the audience to solve a puzzle it never meant to set.",
      "In GeoV, geometry, character state, and cameras remain editable. A staging revision can move a camera or adjust a reach without giving up the scene's underlying structure. Repeating the same scene state makes it possible to compare those choices directly.",
      "The practical question is simple: can a viewer point to the destination before the movement begins? Establish it, move closer for the decision, and keep enough of the environment in frame to make the effort feel real."
    ], watch: "Use A Room for Two as a viewing exercise: watch the wide shots first, then notice what information the closer shots keep or leave out.", question: "Do you know where the next movement can end?"
  },
  {
    slug: "the-world-between-lines", title: "The world between lines", category: "Sound & music", deck: "A pause in conversation should not switch off the world.", film: 1,
    paragraphs: [
      "Dialogue gives a scene its measured timing. It does not have to fill every second. The little spaces around a line let us register a look, a mechanical adjustment, or the surprising amount of thought being devoted to a cup.",
      "Continuous ambience keeps the location present through those pauses and across cuts. Water, room tone, and the texture of a working place sit underneath the action; Foley gives particular contact and movement their own sound. Music has a different job again: shaping a passage without covering the words.",
      "The mix needs a listening pass as well as a picture review. Check whether a quiet reply remains clear, whether a transition suddenly loses its ambience, and whether the music leaves the physical joke enough space to land."
    ], watch: "Listen to The Missing Beat once without watching. Then replay it with the picture and compare what the sound alone led you to imagine.", question: "When nobody speaks, does the place still feel occupied?"
  },
  {
    slug: "two-ways-to-help", title: "Two ways to help", category: "Story & rhythm", deck: "Kip checks the structure. Lo checks on the person using it.", film: 0,
    paragraphs: [
      "Kip and Lo both want to help. Their first questions are different. Kip reaches for structure, limits, and a dependable plan; Lo notices the people around the problem. Neither perspective has to become the punchline for the other one to matter.",
      "A main practical problem gives an episode direction. A smaller social problem can interrupt it, complicate it, or quietly explain why it matters. When those threads meet, a repair can change more than the mechanism in front of them.",
      "Robot comedy works best when the bodies participate. A precise adjustment, a careful pause, or an unnecessarily thorough check can reveal character. Read the line, measure the pause, stage the movement, and review the result together. A funny sentence is only the beginning of a funny shot."
    ], watch: "Return to One Good Look and follow one character at a time. Watch for the reaction as well as the action.", question: "Did the small problem change how you understood the bigger one?"
  },
];
