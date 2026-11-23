import { useEffect, useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import HaloCard, { CardBack } from "../components/HaloCard.jsx";
import { HALO_CARDS, HALO_BASICS } from "../content/haloCards.js";
import {
  BY_ID, SET_SIZE, DECK_SIZE, STARTER_PACKS, loadBinder, saveBinder, openPack, newNight, bestFinish,
  deckProblems, fillWithBasics, playLink,
} from "../lib/haloBinder.js";
import "./Halo.css";

// The game itself is one self-contained file: public/halo/play/index.html.
// It is built from the rules engine in .geo/halo (node build-playtest.js → HALO-PLAYTEST.html) and copied here.
const playRoot = `${import.meta.env.BASE_URL}halo/play/`;

// the seven ways to win: each hangs on one of a planet's seven rings. Colours are the game table's road tags.
const ROADS = [
  { ring: "Economy", road: "Buy the win", how: "Bank ECON and pay the price in one go.", color: "#f6c744" },
  { ring: "Industry", road: "The last planet lit", how: "Knock every rival planet dark.", color: "#ef5350" },
  { ring: "Science", road: "The great machine", how: "A Core in the middle, eight Parts around it.", color: "#26c6da" },
  { ring: "Food", road: "The harvest", how: "Grow your rings back, turn after turn.", color: "#8bc34a" },
  { ring: "Population", road: "The crowd", how: "Fill all nine squares with your people.", color: "#ff9800" },
  { ring: "Religion", road: "Convert the table", how: "Yours lit, every rival's dark.", color: "#c58af9" },
  { ring: "Politics", road: "The treaty", how: "Send envoys; hold your treaties.", color: "#90a4ae" },
];

function SevenPlanets() {
  const cx = 310, cy = 224, R = 158;
  return (
    <svg className="halo-art" viewBox="0 0 620 448" aria-hidden="true" focusable="false">
      <rect width="620" height="448" fill="#14161f" />
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="#3a3f52" strokeDasharray="3 9" />
      <circle cx={cx} cy={cy} r="34" fill="#f6c744" />
      <circle cx={cx} cy={cy} r="48" fill="none" stroke="#f6c744" opacity=".25" strokeWidth="6" />
      {ROADS.map((r, i) => {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / 7, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
        return (
          <g key={r.ring}>
            <ellipse cx={x} cy={y} rx="34" ry="11" fill="none" stroke={r.color} strokeWidth="4" transform={`rotate(-18 ${x} ${y})`} />
            <circle cx={x} cy={y} r="19" fill="#2a2f40" stroke="#e8e6dc" strokeWidth="2" />
          </g>
        );
      })}
    </svg>
  );
}

// one planet wearing its seven rings, each named
function OnePlanet() {
  return (
    <svg className="halo-learn-art" viewBox="0 0 360 250" role="img" aria-label="A planet with its seven rings">
      <rect width="360" height="250" fill="#14161f" />
      {ROADS.map((r, i) => (
        <ellipse key={r.ring} cx="120" cy="125" rx={58 + i * 9} ry={14 + i * 3.2} fill="none" stroke={r.color} strokeWidth="4" transform="rotate(-16 120 125)" opacity={i === 2 ? 0.25 : 1} strokeDasharray={i === 2 ? "4 5" : undefined} />
      ))}
      <circle cx="120" cy="125" r="40" fill="#2a2f40" stroke="#e8e6dc" strokeWidth="2" />
      {ROADS.map((r, i) => (
        <g key={r.ring}>
          <rect x="236" y={30 + i * 28} width="14" height="7" rx="3.5" fill={r.color} opacity={i === 2 ? 0.25 : 1} />
          <text x="258" y={37 + i * 28} fill={i === 2 ? "#7d7a6e" : "#ece9dd"} fontSize="14">{r.ring}{i === 2 ? " (dark)" : ""}</text>
        </g>
      ))}
    </svg>
  );
}

// your 3 × 3 grid: three lanes, the front card of each lane fights
function TheGrid() {
  const sq = (c, r) => ({ x: 40 + c * 62, y: 30 + r * 62 });
  const filled = { "0,0": "A 3 · D 4", "1,0": "D 4", "1,1": "A 2 · D 2", "2,2": "A 5 · D 5" };
  return (
    <svg className="halo-learn-art" viewBox="0 0 360 250" role="img" aria-label="Your grid: three lanes, the front card of each lane fights">
      <rect width="360" height="250" fill="#14161f" />
      {[0, 1, 2].map((r) => [0, 1, 2].map((c) => {
        const p = sq(c, r), f = filled[`${c},${r}`];
        return (
          <g key={`${c}${r}`}>
            <rect x={p.x} y={p.y} width="54" height="54" rx="4" fill={f ? "#33384d" : "#1f2333"} stroke={f ? (r === 0 || (c === 2 && r === 2) ? "#f6c744" : "#6a7090") : "#3a3f52"} strokeWidth="2" />
            {f && <text x={p.x + 27} y={p.y + 32} fill="#ece9dd" fontSize="10" textAnchor="middle">{f}</text>}
          </g>
        );
      }))}
      {["lane 1", "lane 2", "lane 3"].map((l, i) => <text key={l} x={67 + i * 62} y="22" fill="#b9b6a8" fontSize="11" textAnchor="middle">{l}</text>)}
      <text x="235" y="58" fill="#f6c744" fontSize="12">← front row:</text>
      <text x="235" y="74" fill="#ece9dd" fontSize="12">these fight</text>
      <text x="235" y="92" fill="#ece9dd" fontSize="12">and block</text>
      <text x="235" y="178" fill="#ece9dd" fontSize="12">lane 3's front</text>
      <text x="235" y="194" fill="#ece9dd" fontSize="12">card is at the</text>
      <text x="235" y="210" fill="#ece9dd" fontSize="12">back: it still fights</text>
      <text x="40" y="236" fill="#b9b6a8" fontSize="11">An empty lane lets a rival through to your rings.</text>
    </svg>
  );
}

const TURN = [
  { n: 1, t: "Draw and earn", d: "Each lit ring gives you one card and one ECON. ECON you don't spend stays." },
  { n: 2, t: "Play", d: "Pay a card's ECON and put it on an empty square of your 3 × 3 grid. It can fight this turn." },
  { n: 3, t: "Attack", d: "The front card of each lane hits once: your A against their D. Higher stays, a tie loses both. Hit an empty lane and you put out one of their rings." },
  { n: 4, t: "Grow", d: "The growth (DEV) on your grid adds up. Enough of it and one dark ring lights again." },
];

function SubNav({ binder }) {
  const found = Object.keys(binder.owned).length;
  return (
    <nav className="halo-sub" aria-label="HALO">
      <NavLink end to="/halo">Learn</NavLink>
      <NavLink to="/halo/packs">Poptarts{binder.packsLeft > 0 && <span className="halo-pip">{binder.packsLeft}</span>}</NavLink>
      <NavLink to="/halo/binder">Binder <small>{found}/{SET_SIZE}</small></NavLink>
      <NavLink to="/halo/deck">Draft Night</NavLink>
      <a className="halo-sub-play" href={playRoot}>Play ▸</a>
    </nav>
  );
}

function Learn({ binder }) {
  return (
    <>
      <section className="halo-hero" aria-labelledby="halo-title">
        <div className="halo-intro">
          <p className="halo-kicker"><span className="halo-badge">PLAYTEST</span> The card game from Mook &amp; Mush</p>
          <h1 id="halo-title">HALO</h1>
          <p className="halo-deck">Seven planets round a sun. Seven rings on each. Seven ways to win.</p>
          <p className="halo-summary">Learn it in a minute below, open your three starter Poptarts, build a deck from what you pull, and take it to the table against bots.</p>
          <div className="halo-actions">
            <Link className="halo-button" to="/halo/packs">{binder.packsOpened ? "Your Poptarts" : "Open your starter Poptarts"}</Link>
            <a href={playRoot}>or play a show deck now</a>
          </div>
          <p className="halo-note">Runs in this browser, nothing to install. Balanced by bots so far, not by people: tell me what feels off.</p>
        </div>
        <figure className="halo-plate">
          <SevenPlanets />
          <figcaption>Seven planets, each wearing its seven rings</figcaption>
        </figure>
      </section>

      <section className="halo-learn" aria-labelledby="halo-learn-title">
        <h2 id="halo-learn-title">Learn to play</h2>
        <div className="halo-learn-grid">
          <figure>
            <OnePlanet />
            <figcaption><b>1 · Your planet has seven rings.</b> Every lit ring feeds you each turn. When a ring is put out, it stops. Lose them all, or lose your commander, and you are out.</figcaption>
          </figure>
          <figure>
            <TheGrid />
            <figcaption><b>2 · Your cards go on a 3 × 3 grid.</b> Three lanes. The front card of each lane is the one that fights and the one that blocks.</figcaption>
          </figure>
        </div>
        <h3 className="halo-h3">3 · A turn</h3>
        <ol className="halo-turn">
          {TURN.map((s) => <li key={s.n}><span className="halo-step">{s.n}</span><div><b>{s.t}</b><p>{s.d}</p></div></li>)}
        </ol>
        <p className="halo-roads-lede">Your commander stands at your shoulder: safe there, but you can put them on the grid to fight. Once a game they can use their big move.</p>
      </section>

      <section className="halo-roads" aria-labelledby="halo-roads-title">
        <h2 id="halo-roads-title">4 · Seven ways to win</h2>
        <p className="halo-roads-lede">Every road hangs on one ring. Put out a rival’s ring and you cut their road.</p>
        <ul className="halo-road-list">
          {ROADS.map((r) => (
            <li key={r.ring}>
              <span className="halo-ring" style={{ background: r.color }} aria-hidden="true" />
              <div><h3>{r.road}</h3><p><strong>{r.ring} ring.</strong> {r.how}</p></div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

// ----- the pack opening: sealed → torn → cards come out face down → flip one at a time, the hit last
function Packs({ binder, setBinder }) {
  const [phase, setPhase] = useState("sealed"); // sealed · torn · done
  const [cards, setCards] = useState([]);
  const [shown, setShown] = useState(0);
  const [focus, setFocus] = useState(null);
  const [burst, setBurst] = useState(null); // "flip them all" ripples from this card

  const tear = () => {
    const [b, pulled] = openPack(binder);
    if (!pulled) return;
    setBinder(b); setCards(pulled); setShown(0); setBurst(null); setPhase("torn");
  };
  const flipNext = () => setShown((s) => Math.min(cards.length, s + 1));
  useEffect(() => { if (phase === "torn" && shown === cards.length && cards.length) setPhase("done"); }, [shown, cards.length, phase]);
  const next = () => { setPhase("sealed"); setCards([]); setShown(0); };
  const opened = binder.packsOpened, hit = cards[cards.length - 1];

  return (
    <section className="halo-packs" aria-labelledby="halo-packs-title">
      <header className="halo-page-head">
        <h1 id="halo-packs-title">Poptarts</h1>
        <p>Eight cards a pack: five common, two uncommon, and one hit (a rare or a commander) that comes last, in a lenticular finish. Now and then the hit is a <b>First Edition</b>: metal, with an onyx gem.</p>
      </header>

      {phase === "sealed" && binder.packsLeft > 0 && (
        <div className="halo-pack-stage">
          <button className="halo-wrapper" onClick={tear} aria-label={`Tear open pack ${opened + 1}`}>
            <span className="halo-wrapper-crimp" aria-hidden="true" />
            <CardBack />
            <span className="halo-wrapper-label">STARTER POPTART · 8 CARDS</span>
            <span className="halo-wrapper-tear">TEAR HERE ✂</span>
          </button>
          <p className="halo-pack-left">{binder.packsLeft} {binder.packsLeft === 1 ? "pack" : "packs"} to open · tap the pack to tear it</p>
        </div>
      )}

      {phase !== "sealed" && (
        <div className="halo-pack-stage">
          <div className="halo-torn" aria-hidden="true"><span className="halo-torn-strip" /></div>
          <div className="halo-spread" role="list">
            {cards.map((c, i) => {
              const up = i < shown;
              return (
                <div role="listitem" key={i} className={`halo-slot ${up ? "up" : ""} ${c.hit ? "is-hit" : ""}`} style={{ "--i": i, "--fd": burst != null && i >= burst ? `${(i - burst) * 0.11}s` : "0s" }}>
                  <div className="halo-flip">
                    {up
                      ? <div className="halo-flip-face"><HaloCard id={c.id} finish={c.finish} onClick={() => setFocus(c)} /></div>
                      : <div className="halo-flip-back"><HaloCard id={c.id} state="back" onClick={i === shown ? flipNext : undefined} /></div>}
                  </div>
                  {up && c.hit && <span className={`halo-hit-tag ${c.finish}`}>{c.finish === "first" ? "FIRST EDITION" : "HIT · LENTICULAR"}</span>}
                  {up && !c.hit && binder.owned[c.id] === 1 && <span className="halo-new-tag">NEW</span>}
                </div>
              );
            })}
          </div>
          <div className="halo-pack-actions">
            {phase === "torn" && <><button className="halo-button" onClick={flipNext}>{shown === cards.length - 1 ? "Flip the hit" : "Flip the next card"}</button><button className="halo-link" onClick={() => { setBurst(shown); setShown(cards.length); }}>Flip them all</button></>}
            {phase === "done" && (
              <>
                <p className="halo-pack-say">You pulled <b>{BY_ID[hit.id].name}</b>{hit.finish === "first" ? ", a First Edition!" : "."}</p>
                {binder.packsLeft > 0
                  ? <button className="halo-button" onClick={next}>Next pack ({binder.packsLeft} left)</button>
                  : <Link className="halo-button" to="/halo/deck">Build your Draft Night deck</Link>}
                <Link to="/halo/binder">See the binder</Link>
              </>
            )}
          </div>
        </div>
      )}

      {phase === "sealed" && binder.packsLeft === 0 && (
        <div className="halo-empty">
          <p>All {opened} packs are open. {Object.keys(binder.owned).length} of {SET_SIZE} cards found.</p>
          <div className="halo-actions">
            <Link className="halo-button" to="/halo/deck">Build your Draft Night deck</Link>
            <button className="halo-link" onClick={() => setBinder(newNight(binder))}>Another Draft Night: three more packs</button>
          </div>
        </div>
      )}
      {focus && <CardModal card={focus} onClose={() => setFocus(null)} />}
    </section>
  );
}

function CardModal({ card, onClose }) {
  useEffect(() => {
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  const c = BY_ID[card.id];
  return (
    <div className="halo-modal" role="dialog" aria-modal="true" aria-label={c.name} onClick={onClose}>
      <div className="halo-modal-card" onClick={(e) => e.stopPropagation()}>
        <HaloCard id={card.id} finish={card.finish} className="hc-big" />
        <div className="halo-modal-words">
          <h2>{c.name}</h2>
          <p>{c.text || "A plain card: it fights with its A and blocks with its D."}</p>
          <p className="halo-dim">From the deck of {c.who}. {c.fused ? "It is made on the table, not played: it cannot go in a deck." : c.type === "commander" ? "A commander: it leads a deck." : ""}</p>
          <button className="halo-button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function Binder({ binder }) {
  const [show, setShow] = useState("all");
  const [focus, setFocus] = useState(null);
  const found = Object.keys(binder.owned).length;
  const list = HALO_CARDS.filter((c) => show === "all" || (show === "have" ? binder.owned[c.id] : !binder.owned[c.id]));
  return (
    <section aria-labelledby="halo-binder-title">
      <header className="halo-page-head">
        <h1 id="halo-binder-title">The binder</h1>
        <p><b>{found} of {SET_SIZE}</b> found. Grey cards are still out there. Your binder lives in this browser.</p>
        <div className="halo-meter" aria-hidden="true"><span style={{ width: `${(found / SET_SIZE) * 100}%` }} /></div>
      </header>
      <div className="halo-filter" role="group" aria-label="Show">
        {[["all", "All"], ["have", "Found"], ["missing", "Still out there"]].map(([k, l]) => (
          <button key={k} className={show === k ? "on" : ""} aria-pressed={show === k} onClick={() => setShow(k)}>{l}</button>
        ))}
      </div>
      {found === 0 && <p className="halo-empty">Nothing yet. <Link to="/halo/packs">Open your starter Poptarts</Link>.</p>}
      <div className="halo-binder">
        {list.map((c) => binder.owned[c.id]
          ? <HaloCard key={c.id} id={c.id} finish={bestFinish(binder, c.id)} count={binder.owned[c.id]} onClick={() => setFocus({ id: c.id, finish: bestFinish(binder, c.id) })} />
          : <HaloCard key={c.id} id={c.id} state="silhouette" />)}
      </div>
      {focus && <CardModal card={focus} onClose={() => setFocus(null)} />}
    </section>
  );
}

function DraftNight({ binder, setBinder }) {
  const deck = binder.deck || { cmd: null, cards: [] };
  const setDeck = (d) => setBinder({ ...binder, deck: d });
  const commanders = HALO_CARDS.filter((c) => c.type === "commander" && binder.owned[c.id]);
  const used = useMemo(() => deck.cards.reduce((m, id) => ((m[id] = (m[id] || 0) + 1), m), {}), [deck.cards]);
  const mine = HALO_CARDS.filter((c) => c.deckable && binder.owned[c.id]);
  const problems = deckProblems(binder, deck);
  const full = deck.cards.length >= DECK_SIZE;
  const add = (id) => { if (!full && (BY_ID[id].rarity === "basic" || (used[id] || 0) < binder.owned[id])) setDeck({ ...deck, cards: [...deck.cards, id] }); };
  const remove = (i) => setDeck({ ...deck, cards: deck.cards.filter((_, k) => k !== i) });
  const sorted = deck.cards.map((id, i) => ({ id, i })).sort((a, b) => (BY_ID[a.id].no || 99) - (BY_ID[b.id].no || 99));

  if (!binder.packsOpened) {
    return <section className="halo-empty"><h1 className="halo-page-head">Draft Night</h1><p>Open your starter Poptarts first: your deck is built from what you pull. <Link to="/halo/packs">Open them</Link>.</p></section>;
  }
  return (
    <section aria-labelledby="halo-deck-title">
      <header className="halo-page-head">
        <h1 id="halo-deck-title">Draft Night</h1>
        <p>Three packs each, no trades. Pick a commander you pulled, then twenty cards: any you own, and as many basics as you like. The table doubles the list to forty.</p>
      </header>
      <div className="halo-builder">
        <div className="halo-builder-pool">
          <h2>1 · Your commander</h2>
          <div className="halo-row">
            {commanders.map((c) => (
              <HaloCard key={c.id} id={c.id} finish={bestFinish(binder, c.id)} className={deck.cmd === c.id ? "hc-picked" : ""} onClick={() => setDeck({ ...deck, cmd: c.id })} />
            ))}
            {!commanders.length && <p>No commander pulled yet.</p>}
          </div>
          <h2>2 · Your cards <small>tap to add</small></h2>
          <div className="halo-row">
            {mine.map((c) => {
              const left = binder.owned[c.id] - (used[c.id] || 0);
              return <HaloCard key={c.id} id={c.id} finish={bestFinish(binder, c.id)} count={left} className={left <= 0 || full ? "hc-spent" : ""} onClick={() => add(c.id)} />;
            })}
          </div>
          <h2>3 · Basics <small>every planet has them, as many as you like</small></h2>
          <div className="halo-row">
            {HALO_BASICS.map((c) => <HaloCard key={c.id} id={c.id} className={full ? "hc-spent" : ""} onClick={() => add(c.id)} />)}
          </div>
        </div>
        <aside className="halo-deck-list" aria-label="Your deck">
          <h2>Your deck <span className={deck.cards.length === DECK_SIZE ? "ok" : ""}>{deck.cards.length}/{DECK_SIZE}</span></h2>
          <p className="halo-dim">Commander: <b>{deck.cmd ? BY_ID[deck.cmd].name : "none yet"}</b></p>
          <ul>
            {sorted.map(({ id, i }) => (
              <li key={i}><button onClick={() => remove(i)} aria-label={`Take ${BY_ID[id].name} out`}><span>{BY_ID[id].name.replace(" (no name yet)", "")}</span><small>{BY_ID[id].A != null ? `A ${BY_ID[id].A} · D ${BY_ID[id].D}` : BY_ID[id].type}</small><b aria-hidden="true">×</b></button></li>
            ))}
          </ul>
          <div className="halo-deck-actions">
            <button className="halo-link" disabled={full} onClick={() => setDeck({ ...deck, cards: fillWithBasics(deck.cards) })}>Fill the rest with basics</button>
            <button className="halo-link" disabled={!deck.cards.length} onClick={() => setDeck({ ...deck, cards: [] })}>Clear</button>
          </div>
          {problems.length ? <p className="halo-dim">{problems[0]}</p> : null}
          <a className={`halo-button ${problems.length ? "is-off" : ""}`} aria-disabled={problems.length > 0} href={problems.length ? undefined : playLink(playRoot, deck, "Your Draft deck")}>Play this deck ▸</a>
        </aside>
      </div>
      <div className="halo-deck-bar" aria-hidden="true">
        <span className={deck.cards.length === DECK_SIZE ? "ok" : ""}>{deck.cards.length}/{DECK_SIZE}</span>
        <span>{deck.cmd ? BY_ID[deck.cmd].name : "pick a commander"}</span>
        {problems.length ? null : <a className="halo-button" tabIndex={-1} href={playLink(playRoot, deck, "Your Draft deck")}>Play ▸</a>}
      </div>
    </section>
  );
}

export default function Halo({ view = "learn" }) {
  const [binder, setB] = useState(loadBinder);
  const setBinder = (b) => { setB(b); saveBinder(b); };
  useEffect(() => {
    const previousTitle = document.title;
    document.title = { learn: "HALO · Playtest", packs: "HALO · Poptarts", binder: "HALO · Binder", deck: "HALO · Draft Night" }[view];
    return () => { document.title = previousTitle; };
  }, [view]);

  return (
    <article className="halo">
      <div className="wrap">
        <SubNav binder={binder} />
        {view === "learn" && <Learn binder={binder} />}
        {view === "packs" && <Packs binder={binder} setBinder={setBinder} />}
        {view === "binder" && <Binder binder={binder} />}
        {view === "deck" && <DraftNight binder={binder} setBinder={setBinder} />}
        <p className="halo-starter-note">{STARTER_PACKS} starter packs per Draft Night · finishes are looks only: a First Edition plays the same as a laminate.</p>
      </div>
    </article>
  );
}
