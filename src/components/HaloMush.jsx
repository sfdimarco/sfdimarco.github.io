import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HaloCard, { SYN } from "./HaloCard.jsx";
import { HALO_BOSSES, HALO_STARTERS } from "../content/haloCards.js";
import { deckProblems, ROAD_BY, WIN_POINTS, BOUNTY, PACK_PRICE } from "../lib/haloBinder.js";

// 11-23 🆕 (Claude's, for Mook's tick): Mush shows a new player how to play, and the path from "never played" to "beat the cast".
// Mush is mostly quiet in the show (SHOW-BIBLE 02-CHARACTERS), so his lines are short.

// Mush, drawn from Mook's 2020 card "MUSH (v.9)" (SHOW-BIBLE/art/cast/2020-card-mush.jpg) and the show's
// mushDraw rig: a pale moon-puffball face with soft spots inside a white helmet ring, a red box antenna with a
// blue ball, one big pale-blue eye and one small pink one, a "c" nose and a small smile low on the right;
// a long onesie split down a stitched seam, blue on our left (three yellow buttons) and red on our right,
// a yellow triangle at the collar, mittens and shoes in the swapped colours. Colours sampled from the card.
const INK = "#1c1a21";
const MU = {
  blue: "#6092db", red: "#eb6d83", yellow: "#fbfa3f", ring: "#faf9f9", face: "#eaebdb",
  spot: "#d0d2b9", spotEdge: "#a3a6b7", eyeBig: "#edf3ff", eyeSmall: "#f8e8ec", eyeRim: "#f0b3c0",
};

// a hand-drawn blob: a closed curve through n points round an ellipse, each pushed in or out a little
// (a fixed seed, so it is the same wobble every render)
function blob(cx, cy, rx, ry, seed, j = 0.05, n = 9) {
  const P = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + seed, k = 1 + j * Math.sin(seed * 12.9898 + i * 78.233) * Math.cos(i * 2.1 + seed);
    P.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  // Catmull-Rom through the points, as cubic Beziers
  let d = `M${P[0][0].toFixed(2)} ${P[0][1].toFixed(2)}`;
  for (let i = 0; i < n; i++) {
    const p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(2)} ${c1[1].toFixed(2)} ${c2[0].toFixed(2)} ${c2[1].toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return d + " Z";
}

// his shape, in a 120 x 120 box (measured off the card): helmet centre (59.4, 35.5), the hem at 114.6
const SEAM = "L58.3 102 L59.1 88 L58.4 74 L58.8 60 Z";
const MUSH = {
  helmet: blob(59.4, 35.5, 26.7, 26.3, 0.4, 0.025, 11),
  face: blob(60, 38.4, 21.9, 21.7, 1.3, 0.03, 11),
  spots: [[52.4, 23.6, 4.6, 3.4], [62.6, 21.4, 4.4, 4], [72.6, 26.6, 3.2, 3.6], [73, 39.6, 6.4, 5.4], [53.6, 45, 4.2, 3.2],
          [66.6, 45.2, 3.2, 2.8], [46.8, 51, 3.6, 3.2], [57, 55.6, 4.8, 2.4], [42.6, 43.8, 2.4, 3]].map(([x, y, rx, ry], i) => blob(x, y, rx, ry, 2 + i, 0.16, 7)),
  eyeBig: blob(47, 34.2, 8.6, 8.5, 0.9, 0.02, 10),
  eyeSmall: blob(67.8, 32.3, 5.1, 5, 2.2, 0.03, 9),
  ball: blob(33, 6.6, 3.5, 3.4, 3.1, 0.05, 8),
  mittR: blob(31.2, 82.2, 3.3, 4.4, 1.7, 0.06, 8),   // red mitten, blue sleeve
  mittB: blob(87.4, 81.6, 3.2, 4.2, 2.6, 0.06, 8),   // blue mitten, red sleeve
  shoeR: blob(38.6, 115.4, 6.4, 3, 0.5, 0.05, 9),
  shoeB: blob(80.2, 115.6, 6.4, 3, 1.1, 0.05, 9),
  blue: `M58.7 50 L40 50.5 C33.2 58 30.2 68 29.6 80 C29 92 29.4 103.6 31.8 109.6 C33.6 113.8 41 114.8 58.7 114.6 ${SEAM}`,
  red: `M58.7 50 L78 50 C85.2 57.4 88.4 67.4 89.1 80 C89.6 92.6 88.6 104 86.4 110 C84.6 113.8 77.6 114.8 58.7 114.6 ${SEAM}`,
};

export function MushFace({ size = 96, talking = false }) {
  const line = { fill: "none", stroke: INK, strokeLinecap: "round", strokeLinejoin: "round" };
  return (
    <svg className={`halo-mush-face ${talking ? "is-talking" : ""}`} width={size} height={size} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <ellipse cx="59" cy="116.6" rx="31" ry="3.2" fill="#0c0d13" opacity=".45" />
      {/* shoes peek out under the hem: red on the blue side, blue on the red side */}
      <path d={MUSH.shoeR} fill={MU.red} stroke={INK} strokeWidth="2.6" />
      <path d={MUSH.shoeB} fill={MU.blue} stroke={INK} strokeWidth="2.6" />
      {/* the onesie: two halves meeting on the seam */}
      <path d={MUSH.blue} fill={MU.blue} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d={MUSH.red} fill={MU.red} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      {/* sleeves hang at his sides: one inner line each, a mitten at the cuff */}
      <path d="M38.6 60.5 C36.2 67.5 34.8 73.5 34.3 79.4" {...line} strokeWidth="2.4" />
      <path d="M80.4 60 C82.9 66.8 84.4 72.6 85 78.8" {...line} strokeWidth="2.4" />
      <path d={MUSH.mittR} fill={MU.red} stroke={INK} strokeWidth="2.4" />
      <path d={MUSH.mittB} fill={MU.blue} stroke={INK} strokeWidth="2.4" />
      {/* three stitches across the seam, three yellow buttons (top one biggest), the yellow triangle at the collar */}
      <path d="M56 76.6 L61.4 78.2 M55.8 89 L61.6 90.2 M55.6 101.2 L61.2 102.6" {...line} strokeWidth="2" />
      <path d={blob(47.6, 70.8, 3.3, 3.1, 0.2, 0.06, 7)} fill={MU.yellow} stroke={INK} strokeWidth="2" />
      <path d={blob(48.3, 82.4, 2.4, 2.3, 0.8, 0.06, 7)} fill={MU.yellow} stroke={INK} strokeWidth="2" />
      <path d={blob(48.6, 94.6, 2.2, 2.1, 1.4, 0.06, 7)} fill={MU.yellow} stroke={INK} strokeWidth="2" />
      <path d="M58.8 62.6 L62.2 68 L55.6 68.2 Z" fill={MU.yellow} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      {/* antenna: a stalk and a blue ball, standing on a red box at the helmet's top left */}
      <path d="M39 12.4 L35.2 8.6" {...line} strokeWidth="2.4" />
      <path d={MUSH.ball} fill={MU.blue} stroke={INK} strokeWidth="2.4" />
      {/* the helmet: a white ring, the moon face inside it */}
      <path d={MUSH.helmet} fill={MU.ring} stroke={INK} strokeWidth="3" />
      <path d="M35.8 11.6 L42.6 8.6 L45.2 15.2 L38.4 18.2 Z" fill={MU.red} stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
      <path d={MUSH.face} fill={MU.face} stroke={INK} strokeWidth="2.4" />
      {MUSH.spots.map((d, i) => <path key={i} d={d} fill={MU.spot} stroke={MU.spotEdge} strokeWidth=".8" />)}
      {/* eyes: the big pale-blue one (his right), the small pink one; they blink together */}
      <g className="halo-mush-eye">
        <path d={MUSH.eyeBig} fill={MU.eyeBig} stroke={INK} strokeWidth="2.6" />
        <circle cx="46" cy="34.8" r="1.25" fill={INK} />
      </g>
      <g className="halo-mush-eye">
        <path d={MUSH.eyeSmall} fill={MU.eyeSmall} stroke={MU.eyeRim} strokeWidth="2.4" />
        <path d={MUSH.eyeSmall} fill="none" stroke={INK} strokeWidth="1.4" />
        <circle cx="66.8" cy="32.6" r="1.25" fill={INK} />
      </g>
      {/* a "c" for a nose, a small smile low on the right */}
      <path d="M58.6 34.4 C56.2 35.4 56 39.8 58.8 40.8" {...line} strokeWidth="2.2" />
      <path className="halo-mush-mouth" d="M63.4 50.4 Q66.8 54.6 70.4 50 Q66.8 52.4 63.4 50.4 Z" fill="#5a2a36" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

// the attack, drawn: A 5 against D 3 wins; an empty lane lets you through to a ring
function AttackArt() {
  return (
    <svg className="halo-learn-art" viewBox="0 0 360 200" role="img" aria-label="Your front card's A against their front card's D. An empty lane lets you hit a ring.">
      <rect width="360" height="200" fill="#14161f" />
      {[0, 1].map((k) => {
        const x = 40 + k * 170;
        return (
          <g key={k}>
            <rect x={x} y="40" width="58" height="58" rx="4" fill="#33384d" stroke="#f6c744" strokeWidth="2" />
            <text x={x + 29} y="74" fill="#ece9dd" fontSize="13" textAnchor="middle">A 5</text>
            <path d={`M${x + 64} 69 L${x + 100} 69`} stroke="#f6c744" strokeWidth="3" markerEnd="url(#halo-arrow)" />
            {k === 0
              ? <><rect x={x + 106} y="40" width="58" height="58" rx="4" fill="#33384d" stroke="#6a7090" strokeWidth="2" /><text x={x + 135} y="74" fill="#ece9dd" fontSize="13" textAnchor="middle">D 3</text><text x={x + 82} y="128" fill="#ece9dd" fontSize="12" textAnchor="middle">5 beats 3: theirs goes</text></>
              : <><rect x={x + 106} y="40" width="58" height="58" rx="4" fill="#1f2333" stroke="#3a3f52" strokeDasharray="4 4" /><ellipse cx={x + 135} cy="150" rx="26" ry="7" fill="none" stroke="#e53935" strokeWidth="4" /><text x={x + 82} y="128" fill="#ece9dd" fontSize="12" textAnchor="middle">empty lane: a ring goes out</text></>}
          </g>
        );
      })}
      <defs><marker id="halo-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="#f6c744" /></marker></defs>
    </svg>
  );
}

// cards side by side, each with a short caption under it
const CardRow = ({ items }) => (
  <ul className="halo-mush-cards">
    {items.map(([id, cap]) => <li key={id}><HaloCard id={id} /><span className="halo-mush-cap">{cap}</span></li>)}
  </ul>
);

// 1 on 1 against 3 on 3: alone you walk your own road; on a team every team-mate's road counts, so back the closest
function TeamArt() {
  const planet = (x, y, c, gold, label, bar) => (
    <g key={`${x}-${y}`}>
      <ellipse cx={x} cy={y} rx="22" ry="7" fill="none" stroke={c} strokeWidth="3" transform={`rotate(-16 ${x} ${y})`} />
      <circle cx={x} cy={y} r="13" fill="#2a2f40" stroke={gold ? "#f6c744" : "#e8e6dc"} strokeWidth={gold ? 3 : 1.5} />
      {label && <text x={x + 34} y={y + 4} fill="#ece9dd" fontSize="10.5">{label}</text>}
      {bar != null && <><rect x={x + 34} y={y + 9} width="40" height="4" rx="2" fill="#3a3f52" /><rect x={x + 34} y={y + 9} width={40 * bar} height="4" rx="2" fill="#f6c744" /></>}
    </g>
  );
  return (
    <svg className="halo-learn-art" viewBox="0 0 360 210" role="img" aria-label="Left: 1 on 1, your road against one rival. Right: 3 on 3, three planets a side; help the team-mate closest to winning.">
      <rect width="360" height="210" fill="#14161f" />
      <text x="72" y="26" fill="#f6c744" fontSize="14" textAnchor="middle" fontFamily="Georgia,serif">1 on 1</text>
      <circle cx="42" cy="82" r="13" fill="#2a2f40" stroke="#f6c744" strokeWidth="3" />
      <ellipse cx="42" cy="82" rx="22" ry="7" fill="none" stroke="#c58af9" strokeWidth="3" transform="rotate(-16 42 82)" />
      <circle cx="104" cy="82" r="13" fill="#2a2f40" stroke="#e8e6dc" strokeWidth="1.5" />
      <ellipse cx="104" cy="82" rx="22" ry="7" fill="none" stroke="#ef5350" strokeWidth="3" transform="rotate(-16 104 82)" />
      <text x="73" y="86" fill="#b9b6a8" fontSize="10" textAnchor="middle">vs</text>
      <text x="42" y="112" fill="#ece9dd" fontSize="10.5" textAnchor="middle">you</text>
      <text x="104" y="112" fill="#ece9dd" fontSize="10.5" textAnchor="middle">rival</text>
      <text x="72" y="150" fill="#ece9dd" fontSize="10.5" textAnchor="middle">Religion: 2 converts</text>
      <text x="72" y="167" fill="#ece9dd" fontSize="10.5" textAnchor="middle">Politics: 1 treaty</text>
      <text x="72" y="190" fill="#b9b6a8" fontSize="10" textAnchor="middle">your road, alone</text>
      <line x1="146" y1="14" x2="146" y2="196" stroke="#3a3f52" />
      <text x="254" y="26" fill="#f6c744" fontSize="14" textAnchor="middle" fontFamily="Georgia,serif">3 on 3</text>
      {planet(176, 62, "#c58af9", false, "you", 0.3)}
      {planet(176, 114, "#26c6da", true, "mate", 0.85)}
      {planet(176, 166, "#8bc34a", false, "mate", 0.5)}
      {[62, 114, 166].map((y, k) => planet(336, y, ["#ef5350", "#90a4ae", "#ff9800"][k], false, null))}
      <path d="M163 74 C150 86 150 96 160 104" fill="none" stroke="#f6c744" strokeWidth="2.5" markerEnd="url(#halo-arrow-t)" />
      <text x="256" y="111" fill="#f6c744" fontSize="10.5">back the</text>
      <text x="256" y="124" fill="#f6c744" fontSize="10.5">closest</text>
      <text x="336" y="198" fill="#b9b6a8" fontSize="10" textAnchor="middle">their team</text>
      <defs><marker id="halo-arrow-t" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="#f6c744" /></marker></defs>
    </svg>
  );
}

const Combo = () => (
  <div className="halo-mush-combo">
    <HaloCard id="frigate" /><b aria-hidden="true">+</b><HaloCard id="toadstool" /><b aria-hidden="true">+</b><HaloCard id="kInd_soldier" /><b aria-hidden="true">=</b><HaloCard id="misadventure" finish="lenticular" />
  </div>
);

// the seven road commanders: the hits of the seven starter Poptarts
const Commanders = () => (
  <div className="halo-mush-combo halo-mush-cmds">{Object.values(HALO_STARTERS).map((s) => <HaloCard key={s.cmd} id={s.cmd} finish="lenticular" />)}</div>
);

// each step: what Mush says (one or two short lines), and what you look at
const STEPS = (art) => [
  { say: ["Mush.", "You're new. I'll show you. Quick."], act: "He shadow-boxes. Badly.", show: art.planets },
  { say: ["That's your planet. Seven rings.", "Every lit ring: one card, one ECON a turn."], act: "Lose them all, or lose your commander, and you're out.", show: art.planet },
  { say: ["Nine squares. Three lanes.", "The front card fights. The front card blocks."], show: art.grid },
  { say: ["Your A hits their D. Higher stays. A tie, both go.", "Empty lane? Walk in. Put out a ring."], show: <AttackArt /> },
  { say: ["Some cards reach.", "Next lane. From the back. The one behind."], act: "Everything else hits straight ahead.",
    show: <CardRow items={[["caracole", "FLANK: the lane next door"], ["hwacha", "VOLLEY: fires from any row"], ["corvus", "PIERCE: the card behind"]]} /> },
  { say: ["Three on three, you're not alone.", "Help them."], act: "Support cards work on a team-mate's planet as well as yours.",
    show: <CardRow items={[["varangian", "ALLY: fights on a mate's square"], ["vittles", "+3 ECON to a mate"], ["testudo", "Shields a mate's rings"], ["carroccio", "BANNER: +1 A, whole team's lane"]]} /> },
  { say: ["Seven roads. Seven different games.", "Each hangs on a ring. Put it out, the road's cut."], show: art.roads, wide: true },
  { say: ["One on one: one treaty wins. Two converts win.", "Three on three, your team-mates' roads count too."], act: "Back the one closest to winning. Their win is yours.", show: <TeamArt /> },
  { say: ["Three in a line fuse into one.", "No third piece? Armillaria. My fungus."], act: "Every combo card names its other two pieces. Mix two decks and look for them.", show: <Combo /> },
  { say: ["Pick your road.", "Your first Poptart is its starter."], act: "The other six are still yours to play.", show: <Commanders />, last: true },
];

export function MushTalk({ art, binder, setBinder }) {
  const steps = STEPS(art), [i, setI] = useState(0), s = steps[i];
  const finish = () => { if (!binder.learned) setBinder({ ...binder, learned: true }); };
  const end = binder.packsOpened ? ["/halo/deck", "To Draft Night"] : binder.road ? ["/halo/packs", "Open your starter Poptart"] : ["/halo/packs", "Pick your road ▸"];
  return (
    <section className="halo-mush" id="mush" aria-labelledby="halo-mush-title">
      <h2 id="halo-mush-title">Mush shows you how to play</h2>
      <div className={`halo-mush-stage ${s.wide ? "is-wide" : ""}`}>
        <div className="halo-mush-talk">
          <MushFace talking />
          <div className="halo-mush-bubble" aria-live="polite">
            {s.say.map((l, k) => <p key={k}>{l}</p>)}
            {s.act && <p className="halo-mush-act">{s.act}</p>}
          </div>
        </div>
        {s.show && <div className="halo-mush-show">{s.show}</div>}
      </div>
      <div className="halo-mush-nav">
        <span className="halo-mush-dots" aria-label={`Step ${i + 1} of ${steps.length}`}>{steps.map((_, k) => <i key={k} className={k === i ? "on" : k < i ? "seen" : ""} />)}</span>
        {i > 0 && <button className="halo-link" onClick={() => setI(i - 1)}>Back</button>}
        {!s.last && <button className="halo-button" onClick={() => setI(i + 1)}>Next</button>}
        {s.last && <Link className="halo-button" to={end[0]} onClick={finish}>{end[1]}</Link>}
        {!s.last && <button className="halo-link" onClick={() => setI(steps.length - 1)}>Skip</button>}
      </div>
    </section>
  );
}

// ----- the progression: from new player to the whole cast beaten. One list, read by the path strip and the cheer.
export function pathSteps(binder) {
  const beatenMap = binder.beaten || {}, beaten = Object.keys(beatenMap).length, cast = HALO_BOSSES.length;
  const deckOK = !!binder.deck && deckProblems(binder, binder.deck).length === 0;
  const first = HALO_BOSSES.find((b) => !beatenMap[b.key]);
  const road = binder.road && ROAD_BY[binder.road];
  return [
    { key: "learn", t: "Learn with Mush", done: !!binder.learned, to: "/halo", reward: "Ten short steps. He keeps it quick." },
    { key: "road", t: road ? `Road: ${road.ring}` : "Choose your road", done: !!road, to: "/halo/packs", reward: "Your first Poptart becomes that road's starter: its commander and seven cards.", color: road?.color },
    { key: "packs", t: "Open 3 Poptarts", done: binder.packsOpened >= 3 || (binder.packsOpened > 0 && binder.packsLeft === 0), to: "/halo/packs", reward: "Twenty-four cards for your binder." },
    { key: "deck", t: "Build a deck", done: deckOK, to: "/halo/deck", reward: "A 20-card deck the table will play, road perks and all." },
    { key: "bounty", t: `First bounty${first && !beaten ? `: ${first.who}` : ""}`, done: beaten > 0, to: "/halo/bazaar", reward: `+${WIN_POINTS + BOUNTY} points. ${PACK_PRICE} buy a Poptart.` },
    { key: "roadwin", t: road ? `Win once by ${road.ring}` : "Win once by your road", done: !!(road && (binder.roadWins || {})[binder.road]), to: "/halo/bazaar", reward: road ? `${road.how.split(".")[0]}.` : "Pick a road first.", color: road?.color },
    { key: "cast", t: `Beat the cast ${beaten}/${cast}`, done: beaten >= cast, to: "/halo/bazaar", reward: `+${WIN_POINTS + BOUNTY} points for every new face.` },
  ];
}

// a number in Mook's digit colours (numbers only)
const Num = ({ n }) => {
  const d = Number(String(n).slice(-1));
  return <span className="halo-path-n" aria-hidden="true" style={{ background: SYN[d], color: [3, 8].includes(d) ? "#1b1e29" : "#fff" }}>{n}</span>;
};

export function HaloPath({ binder, compact = false }) {
  const steps = pathSteps(binder), next = steps.findIndex((s) => !s.done), n = steps[next];
  const doneCount = steps.filter((s) => s.done).length;
  return (
    <div className={`halo-progress ${compact ? "is-compact" : ""}`}>
      <ol className="halo-path" aria-label="Your road through HALO">
        {steps.map((s, k) => (
          <li key={s.key} className={s.done ? "done" : k === next ? "next" : ""} style={s.color ? { "--ring": s.color } : undefined}>
            <Link to={s.to}>{s.done ? <span className="halo-path-n is-done" aria-hidden="true">✓</span> : <Num n={k + 1} />}{s.t}{k === next && <span className="sr-only"> (next)</span>}{s.done && <span className="sr-only"> (done)</span>}</Link>
          </li>
        ))}
      </ol>
      {!compact && (
        <div className="halo-next">
          <div className="halo-next-meter" role="img" aria-label={`${doneCount} of ${steps.length} steps done`}><span style={{ width: `${(doneCount / steps.length) * 100}%` }} /></div>
          {n ? (
            <p><span className="halo-next-k">Next</span><b>{n.t}</b><span className="halo-next-r">{n.reward}</span></p>
          ) : (
            <p><span className="halo-next-k">All done</span><b>The whole cast is beaten.</b><span className="halo-next-r">Mush nods. Once.</span></p>
          )}
          <span className="halo-next-pts"><b>{binder.points || 0}</b> pts</span>
          {n && <Link className="halo-button" to={n.to}>Go ▸</Link>}
        </div>
      )}
    </div>
  );
}

// a step just came true: a gold card rises, and points to the next step
export function HaloCheer({ step, next, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 7000); return () => clearTimeout(t); }, [step, onClose]);
  return (
    <div className="halo-cheer" role="status" aria-live="polite">
      <MushFace size={56} />
      <div>
        <p className="halo-cheer-k">✓ Done</p>
        <p className="halo-cheer-t">{step.t}</p>
        <p className="halo-cheer-n">{next ? <>Next: <Link to={next.to} onClick={onClose}>{next.t} ▸</Link></> : "That's all of it. Good."}</p>
      </div>
      <button className="halo-cheer-x" onClick={onClose} aria-label="Close">×</button>
    </div>
  );
}
