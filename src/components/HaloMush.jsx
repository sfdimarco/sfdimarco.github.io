import { useState } from "react";
import { Link } from "react-router-dom";
import HaloCard from "./HaloCard.jsx";
import { HALO_BOSSES } from "../content/haloCards.js";
import { deckProblems } from "../lib/haloBinder.js";

// 11-23 🆕 (Claude's, for Mook's tick): Mush shows a new player how to play, and the path from "never played" to "beat the cast".
// Mush is mostly quiet in the show (SHOW-BIBLE 02-CHARACTERS), so his lines are short.

// Mush: a marshmallow puffball, a jingasa cap shading big eyes, a smirk (C Mook). Squashy: he bobs.
export function MushFace({ size = 96, talking = false }) {
  return (
    <svg className={`halo-mush-face ${talking ? "is-talking" : ""}`} width={size} height={size} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <ellipse cx="60" cy="112" rx="34" ry="6" fill="#0c0d13" opacity=".5" />
      <path d="M26 104 C18 78 24 54 60 52 C96 54 102 78 94 104 Z" fill="#f7f3ea" stroke="#1c1a21" strokeWidth="3.5" />
      <path d="M14 56 C30 30 90 30 106 56 C92 50 28 50 14 56 Z" fill="#c9a26a" stroke="#1c1a21" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M60 24 L60 34" stroke="#1c1a21" strokeWidth="3.5" strokeLinecap="round" />
      <ellipse cx="46" cy="70" rx="9" ry="11" fill="#fdfcf5" stroke="#1c1a21" strokeWidth="3" />
      <ellipse cx="74" cy="70" rx="9" ry="11" fill="#fdfcf5" stroke="#1c1a21" strokeWidth="3" />
      <circle cx="48" cy="72" r="4" fill="#1c1a21" /><circle cx="76" cy="72" r="4" fill="#1c1a21" />
      <circle cx="49.5" cy="70" r="1.4" fill="#fdfcf5" /><circle cx="77.5" cy="70" r="1.4" fill="#fdfcf5" />
      <path className="halo-mush-mouth" d="M50 90 Q62 94 70 87" fill="none" stroke="#1c1a21" strokeWidth="3" strokeLinecap="round" />
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

const Combo = () => (
  <div className="halo-mush-combo">
    <HaloCard id="frigate" /><b aria-hidden="true">+</b><HaloCard id="toadstool" /><b aria-hidden="true">+</b><HaloCard id="kInd_soldier" /><b aria-hidden="true">=</b><HaloCard id="misadventure" finish="lenticular" />
  </div>
);

// each step: what Mush says (one or two short lines), and what you look at
const STEPS = (art) => [
  { say: ["Mush.", "You're new. I'll show you. Quick."], act: "He shadow-boxes. Badly.", show: art.planets },
  { say: ["That's your planet. Seven rings.", "Every lit ring is one card and one ECON a turn."], act: "Lose them all, or lose your commander, and you're out.", show: art.planet },
  { say: ["Cards go on your nine squares. Three lanes.", "The front card fights. The front card blocks."], show: art.grid },
  { say: ["Your A hits their D. Higher stays. A tie, both go.", "Empty lane? Walk in. Put out a ring."], show: <AttackArt /> },
  { say: ["Three in a line fuse into one.", "Mook's frigate. My guards. A Soldier. That's The Misadventure."], act: "Every combo card tells you its other two pieces. Mix two decks and look for them.", show: <Combo /> },
  { say: ["No third piece? Armillaria. My fungus.", "Put it in the line and it fills the gap."], show: <div className="halo-mush-combo"><HaloCard id="mycelium" /></div> },
  { say: ["Seven ways to win. Each one hangs on a ring.", "Put out their ring, you cut their road."], show: art.roads },
  { say: ["Now: three Poptarts. Build a deck from what you pull.", "Then come play us. Start with Leo. He's half asleep."], show: null, last: true },
];

export function MushTalk({ art, binder, setBinder }) {
  const steps = STEPS(art), [i, setI] = useState(0), s = steps[i];
  const finish = () => { if (!binder.learned) setBinder({ ...binder, learned: true }); };
  return (
    <section className="halo-mush" aria-labelledby="halo-mush-title">
      <h2 id="halo-mush-title">Mush shows you how to play</h2>
      <div className="halo-mush-stage">
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
        {s.last && <Link className="halo-button" to="/halo/packs" onClick={finish}>{binder.packsOpened ? "Your Poptarts" : "Open your starter Poptarts"}</Link>}
        {!s.last && <button className="halo-link" onClick={() => setI(steps.length - 1)}>Skip</button>}
      </div>
    </section>
  );
}

// the road from new player to the whole cast beaten: each step lit when it's done, the next one gold
export function HaloPath({ binder }) {
  const beaten = Object.keys(binder.beaten || {}).length, cast = HALO_BOSSES.length;
  const deckOK = !!binder.deck && deckProblems(binder, binder.deck).length === 0;
  const first = HALO_BOSSES.find((b) => !(binder.beaten || {})[b.key]);
  const steps = [
    { t: "Learn with Mush", done: !!binder.learned, to: "/halo" },
    { t: "Open 3 Poptarts", done: binder.packsOpened >= 3 || (binder.packsOpened > 0 && binder.packsLeft === 0), to: "/halo/packs" },
    { t: "Build a 20-card deck", done: deckOK, to: "/halo/deck" },
    { t: `First bounty${first && !beaten ? `: ${first.who}` : ""}`, done: beaten > 0, to: "/halo/bazaar" },
    { t: `Beat the whole cast (${beaten}/${cast})`, done: beaten >= cast, to: "/halo/bazaar" },
  ];
  const next = steps.findIndex((s) => !s.done);
  return (
    <ol className="halo-path" aria-label="Your road through HALO">
      {steps.map((s, k) => (
        <li key={s.t} className={s.done ? "done" : k === next ? "next" : ""}>
          <Link to={s.to}><span className="halo-path-n" aria-hidden="true">{s.done ? "✓" : k + 1}</span>{s.t}{k === next && <span className="sr-only"> (next)</span>}</Link>
        </li>
      ))}
    </ol>
  );
}
