import { useState, useRef, useEffect, useCallback } from "react";

/*═══════════════════════════════════════════════════════════════
  MOOK SYNTH v6 — Fresh Foundation
  
  Layout (one screen, no tabs for core workflow):
  ┌─────────────────────────────────┐
  │ Header + BPM + mode toggle      │
  ├─────────────────────────────────┤
  │ PAD GRID (big touch targets)    │
  ├─────────────────────────────────┤
  │ ██ ARMED: KICK ██  (color bar)  │
  ├─────────────────────────────────┤
  │ Step grid (16 cols × 8 tracks)  │
  ├─────────────────────────────────┤
  │ Oscilloscope                    │
  ├─────────────────────────────────┤
  │ Transport (rec/play/loop)       │
  └─────────────────────────────────┘
  
  XY pads + synth controls = slide-out panel
═══════════════════════════════════════════════════════════════*/

// ─── SYNESTHESIA COLORS ───
const MC = {
  0:"#00FFFF", 1:"#FF2222", 2:"#2266FF", 3:"#FFE500",
  4:"#22CC44", 5:"#FF8800", 6:"#9933FF", 7:"#FF66AA",
  8:"#1a1a1a", 9:"#EEEEFF",
};

// ─── DRUMS ───
const DRUMS = [
  { id:"kick",   label:"KICK",    short:"KCK", sub:"boom",   ci:1 },
  { id:"kick2",  label:"KICK 2",  short:"KC2", sub:"punch",  ci:1 },
  { id:"snare",  label:"SNARE",   short:"SNR", sub:"snap",   ci:5 },
  { id:"snare2", label:"SNARE 2", short:"SN2", sub:"crack",  ci:5 },
  { id:"clap",   label:"CLAP",    short:"CLP", sub:"clap!",  ci:3 },
  { id:"rim",    label:"RIM",     short:"RIM", sub:"click",  ci:9 },
  { id:"hat_c",  label:"HI-HAT",  short:"CHH", sub:"tss",    ci:0 },
  { id:"hat_o",  label:"OPEN HAT",short:"OHH", sub:"tsshh",  ci:0 },
  { id:"tom_lo", label:"TOM LO",  short:"TML", sub:"deep",   ci:6 },
  { id:"tom_hi", label:"TOM HI",  short:"TMH", sub:"bright", ci:7 },
  { id:"cowbell",label:"COWBELL", short:"COW", sub:"donk",   ci:3 },
  { id:"cym",    label:"CRASH",   short:"CYM", sub:"pshh",   ci:9 },
];

// ─── NOTES ───
const NN = ["C","D","E","F","G","A","B"];
const NC = [1,2,3,4,5,6,7];
const FT = {
  2:[65.41,73.42,82.41,87.31,98,110,123.47],
  3:[130.81,146.83,164.81,174.61,196,220,246.94],
  4:[261.63,293.66,329.63,349.23,392,440,493.88],
  5:[523.25,587.33,659.25,698.46,783.99,880,987.77],
};
function mkOct(o) { return NN.map((n,i) => ({ note:`${n}${o}`, freq:FT[o][i], ci:NC[i], label:`${n}${o}`, short:`${n}${o}` })); }
const ALL_NOTES = [...mkOct(2),...mkOct(3),...mkOct(4),...mkOct(5)];

// ─── CONSTANTS ───
const STEPS = 16;
const NUM_TRACKS = 8;
const TRK_COLORS = [MC[1],MC[2],MC[3],MC[5],MC[4],MC[6],MC[7],MC[0]];
const TRK_NAMES = ["KICK","SNARE","HATS","PERC","BASS","LEAD","PAD","FX"];

// ─── AUDIO ENGINE (standalone, no React) ───
let _ctx = null, _analyser = null, _fxIn = null;

function distCurve(a){const k=a*100,n=44100,c=new Float32Array(n);for(let i=0;i<n;i++){const x=i*2/n-1;c[i]=(3+k)*x*20*(Math.PI/180)/(Math.PI+k*Math.abs(x))}return c}
function reverbIR(c,dur=1.8,dec=2){const l=c.sampleRate*dur,b=c.createBuffer(2,l,c.sampleRate);for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);for(let i=0;i<l;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/l,dec)}return b}

function initAudio(){
  if(_ctx) return _ctx;
  _ctx = new (window.AudioContext||window.webkitAudioContext)();
  _analyser = _ctx.createAnalyser(); _analyser.fftSize = 2048;
  // FX chain: dist → chorus → delay → reverb
  const dist = _ctx.createWaveShaper(); dist.curve = distCurve(0.04); dist.oversample = "4x";
  const chDly = _ctx.createDelay(0.05); chDly.delayTime.value = 0.005;
  const chLFO = _ctx.createOscillator(); const chLG = _ctx.createGain();
  chLFO.frequency.value = 1.2; chLG.gain.value = 0.002; chLFO.connect(chLG); chLG.connect(chDly.delayTime); chLFO.start();
  const chD = _ctx.createGain(); chD.gain.value = 0.88;
  const chW = _ctx.createGain(); chW.gain.value = 0.12;
  const chM = _ctx.createGain();
  dist.connect(chD); dist.connect(chDly); chDly.connect(chW); chD.connect(chM); chW.connect(chM);
  const dly = _ctx.createDelay(2); dly.delayTime.value = 0.22;
  const dFb = _ctx.createGain(); dFb.gain.value = 0.22;
  const dD = _ctx.createGain(); dD.gain.value = 0.8;
  const dW = _ctx.createGain(); dW.gain.value = 0.2;
  const dM = _ctx.createGain();
  chM.connect(dD); chM.connect(dly); dly.connect(dFb); dFb.connect(dly); dly.connect(dW); dD.connect(dM); dW.connect(dM);
  const conv = _ctx.createConvolver(); conv.buffer = reverbIR(_ctx);
  const rD = _ctx.createGain(); rD.gain.value = 0.84;
  const rW = _ctx.createGain(); rW.gain.value = 0.16;
  const rM = _ctx.createGain();
  dM.connect(rD); dM.connect(conv); conv.connect(rW); rD.connect(rM); rW.connect(rM);
  rM.connect(_analyser); _analyser.connect(_ctx.destination);
  _fxIn = dist;
  return _ctx;
}

// ─── 808 DRUM SYNTHESIS ───
function play808(drumId, vol=0.8){
  if(!_ctx) return; const now = _ctx.currentTime;
  const m = _ctx.createGain(); m.gain.setValueAtTime(vol,now); m.connect(_fxIn);
  
  if(drumId==="kick"||drumId==="kick2"){
    const L=drumId==="kick",o=_ctx.createOscillator(),g=_ctx.createGain();o.type="sine";
    o.frequency.setValueAtTime(L?160:200,now);o.frequency.exponentialRampToValueAtTime(L?35:55,now+(L?.08:.04));
    const cl=_ctx.createOscillator(),cg=_ctx.createGain();cl.type="square";cl.frequency.setValueAtTime(800,now);
    cg.gain.setValueAtTime(.3*vol,now);cg.gain.exponentialRampToValueAtTime(.001,now+.015);
    cl.connect(cg);cg.connect(m);cl.start(now);cl.stop(now+.02);
    const dc=L?1:.4;g.gain.setValueAtTime(vol,now);g.gain.exponentialRampToValueAtTime(.001,now+dc);
    osc_connect(o,g,m,now,dc);
    if(L){const s=_ctx.createOscillator(),sg=_ctx.createGain();s.type="sine";s.frequency.setValueAtTime(70,now);
      sg.gain.setValueAtTime(vol*.15,now);sg.gain.exponentialRampToValueAtTime(.001,now+dc*.7);
      s.connect(sg);sg.connect(m);s.start(now);s.stop(now+dc)}
  } else if(drumId==="snare"||drumId==="snare2"){
    const t=drumId==="snare2";
    [180,330].forEach(f=>{const o=_ctx.createOscillator(),g=_ctx.createGain();o.type="sine";o.frequency.setValueAtTime(f,now);
      g.gain.setValueAtTime(vol*.5,now);g.gain.exponentialRampToValueAtTime(.001,now+(t?.12:.2));
      o.connect(g);g.connect(m);o.start(now);o.stop(now+.25)});
    const buf=_ctx.createBuffer(1,_ctx.sampleRate*.3,_ctx.sampleRate),d=buf.getChannelData(0);
    for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    const n=_ctx.createBufferSource();n.buffer=buf;const ng=_ctx.createGain(),nf=_ctx.createBiquadFilter();
    nf.type="bandpass";nf.frequency.setValueAtTime(t?5000:3000,now);nf.Q.setValueAtTime(1,now);
    ng.gain.setValueAtTime(vol*.7,now);ng.gain.exponentialRampToValueAtTime(.001,now+(t?.1:.25));
    n.connect(nf);nf.connect(ng);ng.connect(m);n.start(now);n.stop(now+.3);
  } else if(drumId==="clap"){
    for(let b=0;b<4;b++){const t=now+b*.012,bf=_ctx.createBuffer(1,_ctx.sampleRate*.3,_ctx.sampleRate),d=bf.getChannelData(0);
      for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
      const n=_ctx.createBufferSource();n.buffer=bf;const g=_ctx.createGain(),f=_ctx.createBiquadFilter();
      f.type="bandpass";f.frequency.setValueAtTime(1200,t);f.Q.setValueAtTime(.8,t);
      const last=b===3;g.gain.setValueAtTime(vol*(last?.8:.4),t);g.gain.exponentialRampToValueAtTime(.001,t+(last?.3:.02));
      n.connect(f);f.connect(g);g.connect(m);n.start(t);n.stop(t+(last?.35:.03))}
  } else if(drumId==="rim"){
    const o=_ctx.createOscillator(),g=_ctx.createGain();o.type="triangle";o.frequency.setValueAtTime(820,now);
    g.gain.setValueAtTime(vol*.6,now);g.gain.exponentialRampToValueAtTime(.001,now+.03);
    o.connect(g);g.connect(m);o.start(now);o.stop(now+.04);
  } else if(drumId==="hat_c"||drumId==="hat_o"){
    const O=drumId==="hat_o",mx=_ctx.createGain();mx.gain.setValueAtTime(.15*vol,now);
    [325.5,430.5,548,622.5,740,892.5].forEach(f=>{const o=_ctx.createOscillator();o.type="square";
      o.frequency.setValueAtTime(f,now);o.connect(mx);o.start(now);o.stop(now+(O?.5:.08)+.05)});
    const hp=_ctx.createBiquadFilter();hp.type="highpass";hp.frequency.setValueAtTime(7000,now);
    const bp=_ctx.createBiquadFilter();bp.type="bandpass";bp.frequency.setValueAtTime(10000,now);bp.Q.setValueAtTime(.5,now);
    const e=_ctx.createGain();e.gain.setValueAtTime(vol,now);e.gain.exponentialRampToValueAtTime(.001,now+(O?.5:.08));
    mx.connect(hp);hp.connect(bp);bp.connect(e);e.connect(m);
  } else if(drumId==="tom_lo"||drumId==="tom_hi"){
    const hi=drumId==="tom_hi",o=_ctx.createOscillator(),g=_ctx.createGain();o.type="sine";
    o.frequency.setValueAtTime(hi?400:200,now);o.frequency.exponentialRampToValueAtTime(hi?200:80,now+.06);
    g.gain.setValueAtTime(vol*.8,now);g.gain.exponentialRampToValueAtTime(.001,now+.3);
    o.connect(g);g.connect(m);o.start(now);o.stop(now+.35);
  } else if(drumId==="cowbell"){
    const o1=_ctx.createOscillator(),o2=_ctx.createOscillator();o1.type="square";o2.type="square";
    o1.frequency.setValueAtTime(540,now);o2.frequency.setValueAtTime(800,now);
    const mx=_ctx.createGain();mx.gain.setValueAtTime(.3*vol,now);o1.connect(mx);o2.connect(mx);
    const bp=_ctx.createBiquadFilter();bp.type="bandpass";bp.frequency.setValueAtTime(680,now);bp.Q.setValueAtTime(3,now);
    const e=_ctx.createGain();e.gain.setValueAtTime(vol,now);e.gain.exponentialRampToValueAtTime(vol*.4,now+.02);
    e.gain.exponentialRampToValueAtTime(.001,now+.4);mx.connect(bp);bp.connect(e);e.connect(m);
    o1.start(now);o2.start(now);o1.stop(now+.45);o2.stop(now+.45);
  } else if(drumId==="cym"){
    const mx=_ctx.createGain();mx.gain.setValueAtTime(.1*vol,now);
    [225.5,340.5,458,522.5,640,792.5,980,1100].forEach(f=>{const o=_ctx.createOscillator();o.type="square";
      o.frequency.setValueAtTime(f,now);o.connect(mx);o.start(now);o.stop(now+1.55)});
    const hp=_ctx.createBiquadFilter();hp.type="highpass";hp.frequency.setValueAtTime(5000,now);
    const e=_ctx.createGain();e.gain.setValueAtTime(vol,now);e.gain.exponentialRampToValueAtTime(.001,now+1.5);
    mx.connect(hp);hp.connect(e);e.connect(m);
  }
}
function osc_connect(o,g,m,now,dc){o.connect(g);g.connect(m);o.start(now);o.stop(now+dc+.05)}

function playMelodic(freq,vol=0.7){
  if(!_ctx) return; const now=_ctx.currentTime;
  const o=_ctx.createOscillator(),g=_ctx.createGain(),f=_ctx.createBiquadFilter();
  o.type="sawtooth";o.frequency.setValueAtTime(freq,now);
  f.type="lowpass";f.frequency.setValueAtTime(2500,now);f.Q.setValueAtTime(1.5,now);
  g.gain.setValueAtTime(0,now);g.gain.linearRampToValueAtTime(vol,now+.01);
  g.gain.linearRampToValueAtTime(vol*.6,now+.1);g.gain.exponentialRampToValueAtTime(.001,now+.5);
  o.connect(f);f.connect(g);g.connect(_fxIn);o.start(now);o.stop(now+.55);
}

function playEvt(evt,vol=0.7){
  if(evt.type==="drum"){const d=DRUMS[evt.di]; if(d) play808(d.id,vol)}
  else{const n=ALL_NOTES[evt.ni]; if(n) playMelodic(n.freq,vol)}
}

function getEvtInfo(evt){
  if(evt.type==="drum"){const d=DRUMS[evt.di];return{label:d?.short||"?",color:MC[d?.ci??9],name:d?.label||"?"}}
  const n=ALL_NOTES[evt.ni];return{label:n?.short||"?",color:MC[n?.ci??9],name:n?.label||"?"}
}

// ═══════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════
export default function MookSynth() {
  const [started, setStarted] = useState(false);
  const [mode, setMode] = useState("DRUM");
  const [octShift, setOctShift] = useState(1);
  const [bpm, setBpm] = useState(100);
  const [activeTrk, setActiveTrk] = useState(0);
  const [armed, setArmed] = useState(null); // {type,di/ni,label,short,color,name}
  const [activePads, setActivePads] = useState(new Set());
  const [flashPads, setFlashPads] = useState(new Set()); // pads flashing from playback
  const [isRec, setIsRec] = useState(false);
  const [isPlay, setIsPlay] = useState(false);
  const [loopMode, setLoopMode] = useState(true);
  const [playhead, setPlayhead] = useState(-1); // current step index, -1 = stopped
  const [waveColor, setWaveColor] = useState(MC[0]);
  const [showPanel, setShowPanel] = useState(false);
  const [onboardStage, setOnboardStage] = useState(0); // 0=tap pad, 1=tap grid, 2=press play, 3=done

  // Grid state: tracks[trackIdx].steps[stepIdx] = evt | null
  const [tracks, setTracks] = useState(() =>
    Array.from({ length: NUM_TRACKS }, (_, i) => ({
      name: TRK_NAMES[i], color: TRK_COLORS[i], muted: false, solo: false,
      steps: new Array(STEPS).fill(null),
    }))
  );

  // Undo stack
  const [undoStack, setUndoStack] = useState([]);
  const pushUndo = useCallback((trks) => {
    setUndoStack(prev => [...prev.slice(-19), JSON.stringify(trks)]);
  }, []);
  const undo = useCallback(() => {
    setUndoStack(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setTracks(JSON.parse(last));
      return prev.slice(0, -1);
    });
  }, []);

  // Refs for playback
  const ctxRef = useRef(null);
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const playRef = useRef(null);
  const tracksRef = useRef(tracks);
  const recRef = useRef(null);
  const isRecRef = useRef(false);
  const activeTrkRef = useRef(activeTrk);
  const armedRef = useRef(armed);
  const playNodesRef = useRef([]);

  useEffect(() => { tracksRef.current = tracks }, [tracks]);
  useEffect(() => { isRecRef.current = isRec }, [isRec]);
  useEffect(() => { activeTrkRef.current = activeTrk }, [activeTrk]);
  useEffect(() => { armedRef.current = armed }, [armed]);

  const visibleNotes = ALL_NOTES.slice(octShift * 7, octShift * 7 + 14);
  const visOff = octShift * 7;

  // ─── INIT ───
  const doInit = useCallback(() => {
    if (ctxRef.current) return;
    initAudio();
    ctxRef.current = _ctx;
    setStarted(true);
  }, []);

  // ─── PAD HIT ───
  const padHit = useCallback((idx) => {
    doInit();
    let evtData, col, label, short, name;

    if (mode === "DRUM") {
      const d = DRUMS[idx]; if (!d) return;
      col = MC[d.ci]; label = d.label; short = d.short; name = d.label;
      play808(d.id);
      evtData = { type: "drum", di: idx };
    } else {
      const ni = visOff + idx;
      const n = ALL_NOTES[ni]; if (!n) return;
      col = MC[n.ci]; label = n.label; short = n.short; name = n.label;
      playMelodic(n.freq);
      evtData = { type: "melodic", ni };
    }

    // Arm this sound
    setArmed({ ...evtData, label, short, color: col, name });

    // Visual flash
    setWaveColor(col);
    setTimeout(() => setWaveColor(MC[0]), 500);
    setActivePads(p => new Set(p).add(idx));
    setTimeout(() => setActivePads(p => { const n = new Set(p); n.delete(idx); return n; }), 120);

    // Advance onboarding
    if (onboardStage === 0) setOnboardStage(1);

    // Live record: snap to nearest step
    if (isRecRef.current && recRef.current !== null) {
      const elapsed = _ctx.currentTime - recRef.current;
      const stepTime = (60 / bpm) / 4;
      const totalTime = STEPS * stepTime;
      const posInLoop = elapsed % totalTime;
      const stepIdx = Math.round(posInLoop / stepTime) % STEPS;
      setTracks(prev => {
        pushUndo(prev);
        const next = prev.map((t, i) => i === activeTrkRef.current
          ? { ...t, steps: t.steps.map((s, si) => si === stepIdx ? evtData : s) }
          : t
        );
        return next;
      });
    }
  }, [mode, visOff, bpm, onboardStage, doInit, pushUndo]);

  // ─── STEP TOGGLE ───
  const toggleStep = useCallback((trkIdx, stepIdx) => {
    doInit();
    const trk = tracksRef.current[trkIdx];
    if (trk.steps[stepIdx]) {
      // Remove
      setTracks(prev => {
        pushUndo(prev);
        return prev.map((t, i) => i === trkIdx
          ? { ...t, steps: t.steps.map((s, si) => si === stepIdx ? null : s) }
          : t
        );
      });
    } else if (armedRef.current) {
      // Place armed sound
      const evt = { type: armedRef.current.type, ...(armedRef.current.type === "drum" ? { di: armedRef.current.di } : { ni: armedRef.current.ni }) };
      playEvt(evt, 0.5);
      setTracks(prev => {
        pushUndo(prev);
        return prev.map((t, i) => i === trkIdx
          ? { ...t, steps: t.steps.map((s, si) => si === stepIdx ? evt : s) }
          : t
        );
      });
      if (onboardStage === 1) setOnboardStage(2);
    }
  }, [onboardStage, doInit, pushUndo]);

  // ─── TRACK CONTROLS ───
  const toggleMute = useCallback((ti) => {
    setTracks(prev => prev.map((t, i) => i === ti ? { ...t, muted: !t.muted } : t));
  }, []);
  const toggleSolo = useCallback((ti) => {
    setTracks(prev => prev.map((t, i) => i === ti ? { ...t, solo: !t.solo } : t));
  }, []);
  const clearTrack = useCallback((ti) => {
    setTracks(prev => {
      pushUndo(prev);
      return prev.map((t, i) => i === ti ? { ...t, steps: new Array(STEPS).fill(null) } : t);
    });
  }, [pushUndo]);

  // ─── PLAYBACK ───
  const startPlay = useCallback(() => {
    doInit();
    const stepTime = (60 / bpm) / 4;
    const totalTime = STEPS * stepTime;
    const startAt = _ctx.currentTime;
    const hasSolo = tracksRef.current.some(t => t.solo);
    const nodes = [];
    const loops = loopMode ? 32 : 1;

    for (let lp = 0; lp < loops; lp++) {
      const loopStart = startAt + lp * totalTime;
      tracksRef.current.forEach(trk => {
        if (trk.muted || (hasSolo && !trk.solo)) return;
        trk.steps.forEach((evt, si) => {
          if (!evt) return;
          const nt = loopStart + si * stepTime;
          if (evt.type === "drum") {
            const d = DRUMS[evt.di]; if (!d) return;
            const dl = (nt - _ctx.currentTime) * 1000;
            if (dl > 0) setTimeout(() => play808(d.id, 0.7), dl);
            else play808(d.id, 0.7);
          } else {
            const n = ALL_NOTES[evt.ni]; if (!n) return;
            const o = _ctx.createOscillator(), g = _ctx.createGain(), f = _ctx.createBiquadFilter();
            o.type = "sawtooth"; o.frequency.setValueAtTime(n.freq, nt);
            f.type = "lowpass"; f.frequency.setValueAtTime(2500, nt);
            g.gain.setValueAtTime(0, nt); g.gain.linearRampToValueAtTime(0.6, nt + 0.01);
            g.gain.linearRampToValueAtTime(0.3, nt + 0.08);
            g.gain.exponentialRampToValueAtTime(0.001, nt + 0.35);
            o.connect(f); f.connect(g); g.connect(_fxIn); o.start(nt); o.stop(nt + 0.4);
            nodes.push(o);
          }
        });
      });
    }
    playNodesRef.current = nodes;
    setIsPlay(true);
    if (onboardStage === 2) setOnboardStage(3);

    const total = loops * totalTime;
    const upd = () => {
      const el = _ctx.currentTime - startAt;
      if (el >= total) { stopPlay(); return; }
      const inLoop = el % totalTime;
      const step = Math.floor(inLoop / stepTime);
      setPlayhead(step);

      // Flash pads that have events on current step
      const flashing = new Set();
      tracksRef.current.forEach(trk => {
        if (trk.muted) return;
        const evt = trk.steps[step];
        if (evt) {
          if (evt.type === "drum") flashing.add(`d${evt.di}`);
          else flashing.add(`n${evt.ni}`);
          const info = getEvtInfo(evt);
          setWaveColor(info.color);
        }
      });
      setFlashPads(flashing);

      playRef.current = requestAnimationFrame(upd);
    };
    playRef.current = requestAnimationFrame(upd);
  }, [bpm, loopMode, onboardStage, doInit]);

  const stopPlay = useCallback(() => {
    if (playRef.current) cancelAnimationFrame(playRef.current);
    playNodesRef.current.forEach(n => { try { n.stop() } catch(e) {} });
    playNodesRef.current = [];
    setIsPlay(false); setPlayhead(-1); setFlashPads(new Set());
    setWaveColor(MC[0]);
  }, []);

  const toggleRec = useCallback(() => {
    doInit();
    if (!isRec) {
      recRef.current = _ctx.currentTime;
      setIsRec(true);
      if (!isPlay) startPlay();
    } else {
      setIsRec(false);
      recRef.current = null;
    }
  }, [isRec, isPlay, startPlay, doInit]);

  // ─── OSCILLOSCOPE ───
  useEffect(() => {
    if (!_analyser || !canvasRef.current) return;
    const cv = canvasRef.current, c = cv.getContext("2d");
    const bl = _analyser.frequencyBinCount, data = new Uint8Array(bl);
    let currentColor = MC[0];
    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      _analyser.getByteTimeDomainData(data);
      c.fillStyle = "#08080c"; c.fillRect(0, 0, cv.width, cv.height);
      const el = document.getElementById("_wc");
      if (el) currentColor = el.dataset.c || MC[0];
      c.lineWidth = 2.5; c.strokeStyle = currentColor; c.shadowColor = currentColor; c.shadowBlur = 10;
      c.beginPath(); const sw = cv.width / bl; let x = 0;
      for (let i = 0; i < bl; i++) { const v = data[i]/128, y = v*cv.height/2; i===0 ? c.moveTo(x,y) : c.lineTo(x,y); x += sw; }
      c.stroke(); c.shadowBlur = 0;
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [started]);

  // ─── KEYBOARD ───
  useEffect(() => {
    const keys = mode === "DRUM"
      ? ["z","x","c","v","b","n","m","a","s","d","f","g","h","j","k","l"]
      : ["z","x","c","v","b","n","m","a","s","d","f","g","h","j"];
    const handler = (e) => {
      if (e.repeat) return;
      const idx = keys.indexOf(e.key.toLowerCase());
      if (idx >= 0 && idx < (mode === "DRUM" ? DRUMS.length : 14)) padHit(idx);
      if (e.key === " ") { e.preventDefault(); isPlay ? stopPlay() : startPlay(); }
      if (e.key === "z" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); undo(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [padHit, isPlay, startPlay, stopPlay, undo, mode]);

  // ─── ONBOARDING TEXT ───
  const onboardText = [
    "👆 TAP A PAD TO PICK A SOUND",
    "👇 NOW TAP THE GRID TO PLACE IT",
    "▶ PRESS PLAY TO HEAR YOUR BEAT",
    null, // done
  ][onboardStage];

  // ─── Pad flash check ───
  const isPadFlashing = (idx) => {
    if (mode === "DRUM") return flashPads.has(`d${idx}`);
    return flashPads.has(`n${visOff + idx}`);
  };

  // ═══════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════
  return (
    <div style={{
      background: "#08080c", minHeight: "100vh", color: "#ccc",
      fontFamily: "'SF Mono','JetBrains Mono','Fira Code',monospace",
      display: "flex", flexDirection: "column", height: "100vh",
      padding: 6, gap: 4, boxSizing: "border-box",
      userSelect: "none", touchAction: "manipulation",
      WebkitTouchCallout: "none", overscrollBehavior: "none",
      position: "fixed", inset: 0,
    }}>
      <div id="_wc" data-c={waveColor} style={{ display: "none" }} />

      {/* ─── HEADER ─── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <div style={{
            fontSize: 15, fontWeight: 900, letterSpacing: 3,
            background: `linear-gradient(90deg,${MC[1]},${MC[5]},${MC[3]},${MC[4]},${MC[2]},${MC[6]},${MC[7]})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>MOOK SYNTH</div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button onClick={undo} disabled={undoStack.length === 0} style={{
            padding: "3px 8px", fontSize: 9, fontFamily: "inherit",
            background: "#111118", border: "1px solid #222", borderRadius: 4,
            color: undoStack.length > 0 ? MC[5] : "#333", cursor: "pointer",
            opacity: undoStack.length > 0 ? 1 : 0.4,
          }}>↩ UNDO</button>
          <span style={{ fontSize: 8, color: "#444" }}>BPM</span>
          <input type="range" min={60} max={200} value={bpm}
            onChange={e => setBpm(Number(e.target.value))}
            style={{ width: 50, accentColor: MC[1] }} />
          <span style={{ fontSize: 12, color: MC[1], fontWeight: 700 }}>{bpm}</span>
        </div>
      </div>

      {/* ─── MODE + OCTAVE ─── */}
      <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
        {["DRUM", "MELODIC"].map(m => (
          <button key={m} onClick={() => { setMode(m); setArmed(null); }}
            style={{
              flex: 1, padding: 5, fontSize: 11, fontWeight: 700, fontFamily: "inherit",
              background: mode === m ? (m === "DRUM" ? MC[1] : MC[2]) + "18" : "#0c0c12",
              border: `2px solid ${mode === m ? (m === "DRUM" ? MC[1] : MC[2]) : "#222"}`,
              borderRadius: 7, color: mode === m ? (m === "DRUM" ? MC[1] : MC[2]) : "#555",
              cursor: "pointer", touchAction: "none",
            }}>
            {m === "DRUM" ? "🥁 DRUMS" : "🎹 NOTES"}
          </button>
        ))}
      </div>

      {mode === "MELODIC" && (
        <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
          {["LOW C2-B3", "MID C3-B4", "HIGH C4-B5"].map((l, i) => (
            <button key={i} onClick={() => setOctShift(i)}
              style={{
                flex: 1, padding: 3, fontSize: 8, fontFamily: "inherit",
                background: octShift === i ? MC[2] + "22" : "#0c0c12",
                border: `1px solid ${octShift === i ? MC[2] : "#1a1a22"}`,
                borderRadius: 4, color: octShift === i ? MC[2] : "#444",
                cursor: "pointer", touchAction: "none",
              }}>{l}</button>
          ))}
        </div>
      )}

      {/* ─── PAD GRID ─── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: mode === "DRUM" ? "repeat(4, 1fr)" : "repeat(7, 1fr)",
        gap: 5, padding: 6, background: "#0c0c12", borderRadius: 10,
        border: `1px solid ${armed ? armed.color + "33" : "#1a1a22"}`,
        flex: "1 1 auto", minHeight: 0,
      }}>
        {(mode === "DRUM" ? DRUMS : visibleNotes).map((item, i) => {
          const ci = mode === "DRUM" ? item.ci : item.ci;
          const color = MC[ci];
          const isActive = activePads.has(i);
          const isFlashing = isPadFlashing(i);
          const isArmed = armed && (
            (armed.type === "drum" && mode === "DRUM" && armed.di === i) ||
            (armed.type === "melodic" && mode === "MELODIC" && armed.ni === visOff + i)
          );
          return (
            <button key={i}
              onPointerDown={e => { e.preventDefault(); padHit(i); }}
              style={{
                borderRadius: 9, cursor: "pointer", touchAction: "none",
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", gap: 1, fontFamily: "inherit",
                minHeight: 0,
                background: isActive || isFlashing
                  ? color
                  : isArmed
                    ? `radial-gradient(circle at 50% 50%, ${color}30, ${color}10)`
                    : `radial-gradient(circle at 35% 35%, ${color}12, ${color}04)`,
                border: `2px solid ${isArmed ? color : isActive || isFlashing ? color : color + "28"}`,
                transform: isActive ? "scale(0.9)" : "scale(1)",
                transition: "transform 0.05s, background 0.1s",
                boxShadow: isFlashing ? `0 0 20px ${color}55` : isArmed ? `0 0 12px ${color}22` : "none",
              }}>
              <span style={{ fontWeight: 800, fontSize: mode === "DRUM" ? 12 : 13,
                color: isActive || isFlashing ? "#000" : color }}>
                {mode === "DRUM" ? item.label : item.label}
              </span>
              <span style={{ fontSize: 7, color: isActive || isFlashing ? "#000" : color + "77" }}>
                {mode === "DRUM" ? item.sub : `${item.freq.toFixed(0)}Hz`}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── ARMED INDICATOR ─── */}
      <div style={{
        flexShrink: 0, padding: "6px 10px", borderRadius: 6,
        background: armed ? armed.color + "15" : "#0c0c12",
        border: `1px solid ${armed ? armed.color + "44" : "#1a1a22"}`,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        minHeight: 28,
      }}>
        {armed ? (
          <>
            <div style={{
              width: 10, height: 10, borderRadius: "50%",
              background: armed.color, boxShadow: `0 0 8px ${armed.color}66`,
            }} />
            <span style={{ fontSize: 11, fontWeight: 800, color: armed.color, letterSpacing: 1 }}>
              {armed.name}
            </span>
            <span style={{ fontSize: 9, color: "#555" }}>
              — tap grid to place
            </span>
          </>
        ) : (
          <span style={{
            fontSize: onboardStage === 0 ? 12 : 10, color: onboardStage === 0 ? MC[3] : "#444",
            fontWeight: onboardStage === 0 ? 700 : 400,
            animation: onboardStage === 0 ? "pulse 1.5s infinite" : "none",
          }}>
            {onboardText || "tap a pad to arm a sound"}
          </span>
        )}
      </div>

      {/* ─── ONBOARDING OVERLAY ─── */}
      {onboardText && onboardStage > 0 && (
        <div style={{
          flexShrink: 0, textAlign: "center", fontSize: 11, fontWeight: 700,
          color: onboardStage === 2 ? MC[4] : MC[3],
          padding: 2,
          animation: "pulse 1.5s infinite",
        }}>
          {onboardText}
        </div>
      )}

      {/* ─── STEP GRID ─── */}
      <div style={{
        flexShrink: 0, background: "#0a0a10", borderRadius: 8,
        border: "1px solid #1a1a22", overflow: "hidden",
      }}>
        {/* Beat markers */}
        <div style={{ display: "flex", marginLeft: 48, height: 12, borderBottom: "1px solid #111118" }}>
          {Array.from({ length: STEPS }).map((_, i) => (
            <div key={i} style={{
              flex: 1, fontSize: 6, paddingLeft: 2,
              borderLeft: i % 4 === 0 ? "1px solid #2a2a35" : "1px solid #111118",
              color: i % 4 === 0 ? "#555" : "#1a1a22",
              background: playhead === i ? MC[0] + "11" : "transparent",
            }}>
              {i % 4 === 0 ? Math.floor(i / 4) + 1 : "·"}
            </div>
          ))}
        </div>

        {/* Track rows */}
        <div style={{ maxHeight: 220, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
          {tracks.map((trk, ti) => {
            const hasSolo = tracks.some(t => t.solo);
            const audible = !trk.muted && (!hasSolo || trk.solo);
            return (
              <div key={ti} style={{
                display: "flex", borderBottom: "1px solid #0e0e14",
                background: activeTrk === ti ? "#0e0e18" : "transparent",
                opacity: audible ? 1 : 0.2,
              }}>
                {/* Track label */}
                <div onClick={() => setActiveTrk(ti)} style={{
                  width: 48, padding: "1px 3px", cursor: "pointer",
                  borderRight: "1px solid #151520",
                  display: "flex", flexDirection: "column", justifyContent: "center",
                }}>
                  <div style={{ fontSize: 7, fontWeight: 700, color: activeTrk === ti ? trk.color : "#444" }}>
                    {trk.name}
                  </div>
                  <div style={{ display: "flex", gap: 2, marginTop: 1 }}>
                    <button onClick={e => { e.stopPropagation(); toggleMute(ti); }}
                      style={{ fontSize: 6, padding: "0 2px", fontFamily: "inherit", lineHeight: 1.5,
                        background: trk.muted ? MC[1] + "33" : "#0e0e14",
                        border: `1px solid ${trk.muted ? MC[1] : "#222"}`,
                        borderRadius: 2, color: trk.muted ? MC[1] : "#444", cursor: "pointer" }}>M</button>
                    <button onClick={e => { e.stopPropagation(); toggleSolo(ti); }}
                      style={{ fontSize: 6, padding: "0 2px", fontFamily: "inherit", lineHeight: 1.5,
                        background: trk.solo ? MC[3] + "33" : "#0e0e14",
                        border: `1px solid ${trk.solo ? MC[3] : "#222"}`,
                        borderRadius: 2, color: trk.solo ? MC[3] : "#444", cursor: "pointer" }}>S</button>
                    <button onClick={e => { e.stopPropagation(); clearTrack(ti); }}
                      style={{ fontSize: 6, padding: "0 2px", fontFamily: "inherit", lineHeight: 1.5,
                        background: "#0e0e14", border: "1px solid #222",
                        borderRadius: 2, color: "#444", cursor: "pointer" }}>✕</button>
                  </div>
                </div>

                {/* Step cells */}
                <div style={{ flex: 1, display: "flex", minHeight: 28 }}>
                  {trk.steps.map((evt, si) => {
                    const isPlayheadHere = playhead === si;
                    const info = evt ? getEvtInfo(evt) : null;
                    return (
                      <div key={si}
                        onPointerDown={e => { e.preventDefault(); toggleStep(ti, si); }}
                        style={{
                          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                          borderRight: si % 4 === 3 ? "1px solid #1a1a22" : "1px solid #111118",
                          cursor: "pointer", touchAction: "none",
                          position: "relative",
                          background: evt
                            ? isPlayheadHere
                              ? info.color + "55"
                              : info.color + "22"
                            : isPlayheadHere
                              ? MC[0] + "08"
                              : "transparent",
                          transition: "background 0.05s",
                        }}>
                        {evt && (
                          <span style={{
                            fontSize: 6, fontWeight: 700, color: info.color,
                            transform: isPlayheadHere ? "scale(1.3)" : "scale(1)",
                            transition: "transform 0.05s",
                          }}>
                            {info.label}
                          </span>
                        )}
                        {isPlayheadHere && (
                          <div style={{
                            position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
                            background: MC[0], boxShadow: `0 0 4px ${MC[0]}`,
                          }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── OSCILLOSCOPE ─── */}
      <div style={{
        flexShrink: 0, background: "#08080c", borderRadius: 5,
        border: "1px solid #1a1a22", overflow: "hidden", height: 38,
      }}>
        <canvas ref={canvasRef} width={900} height={55}
          style={{ width: "100%", height: "100%", display: "block" }} />
      </div>

      {/* ─── TRANSPORT ─── */}
      <div style={{
        flexShrink: 0, display: "flex", gap: 5, alignItems: "center",
        justifyContent: "center", padding: 5,
        background: "#0a0a10", borderRadius: 7, border: "1px solid #1a1a22",
      }}>
        <button onClick={toggleRec}
          style={{
            width: 40, height: 40, borderRadius: "50%", cursor: "pointer",
            background: isRec ? MC[1] : "#111118",
            border: `2px solid ${MC[1]}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: isRec ? `0 0 14px ${MC[1]}55` : "none",
            touchAction: "none",
          }}>
          <div style={{
            width: 12, height: 12, borderRadius: "50%",
            background: isRec ? "#fff" : MC[1],
            animation: isRec ? "pulse 0.8s infinite" : "none",
          }} />
        </button>
        <button onClick={isPlay ? stopPlay : startPlay}
          style={{
            width: 40, height: 40, borderRadius: "50%", cursor: "pointer",
            background: isPlay ? MC[4] + "22" : "#111118",
            border: `2px solid ${MC[4]}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: MC[4], fontSize: 15, fontFamily: "inherit",
            touchAction: "none",
            animation: onboardStage === 2 ? "pulse 1.5s infinite" : "none",
          }}>
          {isPlay ? "■" : "▶"}
        </button>
        <button onClick={() => setLoopMode(!loopMode)}
          style={{
            padding: "0 10px", height: 36, borderRadius: 6, cursor: "pointer",
            background: loopMode ? MC[0] + "22" : "#111118",
            border: `1px solid ${loopMode ? MC[0] : "#222"}`,
            color: loopMode ? MC[0] : "#555",
            fontSize: 10, fontFamily: "inherit", touchAction: "none",
          }}>
          {loopMode ? "🔁" : "1×"}
        </button>
        <div style={{ fontSize: 8, color: "#444" }}>
          {isRec && <span style={{ color: MC[1] }}>● REC → {tracks[activeTrk].name}</span>}
          {!isRec && isPlay && <span style={{ color: MC[4] }}>▶ {loopMode ? "LOOP" : "PLAY"}</span>}
          {!isRec && !isPlay && <span>→ {tracks[activeTrk].name}</span>}
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        input[type="range"]{-webkit-appearance:none;background:#1a1a22;border-radius:2px;height:3px;outline:none;touch-action:none}
        input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#FF2222;cursor:pointer}
        button{-webkit-tap-highlight-color:transparent}
        *{box-sizing:border-box}
      `}</style>
    </div>
  );
}
