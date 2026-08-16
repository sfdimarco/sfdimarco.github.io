import { useState } from "react";
import { motion } from "framer-motion";
import { SYN, CATS, CAT_COLOR } from "../constants/syn";
import { PROJECTS, SKILLS } from "../constants/projects";
import { IMG } from "../constants/images";
import SynGrid from "../components/SynGrid";
import SectionWave from "../components/SectionWave";
import ProjectCard from "../components/ProjectCard";
import Tag from "../components/Tag";
import ImgSlot from "../components/ImgSlot";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i=0) => ({ opacity: 1, y: 0, transition: { delay: i*0.08, duration: 0.55, ease: "easeOut" } }),
};

export default function Home() {
  const [cat, setCat] = useState("ALL");
  const filtered = cat==="ALL" ? PROJECTS : PROJECTS.filter(p => p.cat===cat);
  return (
    <div>
      {/* HERO */}
      <section style={{ minHeight:"100vh", position:"relative", overflow:"hidden", display:"flex", flexDirection:"column" }}>
        <div style={{ position:"absolute", inset:0 }}><SynGrid /></div>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(105deg,rgba(7,7,7,.85) 0%,rgba(7,7,7,.6) 45%,rgba(34,85,255,.05) 55%,rgba(7,7,7,.8) 100%)" }} />
        <div style={{ position:"absolute", top:"50%", left:"6%", transform:"translateY(-50%)", fontFamily:"'Space Mono',monospace", fontSize:10, letterSpacing:5, color:SYN["3"]+"bb", writingMode:"vertical-rl", rotate:"180deg" }}>EDUCATOR</div>
        <div style={{ position:"absolute", top:"50%", right:"5%", transform:"translateY(-50%)", fontFamily:"'Space Mono',monospace", fontSize:10, letterSpacing:5, color:SYN["2"]+"bb", writingMode:"vertical-rl" }}>BUILDER</div>
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"100px 24px 60px", position:"relative", zIndex:2, textAlign:"center" }}>
          <motion.div variants={fadeUp} custom={0} initial="hidden" animate="visible" style={{ fontSize:11, letterSpacing:6, color:"#555", marginBottom:18 }}>SEAN DIMARCO — CREATIVE TECHNOLOGIST · BOSTON, MA</motion.div>
          <motion.h1 variants={fadeUp} custom={1} initial="hidden" animate="visible" style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"clamp(38px,8vw,90px)", fontWeight:400, lineHeight:1, margin:"0 0 6px", letterSpacing:-2, color:"#fff" }}>I build AI tools</motion.h1>
          <motion.h1 variants={fadeUp} custom={2} initial="hidden" animate="visible" style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontStyle:"italic", fontSize:"clamp(38px,8vw,90px)", fontWeight:400, lineHeight:1, margin:"0 0 28px", letterSpacing:-2, color:"#fff" }}>kids actually <span style={{ color:SYN["4"] }}>use.</span></motion.h1>
          <motion.p variants={fadeUp} custom={3} initial="hidden" animate="visible" style={{ maxWidth:520, color:"#777", fontSize:"clamp(13px,1.4vw,15px)", lineHeight:1.85, margin:"0 0 44px" }}>7+ years teaching. Animator. Game developer. I design the tool, ship it to a classroom, watch a 4th grader break it, and fix it the same day. That's the research.</motion.p>
          <motion.div variants={fadeUp} custom={4} initial="hidden" animate="visible" style={{ display:"flex", gap:14, flexWrap:"wrap", justifyContent:"center" }}>
            <a href="#work" style={{ background:SYN["4"], color:"#000", fontFamily:"'Space Mono',monospace", fontWeight:700, fontSize:11, letterSpacing:3, padding:"13px 30px", borderRadius:6, textDecoration:"none" }}>See My Work</a>
            <a href="#contact" style={{ background:"transparent", color:SYN["2"], fontFamily:"'Space Mono',monospace", fontWeight:700, fontSize:11, letterSpacing:3, padding:"13px 30px", borderRadius:6, textDecoration:"none", border:`1px solid ${SYN["2"]}55` }}>Get In Touch</a>
          </motion.div>
          <motion.div variants={fadeUp} custom={6} initial="hidden" animate="visible" style={{ marginTop:60, display:"flex", gap:5, flexWrap:"wrap", justifyContent:"center" }}>
            <span style={{ fontSize:10, color:"#444", letterSpacing:3, alignSelf:"center", marginRight:8 }}>I SEE</span>
            {Object.entries(SYN).map(([d,c]) => (
              <div key={d} style={{ width:26, height:26, borderRadius:4, background:c+"20", border:`1px solid ${c}44`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Space Mono',monospace", fontSize:12, fontWeight:700, color:c }}>{d}</div>
            ))}
            <span style={{ fontSize:10, color:"#444", letterSpacing:2, alignSelf:"center", marginLeft:8 }}>as color</span>
          </motion.div>
        </div>
        <div style={{ position:"absolute", bottom:22, left:"50%", transform:"translateX(-50%)", fontSize:10, color:"#444", letterSpacing:4, animation:"bounce 2s infinite" }}>↓ SCROLL</div>
      </section>

      <SectionWave accent={SYN["3"]} speed={0.7} complexity={0.8} height={44} />

      {/* ABOUT */}
      <section id="about" className="split-section" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", borderTop:"1px solid #1a1a1a", borderBottom:"1px solid #1a1a1a" }}>
        <div style={{ padding:"56px 44px", borderRight:"1px solid #1a1a1a", background:`linear-gradient(160deg,${SYN["3"]}06,transparent)` }}>
          <div style={{ fontSize:10, color:SYN["3"], letterSpacing:5, marginBottom:20 }}>THE EDUCATOR</div>
          <h2 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"clamp(22px,2.8vw,36px)", color:"#fff", lineHeight:1.2, margin:"0 0 18px", fontWeight:400 }}>I've taught hundreds of kids to think in systems.</h2>
          <p style={{ color:"#777", fontSize:13, lineHeight:1.85 }}>The Chestnut Hill School · 10 years · EMPOW Studios · 25 schools · Bowen After School · MagicSchool AI Certified · BFA Animation, Lesley University. I don't just demo AI tools — I hand them to a 4th grader and watch what breaks.</p>
        </div>
        <div style={{ padding:"56px 44px", background:`linear-gradient(160deg,${SYN["2"]}06,transparent)` }}>
          <div style={{ fontSize:10, color:SYN["2"], letterSpacing:5, marginBottom:20 }}>THE BUILDER</div>
          <h2 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"clamp(22px,2.8vw,36px)", color:"#fff", lineHeight:1.2, margin:"0 0 18px", fontWeight:400 }}>I ship interactive AI tools from scratch, in the browser.</h2>
          <p style={{ color:"#777", fontSize:13, lineHeight:1.85 }}>React · Web Audio API · Unity · Three.js · Google Flow · Java. I have synesthesia — numbers are colours, sounds are shapes. My UI decisions aren't aesthetic preferences. They're perceptual data.</p>
        </div>
      </section>

      {/* SYNESTHESIA */}
      <section style={{ borderTop:"1px solid #1a1a1a", padding:"72px 24px", maxWidth:820, margin:"0 auto" }}>
        <div style={{ fontSize:10, color:SYN["6"], letterSpacing:5, marginBottom:16, textAlign:"center" }}>THE SYNESTHETIC DEVELOPER</div>
        <h2 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"clamp(24px,4vw,42px)", color:"#fff", lineHeight:1.2, margin:"0 0 28px", fontWeight:400, textAlign:"center" }}>I don't experience data the way most people do.</h2>
        <div style={{ display:"flex", gap:0, marginBottom:36, borderRadius:8, overflow:"hidden", height:7 }}>
          {Object.entries(SYN).map(([d,col]) => <div key={d} style={{ flex:1, background:col }} />)}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:32, marginBottom:32 }}>
          <div>
            <div style={{ fontSize:10, color:SYN["1"], letterSpacing:4, marginBottom:10 }}>HOW IT WORKS</div>
            <p style={{ color:"#888", fontSize:13, lineHeight:1.9, margin:0 }}>I have grapheme-color synesthesia. Numbers and letters each have a fixed color — not a metaphor, an actual perceptual event. 0 is cyan, 1 is red, 2 is blue, 3 is yellow, 4 green, 5 orange, 6 purple, 7 pink, 8 near-white, 9 near-black. When I read code, I'm reading color patterns.</p>
          </div>
          <div>
            <div style={{ fontSize:10, color:SYN["2"], letterSpacing:4, marginBottom:10 }}>WHY IT MATTERS FOR AI</div>
            <p style={{ color:"#888", fontSize:13, lineHeight:1.9, margin:0 }}>AI systems are high-dimensional pattern spaces. Synesthetic perception is native multi-channel processing — I navigate token spaces, embeddings, and latent structure the way most people navigate physical rooms: by feel, shape, color.</p>
          </div>
        </div>
        <div style={{ background:"#0c0c0c", border:"1px solid #1e1e1e", borderRadius:10, padding:"28px 32px", marginBottom:28 }}>
          <div style={{ fontSize:10, color:SYN["3"], letterSpacing:4, marginBottom:14 }}>ON COLLABORATING WITH AI — HONESTLY</div>
          <p style={{ color:"#999", fontSize:13, lineHeight:1.9, margin:"0 0 14px" }}>I've worked with Claude and Gemini not just as a user but as someone who documents the texture of the interaction. My synesthesia means I notice when a response feels off — when a model is pattern-matching instead of reasoning. That's a different feedback signal than most developers provide.</p>
          <p style={{ color:"#999", fontSize:13, lineHeight:1.9, margin:0 }}>I hand an AI tool to a 9-year-old and observe what breaks. That's field research.</p>
        </div>
        <div style={{ display:"flex", justifyContent:"center", gap:8, flexWrap:"wrap" }}>
          {["Grapheme-Color Synesthesia","ADHD","Autism","Multi-Channel Perception","Perceptual UI Design","AI Collaboration","Pattern Recognition"].map(t => <Tag key={t} color={SYN["6"]}>{t}</Tag>)}
        </div>
      </section>

      <SectionWave accent={SYN["9"]} speed={1.1} complexity={1.3} height={44} />

      {/* WORK */}
      <section id="work" style={{ padding:"72px 24px", maxWidth:1000, margin:"0 auto" }}>
        <div style={{ fontSize:10, letterSpacing:6, color:"#555", marginBottom:32, textAlign:"center" }}>★ SELECTED WORK</div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center", marginBottom:44 }}>
          {CATS.map(c => <button key={c} onClick={() => setCat(c)} style={{ background:cat===c?CAT_COLOR[c]:"#111", color:cat===c?"#000":CAT_COLOR[c], border:`1px solid ${CAT_COLOR[c]}`, borderRadius:999, padding:"7px 16px", fontSize:10, fontWeight:700, cursor:"pointer", letterSpacing:3, fontFamily:"'Space Mono',monospace", transition:"all 0.15s" }}>{c}</button>)}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))", gap:20 }}>
          {filtered.map(p => <ProjectCard key={p.id} p={p} isWide={p.wide && cat==="ALL"} />)}
        </div>
      </section>

      <SectionWave accent={SYN["6"]} speed={0.9} complexity={1.6} height={44} />

      {/* SKILLS */}
      <section style={{ borderTop:"1px solid #1a1a1a", padding:"56px 24px", maxWidth:900, margin:"0 auto" }}>
        <div style={{ fontSize:10, letterSpacing:6, color:"#555", marginBottom:32, textAlign:"center" }}>TOOLS I SPEAK</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:9, justifyContent:"center" }}>
          {SKILLS.map(s => <Tag key={s.label} color={s.color}>{s.label}</Tag>)}
        </div>
      </section>

      <SectionWave accent={SYN["4"]} speed={0.6} complexity={1.0} height={44} />

      {/* CONTACT */}
      <section id="contact" style={{ borderTop:"1px solid #1a1a1a", padding:"80px 24px", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, opacity:0.25 }}><SynGrid /></div>
        <div style={{ position:"relative", zIndex:2 }}>
          <div style={{ width:88, height:88, borderRadius:"50%", overflow:"hidden", margin:"0 auto 20px", border:`3px solid ${SYN["4"]}44`, boxShadow:`0 0 24px ${SYN["4"]}33` }}>
            <ImgSlot src={IMG.headshot} alt="Sean DiMarco" accent={SYN["4"]} style={{ height:"100%", borderRadius:0 }} fit="cover" />
          </div>
          <div style={{ fontSize:10, letterSpacing:6, color:"#555", marginBottom:20 }}>LET'S WORK TOGETHER</div>
          <h2 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"clamp(28px,5vw,56px)", color:"#fff", margin:"0 0 16px", fontWeight:400 }}>Hire the person who builds <em style={{ color:SYN["4"] }}>and</em> teaches.</h2>
          <p style={{ color:"#666", fontSize:13, lineHeight:1.85, maxWidth:420, margin:"0 auto 40px" }}>Looking for a hybrid EdTech / Creative AI role in the Boston area.<br/>Open to fully remote for the right team.</p>
          <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
            <a href="mailto:sfdimarco@gmail.com" style={{ background:SYN["4"], color:"#000", fontFamily:"'Space Mono',monospace", fontWeight:700, fontSize:11, letterSpacing:3, padding:"15px 34px", borderRadius:6, textDecoration:"none" }}>Email Me</a>
            <a href="https://www.linkedin.com/in/sean-dimarco/" target="_blank" rel="noreferrer" style={{ background:"transparent", color:"#aaa", fontFamily:"'Space Mono',monospace", fontWeight:700, fontSize:11, letterSpacing:3, padding:"15px 34px", borderRadius:6, textDecoration:"none", border:"1px solid #333" }}>LinkedIn</a>
            <a href="https://www.instagram.com/dumbnot_stupid/" target="_blank" rel="noreferrer" style={{ background:"transparent", color:SYN["7"], fontFamily:"'Space Mono',monospace", fontWeight:700, fontSize:11, letterSpacing:3, padding:"15px 34px", borderRadius:6, textDecoration:"none", border:`1px solid ${SYN["7"]}44` }}>Art / Process</a>
            <a href="https://www.imdb.com/name/nm11904779/" target="_blank" rel="noreferrer" style={{ background:"transparent", color:SYN["3"], fontFamily:"'Space Mono',monospace", fontWeight:700, fontSize:11, letterSpacing:3, padding:"15px 34px", borderRadius:6, textDecoration:"none", border:`1px solid ${SYN["3"]}44` }}>IMDB</a>
            <a href="https://vimeo.com/user6495644" target="_blank" rel="noreferrer" style={{ background:"transparent", color:"#1ab7ea", fontFamily:"'Space Mono',monospace", fontWeight:700, fontSize:11, letterSpacing:3, padding:"15px 34px", borderRadius:6, textDecoration:"none", border:"1px solid #1ab7ea44" }}>Vimeo</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:"1px solid #111", padding:"20px 32px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12, fontSize:10, color:"#444", letterSpacing:2 }}>
        <div>© 2026 SEAN "MOOK" DIMARCO</div>
        <div style={{ display:"flex", gap:5 }}>{Object.entries(SYN).map(([d,c]) => <span key={d} style={{ color:c, fontWeight:700 }}>{d}</span>)}</div>
        <div style={{ display:"flex", gap:16, alignItems:"center" }}>
          <a href="https://github.com/sfdimarco" target="_blank" rel="noreferrer" style={{ color:"#555", textDecoration:"none" }}>GITHUB</a>
          <span style={{ color:"#222" }}>·</span>
          <a href="https://www.imdb.com/name/nm11904779/" target="_blank" rel="noreferrer" style={{ color:"#555", textDecoration:"none" }}>IMDB</a>
          <span style={{ color:"#222" }}>·</span>
          <a href="https://vimeo.com/user6495644" target="_blank" rel="noreferrer" style={{ color:"#555", textDecoration:"none" }}>VIMEO</a>
          <span style={{ color:"#222" }}>·</span>
          <span style={{ color:"#333" }}>NEWTON, MA</span>
        </div>
      </footer>
    </div>
  );
}
