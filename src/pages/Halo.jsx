import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import HaloCard, { CardBack } from "../components/HaloCard.jsx";
import { MushTalk, HaloPath, MushFace, HaloCheer, pathSteps } from "../components/HaloMush.jsx";
import { HALO_CARDS, HALO_BASICS, HALO_BOSSES, HALO_STARTERS, HALO_BREAKERS } from "../content/haloCards.js";
import {
  BY_ID, SET_SIZE, DECK_SIZE, STARTER_PACKS, loadBinder, saveBinder, openPack, bestFinish,
  deckProblems, fillWithBasics, playLink, claimResults, buyPack, WIN_POINTS, BOUNTY, PACK_PRICE, comboStatus, ROADS, ROAD_BY,
  nextIsCounter, breakerFor, resetBinder,
} from "../lib/haloBinder.js";
import { useHaloArt, mountCard, loadHaloArt } from "../lib/haloArt.js";
import "./Halo.css";

// The game itself is one self-contained file: public/halo/play/index.html.
// It is built from the rules engine in .geo/halo (node build-playtest.js → HALO-PLAYTEST.html) and copied here.
const playRoot = `${import.meta.env.BASE_URL}halo/play/`;

// the seven ways to win (ROADS, in haloBinder.js): each hangs on one of a planet's seven rings.

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
      <NavLink to="/halo/bazaar">Bazaar <small>{binder.points || 0} pts</small></NavLink>
      <a className="halo-sub-play" href={playRoot}>Play ▸</a>
    </nav>
  );
}

function Learn({ binder, setBinder }) {
  return (
    <>
      <section className="halo-hero" aria-labelledby="halo-title">
        <div className="halo-intro">
          <p className="halo-kicker"><span className="halo-badge">PLAYTEST</span> The card game from Mook &amp; Mush</p>
          <h1 id="halo-title">HALO</h1>
          <p className="halo-deck">Seven planets round a sun. Seven rings on each. Seven ways to win.</p>
          <p className="halo-summary">Learn it with Mush below, pick your road, open your Poptarts, build a deck from what you pull, then hunt the cast one by one.</p>
          <div className="halo-actions">
            {binder.learned || binder.packsOpened
              ? <Link className="halo-button" to={binder.packsLeft ? "/halo/packs" : "/halo/deck"}>{binder.packsLeft ? (binder.road || binder.packsOpened ? "Your Poptarts" : "Pick your road") : "Your Draft Night deck"}</Link>
              : <a className="halo-button" href="#mush" onClick={(e) => { e.preventDefault(); document.getElementById("mush")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); }}>Learn with Mush</a>}
            <a href={playRoot}>or play a show deck now</a>
          </div>
          <p className="halo-note">Runs in this browser, nothing to install. Balanced by bots so far, not by people: tell me what feels off.</p>
          <HaloPath binder={binder} />
        </div>
        <figure className="halo-plate">
          <SevenPlanets />
          <figcaption>Seven planets, each wearing its seven rings</figcaption>
        </figure>
      </section>

      <MushTalk binder={binder} setBinder={setBinder} art={{ planets: <SevenPlanets />, planet: <OnePlanet />, grid: <TheGrid />, roads: <RoadsMini /> }} />

      <section className="halo-learn" aria-labelledby="halo-learn-title">
        <h2 id="halo-learn-title">The rules, on one page</h2>
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
        <h3 className="halo-h3">5 · Alone, or on a team</h3>
        <div className="halo-modes">
          <div><b>1 on 1</b><p>Just you and one rival: one treaty is enough for Politics, two converts for Religion. Cut the ring their road hangs on.</p></div>
          <div><b>3 on 3</b><p>Your team wins when any of you wins, so team-mates' roads count too. Support cards (ALLY, +ECON, shields, BANNER) work on a team-mate's planet: back the one closest to winning.</p></div>
        </div>
      </section>
    </>
  );
}

// the seven roads, small (Mush's last-but-one step)
function RoadsMini() {
  return (
    <ul className="halo-road-list halo-road-mini">
      {ROADS.map((r) => <li key={r.ring}><span className="halo-ring" style={{ background: r.color }} aria-hidden="true" /><div><h3>{r.road}</h3><p><strong>{r.ring}.</strong> {r.how}</p></div></li>)}
    </ul>
  );
}

// ----- before the first Poptart: which road calls you? Pick one, and the first pack is its starter.
function RoadPick({ setRoad }) {
  const [sel, setSel] = useState(null), r = sel && ROAD_BY[sel], st = sel && HALO_STARTERS[sel];
  return (
    <div className="halo-roadpick">
      <div className="halo-roadpick-head">
        <MushFace size={72} talking />
        <div className="halo-mush-bubble"><p>Which road calls you?</p><p className="halo-mush-act">Your first Poptart is its starter. You can still play the other six.</p></div>
      </div>
      <ul className="halo-roadpick-list" role="list">
        {ROADS.map((x) => {
          const s = HALO_STARTERS[x.key];
          return (
            <li key={x.key}>
              <button className={`halo-roadpick-item ${sel === x.key ? "on" : ""}`} style={{ "--ring": x.color }} aria-pressed={sel === x.key} onClick={() => setSel(x.key)}>
                <HaloCard id={s.cmd} finish="lenticular" />
                <span className="halo-roadpick-words">
                  <span className="halo-roadpick-name"><i className="halo-ring" style={{ background: x.color }} aria-hidden="true" />{s.label}</span>
                  <span className="halo-roadpick-win">{s.win}</span>
                  <small>{BY_ID[s.cmd].name}</small>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="halo-roadpick-go" aria-live="polite">
        {r ? (
          <>
            <p><b style={{ color: r.color }}>{st.label}.</b> {r.how} <span className="halo-dim">Starter: {BY_ID[st.cmd].name} + {st.cards.map((id) => BY_ID[id].name).filter((v, i, a) => a.indexOf(v) === i).join(", ")}.</span></p>
            <button className="halo-button" onClick={() => setRoad(sel)}>Walk the {st.label} road ▸</button>
          </>
        ) : <p className="halo-dim">Tap a road to see its starter.</p>}
      </div>
    </div>
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
  const starterRoad = opened === 0 && binder.road ? ROAD_BY[binder.road] : null;
  const counterNext = nextIsCounter(binder), wasCounter = cards.length > 0 && !cards.some((c) => c.hit);   // 11-24: the counter Poptart

  return (
    <section className="halo-packs" aria-labelledby="halo-packs-title">
      <header className="halo-page-head">
        <h1 id="halo-packs-title">Poptarts</h1>
        <p>Eight cards a pack: five common, two uncommon, and one hit (a rare or a commander) that comes last, in a lenticular finish. Now and then the hit is a <b>First Edition</b>: metal, with an onyx gem.</p>
      </header>

      {phase === "sealed" && binder.packsLeft > 0 && opened === 0 && !binder.road && <RoadPick setRoad={(k) => setBinder({ ...binder, road: k })} />}

      {phase === "sealed" && binder.packsLeft > 0 && (opened > 0 || binder.road) && (
        <div className="halo-pack-stage">
          <button className="halo-wrapper" onClick={tear} aria-label={`Tear open pack ${opened + 1}`}>
            <span className="halo-wrapper-crimp" aria-hidden="true" />
            <CardBack />
            <span className="halo-wrapper-label">{starterRoad ? `${starterRoad.ring.toUpperCase()} STARTER · ${HALO_STARTERS[binder.road].cards.length + 1} CARDS` : counterNext ? `COUNTER POPTART · ${Object.keys(HALO_BREAKERS).filter((r) => r !== binder.road).length} CARDS` : "STARTER POPTART · 8 CARDS"}</span>
            <span className="halo-wrapper-tear">TEAR HERE ✂</span>
            {starterRoad && <span className="halo-wrapper-ring" style={{ background: starterRoad.color }} aria-hidden="true" />}
          </button>
          {counterNext && <p className="halo-dim">A gift for every new player: one card that stops each of the other roads. Before a bounty, check which one that boss's road needs.</p>}
          <p className="halo-pack-left">{binder.packsLeft} {binder.packsLeft === 1 ? "pack" : "packs"} to open · tap the pack to tear it</p>
          {starterRoad && <p className="halo-dim">Your {starterRoad.ring} starter: {BY_ID[HALO_STARTERS[binder.road].cmd].name} and {HALO_STARTERS[binder.road].cards.length} {starterRoad.ring} cards. <button className="halo-link" onClick={() => setBinder({ ...binder, road: null })}>Pick another road</button></p>}
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
            {phase === "torn" && <><button className="halo-button" onClick={flipNext}>{shown === cards.length - 1 ? (wasCounter ? "Flip the last card" : "Flip the hit") : "Flip the next card"}</button><button className="halo-link" onClick={() => { setBurst(shown); setShown(cards.length); }}>Flip them all</button></>}
            {phase === "done" && (
              <>
                {wasCounter
                  ? <p className="halo-pack-say">Your counters: one card to stop each road. The bounty board says which one each boss needs.</p>
                  : <p className="halo-pack-say">You pulled <b>{BY_ID[hit.id].name}</b>{hit.finish === "first" ? ", a First Edition!" : "."}</p>}
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
        <div className="halo-done">
          <span className="halo-done-badge">DRAFT NIGHT ✓</span>
          <h2>You've had your Draft Night.</h2>
          <p>Three packs each, no trades: that's the rule at Tortimer's. You opened {opened} {opened === 1 ? "pack" : "packs"} and found {Object.keys(binder.owned).length} of {SET_SIZE} cards.</p>
          <p>Want more Poptarts? Win them. Take your deck against the cast on the bounty board: every win pays points, and points buy packs at the Bazaar.</p>
          <HaloPath binder={binder} />
          <div className="halo-actions">
            <Link className="halo-button" to="/halo/deck">Your Draft Night deck</Link>
            <Link className="halo-button" to="/halo/bazaar">Hunt a bounty ▸</Link>
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
  // the live illustrated card: tilts toward the cursor, PLAY = it lifts and stands up as a hologram
  const art = useHaloArt(), live = useRef(null), ctl = useRef(null), [isLive, setLive] = useState(false);
  useEffect(() => {
    if (!art) return undefined;
    const w = Math.min(260, Math.round(window.innerWidth * 0.66));
    ctl.current = mountCard(live.current, card.id, card.finish, w);
    setLive(!!ctl.current);
    return () => { ctl.current?.destroy(); ctl.current = null; };
  }, [art, card.id, card.finish]);
  return (
    <div className="halo-modal" role="dialog" aria-modal="true" aria-label={c.name} onClick={onClose}>
      <div className="halo-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="halo-live">
          <div ref={live} />
          {!isLive && <HaloCard id={card.id} finish={card.finish} className="hc-big" />}
          {isLive && <button className="halo-link" onClick={() => ctl.current?.play()}>Play it ▸</button>}
        </div>
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
  // your road's commander first
  const roadCmd = binder.road && HALO_STARTERS[binder.road]?.cmd;
  const commanders = HALO_CARDS.filter((c) => c.type === "commander" && binder.owned[c.id]).sort((a, b) => (b.id === roadCmd) - (a.id === roadCmd));
  const used = useMemo(() => deck.cards.reduce((m, id) => ((m[id] = (m[id] || 0) + 1), m), {}), [deck.cards]);
  const [roadShow, setRoadShow] = useState("all");
  const myRoad = binder.road && ROAD_BY[binder.road];
  const allMine = HALO_CARDS.filter((c) => c.deckable && binder.owned[c.id]);
  const want = roadShow === "mine" ? binder.road : roadShow;
  const mine = allMine.filter((c) => want === "all" || c.road === want);
  const link = (boss) => playLink(playRoot, deck, "Your Draft deck", boss, binder.road);
  const problems = deckProblems(binder, deck);
  const full = deck.cards.length >= DECK_SIZE;
  const add = (id) => { if (!full && (BY_ID[id].rarity === "basic" || (used[id] || 0) < binder.owned[id])) setDeck({ ...deck, cards: [...deck.cards, id] }); };
  const remove = (i) => setDeck({ ...deck, cards: deck.cards.filter((_, k) => k !== i) });
  const sorted = deck.cards.map((id, i) => ({ id, i })).sort((a, b) => (BY_ID[a.id].no || 99) - (BY_ID[b.id].no || 99));
  // 11-24 playtest ("hover showed nothing, so the tester built blind"): the card under the pointer, or the one just tapped, is read out
  const [readId, setReadId] = useState(null);
  const reads = (id) => ({ onMouseOver: () => setReadId(id), onFocus: () => setReadId(id), onClickCapture: () => setReadId(id), style: { display: "contents" } });
  const rc = readId && BY_ID[readId], rr = rc && rc.road && ROAD_BY[rc.road];
  const readBox = (
    <div className="halo-read" aria-live="polite">
      {rc ? (
        <>
          <p className="halo-read-name"><b>{rc.name.replace(" (no name yet)", "")}</b> <span className="halo-dim">{rc.type}{rc.cost != null ? ` · costs ${rc.cost} ECON` : ""}{rc.A != null ? ` · A ${rc.A} · D ${rc.D}` : ""}</span></p>
          <p>{rc.text || "A plain card: it fights with its A and blocks with its D."}</p>
          {rr && <p className="halo-dim"><i className="halo-ring" style={{ background: rr.color }} aria-hidden="true" />{rr.ring} road</p>}
        </>
      ) : <p className="halo-dim">Point at a card, or tap it, to read it here.</p>}
    </div>
  );

  if (!binder.packsOpened) {
    return <section className="halo-empty"><h1 className="halo-page-head">Draft Night</h1><p>Open your starter Poptarts first: your deck is built from what you pull. <Link to="/halo/packs">Open them</Link>.</p></section>;
  }
  return (
    <section aria-labelledby="halo-deck-title">
      <header className="halo-page-head">
        <h1 id="halo-deck-title">Draft Night</h1>
        <p>Three packs each, no trades. Pick a commander you pulled, then forty cards: any you own, and as many basics as you like. Your forty play as you built them. Every deck also gets the table's own traps (Burrow, Brumation, The Harbour Boom) and Sieges, and they take the place of your basics, so you will draw a few cards you did not pick.</p>
      </header>
      <div className="halo-myroad" style={myRoad ? { "--ring": myRoad.color } : undefined}>
        {myRoad ? (
          <p><i className="halo-ring" style={{ background: myRoad.color }} aria-hidden="true" />Your road: <b>{myRoad.ring}</b> <span className="halo-dim">· {HALO_STARTERS[binder.road].win} The table gives your deck its road perks.</span></p>
        ) : (
          <p><i className="halo-ring" style={{ background: "#3a3f52" }} aria-hidden="true" />No road yet. <span className="halo-dim">Pick one: the table gives your deck its perks.</span>
            {ROADS.map((r) => <button key={r.key} className="halo-chip" onClick={() => setBinder({ ...binder, road: r.key })}><i style={{ background: r.color }} />{r.ring}</button>)}
          </p>
        )}
      </div>
      <div className="halo-builder">
        <div className="halo-builder-pool">
          <h2>1 · Your commander</h2>
          <div className="halo-row">
            {commanders.map((c) => (
              <span key={c.id} {...reads(c.id)}><HaloCard id={c.id} finish={bestFinish(binder, c.id)} className={deck.cmd === c.id ? "hc-picked" : ""} onClick={() => setDeck({ ...deck, cmd: c.id })} /></span>
            ))}
            {!commanders.length && <p>No commander pulled yet.</p>}
          </div>
          <h2>2 · Your cards <small>tap to add</small></h2>
          <div className="halo-filter halo-roadfilter" role="group" aria-label="Show cards from">
            {[["all", "All", null], ...(myRoad ? [["mine", "My road", myRoad.color]] : []), ...ROADS.map((r) => [r.key, r.ring, r.color])].map(([k, l, c]) => {
              const n = k === "all" ? allMine.length : allMine.filter((x) => x.road === (k === "mine" ? binder.road : k)).length;
              return <button key={k} className={roadShow === k ? "on" : ""} aria-pressed={roadShow === k} onClick={() => setRoadShow(k)}>{c && <i style={{ background: c }} aria-hidden="true" />}{l} <small>{n}</small></button>;
            })}
          </div>
          <div className="halo-row">
            {mine.map((c) => {
              const left = binder.owned[c.id] - (used[c.id] || 0), r = c.road && ROAD_BY[c.road];
              return (
                <span key={c.id} className="halo-rcard" {...reads(c.id)} style={undefined}>
                  <HaloCard id={c.id} finish={bestFinish(binder, c.id)} count={left} className={left <= 0 || full ? "hc-spent" : ""} onClick={() => add(c.id)} />
                  {r && <span className={`halo-rtag ${c.road === binder.road ? "is-mine" : ""}`} style={{ "--ring": r.color }} title={`${r.ring} road`}>{r.ring}</span>}
                </span>
              );
            })}
            {!mine.length && <p className="halo-dim">None of yours on this road yet. The Bazaar sells more Poptarts.</p>}
          </div>
          <h2>3 · Basics <small>every planet has them, as many as you like</small></h2>
          <div className="halo-row">
            {HALO_BASICS.map((c) => <span key={c.id} {...reads(c.id)}><HaloCard id={c.id} className={full ? "hc-spent" : ""} onClick={() => add(c.id)} /></span>)}
          </div>
          <Combos deck={deck} binder={binder} />
        </div>
        <aside className="halo-deck-list" aria-label="Your deck">
          {readBox}
          <h2>Your deck <span className={deck.cards.length === DECK_SIZE ? "ok" : ""}>{deck.cards.length}/{DECK_SIZE}</span></h2>
          <p className="halo-dim">Commander: <b>{deck.cmd ? BY_ID[deck.cmd].name : "none yet"}</b></p>
          <ul>
            {sorted.map(({ id, i }) => (
              <li key={i} onMouseOver={() => setReadId(id)}><button onClick={() => remove(i)} aria-label={`Take ${BY_ID[id].name} out`}><span>{BY_ID[id].name.replace(" (no name yet)", "")}</span><small>{BY_ID[id].A != null ? `A ${BY_ID[id].A} · D ${BY_ID[id].D}` : BY_ID[id].type}</small><b aria-hidden="true">×</b></button></li>
            ))}
          </ul>
          <div className="halo-deck-actions">
            <button className="halo-link" disabled={full} onClick={() => setDeck({ ...deck, cards: fillWithBasics(deck.cards) })}>Fill the rest with basics</button>
            <button className="halo-link" disabled={!deck.cards.length} onClick={() => setDeck({ ...deck, cards: [] })}>Clear</button>
          </div>
          {problems.length ? <p className="halo-dim">{problems[0]}</p> : null}
          <a className={`halo-button ${problems.length ? "is-off" : ""}`} aria-disabled={problems.length > 0} href={problems.length ? undefined : link()}>Play this deck ▸</a>
          {!problems.length && <p className="halo-dim" style={{ marginTop: ".6rem" }}>Or <Link to="/halo/bazaar">hunt a bounty</Link>: beat the cast for points to spend on packs.</p>}
        </aside>
      </div>
      <div className="halo-read-bar">{readBox}</div>
      <div className="halo-deck-bar" aria-hidden="true">
        <span className={deck.cards.length === DECK_SIZE ? "ok" : ""}>{deck.cards.length}/{DECK_SIZE}</span>
        <span>{deck.cmd ? BY_ID[deck.cmd].name : "pick a commander"}</span>
        {problems.length ? null : <a className="halo-button" tabIndex={-1} href={link()}>Play ▸</a>}
      </div>
    </section>
  );
}

// 11-23: the mixed-deck combos. Two cards from two decks + one free basic, three in a line on the table = one big card.
const bn = (id) => (BY_ID[id].rarity === "basic" ? `${BY_ID[id].name} (basic)` : BY_ID[id].name);
function Combos({ deck, binder }) {
  const list = comboStatus(deck.cards, binder.owned).sort((a, b) => b.ready - a.ready || b.canBuild - a.canBuild || b.own.length - a.own.length);
  return (
    <>
      <h2>4 · Combos <small>three in a line on the table fuse into one card</small></h2>
      <p className="halo-dim halo-combo-lede"><MushFace size={40} /> Two cards from two decks and one basic. Lay them in one lane. Armillaria fills any one gap.</p>
      <ul className="halo-combos">
        {list.map((co) => (
          <li key={co.makes} className={co.ready ? "is-ready" : co.canBuild ? "is-near" : ""}>
            <HaloCard id={co.makes} finish={co.ready ? "lenticular" : "laminate"} className={co.own.length ? "" : "hc-spent"} />
            <div>
              <h3>{BY_ID[co.makes].name}</h3>
              <p>{co.parts.map((x, k) => {
                const on = x.startsWith("kInd_") ? co.basicIn : co.have.includes(x), owned = x.startsWith("kInd_") || binder.owned[x];
                return <span key={x}>{k ? " + " : ""}<span className={on ? "halo-part on" : owned ? "halo-part own" : "halo-part"}>{bn(x)}</span></span>;
              })}</p>
              <p className="halo-dim">{co.ready ? (co.gap ? `Armillaria stands in for ${BY_ID[co.gap].name}. ` : "") + (co.basicIn ? "In your deck. Lay them in one lane." : `Add a ${bn(co.basic)} or press Fill.`) : co.canBuild ? "You own the pieces: add them to your deck." : co.own.length ? `You own ${co.own.length} of 2. ${binder.owned.mycelium ? "Armillaria can stand in." : "Still out there."}` : "Still out there."}</p>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

// which road each of the cast walks (the bots' goals, .geo/halo/bots.js ROAD) and how to beat them
const BOSS_ROAD = {
  leo: ["industry", "Big swings, then he naps: Snooze lights his rings again. Keep all three lanes blocked and hit him twice in a row. His front cards have D 4: bring Heavies (A 5), or have two cards attack together. He also saves ECON, and at 50 he buys the win.", "runBank"],   // third: a card to bring that his road tag does not name (he banks, though his road is Industry)
  fhat: ["industry", "His rabbits run at empty lanes. Fill all three. That face-down card is a Burrow: don't swing into it."],
  gil: ["pop", "The rats fill his grid. Knock out his front row before all nine squares are his: a full grid still has to hold a round."],
  mook: ["industry", "Ships and broadsides. Broadside needs a ship on his grid, so sink the ships first."],
  mush: ["food", "His rings grow back. Put out his Food ring and the harvest stops."],
  bronconius: ["religion", "He converts your front units. Keep a high-D card up front, and put out his Religion ring."],
  finley: ["politics", "She'll offer treaties. Tear them up (5 ECON) or hit her past the grid."],
  tortimer: ["food", "He sleeps, then wakes with his rings lit. Hit hard and early, and cut his Food ring."],
  rose: ["science", "The great machine. Break a Part before the ninth square fills, or cut her Science ring."],
  // 11-24: the five players from Faulty Tolerance (his other show). The tips are Claude's, from the sims.
  ftPell: ["food", "Wet Beds grows slowly and fights with many hands. Trade evenly and cut the Food ring when his harvest count climbs."],
  ftLo: ["politics", "Waymarks walls up and sends envoys. Tear the treaty up (5 ECON) and do not let the game run long: Lo banks."],
  ftVenn: ["pop", "House Lights is all cheap units: nine on the grid and the house is full. Knock one out every turn."],
  ftSill: ["economy", "Secondhand Row saves up behind its Stalls and buys the win. Break the Stalls or drain the bank."],
  ftKip: ["science", "Bench Light builds the great machine round the Lantern Core. Break a Section before the ninth square fills."],
};

// ----- the bounty board and Tortimer's Card Bazaar: beat the cast to earn points, spend them on Poptarts
function Bazaar({ binder, setBinder, news }) {
  const deck = binder.deck || { cmd: null, cards: [] };
  const ready = deckProblems(binder, deck).length === 0;
  const points = binder.points || 0;
  const whoOf = (k) => HALO_BOSSES.find((b) => b.key === k)?.who || k;
  return (
    <section aria-labelledby="halo-bazaar-title">
      <header className="halo-page-head">
        <h1 id="halo-bazaar-title">Tortimer's Card Bazaar</h1>
        <p>Like the bounty hunters on Halomint Madness: take your Draft Night deck against the cast, one on one. Every win pays {WIN_POINTS} points. Your first win over each of them pays a {BOUNTY}-point bounty too. Spend points here on more Poptarts.</p>
      </header>

      {news.length > 0 && (
        <ul className="halo-news" aria-live="polite">
          {news.map((n, i) => <li key={i} className={n.won ? "won" : ""}>{n.won ? `You beat ${whoOf(n.boss)}${n.road && ROAD_BY[n.road] ? ` by ${ROAD_BY[n.road].ring}` : ""}: +${n.got} points${n.first ? " (bounty!)" : ""}` : `${whoOf(n.boss)} beat you. No points this time.`}</li>)}
        </ul>
      )}

      <div className="halo-shop">
        <div className="halo-purse"><small>Your points</small><b>{points}</b></div>
        <div className="halo-shop-item">
          <div className="hc halo-shop-pack"><CardBack /></div>
          <div>
            <h2>A Poptart</h2>
            <p className="halo-dim">8 cards, same as a starter. {PACK_PRICE} points.</p>
            <button className={`halo-button ${points < PACK_PRICE ? "is-off" : ""}`} aria-disabled={points < PACK_PRICE} onClick={() => points >= PACK_PRICE && setBinder(buyPack(binder))}>Buy for {PACK_PRICE} points</button>
            {binder.packsLeft > 0 && <p><Link to="/halo/packs">Open your {binder.packsLeft} {binder.packsLeft === 1 ? "pack" : "packs"} ▸</Link></p>}
          </div>
        </div>
      </div>

      <HaloPath binder={binder} />
      <h2 className="halo-h3">Bounty board</h2>
      <p className="halo-dim halo-combo-lede"><MushFace size={40} /> Easy ones first. Start with Leo. He's half asleep.</p>
      {!ready && <p className="halo-empty">First build a 40-card deck on <Link to="/halo/deck">Draft Night</Link>, then come back to hunt.</p>}
      <div className="halo-bounties">
        {HALO_BOSSES.map((b) => {
          const wins = (binder.beaten || {})[b.key] || 0, next = HALO_BOSSES.find((x) => !(binder.beaten || {})[x.key])?.key === b.key;
          const [rk, tip, alsoBring] = BOSS_ROAD[b.key] || [null, ""], r = rk && ROAD_BY[rk];
          return (
            <div key={b.key} className={`halo-bounty ${wins ? "is-beaten" : ""} ${next ? "is-next" : ""}`}>
              <HaloCard id={b.cmd} finish={wins ? "laminate" : "lenticular"} />
              <div className="halo-bounty-words">
                <h3>{b.who}</h3>
                <span className={`halo-tier t${b.tier}`}>{["", "Easy", "Medium", "Hard"][b.tier]}{next ? " · start here" : ""}</span>
                {r && <p className="halo-bounty-road"><i className="halo-ring" style={{ background: r.color }} aria-hidden="true" /><b>{r.ring}</b>{rk === binder.road && <span className="halo-same"> · your road</span>}</p>}
                {tip && <p className="halo-bounty-tip">{tip}</p>}
                {alsoBring && BY_ID[alsoBring] && <p className="halo-bounty-bring">Bring <b>{BY_ID[alsoBring].name}</b> in your deck: {BY_ID[alsoBring].text ? BY_ID[alsoBring].text.replace(/\.$/, "") : "it answers his plan"}.{" "}{(binder.owned || {})[alsoBring] ? <span className="halo-same">You have {binder.owned[alsoBring]}.</span> : <span className="halo-dim">Not in your binder yet.</span>}</p>}
                {rk && breakerFor(rk) && <p className="halo-bounty-bring">Bring <b>{BY_ID[breakerFor(rk)].name}</b> in your deck: {rk === "economy" ? `it halves ${b.who}'s ECON.` : `it puts out ${b.who}'s ${r.ring} ring.`}{" "}{(binder.owned || {})[breakerFor(rk)] ? <span className="halo-same">You have it.</span> : <span className="halo-dim">Not in your binder yet.</span>}</p>}
                <p className="halo-dim">{wins ? `Beaten ${wins}×. A win pays ${WIN_POINTS}.` : `Bounty: ${WIN_POINTS + BOUNTY} points`}</p>
                {ready
                  ? <a className="halo-button" href={playLink(playRoot, deck, "Your Draft deck", b.key, binder.road)}>Hunt ▸</a>
                  : <span className="halo-dim">Needs a deck</span>}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// Start over: a brand-new account in this browser, asked twice (it can't be undone)
function StartOver({ onReset }) {
  const [asking, setAsking] = useState(false);
  if (!asking) return <p className="halo-startover"><button type="button" className="halo-startover-link" onClick={() => setAsking(true)}>Start over with a new account</button></p>;
  return (
    <div className="halo-startover halo-startover-ask" role="alert">
      <p>This deletes your binder, deck, points and wins in this browser. It can’t be undone.</p>
      <button type="button" className="halo-button" onClick={() => { setAsking(false); onReset(); }}>Yes, start over</button>
      <button type="button" className="halo-startover-link" onClick={() => setAsking(false)}>Keep my account</button>
    </div>
  );
}

export default function Halo({ view = "learn" }) {
  const navigate = useNavigate();
  // wins written by the game are paid out when the page loads (pure here; saved in the effect below)
  const [init] = useState(() => claimResults(loadBinder()));
  const [binder, setB] = useState(init[0]);
  const news = init[1];
  useEffect(() => { loadHaloArt(); }, []);
  const setBinder = (b) => { setB(b); saveBinder(b); };
  useEffect(() => { if (init[1].length) saveBinder(init[0]); }, [init]);
  // celebrate a path step the moment it comes true (an old binder learns what's already done quietly, the first time)
  const [cheer, setCheer] = useState(null);
  const closeCheer = useCallback(() => setCheer(null), []);
  useEffect(() => {
    const steps = pathSteps(binder), done = steps.filter((s) => s.done).map((s) => s.key);
    if (!Array.isArray(binder.cheered)) { setBinder({ ...binder, cheered: done }); return; }
    const fresh = done.filter((k) => !binder.cheered.includes(k));
    if (!fresh.length) return;
    const k = steps.findIndex((s) => s.key === fresh[fresh.length - 1]);
    setCheer({ step: steps[k], next: steps.find((s) => !s.done) || null });
    setBinder({ ...binder, cheered: [...binder.cheered, ...fresh] });
  }, [binder]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const previousTitle = document.title;
    document.title = { learn: "HALO · Playtest", packs: "HALO · Poptarts", binder: "HALO · Binder", deck: "HALO · Draft Night", bazaar: "HALO · Card Bazaar" }[view];
    return () => { document.title = previousTitle; };
  }, [view]);

  return (
    <article className="halo">
      <div className="wrap">
        <SubNav binder={binder} />
        {view === "learn" && <Learn binder={binder} setBinder={setBinder} />}
        {view === "packs" && <Packs binder={binder} setBinder={setBinder} />}
        {view === "binder" && <Binder binder={binder} />}
        {view === "deck" && <DraftNight binder={binder} setBinder={setBinder} />}
        {view === "bazaar" && <Bazaar binder={binder} setBinder={setBinder} news={news} />}
        {cheer && <HaloCheer step={cheer.step} next={cheer.next} onClose={closeCheer} />}
        <p className="halo-starter-note">One Draft Night per visitor: {STARTER_PACKS} starter packs · finishes are looks only: a First Edition plays the same as a laminate.</p>
        <StartOver onReset={() => { setB(resetBinder()); setCheer(null); navigate("/halo"); }} />
      </div>
    </article>
  );
}
