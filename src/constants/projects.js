import { SYN } from "./syn";
import { IMG } from "./images";

export const SKILLS = [
  { label: "AI Tool Design",            color: SYN["2"] },
  { label: "Character Design",          color: SYN["7"] },
  { label: "Web Audio API",             color: SYN["6"] },
  { label: "React / Next.js",           color: SYN["2"] },
  { label: "Unity / C#",               color: SYN["4"] },
  { label: "Google Flow / AI Art",      color: SYN["5"] },
  { label: "3D Animation (BFA)",        color: SYN["1"] },
  { label: "VFX (Zero VFX trained)",    color: SYN["1"] },
  { label: "Java / Swing",              color: SYN["2"] },
  { label: "Three.js / WebGL",          color: SYN["0"] },
  { label: "STEM Curriculum Design",    color: SYN["3"] },
  { label: "MagicSchool AI Certified",  color: SYN["3"] },
  { label: "25-School Program Director",color: SYN["3"] },
  { label: "Stop Motion & Puppetry",    color: SYN["5"] },
  { label: "Synesthetic UX Research",   color: SYN["7"] },
];

// renderMedia is a string key — components look up the actual render function
// so this file stays serializable (no JSX in data)
export const PROJECTS = [
  // ARTWORK
  {
    id: "visualart", cat: "ARTWORK", wide: true,
    title: "Visual Art",
    tagline: "Painting, illustration & mixed media",
    accent: SYN["7"],
    desc: "Abstract expressionism, figurative work, and AI-collaborative painting. My painting practice runs parallel to everything else — it's where synesthetic perception gets translated most directly into form and color. Abstract Coder in Vibrant Cosmos came out of thinking about what it feels like to debug code. The Contemplative Child Figure came out of ten years in classrooms. The work isn't decorative. It's data.",
    tags: ["Abstract Expressionism", "Acrylic", "Digital", "AI-Assisted", "Figurative", "Synesthesia"],
    renderKey: "visualart",
    artImages: [
      { src: IMG.abstractCoder,     alt: "Abstract Coder in Vibrant Cosmos" },
      { src: IMG.texturedChild,     alt: "Contemplative Child Figure" },
      { src: IMG.otisAbstract,      alt: "Otis - Abstract Expressionism" },
      { src: IMG.tvboy,             alt: "TV Boy" },
      { src: IMG.abstractBonsai,    alt: "Abstract Figure with Bonsai Tree" },
      { src: IMG.dualFaces,         alt: "Dual Faces and Playful Paws" },
      { src: IMG.abstractAstronaut, alt: "Astronaut in Abstract Space Dream" },
      { src: IMG.mookNightwalk,     alt: "Mook Night Walk" },
      { src: IMG.dudemoon,          alt: "Dude Moon" },
    ],
    artCols: 3, artRatio: "4/3",
  },

  {
    id: "sketchwork", cat: "ARTWORK",
    title: "Sketchbook & Studies",
    tagline: "Experimental work, studies, and process",
    accent: SYN["0"],
    desc: "The noodles series, blur studies, and experimental digital work. This is the practice that feeds everything else — unfiltered, unpolished, ongoing. Process as product. The sketchbook is the real research.",
    tags: ["Sketchbook", "Digital Studies", "Experimental", "Process Work", "Ongoing"],
    renderKey: "sketchwork",
    artImages: [
      { src: IMG.noodles13,         alt: "Noodles 13 - Large Format Study" },
      { src: IMG.blurArt,           alt: "Blur Study" },
      { src: IMG.gigabyteArt,       alt: "Gigabyte" },
      { src: IMG.tvdogSidekick2025, alt: "TV Dog Sidekick - 2025 AI Collab" },
    ],
    artCols: 2, artRatio: "4/3",
  },

  {
    id: "mowersvilleart", cat: "ARTWORK", wide: true,
    title: "Mowersville — Production Backgrounds",
    tagline: "Environment design for Mook & Mush — Gemini-directed visual development",
    accent: SYN["5"],
    desc: "Six fully-realized environments built for the Mook & Mush animated series. Directed through Gemini with a chalk-pastel aesthetic. Each location — the skate park, the classroom, the art room, the soccer field, the bike path — is a character. The world precedes the story. I designed the visual grammar first: warm suburban light, high-key palette, late-afternoon golden hour everywhere. That's Mowersville.",
    tags: ["Background Art", "Environment Design", "Google Gemini", "Pre-Production", "Chalk-Pastel", "Mook & Mush"],
    renderKey: "mowersvilleart",
    artImages: [
      { src: IMG.mowersvilleBikes,   alt: "Mowersville - Bike Path" },
      { src: IMG.mowersvilleSkate,   alt: "Mowersville - Skate Park" },
      { src: IMG.mowersvilleClass,   alt: "Mowersville - Classroom" },
      { src: IMG.mowersvilleTown,    alt: "Mowersville - Town Overview" },
      { src: IMG.mowersvilleArtRoom, alt: "Mowersville - Art Room" },
      { src: IMG.mowersvilleSoccer,  alt: "Mowersville - Soccer Field" },
    ],
    artCols: 3, artRatio: "16/9",
  },

  // ARTWORK — Animation & Film
  {
    id: "mookandmush", cat: "ARTWORK", wide: true,
    title: "The Misadventures of Mook & Mush",
    tagline: "Original cartoon series — pixel art characters in a painted world",
    accent: SYN["7"],
    desc: "An original animated series in development. Mook is a synesthetic pixel-art kid; Mush is his small grey companion. Set in Mowersville — a hand-painted suburban world. Full production pipeline: character design, turnaround sheets, background art, animation.",
    tags: ["Character Design", "Google Flow", "AI Animation", "Original IP", "Background Art"],
    renderKey: "youtube",
    youtubeId: "xX9ZQkI-Pac",
    image: IMG.mookAndMush, imageAlt: "Mook and Mush skating in Mowersville",
  },

  {
    id: "chardesign", cat: "ARTWORK",
    title: "Mook — Character Design",
    tagline: "Full turnaround sheets & pose library",
    accent: SYN["5"],
    desc: "Production-ready character design: 5-angle turnaround, pose sheet across 5 emotional states, colour model. Built in Google Flow. The split orange/blue grid texture is a visual encoding of synesthesia.",
    tags: ["Character Design", "Turnaround Sheet", "Google Flow", "Pre-Production"],
    image: IMG.charSheet, imageAlt: "Mook character pose sheet",
  },

  {
    id: "tvdog", cat: "ARTWORK",
    title: "TV Dog — Character Design",
    tagline: "Supporting character with a vintage television for a head",
    accent: SYN["3"],
    desc: "Full pose sheet: walking, sleeping, leaping, curious, yawning, confused. Each expression reads through the screen face. Built in Google Flow with a textured chalk-pastel aesthetic.",
    tags: ["Character Design", "Pose Sheet", "Google Flow", "Anthropomorphic"],
    image: IMG.tvDogPoses, imageAlt: "TV Dog pose sheet — 6 expressions",
  },

  {
    id: "bayhouse", cat: "ARTWORK",
    title: "Bay House — Background Art",
    tagline: "Production background for Mowersville exterior scenes",
    accent: SYN["4"],
    desc: "Hand-illustrated background: Cape Cod bay house at golden hour, dock, lobster traps, warm orange sky. Painted in Google Flow. Sets the tone for Mook's coastal New England neighbourhood.",
    tags: ["Background Art", "Google Flow", "Environment Design", "Pre-Production"],
    image: IMG.bayHouse, imageAlt: "Bay House background — Mowersville sunset",
  },

  {
    id: "robotfilm", cat: "ARTWORK", wide: true,
    title: "Robot Changes TV Channel",
    tagline: "Junior Thesis Film · Lesley University · Zero VFX · IMDB listed",
    accent: SYN["1"],
    desc: "My junior thesis film at Lesley University's BFA Animation program. 3D character animation, performance direction, and a VFX pipeline built with training from Zero VFX Boston. Listed on IMDB. The TV-head robot in this film became the visual and thematic seed for the Mook & Mush universe — the character that started everything. Also made 'Every Child Deserves a Home' during my BFA — an animated short for the Child Homelessness Initiative.",
    tags: ["3D Animation", "Junior Thesis", "Lesley University", "Zero VFX", "IMDB", "Character Animation", "Festival Circuit"],
    cta: "Submit · Film Freeway", ctaHref: "https://filmfreeway.com/WeightSortFilm", ctaTarget: "_blank",
  },

  {
    id: "earlyfilms", cat: "ARTWORK",
    title: "First Year Work — 2017",
    tagline: "Lesley University · Freshman animation exercises",
    accent: SYN["8"],
    desc: "First-year animation work at Lesley University, 2017. 'Rocco the Magic Dog: Episode 1' and 'The Stone of Truth' — these aren't thesis films, they're where the fundamentals got built. Character movement, timing, storytelling from scratch. The foundation everything else stands on.",
    tags: ["Student Work", "Lesley University", "2017", "Fundamentals", "Character Animation"],
    renderKey: "dualYoutube",
    youtubeIds: ["ssxQIc3kv5Y", "l3cI4xeQb8s"],
  },

  // STUDENT WORK
  {
    id: "bigback", cat: "STUDENT WORK",
    title: "Big Back Attack 🍕",
    tagline: "Student-built breakout game — Bowen After School",
    accent: SYN["5"],
    desc: "A breakout game with food-themed power-ups, multi-ball mechanics, and a live leaderboard — designed and built by my students at Bowen After School. They named it, balanced the difficulty, and kept iterating until it felt right. I introduced the canvas loop and got out of the way.",
    tags: ["Student Work", "Canvas", "Bowen After School", "Game Design", "Breakout"],
    cta: "Play Now", ctaHref: "bigbackattack.html",
  },

  {
    id: "chaoslands", cat: "STUDENT WORK",
    title: "Chaos Lands: Corruption 🏃",
    tagline: "Student-built wave runner — Bowen After School",
    accent: SYN["1"],
    desc: "A wave runner with Nightmare Mode, particle explosions, and a live leaderboard — designed by my students at Bowen After School. They wrote the lore, invented the corruption mechanic, and pushed for competitive scoring. I taught them the canvas loop. Everything else was theirs.",
    tags: ["Student Work", "Canvas", "Game Design", "Bowen After School", "Runner"],
    cta: "Play Now", ctaHref: "chaoslands.html",
  },

  {
    id: "catcaretaker", cat: "STUDENT WORK",
    title: "Cat Caretaker: Nightmare Mansion 🐱",
    tagline: "Student-built raycasting horror game — Bowen After School",
    accent: SYN["6"],
    desc: "A first-person raycasting game where you navigate a mansion full of cats with moods. Students designed the room layouts, the anger system, and the jump scare ending. I introduced raycasting. They decided it should be a horror game — that part was entirely theirs.",
    tags: ["Student Work", "Raycasting", "Canvas", "Horror", "Bowen After School"],
    cta: "Play Now", ctaHref: "catcaretaker.html",
  },

  {
    id: "ginrummy", cat: "STUDENT WORK",
    title: "Gin Rummy 🃏",
    tagline: "Student-built card game with AI opponent — Bowen After School",
    accent: SYN["3"],
    desc: "A complete Gin Rummy implementation with meld detection, deadwood scoring, and an AI opponent — built by my students at Bowen After School. I gave them the rules and let them work out the logic. Writing the AI was the moment several of them understood what an algorithm actually is.",
    tags: ["Student Work", "Card Game", "AI Opponent", "Algorithm Design", "Bowen After School"],
    cta: "Play Now", ctaHref: "ginrummy.html",
  },

  {
    id: "mylesclicker", cat: "STUDENT WORK",
    title: "Myles Clicker",
    tagline: "An incremental clicker — made because a student asked nicely",
    accent: SYN["0"],
    desc: "A student named Myles asked if we could just make a clicking game. So we did. Simple incremental mechanics, satisfying feedback, and a quiet lesson in how exponential growth works. Sometimes the best projects start with a simple question.",
    tags: ["Clicker", "Incremental", "Student Request", "Classroom Build", "Math"],
    cta: "Play Now", ctaHref: "mylesclicker.html",
  },

  {
    id: "watergunpractice", cat: "STUDENT WORK",
    title: "Water Gun Target Practice",
    tagline: "Shooting gallery with an upgrade shop — students helped design the economy",
    accent: SYN["6"],
    desc: "Moving targets, water mechanics, and a full upgrade shop. Students helped design the in-game economy — what upgrades should cost, which are worth buying, how to balance power against price. A natural entry point into game design thinking.",
    tags: ["Canvas", "Shooter", "Upgrade System", "Economy Design", "Student Design"],
    cta: "Play Now", ctaHref: "watergunpractice.html",
  },

  // ED WORK
  {
    id: "binarylifegame", cat: "ED WORK",
    title: "Base 2: Game of Life 🧬",
    tagline: "Conway's Life reframed as a binary teaching tool for kids",
    accent: SYN["2"],
    desc: "Conway's Game of Life displayed as binary digits. Flip cells between 0 and 1 and watch the rules play out. Built for 3rd and 4th graders — big cells, friendly labels, and a draw mode so students can paint patterns freehand. Simple rules that produce complicated things.",
    tags: ["Canvas", "Teaching Tool", "Conway", "Binary", "K–5"],
    cta: "Play Now", ctaHref: "binarylife.html",
  },

  {
    id: "bankheist", cat: "ED WORK",
    title: "Bank Heist Mission",
    tagline: "Grid stealth — catch the moving vault, avoid the guard",
    accent: SYN["2"],
    desc: "Tile-based stealth game. Navigate a grid to reach a vault that keeps moving before the guard catches you. Obstacles block the path and your character breaks through them. Simple rules that open into real spatial problem-solving. Arrow keys or WASD, confetti on the win screen.",
    tags: ["Canvas", "Stealth", "Grid", "Spatial Reasoning", "Classroom Game"],
    cta: "Play Now", ctaHref: "bankheist.html",
  },

  {
    id: "connect4kirby", cat: "ED WORK",
    title: "Connect 4 — Kirby & Among Us",
    tagline: "Classic strategy with adjustable AI difficulty",
    accent: SYN["7"],
    desc: "Connect 4 with Kirby and Among Us themes and three AI difficulty levels. Students can feel the difference between easy and hard, which tends to open up a real conversation about what the computer is actually doing — a quiet introduction to decision trees.",
    tags: ["Canvas", "AI Opponent", "Strategy", "Connect 4", "Student Favorite"],
    cta: "Play Now", ctaHref: "connect4kirby.html",
  },

  {
    id: "diceroller", cat: "ED WORK",
    title: "Dice Roller Deluxe",
    tagline: "Every die you need — D4 through D20",
    accent: SYN["3"],
    desc: "A full-featured dice roller covering D4 through D20, with multiple dice at once. Started as a quick probability tool and became one of the most-used things in my room — tabletop game days, math lessons, and any time a student wants to leave something to chance.",
    tags: ["Math Tool", "Tabletop", "Probability", "Classroom Tool", "D&D"],
    cta: "Roll", ctaHref: "diceroller.html",
  },

  {
    id: "geocatdash", cat: "ED WORK",
    title: "Geo Cat Dash",
    tagline: "Geometry Dash-style runner — a cat, an obstacle course, one button",
    accent: SYN["4"],
    desc: "A cat moving through an obstacle course that does not stop. Press space to jump, survive as long as you can. An accessible entry point into canvas animation — the mechanic is simple, but the timing is unforgiving in exactly the right way.",
    tags: ["Canvas", "Runner", "Platformer", "Animation", "Classroom Build"],
    cta: "Play Now", ctaHref: "geocatdash.html",
  },

  {
    id: "milkfactory", cat: "ED WORK",
    title: "Milk Carton Factory",
    tagline: "Factory simulation — inputs, outputs, and the occasional bottleneck",
    accent: SYN["5"],
    desc: "Run a milk carton production line. Manage inputs, watch for bottlenecks, optimize throughput. Good for teaching systems thinking in a context that is concrete and a little absurd. Students find it funny, which tends to make the concepts easier to hold onto.",
    tags: ["Simulation", "Factory", "Systems Thinking", "Management", "Classroom"],
    cta: "Play Now", ctaHref: "milkfactory.html",
  },

  {
    id: "chs-main", cat: "ED WORK", wide: true,
    title: "The Chestnut Hill School",
    tagline: "~10 years · Camp Counselor → Videographer → STEAM Teacher · Chestnut Hill, MA",
    accent: SYN["5"],
    desc: "Grew up here as a student. Became a CIT in 2009. Now in my 10th summer on staff. Designed and produced 16 student films per summer as camp counselor. Created in-house promotional videos and animations as staff videographer. Currently run Senior Camp for incoming 7th–8th graders: clay armature puppet sculpting, stop motion workshops, live sketch comedy, Momentum Lab tinkering, and watercolour journaling on 3 day trips per week.",
    tags: ["Stop Motion", "Clay Armature", "Needle Felt", "Film Production", "Sketch Comedy", "Watercolour", "7th–8th Grade", "10 Years"],
    renderKey: "photoGrid",
    photoImages: [
      { src: IMG.dogSculptures, alt: "Student dog sculptures" },
      { src: IMG.needleFelt,    alt: "Needle felt project" },
      { src: IMG.needleFelt2,   alt: "Needle felt project 2" },
      { src: IMG.animation1,    alt: "Student animation still" },
    ],
  },

  {
    id: "chs-film", cat: "ED WORK",
    title: "CHS Student Animation",
    tagline: "Stop motion film produced in Senior Camp — Summer 2024",
    accent: SYN["5"],
    desc: "A student-produced stop motion animation from last summer's Senior Camp program. Students designed characters, built sets, and animated every frame. No student faces — the work speaks for itself.",
    tags: ["Stop Motion", "Student Film", "CHS", "Summer 2024"],
    renderKey: "youtube",
    youtubeId: "tj0Xk_aZ5Fc",
  },

  {
    id: "empow", cat: "ED WORK",
    title: "EMPOW Studios",
    tagline: "25 schools · Program director · Curriculum architect",
    accent: SYN["3"],
    desc: "Managed AI and STEM programming across 25 schools. Designed challenge-based curricula: give kids a tool and ask 'what can you make?' Scratch, robotics, game dev, AI tools — student-led, educator-facilitated.",
    tags: ["STEM Education", "Curriculum Design", "Program Management", "25 Schools", "K–8"],
  },

  {
    id: "bowen", cat: "ED WORK",
    title: "Bowen After School",
    tagline: "Live user testing with 4th and 5th graders · Newton, MA",
    accent: SYN["4"],
    desc: "Current role. I hand AI tools to 4th and 5th graders and watch what breaks. MOOK SYNTH was tested here first. Teaching philosophy: tools, not tutorials.",
    tags: ["After School", "AI Tools", "User Testing", "4th–5th Grade", "Newton MA"],
  },

  {
    id: "magicschool", cat: "ED WORK",
    title: "MagicSchool AI",
    tagline: "Certified educator — AI professional development",
    accent: SYN["0"],
    desc: "Completed MagicSchool AI's professional development certification. Applied to Pioneer program. Using AI tools to build lesson plans, differentiate instruction, and advocate for thoughtful AI integration in K–5 classrooms.",
    tags: ["MagicSchool AI", "PD Certification", "AI Integration", "EdTech"],
  },

  // PERSONAL
  {
    id: "synth", cat: "PERSONAL", wide: true,
    title: "MOOK SYNTH",
    tagline: "A browser music instrument built for 4th graders",
    accent: SYN["6"],
    desc: "An 808 drum engine and XY synthesis pad built across six sessions. Grid cells display the waveform of the sound they hold, colour-coded using my synesthetic number system. Tested with real students at Bowen After School — kids actually play it.",
    tags: ["Web Audio API", "React", "Generative UI", "EdTech", "Synesthesia"],
    cta: "Open MOOK SYNTH", ctaHref: "mook-synth.html", ctaTarget: "_blank",
    renderKey: "waveform",
  },

  {
    id: "binarylife", cat: "PERSONAL",
    title: "Binary Game of Life",
    tagline: "Conway's Life as a binary teaching tool for 4th graders",
    accent: SYN["2"],
    desc: "A full Swing GUI Java app: 28×40 grid, classroom-friendly controls, binary mode overlay showing 0/1 instead of alive/dead. Built to teach computational thinking through play.",
    tags: ["Java", "Swing GUI", "Cellular Automata", "Teaching Tool", "K–5"],
    cta: "View on GitHub", ctaHref: "https://github.com/sfdimarco",
  },
];
