import { useRef, useEffect, useState, useCallback } from "react";
import { SYN } from "../constants/syn";

// ─── constants ────────────────────────────────────────────────────────────────
const ROWS = 8, COLS = 8, CELL = 30;
const COLOR_NAMES = ["CYAN","RED","BLUE","YELLOW","GREEN","ORANGE","PURPLE","PINK","WHITE","BLACK"];
const REGION_NAMES = ["TOP-LEFT","TOP-RIGHT","BOTTOM-LEFT","BOTTOM-RIGHT"];

const emptyGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0));
const packGrid  = (g) => new Uint8Array([ROWS, COLS, ...g.flat()]);

// JS fallback flood-fill object counter (no WASM)
function countObjectsJS(grid) {
  const visited = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  let count = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] !== 0 && !visited[r][c]) {
        count++;
        const queue = [[r, c]];
        while (queue.length) {
          const [cr, cc] = queue.pop();
          if (cr < 0 || cr >= ROWS || cc < 0 || cc >= COLS) continue;
          if (visited[cr][cc]) continue;
          if (grid[cr][cc] === 0) continue;
          visited[cr][cc] = true;
          queue.push([cr-1,cc],[cr+1,cc],[cr,cc-1],[cr,cc+1]);
        }
      }
    }
  }
  return count;
}

// ─── component ────────────────────────────────────────────────────────────────
export default function GeoZeroWidget() {
  const bgRef   = useRef(null);
  const wasmRef = useRef({ bz: null, engine: null });
  const animRef = useRef(null);
  const mouseRef = useRef({ down: false });

  const [grid, setGrid]         = useState(emptyGrid);
  const [selColor, setSelColor] = useState(1);
  const [count, setCount]       = useState(null);
  const [energy, setEnergy]     = useState(0.0);
  const [region, setRegion]     = useState(0);
  const [wasmStatus, setWasmStatus] = useState("LOADING"); // LOADING | LIVE | JS
  const [flash, setFlash]       = useState(false);

  // ── WASM boot ──────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Indirect import: prevents rolldown (Vite 8) static analysis on public WASM paths
        const _load = new Function('u', 'return import(u)');
        const [bzMod, meMod] = await Promise.all([
          _load("/wasm/babyzero/babyzero_wasm.js"),
          _load("/wasm/universe/momentum_engine.js"),
        ]);
        await Promise.all([bzMod.default(), meMod.default()]);
        if (cancelled) return;
        wasmRef.current.bz = bzMod;
        // Try constructor then static factory
        try {
          wasmRef.current.engine = new meMod.MoireEngine(320, 200);
        } catch (_) {
          wasmRef.current.engine = meMod.MoireEngine.new(320, 200);
        }
        setWasmStatus("LIVE");
      } catch (e) {
        if (!cancelled) { console.warn("[GeoZero] WASM:", e); setWasmStatus("JS"); }
      }
    })();
    return () => {
      cancelled = true;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  // ── MoireEngine / JS-fallback canvas loop ─────────────────────────────────
  useEffect(() => {
    if (wasmStatus === "LOADING") return;
    const canvas = bgRef.current;
    if (!canvas) return;
    const ctx   = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const engine = wasmRef.current.engine;
    let last = performance.now(), t = 0;

    const frame = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now; t += dt;

      let e = 0, r = 0;
      if (engine) {
        try { engine.tick(dt); e = engine.get_interference_energy(); r = engine.get_dominant_warp_region(); }
        catch (_) {}
      } else {
        // Pure JS moiré signal
        e = 0.35 + 0.35 * Math.sin(t * 0.7);
        r = Math.floor(((t * 0.13) % 1) * 4);
      }
      setEnergy(e); setRegion(r);

      // ── Draw interference mesh ──────────────────────────────────────────
      ctx.clearRect(0, 0, W, H);
      const freq1 = 14 + e * 10, freq2 = 15 + e * 8;
      const phase = t * 0.6;

      ctx.lineWidth = 0.5;
      ctx.strokeStyle = SYN["2"] + "28";
      for (let y = 0; y < H; y += H / freq1) {
        ctx.beginPath(); ctx.moveTo(0, y);
        ctx.lineTo(W, y + Math.sin(phase + y * 0.06) * 5 * e); ctx.stroke();
      }
      for (let x = 0; x < W; x += W / freq1) {
        ctx.beginPath(); ctx.moveTo(x, 0);
        ctx.lineTo(x + Math.sin(phase + x * 0.06) * 5 * e, H); ctx.stroke();
      }

      ctx.strokeStyle = SYN["7"] + "18";
      const angle = 0.28, co = Math.cos(angle), si = Math.sin(angle);
      for (let i = -W; i < W * 2; i += W / freq2) {
        ctx.beginPath();
        ctx.moveTo(i * co, i * si);
        ctx.lineTo(i * co - H * si, i * si + H * co); ctx.stroke();
      }

      // Quadrant pulse glow
      const qx = (r === 1 || r === 3) ? W / 2 : 0;
      const qy = (r === 2 || r === 3) ? H / 2 : 0;
      const qCol = [SYN["1"], SYN["3"], SYN["2"], SYN["5"]][r] || SYN["4"];
      const grd = ctx.createRadialGradient(qx + W/4, qy + H/4, 0, qx + W/4, qy + H/4, W * 0.4);
      grd.addColorStop(0, qCol + "20"); grd.addColorStop(1, "transparent");
      ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);

      animRef.current = requestAnimationFrame(frame);
    };
    animRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animRef.current);
  }, [wasmStatus]);

  // ── Cell paint ─────────────────────────────────────────────────────────────
  const paintCell = useCallback((r, c) => {
    setGrid(prev => {
      const next = prev.map(row => [...row]);
      if (next[r][c] === selColor) return prev; // no change
      next[r][c] = selColor;
      const packed = packGrid(next);
      let n = countObjectsJS(next);
      if (wasmRef.current.bz) {
        try { n = wasmRef.current.bz.count_objects(packed); } catch (_) {}
      }
      setCount(n);
      setFlash(true);
      setTimeout(() => setFlash(false), 200);
      return next;
    });
  }, [selColor]);

  const eraseCell = useCallback((r, c) => {
    setGrid(prev => {
      if (prev[r][c] === 0) return prev;
      const next = prev.map(row => [...row]);
      next[r][c] = 0;
      setCount(countObjectsJS(next));
      return next;
    });
  }, []);

  const handleMouse = (r, c, evtType, button) => {
    if (evtType === "down") {
      mouseRef.current.down = true;
      button === 2 ? eraseCell(r, c) : paintCell(r, c);
    }
    if (evtType === "enter" && mouseRef.current.down) paintCell(r, c);
  };

  const clearGrid = () => { setGrid(emptyGrid()); setCount(null); };

  // ── Status dot ─────────────────────────────────────────────────────────────
  const statusColor = { LOADING: SYN["3"], LIVE: SYN["4"], JS: SYN["5"] }[wasmStatus];
  const statusLabel = { LOADING: "BOOTING", LIVE: "WASM LIVE", JS: "JS MODE" }[wasmStatus];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      style={{ background: "#050508", borderRadius: 10, overflow: "hidden", position: "relative", userSelect: "none" }}
      onMouseUp={() => { mouseRef.current.down = false; }}
      onMouseLeave={() => { mouseRef.current.down = false; }}
      onContextMenu={e => e.preventDefault()}
    >
      {/* MoireEngine background */}
      <canvas ref={bgRef} width={640} height={360}
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0.55, pointerEvents: "none" }} />

      {/* Widget body */}
      <div style={{ position: "relative", zIndex: 1, padding: "16px 18px 18px" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 3, color: SYN["4"] + "cc" }}>
            GEOZERO
          </div>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor, boxShadow: `0 0 6px ${statusColor}` }} />
          <div style={{ fontSize: 8, color: "#444", letterSpacing: 2, fontFamily: "'Space Mono',monospace" }}>
            {statusLabel}
          </div>
        </div>

        {/* ── Layout: grid + panel ── */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}>

          {/* Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`,
            gridTemplateRows:    `repeat(${ROWS}, ${CELL}px)`,
            gap: 2,
          }}>
            {grid.map((row, r) => row.map((val, c) => (
              <div key={`${r}-${c}`}
                onMouseDown={e => handleMouse(r, c, "down", e.button)}
                onMouseEnter={() => handleMouse(r, c, "enter", 0)}
                style={{
                  width: CELL, height: CELL, borderRadius: 3, cursor: "crosshair",
                  background: val === 0 ? "#0b0b14" : SYN[String(val)],
                  border: `1px solid ${val === 0 ? "#181826" : SYN[String(val)] + "66"}`,
                  boxShadow: val !== 0 ? `0 0 7px ${SYN[String(val)]}55` : "none",
                  transition: "background 0.08s, box-shadow 0.08s",
                }}
              />
            )))}
          </div>

          {/* Right panel */}
          <div style={{ flex: 1, minWidth: 130, display: "flex", flexDirection: "column", gap: 10 }}>

            {/* Color picker */}
            <div>
              <div style={{ fontSize: 8, color: "#333", letterSpacing: 3, marginBottom: 5, fontFamily: "'Space Mono',monospace" }}>
                PAINT
              </div>
              <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                {Array.from({ length: 10 }, (_, i) => (
                  <button key={i} title={`${i} — ${COLOR_NAMES[i]}`}
                    onClick={() => setSelColor(i)}
                    style={{
                      width: 22, height: 22, borderRadius: 4, cursor: "pointer", border: "none",
                      background: selColor === i ? SYN[String(i)] : SYN[String(i)] + "2a",
                      outline: selColor === i ? `2px solid ${SYN[String(i)]}` : "none",
                      outlineOffset: 2,
                      boxShadow: selColor === i ? `0 0 8px ${SYN[String(i)]}` : "none",
                      transition: "all 0.12s",
                    }}
                  />
                ))}
              </div>
              <div style={{ fontSize: 8, color: SYN[String(selColor)], marginTop: 4, fontFamily: "'Space Mono',monospace", letterSpacing: 2 }}>
                {selColor} — {COLOR_NAMES[selColor]}
              </div>
            </div>

            {/* BabyZero readout */}
            <div style={{ background: "#08080f", border: "1px solid #181824", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 8, color: "#333", letterSpacing: 3, marginBottom: 5, fontFamily: "'Space Mono',monospace" }}>
                BABYZERO SEES
              </div>
              {count === null
                ? <div style={{ fontSize: 9, color: "#252530", fontFamily: "'Space Mono',monospace" }}>paint to begin</div>
                : <>
                    <div style={{
                      fontFamily: "'DM Serif Display',Georgia,serif",
                      fontSize: 32, lineHeight: 1,
                      color: flash ? SYN[String(count % 10)] : SYN[String(count % 10)] + "cc",
                      textShadow: `0 0 24px ${SYN[String(count % 10)]}${flash ? "cc" : "44"}`,
                      transition: "color 0.15s, text-shadow 0.15s",
                    }}>{count}</div>
                    <div style={{ fontSize: 8, color: "#444", marginTop: 4, fontFamily: "'Space Mono',monospace", letterSpacing: 1 }}>
                      {count === 0 ? "void — nothing" : count === 1 ? "one object" : `${count} objects`}
                    </div>
                  </>
              }
            </div>

            {/* MoireEngine readout */}
            <div style={{ background: "#08080f", border: "1px solid #181824", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 8, color: "#333", letterSpacing: 3, marginBottom: 8, fontFamily: "'Space Mono',monospace" }}>
                HIVE FIELD
              </div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 7, color: "#2a2a36", letterSpacing: 2, marginBottom: 3, fontFamily: "'Space Mono',monospace" }}>
                  ENERGY
                </div>
                <div style={{ height: 3, background: "#0e0e1a", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 2,
                    width: `${energy * 100}%`,
                    background: `linear-gradient(90deg, ${SYN["2"]}, ${SYN["5"]})`,
                    boxShadow: `0 0 6px ${SYN["5"]}`,
                    transition: "width 0.08s",
                  }} />
                </div>
              </div>
              <div style={{ fontSize: 7, color: "#2a2a36", letterSpacing: 2, marginBottom: 3, fontFamily: "'Space Mono',monospace" }}>
                DOMINANT QUADRANT
              </div>
              <div style={{ fontSize: 9, color: [SYN["1"],SYN["3"],SYN["2"],SYN["5"]][region] || SYN["4"], fontFamily: "'Space Mono',monospace", letterSpacing: 1 }}>
                {REGION_NAMES[region] || "—"}
              </div>
            </div>

            {/* Controls */}
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={clearGrid} style={{
                flex: 1, background: "transparent", border: "1px solid #1a1a26", color: "#333",
                fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: 2,
                padding: "6px 8px", borderRadius: 4, cursor: "pointer",
              }}>CLEAR</button>
            </div>

            <div style={{ fontSize: 8, color: "#1e1e28", lineHeight: 1.6, fontFamily: "'Space Mono',monospace" }}>
              drag to paint<br />right-click erase
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
