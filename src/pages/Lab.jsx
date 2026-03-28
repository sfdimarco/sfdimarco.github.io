import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SYN } from "../constants/syn";
import Tag from "../components/Tag";

function SynPaintCanvas() {
  const canvasRef = useRef(null);
  const state = useRef({ painting: false, last: null });
  const [cleared, setCleared] = useState(false);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;
    const ctx = canvas.getContext("2d");
    const getColor = x => { const synColors = Object.values(SYN); return synColors[Math.min(Math.floor((x/canvas.width)*synColors.length), synColors.length-1)]; };
    const getPos = e => { const r = canvas.getBoundingClientRect(); return e.touches ? { x:e.touches[0].clientX-r.left, y:e.touches[0].clientY-r.top } : { x:e.clientX-r.left, y:e.clientY-r.top }; };
    const startPaint = e => { e.preventDefault(); state.current.painting=true; state.current.last=getPos(e); };
    const paint = e => {
      e.preventDefault(); if (!state.current.painting) return;
      const pos = getPos(e), last = state.current.last, color = getColor(pos.x);
      ctx.beginPath(); ctx.moveTo(last.x,last.y); ctx.lineTo(pos.x,pos.y);
      ctx.strokeStyle=color; ctx.lineWidth=8; ctx.lineCap="round"; ctx.lineJoin="round";
      ctx.shadowBlur=8; ctx.shadowColor=color; ctx.globalAlpha=0.85; ctx.stroke();
      ctx.shadowBlur=0; ctx.globalAlpha=1; state.current.last=pos;
    };
    const stopPaint = () => { state.current.painting=false; };
    canvas.addEventListener("mousedown",startPaint); canvas.addEventListener("mousemove",paint);
    canvas.addEventListener("mouseup",stopPaint); canvas.addEventListener("mouseleave",stopPaint);
    canvas.addEventListener("touchstart",startPaint,{passive:false}); canvas.addEventListener("touchmove",paint,{passive:false});
    canvas.addEventListener("touchend",stopPaint);
    return () => {
      canvas.removeEventListener("mousedown",startPaint); canvas.removeEventListener("mousemove",paint);
      canvas.removeEventListener("mouseup",stopPaint); canvas.removeEventListener("mouseleave",stopPaint);
    };
  }, [cleared]);
  const clear = () => { const c = canvasRef.current; if(c) c.getContext("2d").clearRect(0,0,c.width,c.height); setCleared(x=>!x); };
  return (
    <div style={{ position:"relative" }}>
      <canvas ref={canvasRef} style={{ width:"100%", height:320, display:"block", background:"#050505", borderRadius:12, border:"1px solid #1a1a1a", cursor:"crosshair", touchAction:"none" }} />
      <div style={{ position:"absolute", bottom:12, right:12, display:"flex", gap:8, alignItems:"center" }}>
        <span style={{ fontSize:10, color:"#444", letterSpacing:2 }}>LEFT=0 → RIGHT=9</span>
        <button onClick={clear} style={{ background:"transparent", border:"1px solid #333", color:"#555", fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:2, padding:"4px 10px", borderRadius:4, cursor:"pointer" }}>CLEAR</button>
      </div>
    </div>
  );
}

function OrbitalDemo() {
  const synColors = Object.values(SYN);
  return (
    <div style={{ height:280, position:"relative", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
      {synColors.map((color,i) => (
        <motion.div key={i} animate={{ rotate:360 }} transition={{ duration:3+i*0.4, repeat:Infinity, ease:"linear" }}
          style={{ position:"absolute", width:(80+i*8)*2, height:(80+i*8)*2, borderRadius:"50%", border:`1px solid ${color}22` }}>
          <motion.div style={{ position:"absolute", width:8+(i%3)*4, height:8+(i%3)*4, borderRadius:"50%", background:color, boxShadow:`0 0 12px ${color}`, top:0, left:"50%", transform:"translateX(-50%)" }}
            animate={{ scale:[1,1.4,1] }} transition={{ duration:1.5+i*0.2, repeat:Infinity }} />
        </motion.div>
      ))}
      <div style={{ width:20, height:20, borderRadius:"50%", background:"#fff", boxShadow:"0 0 30px #fff8" }} />
    </div>
  );
}

function NumberRain() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;
    const ctx = canvas.getContext("2d");
    const synColors = Object.values(SYN);
    const cols = Math.floor(canvas.width/20);
    const drops = Array.from({length:cols}, () => Math.random()*-canvas.height);
    let raf;
    const draw = () => {
      ctx.fillStyle = "rgba(5,5,5,0.06)"; ctx.fillRect(0,0,canvas.width,canvas.height);
      for (let i=0; i<cols; i++) {
        const digit = String(Math.floor(Math.random()*10));
        const color = synColors[parseInt(digit)];
        ctx.fillStyle=color; ctx.font="14px 'Space Mono',monospace";
        ctx.shadowBlur=6; ctx.shadowColor=color; ctx.fillText(digit,i*20,drops[i]); ctx.shadowBlur=0;
        if (drops[i]>canvas.height && Math.random()>0.975) drops[i]=0;
        drops[i]+=16;
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={canvasRef} style={{ width:"100%", height:280, display:"block", background:"#050505", borderRadius:12, border:"1px solid #1a1a1a" }} />;
}

function MorphBlob() {
  const synColors = Object.values(SYN);
  const [color, setColor] = useState(0);
  const paths = [
    "M60,20 C80,0 120,0 140,20 C160,40 160,80 140,100 C120,120 80,120 60,100 C40,80 40,40 60,20Z",
    "M50,30 C75,5 125,5 150,30 C165,55 155,95 130,110 C105,125 75,125 50,110 C25,95 25,55 50,30Z",
    "M70,15 C95,-5 115,-5 140,15 C165,35 165,85 140,105 C115,125 85,125 60,105 C35,85 45,35 70,15Z",
  ];
  const [pathIdx, setPathIdx] = useState(0);
  useEffect(() => {
    const t1 = setInterval(() => setColor(c => (c+1)%synColors.length), 1800);
    const t2 = setInterval(() => setPathIdx(i => (i+1)%paths.length), 2000);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);
  return (
    <div style={{ height:280, display:"flex", alignItems:"center", justifyContent:"center", background:"#050505", borderRadius:12, border:"1px solid #1a1a1a" }}>
      <svg width="200" height="160" viewBox="0 0 200 140">
        <motion.path d={paths[pathIdx]} animate={{ d:paths[pathIdx], fill:synColors[color]+"44", stroke:synColors[color] }}
          transition={{ duration:1.8, ease:"easeInOut" }} strokeWidth={2} filter={`drop-shadow(0 0 8px ${synColors[color]})`} />
      </svg>
    </div>
  );
}

const EXPERIMENTS = [
  { id:"synpaint", title:"SYN PAINT", tagline:"Canvas / Synesthesia", accent:SYN["7"],
    desc:"Draw on the canvas. Color maps left→right by your synesthesia digit system: 0=cyan on the left, 9=white on the right.",
    tags:["Canvas","Synesthesia","Interactive","Paint"], component:SynPaintCanvas },
  { id:"orbital", title:"ORBITAL", tagline:"Framer Motion / Physics", accent:SYN["6"],
    desc:"Ten concentric orbits, each rotating at a different speed in a different SYN color. Framer Motion handling the animation loop.",
    tags:["Framer Motion","Orbital","Color System"], component:OrbitalDemo },
  { id:"rain", title:"NUMBER RAIN", tagline:"Canvas / Matrix-style", accent:SYN["4"],
    desc:"A matrix-style rain of digits, each rendered in its synesthetic color. Same building blocks as the MOOK SYNTH waveform.",
    tags:["Canvas","Synesthesia","Animation","Matrix"], component:NumberRain },
  { id:"morphblob", title:"MORPH BLOB", tagline:"Framer Motion / SVG", accent:SYN["5"],
    desc:"An SVG path morphing between three organic shapes while cycling through the synesthesia palette.",
    tags:["Framer Motion","SVG","Morph","Color Cycle"], component:MorphBlob },
];

export default function Lab() {
  const [active, setActive] = useState(null);
  return (
    <div style={{ minHeight:"100vh", paddingTop:80, background:"#070707" }}>
      <section style={{ padding:"48px 24px 32px", maxWidth:820, margin:"0 auto", textAlign:"center" }}>
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>
          <div style={{ fontSize:10, color:SYN["6"], letterSpacing:6, marginBottom:16 }}>THE LAB — ANIMATION PLAYGROUND</div>
          <h1 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"clamp(28px,5vw,52px)", color:"#fff", fontWeight:400, lineHeight:1.15, margin:"0 0 20px" }}>A painting canvas<br/><em style={{ color:SYN["7"] }}>I can explore with you.</em></h1>
          <p style={{ color:"#666", fontSize:13, lineHeight:1.85, maxWidth:480, margin:"0 auto" }}>Each experiment is a sketch — a single idea pushed until it does something interesting. Three.js, Framer Motion, raw Canvas. This is where new things start.</p>
        </motion.div>
      </section>
      <div style={{ display:"flex", height:3, margin:"0 24px 48px" }}>
        {Object.entries(SYN).map(([d,c]) => (
          <motion.div key={d} style={{ flex:1, background:c }} initial={{ scaleY:0 }} animate={{ scaleY:1 }} transition={{ delay:parseInt(d)*0.04, duration:0.4 }} />
        ))}
      </div>
      <section style={{ padding:"0 24px 80px", maxWidth:1000, margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(440px,1fr))", gap:24 }}>
          {EXPERIMENTS.map((exp,i) => {
            const Comp = exp.component; const isOpen = active===exp.id;
            return (
              <motion.div key={exp.id} initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.1, duration:0.5 }}
                style={{ background:"#090909", border:`1px solid ${isOpen?exp.accent+"55":"#1e1e1e"}`, borderRadius:14, overflow:"hidden",
                  boxShadow:isOpen?`0 0 32px ${exp.accent}20`:"none", transition:"border 0.3s, box-shadow 0.3s" }}>
                <div style={{ position:"relative" }}>
                  <div style={{ pointerEvents:isOpen?"auto":"none", opacity:isOpen?1:0.6, transition:"opacity 0.3s" }}><Comp /></div>
                  <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${exp.accent},transparent)`, opacity:isOpen?1:0, transition:"opacity 0.3s" }} />
                </div>
                <div style={{ padding:"20px 24px 24px" }}>
                  <div style={{ display:"flex", alignItems:"baseline", gap:12, marginBottom:6 }}>
                    <div style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"clamp(17px,2vw,22px)", color:"#fff" }}>{exp.title}</div>
                    <div style={{ color:exp.accent, fontFamily:"'Space Mono',monospace", fontSize:10, letterSpacing:2, fontStyle:"italic" }}>{exp.tagline}</div>
                  </div>
                  <p style={{ color:"#666", fontSize:12, lineHeight:1.75, margin:"0 0 14px" }}>{exp.desc}</p>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }}>{exp.tags.map(t => <Tag key={t} color={exp.accent}>{t}</Tag>)}</div>
                  <button onClick={() => setActive(isOpen?null:exp.id)} style={{ background:isOpen?exp.accent:"transparent", color:isOpen?"#000":exp.accent, border:`1px solid ${exp.accent}`, fontFamily:"'Space Mono',monospace", fontWeight:700, fontSize:10, letterSpacing:2, padding:"7px 18px", borderRadius:6, cursor:"pointer", transition:"all 0.2s" }}>
                    {isOpen?"◼ CLOSE":"▶ ACTIVATE"}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
        <div style={{ marginTop:48, textAlign:"center" }}>
          <div style={{ fontSize:10, color:"#333", letterSpacing:4, marginBottom:16 }}>MORE EXPERIMENTS COMING</div>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap", justifyContent:"center" }}>
            {["Three.js Point Cloud","Audio Visualizer","Shader Playground","GSAP Text Morph","Particle System","R3F Scene"].map(t => (
              <div key={t} style={{ border:"1px solid #1a1a1a", borderRadius:6, padding:"6px 14px", fontSize:10, color:"#333", letterSpacing:2, fontFamily:"'Space Mono',monospace" }}>{t}</div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
