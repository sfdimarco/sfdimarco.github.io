import { useState, useEffect } from "react";
import { SYN } from "../constants/syn";
const COLS = 20, ROWS = 9;
function useSynGrid() {
  const [cells, setCells] = useState(() =>
    Array.from({ length: ROWS * COLS }, () => ({
      d: String(Math.floor(Math.random() * 10)),
      op: Math.random() * 0.28 + 0.05,
      ph: Math.random() * Math.PI * 2,
      sp: Math.random() * 0.4 + 0.15,
    }))
  );
  useEffect(() => {
    let raf, t = 0;
    const tick = () => {
      t += 0.012;
      setCells(p => p.map(c => ({
        ...c,
        d: Math.random() < 0.002 ? String(Math.floor(Math.random() * 10)) : c.d,
        op: 0.05 + Math.abs(Math.sin(t * c.sp + c.ph)) * 0.3,
      })));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return cells;
}
export default function SynGrid({ style }) {
  const cells = useSynGrid();
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${COLS},1fr)`,
      gridTemplateRows: `repeat(${ROWS},1fr)`, width: "100%", height: "100%",
      userSelect: "none", pointerEvents: "none", ...style }}>
      {cells.map((c, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Space Mono',monospace", fontSize: "clamp(9px,1.1vw,15px)",
          fontWeight: 700, color: SYN[c.d], opacity: c.op, transition: "opacity 0.5s" }}>{c.d}</div>
      ))}
    </div>
  );
}
