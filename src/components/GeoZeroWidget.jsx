import { useRef, useEffect, useState, useCallback } from "react";
import { SYN } from "../constants/syn";

// ─── Synesthetic letter → digit ───────────────────────────────────────────────
// A=1(RED), B=2(BLUE), ..., J=0(CYAN), K=1(RED), ...  (matches Lab.jsx LETTERS)
function letterToDigit(ch) {
  const c = ch.toUpperCase();
  if (c >= "0" && c <= "9") return c;
  if (c >= "A" && c <= "Z") {
    const n = c.charCodeAt(0) - 64; // A=1, B=2, ...
    return String(n % 10);
  }
  return null; // space / punct = off
}

// ─── 4×5 pixel font ───────────────────────────────────────────────────────────
const F = {
  A:[[0,1,1,0],[1,0,0,1],[1,1,1,1],[1,0,0,1],[1,0,0,1]],
  B:[[1,1,1,0],[1,0,0,1],[1,1,1,0],[1,0,0,1],[1,1,1,0]],
  C:[[0,1,1,1],[1,0,0,0],[1,0,0,0],[1,0,0,0],[0,1,1,1]],
  D:[[1,1,1,0],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,1,1,0]],
  E:[[1,1,1,1],[1,0,0,0],[1,1,1,0],[1,0,0,0],[1,1,1,1]],
  F:[[1,1,1,1],[1,0,0,0],[1,1,1,0],[1,0,0,0],[1,0,0,0]],
  G:[[0,1,1,1],[1,0,0,0],[1,0,1,1],[1,0,0,1],[0,1,1,1]],
  H:[[1,0,0,1],[1,0,0,1],[1,1,1,1],[1,0,0,1],[1,0,0,1]],
  I:[[1,1,1,1],[0,1,1,0],[0,1,1,0],[0,1,1,0],[1,1,1,1]],
  J:[[0,0,1,1],[0,0,0,1],[0,0,0,1],[1,0,0,1],[0,1,1,0]],
  K:[[1,0,0,1],[1,0,1,0],[1,1,0,0],[1,0,1,0],[1,0,0,1]],
  L:[[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,1,1,1]],
  M:[[1,0,0,1],[1,1,1,1],[1,0,0,1],[1,0,0,1],[1,0,0,1]],
  N:[[1,0,0,1],[1,1,0,1],[1,0,1,1],[1,0,0,1],[1,0,0,1]],
  O:[[0,1,1,0],[1,0,0,1],[1,0,0,1],[1,0,0,1],[0,1,1,0]],
  P:[[1,1,1,0],[1,0,0,1],[1,1,1,0],[1,0,0,0],[1,0,0,0]],
  Q:[[0,1,1,0],[1,0,0,1],[1,0,0,1],[1,0,1,0],[0,1,0,1]],
  R:[[1,1,1,0],[1,0,0,1],[1,1,1,0],[1,0,1,0],[1,0,0,1]],
  S:[[0,1,1,1],[1,0,0,0],[0,1,1,0],[0,0,0,1],[1,1,1,0]],
  T:[[1,1,1,1],[0,1,1,0],[0,1,1,0],[0,1,1,0],[0,1,1,0]],
  U:[[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[0,1,1,0]],
  V:[[1,0,0,1],[1,0,0,1],[1,0,0,1],[0,1,0,1],[0,0,1,0]],
  W:[[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,1,1,1],[0,1,0,0]],
  X:[[1,0,0,1],[0,1,1,0],[0,0,1,0],[0,1,1,0],[1,0,0,1]],
  Y:[[1,0,0,1],[0,1,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0]],
  Z:[[1,1,1,1],[0,0,1,0],[0,1,0,0],[1,0,0,0],[1,1,1,1]],
  "!":[[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,0,0,0],[0,1,0,0]],
  "?":[[0,1,1,0],[1,0,0,1],[0,0,1,0],[0,0,0,0],[0,0,1,0]],
  " ":[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],
};

const COLS = 38, ROWS = 7, LW = 4, LH = 5, GAP = 1;

function textToGrid(text) {
  const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  const topPad = Math.floor((ROWS - LH) / 2);
  let col = 1;
  for (const ch of text.toUpperCase()) {
    const glyph = F[ch] || F[" "];
    const digit = letterToDigit(ch);
    for (let r = 0; r < LH; r++) {
      for (let c = 0; c < LW; c++) {
        if (glyph[r]?.[c] && digit !== null && col + c < COLS) {
          grid[topPad + r][col + c] = digit;
        }
      }
    }
    col += LW + GAP;
    if (col + LW > COLS) break;
  }
  return grid;
}

// ─── BabyZero JS flood-fill object counter ────────────────────────────────────
function babyZeroCount(grid) {
  const R = grid.length, C = grid[0].length;
  const vis = Array.from({ length: R }, () => Array(C).fill(false));
  let objects = 0;
  const colors = {};
  let totalLit = 0;
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (grid[r][c] !== null && !vis[r][c]) {
        objects++;
        const q = [[r, c]];
        while (q.length) {
          const [cr, cc] = q.pop();
          if (cr < 0 || cr >= R || cc < 0 || cc >= C || vis[cr][cc] || grid[cr][cc] === null) continue;
          vis[cr][cc] = true;
          totalLit++;
          const d = grid[cr][cc];
          colors[d] = (colors[d] || 0) + 1;
          q.push([cr - 1, cc], [cr + 1, cc], [cr, cc - 1], [cr, cc + 1]);
        }
      }
    }
  }
  const dominant = Object.entries(colors).sort(([, a], [, b]) => b - a)[0];
  const CNAME = { 0:"CYAN",1:"RED",2:"BLUE",3:"YELLOW",4:"GREEN",5:"ORANGE",6:"PURPLE",7:"PINK",8:"LIGHT",9:"DARK" };
  return {
    objects, totalLit, colors,
    dominant: dominant ? { digit: dominant[0], name: CNAME[dominant[0]], count: dominant[1] } : null,
  };
}

// ─── Boot sequence: rainbow diagonal stripes ──────────────────────────────────
function makeBootGrid() {
  return Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => String((c + r) % 10))
  );
}

const CNAME = { 0:"CYAN",1:"RED",2:"BLUE",3:"YELLOW",4:"GREEN",5:"ORANGE",6:"PURPLE",7:"PINK",8:"LIGHT",9:"DARK" };

export default function GeoZeroWidget() {
  const [inputText, setInputText]     = useState("");
  const [displayGrid, setDisplayGrid] = useState(() => Array.from({ length: ROWS }, () => Array(COLS).fill(null)));
  const [analysis, setAnalysis]       = useState(null);
  const [phase, setPhase]             = useState("BOOT");
  const [wasmStatus, setWasmStatus]   = useState("LOADING");
  const moireRef  = useRef(null);
  const engineRef = useRef(null);
  const rafRef    = useRef(null);
  const tRef      = useRef(0);

  // ── WASM boot ───────────────────────────────────────────────────────────────
  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const _load = new Function("u", "return import(u)");
        const me = await _load("/wasm/universe/momentum_engine.js");
        await me.default();
        if (dead) return;
        try { engineRef.current = new me.MoireEngine(320, 96); }
        catch { engineRef.current = me.MoireEngine.new(320, 96); }
        setWasmStatus("LIVE");
      } catch (e) {
        if (!dead) { console.warn("[GeoZero] WASM:", e); setWasmStatus("JS"); }
      }
    })();
    return () => { dead = true; };
  }, []);

  // ── Moire canvas ────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = moireRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function drawFallback(t) {
      ctx.fillStyle = "#06060f";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let x = 0; x < canvas.width; x += 6) {
        for (let y = 0; y < canvas.height; y += 6) {
          const v = (Math.sin(x * 0.05 + t) * Math.cos(y * 0.05 + t * 0.73) + 1) / 2;
          if (v > 0.72) {
            ctx.fillStyle = `rgba(0,255,210,${v * 0.3})`;
            ctx.fillRect(x, y, 2, 2);
          }
        }
      }
    }

    function tick() {
      tRef.current += 0.016;
      if (engineRef.current) {
        try {
          engineRef.current.tick();
          const px = engineRef.current.get_pixels?.();
          if (px) {
            const id = new ImageData(new Uint8ClampedArray(px), canvas.width, canvas.height);
            ctx.putImageData(id, 0, 0);
          } else drawFallback(tRef.current);
        } catch { drawFallback(tRef.current); }
      } else {
        drawFallback(tRef.current);
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    tick();
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  // ── Boot sequence ───────────────────────────────────────────────────────────
  useEffect(() => {
    setDisplayGrid(makeBootGrid());
    const t1 = setTimeout(() => setDisplayGrid(Array.from({ length: ROWS }, () => Array(COLS).fill(null))), 600);
    const t2 = setTimeout(() => setPhase("IDLE"), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // ── Think ───────────────────────────────────────────────────────────────────
  const think = useCallback((text) => {
    if (!text.trim()) return;
    setPhase("THINKING");
    setAnalysis(null);
    setDisplayGrid(Array.from({ length: ROWS }, () => Array(COLS).fill(null)));
    setTimeout(() => {
      const newGrid = textToGrid(text.trim());
      setDisplayGrid(newGrid);
      setPhase("ALIVE");
      setTimeout(() => setAnalysis(babyZeroCount(newGrid)), 400);
    }, 280);
  }, []);

  const handleKey = (e) => { if (e.key === "Enter") think(inputText); };

  const coloredChars = inputText.split("").map((ch, i) => {
    const d = letterToDigit(ch);
    return { ch, color: d !== null ? SYN[d] : "#444" };
  });

  const phaseColor = { BOOT: SYN["0"], IDLE: "#223", THINKING: SYN["3"], ALIVE: SYN["4"] };

  return (
    <div style={{ fontFamily: "'Space Mono', monospace", userSelect: "none" }}>

      {/* ── Canvas + grid overlay ── */}
      <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", marginBottom: 10 }}>
        <canvas
          ref={moireRef}
          width={320} height={96}
          style={{ display: "block", width: "100%", height: "auto", opacity: 0.9 }}
        />

        {/* Synesthetic cell grid */}
        <div style={{
          position: "absolute", inset: 0,
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
          padding: "3px 4px",
        }}>
          {Array.from({ length: ROWS }, (_, r) =>
            Array.from({ length: COLS }, (_, c) => {
              const d = displayGrid[r]?.[c];
              const lit = d !== null;
              const delay = `${(c * 9 + r * 5) % 200}ms`;
              return (
                <div key={`${r}-${c}`} style={{
                  borderRadius: 2, margin: "1px",
                  background: lit ? SYN[d] : "transparent",
                  boxShadow: lit ? `0 0 6px ${SYN[d]}aa` : "none",
                  opacity: lit ? 1 : 0,
                  transform: lit ? "scale(1)" : "scale(0.2)",
                  transition: `opacity 0.25s ease ${delay}, transform 0.25s ease ${delay}, background 0.15s, box-shadow 0.15s`,
                }} />
              );
            })
          )}
        </div>

        {/* Phase / WASM badge */}
        <div style={{ position: "absolute", bottom: 4, right: 8, display: "flex", gap: 8 }}>
          <span style={{ fontSize: 8, letterSpacing: 2, color: phaseColor[phase] || "#222" }}>{phase}</span>
          <span style={{ fontSize: 8, letterSpacing: 1,
            color: wasmStatus === "LIVE" ? SYN["4"] : wasmStatus === "LOADING" ? SYN["3"] : SYN["5"] }}>
            {wasmStatus === "LIVE" ? "◉ WASM" : wasmStatus === "LOADING" ? "○ BOOT" : "◌ JS"}
          </span>
        </div>
      </div>

      {/* ── Input ── */}
      <div style={{
        background: "#07070f",
        border: `1px solid ${phaseColor[phase] || "#111"}44`,
        borderRadius: 8, padding: "10px 14px", marginBottom: 8,
        transition: "border-color 0.4s",
      }}>
        <div style={{ minHeight: 20, marginBottom: 6, fontSize: 15, letterSpacing: 4, lineHeight: 1 }}>
          {coloredChars.length > 0
            ? coloredChars.map(({ ch, color }, i) => (
                <span key={i} style={{ color, textShadow: `0 0 10px ${color}88` }}>{ch}</span>
              ))
            : <span style={{ fontSize: 9, color: "#222", letterSpacing: 3 }}>SPEAK TO ME</span>
          }
        </div>
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value.slice(0, 7))}
          onKeyDown={handleKey}
          placeholder="type a word · press enter"
          maxLength={7}
          style={{
            background: "transparent", border: "none", outline: "none",
            color: "#444", fontSize: 9, width: "100%", letterSpacing: 2,
          }}
        />
      </div>

      {/* ── BabyZero analysis ── */}
      {analysis && (
        <div style={{
          background: "#050510",
          border: `1px solid ${SYN["0"]}18`,
          borderRadius: 8, padding: "10px 14px",
          animation: "gzFadeIn 0.4s ease",
        }}>
          <div style={{ fontSize: 9, color: SYN["0"], letterSpacing: 3, marginBottom: 6 }}>
            ▸ BABYZERO PERCEIVES
          </div>
          <div style={{ fontSize: 10, color: "#777", letterSpacing: 1, lineHeight: 2 }}>
            <span style={{ color: SYN["3"] }}>{analysis.objects}</span>{" "}
            {analysis.objects === 1 ? "object" : "objects"} ·{" "}
            <span style={{ color: SYN["2"] }}>{analysis.totalLit}</span> lit cells
            {analysis.dominant && (
              <>
                {" "}· primary tone{" "}
                <span style={{ color: SYN[analysis.dominant.digit], textShadow: `0 0 8px ${SYN[analysis.dominant.digit]}88` }}>
                  {analysis.dominant.name}
                </span>
              </>
            )}
          </div>
          {Object.keys(analysis.colors).length > 0 && (
            <div style={{ display: "flex", gap: 5, marginTop: 8, flexWrap: "wrap" }}>
              {Object.entries(analysis.colors)
                .sort(([, a], [, b]) => b - a)
                .map(([d, n]) => (
                  <span key={d} style={{
                    background: SYN[d] + "15",
                    border: `1px solid ${SYN[d]}44`,
                    borderRadius: 4, padding: "2px 8px",
                    fontSize: 9, color: SYN[d], letterSpacing: 1,
                  }}>
                    {CNAME[d]} ×{n}
                  </span>
                ))}
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes gzFadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }`}</style>
    </div>
  );
}
