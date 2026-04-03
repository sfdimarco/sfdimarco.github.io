import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SYN } from "../constants/syn";
import Tag from "../components/Tag";

// ── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const palette = {
    DEV:   { bg: SYN["1"] + "18", border: SYN["1"] + "55", color: SYN["1"] },
    BETA:  { bg: SYN["3"] + "18", border: SYN["3"] + "55", color: SYN["3"] },
    READY: { bg: SYN["4"] + "18", border: SYN["4"] + "55", color: SYN["4"] },
  };
  const p = palette[status] || palette.DEV;
  return (
    <span style={{
      fontFamily: "'Space Mono', monospace",
      fontSize: 9, letterSpacing: 3,
      padding: "3px 10px", borderRadius: 3,
      background: p.bg, border: `1px solid ${p.border}`, color: p.color,
    }}>
      {status === "DEV" ? "● DEV" : status === "BETA" ? "◐ BETA" : "✓ READY"}
    </span>
  );
}

// ── SYN color labels ─────────────────────────────────────────────────────────
const SYN_INFO = [
  { d: "0", name: "CYAN",   note: "the void — zero, nothing, everything" },
  { d: "1", name: "RED",    note: "one, primary, the start" },
  { d: "2", name: "BLUE",   note: "two, even, cool" },
  { d: "3", name: "YELLOW", note: "three, bright, prime" },
  { d: "4", name: "GREEN",  note: "four — dyslexia lives here with 5" },
  { d: "5", name: "ORANGE", note: "five — flips with 4 sometimes" },
  { d: "6", name: "PURPLE", note: "six — sometimes swaps with 7" },
  { d: "7", name: "PINK",   note: "seven — sometimes swaps with 6" },
  { d: "8", name: "LIGHT",  note: "eight — near-white, flips with 9" },
  { d: "9", name: "DARK",   note: "nine — near-black, flips with 8" },
];

// Letter→digit: a=1, b=2...cycle mod 10, for color display
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter, i) => {
  const num = i + 1;
  const digits = String(num).split("");
  const primary = digits[0] === "1" && digits[1] ? digits[1] : digits[0];
  return { letter, num, digit: primary, color: SYN[String(num % 10)] };
});

// ── SynPaintCanvas (inline synesthesia teaching tool) ─────────────────────────
function SynPaintCanvas() {
  const canvasRef = useRef(null);
  const paintState = useRef({ painting: false, last: null });
  const [cleared, setCleared] = useState(0);
  const [selectedDigit, setSelectedDigit] = useState("1");
  const [tab, setTab] = useState("NUMBERS");

  useEffect(() => {
    if (tab !== "PAINT") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight || 260;
    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      return e.touches
        ? { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
        : { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const startPaint = (e) => {
      e.preventDefault();
      paintState.current.painting = true;
      paintState.current.last = getPos(e);
    };
    const paint = (e) => {
      e.preventDefault();
      if (!paintState.current.painting) return;
      const pos = getPos(e);
      const color = SYN[selectedDigit];
      ctx.beginPath();
      ctx.moveTo(paintState.current.last.x, paintState.current.last.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = 6;
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.shadowBlur = 10; ctx.shadowColor = color;
      ctx.globalAlpha = 0.9;
      ctx.stroke();
      ctx.shadowBlur = 0; ctx.globalAlpha = 1;
      paintState.current.last = pos;
    };
    const stopPaint = () => { paintState.current.painting = false; };
    canvas.addEventListener("mousedown", startPaint);
    canvas.addEventListener("mousemove", paint);
    canvas.addEventListener("mouseup", stopPaint);
    canvas.addEventListener("mouseleave", stopPaint);
    canvas.addEventListener("touchstart", startPaint, { passive: false });
    canvas.addEventListener("touchmove", paint, { passive: false });
    canvas.addEventListener("touchend", stopPaint);
    return () => {
      canvas.removeEventListener("mousedown", startPaint);
      canvas.removeEventListener("mousemove", paint);
      canvas.removeEventListener("mouseup", stopPaint);
      canvas.removeEventListener("mouseleave", stopPaint);
      canvas.removeEventListener("touchstart", startPaint);
      canvas.removeEventListener("touchmove", paint);
      canvas.removeEventListener("touchend", stopPaint);
    };
  }, [tab, selectedDigit, cleared]);

  const tabStyle = (active) => ({
    fontFamily: "'Space Mono', monospace",
    fontSize: 9, letterSpacing: 3,
    padding: "5px 14px", border: "none", borderRadius: 4, cursor: "pointer",
    background: active ? SYN["2"] + "33" : "transparent",
    color: active ? SYN["2"] : "var(--text-dim)",
    transition: "all 0.2s",
  });

  return (
    <div style={{ background: "#0a0a0f", borderRadius: 10, overflow: "hidden", border: "1px solid #1a1a2a" }}>
      <div style={{ padding: "16px 20px 0", borderBottom: "1px solid #1a1a2a" }}>
        <div style={{ fontSize: 9, color: SYN["7"] + "cc", letterSpacing: 3, marginBottom: 6, fontFamily: "'Space Mono',monospace" }}>
          GRAPHEME-COLOR SYNESTHESIA
        </div>
        <p style={{ color: "#888", fontSize: 11, lineHeight: 1.7, margin: "0 0 12px" }}>
          I see numbers as colors — not as a metaphor. It's a neurological cross-wire. Every digit has had the same color since childhood. This is my system.
        </p>
        <div style={{ display: "flex", gap: 4, marginBottom: -1 }}>
          {["NUMBERS", "LETTERS", "PAINT"].map((t) => (
            <button key={t} onClick={() => setTab(t)} style={tabStyle(tab === t)}>{t}</button>
          ))}
        </div>
      </div>

      {tab === "NUMBERS" && (
        <div style={{ padding: "16px 20px 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
            {SYN_INFO.map(({ d, name, note }) => (
              <div key={d} style={{
                background: SYN[d] + "18", border: `1px solid ${SYN[d]}44`,
                borderRadius: 8, padding: "10px 8px", textAlign: "center",
              }}>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 28, fontWeight: 700, color: SYN[d], lineHeight: 1,
                  textShadow: `0 0 16px ${SYN[d]}88`, marginBottom: 4,
                }}>{d}</div>
                <div style={{ fontSize: 8, color: SYN[d] + "cc", letterSpacing: 2 }}>{name}</div>
                <div style={{ fontSize: 8, color: "#555", marginTop: 4, lineHeight: 1.4 }}>{note}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, padding: "10px 14px", background: "#ffffff08", borderRadius: 6, border: "1px solid #1a1a2a" }}>
            <div style={{ fontSize: 9, color: "#666", lineHeight: 1.7 }}>
              <span style={{ color: SYN["4"] }}>4 and 5</span> swap on me sometimes — they look the same spatially.
              So do <span style={{ color: SYN["6"] }}>6</span> and <span style={{ color: SYN["7"] }}>7</span>, and <span style={{ color: SYN["8"] }}>8</span> and <span style={{ color: SYN["9"] }}>9</span>.
              The associations are fixed but dyslexia makes them hard to access consistently.
            </div>
          </div>
        </div>
      )}

      {tab === "LETTERS" && (
        <div style={{ padding: "16px 20px 20px" }}>
          <p style={{ color: "#666", fontSize: 10, lineHeight: 1.6, margin: "0 0 12px" }}>
            Letters encode as numbers: A=1, B=2 … J=10, K=11 … The color of each letter comes from its digits.
            Multi-digit = multiple colors bleeding together.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(9, 1fr)", gap: 5 }}>
            {LETTERS.map(({ letter, num, color }) => (
              <div key={letter} style={{
                background: color + "1a", border: `1px solid ${color}33`,
                borderRadius: 6, padding: "8px 4px", textAlign: "center",
              }}>
                <div style={{
                  fontFamily: "'Space Mono', monospace", fontSize: 16, fontWeight: 700,
                  color: color, textShadow: `0 0 10px ${color}66`, lineHeight: 1,
                }}>{letter}</div>
                <div style={{ fontSize: 7, color: color + "99", marginTop: 2 }}>{num}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, padding: "10px 14px", background: "#ffffff08", borderRadius: 6, border: "1px solid #1a1a2a" }}>
            <div style={{ fontSize: 9, color: "#666", lineHeight: 1.7 }}>
              Words have a color texture. "MOOK" → M(13)=yellow, O(15)=orange, O(15)=orange, K(11)=red.
              It's not decorative — it's how memory works for me.
            </div>
          </div>
        </div>
      )}

      {tab === "PAINT" && (
        <div style={{ padding: "12px 16px 16px" }}>
          <p style={{ color: "#555", fontSize: 10, margin: "0 0 10px" }}>
            Select a digit. Draw in its color. This is how I see it.
          </p>
          <div style={{ display: "flex", gap: 5, marginBottom: 10, flexWrap: "wrap" }}>
            {SYN_INFO.map(({ d }) => (
              <button key={d} onClick={() => setSelectedDigit(d)} style={{
                width: 32, height: 32, border: `2px solid ${SYN[d]}`,
                borderRadius: 6, cursor: "pointer",
                background: selectedDigit === d ? SYN[d] : SYN[d] + "22",
                color: selectedDigit === d ? "#000" : SYN[d],
                fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 14,
                textShadow: selectedDigit === d ? "none" : `0 0 8px ${SYN[d]}`,
                transition: "all 0.15s",
              }}>{d}</button>
            ))}
            <span style={{ fontSize: 9, color: "#555", alignSelf: "center", marginLeft: 4 }}>
              = <span style={{ color: SYN[selectedDigit] }}>{SYN_INFO[parseInt(selectedDigit)].name}</span>
            </span>
          </div>
          <canvas ref={canvasRef} style={{
            width: "100%", height: 220, display: "block",
            background: "#040408", borderRadius: 8,
            border: `1px solid ${SYN[selectedDigit]}33`,
            cursor: "crosshair", touchAction: "none",
          }} />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <button onClick={() => {
              const c = canvasRef.current;
              if (c) c.getContext("2d").clearRect(0, 0, c.width, c.height);
              setCleared(x => x + 1);
            }} style={{
              background: "transparent", border: "1px solid #333", color: "#555",
              fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: 2,
              padding: "4px 12px", borderRadius: 4, cursor: "pointer",
            }}>CLEAR</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── NumberRain (inline experiment) ────────────────────────────────────────────
function NumberRain() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const synColors = Object.values(SYN);
    const cols = Math.floor(canvas.width / 20);
    const drops = Array.from({ length: cols }, () => Math.random() * -canvas.height);
    let raf;
    const draw = () => {
      ctx.fillStyle = "rgba(5,5,5,0.06)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < cols; i++) {
        const digit = String(Math.floor(Math.random() * 10));
        const color = synColors[parseInt(digit)];
        ctx.fillStyle = color;
        ctx.font = "14px 'Space Mono', monospace";
        ctx.shadowBlur = 6; ctx.shadowColor = color;
        ctx.fillText(digit, i * 20, drops[i]);
        ctx.shadowBlur = 0;
        if (drops[i] > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 16;
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <canvas ref={canvasRef} style={{
      width: "100%", height: 240, display: "block",
      background: "#050505", borderRadius: 10, border: "1px solid #1a1a1a",
    }} />
  );
}

// ── Tool registry ─────────────────────────────────────────────────────────────
const TOOLS = [
  {
    id: "robot-dog",
    title: "ROBOT DOG AI",
    tagline: "Neural Network / Three.js",
    accent: SYN["2"],
    status: "DEV",
    desc: "A robot dog learns to walk toward a bone using a simple neural network and evolutionary mutation. Watch the brain connections light up in real time. Three.js 3D world + canvas brain visualizer.",
    tags: ["Three.js", "Neural Network", "Evolutionary AI", "Educational"],
    type: "external",
    href: "/tools/robot-dog.html",
  },
  {
    id: "synpaint",
    title: "SYN PAINT",
    tagline: "Grapheme-Color Synesthesia / Interactive",
    accent: SYN["7"],
    status: "BETA",
    desc: "An interactive explainer for my synesthetic number-color system. Browse the 10 digit-color mappings, see the full alphabet encoded by its numeric values, and draw in any digit's color — the same system that lives in every project I build.",
    tags: ["Synesthesia", "Education", "Canvas", "Color System", "Interactive"],
    type: "inline",
    component: SynPaintCanvas,
  },
  {
    id: "rain",
    title: "NUMBER RAIN",
    tagline: "Canvas / Matrix",
    accent: SYN["4"],
    status: "BETA",
    desc: "A matrix-style rain of digits — each falling in its synesthetic color. Raw Canvas API, same building blocks as the MOOK SYNTH waveform.",
    tags: ["Canvas", "Synesthesia", "Animation"],
    type: "inline",
    component: NumberRain,
  },
  {
    id: "mook-synth",
    title: "MOOK SYNTH",
    tagline: "Web Audio API / React",
    accent: SYN["5"],
    status: "DEV",
    desc: "A browser-based music instrument built for 4th graders. Synesthetic color keys mapped to sound frequencies. Still has bugs — active development.",
    tags: ["Web Audio API", "React", "Educational", "Music"],
    type: "external",
    href: "/mook-synth.html",
  },
  {
    id: "quadtree-vision",
    title: "QUADTREE VISION",
    tagline: "Binary Quadtree / .geoi Format / Z-Order",
    accent: SYN["5"],
    status: "BETA",
    desc: "Encode any image into the .geoi binary quadtree format — then decode it back. The Z-order spatial tree captures image detail hierarchically: slide the progressive decode depth to watch it sharpen from blobs to pixels. Building .geoi into a real image codec.",
    tags: ["Binary Quadtree", "Image Compression", "Z-Order", "Canvas", ".geoi"],
    type: "external",
    href: "/tools/quadtree-vision.html",
  },
  {
    id: "momentumlab",
    title: "MOMENTUMLAB",
    tagline: "Visual Coding / Blockly / p5.js / AI Coach",
    accent: SYN["0"],
    status: "BETA",
    desc: "A Scratch-style visual coding playground for 4th-5th graders. Snap colorful Blockly blocks together and watch live p5.js output appear instantly. An AI coach guides students through game-making without doing it for them.",
    tags: ["Blockly", "p5.js", "AI Coach", "EdTech", "K-8", "Gemini"],
    type: "external",
    href: "https://sfdimarco.github.io/p5-blocky-coding/",
  },
];

// ── Tool card ─────────────────────────────────────────────────────────────────
function ToolCard({ tool, i }) {
  const [open, setOpen] = useState(false);
  const Comp = tool.component;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.08, duration: 0.5 }}
      style={{
        background: "var(--card-bg)",
        border: `1px solid ${open ? tool.accent + "44" : "var(--border)"}`,
        borderRadius: 14, overflow: "hidden",
        boxShadow: open ? `0 0 32px ${tool.accent}18` : "none",
        transition: "border 0.3s, box-shadow 0.3s",
      }}
    >
      {tool.type === "inline" && Comp && (
        <div style={{ pointerEvents: open ? "auto" : "none", opacity: open ? 1 : 0.5, transition: "opacity 0.3s" }}>
          <Comp />
        </div>
      )}
      {tool.type === "embed" && open && (
        <iframe
          src={tool.src}
          title={tool.title}
          allow="scripts"
          style={{ width: "100%", height: 580, border: "none", display: "block" }}
        />
      )}
      <div style={{
        height: 2,
        background: `linear-gradient(90deg, transparent, ${tool.accent}, transparent)`,
        opacity: open ? 1 : 0.3, transition: "opacity 0.3s",
      }} />
      <div style={{ padding: "20px 24px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(16px, 2vw, 20px)", color: "var(--text)",
          }}>{tool.title}</div>
          <StatusBadge status={tool.status} />
        </div>
        <div style={{
          color: tool.accent, fontFamily: "'Space Mono', monospace",
          fontSize: 10, letterSpacing: 2, marginBottom: 10,
        }}>{tool.tagline}</div>
        <p style={{ color: "var(--text-muted)", fontSize: 12, lineHeight: 1.75, margin: "0 0 14px" }}>
          {tool.desc}
        </p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
          {tool.tags.map((t) => <Tag key={t} color={tool.accent}>{t}</Tag>)}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {(tool.type === "inline" || tool.type === "embed") && (
            <button onClick={() => setOpen(!open)} style={{
              background: open ? tool.accent : "transparent",
              color: open ? "#000" : tool.accent,
              border: `1px solid ${tool.accent}`,
              fontFamily: "'Space Mono', monospace", fontWeight: 700,
              fontSize: 10, letterSpacing: 2,
              padding: "7px 18px", borderRadius: 6, cursor: "pointer",
              transition: "all 0.2s",
            }}>
              {open ? "◼ CLOSE" : "▶ OPEN"}
            </button>
          )}
          {tool.type === "external" && (
            <a href={tool.href} target="_blank" rel="noreferrer" style={{
              background: "transparent", color: tool.accent,
              border: `1px solid ${tool.accent}`,
              fontFamily: "'Space Mono', monospace", fontWeight: 700,
              fontSize: 10, letterSpacing: 2,
              padding: "7px 18px", borderRadius: 6,
              textDecoration: "none", display: "inline-block",
              transition: "all 0.2s",
            }}>
              ↗ LAUNCH
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Lab Page ──────────────────────────────────────────────────────────────────
export default function Lab() {
  return (
    <div style={{ minHeight: "100vh", paddingTop: 80, background: "var(--bg)" }}>
      <section style={{ padding: "48px 24px 32px", maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ fontSize: 10, color: SYN["4"], letterSpacing: 6, marginBottom: 16 }}>
            THE WORKSHOP
          </div>
          <h1 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(28px, 5vw, 52px)", color: "var(--text)",
            fontWeight: 400, lineHeight: 1.15, margin: "0 0 20px",
          }}>
            Tools in progress.<br />
            <em style={{ color: SYN["4"] }}>Try them anyway.</em>
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.85, maxWidth: 480, margin: "0 auto" }}>
            This is the workshop, not the gallery. Things break here.
            That's the point — this is where I figure out what they are.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
            {[
              { status: "DEV", label: "active dev — things will break" },
              { status: "BETA", label: "mostly working" },
              { status: "READY", label: "ready to share" },
            ].map(({ status, label }) => (
              <div key={status} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <StatusBadge status={status} />
                <span style={{ fontSize: 10, color: "var(--text-dim)", letterSpacing: 1 }}>{label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <div style={{ display: "flex", height: 2, margin: "0 24px 48px" }}>
        {Object.entries(SYN).map(([d, c]) => (
          <motion.div key={d} style={{ flex: 1, background: c }}
            initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
            transition={{ delay: parseInt(d) * 0.04, duration: 0.4 }}
          />
        ))}
      </div>

      <section style={{ padding: "0 24px 80px", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(440px, 1fr))", gap: 24 }}>
          {TOOLS.map((tool, i) => (
            <ToolCard key={tool.id} tool={tool} i={i} />
          ))}
        </div>
        <div style={{ marginTop: 48, textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "var(--text-dim)", letterSpacing: 4, marginBottom: 16 }}>
            WHAT'S NEXT
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            {["Particle Playground", "Three.js Point Cloud", "Shader Editor", "Audio Visualizer", "GSAP Text Morph"].map((t) => (
              <div key={t} style={{
                border: "1px solid var(--border)", borderRadius: 6,
                padding: "6px 14px", fontSize: 10, color: "var(--text-dim)",
                letterSpacing: 2, fontFamily: "'Space Mono', monospace",
              }}>{t}</div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
