import { useEffect } from "react";
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

export default function Halo() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "HALO · Playtest";
    return () => { document.title = previousTitle; };
  }, []);

  return (
    <article className="halo">
      <div className="wrap">
        <section className="halo-hero" aria-labelledby="halo-title">
          <div className="halo-intro">
            <p className="halo-kicker"><span className="halo-badge">PLAYTEST</span> The card game from Mook &amp; Mush</p>
            <h1 id="halo-title">HALO</h1>
            <p className="halo-deck">Seven planets round a sun. Seven rings on each. Seven ways to win.</p>
            <p className="halo-summary">Pick a table (3 on 3, 1 on 1, or a free for all of four or seven planets), pick your deck, and play against bots. Hover any card to see what it does and which road it is on.</p>
            <div className="halo-actions">
              <a className="halo-button" href={playRoot}>Play HALO</a>
            </div>
            <p className="halo-note">Runs in this browser, nothing to install, nothing saved. Balanced by bots so far, not by people: tell me what feels off.</p>
          </div>
          <figure className="halo-plate">
            <SevenPlanets />
            <figcaption>Seven planets, each wearing its seven rings</figcaption>
          </figure>
        </section>
        <section className="halo-roads" aria-labelledby="halo-roads-title">
          <h2 id="halo-roads-title">Seven ways to win</h2>
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
      </div>
    </article>
  );
}
