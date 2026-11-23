// A HALO card: face, back (the Poptart) or silhouette, in one of three finishes.
// SWAP POINT: CardFace below is a placeholder built from the card data. When the illustrated library from
// .geo/halo/card-art is ready, replace CardFace's body with that renderer (it gets the same `card` object). Nothing else changes.
import { BY_ID, SET_SIZE } from "../lib/haloBinder.js";

// Mook's digit colours (the Rainbowbrain key). A power disc always prints its digit too.
export const SYN = ["#00bcd4", "#e53935", "#1565c0", "#f9a825", "#2e7d32", "#ef6c00", "#6a1b9a", "#c2185b", "#f5f5f5", "#212121"];
const ink = (d) => ([3, 8].includes(d) ? "#1b1e29" : "#fff");
const TYPE = { commander: "Commander", unit: "Unit", structure: "Structure", action: "Action", trap: "Trap" };
const GLYPH = { commander: "♛", unit: "⚔", structure: "▣", action: "✦", trap: "◆" };
const pad = (n) => String(n).padStart(3, "0");

function Disc({ label, value }) {
  // two-digit numbers (none yet) would show the first digit's colour
  const d = Number(String(value)[0]);
  return (
    <span className="hc-disc" style={{ background: SYN[d], color: ink(d) }} title={`${label} ${value}`}>
      <small>{label}</small>{value}
    </span>
  );
}

function CardFace({ card }) {
  return (
    <>
      <div className="hc-top">
        <span className="hc-name">{card.name.replace(" (no name yet)", "")}</span>
        {card.cost != null && <span className="hc-cost" title={`costs ${card.cost} ECON`}>{card.cost}</span>}
      </div>
      <div className={`hc-art hc-art-${card.type}`} aria-hidden="true">
        <span className="hc-glyph">{GLYPH[card.type]}</span>
      </div>
      <div className="hc-type">{TYPE[card.type]}{card.noName && <em> · no name yet</em>}</div>
      {card.A != null && (
        <div className="hc-power"><Disc label="A" value={card.A} /><Disc label="D" value={card.D} /></div>
      )}
      <p className="hc-text">{card.text}</p>
      <div className="hc-foot">
        <span>{card.no ? `${pad(card.no)}/${pad(SET_SIZE)}` : "BASIC"}</span>
        <span className={`hc-rar hc-rar-${card.rarity}`}>{card.rarity}</span>
      </div>
    </>
  );
}

export function CardBack() {
  // the Poptart: crimped crust, pink frosting, sprinkles in the digit colours, HALO ALIQUID NIHIL across the middle
  const sprinkles = Array.from({ length: 26 }, (_, i) => ({
    x: 14 + ((i * 37) % 72), y: 12 + ((i * 53) % 76), r: (i * 47) % 180, c: SYN[i % 10],
  }));
  return (
    <div className="hc-back" aria-hidden="true">
      <div className="hc-frost">
        {sprinkles.map((s, i) => (
          <i key={i} style={{ left: `${s.x}%`, top: `${s.y}%`, transform: `rotate(${s.r}deg)`, background: s.c }} />
        ))}
        <b>HALO<br />ALIQUID<br />NIHIL</b>
      </div>
    </div>
  );
}

export default function HaloCard({ id, finish = "laminate", state = "face", count, onClick, className = "" }) {
  const card = BY_ID[id];
  const cls = `hc hc-${finish} hc-${card?.type} ${state === "silhouette" ? "hc-sil" : ""} ${onClick ? "hc-click" : ""} ${className}`;
  const label = state === "silhouette" ? `Not found yet: card ${card?.no}` : `${card?.name}, ${finish === "first" ? "First Edition" : finish}`;
  const Tag = onClick ? "button" : "div";
  return (
    <Tag className={cls} onClick={onClick} aria-label={label} type={onClick ? "button" : undefined}>
      {state === "back" ? <CardBack /> : state === "silhouette" ? (
        <div className="hc-silhouette"><span>?</span><small>{pad(card.no)}/{pad(SET_SIZE)}</small></div>
      ) : (
        <div className="hc-face">
          <CardFace card={card} />
          {finish === "first" && <span className="hc-gem" title="First Edition: metal, onyx gem" />}
          {finish === "lenticular" && <span className="hc-sheen" aria-hidden="true" />}
        </div>
      )}
      {count > 1 && <span className="hc-count">×{count}</span>}
    </Tag>
  );
}
