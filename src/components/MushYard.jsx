import { useEffect, useRef } from "react";

// Mush, live. Every pixel is the show's own mushDraw, and every move is the show's own
// mmoMushBounce / mmoMushHop / mmoMushIdle (public/mush/rig.js). This file is only the
// state machine that decides which move to make next.
//
//   IDLE ──pointer far──▶ NOTICE ──▶ CHASE (bounce-walk) ──arrived──▶ IDLE
//     │                                   └──pointer right above──▶ HOP ──▶ HAPPY
//     ├──click him──▶ SPLAT (the pancake) ──▶ IDLE
//     └──no pointer for a while──▶ SLEEPY ──pointer moves──▶ NOTICE
//
// Plans are only changed with his feet on the ground, so nothing ever skates.

let rigPromise = null;
function loadRig() {
  if (window.MushRig) return Promise.resolve(window.MushRig);
  if (!rigPromise) rigPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "/mush/rig.js"; s.async = true;
    s.onload = () => resolve(window.MushRig); s.onerror = reject;
    document.head.appendChild(s);
  });
  return rigPromise;
}

const NOTES = ["C5:0.14 E5:0.14 G5:0.22", "G5:0.12 E5:0.12 C6:0.26", "E5:0.1 F5:0.1 G5:0.1 A5:0.24", "D5:0.16 B4:0.16 G5:0.3"];

export default function MushYard({ height = 300 }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current, canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let R = null, raf = 0, visible = true, dead = false;
    let W = 0, H = height, dpr = 1;
    const now = () => performance.now() / 1000;

    // ── state ──
    const S = { mode: "idle", t0: now(), x: 0, dir: 1, yaw: 0, plan: null, notes: null, lastMove: now() };
    const P = { x: null, y: null, inside: false };

    const size = () => {
      const r = wrap.getBoundingClientRect();
      W = Math.max(280, r.width); H = height; dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      if (!S.x) S.x = W * 0.5;
    };
    const mh = () => Math.min(150, Math.max(110, H * 0.5));   // Mush's height in px
    const ground = () => H - 22;

    const toLocal = (e) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top, inside: e.clientY >= r.top && e.clientY <= r.bottom };
    };
    const onMove = (e) => {
      const p = toLocal(e); P.x = p.x; P.y = p.y; P.inside = p.inside; S.lastMove = now();
      if (S.mode === "sleepy") go("notice");
    };
    const hitMush = (p) => Math.abs(p.x - S.x) < mh() * 0.42 && p.y > ground() - mh() * 1.05 && p.y < ground() + 6;
    const onDown = (e) => {
      const p = toLocal(e); if (!p.inside) return;
      P.x = p.x; P.y = p.y; P.inside = true; S.lastMove = now();
      if (hitMush(p) && S.mode !== "splat" && !airborne()) go("splat");
      else if (e.pointerType !== "mouse") go("notice");          // a tap is a place to go
    };

    const go = (mode, extra) => { S.mode = mode; S.t0 = now(); Object.assign(S, extra || {}); };
    let last = null;                                             // the last motion sample
    const airborne = () => !!(last && last.air);
    const rateFor = (d) => Math.min(2.3, 1.45 + d / 700);

    const clampX = (x) => Math.max(mh() * 0.5, Math.min(W - mh() * 0.5, x));
    const startChase = (t) => {
      const dx = clampX(P.x) - S.x, dir = Math.sign(dx) || 1, h = mh();
      const len = 0.46, rate = rateFor(Math.abs(dx));
      const n = Math.max(1, Math.round(Math.abs(dx) / (len * h)));
      go("chase", { dir, plan: { t0: t, x0: S.x, dir, h, len, rate, n } });
    };

    const frame = () => {
      raf = 0;
      if (dead || !visible) return;
      const t = now(), age = t - S.t0, h = mh(), gy = ground();
      const g = canvas.getContext("2d");
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);

      // the ground: a marker line with a little boil
      g.save(); g.strokeStyle = "#211e24"; g.lineWidth = 2.5; g.lineCap = "round"; g.beginPath();
      const bk = R.mmBoil(t);
      for (let x = 0; x <= W; x += 24) { const y = gy + 6 + Math.sin(x * 0.05 + bk * 1.7) * 0.8; x ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke(); g.restore();

      const target = P.x == null ? S.x : clampX(P.x);
      const lookDir = Math.sign(target - S.x) || S.dir;
      const C = { h, t, seed: 2, x: S.x, y: gy };
      let lift = 0;

      if (reduce) {
        Object.assign(C, R.mmoMushIdle(0, {}), { yaw: 0 });
      } else if (S.mode === "idle" || S.mode === "sleepy") {
        const m = R.mmoMushIdle(t, {}); last = { air: false };
        Object.assign(C, m);
        S.yaw += ((lookDir * 0.55) - S.yaw) * 0.08;
        C.yaw = S.yaw;
        const sleepy = S.mode === "sleepy";
        const lookY = P.y == null ? 0 : Math.max(-1, Math.min(1, (P.y - (gy - h)) / 200));
        C.eyes = { look: [sleepy ? 0 : lookDir * 0.8, sleepy ? 0.4 : lookY], lid: sleepy ? 0.82 : 0 };
        if (sleepy) { C.lean = -0.06; C.ant = { droop: 0.55 }; }
        if (!sleepy && t - S.lastMove > 9) go("sleepy");
        if (!sleepy && P.x != null && Math.abs(target - S.x) > h * 0.55) go("notice");
        if (!sleepy && P.inside && P.y < gy - h * 1.1 && Math.abs(P.x - S.x) < h * 0.9 && age > 0.6) go("hop", { dir: lookDir, hopDist: Math.max(-h, Math.min(h, P.x - S.x)) * 0.8 });
      } else if (S.mode === "notice") {
        const k = Math.min(1, age / 0.32);
        Object.assign(C, R.mmoMushIdle(t, {}));
        S.yaw += ((lookDir * 0.9) - S.yaw) * 0.25; C.yaw = S.yaw;
        C.squash = 0.18 * Math.sin(Math.PI * k);                         // a little 'hup'
        C.eyes = { wide: 1, look: [lookDir, -0.2] }; C.ant = { up: 1, droop: -0.3 * (1 - k) };
        last = { air: false };
        if (age > 0.34) { if (Math.abs(target - S.x) > h * 0.45) startChase(t); else go("idle"); }
      } else if (S.mode === "chase") {
        const p = S.plan;
        const m = R.mmoMushBounce(t, { t0: p.t0, x0: p.x0, dir: p.dir, h: p.h, len: p.len, rate: p.rate, n: p.n });
        last = m; S.x = m.x; lift = m.y; S.yaw = m.yaw; S.dir = p.dir;
        Object.assign(C, m, { x: S.x, y: gy - lift, eyes: { look: [p.dir, 0], wide: 0.4 } });
        // re-plan only on the ground: the target moved behind him, or he has arrived
        if (!m.air) {
          const left = target - S.x;
          if (m.done || Math.sign(left) !== p.dir) { if (Math.abs(left) > h * 0.45) startChase(t); else go("idle", { lastMove: Math.min(S.lastMove, t) }); }
        }
      } else if (S.mode === "hop") {
        const m = R.mmoMushHop(age, { h, dir: S.dir, dist: Math.abs(S.hopDist), height: 0.55 });
        last = m; lift = m.y;
        const x = S.x + Math.sign(S.hopDist || 1) * Math.abs(m.x);
        Object.assign(C, m, { x, y: gy - lift, yaw: S.yaw, eyes: { wide: 1, look: [0, -1] } });
        if (age > 1.25) { S.x = x; go("happy", { notes: NOTES[(Math.random() * NOTES.length) | 0] }); }
      } else if (S.mode === "happy") {
        Object.assign(C, R.mmoMushIdle(t, {}), { yaw: S.yaw * 0.5, eyes: { happy: 1 }, mouth: { shape: "grin" } });
        last = { air: false };
        if (age > 1.8) go("idle", { lastMove: t });
      } else if (S.mode === "splat") {
        last = { air: false };
        const flat = age < 0.12 ? age / 0.12 : age < 1.1 ? 1 : Math.max(0, 1 - (age - 1.1) / 0.18);
        Object.assign(C, { yaw: 0, flat, eyes: { lid: age < 0.8 ? 1 : 0, look: [0, 0] } });
        if (age > 1.3) {
          const sq = 0.9 * Math.exp(-(age - 1.3) * 6) * Math.cos((age - 1.3) * 16);  // springs back up
          C.flat = 0; C.squash = -sq * 0.8; C.eyes = { wide: 1 }; C.ant = { up: 1, wobble: 0.6 };
        }
        if (age > 2.0) go("happy", { notes: NOTES[0] });
      }

      // contact shadow, shrinking as he lifts
      const k = 1 / (1 + Math.max(0, lift / h) * 2.2);
      g.save(); g.fillStyle = "rgba(33,30,36,0.16)"; g.beginPath();
      g.ellipse(C.x, gy + 4, h * 0.34 * (0.6 + 0.4 * k), h * 0.06 * (0.6 + 0.4 * k), 0, 0, Math.PI * 2); g.fill(); g.restore();

      wrap.dataset.mode = S.mode; wrap.dataset.x = Math.round(C.x);
      try { R.mushDraw(g, C); } catch (err) { console.warn("[mush]", err); return; }
      if (S.mode === "happy" && S.notes) R.mushNotes(g, C.x, gy - h * 1.15, S.notes, S.t0 + 0.05, t, { size: 22 });

      if (!reduce) raf = requestAnimationFrame(frame);
    };
    const kick = () => { if (!raf && R && visible && !dead) raf = requestAnimationFrame(frame); };

    size();
    const ro = new ResizeObserver(() => { size(); kick(); }); ro.observe(wrap);
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; kick(); }); io.observe(wrap);
    window.addEventListener("pointermove", onMove, { passive: true });
    canvas.addEventListener("pointerdown", onDown);
    loadRig().then(rig => { if (dead) return; R = rig; wrap.dataset.ready = "true"; kick(); }).catch(() => { wrap.dataset.ready = "failed"; });

    return () => {
      dead = true; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      window.removeEventListener("pointermove", onMove); canvas.removeEventListener("pointerdown", onDown);
    };
  }, [height]);

  return <div className="mush-yard" ref={wrapRef}>
    <canvas ref={canvasRef} role="img" aria-label="Mush, animated live: he hops after your pointer, and squashes flat if you click him." />
  </div>;
}
