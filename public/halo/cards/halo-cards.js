// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// HALO CARDS · one renderer: card data in, card face out. Canvas 2D, self-contained (no outside URLs, no libraries).
//   The face is Mook's 2020 template as drawn for EP7 (SHOW-BIBLE/art/cards/EP7_cards_v2.jpg, ported from
//   episodes/ep07/blocks/mm_cards7.js): pale blue card, thick black frame, hm circle, the name across the top, a
//   rounded art window with the set number, A · D · M rows with power discs, ECON circle, DEV square, flavor.
//   Lettering: the Halo hand (ported from episodes/ep07/blocks/mm_uncial7.js). Numbers stay in a plain round hand.
//   Power discs: his digit key, D:\Mook\CLAUDE.md (the SYN table). The digit is always printed.
//
//   HaloCards.draw(g, card, x, y, w, opts)   draw one card on any 2D context (top-left x,y, w wide, h = 1.4 w)
//   HaloCards.render(card, opts) -> canvas   the same, on a new canvas
//   HaloCards.drawBack(g, x, y, w, opts)     the card back (the Poptart)
//   HaloCards.drawHolo(g, card, x, y, w, h, opts)  the card as a hologram (cyan light in dark space)
//   HaloCards.mount(el, card, opts) -> ctl   a live card: tilt toward the cursor, finishes, ctl.play() = the hologram moment
//   opts: { finish: 'plain'|'laminate'|'first'|'lenticular', t: seconds (line boil), tilt: {x, y} in -1..1, dpr }
//   card: an entry of HALO_CARD_DATA.cards (halo-card-data.js, built from the engine by build-data.js)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
(function (root) {
'use strict';
// ── his digit key (D:\Mook\CLAUDE.md, the SYN table). Never adjust these.
const DIGIT = { 0: '#00bcd4', 1: '#e53935', 2: '#1565c0', 3: '#f9a825', 4: '#2e7d32', 5: '#ef6c00', 6: '#6a1b9a', 7: '#c2185b', 8: '#f5f5f5', 9: '#212121' };
const DIGIT_INK = { 0: '#1c1a21', 3: '#1c1a21', 8: '#1c1a21' };          // a dark digit on the light discs
const INK = '#1c1a21', BLUE = '#cfe0f6', PAPER = '#f6f1e5', CREAM = '#fdfcf5', HOLO = '#7ff3ff';
const NUMFONT = '"Comic Sans MS", "Comic Neue", "Chalkboard SE", sans-serif';   // the plain round hand for numbers
const ST = { holo: false, glow: 0 };                                       // style switch: printed ink or hologram light

// ── numbers (from mm_core.js): stable hashes, smooth noise, the boil. Never Math.random().
function hash(n) { n = n | 0; n = Math.imul(n ^ (n >>> 16), 0x45d9f3b); n = Math.imul(n ^ (n >>> 16), 0x45d9f3b); n = n ^ (n >>> 16); return (n >>> 0) / 4294967296; }
function H2(a, b) { return hash(Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663) ^ 0x5bd1e995); }
function VN1(x, s) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return H2(i, s | 0) + (H2(i + 1, s | 0) - H2(i, s | 0)) * u; }
function SN1(x, s) { return VN1(x, s) * 2 - 1; }
function boil(t) { return Math.floor((t || 0) * 7.5 + 1e-6); }        // the line is redrawn 7.5 times a second
const c01 = x => x < 0 ? 0 : x > 1 ? 1 : x, smooth = k => { k = c01(k); return k * k * (3 - 2 * k); };
function rgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function rgba(h, a) { const c = rgb(h); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
function mix(h1, h2, k) { const a = rgb(h1), b = rgb(h2); return 'rgb(' + [0, 1, 2].map(i => Math.round(a[i] + (b[i] - a[i]) * c01(k))).join(',') + ')'; }

// ── marker ink (from mm_core.js): a Catmull-Rom line through points, wobbled on every boil
function wob(P, seed, amp, bk) { if (!amp) return P; return P.map((p, i) => { const u = i * 0.37 + bk * 5.31; return [p[0] + SN1(u, seed * 7 + 1) * amp, p[1] + SN1(u + 71.3, seed * 7 + 2) * amp]; }); }
function trace(g, P, closed, poly) {
  const n = P.length; if (n < 2) return; g.moveTo(P[0][0], P[0][1]);
  if (poly) { for (let i = 1; i < n; i++) g.lineTo(P[i][0], P[i][1]); if (closed) g.closePath(); return; }
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = P[closed ? (i - 1 + n) % n : Math.max(0, i - 1)], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[closed ? (i + 2) % n : Math.min(n - 1, i + 2)];
    g.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
  }
  if (closed) g.closePath();
}
// o: { fill, lw, closed (true), seed, amp, bk, poly, ink }
function ink(g, P, o) {
  const Q = o.amp ? wob(P, o.seed | 0, o.amp, o.bk | 0) : P, closed = o.closed !== false, poly = o.poly !== undefined ? o.poly : (closed && P.length <= 6);
  g.beginPath(); trace(g, Q, closed, poly);
  if (ST.holo) {                                                          // the hologram: fills are faint light, lines glow
    if (o.fill && closed) { g.fillStyle = rgba(HOLO, 0.10); g.fill(); }
    if (o.lw) { g.save(); g.lineWidth = o.lw * 0.8; g.strokeStyle = HOLO; g.shadowColor = HOLO; g.shadowBlur = ST.glow; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); g.restore(); }
    return Q;
  }
  if (o.fill && closed) { g.fillStyle = o.fill; g.fill(); }
  if (o.lw) { g.lineWidth = o.lw; g.strokeStyle = o.ink || INK; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); }
  return Q;
}
function circlePts(cx, cy, rx, ry, n, rot, lump, seed) {
  const P = [], c = Math.cos(rot || 0), s = Math.sin(rot || 0);
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, k = 1 + (lump || 0) * (SN1(i * 0.9, seed | 0) * 0.6 + Math.sin(a * 2 + (seed | 0)) * 0.4), x = Math.cos(a) * rx * k, y = Math.sin(a) * ry * k; P.push([cx + x * c - y * s, cy + x * s + y * c]); }
  return P;
}
function rectPts(x0, y0, x1, y1, r, per) {
  const P = [], k = per || 6; r = Math.max(0.01, r);
  const corner = (cx, cy, a0) => { for (let i = 0; i <= k; i++) { const a = a0 + i / k * Math.PI / 2; P.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
  corner(x1 - r, y0 + r, -Math.PI / 2); corner(x1 - r, y1 - r, 0); corner(x0 + r, y1 - r, Math.PI / 2); corner(x0 + r, y0 + r, Math.PI);
  return P;
}
function dot(g, x, y, r, col) { g.beginPath(); g.arc(x, y, Math.max(0.3, r), 0, Math.PI * 2); g.fillStyle = ST.holo ? rgba(HOLO, 0.7) : col; g.fill(); }

// ══ THE HALO HAND (ported from mm_uncial7.js, his approved lettering, version A) ══════════════════════════════════
const ARC = (cx, cy, rx, ry, a0, a1) => { const n = Math.max(3, Math.ceil(Math.abs(a1 - a0) / 12)), P = []; for (let i = 0; i <= n; i++) { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; P.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); } return P; };
const S_ = (...parts) => { const P = []; for (const q of parts) { if (typeof q[0] === 'number') P.push(q); else for (const r of q) P.push(r); } return P; };
const G = {
  A: { w: 0.86, s: [[[0.06, 0.0], [0.20, -0.44], [0.33, -0.82], [0.44, -1.0]], [[0.36, -0.96], [0.44, -1.0], [0.56, -0.7], [0.68, -0.3], [0.80, 0.0]], [[0.19, -0.36], [0.44, -0.42], [0.67, -0.35]]] },
  B: { w: 0.82, s: [[[0.14, -1.0], [0.14, 0.0]], S_([0.14, -1.0], ARC(0.40, -0.76, 0.25, 0.24, -90, 90), [0.14, -0.52]), S_([0.14, -0.52], ARC(0.44, -0.27, 0.29, 0.26, -90, 90), [0.14, 0.0])] },
  C: { w: 0.82, s: [ARC(0.47, -0.5, 0.38, 0.5, -45, -315)] },
  D: { w: 0.88, s: [[[0.14, -1.0], [0.14, 0.0]], S_([0.14, -1.0], [0.34, -1.0], ARC(0.40, -0.5, 0.38, 0.5, -80, 80), [0.34, 0.0], [0.14, 0.0])] },
  E: { w: 0.78, s: [ARC(0.46, -0.5, 0.37, 0.5, -55, -305), [[0.12, -0.52], [0.56, -0.52]]] },
  F: { w: 0.70, s: [[[0.16, -1.0], [0.16, 0.06]], [[0.16, -1.0], [0.50, -1.0], [0.66, -0.94]], [[0.16, -0.55], [0.52, -0.55]]] },
  G: { w: 0.90, s: [ARC(0.47, -0.5, 0.38, 0.5, -45, -350), [[0.86, -0.44], [0.56, -0.44]]] },
  H: { w: 0.80, s: [[[0.14, -1.06], [0.14, 0.0]], [[0.14, -0.5], [0.30, -0.64], [0.50, -0.64], [0.62, -0.5], [0.63, -0.15], [0.66, -0.02], [0.74, 0.0]]] },
  I: { w: 0.34, s: [[[0.16, -1.0], [0.16, 0.0]]] },
  J: { w: 0.50, s: [[[0.36, -1.0], [0.36, -0.1], [0.28, 0.06], [0.08, 0.08]]] },
  K: { w: 0.74, s: [[[0.14, -1.0], [0.14, 0.0]], [[0.62, -0.98], [0.16, -0.48]], [[0.24, -0.56], [0.50, -0.2], [0.68, 0.0]]] },
  L: { w: 0.70, s: [[[0.14, -1.04], [0.14, -0.06], [0.20, 0.0], [0.60, 0.0], [0.66, -0.08]]] },
  M: { w: 1.06, s: [[[0.14, -0.96], [0.14, 0.0]], [[0.14, -0.82], [0.28, -0.98], [0.42, -0.96], [0.52, -0.8], [0.52, 0.0]], [[0.52, -0.82], [0.66, -0.98], [0.80, -0.96], [0.90, -0.8], [0.90, -0.08], [0.96, 0.0]]] },
  N: { w: 0.86, s: [[[0.14, 0.0], [0.14, -1.0]], [[0.14, -1.0], [0.42, -0.5], [0.70, 0.0]], [[0.70, 0.0], [0.70, -1.0]]] },
  O: { w: 0.92, s: [ARC(0.46, -0.5, 0.38, 0.5, -90, 270)] },
  P: { w: 0.72, s: [[[0.14, -1.0], [0.14, 0.14]], S_([0.14, -1.0], ARC(0.38, -0.73, 0.27, 0.27, -90, 90), [0.14, -0.46])] },
  Q: { w: 0.94, s: [ARC(0.46, -0.5, 0.38, 0.5, -90, 270), [[0.52, -0.12], [0.70, 0.05], [0.90, 0.12]]] },
  R: { w: 0.80, s: [[[0.14, -1.0], [0.14, 0.0]], S_([0.14, -1.0], ARC(0.36, -0.76, 0.25, 0.24, -90, 90), [0.14, -0.52]), [[0.30, -0.52], [0.50, -0.22], [0.62, -0.04], [0.74, 0.0]]] },
  S: { w: 0.74, s: [[[0.64, -0.86], [0.50, -0.99], [0.30, -0.99], [0.16, -0.85], [0.20, -0.65], [0.46, -0.5], [0.64, -0.3], [0.60, -0.08], [0.42, 0.0], [0.20, -0.02], [0.08, -0.14]]] },
  T: { w: 0.82, s: [[[0.06, -0.94], [0.20, -1.0], [0.60, -1.0], [0.76, -0.94]], [[0.42, -1.0], [0.38, -0.5], [0.40, -0.16], [0.50, -0.02], [0.66, 0.0]]] },
  U: { w: 0.84, s: [[[0.14, -1.0], [0.14, -0.3], [0.24, -0.06], [0.42, 0.0], [0.58, -0.08], [0.68, -0.3]], [[0.70, -1.0], [0.70, -0.06], [0.76, 0.0]]] },
  V: { w: 0.80, s: [[[0.06, -1.0], [0.24, -0.5], [0.40, 0.0]], [[0.40, 0.0], [0.58, -0.5], [0.74, -1.0]]] },
  W: { w: 1.02, s: [[[0.04, -1.0], [0.26, 0.0]], [[0.26, 0.0], [0.50, -0.72]], [[0.50, -0.72], [0.74, 0.0]], [[0.74, 0.0], [0.98, -1.0]]] },
  X: { w: 0.78, s: [[[0.08, -1.0], [0.70, 0.0]], [[0.70, -1.0], [0.08, 0.0]]] },
  Y: { w: 0.78, s: [[[0.06, -1.0], [0.38, -0.48]], [[0.72, -1.0], [0.38, -0.48], [0.38, 0.0]]] },
  Z: { w: 0.78, s: [[[0.08, -1.0], [0.66, -1.0]], [[0.66, -1.0], [0.08, 0.0]], [[0.08, 0.0], [0.70, 0.0]]] },
  '0': { w: 0.76, s: [ARC(0.38, -0.5, 0.28, 0.5, -90, 270)] },
  '1': { w: 0.50, s: [[[0.16, -0.84], [0.32, -1.0], [0.32, 0.0]]] },
  '2': { w: 0.72, s: [[[0.10, -0.8], [0.22, -0.97], [0.42, -1.0], [0.58, -0.86], [0.56, -0.62], [0.08, 0.0]], [[0.08, 0.0], [0.64, 0.0]]] },
  '3': { w: 0.70, s: [[[0.10, -0.88], [0.30, -1.0], [0.52, -0.92], [0.54, -0.66], [0.30, -0.54]], [[0.30, -0.54], [0.56, -0.42], [0.58, -0.14], [0.36, 0.0], [0.08, -0.1]]] },
  '4': { w: 0.74, s: [[[0.50, -1.0], [0.06, -0.32]], [[0.06, -0.32], [0.68, -0.32]], [[0.50, -0.7], [0.50, 0.05]]] },
  '5': { w: 0.70, s: [[[0.60, -1.0], [0.18, -1.0]], [[0.18, -1.0], [0.14, -0.56]], [[0.14, -0.56], [0.40, -0.62], [0.58, -0.42], [0.56, -0.14], [0.36, 0.0], [0.10, -0.08]]] },
  '6': { w: 0.72, s: [[[0.56, -0.94], [0.36, -1.0], [0.16, -0.78], [0.12, -0.4], [0.20, -0.08], [0.38, 0.0], [0.56, -0.12], [0.60, -0.36], [0.44, -0.56], [0.24, -0.54], [0.13, -0.4]]] },
  '7': { w: 0.70, s: [[[0.08, -1.0], [0.64, -1.0]], [[0.64, -1.0], [0.30, 0.0]]] },
  '8': { w: 0.72, s: [ARC(0.36, -0.75, 0.21, 0.25, -90, 270), ARC(0.36, -0.25, 0.25, 0.25, -90, 270)] },
  '9': { w: 0.72, s: [[[0.58, -0.6], [0.38, -0.46], [0.16, -0.58], [0.14, -0.84], [0.32, -1.0], [0.52, -0.96], [0.60, -0.7], [0.56, -0.3], [0.40, -0.04], [0.16, 0.0]]] },
  '-': { w: 0.48, s: [[[0.08, -0.45], [0.40, -0.45]]] },
  '—': { w: 0.90, s: [[[0.06, -0.45], [0.84, -0.45]]] },
  "'": { w: 0.26, s: [[[0.14, -1.0], [0.11, -0.74]]] },
  '.': { w: 0.26, s: [[[0.12, -0.06], [0.13, 0.0]]] },
  ',': { w: 0.26, s: [[[0.14, -0.06], [0.08, 0.15]]] },
  '!': { w: 0.32, s: [[[0.15, -1.0], [0.14, -0.3]], [[0.14, -0.06], [0.14, 0.0]]] },
  '?': { w: 0.64, s: [[[0.10, -0.85], [0.30, -1.0], [0.55, -0.85], [0.50, -0.6], [0.30, -0.45], [0.30, -0.28]], [[0.30, -0.06], [0.30, 0.0]]] },
  '&': { w: 0.80, s: [[[0.72, 0.0], [0.20, -0.6], [0.22, -0.9], [0.38, -1.0], [0.52, -0.88], [0.45, -0.68], [0.12, -0.35], [0.14, -0.08], [0.35, 0.0], [0.58, -0.15], [0.72, -0.42]]] },
  '/': { w: 0.58, s: [[[0.50, -1.05], [0.08, 0.1]]] },
  ':': { w: 0.26, s: [[[0.13, -0.56], [0.13, -0.5]], [[0.13, -0.06], [0.13, 0.0]]] },
  '+': { w: 0.66, s: [[[0.08, -0.45], [0.58, -0.45]], [[0.33, -0.70], [0.33, -0.20]]] },
  '(': { w: 0.42, s: [ARC(0.40, -0.45, 0.24, 0.62, 128, 232)] },
  ')': { w: 0.42, s: [ARC(0.02, -0.45, 0.24, 0.62, -52, 52)] },
  ' ': { w: 0.36, s: [] },
};
const TRACK = 0.07, SM = {};
function smoothStroke(P) {
  if (P.length < 2) return P.slice(); const out = [P[0]];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || P[i + 1], n = Math.max(1, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / 0.035));
    for (let j = 1; j <= n; j++) { const t = j / n, t2 = t * t, t3 = t2 * t, f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3); out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]); }
  }
  return out;
}
function glyph(ch) { const g = G[ch]; if (!g) return null; if (!SM[ch]) SM[ch] = g.s.map(smoothStroke); return { w: g.w, s: SM[ch] }; }
function uWidth(str, cap, o) { o = o || {}; const tr = o.track === undefined ? TRACK : o.track; let w = 0; for (const c of String(str).toUpperCase()) { const g = G[c]; w += (g ? g.w : 0.7) + tr; } return Math.max(0, w - tr) * cap; }
// draw str with its baseline at y. o = { align, col, t, seed, whim, nib, emboss }
function uText(g, str, x, y, cap, o) {
  o = o || {};
  if (o.emboss && !ST.holo) {                                             // FIRST EDITION: embossed lettering (a lit edge up-left, a shadow down-right)
    const e = Math.max(0.35, cap * 0.045), base = Object.assign({}, o, { emboss: false });
    uText(g, str, x - e, y - e, cap, Object.assign({}, base, { col: 'rgba(255,255,255,0.85)' }));
    uText(g, str, x + e, y + e, cap, Object.assign({}, base, { col: 'rgba(0,0,0,0.45)' }));
  }
  str = String(str).toUpperCase();
  const W = uWidth(str, cap, o), tr = o.track === undefined ? TRACK : o.track, whim = o.whim === undefined ? 1 : o.whim, seed = (o.seed | 0) + 7, bk = boil(o.t);
  const nibW = 0.15 * cap * (o.nib || 1), th = 0.2, hair = Math.max(0.3, 0.05 * cap * (o.nib || 1)), nx = Math.cos(th) * nibW / 2, ny = -Math.sin(th) * nibW / 2;
  const col = ST.holo ? HOLO : (o.col || INK);
  let cx = x - (o.align === 'center' ? W / 2 : o.align === 'right' ? W : 0), i = 0;
  g.save(); g.fillStyle = col; g.strokeStyle = col; g.lineCap = 'round'; g.lineJoin = 'round';
  if (ST.holo) { g.shadowColor = HOLO; g.shadowBlur = ST.glow; }
  const nib = new Path2D(), line = new Path2D();
  for (const ch of str) {
    const gl = glyph(ch);
    if (ch === ' ' || !gl) { if (!gl && ch !== ' ') { g.font = (cap * 1.2) + 'px ' + NUMFONT; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.fillText(ch, cx, y); } cx += ((gl ? gl.w : 0.7) + tr) * cap; i++; continue; }
    const dy = (H2(i + seed, 11) - 0.5) * 0.07 * cap * whim, rot = (H2(i + seed, 23) - 0.5) * 0.08 * whim, sc = 1 + (H2(i + seed, 37) - 0.5) * 0.06 * whim;
    const ox = cx + gl.w * cap / 2, oy = y - 0.5 * cap, cr = Math.cos(rot), sr = Math.sin(rot); let k = 0;
    for (const S of gl.s) {
      const Q = S.map((p, j) => { const px = (p[0] - gl.w / 2) * cap * sc, py = (p[1] + 0.5) * cap * sc, wb = 0.011 * cap * whim, wx = SN1(j * 0.31 + bk * 5.3, seed * 13 + i * 7 + k) * wb, wy = SN1(j * 0.31 + bk * 5.3 + 40, seed * 13 + i * 7 + k) * wb; return [ox + px * cr - py * sr + wx, oy + dy + px * sr + py * cr + wy]; });
      for (let j = 0; j < Q.length - 1; j++) {                         // the broad nib, swept
        const p = Q[j], q = Q[j + 1]; let A = [[p[0] + nx, p[1] + ny], [q[0] + nx, q[1] + ny], [q[0] - nx, q[1] - ny], [p[0] - nx, p[1] - ny]];
        const ar = (A[1][0] - A[0][0]) * (A[2][1] - A[0][1]) - (A[2][0] - A[0][0]) * (A[1][1] - A[0][1]); if (ar < 0) A = A.reverse();
        nib.moveTo(A[0][0], A[0][1]); nib.lineTo(A[1][0], A[1][1]); nib.lineTo(A[2][0], A[2][1]); nib.lineTo(A[3][0], A[3][1]); nib.closePath();
      }
      line.moveTo(Q[0][0], Q[0][1]); for (let j = 1; j < Q.length; j++) line.lineTo(Q[j][0], Q[j][1]); k++;
    }
    cx += (gl.w + tr) * cap; i++;
  }
  g.fill(nib, 'nonzero'); g.lineWidth = hair; g.stroke(line); g.restore();
  return W;
}
function uWrap(str, cap, maxW) { const words = String(str).split(' '), lines = []; let cur = ''; for (const wd of words) { const t = cur ? cur + ' ' + wd : wd; if (uWidth(t, cap) > maxW && cur) { lines.push(cur); cur = wd; } else cur = t; } if (cur) lines.push(cur); return lines; }
// the plain round hand (numbers and the rule line), wrapped
function pWrap(g, str, size, maxW) { g.font = size + 'px ' + NUMFONT; const words = String(str).split(' '), lines = []; let cur = ''; for (const wd of words) { const t = cur ? cur + ' ' + wd : wd; if (g.measureText(t).width > maxW && cur) { lines.push(cur); cur = wd; } else cur = t; } if (cur) lines.push(cur); return lines; }

// ══ THE ART: one function per card, drawn in the show's line inside a 244 × 194 window centred on (0, 0) ══════════
//   a.layer(z, fn): depth for the First Edition 3D picture (z < 0 far, z > 0 near).  a.alt: the second picture of the
//   lenticular.  a.t: seconds.  Colours here are picture colours (sea, wood, fur): the digit key is only for numbers.
function artKit(g, o) {
  const bk = boil(o.t), L = 2.4;
  const a = {
    g, t: o.t || 0, alt: !!o.alt, bk, L, depth: o.depth || 0, tilt: o.tilt || { x: 0, y: 0 },
    ink: (P, fill, seed, lw, poly) => ink(g, P, { fill, lw: lw === undefined ? L : lw, amp: 0.5, seed: seed || 1, bk, poly }),
    poly: (P, fill, seed, lw) => a.ink(P, fill, seed, lw, true),
    blob: (P, fill, seed, lw) => a.ink(P, fill, seed, lw, false),
    line: (P, seed, lw) => ink(g, P, { closed: false, lw: lw || L, amp: 0.4, seed: seed || 2, bk, poly: true }),
    curve: (P, seed, lw) => ink(g, P, { closed: false, lw: lw || L, amp: 0.4, seed: seed || 2, bk, poly: false }),
    circ: (x, y, rx, ry, fill, seed, lw, lump) => ink(g, circlePts(x, y, rx, ry === undefined ? rx : ry, 18, 0, lump || 0.02, seed || 3), { fill, lw: lw === undefined ? L : lw, amp: 0.4, seed: seed || 3, bk, poly: false }),
    rect: (x0, y0, x1, y1, r, fill, seed, lw) => ink(g, rectPts(x0, y0, x1, y1, r || 1, 4), { fill, lw: lw === undefined ? L : lw, amp: 0.4, seed: seed || 4, bk, poly: true }),
    dot: (x, y, r, col) => dot(g, x, y, r, col || INK),
    at: (x, y, rot, fn, s) => { g.save(); g.translate(x, y); if (rot) g.rotate(rot); if (s) g.scale(s, s); fn(); g.restore(); },
    layer: (z, fn) => { g.save(); g.translate(a.tilt.x * z * 16 * a.depth, a.tilt.y * z * 11 * a.depth); fn(); g.restore(); },
    nim: col => { if (ST.holo) return; const gl = g.createRadialGradient(0, 0, 10, 0, 0, 130); gl.addColorStop(0, rgba(col, 0.6)); gl.addColorStop(1, rgba(col, 0)); g.fillStyle = gl; g.fillRect(-160, -130, 320, 260); },
    fillRect: (x0, y0, x1, y1, col) => { if (ST.holo) return; g.fillStyle = col; g.fillRect(x0, y0, x1 - x0, y1 - y0); },
    puff: (x, y, r, seed, fill) => a.circ(x, y, r, r * 0.86, fill || '#f6efe2', seed, L * 0.6, 0.12),
    star: (x, y, r, fill, seed) => { const P = []; for (let i = 0; i < 16; i++) { const an = i / 16 * Math.PI * 2, rr = i % 2 ? r * 0.45 : r; P.push([x + Math.cos(an) * rr, y + Math.sin(an) * rr]); } a.poly(P, fill || '#ffd34d', seed || 9, L * 0.7); },
  };
  return a;
}
const ART = {};
// ── small shared pieces
function ship(a, o) {                                                    // a pirate hull with a sail: o = { len, sail, sailCol, hull, ports, flag, patches, sails }
  const l = o.len || 80, h = l * 0.42;
  a.poly([[-l, 0], [l * 1.05, 0], [l * 0.78, h], [-l * 0.78, h]], o.hull || '#8a5a3a', 2);
  for (let i = 0; i < (o.ports || 3); i++) { const px = -l * 0.66 + i * (l * 1.3 / Math.max(1, (o.ports || 3) - 1)); a.rect(px - 5, h * 0.3, px + 5, h * 0.3 + 9, 2, '#3a2618', 3 + i, a.L * 0.6); }
  const masts = o.masts || [0];
  masts.forEach((mx, i) => {
    const mh = (o.mastH || 1.1) * l * (i === 0 ? 1 : 0.8);
    a.line([[mx, 0], [mx, -mh]], 6 + i, a.L * 1.2);
    const sc = (o.sailCols || [])[i] || o.sailCol || '#f3eadb';
    a.blob([[mx + 3, -mh * 0.94], [mx + l * 0.62, -mh * 0.52], [mx + l * 0.56, -mh * 0.08], [mx + 3, -mh * 0.08]], sc, 7 + i);
    if (i === 0 && o.flag !== false) a.poly([[mx, -mh], [mx - l * 0.36, -mh * 0.92], [mx, -mh * 0.82]], o.flagCol || '#e53935', 10, a.L * 0.7);
  });
  if (o.patches) { a.rect(l * 0.22, -l * 0.58, l * 0.42, -l * 0.40, 2, '#e8506a', 8, a.L * 0.6); a.rect(-l * 0.5, h * 0.18, -l * 0.3, h * 0.42, 2, '#c99b6c', 9, a.L * 0.6); }
}
function waves(a, y, n, w, seed) { for (let i = 0; i < n; i++) a.curve([[-130 + i * w, y], [-130 + i * w + w * 0.45, y - 6], [-130 + i * w + w * 0.9, y]], seed || 5, a.L * 0.7); }
function planet(a, x, y, r, col, seed) { a.circ(x, y, r, r, col, seed || 40); if (!ST.holo) { a.g.save(); a.g.beginPath(); a.g.arc(x, y, r, 0, Math.PI * 2); a.g.clip(); a.g.fillStyle = 'rgba(0,0,0,0.12)'; a.g.beginPath(); a.g.arc(x + r * 0.45, y + r * 0.3, r, 0, Math.PI * 2); a.g.fill(); a.g.restore(); } a.circ(x, y, r, r, null, seed || 40); }

// ── 🏴‍☠️ MOOK'S DECK ──────────────────────────────────────────────────────────────────────────────────────────────
ART.frigate = a => {                                                     // EP7: the patched frigate on a blue sea
  a.layer(-1, () => a.nim('#a9d2f2'));
  a.layer(-0.4, () => { a.fillRect(-130, 38, 130, 110, rgba('#5a8fc8', 0.5)); waves(a, 48, 7, 42, 5); });
  const bob = a.alt ? -4 : 0, rock = a.alt ? -0.05 : 0.02;
  a.layer(0.3, () => a.at(-6, 10 + bob, rock, () => {
    ship(a, { len: 80, patches: true });
    if (a.alt) for (let i = 0; i < 3; i++) { a.puff(-62 - i * 12, 22 + (i % 2) * 6, 7 + i * 2, 20 + i); }      // Cannon Lob: one gun fires
  }));
  if (a.alt) a.layer(0.7, () => { a.circ(-118, -20, 6, 6, '#3a3440', 30); a.curve([[-70, 10], [-92, -14], [-112, -20]], 31, 1.2); });
  a.layer(0.8, () => waves(a, 70, 6, 50, 7));
};
ART.kickflip = a => {                                                    // EP7: a tiny pirate ship kickflips across the hologram
  a.layer(-1, () => a.nim('#f0a0c8'));
  a.layer(0.1, () => { for (let i = 0; i < 3; i++) a.line([[-96 + i * 14, 56 - i * 10], [-54 + i * 14, 24 - i * 10]], 7 + i, a.L * 0.6); });
  const ang = a.alt ? -0.55 : 0.6 + Math.sin(a.t * 3) * 0.05;
  a.layer(0.6, () => a.at(4, -8, ang, () => {
    a.poly([[-62, -6], [62, -6], [54, 8], [-54, 8]], '#8a5a3a', 2);
    for (const s of [-1, 1]) a.circ(s * 38, 15, 8, 8, '#f6efe2', 3);
    a.line([[0, -6], [0, -46]], 4); a.poly([[2, -44], [32, -24], [2, -10]], '#f3eadb', 5);
  }));
  if (a.alt) a.layer(0.9, () => { a.star(70, 46, 16, '#ffd34d', 11); a.curve([[-40, 70], [0, 76], [40, 70]], 12, 1.4); });
};
ART.tether = a => {                                                      // EP7: the impossibly long chain down to a lassoed glacier
  a.layer(-1, () => a.nim('#cfe8f6'));
  a.layer(-0.5, () => { if (!ST.holo) { a.g.fillStyle = rgba('#e07a48', 0.35); a.g.beginPath(); a.g.ellipse(0, 150, 220, 90, 0, 0, Math.PI * 2); a.g.fill(); } a.curve([[-140, 70], [-60, 62], [0, 60], [60, 62], [140, 70]], 41, 1.4); });   // the planet below
  const lift = a.alt ? -14 : 0;
  a.layer(0.2, () => {
    a.blob([[-75, 30 + lift], [-30, -10 + lift], [20, -6 + lift], [80, 34 + lift], [60, 60 + lift], [-60, 62 + lift]], '#e6f4fb', 2);   // the glacier
    if (a.alt) for (let i = 0; i < 4; i++) a.circ(-40 + i * 26, 70 + lift + (i % 2) * 6, 2.4, 3.2, '#9fd3ef', 50 + i, 1);           // Cool Down: it drips
  });
  a.layer(0.5, () => {
    for (let i = 0; i < 9; i++) a.circ((i % 2 ? 4 : -4), -96 + i * 11 + lift * (i / 9), 6, 8, null, 3 + i, a.L * 0.8);      // the chain
    a.poly([[-22, -4 + lift], [22, -4 + lift], [14, 10 + lift], [0, 4 + lift], [-14, 10 + lift]], '#6a6a78', 12);       // the anchor's flukes
  });
};
ART.broadside = a => {                                                   // BROADSIDE: every gun, one ring (behind Barbarossa)
  ship(a, { len: 80 });
  for (let i = 0; i < 3; i++) { const px = -50 + i * 42, py = 23; for (let j = 0; j < 4; j++) a.circ(px - (8 + j * 9), py + (j % 2 ? 4 : -4), 7 + j * 2, 6 + j * 2, '#f6efe2', 20 + j, a.L * 0.6, 0.1); a.circ(px - 2, py, 5, 4, '#ffb02a', 30, a.L * 0.5); }
};
ART.barbarossa = a => {                                                  // the commander: the young pirate of the cards (the hologram, flat in the deck's red)
  const R = '#e53935', R2 = '#b71c1c', SK = '#f3b9a0';
  a.layer(-1, () => a.nim('#ffb38a'));
  if (!a.alt) a.layer(-0.7, () => { a.g.save(); a.g.globalAlpha = ST.holo ? 0.5 : 0.38; a.at(58, -34, 0, () => ART.broadside(a), 0.6); a.g.restore(); });   // his big move, faint behind him
  a.layer(0.35, () => a.at(-14, 0, 0, () => {
    // legs: a boot and a peg leg (📖 the peg leg is the card's)
    a.poly([[-20, 52], [-6, 52], [-6, 86], [-26, 86], [-26, 78], [-20, 76]], R2, 60);            // boot
    a.line([[8, 52], [10, 88]], 61, 4.4); a.circ(10, 89, 3, 2, '#8a5a3a', 62, 1.2);              // peg
    a.poly([[-24, 6], [22, 6], [26, 56], [-26, 56]], R, 63);                                      // coat
    a.poly([[-26, 30], [26, 30], [26, 38], [-26, 38]], '#ffd34d', 64, 1.6);                       // sash
    a.circ(0, 34, 5, 5, '#ffd34d', 65, 1.4);
    // left arm on the hip, right arm up with the cutlass (A: Cutlass)
    a.blob([[-24, 10], [-40, 26], [-30, 38], [-22, 30]], R, 66);
    const swing = a.alt ? -0.9 : -0.35;
    a.at(22, 12, swing, () => {
      a.blob([[0, -4], [24, -8], [26, 2], [0, 6]], R, 67);
      a.circ(28, -2, 5, 5, SK, 68, 1.6);
      a.line([[30, -2], [36, -6]], 69, 2);
      a.blob([[34, -10], [66, -44], [70, -40], [40, -4]], '#e6e9ef', 70, 1.6);                     // the blade
      a.line([[30, -12], [40, 2]], 71, 2.4);                                                       // the guard
    });
    // head: wild flame hair, big round eyes, a pointed beard
    a.blob([[-30, -18], [-38, -44], [-24, -36], [-22, -62], [-8, -46], [2, -70], [10, -48], [26, -64], [24, -40], [40, -46], [30, -18]], R2, 72);   // hair
    a.circ(0, -24, 20, 20, SK, 73);
    a.blob([[-20, -18], [20, -18], [14, 4], [6, 0], [0, 12], [-6, 0], [-14, 4]], R, 74);          // beard
    for (const s of [-1, 1]) { a.circ(s * 8, -28, 7, 7, CREAM, 75 + s, 1.8); a.dot(s * 8 + 1, -28, 1.8); }   // the eyes (📖 Mook sees the resemblance)
    a.curve([[-6, -12], [0, -9], [6, -12]], 77, 1.4);
  }));
  if (a.alt) a.layer(0.8, () => { a.g.save(); a.at(56, 40, 0, () => ART.broadside(a), 0.55); a.g.restore(); });     // BROADSIDE, in front
};
const CREW_COL = { crab: '#e86a4a', shark: '#7f9bb8', walrus: '#a07858', parrot: '#4fae6a' };
function crewmate(a, who, cheer) {                                       // four of the eight crew (🎬 the crew design, 2026-10-01), flat colours
  const c = CREW_COL[who], up = cheer ? -1 : 1;
  if (who === 'crab') {
    a.blob([[-30, 0], [-22, -20], [22, -20], [30, 0], [20, 12], [-20, 12]], c, 80);
    for (const s of [-1, 1]) { a.line([[s * 10, -20], [s * 12, -34]], 81, 2); a.circ(s * 12, -38, 6, 6, CREAM, 82 + s, 1.6); a.dot(s * 12, -38, 2); }
    for (const s of [-1, 1]) { a.line([[s * 28, -4], [s * 40, -16 * up]], 84, 2.2); a.blob([[s * 36, -16 * up - 8], [s * 52, -16 * up - 12], [s * 46, -16 * up + 4]], c, 85 + s); }
    for (const s of [-1, 1]) for (let i = 0; i < 2; i++) a.line([[s * (10 + i * 10), 10], [s * (14 + i * 12), 26]], 87, 2);
    a.curve([[-8, -6], [0, -2], [8, -6]], 88, 1.4);
  } else if (who === 'shark') {
    a.blob([[-20, -40], [0, -78], [20, -40], [24, 30], [-24, 30]], c, 90);
    a.poly([[-4, -78], [0, -96], [6, -76]], c, 91, 1.8);
    for (const s of [-1, 1]) { a.circ(s * 9, -46, 5, 5, CREAM, 92 + s, 1.6); a.dot(s * 9, -46, 1.6); }
    a.poly([[-12, -30], [12, -30], [8, -24], [4, -28], [0, -24], [-4, -28], [-8, -24]], CREAM, 94, 1.4);
    a.line([[-24, -8], [-40, 10 * up]], 95, 3); a.line([[24, -8], [40, -26]], 96, 3);
    a.poly([[38, -30], [44, -70], [48, -68], [44, -28]], '#e6e9ef', 97, 1.4);                        // cutlass
    a.line([[-12, 30], [-12, 52]], 98, 3.4); a.line([[12, 30], [12, 52]], 99, 3.4);
  } else if (who === 'walrus') {
    a.blob([[-36, 30], [-34, -20], [-18, -46], [18, -46], [34, -20], [36, 30]], c, 100);
    a.rect(-26, -56, 26, -40, 6, '#3a3440', 101, 2);                                                 // cap
    for (const s of [-1, 1]) { a.circ(s * 10, -30, 4.5, 4.5, CREAM, 102 + s, 1.4); a.dot(s * 10, -30, 1.6); }
    a.blob([[-16, -20], [0, -24], [16, -20], [10, -10], [-10, -10]], '#c9a27e', 104, 1.6);
    for (const s of [-1, 1]) a.poly([[s * 6, -12], [s * 10, -12], [s * 9, 8], [s * 7, 8]], CREAM, 105 + s, 1.4);   // tusks
    a.curve([[-30, 0], [-46, 10 * up], [-40, 20]], 107, 3); a.curve([[30, 0], [46, 10 * up], [40, 20]], 108, 3);
  } else if (who === 'parrot') {
    a.blob([[-16, 34], [-20, -6], [-10, -40], [10, -40], [18, -6], [14, 34]], c, 110);
    for (let i = 0; i < 4; i++) a.line([[-6 + i * 4, -40], [-10 + i * 6, -56 - (i % 2) * 6]], 111 + i, 2);   // crest
    a.poly([[10, -28], [26, -24], [10, -18]], '#ffd34d', 115, 1.6);
    a.circ(2, -28, 4.5, 4.5, CREAM, 116, 1.4); a.dot(3, -28, 1.6);
    a.blob([[-14, -34], [-6, -32], [-6, -24], [-14, -24]], INK, 117, 1); a.line([[-16, -30], [12, -36]], 118, 1.2);   // eye patch
    a.blob([[-18, -6], [-30, 10 * up], [-20, 16]], c, 119); a.blob([[16, -6], [28, 10 * up], [18, 16]], c, 120);
    a.line([[-6, 34], [-6, 50]], 121, 2.4); a.line([[6, 34], [6, 50]], 122, 2.4);
  }
}
ART.crew = a => {
  a.layer(-1, () => a.nim('#ffd0a0'));
  a.layer(-0.3, () => { a.fillRect(-130, 54, 130, 110, rgba('#a8744f', 0.55)); for (let i = 0; i < 6; i++) a.line([[-130 + i * 48, 54], [-140 + i * 48, 110]], 130 + i, 1.2); a.line([[-130, 54], [130, 54]], 136, 1.8); });   // the deck
  const ch = a.alt;
  a.layer(0.15, () => { a.at(-34, 8, 0, () => crewmate(a, 'shark', ch), 0.82); a.at(52, 16, 0, () => crewmate(a, 'walrus', ch), 0.86); });
  a.layer(0.6, () => { a.at(-80, 40, 0, () => crewmate(a, 'crab', ch), 0.9); a.at(6, 36, 0, () => crewmate(a, 'parrot', ch), 0.78); });
};
ART.pirateship = a => {                                                  // every sail a stolen sunrise: a galleon flying at a planet
  a.layer(-1, () => a.nim('#ffc07a'));
  a.layer(-0.6, () => { if (!ST.holo) { const gr = a.g.createLinearGradient(0, -100, 0, 100); gr.addColorStop(0, rgba('#2b2350', 0.25)); gr.addColorStop(1, rgba('#2b2350', 0)); a.g.fillStyle = gr; a.g.fillRect(-130, -100, 260, 200); } for (let i = 0; i < 14; i++) a.dot(-120 + H2(i, 3) * 240, -90 + H2(i, 5) * 120, 1.2 + H2(i, 7), '#fff6d8'); });
  a.layer(-0.35, () => planet(a, 96, 54, 46, '#d9d3c4', 41));                                   // the blank planet
  const bounce = a.alt;
  a.layer(0.4, () => a.at(bounce ? -20 : -6, bounce ? -8 : 4, bounce ? -0.28 : -0.08, () => {
    ship(a, { len: 66, masts: [-22, 22], mastH: 1.25, ports: 4, sailCols: ['#ffb36b', '#ff8fa3'], flagCol: '#1c1a21' });
    if (!ST.holo) { a.g.save(); a.g.globalAlpha = 0.5; a.poly([[-18, -74], [16, -40], [-18, -14]], '#ffe27a', 140, 0); a.g.restore(); }   // the sunrise in the canvas
  }));
  if (bounce) a.layer(0.8, () => { a.star(56, 20, 18, '#ffd34d', 142); a.curve([[44, 46], [30, 60], [10, 64]], 143, 1.4); });
  else a.layer(0.8, () => { for (let i = 0; i < 3; i++) a.line([[-118, 30 + i * 12], [-84, 30 + i * 12]], 144 + i, 1.2); });
};
ART.barrage = a => {                                                     // Cross the T: three guns on the rail, one enemy ship
  a.layer(-1, () => a.nim('#ffbf8a'));
  a.layer(-0.5, () => a.at(72, -42, 0.08, () => ship(a, { len: 32, ports: 2, flagCol: '#2e7d32', sailCol: '#e8f0f6' })));      // the enemy front card
  const hit = a.alt, k = 0.55;
  if (!hit) a.layer(0.1, () => { for (let i = 0; i < 3; i++) { const sx = -52 + i * 26, sy = 22 - i * 4, ex = 70, ey = -40, px = sx + (ex - sx) * (k - i * 0.1), py = sy + (ey - sy) * (k - i * 0.1) - 24;
    a.g.save(); if (!ST.holo) a.g.setLineDash([3, 5]); a.curve([[sx, sy], [(sx + px) / 2, py - 8], [px, py]], 150 + i, 1.2); a.g.restore(); a.circ(px, py, 6, 6, '#3a3440', 153 + i); } });
  else a.layer(-0.4, () => { a.star(72, -40, 34, '#ffb02a', 175); a.star(72, -40, 18, '#fff2a8', 176); });
  a.layer(0.6, () => {
    a.poly([[-130, 46], [130, 30], [130, 110], [-130, 110]], '#8a5a3a', 160);                              // our ship's rail, close
    a.line([[-130, 58], [130, 42]], 161, 1.4);
    for (let i = 0; i < 3; i++) a.at(-64 + i * 26, 40 - i * 4, -0.55, () => {
      a.rect(-6, -26, 6, 4, 4, '#3a3440', 162 + i); a.circ(0, -26, 6.5, 3.5, '#2a2630', 165 + i, 1.4);       // a cannon, its muzzle up
      a.circ(0, 6, 9, 9, '#a8744f', 168 + i, 1.8); a.dot(0, 6, 2);                                          // its wheel
    });
    for (let i = 0; i < 3; i++) a.puff(-46 + i * 26 + (hit ? 6 : 0), 6 - i * 4 - (hit ? 8 : 0), hit ? 11 : 8, 170 + i);
  });
};
ART.cruiser = a => {                                                     // fast, loud: it can reach any lane (his draft: moves to adjacent planets)
  a.layer(-1, () => a.nim('#a9c8f2'));
  a.layer(-0.5, () => { planet(a, -92, 58, 34, '#e07a48', 42); planet(a, 98, -58, 26, '#9fd3a8', 43); a.g.save(); if (!ST.holo) a.g.setLineDash([4, 6]); a.curve([[-70, 30], [0, -10], [76, -46]], 44, 1.2); a.g.restore(); });
  const x = a.alt ? 46 : -8, y = a.alt ? -22 : 14;
  a.layer(0.5, () => a.at(x, y, -0.25, () => {
    a.poly([[-56, 0], [64, 0], [40, 14], [-46, 14]], '#4a3a52', 180);                                  // a long low hull
    a.poly([[64, 0], [82, -6], [60, 6]], '#4a3a52', 181, 1.6);                                          // the ram
    a.line([[0, 0], [0, -52]], 182, 2.8); a.poly([[2, -50], [44, -6], [2, -6]], '#e6e9ef', 183);
    a.poly([[0, -52], [-22, -46], [0, -40]], '#1c1a21', 184, 1.2); a.dot(-10, -46, 2, CREAM);
    for (let i = 0; i < 4; i++) a.line([[-64 - i * 8, 4 + i * 3], [-100 - i * 10, 4 + i * 3]], 185 + i, 1.2);   // speed
  }));
};
ART.distillery = a => {                                                  // the still never sleeps
  a.layer(-1, () => a.nim('#ffd08a'));
  a.layer(-0.4, () => { a.fillRect(-130, 64, 130, 110, rgba('#2e2a30', 0.7)); for (let i = 0; i < 18; i++) a.dot(-120 + H2(i, 9) * 240, 70 + H2(i, 4) * 24, 1, '#8a8590'); });   // black sand
  a.layer(0.2, () => {
    a.rect(-30, 44, 30, 64, 4, '#3a3440', 190);                                                       // the stove
    for (let i = 0; i < 3; i++) a.blob([[-14 + i * 12, 52], [-10 + i * 12, 34 - (a.alt ? 6 : 0)], [-6 + i * 12, 52]], i % 2 ? '#ffd34d' : '#ef6c00', 191 + i, 1.2);
    a.blob([[-44, 40], [-46, 0], [-30, -30], [30, -30], [46, 0], [44, 40]], '#c87a3a', 194);          // the copper pot
    a.curve([[-30, 0], [0, 6], [30, 0]], 195, 1.4); a.curve([[-36, 22], [0, 28], [36, 22]], 196, 1.4);
    a.rect(-10, -44, 10, -30, 3, '#c87a3a', 197);
    a.curve([[0, -44], [20, -70], [60, -62], [74, -30]], 198, 4.2);                                  // the swan neck
    for (let i = 0; i < 4; i++) a.circ(76, -22 + i * 12, 14, 5, null, 199 + i, 2);                  // the coil
    a.rect(60, 30, 100, 64, 8, '#a8744f', 205);                                                        // the barrel
    a.line([[60, 40], [100, 40]], 206, 1.4); a.line([[60, 54], [100, 54]], 207, 1.4);
  });
  a.layer(0.7, () => {
    for (let i = 0; i < 3; i++) a.puff(-20 + i * 16, -62 - i * 12 - (a.alt ? 10 : 0), 8 + i * 2, 210 + i);      // steam
    if (a.alt) a.at(-82, -30, 0, () => { a.circ(0, 0, 16, 16, '#f9c74f', 215); a.g.save(); a.g.fillStyle = ST.holo ? HOLO : INK; a.g.font = 'bold 15px ' + NUMFONT; a.g.textAlign = 'center'; a.g.textBaseline = 'middle'; a.g.fillText('+1', 0, 1); a.g.restore(); });
  });
};
function mouse(a, weapon, raise) {                                       // a religiocentric field mouse in a plum robe (Holy Order flavour)
  const PL = '#6d3f7a', GOLD = '#e0b84a', FUR = '#b9a08a';
  a.blob([[-18, 40], [-14, -4], [14, -4], [18, 40]], PL, 220);                                      // robe
  a.poly([[-18, 34], [18, 34], [18, 40], [-18, 40]], GOLD, 221, 1.4);                               // gold hem
  a.blob([[-16, -6], [-14, -30], [0, -40], [14, -30], [16, -6]], PL, 222);                         // hood
  for (const s of [-1, 1]) a.circ(s * 14, -38, 8, 8, FUR, 223 + s);                                  // ears
  a.circ(0, -18, 11, 10, FUR, 225);
  for (const s of [-1, 1]) a.dot(s * 4.5, -20, 1.8);
  a.circ(0, -11, 2.4, 2, '#f2a7b9', 226, 1);
  for (const s of [-1, 1]) a.line([[s * 3, -12], [s * 14, -14 + s]], 227, 0.8);
  const r = raise ? -0.6 : 0;
  a.at(14, 8, r, () => {
    a.line([[0, 0], [12, -6]], 228, 3);
    if (weapon === 'scythe') { a.line([[12, 30], [12, -44]], 229, 2.4); a.blob([[12, -44], [-14, -50], [-26, -38], [-6, -42]], '#e6e9ef', 230, 1.6); }
    else { a.line([[10, -2], [14, 6]], 231, 3); a.poly([[12, -4], [40, -34], [44, -30], [16, 2]], '#e6e9ef', 232, 1.6); }
  });
}
ART.marvin = a => {
  a.layer(-1, () => a.nim('#d8c0ef'));
  a.layer(-0.5, () => { const hx = (x, y, r, s) => { const P = []; for (let i = 0; i < 6; i++) P.push([x + Math.cos(i * Math.PI / 3) * r, y + Math.sin(i * Math.PI / 3) * r]); a.poly(P, rgba('#e0b84a', ST.holo ? 0.1 : 0.55), s, 1.4); };
    hx(0, -54, 22, 240); });                                                                         // a gold hexagon of the Holy Order, behind
  a.layer(0.2, () => { a.at(-62, 22, 0, () => mouse(a, 'machete', a.alt), 0.95); a.at(62, 22, 0, () => mouse(a, 'scythe', a.alt), 0.95); });
  a.layer(0.6, () => a.at(0, 40, 0, () => mouse(a, 'scythe', a.alt), 1.15));
};

// @@ART-BEGIN · the rest of the library's pictures, spliced in from art/*.js by build-renderer.js (do not edit between the markers)
// ── art/bronc-tort.js
// ⬡ THE HOLY ORDER (Bronconius) and 🐢 TORTIMER · drawn 2026-11-23 (group bronc-tort). Helpers start bt.
const BT_PLUM = '#6d3f7a', BT_GOLD = '#e0b84a', BT_SKIN = '#a8b48c', BT_SHELL = '#b5835a', BT_PLAST = '#ecd9a6';
function btHex(a, x, y, r, fill, seed, lw) { const P = []; for (let i = 0; i < 6; i++) P.push([x + Math.cos(i * Math.PI / 3) * r, y + Math.sin(i * Math.PI / 3) * r]); a.poly(P, fill, seed, lw); }
// the Sigil: a centre and four round it, top and bottom left open (bible). fuse = 0..1 pulls them together
function btSigil(a, x, y, r, fuse, seed) {
  const d = r * 1.78 * (1 - 0.18 * fuse), dirs = [-30, 30, 150, 210];
  for (const deg of dirs) { const an = deg * Math.PI / 180; btHex(a, x + Math.cos(an) * d, y + Math.sin(an) * d, r, BT_GOLD, seed + deg, a.L * 0.8); }
  btHex(a, x, y, r, '#f3cf62', seed, a.L * 0.8);
}
// a flying cathedral of white light: a hull with gothic spires (bible: "Flying cathedrals of white light")
function btCathedral(a, s) {
  a.poly([[-60, 0], [60, 0], [44, 18], [-44, 18]], '#e9e6f2', 300);
  for (let i = 0; i < 5; i++) { const x = -40 + i * 20, h = i === 2 ? 62 : (i % 2 ? 40 : 30);
    a.poly([[x - 7, 0], [x - 7, -h * 0.6], [x, -h], [x + 7, -h * 0.6], [x + 7, 0]], '#f6f3fb', 301 + i, a.L * 0.8);
    a.blob([[x - 3, -h * 0.2], [x - 3, -h * 0.42], [x, -h * 0.5], [x + 3, -h * 0.42], [x + 3, -h * 0.2]], '#bfe6f6', 306 + i, a.L * 0.5); }
  a.dot(0, -66, 2.2, BT_GOLD);
}
// a planet wearing its rings (the table's seven rings, as thin ellipses)
function btRinged(a, x, y, r, col, lit, seed) {
  const ring = (k, from, to) => { const P = []; for (let i = 0; i <= 16; i++) { const an = from + (to - from) * i / 16; P.push([x + Math.cos(an) * r * (1.75 - k * 0.18), y + Math.sin(an) * r * (0.34 - k * 0.04)]); } return P; };
  for (let k = 0; k < 3; k++) a.curve(ring(k, Math.PI, Math.PI * 2), seed + k, 1.4);             // the back of the rings
  planet(a, x, y, r, col, seed + 5);
  for (let k = 0; k < 3; k++) a.curve(ring(k, 0, Math.PI), seed + 8 + k, 1.6);                     // the front
}

// ── ⬡ the Holy Order
ART.doria = a => {                                                       // the commander: cavalier hat, silver hair, sleepy eyes (EP3 scene 7), flat in the Order's plum
  a.layer(-1, () => a.nim('#d9c8f0'));
  const fleet = () => { for (let i = 0; i < 3; i++) a.at(-20 + i * 46, -40 + i * 14, 0, () => btCathedral(a), 0.38); };   // HOLY LEAGUE: the fleet, all guns up
  if (!a.alt) a.layer(-0.7, () => { a.g.save(); a.g.globalAlpha = ST.holo ? 0.5 : 0.38; fleet(); a.g.restore(); });
  a.layer(0.35, () => a.at(-24, 6, 0, () => {
    a.blob([[-30, 90], [-30, 30], [-20, 14], [20, 14], [30, 30], [30, 90]], BT_PLUM, 310);            // coat
    a.line([[0, 18], [0, 90]], 311, 1.6); for (let i = 0; i < 3; i++) a.circ(4, 30 + i * 16, 2.4, 2.4, BT_GOLD, 312 + i, 1);
    a.curve([[-28, 30], [-42, 56], [-32, 80]], 315, 7); a.circ(-32, 82, 6, 6, '#e8dcc8', 316, 1.4);   // left arm, down
    const up = a.alt ? -1.2 : -0.5;
    a.at(26, 26, up, () => { a.line([[0, 0], [30, 0]], 317, 7); a.circ(34, 0, 7, 7, '#e8dcc8', 318, 1.6);
      if (a.alt) { a.line([[36, -2], [84, -4]], 319, 2); a.line([[38, -10], [38, 8]], 320, 2.4); } });   // a rapier, raised for the League
    a.blob([[-26, -6], [-30, 18], [-24, 26], [-14, 14]], '#dfe3ea', 321);                              // silver hair, left
    a.blob([[26, -6], [30, 18], [24, 26], [14, 14]], '#dfe3ea', 322);
    a.circ(0, -4, 24, 24, '#e8dcc8', 323);                                                              // the face
    for (const s of [-1, 1]) { a.circ(s * 9, -6, 6.5, 5, CREAM, 324 + s, 1.6); a.dot(s * 9 + 2, -5, 1.8); a.line([[s * 9 - 7, -9], [s * 9 + 7, -9]], 326 + s, 2.2); }   // heavy lids
    a.blob([[-6, 8], [6, 8], [0, 13]], '#3c1925', 328, 1.4);                                            // the smirk
    a.blob([[-52, -24], [-30, -38], [0, -42], [30, -38], [54, -24], [24, -20], [-24, -20]], BT_PLUM, 329);   // the brim
    a.blob([[-22, -26], [-18, -50], [0, -58], [18, -50], [22, -26]], BT_PLUM, 330);                     // the crown
    a.blob([[10, -52], [26, -86], [40, -96], [34, -76], [20, -50]], '#f3eadb', 331, 1.6);               // the feather
    a.line([[14, -54], [36, -90]], 332, 1);
  }));
  if (a.alt) a.layer(0.8, () => { a.g.save(); fleet(); a.g.restore(); });
};
ART.fleet = a => {                                                       // Doria's drop craft: flying cathedrals, hard to break, slow to hit
  a.layer(-1, () => a.nim('#dfe8ff'));
  a.layer(-0.6, () => { for (let i = 0; i < 16; i++) a.dot(-120 + H2(i, 31) * 240, -90 + H2(i, 32) * 180, 1 + H2(i, 33), '#fff6d8'); });
  a.layer(-0.3, () => a.at(-74, -44, 0, () => btCathedral(a), 0.6));
  a.layer(0.1, () => a.at(74, -30, 0, () => btCathedral(a), 0.7));
  a.layer(0.5, () => a.at(-4, 40, 0, () => {
    btCathedral(a);
    if (a.alt) for (let i = 0; i < 5; i++) { const x = -40 + i * 20; a.g.save(); if (!ST.holo) { a.g.globalAlpha = 0.6; } a.poly([[x - 3, 18], [x + 3, 18], [x + 9 - i * 4, 80], [x - 9 - i * 4, 80]], '#fff4c4', 340 + i, 1); a.g.restore(); }   // every spire a gun
  }, 1.3));
};
ART.pius = a => {                                                        // the Pope: a tall mitre, plum and gold, the Sigil behind (his card face: the gold Sigil and V)
  a.layer(-1, () => a.nim('#f0d9a8'));
  a.layer(-0.6, () => { a.g.save(); a.g.globalAlpha = ST.holo ? 0.6 : 0.7; btSigil(a, 0, -30, 18, 0, 350); a.g.restore(); });
  if (a.alt) a.layer(-0.2, () => { a.g.save(); if (!ST.holo) a.g.globalAlpha = 0.75; a.poly([[54, -110], [86, -110], [96, 100], [44, 100]], '#fff2a8', 360, 1.2); a.g.restore(); a.star(70, 70, 22, '#ffb02a', 361); });   // PAPAL SMITE: the beam
  a.layer(0.4, () => a.at(-14, 4, 0, () => {
    a.blob([[-34, 92], [-26, 20], [-12, 6], [12, 6], [26, 20], [34, 92]], '#f4f1ea', 362);             // white robe
    a.poly([[-10, 8], [10, 8], [10, 92], [-10, 92]], BT_PLUM, 363, 1.6);                                // the plum stole
    for (let i = 0; i < 3; i++) btHex(a, 0, 30 + i * 22, 5, BT_GOLD, 364 + i, 1);
    a.at(30, 30, a.alt ? -0.7 : 0, () => { a.line([[0, 0], [18, -6]], 368, 6); a.circ(20, -6, 5, 5, '#f2d6be', 369, 1.4);
      a.line([[22, 30], [22, -64]], 370, 2.6); a.line([[12, -52], [32, -52]], 371, 2.6); a.line([[14, -40], [30, -40]], 372, 2.2); });   // the papal cross
    a.circ(0, -10, 18, 18, '#f2d6be', 373);
    for (const s of [-1, 1]) { a.circ(s * 7, -12, 4.5, 4.5, CREAM, 374 + s, 1.4); a.dot(s * 7, -12, 1.6); a.line([[s * 2, -20], [s * 12, -18 + (a.alt ? -2 : 2)]], 376 + s, 2.2); }   // stern brows
    a.curve([[-6, 0], [0, -2], [6, 0]], 378, 1.4);
    a.poly([[-16, -24], [-14, -62], [0, -78], [14, -62], [16, -24]], '#f4f1ea', 379);                  // the mitre
    a.line([[0, -76], [0, -26]], 380, 4); a.line([[-15, -38], [15, -38]], 381, 3);
    a.poly([[-2, -76], [2, -76], [2, -26], [-2, -26]], BT_GOLD, 382, 0.8);
  }));
};
ART.pfrigate = a => {                                                    // Pius V's frigate: five spires and a gold hexagon, monks in plum velvet on deck
  a.layer(-1, () => a.nim('#e6d4f2'));
  a.layer(-0.5, () => { for (let i = 0; i < 12; i++) a.dot(-120 + H2(i, 41) * 240, -90 + H2(i, 42) * 100, 1.2, '#fff6d8'); });
  a.layer(0.35, () => a.at(0, 24, a.alt ? -0.06 : 0, () => {
    a.poly([[-90, 0], [92, 0], [70, 30], [-72, 30]], '#8a5a8f', 390);
    for (let i = 0; i < 5; i++) { const x = -60 + i * 30, h = i === 2 ? 74 : 50; a.poly([[x - 6, 0], [x - 6, -h * 0.7], [x, -h], [x + 6, -h * 0.7], [x + 6, 0]], '#ece6f4', 391 + i, a.L * 0.8); }
    btHex(a, 0, -92, 12, BT_GOLD, 396);
    for (let i = 0; i < 3; i++) { const x = -40 + i * 40; a.at(x, -2, 0, () => {                       // monks
      a.blob([[-8, 0], [-6, -20], [0, -26], [6, -20], [8, 0]], BT_PLUM, 397 + i, 1.6); a.circ(0, -18, 4, 4, '#f2d6be', 400 + i, 1); a.dot(-6, -2, 1.6, BT_GOLD); a.dot(6, -2, 1.6, BT_GOLD);
      if (a.alt) a.line([[6, -14], [12, -26]], 403 + i, 1.6); }); }
    for (let i = 0; i < 4; i++) a.rect(-60 + i * 38, 10, -52 + i * 38, 18, 2, '#3a2618', 410 + i, 1);
    if (a.alt) for (let i = 0; i < 3; i++) a.puff(96 + i * 10, 14 - i * 6, 7 + i * 2, 420 + i, '#f6e9c4');
  }));
};
ART.firstmate = a => {                                                   // a scallywag in a striped shirt and a blood-red bandana
  a.layer(-1, () => a.nim('#ffd0b0'));
  a.layer(-0.3, () => { a.fillRect(-130, 70, 130, 110, rgba('#a8744f', 0.55)); a.line([[-130, 70], [130, 70]], 430, 1.8); });
  if (a.alt) a.layer(0.8, () => { a.blob([[30, -86], [110, -86], [112, -52], [64, -52], [50, -40], [52, -52], [30, -52]], CREAM, 431, 1.8);
    uText(a.g, 'ARRRR?', 71, -62, 15, { align: 'center', t: a.t, seed: 9 }); });
  a.layer(0.4, () => a.at(-16, 0, 0, () => {
    a.line([[-10, 40], [-12, 76]], 432, 5); a.line([[10, 40], [12, 76]], 433, 5);
    a.blob([[-24, 44], [-22, -6], [22, -6], [24, 44]], CREAM, 434);
    if (!ST.holo) { a.g.save(); a.g.beginPath(); a.g.rect(-24, -6, 48, 50); a.g.clip(); for (let i = 0; i < 6; i++) { a.g.fillStyle = '#c62f3c'; a.g.fillRect(-26, -2 + i * 9, 52, 4); } a.g.restore(); }
    a.blob([[-24, 44], [-22, -6], [22, -6], [24, 44]], null, 434);
    a.at(22, 2, a.alt ? -1.4 : -0.2, () => { a.line([[0, 0], [24, 4]], 435, 5); a.circ(27, 4, 5, 5, '#e9c09a', 436, 1.4); });   // a salute, ARRr
    a.line([[-22, 2], [-34, 30]], 437, 5);
    a.circ(0, -24, 17, 17, '#e9c09a', 438);
    for (const s of [-1, 1]) { a.circ(s * 7, -24, 5, 5, CREAM, 439 + s, 1.4); a.dot(s * 7, -24, 1.6); }
    a.blob([[-6, -12], [6, -12], [3, -8], [-3, -8]], '#3c1925', 441, 1.2);
    a.blob([[-19, -30], [-14, -42], [14, -42], [19, -30]], '#b3121f', 442);                              // blood-red bandana
    a.poly([[17, -34], [30, -28], [24, -22]], '#b3121f', 443, 1.6);
    for (let i = 0; i < 3; i++) a.dot(-8 + i * 8, -36, 1.6, CREAM);
  }, 1.3));
};
ART.pollen = a => {                                                      // The Yellow: rifts open, a stinging fog smothers a planet
  a.layer(-1, () => a.nim('#f2e27a'));
  a.layer(-0.6, () => { for (let i = 0; i < 3; i++) a.poly([[-100 + i * 70, -80 + i * 10], [-90 + i * 70, -60 + i * 10], [-104 + i * 70, -40 + i * 10], [-92 + i * 70, -20 + i * 10]].concat([[-88 + i * 70, -22 + i * 10], [-98 + i * 70, -40 + i * 10], [-84 + i * 70, -60 + i * 10], [-94 + i * 70, -80 + i * 10]]), '#1c1a21', 450 + i, 1.2); });   // rifts in spacetime
  a.layer(-0.1, () => planet(a, 10, 30, 52, a.alt ? '#d8c24a' : '#7fb3d9', 455));
  a.layer(0.5, () => { const n = a.alt ? 12 : 7; for (let i = 0; i < n; i++) { const an = i / n * Math.PI * 2 + 0.3, r = a.alt ? 40 : 66; a.puff(10 + Math.cos(an) * r, 30 + Math.sin(an) * r * 0.8, 14 + H2(i, 4) * 8, 460 + i, '#ecd85a'); }
    if (!a.alt) for (let i = 0; i < 4; i++) a.curve([[-90 + i * 18, -40 + i * 6], [-60 + i * 20, -10 + i * 4], [-20 + i * 10, 10]], 480 + i, 1.2); });
};
ART.tithe = a => {                                                       // the collection plate: Doria's church income
  a.layer(-1, () => a.nim('#f2dfa0'));
  a.layer(-0.4, () => { a.g.save(); a.g.globalAlpha = ST.holo ? 0.5 : 0.45; btSigil(a, 0, -40, 13, 0, 490); a.g.restore(); });
  a.layer(0.3, () => {
    a.blob([[-80, 30], [-60, 56], [60, 56], [80, 30]], '#b07a3a', 495); a.circ(0, 30, 80, 14, '#d9a25a', 496);     // the plate
    a.circ(0, 30, 56, 8, '#8a5a2a', 497, 1.4);
    const n = a.alt ? 9 : 5; for (let i = 0; i < n; i++) a.circ(-30 + (i % 5) * 15, 26 - Math.floor(i / 5) * 8, 8, 4.5, BT_GOLD, 500 + i, 1.4);
  });
  a.layer(0.7, () => { const fall = a.alt ? 1 : 0; for (let i = 0; i < 3; i++) a.circ(-40 + i * 40, -10 - i * 14 + fall * 20, 9, 9, BT_GOLD, 510 + i, 1.6);
    a.at(80, -40, 0, () => { a.circ(0, 0, 18, 18, '#f9c74f', 515); a.g.save(); a.g.fillStyle = ST.holo ? HOLO : INK; a.g.font = 'bold 16px ' + NUMFONT; a.g.textAlign = 'center'; a.g.textBaseline = 'middle'; a.g.fillText('+3', 0, 1); a.g.restore(); }); });
};
ART.gold = a => {                                                        // Smugglers Gold: a chest nobody asks about
  a.layer(-1, () => a.nim(a.alt ? '#ffe08a' : '#c8b89a'));
  a.layer(-0.3, () => { a.fillRect(-130, 56, 130, 110, rgba('#2e2a30', 0.6)); });
  a.layer(0.3, () => {
    a.rect(-60, 4, 60, 58, 6, '#7a4a2a', 520); a.line([[-60, 24], [60, 24]], 521, 2); a.rect(-8, 16, 8, 34, 2, BT_GOLD, 522, 1.6);
    if (a.alt) { a.blob([[-60, 4], [-56, -40], [56, -40], [60, 4]], '#7a4a2a', 523);                    // the lid, open: it shines
      for (let i = 0; i < 5; i++) a.poly([[-40 + i * 18, 4], [-28 + i * 18, 4], [-24 + i * 18, -8], [-36 + i * 18, -8]], BT_GOLD, 524 + i, 1.4);
      a.star(30, -20, 12, '#fff2a8', 530); a.star(-34, -26, 9, '#fff2a8', 531); }
    else a.blob([[-62, 6], [-58, -18], [0, -28], [58, -18], [62, 6]], '#7a4a2a', 523);
  });
  a.layer(0.7, () => a.at(78, -20, 0, () => {                                                         // a hooded hand slides in from the edge
    a.blob([[60, -40], [10, -16], [-6, 6], [10, 14], [60, 10]], '#3a3440', 535); a.circ(-6, 8, 8, 6, '#c9a27e', 536, 1.4);
    if (a.alt) a.rect(-20, 10, 4, 18, 2, BT_GOLD, 537, 1.2);
  }));
};
ART.sigil = a => {                                                       // five golden hexagons fuse and vibrate, calling the swarm
  a.layer(-1, () => a.nim(a.alt ? '#f2e27a' : '#e8d8b0'));
  a.layer(-0.5, () => { if (a.alt) for (let i = 0; i < 12; i++) { const an = i / 12 * Math.PI * 2; a.line([[Math.cos(an) * 60, Math.sin(an) * 50], [Math.cos(an) * 110, Math.sin(an) * 92]], 540 + i, 1.2); } });
  a.layer(0.4, () => { const j = a.alt ? Math.sin(a.t * 40) * 1.5 : 0; a.at(j, 0, 0, () => btSigil(a, 0, 4, 22, a.alt ? 1 : 0, 560)); });
  if (a.alt) a.layer(0.8, () => { for (let i = 0; i < 4; i++) a.puff(-90 + i * 60, 76 - (i % 2) * 8, 12, 570 + i, '#ecd85a'); });
};

// ── 🐢 Tortimer
ART.librarycard = a => {                                                 // the commander that does nothing: DWARF PUBLIC LIBRARY, stamped OVERDUE
  a.layer(-1, () => a.nim('#d6e3c8'));
  a.layer(-0.6, () => { a.g.save(); a.g.globalAlpha = ST.holo ? 0.4 : 0.3; btTortoise(a, 84, 40, 0.42, false); a.g.restore(); });   // Tortimer, dozing, behind
  a.layer(0.3, () => a.at(-8, 0, -0.06, () => {
    a.rect(-70, -78, 70, 80, 4, '#f6efd9', 580);
    a.rect(-70, -78, 70, -52, 4, '#d9c48a', 581, 1.8);
    uText(a.g, 'DWARF PUBLIC', 0, -68, 9, { align: 'center', t: a.t, seed: 11, whim: 0.6 }); uText(a.g, 'LIBRARY', 0, -56, 9, { align: 'center', t: a.t, seed: 12, whim: 0.6 });
    for (let i = 0; i < 6; i++) { const y = -40 + i * 18; a.line([[-62, y], [62, y]], 582 + i, 0.9); a.line([[-10, y - 16], [-10, y]], 590 + i, 0.7); }
    a.g.save(); a.g.fillStyle = ST.holo ? HOLO : '#4a5a8a'; a.g.font = '8px ' + NUMFONT; a.g.textAlign = 'left';
    ['12 MAR', '03 APR', '19 MAY', '30 JUN'].forEach((d, i) => a.g.fillText(d, -58, -28 + i * 18)); a.g.restore();
  }));
  a.layer(0.8, () => a.at(-8, 34, -0.22, () => {                                                       // OVERDUE, stamped across it
    a.g.save(); if (!ST.holo) { a.g.globalAlpha = 0.9; a.g.strokeStyle = '#d7263d'; a.g.lineWidth = 3; a.g.strokeRect(-56, -16, 112, 30); }
    uText(a.g, 'OVERDUE', 0, 7, 16, { align: 'center', col: '#d7263d', t: a.t, seed: 13, whim: 0.5 }); a.g.restore();
  }));
  a.layer(0.9, () => a.at(a.alt ? -8 : 56, a.alt ? 6 : -56, a.alt ? -0.22 : 0.3, () => {               // the stamp: up in the air, or slammed down
    a.rect(-24, -4, 24, 8, 2, '#d7263d', 605); a.rect(-6, -34, 6, -4, 2, '#8a5a3a', 606); a.circ(0, -40, 12, 8, '#8a5a3a', 607);
    if (a.alt) { a.star(-40, -10, 10, '#ffd34d', 608); a.star(42, 6, 8, '#ffd34d', 609); }
  }));
};
function btTortoise(a, x, y, s, open) {                                  // Tortimer's people: a saddle-backed tortoise, monocle optional (his design sheet, EP4)
  a.at(x, y, 0, () => {
    a.line([[-14, 40], [-14, 62]], 610, 7); a.line([[14, 40], [14, 62]], 611, 7);
    a.blob([[-40, 46], [-46, 0], [-34, -40], [0, -56], [34, -40], [46, 0], [40, 46]], BT_SHELL, 612);          // carapace
    for (let i = 0; i < 3; i++) a.curve([[-40 + i * 4, -20 + i * 22], [0, -26 + i * 22], [40 - i * 4, -20 + i * 22]], 613 + i, 1.2);
    a.blob([[-26, 44], [-30, 0], [-20, -24], [20, -24], [30, 0], [26, 44]], BT_PLAST, 617);                    // plastron
    for (let i = 0; i < 4; i++) a.line([[-26, -10 + i * 13], [26, -10 + i * 13]], 618 + i, 1.1);
    if (open !== false) { a.blob([[-8, -24], [-10, -50], [8, -50], [8, -24]], BT_SKIN, 623);                   // the neck and head
      a.circ(0, -58, 15, 13, BT_SKIN, 624); a.circ(6, -60, 6, 6, CREAM, 625, 1.4); a.dot(7, -60, 1.6); a.circ(6, -60, 7.5, 7.5, null, 626, 1.6); a.dot(-6, -60, 1.6); }
  }, s);
}
ART.shell = a => {                                                       // four shells in four slots; ships bounce off. Then they turn and attack, slowly, very politely
  a.layer(-1, () => a.nim('#cfe3c0'));
  a.layer(-0.4, () => { if (!a.alt) a.at(-74, -54, 0.5, () => { ship(a, { len: 26, ports: 2 }); }); });
  a.layer(0.3, () => {
    a.blob([[-70, 50], [-66, 0], [-40, -36], [0, -50], [40, -36], [66, 0], [70, 50]], BT_SHELL, 630);
    for (let i = 0; i < 5; i++) btHex(a, -40 + i * 20, 0 + (i % 2) * 14, 11, '#c9976a', 631 + i, 1.4);
    a.line([[-70, 50], [70, 50]], 637, 2.4);
    if (a.alt) { a.at(66, 30, 0, () => { a.blob([[0, 0], [24, -6], [30, 4], [6, 12]], BT_SKIN, 638); a.circ(36, -6, 13, 11, BT_SKIN, 639);
      a.circ(40, -8, 5, 5, CREAM, 640, 1.2); a.dot(41, -8, 1.4); a.circ(40, -8, 6.5, 6.5, null, 641, 1.4); a.curve([[30, 0], [36, 2], [42, -1]], 642, 1.2);
      a.blob([[30, -18], [34, -30], [46, -30], [48, -18]], '#3a3440', 643, 1.4); }); }               // a polite hat
  });
  if (!a.alt) a.layer(0.8, () => { a.star(-36, -40, 14, '#ffd34d', 645); a.curve([[-50, -46], [-62, -52], [-70, -50]], 646, 1.2); });
};
ART.tortunit = a => {                                                    // (no name yet): a tortoise reading, a stack of books for a wall
  a.layer(-1, () => a.nim('#dfe6c8'));
  a.layer(-0.3, () => { for (let i = 0; i < 5; i++) a.rect(-112, 70 - i * 14, -56, 82 - i * 14, 2, ['#4a6fb3', '#c0504d', '#6a8f4e', '#d9a25a', '#7a5a9a'][i], 650 + i, 1.6); });
  a.layer(0.4, () => { btTortoise(a, 10, 14, 1.05);
    a.at(12, a.alt ? -20 : 8, a.alt ? -0.5 : 0, () => { a.rect(-20, -12, 20, 12, 2, '#4a6fb3', 660, 1.8); a.line([[0, -12], [0, 12]], 661, 1.4); });   // the blue book, or a book bash
  });
  if (a.alt) a.layer(0.8, () => a.star(64, -40, 14, '#ffd34d', 662));
};
ART.tortB = a => {                                                       // (no name yet): a young one, monocle too big for him
  a.layer(-1, () => a.nim('#e4efc8'));
  a.layer(-0.3, () => { a.fillRect(-130, 66, 130, 110, rgba('#7bbf8a', 0.5)); for (let i = 0; i < 6; i++) a.line([[-110 + i * 44, 66], [-106 + i * 44, 58]], 670 + i, 1); });
  a.layer(0.4, () => a.at(a.alt ? 6 : 0, 0, 0, () => {
    a.blob([[-46, 50], [-50, 14], [-30, -14], [0, -22], [30, -14], [50, 14], [46, 50]], BT_SHELL, 680);
    for (let i = 0; i < 3; i++) btHex(a, -24 + i * 24, 16, 10, '#c9976a', 681 + i, 1.2);
    for (const s of [-1, 1]) a.line([[s * 30, 50], [s * 34, 66]], 684 + s, 7);
    if (a.alt) { a.circ(0, 40, 4, 4, null, 686, 1); }                                                  // tucked in
    else { a.circ(58, 20, 16, 14, BT_SKIN, 687); a.blob([[42, 26], [50, 34], [40, 36]], BT_SKIN, 688);
      a.circ(62, 16, 7, 7, CREAM, 689, 1.4); a.dot(63, 16, 1.8); a.circ(62, 16, 10, 10, null, 690, 1.8); a.curve([[62, 26], [66, 34], [64, 50]], 691, 0.8); a.curve([[52, 26], [58, 28], [66, 26]], 692, 1.2); }
  }));
  if (a.alt) a.layer(0.8, () => { uText(a.g, 'SLOW', -60, -50, 12, { t: a.t, seed: 14 }); uText(a.g, 'AND STEADY', 10, -34, 12, { t: a.t, seed: 15 }); });
};
ART.brumation = a => {                                                   // snow over the hologram: whatever hit him freezes
  a.layer(-1, () => a.nim('#e0f0fa'));
  a.layer(-0.4, () => btRinged(a, -50, 30, 34, '#9fbfa0', true, 700));
  a.layer(0.3, () => a.at(60, -30, 0.3, () => { ship(a, { len: 30, ports: 2 });
    if (a.alt) { a.g.save(); if (!ST.holo) a.g.globalAlpha = 0.6; a.rect(-46, -42, 46, 26, 6, '#cfefff', 720, 2); a.g.restore(); a.line([[-30, -30], [-10, -36]], 721, 1.2); a.line([[20, 10], [34, 4]], 722, 1.2); } }));
  a.layer(0.7, () => { const n = a.alt ? 26 : 16; for (let i = 0; i < n; i++) { const x = -120 + H2(i, 71) * 240, y = -90 + ((H2(i, 72) * 180 + a.t * 20) % 180);
    a.at(x, y, H2(i, 73), () => { for (let k = 0; k < 3; k++) a.line([[-4 * Math.cos(k * 1.05), -4 * Math.sin(k * 1.05)], [4 * Math.cos(k * 1.05), 4 * Math.sin(k * 1.05)]], 730 + i, 1); }); } });
};
ART.spring = a => {                                                      // his dark rings light back up, with little flowers
  a.layer(-1, () => a.nim('#f2dcef'));
  a.layer(-0.2, () => btRinged(a, 0, 6, 52, '#8fbf7a', true, 760));
  a.layer(0.6, () => { const n = a.alt ? 7 : 3; for (let i = 0; i < n; i++) { const an = Math.PI * (0.08 + 0.84 * i / Math.max(1, n - 1)), x = Math.cos(an) * 86, y = 6 + Math.sin(an) * 17;
    a.line([[x, y], [x, y - 12]], 770 + i, 1.4);
    for (let p = 0; p < 5; p++) { const pa = p / 5 * Math.PI * 2; a.circ(x + Math.cos(pa) * 6, y - 16 + Math.sin(pa) * 6, 5, 5, ['#f2a7b9', '#ffd34d', '#ffffff'][i % 3], 780 + i * 5 + p, 1); }
    a.circ(x, y - 16, 3.5, 3.5, '#ef6c00', 820 + i, 1); } });
};

// ── art/finley-fhat.js
// art/finley-fhat.js · Joanna Arch's auditors (Finley), the Fhat's cards, and the two traps/actions in every deck.
//   Spliced into halo-cards.js by build-renderer.js. Every helper here starts ff.
//   Ported from EP7 (mm_cards7.js c7CardArt): 'pencils' (Pocket Protectors), 'takeover' (Hostile Takeover), 'audit' (AUDIT, behind Arch).

// ── pieces
function ffAudit(a, big) {                                                 // AUDIT (EP7): the clipboard and the stamp coming down
  a.rect(-70, -70, 20, 60, 6, '#f6efe2', 2);                                // the clipboard
  a.rect(-42, -80, -8, -64, 3, '#b98e62', 3);
  for (let r = 0; r < 6; r++) a.line([[-58, -46 + r * 16], [6, -46 + r * 16]], 4 + r, a.L * 0.5);
  const drop = big ? 14 : 0;
  a.at(40, 10 + drop, -0.25, () => {
    a.rect(-26, -6, 26, 10, 2, '#e8506a', 6); a.rect(-8, -40, 8, -6, 2, '#8a5a3a', 7); a.circ(0, -46, 14, 10, '#8a5a3a', 8);
  });
  a.g.save(); a.g.globalAlpha = ST.holo ? 1 : 0.85; a.at(-25, 30, -0.2, () => {
    a.g.strokeStyle = ST.holo ? HOLO : '#e8506a'; a.g.lineWidth = 3; a.g.strokeRect(-36, -12, 72, 24);
    uText(a.g, 'AUDITED', 0, 6, 12, { align: 'center', col: '#e8506a', t: a.t, seed: 9, whim: 0.6 });
  }); a.g.restore();
}
function ffPencil(a, flame) {                                              // one Pocket Protector (EP7): yellow pencil, pink eraser on fire
  a.rect(-8, -36, 8, 30, 2, '#f2c230', 3); a.poly([[-8, 30], [8, 30], [0, 46]], '#f3d6b0', 8); a.dot(0, 43, 2.5);
  a.rect(-8, -46, 8, -36, 2, '#f0a0c8', 12);
  const f = flame || 1;
  for (let j = 0; j < 3; j++) a.circ((j - 1) * 6, -54 - j * 6 * f, 5 * f, 8 * f, j % 2 ? '#ffb02a' : '#e8506a', 16 + j, a.L * 0.5, 0.2);
}
function ffTower(a, x, base, w, h, col, seed, dark) {                    // a brutalist tower with its windows
  a.rect(x, base - h, x + w, base, 1, col || '#8a8f99', seed);
  for (let r = 0; r * 13 + 10 < h - 4; r++) for (let c = 0; c * 12 + 9 < w; c++) a.dot(x + 9 + c * 12, base - h + 10 + r * 13, 2.2, dark && (r + c) % 2 ? '#3a3440' : '#f6efe2');
}
function ffClerk(a, up) {                                                  // an auditor: crisp shirt, tie, grey slacks, a calculator
  const SK = '#f0c8a8';
  a.line([[-6, 26], [-7, 50]], 300, 3.6); a.line([[6, 26], [7, 50]], 301, 3.6);              // grey slacks
  a.poly([[-12, 26], [12, 26], [10, 50], [-10, 50]], '#8f939c', 302, a.L * 0.8);
  a.poly([[-13, -6], [13, -6], [12, 28], [-12, 28]], '#fdfcf5', 303);                        // the shirt
  a.poly([[-2, -6], [2, -6], [3, 14], [0, 18], [-3, 14]], '#c0392b', 304, 1.2);              // the tie
  a.circ(0, -18, 11, 12, SK, 305);
  a.line([[-8, -28], [8, -28]], 306, 2.4);                                                   // a neat side parting
  for (const s of [-1, 1]) a.dot(s * 4, -19, 1.6);
  a.line([[-3, -12], [3, -12]], 307, 1.2);
  a.at(16, up ? -14 : 6, up ? -0.4 : 0, () => { a.rect(-7, -10, 7, 8, 2, '#3a3440', 308, 1.6); a.rect(-5, -8, 5, -3, 1, '#9fd3a8', 309, 0.8); for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) a.dot(-2.5 + i * 5, 0 + j * 4, 1, '#f6efe2'); });
  a.line([[12, 0], [16, up ? -12 : 6]], 310, 2.2); a.line([[-12, 0], [-16, 16]], 311, 2.2);
}
function ffHat(a, bounce) {                                                // the Fhat's way of standing: a round red | blue body, big lips, yellow tuft and feet
  const R = '#d9506a', B = '#5b8be0', Y = '#f2d53c', sq = bounce ? 0.92 : 1;
  for (const s of [-1, 1]) { a.line([[s * 10, 26], [s * 12, 40]], 320 + s, 3.4); a.blob([[s * 12 - 7, 40], [s * 12 + 7, 40], [s * 12 + 5, 45], [s * 12 - 7, 45]], Y, 322 + s, 1.6); }
  a.g.save(); a.g.scale(1 / sq, sq);
  a.circ(0, 0, 28, 28, R, 325);
  if (!ST.holo) { a.g.save(); a.g.beginPath(); a.g.rect(0, -40, 40, 80); a.g.clip(); a.circ(0, 0, 28, 28, B, 325, 0); a.g.restore(); }
  a.circ(0, 0, 28, 28, null, 325); a.line([[0, -28], [0, 28]], 326, 1.6);
  for (const s of [-1, 1]) { a.circ(s * 9, -8, 6, 6, CREAM, 327 + s, 1.6); a.dot(s * 9 + 1, -7, 2); a.line([[s * 15, -16], [s * 4, -14]], 329 + s, 1.6); }   // grumpy brows
  a.blob([[-14, 8], [0, 4], [14, 8], [0, 12]], B, 331, 1.6); a.blob([[-14, 9], [14, 9], [0, 18]], R, 332, 1.6);   // the lips across the seam
  a.circ(-3, -32, 4, 4, Y, 333, 1.4); a.circ(3, -33, 4, 4, Y, 334, 1.4);                    // the tuft
  a.g.restore();
}
function ffBunny(a, col, ears) {                                           // a rabbit, sitting up
  a.circ(0, 18, 20, 22, col, 340);
  a.circ(0, -12, 15, 14, col, 341);
  for (const s of [-1, 1]) a.blob([[s * 4, -22], [s * (8 + (ears || 0)), -52], [s * 14, -50], [s * 10, -22]], col, 342 + s);
  for (const s of [-1, 1]) a.dot(s * 6, -14, 1.8);
  a.circ(0, -7, 2.4, 2, '#f2a7b9', 344, 1);
  a.circ(18, 32, 6, 6, CREAM, 345, 1.4);                                                     // the tail
}
function ffTopHat(a, x, y, s) { a.at(x, y, 0, () => { a.rect(-26, -8, 26, 0, 3, '#2a2630', 350); a.rect(-17, -46, 17, -6, 3, '#2a2630', 351); a.rect(-17, -18, 17, -10, 1, '#d9506a', 352, 1.4); }, s || 1); }
function ffSlots(a, y, n) { a.g.save(); if (!ST.holo) a.g.setLineDash([4, 4]); for (let i = 0; i < n; i++) a.rect(-108 + i * 56, y - 22, -64 + i * 56, y + 22, 4, null, 360 + i, 1.2); a.g.restore(); }
function ffHill(a, x, y, w, h, seed) { a.blob([[x - w, y], [x - w * 0.6, y - h * 0.7], [x, y - h], [x + w * 0.6, y - h * 0.7], [x + w, y]], '#7bbf6a', seed); }

// ── 📎 JOANNA ARCH'S AUDITORS (Finley)
ART.arch = a => {                                                          // the commander (EP7): green, in her sharp pants suit, AUDIT behind her
  const G = '#3fa35a', G2 = '#2e7d4f', G3 = '#9fd3a8';
  a.layer(-1, () => a.nim('#b8e0b0'));
  if (!a.alt) a.layer(-0.7, () => { a.g.save(); a.g.globalAlpha = ST.holo ? 0.5 : 0.42; a.at(52, -22, 0, () => ffAudit(a), 0.62); a.g.restore(); });
  a.layer(0.35, () => a.at(-18, 0, 0, () => {
    a.poly([[-14, 40], [-4, 40], [-6, 86], [-16, 86]], G2, 400); a.poly([[4, 40], [14, 40], [16, 86], [6, 86]], G2, 401);     // trousers
    a.blob([[-20, 86], [-4, 86], [-4, 92], [-20, 92]], '#1c1a21', 402, 1.4); a.blob([[6, 86], [22, 86], [22, 92], [6, 92]], '#1c1a21', 403, 1.4);
    a.poly([[-20, 0], [20, 0], [18, 44], [-18, 44]], G, 404);                                                            // the jacket
    a.poly([[-4, 0], [4, 0], [0, 18]], G3, 405, 1.4); a.line([[0, 18], [0, 40]], 406, 1.2);
    a.blob([[-20, 4], [-36, 22], [-30, 30], [-18, 18]], G, 407);                                                        // hand on hip
    a.blob([[20, 4], [32, 16], [26, 22], [16, 14]], G, 408);
    a.at(30, 14, -0.15, () => { a.rect(-8, -14, 8, 10, 2, G2, 409); a.rect(-5, -11, 5, -5, 1, G3, 410, 0.8); for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) a.dot(-2.5 + i * 5, 0 + j * 4, 1.1, G3); });   // the calculator
    a.rect(-4, -6, 4, 2, 1, G, 411, 1.6);
    a.circ(0, -22, 16, 17, G, 412);                                                                                         // head
    a.blob([[-17, -26], [-14, -40], [0, -44], [14, -40], [17, -26], [10, -34], [-10, -34]], G2, 413);                       // hair, pulled back
    a.circ(0, -46, 8, 6, G2, 414);                                                                                          // the bun
    a.at(0, -46, -0.3, () => { a.rect(-18, -2, 16, 2, 1, '#f2c230', 415, 1.2); a.poly([[16, -2], [22, 0], [16, 2]], '#f3d6b0', 416, 1); });   // a pencil through it
    for (const s of [-1, 1]) a.circ(s * 6.5, -22, 5, 5, CREAM, 417 + s, 1.6);
    a.line([[-1.5, -22], [1.5, -22]], 419, 1.4); for (const s of [-1, 1]) a.dot(s * 6.5, -22, 1.5);
    a.line([[-4, -12], [4, -12]], 420, 1.4);
  }));
  if (a.alt) a.layer(0.8, () => a.at(52, 34, 0, () => ffAudit(a, true), 0.6));
};
ART.protectors = a => {                                                    // EP7: four pencils, fiery erasers
  a.layer(-1, () => a.nim('#ffcf9a'));
  if (a.alt) a.layer(-0.4, () => { a.fillRect(-130, 60, 130, 110, rgba('#7a8ab8', 0.45)); a.curve([[-130, 70], [0, 58], [130, 70]], 430, 1.4); });   // the planet's edge below
  a.layer(0.4, () => { for (let i = 0; i < 4; i++) { const px = -70 + i * 45, py = -30 + (i % 2) * 30 + (a.alt ? 10 : 0); a.at(px, py, a.alt ? 2.6 : 0.6, () => ffPencil(a, a.alt ? 1.5 : 1)); } });
};
ART.auditors = a => {                                                      // the army of auditors: clerks spill out with calculators
  a.layer(-1, () => a.nim('#b8e0b0'));
  a.layer(-0.5, () => { ffTower(a, -110, 70, 40, 120, '#a9adb6', 440); ffTower(a, 72, 70, 44, 140, '#a9adb6', 441); });
  a.layer(0.1, () => { if (a.alt) { a.at(-64, 16, 0, () => ffClerk(a, true), 0.7); a.at(64, 16, 0, () => ffClerk(a, true), 0.7); } });
  a.layer(0.5, () => { a.at(-40, 34, 0, () => ffClerk(a, a.alt), 0.95); a.at(40, 34, 0, () => ffClerk(a, a.alt), 0.95); a.at(0, 40, 0, () => ffClerk(a, !a.alt), 1.05); });
};
ART.station = a => {                                                       // Arch's battle station: three stacked office blocks and a sliding hangar
  a.layer(-1, () => a.nim('#b8e0b0'));
  a.layer(-0.6, () => { for (let i = 0; i < 12; i++) a.dot(-120 + H2(i, 61) * 240, -90 + H2(i, 62) * 90, 1 + H2(i, 63), '#5a6a5a'); });
  const blk = (x0, y0, x1, y1, seed) => { a.rect(x0, y0, x1, y1, 2, '#b9c2c9', seed); a.poly([[x1, y0], [x1 + 16, y0 - 10], [x1 + 16, y1 - 10], [x1, y1]], '#8e979f', seed + 1, a.L * 0.8); a.poly([[x0, y0], [x0 + 16, y0 - 10], [x1 + 16, y0 - 10], [x1, y0]], '#d6dce1', seed + 2, a.L * 0.8);
    for (let yy = y0 + 8; yy < y1 - 4; yy += 8) a.line([[x0 + 4, yy], [x1 - 4, yy]], seed + 3, 0.8); };
  a.layer(0.2, () => {
    blk(-80, 4, 60, 64, 450); blk(-56, -36, 38, 4, 455); blk(-38, -70, 14, -36, 460);
    const open = a.alt ? 34 : 0;
    a.rect(-34 - open, 30, -34, 64, 1, '#3a3440', 465, 1.2); a.rect(-34, 30, 10, 64, 1, open ? '#1c1a21' : '#9aa3ab', 466);   // the hangar door slides
  });
  if (a.alt) a.layer(0.7, () => { for (let i = 0; i < 3; i++) a.at(-20 + i * 30, 70 - i * 6, 2.2, () => ffPencil(a, 1.3), 0.5); });
};
ART.takeover = a => {                                                      // EP7: skyscrapers rise over the countryside
  a.layer(-1, () => a.nim('#b8e0b0'));
  a.layer(-0.4, () => { if (!ST.holo) { a.g.fillStyle = rgba('#7bbf8a', 0.6); a.g.beginPath(); a.g.ellipse(0, 70, 140, 50, 0, Math.PI, 0); a.g.fill(); } a.curve([[-130, 64], [0, 22], [130, 64]], 470, 1.2); });
  const grow = a.alt ? 1.35 : 1;
  a.layer(0.3, () => { for (let i = 0; i < 5; i++) ffTower(a, -90 + i * 42, 40, 30, (60 + (i * 37 % 50)) * grow, '#8a8f99', 471 + i); });
  a.layer(0.7, () => a.at(55, a.alt ? -74 : -60, 0, () => { a.rect(-25, -20, 25, 20, 4, '#5fb86a', 480); a.g.save(); a.g.fillStyle = ST.holo ? HOLO : INK; a.g.font = 'bold 20px sans-serif'; a.g.textAlign = 'center'; a.g.textBaseline = 'middle'; a.g.fillText('%', 0, 1); a.g.restore(); }));
};
ART.slipper = a => {                                                       // the sapphire slipper, in the penthouse, guarded by pocket protectors
  a.layer(-1, () => a.nim('#a9c8f2'));
  a.layer(-0.5, () => { a.rect(-70, -80, 70, 40, 6, '#e8eef6', 490); a.line([[0, -80], [0, 40]], 491, 1.4); a.line([[-70, -20], [70, -20]], 492, 1.4); });   // the penthouse window
  a.layer(0.2, () => {
    a.rect(-50, 40, 50, 60, 8, '#c0392b', 493); a.rect(-36, 60, 36, 90, 2, '#8a5a3a', 494);                               // cushion on a plinth
    a.blob([[-36, 40], [-30, 22], [-4, 16], [20, 4], [38, 10], [34, 38]], '#3b6fd6', 495);                                   // the slipper
    a.blob([[-28, 30], [-20, 24], [0, 22], [-6, 34]], '#9fc0ff', 496, 1.2);
    for (let i = 0; i < 4; i++) { const x = -44 + i * 28, y = -6 - (i % 2) * 14 - (a.alt ? 8 : 0), r = a.alt ? 7 : 4.5; a.line([[x - r, y], [x + r, y]], 497 + i, 1.2); a.line([[x, y - r], [x, y + r]], 501 + i, 1.2); }   // twinkles
  });
  a.layer(0.6, () => { a.at(-92, 10, a.alt ? 0.5 : 0, () => ffPencil(a), 0.75); a.at(92, 10, a.alt ? -0.5 : 0, () => ffPencil(a), 0.75); });
};
ART.archcity = a => {                                                      // ARCOSANTI (wiki: Paolo Soleri's arcology in the Arizona desert): concrete apses and cubes on a mesa, a bronze bell
  a.layer(-1, () => a.nim('#f2d3a0'));
  a.layer(-0.6, () => { a.fillRect(-130, 40, 130, 110, rgba('#d9a86a', 0.55)); a.blob([[-134, 97], [-134, 44], [-70, 30], [-20, 36], [40, 28], [134, 40], [134, 97]], '#d9a86a', 510); });   // the mesa
  a.layer(0.1, () => {
    for (const [x, w, h] of [[-104, 36, 54], [72, 44, 62], [108, 26, 40]]) a.rect(x - w / 2, 34 - h, x + w / 2, 34, 2, '#c9c1b2', 511 + x, 2);   // the cubes
    for (const [x, y] of [[60, -12], [84, -12], [72, -36]]) a.rect(x - 6, y - 6, x + 6, y + 6, 1, '#6a6070', 515 + x + y, 1.2);
  });
  a.layer(0.35, () => {                                                    // the apse: a quarter-dome vault, cast in silt
    a.blob([[-70, 36], [-70, -26], [-48, -58], [-10, -70], [28, -58], [50, -26], [50, 36]], '#c9c1b2', 520);
    a.blob([[-52, 36], [-52, -16], [-34, -40], [-10, -48], [14, -40], [32, -16], [32, 36]], '#8f8577', 521);
    for (let i = 0; i < 4; i++) a.curve([[-48 + i * 4, 30 - i * 16], [-10, 22 - i * 18], [28 - i * 4, 30 - i * 16]], 522 + i, 1);
  });
  a.layer(0.7, () => a.at(-10, a.alt ? -14 : -18, a.alt ? 0.25 : 0, () => {   // a bronze wind bell under the vault
    a.line([[0, -22], [0, -8]], 530, 1.4); a.blob([[-9, 10], [-7, -6], [0, -10], [7, -6], [9, 10]], '#c58a3a', 531, 1.8); a.dot(0, 13, 2.4, '#c58a3a');
  }));
  if (a.alt) a.layer(0.9, () => { for (let i = 0; i < 4; i++) a.at(-80 + i * 52, -82 + (i % 2) * 12, 0, () => { a.circ(0, 0, 11, 11, '#f9c74f', 540 + i); a.g.save(); a.g.fillStyle = ST.holo ? HOLO : INK; a.g.font = 'bold 11px sans-serif'; a.g.textAlign = 'center'; a.g.textBaseline = 'middle'; a.g.fillText('+1', 0, 1); a.g.restore(); }); });
};
ART.envoy = a => {                                                         // the envoy: a treaty, sealed
  a.layer(-1, () => a.nim('#d8dce6'));
  a.layer(-0.3, () => { a.blob([[-60, -70], [60, -74], [64, 60], [-58, 64]], '#f6efe2', 530); for (let r = 0; r < 6; r++) a.line([[-44, -50 + r * 14], [44, -52 + r * 14]], 531 + r, 0.9); a.curve([[-30, 40], [-10, 30], [10, 44], [30, 36]], 537, 1.6); });   // the treaty, signed
  a.layer(0.4, () => { a.line([[30, 52], [24, 80]], 538, 1.6); a.line([[40, 52], [46, 80]], 539, 1.6); a.circ(36, 50, 14, 14, '#c0392b', 540, a.L, 0.12); a.star(36, 50, 6, '#e8506a', 541); });   // the wax seal and ribbon
  if (a.alt) a.layer(0.8, () => { a.blob([[-110, 10], [-20, 4], [-10, 22], [-110, 30]], '#3fa35a', 542); a.blob([[110, 4], [20, 2], [6, 20], [110, 28]], '#d9506a', 543); a.circ(-6, 14, 14, 12, '#f0c8a8', 544); });   // two hands shake on it
  else a.layer(0.8, () => a.at(-70, 56, -0.5, () => { a.rect(-4, -40, 4, 20, 1.5, '#1c1a21', 545, 1.4); a.poly([[-4, 20], [4, 20], [0, 30]], '#e0b84a', 546, 1); }));   // the pen
};

// ── 🎩 THE FHAT
ART.rabbit = a => {                                                        // the commander: a rabbit out of a hat, MULTIPLY behind it
  const C = '#e8eef6';
  a.layer(-1, () => a.nim('#f0b8c8'));
  if (!a.alt) a.layer(-0.7, () => { a.g.save(); a.g.globalAlpha = ST.holo ? 0.45 : 0.32; for (let i = 0; i < 3; i++) a.at(-80 + i * 80, -40, 0, () => ffBunny(a, C), 0.5); a.g.restore(); });   // MULTIPLY, faint
  a.layer(0.3, () => {                                                     // the hat, upside down: the rabbit comes up out of it
    a.circ(0, 40, 46, 11, '#2a2630', 370); a.circ(0, 39, 34, 7, '#0e0c12', 371, 1.2);
    a.at(0, a.alt ? 0 : 16, 0, () => ffBunny(a, C), 1.15);
    a.g.save(); a.g.beginPath(); a.g.rect(-60, 40, 120, 70); a.g.clip(); a.g.restore();
    a.rect(-32, 40, 32, 92, 4, '#2a2630', 372); a.rect(-32, 48, 32, 58, 1, '#d9506a', 373, 1.4);
    a.curve([[-46, 40], [0, 50], [46, 40]], 374, 2.4);
  });
  if (a.alt) a.layer(0.8, () => { for (let i = 0; i < 4; i++) a.at(-96 + i * 64, -56 + (i % 2) * 10, 0, () => ffBunny(a, C), 0.6); });   // MULTIPLY: one in every square
};
ART.jackrabbit = a => {                                                    // sprints through the empty slots
  a.layer(-1, () => a.nim('#f6d8a8'));
  a.layer(-0.3, () => ffSlots(a, 40, 4));
  const x = a.alt ? 70 : -10;
  a.layer(0.5, () => a.at(x, 20, -0.15, () => {
    a.blob([[-34, 10], [-10, -12], [26, -10], [34, 6], [10, 18], [-26, 22]], '#c9a27e', 570);                               // a long body, stretched out
    a.circ(36, -10, 12, 11, '#c9a27e', 571);
    for (const s of [0, 1]) a.blob([[34 + s * 6, -18], [20 + s * 8, -54], [28 + s * 8, -56], [42 + s * 6, -18]], '#c9a27e', 572 + s);
    a.dot(40, -12, 1.8); a.circ(47, -7, 2, 1.6, '#f2a7b9', 574, 1);
    a.line([[-26, 18], [-52, 30]], 575, 3); a.line([[20, 14], [44, 30]], 576, 3); a.circ(-36, 4, 6, 6, CREAM, 577, 1.4);
    for (let i = 0; i < 4; i++) a.line([[-60 - i * 6, -6 + i * 8], [-100 - i * 10, -6 + i * 8]], 578 + i, 1.2);            // speed
  }));
  if (a.alt) a.layer(0.8, () => { a.star(108, 10, 16, '#ffd34d', 583); a.circ(108, -30, 12, 12, null, 584, 2); });          // it hits a ring
};
ART.hatunit = a => {                                                       // GIBUS (wiki: the opera hat, a top hat that folds flat on a spring): a grumpy little Fhat hat that pops up
  a.layer(-1, () => a.nim('#c8d6f2'));
  a.layer(-0.4, () => { a.fillRect(-130, 56, 130, 110, rgba('#7bbf6a', 0.4)); a.curve([[-130, 60], [0, 52], [130, 60]], 590, 1.2); });
  const up = a.alt ? 1 : 0.28;                                             // folded flat · popped up
  a.layer(0.2, () => { a.at(-78, 46, 0, () => { a.rect(-22, -6, 22, 0, 3, '#2a2630', 591); a.rect(-14, -12, 14, -6, 2, '#2a2630', 592); }); });   // another one, folded flat
  a.layer(0.5, () => a.at(10, 44, 0, () => {
    const h = 20 + 64 * up;
    for (const s of [-1, 1]) { a.line([[s * 14, 0], [s * 14, 12]], 593 + s, 2.6); a.poly([[s * 14 - 8, 12], [s * 14 + 8, 12], [s * 14 + 8, 17], [s * 14 - 8, 17]], '#ffd34d', 594 + s, 1.4); }   // yellow feet
    a.rect(-40, -8, 40, 0, 3, '#2a2630', 596);                                                              // the brim
    a.rect(-26, -8 - h, 26, -8, 4, '#2a2630', 600);                                                         // the crown
    if (!a.alt) for (let i = 0; i < 3; i++) a.curve([[-18 + i * 18, -8], [-12 + i * 18, -11], [-22 + i * 18, -14], [-16 + i * 18, -17]], 597 + i, 1.2);   // the spring, squashed
    a.rect(-26, -22, 26, -14, 1, '#d9506a', 601, 1.2);                                                      // the band
    const ey = -8 - h * 0.62;
    for (const s of [-1, 1]) { a.circ(s * 10, ey, 6, 6, CREAM, 602 + s, 1.6); a.dot(s * 10 + 1, ey + 1, 2); a.line([[s * 4, ey - 9], [s * 16, ey - 6]], 604 + s, 1.6); }   // grumpy brows
    a.blob([[-10, ey + 12], [0, ey + 9], [10, ey + 12], [0, ey + 16]], '#e0506a', 606, 1.4);
  }));
  if (a.alt) a.layer(0.8, () => { a.star(-44, -40, 10, '#ffd34d', 607); a.curve([[30, -70], [40, -78], [50, -70]], 608, 1.2); });
};
ART.burrow = a => {                                                        // BURROW: a hill with a back door. Attack it and you fall in.
  a.layer(-1, () => a.nim('#c8e6b0'));
  a.layer(-0.5, () => { ffHill(a, -80, 70, 70, 50, 600); ffHill(a, 90, 70, 60, 40, 601); });
  a.layer(0.2, () => { ffHill(a, 0, 80, 110, 90, 602); a.blob([[-30, 50], [-24, 24], [0, 14], [24, 24], [30, 50]], '#2a2630', 603); });
  if (a.alt) a.layer(0.6, () => { a.at(0, 24, 2.6, () => ship(a, { len: 26, ports: 2, flagCol: '#2e7d32' })); for (let i = 0; i < 3; i++) a.line([[-14 + i * 14, -40], [-14 + i * 14, -10]], 604 + i, 1.2); });   // an attacker falls in
  else a.layer(0.6, () => { a.dot(-8, 34, 2.4, '#ffd34d'); a.dot(8, 34, 2.4, '#ffd34d'); });                                // eyes in the dark
};
ART.pasttrap = a => {                                                      // THE HARBOUR BOOM (wiki: a boom, logs on a chain strung across a harbour mouth to stop ships)
  a.layer(-1, () => a.nim('#c0e4f6'));
  a.layer(-0.5, () => { a.fillRect(-130, 10, 130, 110, rgba('#5a8fc8', 0.45)); waves(a, 20, 7, 40, 611); });
  a.layer(-0.1, () => { for (const x of [-112, 112]) { a.rect(x - 16, -60, x + 16, 40, 2, '#b9b3a8', 612 + x, 2); for (let i = 0; i < 3; i++) a.rect(x - 16 + i * 12, -68, x - 10 + i * 12, -60, 1, '#b9b3a8', 615 + i + x, 1.4); } });   // two stone towers
  const sag = a.alt ? 8 : 0;
  a.layer(0.3, () => {
    a.curve([[-96, 0], [-40, 14 + sag], [0, 18 + sag], [40, 14 + sag], [96, 0]], 620, 1.6);               // the chain
    for (let i = 0; i < 7; i++) { const x = -78 + i * 26, y = 8 + Math.sin(i / 6 * Math.PI) * (10 + sag); a.rect(x - 11, y - 4, x + 11, y + 4, 4, '#a8744f', 621 + i, 1.8); }   // the logs
  });
  a.layer(0.6, () => a.at(a.alt ? 6 : 10, a.alt ? -8 : -24, a.alt ? -0.25 : 0, () => ship(a, { len: 34, ports: 2, flagCol: '#2e7d32' })));   // the move, stopped
  if (a.alt) a.layer(0.8, () => { a.star(-24, -2, 14, '#ffd34d', 630); for (let i = 0; i < 3; i++) a.line([[-40 - i * 8, -20 + i * 4], [-56 - i * 10, -30 + i * 2]], 631 + i, 1.2); });
};
ART.siege = a => {                                                         // WARWOLF (wiki: Edward I's giant trebuchet at the siege of Stirling Castle, 1304)
  a.layer(-1, () => a.nim('#e6c8a8'));
  a.layer(-0.4, () => { for (let r = 0; r < 6; r++) for (let c = 0; c < 2; c++) a.rect(76 + c * 26 + (r % 2 ? 13 : 0), -80 + r * 26, 100 + c * 26 + (r % 2 ? 13 : 0), -56 + r * 26, 2, '#b9b3a8', 630 + r * 3 + c, 1.4);   // the castle wall
    if (a.alt) { a.line([[82, -40], [96, -16], [86, 8], [100, 30]], 650, 2.4); a.line([[96, -16], [114, -20]], 651, 1.6); } });
  a.layer(0.4, () => a.at(-44, 0, 0, () => {
    a.poly([[-70, 70], [50, 70], [44, 80], [-64, 80]], '#8a5a3a', 652);                                  // the base
    a.line([[-48, 70], [-6, -30]], 653, 3.4); a.line([[36, 70], [-6, -30]], 654, 3.4); a.line([[-30, 30], [20, 30]], 655, 2);   // the A-frame
    const arm = a.alt ? -2.2 : -0.55;                                                                      // the throwing arm: cocked, then flung
    a.at(-6, -30, arm, () => {
      a.line([[-46, 0], [92, 0]], 656, 3.6);
      a.rect(-66, -14, -42, 22, 3, '#6a6a78', 657);                                                       // the counterweight
      a.curve([[92, 0], [100, 14], [96, 28]], 658, 1.4); if (!a.alt) a.circ(96, 32, 7, 7, '#8f8577', 659); // the sling and its stone
    });
    a.circ(-6, -30, 4, 4, '#3a3440', 660, 1.4);
  }));
  if (a.alt) a.layer(0.7, () => { a.circ(62, -58, 8, 8, '#8f8577', 661); a.curve([[-20, -80], [20, -96], [56, -64]], 662, 1); a.star(82, -40, 14, '#ffd34d', 663); });
};

// ── art/kits-a.js
// kits-a: the kit roles on the core, industry, economy and science roads. Each picture draws the Wikipedia article its name comes from.
// a cartoon person: o = { body, skin, head, legs, arm: [angleL, angleR] }  (stands with feet at y = 0)
function kaPerson(a, o) {
  const skin = o.skin || '#e9b48e', body = o.body || '#7a8a5a', h = o.h || 1;
  a.line([[-8, 0], [-6, -30 * h]], 300, 3.2); a.line([[8, 0], [6, -30 * h]], 301, 3.2);                       // legs
  a.blob([[-16, -26 * h], [-14, -62 * h], [14, -62 * h], [16, -26 * h]], body, 302);                          // body
  const [al, ar] = o.arm || [0.4, -0.4];
  a.at(-13, -56 * h, al, () => { a.line([[0, 0], [-4, 26]], 303, 3); a.circ(-4, 28, 3.4, 3.4, skin, 304, 1.4); });
  a.at(13, -56 * h, ar, () => { a.line([[0, 0], [4, 26]], 305, 3); a.circ(4, 28, 3.4, 3.4, skin, 306, 1.4); });
  a.circ(0, -74 * h, 12, 12, skin, 307);
  for (const s of [-1, 1]) { a.circ(s * 4.5, -76 * h, 3.4, 3.4, CREAM, 308 + s, 1.2); a.dot(s * 4.5 + 0.5, -76 * h, 1.3); }
  if (o.head) o.head();
}
function kaHand(a, x, y, rot) { a.at(x, y, rot, () => a.circ(0, 0, 4, 4, '#e9b48e', 310, 1.4)); }

// ── Kern: Irish light infantry, a cloak and a sheaf of javelins
ART.kit_grunt = a => {
  a.layer(-1, () => a.nim('#b8dca0'));
  a.layer(-0.4, () => { a.fillRect(-130, 50, 130, 110, rgba('#7fb069', 0.55)); a.curve([[-130, 54], [-40, 46], [40, 52], [130, 46]], 320, 1.4); });
  a.layer(0.4, () => a.at(-14, 76, 0, () => {
    kaPerson(a, { body: '#c9a24a', arm: [0.3, a.alt ? -2.4 : -0.6], head: () => a.blob([[-12, -80], [0, -92], [12, -80], [8, -84], [-8, -84]], '#8a5a3a', 321, 1.6) });
    a.blob([[-18, -60], [-24, -20], [-10, -24]], '#3f6b3a', 322, 1.6);                                    // the cloak
    if (!a.alt) { a.line([[-18, -30], [-30, -92]], 323, 1.6); a.line([[-14, -30], [-22, -96]], 324, 1.6); a.poly([[-30, -92], [-33, -102], [-27, -98]], '#c0c6cf', 325, 1.2); a.poly([[-22, -96], [-24, -106], [-19, -101]], '#c0c6cf', 326, 1.2); }
  }, 1.35));
  a.layer(0.8, () => { const thrown = a.alt; a.at(thrown ? 62 : 30, thrown ? -40 : -20, thrown ? 0.9 : -0.5, () => { a.line([[0, 30], [0, -30]], 327, 2); a.poly([[0, -30], [-4, -40], [4, -40]], '#c0c6cf', 328, 1.2); }); if (thrown) for (let i = 0; i < 3; i++) a.line([[20 - i * 10, -10 + i * 6], [44 - i * 10, -28 + i * 6]], 329 + i, 1); });
};
// ── Gallowglass: a mail-coated mercenary with a long axe
ART.kit_soldier = a => {
  a.layer(-1, () => a.nim('#c9d0dc'));
  a.layer(-0.3, () => a.fillRect(-130, 56, 130, 110, rgba('#9aa38f', 0.5)));
  a.layer(0.45, () => a.at(-16, 80, 0, () => {
    kaPerson(a, { body: '#9aa3ad', h: 1.1, arm: [0.2, a.alt ? -1.9 : -0.25], head: () => a.blob([[-13, -82], [-12, -96], [0, -102], [12, -96], [13, -82]], '#7d858f', 340, 1.8) });
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) a.dot(-9 + c * 6, -64 + r * 8, 1, '#5d646d');      // mail rings
    a.blob([[-16, -32], [-18, -6], [18, -6], [16, -32]], '#b07a3a', 341, 1.8);                             // the long coat
  }, 1.3));
  a.layer(0.7, () => a.at(34, 10, a.alt ? -1.1 : 0.15, () => { a.line([[0, 60], [0, -80]], 342, 2.6); a.blob([[0, -80], [24, -92], [30, -70], [0, -60]], '#c8ced6', 343, 1.8); }));
  if (a.alt) a.layer(0.9, () => a.star(70, -20, 14, '#ffd34d', 344));
};
// ── Hesco Bastion: a wire-mesh cage filled with earth (a structure)
function kaHesco(a, x, y, s) { a.at(x, y, 0, () => { a.rect(-24, -40, 24, 0, 2, '#c9b28a', 350); for (let i = 1; i < 4; i++) a.line([[-24 + i * 12, -40], [-24 + i * 12, 0]], 351 + i, 1); for (let j = 1; j < 4; j++) a.line([[-24, -40 + j * 10], [24, -40 + j * 10]], 355 + j, 1); a.rect(-26, -44, 26, -38, 1, '#a08860', 359, 1.4); }, s); }
ART.kit_wall = a => {
  a.layer(-1, () => a.nim('#e6d6a8'));
  a.layer(-0.4, () => a.fillRect(-130, 50, 130, 110, rgba('#c8a874', 0.45)));
  a.layer(0.3, () => { kaHesco(a, -56, 50, 1); kaHesco(a, 0, 50, 1); kaHesco(a, 56, 50, 1); kaHesco(a, -28, 6, 1); kaHesco(a, 28, 6, 1); });
  a.layer(0.8, () => { if (a.alt) { a.circ(-96, -40, 7, 7, '#3a3440', 361); a.line([[-130, -50], [-104, -42]], 362, 1); a.star(-50, -30, 14, '#ffd34d', 363); a.puff(-40, -20, 9, 364); } else for (let i = 0; i < 4; i++) a.dot(-100 + i * 70, 64, 2, '#8a7350'); });
};
// ── Great Michael: the biggest ship of its day, four masts
ART.kit_heavy = a => {
  a.layer(-1, () => a.nim('#a9d2f2'));
  a.layer(-0.4, () => { a.fillRect(-130, 44, 130, 110, rgba('#5a8fc8', 0.5)); waves(a, 52, 7, 42, 370); });
  a.layer(0.3, () => a.at(-4, 30, a.alt ? -0.04 : 0, () => {
    a.poly([[-104, -6], [-70, -20], [92, -20], [108, -6], [84, 20], [-84, 20]], '#7a4a2e', 371);
    a.rect(-100, -44, -64, -18, 4, '#8a5a3a', 372); a.rect(70, -40, 102, -18, 4, '#8a5a3a', 373);                  // castles
    for (let i = 0; i < 6; i++) a.rect(-70 + i * 26, -8, -62 + i * 26, 0, 1.5, '#2a1a10', 374 + i, 1.2);
    [-56, -14, 28, 64].forEach((mx, i) => { const mh = [70, 96, 88, 60][i]; a.line([[mx, -20], [mx, -20 - mh]], 380 + i, 2.4);
      a.blob([[mx - 18, -24 - mh * 0.9], [mx + 18, -24 - mh * 0.9], [mx + 20, -28 - mh * 0.35], [mx - 20, -28 - mh * 0.35]], '#f3eadb', 384 + i, 1.8);
      a.poly([[mx, -20 - mh], [mx + 16, -16 - mh], [mx, -12 - mh]], i % 2 ? '#1565c0' : '#f5f5f5', 388 + i, 1); });
    if (a.alt) for (let i = 0; i < 5; i++) a.puff(90 + (i % 2) * 6, 4 - i * 2, 8 + i * 2, 392 + i);
  }));
  a.layer(0.8, () => waves(a, 76, 6, 50, 398));
};
// ── Carronade: a short, stubby gun on a slide, "the smasher"
ART.kit_brute = a => {
  a.layer(-1, () => a.nim('#ffbf8a'));
  a.layer(-0.4, () => { a.fillRect(-130, 40, 130, 110, rgba('#8a5a3a', 0.6)); for (let i = 0; i < 6; i++) a.line([[-130 + i * 48, 40], [-150 + i * 48, 110]], 400 + i, 1); });
  const recoil = a.alt ? -14 : 0;
  a.layer(0.4, () => a.at(recoil - 10, 24, 0, () => {
    a.rect(-60, 4, 50, 16, 3, '#6b4528', 406);                                                         // the slide
    a.blob([[-46, -20], [-30, -30], [30, -26], [44, -22], [44, 6], [30, 8], [-30, 10], [-46, 2]], '#2f2b34', 407);   // the stubby barrel
    a.circ(44, -8, 6, 14, '#1c1a21', 408); a.circ(-50, -10, 8, 8, '#2f2b34', 409);
    a.circ(-40, 22, 9, 9, '#a8744f', 410, 1.8); a.circ(36, 22, 9, 9, '#a8744f', 411, 1.8);
  }));
  a.layer(0.8, () => { if (a.alt) { a.puff(64, 8, 16, 412); a.puff(88, -4, 12, 413); a.star(80, 4, 18, '#ffb02a', 414); } else a.at(-80, -40, 0, () => { for (let i = 0; i < 3; i++) a.circ(i * 14, 0, 6, 6, '#3a3440', 415 + i); }); });
};
// ── Chasqui: an Inca relay runner with a conch and a quipu
ART.kit_runner = a => {
  a.layer(-1, () => a.nim('#ffd8a0'));
  a.layer(-0.5, () => { a.poly([[-130, 60], [-70, -30], [-10, 40], [40, -50], [130, 50], [130, 110], [-130, 110]], '#b9a98a', 420, 1.4); a.line([[-130, 70], [130, 56]], 421, 1.2); });
  a.layer(0.4, () => a.at(a.alt ? 30 : -14, 62, -0.18, () => {
    kaPerson(a, { body: '#d0483a', arm: [1.1, -1.2], head: () => a.blob([[-12, -82], [0, -88], [12, -82]], '#f9a825', 422, 1.4) });
    a.at(-24, -40, 0.6, () => { a.line([[0, 0], [0, 26]], 423, 1.4); for (let i = 0; i < 5; i++) a.line([[-6 + i * 3, 4], [-6 + i * 3, 18 + (i % 2) * 5]], 424 + i, 1); });   // quipu
    a.at(22, -46, -0.3, () => a.blob([[0, 0], [16, -6], [20, 4], [6, 8]], '#f2e2cc', 429, 1.4));                 // conch
  }));
  a.layer(0.8, () => { for (let i = 0; i < 3; i++) a.line([[-96 + (a.alt ? 40 : 0), 20 + i * 10], [-60 + (a.alt ? 40 : 0), 20 + i * 10]], 430 + i, 1.2); if (a.alt) a.at(-70, 40, 0, () => kaPerson(a, { body: '#a03a30', h: 0.7, arm: [0.4, -0.4] }), 0.7); });
};
// ── Congreve Rocket: rockets on a ladder frame (an action)
ART.kit_barrage = a => {
  a.layer(-1, () => a.nim('#ffc08a'));
  a.layer(-0.5, () => { if (a.alt) { a.star(76, -56, 26, '#ffb02a', 440); a.star(76, -56, 12, '#fff2a8', 441); } else a.at(76, -56, 0.08, () => ship(a, { len: 26, ports: 2, flagCol: '#2e7d32', sailCol: '#e8f0f6' })); });
  a.layer(0.2, () => { for (let i = 0; i < 3; i++) { const t0 = a.alt ? 0.9 : 0.35 + i * 0.12, x = -70 + 140 * t0, y = 40 - 90 * t0 - Math.sin(t0 * Math.PI) * 20;
    a.at(x, y, -0.7, () => { a.rect(-4, -14, 4, 10, 2, '#c84a3a', 442 + i, 1.6); a.poly([[-4, -14], [0, -22], [4, -14]], '#3a3440', 445 + i, 1.2); a.line([[0, 10], [0, 40]], 448 + i, 1); });
    a.puff(x - 14, y + 14, 6 + i, 451 + i); } });
  a.layer(0.7, () => a.at(-74, 66, -0.75, () => { a.line([[-8, 10], [-8, -60]], 455, 2.4); a.line([[8, 10], [8, -60]], 456, 2.4); for (let j = 0; j < 5; j++) a.line([[-8, -j * 14], [8, -j * 14]], 457 + j, 1.4); a.line([[-8, 10], [-20, 30]], 462, 2); a.line([[8, 10], [20, 30]], 463, 2); }));
};
// ── Tianguis: an open-air Mesoamerican market (+1 ECON a turn)
function kaStall(a, x, col, goods) { a.at(x, 40, 0, () => { a.line([[-22, 0], [-22, -40]], 470, 1.8); a.line([[22, 0], [22, -40]], 471, 1.8); a.poly([[-30, -40], [0, -54], [30, -40]], col, 472, 1.8); a.rect(-24, -14, 24, -2, 2, '#a8744f', 473, 1.6); for (let i = 0; i < 4; i++) a.circ(-15 + i * 10, -18, 4, 4, goods[i % goods.length], 474 + i, 1); }); }
ART.kit_market = a => {
  a.layer(-1, () => a.nim('#ffe0a0'));
  a.layer(-0.4, () => a.fillRect(-130, 40, 130, 110, rgba('#d8b88a', 0.5)));
  a.layer(0.2, () => { kaStall(a, -70, '#e53935', ['#f9a825', '#2e7d32']); kaStall(a, 0, '#00bcd4', ['#ef6c00', '#c2185b']); kaStall(a, 70, '#f9a825', ['#7a4a2e', '#2e7d32']); });
  a.layer(0.7, () => { a.at(-34, 92, 0, () => kaPerson(a, { body: '#ffffff', h: 0.6 }), 0.8); if (a.alt) a.at(40, -50, 0, () => { a.circ(0, 0, 16, 16, '#f9c74f', 480); a.g.save(); a.g.fillStyle = ST.holo ? HOLO : INK; a.g.font = 'bold 15px "Comic Sans MS", sans-serif'; a.g.textAlign = 'center'; a.g.textBaseline = 'middle'; a.g.fillText('+1', 0, 1); a.g.restore(); }); });
};
// ── Hawaladar: a hawala broker with a ledger, money moving on a handshake
ART.kit_banker = a => {
  a.layer(-1, () => a.nim('#c8e6b0'));
  a.layer(-0.3, () => a.rect(-90, 30, 90, 52, 3, '#8a5a3a', 490));                                       // the counter
  a.layer(0.3, () => a.at(-40, 34, 0, () => kaPerson(a, { body: '#2e7d32', arm: [0.5, a.alt ? -1.4 : -0.9], head: () => a.blob([[-13, -80], [-10, -92], [10, -92], [13, -80]], '#f5f5f5', 491, 1.6) })));
  a.layer(0.5, () => { a.rect(4, 4, 60, 30, 2, '#f6efe2', 492); a.line([[32, 4], [32, 30]], 493, 1.2); for (let i = 0; i < 3; i++) { a.line([[8, 10 + i * 6], [28, 10 + i * 6]], 494 + i, 0.8); a.line([[36, 10 + i * 6], [56, 10 + i * 6]], 497 + i, 0.8); } });   // the ledger
  if (a.alt) a.layer(0.8, () => { a.at(70, -30, 0, () => kaPerson(a, { body: '#6a1b9a', h: 0.8, arm: [0.4, 1.2] }), 0.8); a.curve([[-20, -40], [20, -70], [60, -50]], 500, 1.2); a.circ(20, -64, 7, 7, '#f9c74f', 501, 1.2); });
  else a.layer(0.8, () => { for (let i = 0; i < 3; i++) a.circ(70 + i * 4, 22 - i * 5, 7, 3, '#f9c74f', 502 + i, 1.2); });
};
// ── Mississippi Bubble: John Law's shares blow up into a bubble, and pop (an action)
ART.kit_takeover = a => {
  a.layer(-1, () => a.nim('#d8e8f6'));
  a.layer(-0.3, () => { for (let i = 0; i < 6; i++) a.at(-90 + i * 34, 60 + (i % 2) * 8, (i - 3) * 0.15, () => { a.rect(-12, -8, 12, 8, 1, '#f3eadb', 510 + i, 1.2); a.line([[-7, -2], [7, -2]], 516 + i, 0.8); a.line([[-7, 3], [4, 3]], 522 + i, 0.8); }); });
  if (!a.alt) a.layer(0.4, () => { a.circ(0, -20, 62, 58, rgba('#bfe6ff', 0.5), 530, 1.8); a.curve([[-36, -50], [-24, -64], [-6, -70]], 531, 1.4);
    a.at(0, -20, 0.1, () => { a.rect(-24, -16, 24, 16, 2, '#f3eadb', 532, 1.4); for (let j = 0; j < 3; j++) a.line([[-16, -8 + j * 8], [16, -8 + j * 8]], 533 + j, 0.8); a.circ(14, 10, 5, 5, '#e53935', 536, 1); }); });
  else a.layer(0.4, () => { a.star(0, -20, 54, '#e6f4fb', 537); for (let i = 0; i < 8; i++) { const an = i / 8 * Math.PI * 2; a.at(Math.cos(an) * 70, -20 + Math.sin(an) * 60, an, () => a.rect(-9, -6, 9, 6, 1, '#f3eadb', 538 + i, 1.2)); } });
  a.layer(0.8, () => { a.curve([[-110, 40], [-80, 10], [-60, 24]], 546, 1.6); a.poly([[-60, 24], [-70, 20], [-64, 30]], '#e53935', 547, 1.2); });     // the price line, falling
};
// ── Kilwa Kisiwani: a coral-stone trade city with dhows (fused, +2 ECON a turn)
ART.kit_city = a => {
  a.layer(-1, () => a.nim('#ffe2b0'));
  a.layer(-0.4, () => { a.fillRect(-130, 44, 130, 110, rgba('#2fa6b8', 0.45)); waves(a, 52, 7, 42, 550); });
  a.layer(0.1, () => { a.poly([[-130, 30], [130, 30], [130, 46], [-130, 46]], '#e8dcc0', 551, 1.6);
    a.rect(-100, -10, -50, 30, 3, '#efe4cc', 552); a.blob([[-90, -10], [-75, -30], [-60, -10]], '#efe4cc', 553); a.dot(-75, 6, 4, '#3a3440');                 // the great mosque's dome
    a.rect(-40, -34, 20, 30, 3, '#e8dcc0', 554); for (let i = 0; i < 3; i++) a.rect(-34 + i * 18, -24, -26 + i * 18, -12, 4, '#3a3440', 555 + i, 1); a.rect(-14, 6, -4, 30, 4, '#3a3440', 558, 1);   // Husuni Kubwa
    a.rect(30, -4, 70, 30, 3, '#efe4cc', 559); a.rect(76, 8, 110, 30, 3, '#e8dcc0', 560); });
  a.layer(0.7, () => a.at(a.alt ? 40 : 70, 70, 0, () => { a.poly([[-34, 0], [34, 0], [24, 12], [-26, 12]], '#8a5a3a', 561); a.line([[0, 0], [2, -44]], 562, 1.8); a.poly([[2, -44], [36, -4], [-14, -6]], '#f3eadb', 563); }));   // a dhow
  if (a.alt) a.layer(0.9, () => { for (let i = 0; i < 2; i++) a.circ(-90 + i * 22, -50, 9, 9, '#f9c74f', 564 + i, 1.2); });
};
// ── Escapement: the escape wheel and its anchor (a machine part)
function kaWheel(a, r, teeth, fill, seed) { const P = []; for (let i = 0; i < teeth * 2; i++) { const an = i / (teeth * 2) * Math.PI * 2, rr = i % 2 ? r * 0.82 : r; P.push([Math.cos(an) * rr, Math.sin(an) * rr]); } a.poly(P, fill, seed, 1.8); a.circ(0, 0, r * 0.18, r * 0.18, '#3a3440', seed + 1, 1.2); for (let i = 0; i < 4; i++) a.line([[0, 0], [Math.cos(i * Math.PI / 2) * r * 0.7, Math.sin(i * Math.PI / 2) * r * 0.7]], seed + 2 + i, 1.2); }
ART.kit_part = a => {
  a.layer(-1, () => a.nim('#e6d6a8'));
  a.layer(-0.5, () => { for (let i = 0; i < 4; i++) a.line([[-130, -60 + i * 40], [130, -60 + i * 40]], 570 + i, 0.6); });
  const tick = a.alt ? 0.22 : 0;
  a.layer(0.3, () => a.at(0, 34, tick, () => kaWheel(a, 46, 15, '#d9a441', 575)));
  a.layer(0.6, () => a.at(0, -40, a.alt ? 0.25 : -0.25, () => { a.poly([[-40, 26], [-4, -6], [4, -6], [40, 26], [34, 30], [0, 4], [-34, 30]], '#9aa3ad', 582); a.circ(0, -6, 5, 5, '#3a3440', 583, 1.2); a.line([[0, -6], [0, -60]], 584, 2.2); a.circ(0, -62, 8, 8, '#d9a441', 585, 1.6); }));
  if (a.alt) a.layer(0.9, () => a.curve([[50, -70], [60, -80], [72, -76]], 586, 1.2));
};
// ── Strasbourg Clock: the great astronomical clock (the machine's core)
ART.kit_core = a => {
  a.layer(-1, () => a.nim('#f0d8a8'));
  a.layer(-0.3, () => { a.poly([[-70, 94], [-70, -60], [-40, -90], [40, -90], [70, -60], [70, 94]], '#c8a874', 590); a.poly([[-40, -90], [0, -110], [40, -90]], '#8a5a3a', 591, 1.6); });
  a.layer(0.2, () => { a.circ(0, -30, 34, 34, '#1d2b55', 592); for (let i = 0; i < 12; i++) { const an = i / 12 * Math.PI * 2; a.dot(Math.cos(an) * 28, -30 + Math.sin(an) * 28, 1.6, '#f9c74f'); }
    a.at(0, -30, a.alt ? 1.6 : 0.4, () => { a.line([[0, 0], [0, -26]], 593, 2); a.circ(0, -26, 4, 4, '#f9c74f', 594, 1); });
    a.at(0, -30, a.alt ? -0.6 : -2.1, () => a.line([[0, 0], [0, -18]], 595, 2.4));
    a.rect(-50, 18, 50, 60, 3, '#efe4cc', 596); a.circ(0, 39, 16, 16, '#f9c74f', 597, 1.6); a.circ(0, 39, 6, 6, '#3a3440', 598, 1); });
  a.layer(0.7, () => { const x = a.alt ? 30 : -30; a.at(x, 88, 0, () => kaPerson(a, { body: '#e53935', h: 0.5, arm: [0.3, -0.3] }), 0.8); a.rect(-60, 76, 60, 82, 1, '#8a5a3a', 599, 1.4); });   // a procession figure
};
// ── Ulugh Beg: the astronomer prince at his giant sextant in Samarkand
ART.kit_scientist = a => {
  a.layer(-1, () => a.nim('#c8c8f0'));
  a.layer(-0.6, () => { a.fillRect(-130, -100, 130, 20, rgba('#2b2350', 0.22)); for (let i = 0; i < 16; i++) a.dot(-120 + H2(i, 61) * 240, -90 + H2(i, 62) * 100, 1 + H2(i, 63), '#fff6d8'); if (a.alt) a.circ(80, -60, 10, 10, '#fff2a8', 610, 1.4); });
  a.layer(0.1, () => { a.curve([[-110, 90], [-110, 20], [-80, -40], [-30, -80]], 611, 5); a.curve([[-90, 90], [-90, 30], [-64, -26], [-20, -62]], 612, 2); for (let i = 0; i < 6; i++) a.line([[-110 + i * 2, 70 - i * 24], [-90 + i * 4, 66 - i * 22]], 613 + i, 1); });   // the meridian arc
  a.layer(0.5, () => a.at(40, 86, 0, () => kaPerson(a, { body: '#1565c0', h: 1.05, arm: [0.4, a.alt ? -2.3 : -1.2], head: () => { a.blob([[-14, -82], [-10, -96], [10, -96], [14, -82]], '#f5f5f5', 620, 1.6); a.circ(0, -98, 4, 4, '#e53935', 621, 1); } })));
  a.layer(0.8, () => a.at(66, -10, a.alt ? -0.6 : -0.2, () => { a.rect(-4, -28, 4, 10, 2, '#d9a441', 622, 1.4); a.circ(0, -30, 6, 6, '#d9a441', 623, 1.2); }));
};

// ── art/kits-b.js
// kits-b · the kit roles of the Religion, Food, Population and Politics roads, and the 8 test-seat commanders (🆕 Claude's, for Mook's tick)
// Each picture follows the obscure Wikipedia article its card is named after.
function kbFig(a, o) {                                                   // a plain figure, drawn standing on y = 0: o = { robe, skin, hat, arm }
  const R = o.robe || '#8a6a4a', SK = o.skin || '#f0c8a8';
  a.line([[-8, -2], [-9, -24]], 300, 3.2); a.line([[8, -2], [9, -24]], 301, 3.2);
  a.blob([[-18, -22], [-14, -60], [14, -60], [18, -22]], R, 302);
  a.blob([[-14, -56], [-26, -38], [-22, -32], [-12, -48]], R, 303);
  if (o.arm !== 'none') a.blob([[14, -56], [26, -38 - (o.raise || 0)], [22, -32 - (o.raise || 0)], [12, -48]], R, 304);
  a.circ(0, -72, 12, 12, SK, 305);
  a.dot(-4, -74, 1.6); a.dot(4, -74, 1.6); a.curve([[-4, -67], [0, -65], [4, -67]], 306, 1.2);
  if (o.hat === 'mitre') a.poly([[-10, -80], [0, -104], [10, -80]], '#f3eadb', 307, 2);
  if (o.hat === 'mitre') a.line([[0, -100], [0, -82]], 308, 1.4);
  if (o.hat === 'tall') a.rect(-9, -108, 9, -80, 4, '#e8e0cc', 309);
  if (o.hat === 'cap') a.blob([[-13, -78], [0, -88], [13, -78]], '#5a6a3a', 310, 1.8);
  if (o.hat === 'hood') a.blob([[-14, -66], [-12, -86], [0, -90], [12, -86], [14, -66]], R, 311, 1.8);
}
// ── ⛪ RELIGION
ART.kit_sigil = a => {                                                   // Sator Square: SATOR AREPO TENET OPERA ROTAS, carved in a stone
  a.layer(-1, () => a.nim('#e0c89a'));
  a.layer(0.2, () => { a.rect(-70, -72, 70, 72, 6, '#c9bca4', 320, 2.6);
    const W = ['SATOR', 'AREPO', 'TENET', 'OPERA', 'ROTAS'];
    W.forEach((w, r) => { for (let i = 0; i < 5; i++) uText(a.g, w[i], -48 + i * 24, -42 + r * 25, 15, { align: 'center', seed: 321 + r * 5 + i, col: '#3a3440', whim: 0.6 }); });
    if (a.alt) { a.g.save(); if (!ST.holo) { a.g.strokeStyle = rgba('#ffd34d', 0.9); a.g.lineWidth = 4; } a.rect(-62, -11, 62, 12, 3, null, 330, 2); a.rect(-12, -62, 12, 62, 3, null, 331, 2); a.g.restore(); }   // TENET, the cross, lit
  });
  if (a.alt) a.layer(0.7, () => { for (let i = 0; i < 6; i++) a.line([[Math.cos(i) * 80, Math.sin(i) * 70], [Math.cos(i) * 100, Math.sin(i) * 88]], 335 + i, 1.4); });
};
ART.kit_preacher = a => {                                                // Boy Bishop: a choirboy in a bishop's mitre and cope
  a.layer(-1, () => a.nim('#f3d68a'));
  a.layer(-0.4, () => { a.poly([[-90, 70], [-90, -40], [-60, -70], [-30, -40], [-30, 70]], '#d9cdb6', 340, 1.6); a.poly([[30, 70], [30, -40], [60, -70], [90, -40], [90, 70]], '#d9cdb6', 341, 1.6); });   // the arches
  a.layer(0.4, () => a.at(0, 94, 0, () => { kbFig(a, { robe: '#b3262e', hat: 'mitre', raise: a.alt ? 26 : 0 });
    a.line([[24, -40 - (a.alt ? 26 : 0)], [30, 0]], 342, 2.4); a.curve([[30, -2 - 0], [30, -50 - (a.alt ? 26 : 0)], [40, -56 - (a.alt ? 26 : 0)], [38, -46 - (a.alt ? 26 : 0)]], 343, 2.4);   // the crozier
    a.poly([[-14, -24], [14, -24], [10, -60], [-10, -60]], '#f3eadb', 344, 1.6); }, 1.4));
  if (a.alt) a.layer(0.8, () => { a.line([[46, -60], [92, 40]], 345, 3); a.star(96, 46, 12, '#ffd34d', 346); });   // the smite
};
ART.kit_acolyte = a => {                                                 // Thurifer: an altar server swinging a thurible
  a.layer(-1, () => a.nim('#d8c8ef'));
  const sw = a.alt ? 0.7 : -0.35;
  a.layer(0.3, () => a.at(-40, 94, 0, () => { kbFig(a, { robe: '#f3eadb', raise: 10 }); a.poly([[-16, -58], [16, -58], [12, -46], [-12, -46]], '#8a3a5a', 350, 1.4); }, 1.4));
  a.layer(0.3, () => a.at(-5, 34, sw, () => { a.line([[0, 0], [0, 56]], 351, 1.4); a.circ(0, 64, 11, 9, '#e0b84a', 352); a.poly([[-7, 56], [7, 56], [0, 48]], '#e0b84a', 353, 1.4); }));
  a.layer(0.9, () => { const sx = -5 + Math.sin(sw) * -64, sy = 34 + Math.cos(sw) * 64 - 40; for (let i = 0; i < 4; i++) a.puff(sx + i * 10 + 8, sy - 16 - i * 16, 7 + i * 2, 355 + i); });
};
ART.kit_revival = a => {                                                 // Tent Revival: a striped tent at night, lit from inside
  a.layer(-1, () => { a.fillRect(-130, -105, 130, 105, rgba('#1e2244', 0.55)); for (let i = 0; i < 16; i++) a.dot(-120 + H2(i, 61) * 240, -95 + H2(i, 62) * 90, 1 + H2(i, 63), '#fff6d8'); });
  a.layer(-0.2, () => a.fillRect(-130, 56, 130, 105, rgba('#3a5a3a', 0.7)));
  a.layer(0.3, () => {
    a.poly([[-80, 60], [-60, -20], [0, -60], [60, -20], [80, 60]], '#f3eadb', 360);
    for (let i = 0; i < 4; i++) a.poly([[-60 + i * 30, -20 + Math.abs(i - 1.5) * 0], [0, -60], [-45 + i * 30, -20]], '#d33440', 361 + i, 1);
    a.line([[0, -60], [0, -80]], 366, 2); a.poly([[0, -80], [16, -75], [0, -70]], '#d33440', 367, 1.4);
    a.poly([[-18, 60], [-14, 10], [14, 10], [18, 60]], a.alt ? '#ffd34d' : '#f6c460', 368);         // the door, lit
    if (a.alt) for (let i = 0; i < 3; i++) a.circ(-8 + i * 8, 46, 4, 4, '#3a3440', 369 + i, 1);  // the faithful come back
  });
  a.layer(0.8, () => { for (let i = 0; i < 5; i++) a.line([[-10 + i * 5, 10], [-40 + i * 20, -8 - (a.alt ? 10 : 0)]], 372 + i, 0.8); });
};
// ── 🌾 FOOD
ART.kit_farm = a => {                                                    // Chinampa: floating garden plots in a lake, willows at the corners
  a.layer(-1, () => a.nim('#b8e0b0'));
  a.layer(-0.5, () => { a.fillRect(-130, -20, 130, 105, rgba('#5a8fc8', 0.5)); waves(a, -6, 7, 42, 380); });
  a.layer(0.3, () => { for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) { const x = -96 + c * 66, y = 8 + r * 44;
    a.rect(x, y, x + 54, y + 26, 4, '#7a5a3a', 381 + r * 3 + c);
    for (let k = 0; k < 4; k++) a.circ(x + 8 + k * 13, y + 2, 5, 5 + (a.alt ? 4 : 0), '#4fae6a', 390 + k, 1.2);       // rows of crops (taller on the flip)
  } });
  a.layer(0.6, () => { for (const x of [-104, 104]) { a.line([[x, 70], [x, 0]], 400, 2.4); a.blob([[x - 20, 10], [x, -26], [x + 20, 10], [x + 14, 30], [x - 14, 30]], '#6fbf5a', 401); } });
  if (a.alt) a.layer(0.8, () => a.at(0, -40, 0, () => { a.blob([[-30, 0], [-22, -14], [22, -14], [30, 0], [20, 6], [-20, 6]], '#a8744f', 405); a.line([[-4, -14], [-6, -40]], 406, 1.6); }));   // a canoe of harvest
};
ART.kit_harvester = a => {                                               // Gleaner: picking up the last ears of grain
  a.layer(-1, () => a.nim('#ffd890'));
  a.layer(-0.4, () => { a.fillRect(-130, 30, 130, 105, rgba('#e2b85a', 0.6)); for (let i = 0; i < 18; i++) a.line([[-120 + i * 14, 34], [-118 + i * 14, 50]], 410, 1); });   // the stubble
  a.layer(0.3, () => a.at(-10, 80, 0, () => {
    const bend = a.alt ? 0 : 0.5;
    a.at(0, -24, bend, () => { a.blob([[-16, 0], [-12, -40], [12, -40], [16, 0]], '#7a6a9a', 411); a.circ(0, -50, 11, 11, '#f0c8a8', 412); a.blob([[-12, -54], [0, -66], [12, -54]], '#e8e0cc', 413, 1.6); a.blob([[12, -34], [30, -10], [26, -4], [10, -24]], '#7a6a9a', 414); });
    a.line([[-8, -2], [-8, -24]], 415, 3.2); a.line([[8, -2], [8, -24]], 416, 3.2);
  }));
  a.layer(0.7, () => { a.blob([[30, 60], [36, 30], [64, 30], [70, 60]], '#c9a06a', 417); for (let i = 0; i < (a.alt ? 7 : 4); i++) a.curve([[40 + i * 4, 32], [38 + i * 5, 10], [44 + i * 4, 0]], 418 + i, 1.4); });   // the basket of ears
};
ART.kit_seed = a => {                                                    // Seed Ball: clay and compost, rolled round a seed, sprouting
  a.layer(-1, () => a.nim('#c8e8a0'));
  a.layer(-0.3, () => a.fillRect(-130, 50, 130, 105, rgba('#8a6a4a', 0.55)));
  a.layer(0.4, () => { a.circ(0, 26, 36, 32, '#b07a52', 430, 2.6, 0.08); for (let i = 0; i < 9; i++) a.dot(-22 + H2(i, 431) * 44, 10 + H2(i, 432) * 34, 1.8, '#5a3a24');
    const h = a.alt ? 70 : 26; a.curve([[0, -4], [-2, -4 - h * 0.5], [4, -4 - h]], 433, 2.4);
    a.blob([[2, -4 - h], [24, -14 - h], [12, -2 - h]], '#4fae6a', 434, 1.6); a.blob([[2, -4 - h * 0.7], [-22, -10 - h * 0.7], [-10, h * -0.7 + 2]], '#4fae6a', 435, 1.6);
    if (a.alt) a.circ(6, -10 - h, 8, 8, '#ffd34d', 436, 1.4); });
};
// ── 👥 POPULATION
ART.kit_villager = a => {                                                // Crofter: a small stone croft, a crofter at the gate
  a.layer(-1, () => a.nim('#c8dcc0'));
  a.layer(-0.5, () => { a.curve([[-140, 30], [-60, 10], [40, 20], [140, 6]], 440, 1.4); a.fillRect(-130, 30, 130, 105, rgba('#7fae6a', 0.5)); });
  a.layer(0.1, () => { a.rect(-10, -14, 90, 40, 3, '#b9b0a0', 441); for (let i = 0; i < 6; i++) a.line([[-6 + i * 16, -6 + (i % 2) * 18], [6 + i * 16, -6 + (i % 2) * 18]], 442, 1); a.poly([[-18, -12], [40, -50], [98, -12]], '#c9a85a', 443); a.rect(30, 10, 48, 40, 2, '#5a3a24', 444); a.line([[70, -40], [70, -60]], 445, 3); });   // the croft
  a.layer(0.4, () => a.at(-62, 94, 0, () => { kbFig(a, { robe: '#5a7a9a', hat: 'cap' }); a.line([[22, -36], [26, 0]], 446, 2); }, 1.3));
  if (a.alt) a.layer(0.7, () => { a.at(-96, 90, 0, () => kbFig(a, { robe: '#9a5a7a' }), 0.7); a.at(-20, 92, 0, () => kbFig(a, { robe: '#6a9a5a' }), 0.65); });   // the crowd comes
};
ART.kit_guard = a => {                                                   // Hayward: the village officer who guards the hedges and fences
  a.layer(-1, () => a.nim('#c8e0b0'));
  a.layer(-0.3, () => { a.fillRect(-130, 40, 130, 105, rgba('#7fae6a', 0.55)); for (let i = 0; i < 7; i++) a.blob([[-130 + i * 40, 40], [-118 + i * 40, 4], [-96 + i * 40, 2], [-90 + i * 40, 40]], '#4f8a4a', 450 + i); });   // the hedge
  a.layer(0.2, () => { for (let i = 0; i < 5; i++) a.line([[-110 + i * 52, 70], [-110 + i * 52, 38]], 460 + i, 2.4); a.line([[-116, 46], [104, 46]], 466, 2); a.line([[-116, 60], [104, 60]], 467, 2); });   // the fence
  a.layer(0.5, () => a.at(30, 96, 0, () => { kbFig(a, { robe: '#3a5a7a', hat: 'cap', raise: a.alt ? 30 : 0 }); a.line([[24, -36 - (a.alt ? 30 : 0)], [30, 6]], 468, 2.2); a.circ(28, -40 - (a.alt ? 30 : 0), 4, 4, '#e0b84a', 469, 1.2); }, 1.3));   // his staff
  if (a.alt) a.layer(0.8, () => { a.at(-70, 70, 0, () => { a.circ(0, 0, 14, 10, '#f3eadb', 470); a.circ(14, -6, 6, 6, '#f3eadb', 471); a.line([[-6, 8], [-6, 18]], 472, 1.6); a.line([[6, 8], [6, 18]], 473, 1.6); }); });   // a stray sheep, stopped
};
// ── 🏛️ POLITICS
function kbHorse(a, col) {                                               // a small horse, standing on y = 0
  a.blob([[-30, -24], [-26, -44], [22, -44], [30, -26], [22, -18], [-24, -18]], col, 480);
  a.blob([[20, -40], [30, -64], [42, -60], [34, -36]], col, 481);
  for (const x of [-22, -12, 12, 22]) a.line([[x, -20], [x, 0]], 482, 2.6);
  a.curve([[-30, -34], [-42, -20], [-40, -8]], 483, 2);
}
ART.kit_envoy = a => {                                                   // Missus Dominicus: a pair of the king's envoys, riding out
  a.layer(-1, () => a.nim('#e0d0a0'));
  a.layer(-0.4, () => { a.curve([[-140, 64], [-40, 50], [60, 58], [140, 46]], 490, 1.4); a.fillRect(-130, 64, 130, 105, rgba('#b8a070', 0.45)); });
  [[-50, 0.82, '#8a5a3a', '#3a5a9a'], [40, 0.9, '#5a4a40', '#9a3a3a']].forEach(([x, s, horse, robe], i) => a.layer(0.2 + i * 0.4, () => a.at(x + (a.alt ? 18 : 0), 80, 0, () => {
    kbHorse(a, horse); a.at(2, -40, 0, () => kbFig(a, { robe, hat: i ? 'hood' : 'cap', arm: 'none' }), 0.7);
  }, s)));
  if (a.alt) a.layer(0.9, () => a.at(-6, -60, 0.1, () => { a.rect(-22, -12, 22, 12, 2, '#f3eadb', 495); a.circ(0, 8, 5, 5, '#c62828', 496, 1.2); }));   // the capitulary, sealed
};
ART.kit_diplomat = a => {                                                // Dragoman: an interpreter-diplomat, tall hat, scrolls
  a.layer(-1, () => a.nim('#a8d0d8'));
  a.layer(-0.4, () => { a.blob([[-110, 60], [-110, -10], [-80, -50], [-50, -10], [-50, 60]], '#d9cdb6', 500, 1.6); a.circ(-80, -58, 8, 8, '#d9cdb6', 501, 1.4); });   // a dome
  a.layer(0.4, () => a.at(14, 94, 0, () => { kbFig(a, { robe: '#2f6f6a', hat: 'tall', raise: a.alt ? 20 : 0 }); a.poly([[-18, -24], [18, -24], [14, -30], [-14, -30]], '#e0b84a', 502, 1.2);
    a.at(26, -40 - (a.alt ? 20 : 0), 0.3, () => { a.rect(-4, -14, 4, 14, 2, '#f3eadb', 503, 1.4); a.circ(0, -15, 4, 2, '#c9a06a', 504, 1.2); }); }, 1.2));
  a.layer(0.8, () => { a.at(-50, 60, -0.2, () => { a.rect(-14, -8, 14, 8, 3, '#f3eadb', 505); a.line([[-8, -2], [8, -2]], 506, 1); }); if (a.alt) { a.blob([[48, -66], [100, -66], [100, -40], [70, -40], [62, -30], [62, -40], [48, -40]], CREAM, 507, 1.6); uText(a.g, 'SALAAM · CIAO', 74, -48, 7, { align: 'center', seed: 508, col: '#3a3440', whim: 0.5 }); } });
};
// ── the 8 test-seat commanders: a hologram figure in its road's colour, holding the road's emblem; the big move faint behind
const KB_CMD = {
  kInd: { col: '#c0392b', nim: '#f2b0a8', big: 'holyleague', emblem: 'hammer' }, kEco: { col: '#d4a017', nim: '#f6e0a0', big: 'canopy', emblem: 'coin' }, kSci: { col: '#1f9bb0', nim: '#a8e0ea', big: 'moodpink', emblem: 'gear' },
  kRel: { col: '#7b4fa0', nim: '#d8c0ef', big: 'holyleague', emblem: 'hex' }, kFood: { col: '#5a9a3a', nim: '#c8e8b0', big: 'canopy', emblem: 'wheat' }, kPop: { col: '#e07a2a', nim: '#f8d0a8', big: 'multiply', emblem: 'crowd' },
  kPol: { col: '#6a7a8a', nim: '#d0d8e0', big: 'canopy', emblem: 'scroll' }, kEcoInd: { col: '#b8862a', nim: '#f0dca8', big: 'canopy', emblem: 'coinhammer' },
};
function kbEmblem(a, e) {
  if (e === 'hammer' || e === 'coinhammer') a.at(e === 'coinhammer' ? 8 : 0, 0, -0.5, () => { a.line([[0, 0], [0, -34]], 520, 3); a.rect(-12, -44, 12, -32, 2, '#7a7f8a', 521); });
  if (e === 'coin' || e === 'coinhammer') a.at(e === 'coinhammer' ? -14 : 0, -18, 0, () => { a.circ(0, 0, 13, 13, '#f9c74f', 522); a.circ(0, 0, 8, 8, null, 523, 1.2); });
  if (e === 'gear') { const P = []; for (let i = 0; i < 16; i++) { const an = i / 16 * Math.PI * 2, r = i % 2 ? 11 : 16; P.push([Math.cos(an) * r, -18 + Math.sin(an) * r]); } a.poly(P, '#aab3c0', 524); a.circ(0, -18, 5, 5, CREAM, 525, 1.2); }
  if (e === 'hex') { const P = []; for (let i = 0; i < 6; i++) P.push([Math.cos(i * Math.PI / 3) * 15, -18 + Math.sin(i * Math.PI / 3) * 15]); a.poly(P, '#e0b84a', 526); }
  if (e === 'wheat') for (let i = -1; i <= 1; i++) { a.line([[i * 4, 0], [i * 8, -34]], 527 + i, 1.8); for (let k = 0; k < 3; k++) a.circ(i * 8 + 3, -30 + k * 7, 3, 5, '#e2b85a', 530 + k, 1); }
  if (e === 'scroll') { a.rect(-6, -40, 6, 0, 3, '#f3eadb', 534); a.circ(0, -40, 7, 3, '#c9a06a', 535, 1.2); a.circ(0, 0, 7, 3, '#c9a06a', 536, 1.2); }
  if (e === 'crowd') for (let i = 0; i < 3; i++) a.at(-14 + i * 14, 0, 0, () => { a.circ(0, -26, 5, 5, CREAM, 537 + i, 1.2); a.blob([[-6, 0], [-5, -20], [5, -20], [6, 0]], '#e8b07a', 540 + i, 1.2); });
}
function kbBig(a, big, col) {                                            // the road's big move, drawn small
  if (big === 'holyleague') for (let i = 0; i < 3; i++) a.at(-40 + i * 40, 10 - (i % 2) * 14, 0, () => { a.poly([[-14, 0], [14, 0], [10, 8], [-10, 8]], '#f3eadb', 550 + i, 1.4); for (let k = 0; k < 3; k++) a.poly([[-10 + k * 8, 0], [-6 + k * 8, -18 - (k % 2) * 8], [-2 + k * 8, 0]], '#f3eadb', 553 + k, 1.2); });
  if (big === 'canopy') { a.curve([[-70, 30], [-60, -30], [0, -56], [60, -30], [70, 30]], 560, 2.4); for (let i = 0; i < 7; i++) { const an = Math.PI + i / 6 * Math.PI; a.circ(Math.cos(an) * 64, -4 + Math.sin(an) * 50, 9, 9, '#6fbf5a', 561 + i, 1.2); } }
  if (big === 'moodpink') { a.circ(0, -10, 64, 56, rgba('#ff8fc8', 0.35), 570, 1.6); for (let i = 0; i < 5; i++) { const P = []; for (let k = 0; k < 6; k++) P.push([-40 + i * 20 + Math.cos(k * Math.PI / 3) * 8, -14 + (i % 2) * 18 + Math.sin(k * Math.PI / 3) * 8]); a.poly(P, null, 571 + i, 1); } }
  if (big === 'multiply') for (let i = 0; i < 4; i++) a.at(-60 + i * 40, 30, 0, () => { a.circ(0, -40, 7, 7, CREAM, 580 + i, 1.2); a.blob([[-9, 0], [-7, -30], [7, -30], [9, 0]], col, 584 + i, 1.2); });
}
for (const key in KB_CMD) {
  const K = KB_CMD[key];
  ART['kitcmd_' + key] = a => {
    a.layer(-1, () => a.nim(K.nim));
    if (!a.alt) a.layer(-0.7, () => { a.g.save(); a.g.globalAlpha = ST.holo ? 0.5 : 0.35; a.at(54, -20, 0, () => kbBig(a, K.big, K.col), 0.8); a.g.restore(); });
    a.layer(0.35, () => a.at(-34, 96, 0, () => {
      kbFig(a, { robe: K.col, skin: mix(K.col, '#ffffff', 0.55), raise: a.alt ? 34 : 14 });
      a.at(28, -44 - (a.alt ? 34 : 14), 0, () => kbEmblem(a, K.emblem));
    }, 1.4));
    if (a.alt) a.layer(0.8, () => a.at(50, 40, 0, () => kbBig(a, K.big, K.col), 0.7));
  };
}

// ── art/mix.js
// mix: the mixed-deck combos (11-23) and Armillaria, Mush's wild fungus. 🆕 every picture is Claude's, for Mook's tick (mix.ticks.md).
// Each fused card shows BOTH decks that made it. Second picture (a.alt) = the combo's moment.

// ── Armillaria: the honey fungus. A cluster of honey caps above, and under the soil its threads join three squares together
ART.mycelium = a => {
  a.layer(-1, () => a.nim('#f2d48a'));
  a.layer(-0.4, () => { a.fillRect(-130, 10, 130, 110, rgba('#6b4a32', 0.8)); a.curve([[-130, 12], [-50, 6], [40, 14], [130, 8]], 1201, 1.6); });   // the soil line
  a.layer(0, () => {                                                                                    // the threads (rhizomorphs), black bootlaces under the soil
    const glow = a.alt ? '#ffe08a' : '#2a1c14';
    for (let i = 0; i < 5; i++) a.curve([[-110 + i * 6, 30 + i * 9], [-50, 20 + i * 12], [10, 44 - i * 4], [60, 30 + i * 8], [118, 40 + i * 6]], 1210 + i, a.alt ? 2.2 : 1.6);
    for (const x of [-84, 0, 84]) { a.rect(x - 20, 52, x + 20, 92, 2, a.alt ? rgba('#ffe08a', 0.55) : rgba('#3a2a20', 0.5), 1220 + x, 1.4); if (a.alt) a.dot(x, 72, 4, glow); }   // three squares, joined
  });
  a.layer(0.4, () => {                                                                                  // the cluster of honey caps
    const caps = [[-34, -6, 1.1], [-6, -22, 1.35], [24, -4, 1.05], [46, -18, 0.85], [-56, -16, 0.8]];
    caps.forEach(([x, y, s], i) => a.at(x, y, (i - 2) * 0.08, () => {
      a.blob([[-5, 18], [-4, -8], [4, -8], [5, 18]], '#f3e2c0', 1230 + i);                                // stem
      a.blob([[-7, -2], [7, -2], [6, 2], [-6, 2]], '#e8d6a8', 1240 + i, 1.2);                             // the ring on the stem
      a.blob([[-20, -6], [-14, -18], [0, -22], [14, -18], [20, -6]], '#d99a3a', 1250 + i);                // honey cap
      for (let k = 0; k < 4; k++) a.dot(-10 + k * 7, -14 + (k % 2) * 3, 1.4, '#7a4a1a');
    }, s));
  });
};

// ── The Misadventure: Mook's beat-up frigate, with Mush's toadstool guard crewing the deck (Mook + Mush)
ART.misadventure = a => {
  a.layer(-1, () => a.nim('#ffd7a0'));
  a.layer(-0.6, () => { planet(a, -86, -54, 22, '#7fb3e0', 1301); a.star(70, -70, 6, '#ffe08a', 1302); a.star(100, -40, 4, '#ffe08a', 1303); });
  a.layer(0.1, () => a.at(-6, 34, a.alt ? -0.08 : 0, () => {
    ship(a, { len: 74, ports: 3, patches: true, masts: [-10, 34], sailCols: ['#f3eadb', '#e0503a'], flagCol: '#e53935' });
    mgToadstool(a, -40, 0, 0.9, 1310); mgToadstool(a, 6, 0, 0.75, 1312); mgToadstool(a, 50, 0, 0.85, 1314);   // the toadstool guard on deck
  }, 0.95));
  a.layer(0.5, () => { a.fillRect(-130, 64, 130, 110, rgba('#3a5a8a', 0.5)); waves(a, 72, 7, 42, 1320); });
  if (a.alt) a.layer(0.9, () => { for (let i = 0; i < 6; i++) { const an = -2.6 + i * 0.35; a.dot(-6 + Math.cos(an) * 96, 20 + Math.sin(an) * 70, 3, '#f9d38a'); } a.circ(96, -10, 10, 10, '#f9d38a', 1330); });   // spores and a cannonball: it reaches any lane
};

// ── Libertalia: the free pirate republic. A flag with no king on it, a rat in a tricorne at the gate (Mook + Gil)
ART.libertalia = a => {
  a.layer(-1, () => a.nim('#ffe2a8'));
  a.layer(-0.5, () => { a.blob([[-130, 40], [-70, 8], [0, 0], [70, 10], [130, 40]], '#9fcf72', 1401); });   // the island
  a.layer(-0.1, () => {                                                                                // the stockade town
    for (let i = 0; i < 9; i++) { const x = -110 + i * 26; a.poly([[x, 46], [x, 6], [x + 6, -2], [x + 12, 6], [x + 12, 46]], '#b5814f', 1410 + i, 1.6); }
    a.rect(-24, 6, 24, 46, 2, '#3a2618', 1420); a.line([[0, -90], [0, 6]], 1421, 2.2);
    a.blob([[0, -90], [52, -84], [46, -70], [54, -56], [0, -60]], '#fdfcf5', 1422);                     // the white flag of Libertalia: no king
    a.line([[14, -80], [34, -66]], 1423, 1.6); a.line([[34, -80], [14, -66]], 1424, 1.6);
  });
  a.layer(0.4, () => { a.fillRect(-130, 50, 130, 110, rgba('#2f6f9a', 0.55)); waves(a, 66, 7, 42, 1430); });
  a.layer(0.6, () => a.at(-74, 50, 0, () => {                                                         // a rat at the gate, in a tricorne
    a.blob([[-14, 0], [-16, -26], [0, -36], [16, -26], [14, 0]], MG_RAT, 1440); a.circ(0, -44, 12, 10, MG_RAT, 1441);
    a.circ(-10, -54, 5, 5, '#e8b0a0', 1442); a.circ(10, -54, 5, 5, '#e8b0a0', 1443); a.dot(-4, -46, 1.8); a.dot(4, -46, 1.8);
    a.poly([[-16, -56], [0, -66], [16, -56], [0, -60]], INK, 1444, 1.4); a.curve([[14, -6], [30, 4], [40, -8]], 1445, 1.6);
  }));
  if (a.alt) a.layer(0.9, () => { for (let i = 0; i < 2; i++) a.at(54 + i * 34, -30 + i * 14, 0, () => { a.circ(0, 0, 14, 14, '#f9c74f', 1450 + i); a.g.save(); a.g.fillStyle = ST.holo ? HOLO : INK; a.g.font = 'bold 13px ' + NUMFONT; a.g.textAlign = 'center'; a.g.textBaseline = 'middle'; a.g.fillText('+1', 0, 1); a.g.restore(); }); });
};

// ── Dilmun: the garden at the start of the world, where nothing gets old. Mush's turrets grow out of Harriet's shell-terraces (Mush + Tortimer)
ART.dilmun = a => {
  a.layer(-1, () => a.nim('#c8eaa0'));
  a.layer(-0.5, () => { a.circ(70, -64, 18, 18, '#ffe08a', 1501); });
  a.layer(-0.1, () => {                                                                                // three terraces, like a tortoise shell
    [[-110, 110, 50, '#7fb069'], [-80, 80, 24, '#8bc34a'], [-48, 48, 0, '#a3d06a']].forEach(([x0, x1, y, c], i) => { a.rect(x0, y, x1, y + 26, 6, c, 1510 + i); for (let k = 0; k < 5; k++) a.dot(x0 + 14 + k * (x1 - x0 - 28) / 4, y + 13, 2.2, '#4a7a3a'); });
    a.blob([[-20, 0], [-14, -26], [14, -26], [20, 0]], '#d9c9a8', 1520);                                 // the spring house
    a.poly([[-24, -26], [0, -44], [24, -26]], '#a8442a', 1521, 1.6);
  });
  a.layer(0.3, () => { mgToadstool(a, -92, 50, 1, 1530); mgToadstool(a, 92, 50, 1, 1532); mgToadstool(a, -62, 24, 0.8, 1534); mgToadstool(a, 62, 24, 0.8, 1536); });
  a.layer(0.6, () => { a.fillRect(-130, 76, 130, 110, rgba('#5aa0c8', 0.6)); waves(a, 84, 7, 42, 1540); });
  if (a.alt) a.layer(0.9, () => { for (let i = 0; i < 3; i++) { const x = -50 + i * 50; a.circ(x, -70 + (i % 2) * 12, 9, 9, ['#e53935', '#f9a825', '#2e7d32'][i], 1550 + i, 1.6); a.curve([[x, -60 + (i % 2) * 12], [x + 6, -46], [x, -34]], 1560 + i, 1.4); } });   // rings grow back, like fruit
};

// ── Uraniborg: Tycho's castle of the heavens. Rose's lizards at the great quadrant, Leo's stork on the dome (Rose + Leo)
ART.uraniborg = a => {
  a.layer(-1, () => a.nim('#b8c8f0'));
  a.layer(-0.7, () => { for (let i = 0; i < 9; i++) a.star(-120 + H2(i, 7) * 240, -96 + H2(i, 9) * 50, 2 + H2(i, 3) * 3, '#ffe08a', 1601 + i); });
  a.layer(-0.1, () => {
    a.rect(-60, -6, 60, 60, 2, '#d98f6a', 1610); for (let i = 0; i < 4; i++) a.rect(-48 + i * 28, 10, -36 + i * 28, 30, 4, '#3a3440', 1611 + i, 1.2);
    a.blob([[-36, -6], [-30, -40], [0, -56], [30, -40], [36, -6]], '#e8d6a8', 1620);                    // the dome
    a.line([[0, -56], [0, -70]], 1621, 1.6); a.poly([[0, -70], [-6, -66], [0, -62]], '#e53935', 1622, 1);
    a.at(-18, -60, 0, () => { a.blob([[-8, 0], [-10, -14], [6, -16], [10, -4], [4, 2]], CREAM, 1623); a.line([[10, -10], [24, -8]], 1624, 1.4); a.line([[-2, 0], [-2, 10]], 1625, 1.2); a.line([[3, 0], [3, 10]], 1626, 1.2); a.dot(4, -10, 1.4); });   // Leo's stork on the dome
  });
  a.layer(0.4, () => a.at(84, 56, 0, () => {                                                         // the mural quadrant, a lizard reading it
    a.curve([[-40, 0], [-36, -40], [0, -60]], 1630, 3); a.line([[-40, 0], [0, 0]], 1631, 2); a.line([[-40, 0], [-6, -54]], 1632, 1.6);
    a.blob([[-20, -6], [-14, -22], [-4, -24], [0, -10], [-6, 0]], '#c2185b', 1633); a.circ(-6, -28, 7, 6, '#c2185b', 1634); a.dot(-4, -30, 1.4); a.curve([[-20, -4], [-34, 4], [-40, -6]], 1635, 1.6);
  }));
  a.layer(0.6, () => { a.fillRect(-130, 60, 130, 110, rgba('#7fb069', 0.6)); });
  if (a.alt) a.layer(0.9, () => { for (let i = 0; i < 2; i++) a.at(-80 + i * 22, -20 - i * 8, -0.2 + i * 0.3, () => a.rect(-10, -14, 10, 14, 2, PAPER, 1640 + i, 1.4)); });   // one more card a turn
};

// ── Palais des Papes: the papal palace at Avignon, with Finley's auditors filing in at the gate (Bronconius + Finley)
ART.palais = a => {
  a.layer(-1, () => a.nim('#d8b8f0'));
  a.layer(-0.2, () => {
    a.rect(-100, -30, 100, 56, 2, '#e6d6b8', 1701);
    for (const x of [-100, -44, 44, 84]) { a.rect(x, -64, x + 18, 56, 1, '#d9c6a0', 1710 + x, 1.6); for (let k = 0; k < 3; k++) a.rect(x + 2 + k * 6, -70, x + 6 + k * 6, -64, 0, '#d9c6a0', 1720 + x + k, 1); }
    a.rect(-16, 16, 16, 56, 10, '#3a3440', 1730); for (let i = 0; i < 3; i++) a.rect(-70 + i * 50, -6, -60 + i * 50, 14, 5, '#3a3440', 1731 + i, 1.2);
    a.at(0, -50, 0, () => { const P = []; for (let i = 0; i < 6; i++) P.push([Math.cos(i / 6 * Math.PI * 2) * 14, Math.sin(i / 6 * Math.PI * 2) * 14]); a.poly(P, '#f6c744', 1740); });   // the Order's gold hexagon
  });
  a.layer(0.4, () => { for (let i = 0; i < 4; i++) a.at(-80 + i * 22, 74, 0, () => kaPerson(a, { body: '#5f6f86', skin: '#f0c8a0', h: 0.55, arm: [0.3, -0.3] }), 0.8); });   // auditors in grey, in a queue
  a.layer(0.6, () => { a.fillRect(-130, 66, 130, 110, rgba('#b5a080', 0.5)); });
  if (a.alt) a.layer(0.9, () => { a.at(70, -70, 0, () => { a.line([[0, 0], [-30, 40]], 1750, 3); a.line([[-30, 40], [-22, 56]], 1751, 3); a.star(0, 0, 12, '#ffe08a', 1752); }); });   // SMITE
};

// ── Hamelin: the piper's town. The Fhat's top hat plays the pipe, Gil's rats follow it through an empty gate (The Fhat + Gil)
ART.hamelin = a => {
  a.layer(-1, () => a.nim('#f0c8e0'));
  a.layer(-0.5, () => { for (let i = 0; i < 5; i++) { const x = -120 + i * 50; a.rect(x, -20 - (i % 2) * 14, x + 40, 40, 1, ['#e6c79a', '#c9d8e0', '#e8b0a0', '#d9c9e8', '#f0dca0'][i], 1801 + i); a.poly([[x - 4, -20 - (i % 2) * 14], [x + 20, -52 - (i % 2) * 14], [x + 44, -20 - (i % 2) * 14]], '#a8442a', 1810 + i, 1.6); } });
  a.layer(0.1, () => { a.fillRect(-130, 40, 130, 110, rgba('#b5a080', 0.7)); });
  a.layer(0.4, () => a.at(-60, 64, 0, () => {                                                         // the hat, walking, with a pipe
    a.rect(-16, -52, 16, -14, 2, INK, 1820); a.rect(-26, -16, 26, -10, 3, INK, 1821); a.rect(-16, -24, 16, -18, 0, '#c2185b', 1822, 1);
    a.line([[-6, -10], [-10, 4]], 1823, 2.6); a.line([[6, -10], [10, 4]], 1824, 2.6);
    a.line([[14, -34], [42, -46]], 1825, 2.4); for (let i = 0; i < 3; i++) a.curve([[48 + i * 8, -52 - i * 6], [52 + i * 8, -60 - i * 6], [56 + i * 8, -54 - i * 6]], 1826 + i, 1.4);   // the tune
  }));
  a.layer(0.6, () => { const n = a.alt ? 6 : 4; for (let i = 0; i < n; i++) a.at(-16 + i * 26 + (a.alt ? -10 : 0), 72 - (i % 2) * 4, 0, () => { a.blob([[-10, 0], [-8, -12], [8, -12], [12, 0]], MG_RAT, 1840 + i); a.circ(12, -10, 6, 5, MG_RAT, 1850 + i); a.dot(14, -11, 1.2); a.curve([[-10, -2], [-22, -8], [-28, 0]], 1860 + i, 1.2); }); });   // rats in a line
};

// ── art/mush-gil.js
// ── 🍄 QUEEN BLOOM'S MUSHROOMS (Mush) · 🐀 FLIP CAPONE'S RATS (Gil) · Port Royal (Mook's combo)  ── group mush-gil
const MG_OR = '#ef8a3a', MG_OR2 = '#c9661f', MG_CAP = '#e0503a', MG_SPOT = '#fdfcf5', MG_STEM = '#f3e2c0', MG_RAT = '#8a8f99', MG_RAT2 = '#5c606b';
function mgToadstool(a, x, y, s, seed, fill) {                         // a little toadstool: red cap with white spots on a pale stem
  a.at(x, y, 0, () => {
    a.blob([[-8, 0], [-7, -16], [7, -16], [8, 0]], MG_STEM, seed);
    a.blob([[-18, -14], [-14, -28], [0, -34], [14, -28], [18, -14]], fill || MG_CAP, seed + 1);
    a.dot(-7, -24, 2.6, MG_SPOT); a.dot(5, -27, 2.2, MG_SPOT); a.dot(11, -19, 1.8, MG_SPOT);
  }, s);
}
function mgCanopy(a, y, seed) {                                          // the fungal jungle: a row of round caps on stalks
  for (let i = 0; i < 9; i++) { const x = -130 + i * 33, h = 18 + H2(i, seed) * 22;
    a.line([[x, y + 30], [x + 2, y - h + 6]], seed + i, 3);
    a.blob([[x - 20, y - h + 8], [x - 12, y - h - 8], [x + 12, y - h - 8], [x + 20, y - h + 8]], i % 2 ? '#7bbf6a' : '#a3d06a', seed + 20 + i); }
}
function mgSporeRing(a, x, y, r, seed, col) { a.circ(x, y, r, r * 0.4, null, seed, 1.4); for (let i = 0; i < 5; i++) { const an = i / 5 * Math.PI * 2 + seed; a.dot(x + Math.cos(an) * r, y + Math.sin(an) * r * 0.4, 1.8, col || '#f9d38a'); } }

// QUEEN BLOOM: the chanterelle queen, morel tiara, ruff, ridged gown, lichen cape (🎬 the hologram design, ep03-design-holograms.jpg)
ART.bloom = a => {
  a.layer(-1, () => a.nim('#ffc98a'));
  const canopy = () => { a.blob([[-120, 60], [-110, -10], [-60, -60], [0, -76], [60, -60], [110, -10], [120, 60], [96, 62], [86, 0], [50, -40], [0, -54], [-50, -40], [-86, 0], [-96, 62]], '#9fcf72', 300);
    for (let i = 0; i < 7; i++) { const an = Math.PI + (i + 0.5) / 7 * Math.PI; a.circ(Math.cos(an) * 98, 10 + Math.sin(an) * 72, 10, 7, '#f6d98a', 301 + i); } };
  if (!a.alt) a.layer(-0.7, () => { a.g.save(); a.g.globalAlpha = ST.holo ? 0.5 : 0.38; canopy(); a.g.restore(); });   // CANOPY, faint behind her
  a.layer(0.35, () => a.at(0, -6, 0, () => {
    a.blob([[-16, 2], [-46, 80], [-64, 92], [60, 92], [44, 80], [16, 2]], MG_OR2, 310);                     // the lichen cape, dragging
    a.blob([[-12, 4], [-34, 88], [34, 88], [12, 4]], MG_OR, 311);                                           // the ridged gown
    for (let i = -2; i <= 2; i++) a.line([[i * 4, 10], [i * 12, 86]], 312 + i, 1.2);
    a.blob([[-12, 6], [-26, 30], [-30, 44], [-22, 40], [-12, 22]], MG_OR, 317);                             // arm, hand on hip
    a.blob([[12, 6], [28, -4], [36, -22], [30, -24], [22, -8], [12, 2]], MG_OR, 318);                       // arm up, waving
    a.circ(33, -26, 5, 5, MG_OR, 319, 1.6);
    a.blob([[-22, 0], [-14, -8], [0, -4], [14, -8], [22, 0], [14, 8], [0, 4], [-14, 8]], '#fde6c0', 320, 1.8);   // the ruff
    a.blob([[-18, -6], [-20, -28], [-10, -44], [10, -44], [20, -28], [18, -6]], MG_OR, 321);               // the face (the chanterelle)
    for (const s of [-1, 1]) { a.circ(s * 7, -22, 5.5, 5.5, CREAM, 322 + s, 1.6); a.dot(s * 7, -22, 1.8); a.line([[s * 4, -29], [s * 10, -31]], 324, 1); }
    a.curve([[-5, -12], [0, -9], [5, -12]], 325, 1.3);
    a.blob([[-12, -42], [-10, -62], [0, -80], [10, -62], [12, -42]], '#c9a26a', 326);                       // the morel tiara
    for (let r = 0; r < 3; r++) for (let c = -1; c <= 1; c++) a.circ(c * 5, -50 - r * 9, 2.2, 3, '#7a5a3a', 327 + r * 3 + c, 0.8);
  }, 1.12));
  if (a.alt) a.layer(0.8, () => { a.g.save(); a.at(0, 0, 0, canopy, 1); a.g.restore(); });                   // CANOPY: it closes over her
};

// TOADSTOOL GUARD: plump crossbow toadstools
function mgGuard(a, x, y, s, shoot, seed) {
  a.at(x, y, 0, () => {
    a.blob([[-20, 40], [-24, 0], [-14, -14], [14, -14], [24, 0], [20, 40]], MG_STEM, seed);                 // the plump stem body
    for (const k of [-1, 1]) { a.dot(k * 8, -4, 2, INK); }
    a.curve([[-6, 8], [0, 12], [6, 8]], seed + 1, 1.3);
    a.blob([[-36, -10], [-28, -34], [0, -46], [28, -34], [36, -10]], MG_CAP, seed + 2);                      // the cap
    a.dot(-16, -26, 4, MG_SPOT); a.dot(4, -36, 3.4, MG_SPOT); a.dot(20, -22, 3, MG_SPOT);
    a.at(14, 16, shoot ? -0.1 : 0.35, () => {                                                                  // the crossbow
      a.line([[0, 0], [34, 0]], seed + 3, 3.2);
      a.curve([[30, -14], [36, 0], [30, 14]], seed + 4, 2.4); a.line([[30, -14], [26, 0], [30, 14]], seed + 5, 0.9);
      if (!shoot) a.line([[24, 0], [42, 0]], seed + 6, 1.8);
    });
    a.line([[-20, 40], [-20, 52]], seed + 7, 3); a.line([[20, 40], [20, 52]], seed + 8, 3);
  }, s);
}
ART.toadstool = a => {
  a.layer(-1, () => a.nim('#f7b0a0'));
  a.layer(-0.4, () => { a.fillRect(-130, 58, 130, 110, rgba('#7bbf6a', 0.45)); a.curve([[-130, 58], [-40, 52], [60, 56], [130, 52]], 330, 1.4); });
  a.layer(0.2, () => mgGuard(a, 58, 10, 0.78, a.alt, 340));
  a.layer(0.6, () => mgGuard(a, -46, 20, 1, a.alt, 350));
  if (a.alt) a.layer(0.9, () => { for (const [x, y] of [[48, 26], [112, 14]]) { a.line([[x, y], [x + 34, y - 6]], 360, 2); a.poly([[x + 34, y - 10], [x + 44, y - 7], [x + 34, y - 2]], '#e6e9ef', 361, 1.2); } });
};

// MUSHROOM FIGHTERS: small mushroom-shaped ships, cap first, out of the fungal jungle
function mgFighter(a, x, y, rot, s, seed) {
  a.at(x, y, rot, () => {
    a.blob([[-6, 4], [-26, 0], [-34, 8], [-26, 14], [-6, 12]], MG_STEM, seed);                                // the stem, a fuselage
    a.blob([[-8, -12], [8, -16], [20, -4], [20, 8], [8, 20], [-8, 18], [-4, 4]], '#c9661f', seed + 1);        // the cap, nose first
    a.dot(8, -4, 2.2, MG_SPOT); a.dot(12, 8, 1.8, MG_SPOT);
    for (let i = 0; i < 3; i++) a.circ(-40 - i * 9, 8 + (i % 2 ? 2 : -2), 3 + i, 3 + i, '#f9d38a', seed + 2 + i, 1);   // spore exhaust
  }, s);
}
ART.fighters = a => {
  a.layer(-1, () => a.nim('#b8e0a0'));
  a.layer(-0.4, () => mgCanopy(a, 82, 370));
  const k = a.alt ? 1 : 0;
  a.layer(0.3, () => { mgFighter(a, -60 + k * 30, 20 - k * 40, -0.5, 0.9, 380); mgFighter(a, 0 + k * 40, -10 - k * 34, -0.4, 1.1, 390); });
  a.layer(0.7, () => { mgFighter(a, 60 + k * 30, 30 - k * 50, -0.6, 1.2, 400); if (a.alt) a.star(96, -50, 12, '#ffd34d', 410); });
};

// TWO-NOSED TURRETS: shells that burst into spore clouds of every colour (a holi mist)
ART.turrets = a => {
  a.layer(-1, () => a.nim('#e8c0f0'));
  a.layer(-0.5, () => { a.fillRect(-130, 62, 130, 110, rgba('#7bbf6a', 0.45)); });
  const burst = a.alt;
  a.layer(-0.2, () => {                                                                                          // the clouds
    const C = ['#ff8fa3', '#ffd34d', '#7cd6ff', '#b78cff', '#8fe38a'];
    if (burst) for (let i = 0; i < 9; i++) a.puff(-80 + (i % 5) * 42 + (i > 4 ? 20 : 0), -50 + (i > 4 ? 26 : 0) + H2(i, 4) * 10, 18 + H2(i, 6) * 8, 420 + i, C[i % 5]);
    else for (let i = 0; i < 2; i++) { a.circ(-30 + i * 70, -54 + i * 6, 6, 6, '#3a3440', 430 + i); a.curve([[-6 + i * 40, 10], [-20 + i * 55, -30], [-30 + i * 70, -50]], 432 + i, 1); }
  });
  a.layer(0.5, () => a.at(0, 40, 0, () => {                                                                     // the turret: a mushroom bunker with two noses
    a.blob([[-46, 30], [-40, -4], [40, -4], [46, 30]], MG_STEM, 440);
    a.blob([[-56, -2], [-44, -28], [0, -40], [44, -28], [56, -2]], '#a35bc8', 441);
    a.dot(-26, -18, 3.4, MG_SPOT); a.dot(18, -26, 3, MG_SPOT);
    for (const s of [-1, 1]) a.at(s * 16, -30, s * 0.35, () => { a.blob([[-7, 0], [-6, -26], [0, -34], [6, -26], [7, 0]], '#f3b9a0', 442 + s); a.circ(0, -32, 4, 2.4, '#3a3440', 444 + s, 1); });
    if (burst) for (const s of [-1, 1]) a.puff(s * 28, -76, 9, 446 + s, '#fdfcf5');
  }));
};

// SILK SLUGS: craters of chrysalis, slugs spinning silk
function mgSlug(a, x, y, s, seed) {
  a.at(x, y, 0, () => {
    a.blob([[-30, 8], [-24, -6], [0, -12], [22, -10], [30, 0], [24, 10], [-30, 12]], '#e8d8f0', seed);
    for (let i = 0; i < 4; i++) a.curve([[-18 + i * 10, -6], [-16 + i * 10, 2], [-18 + i * 10, 10]], seed + 1 + i, 0.8);
    a.line([[20, -8], [24, -22]], seed + 6, 1.6); a.line([[26, -6], [32, -18]], seed + 7, 1.6);
    a.dot(24, -23, 2.4, INK); a.dot(32, -19, 2.4, INK);
  }, s);
}
ART.slugs = a => {
  a.layer(-1, () => a.nim('#e0d0f6'));
  a.layer(-0.4, () => { a.fillRect(-130, 40, 130, 110, rgba('#9fcf72', 0.45));
    for (const [x, y, r] of [[-70, 64, 34], [56, 70, 40]]) { a.circ(x, y, r, r * 0.34, '#c9b48a', 450 + x, 2); a.circ(x, y + 2, r * 0.7, r * 0.2, '#8a7350', 451 + x, 1.2); } });   // the craters
  a.layer(0.1, () => {                                                                                         // the webs
    const web = (cx, cy, r, seed) => { for (let i = 0; i < 8; i++) { const an = i / 8 * Math.PI * 2; a.line([[cx, cy], [cx + Math.cos(an) * r, cy + Math.sin(an) * r]], seed + i, 0.7); }
      for (let k = 1; k <= 3; k++) { const P = []; for (let i = 0; i < 8; i++) { const an = i / 8 * Math.PI * 2; P.push([cx + Math.cos(an) * r * k / 3, cy + Math.sin(an) * r * k / 3]); } a.ink(P, null, seed + 10 + k, 0.7, true); } };
    web(-40, -40, 44, 460); web(60, -30, 34, 480);
  });
  a.layer(0.5, () => { mgSlug(a, -64, 48, 1, 500); mgSlug(a, 56, 50, 0.9, 510);
    if (a.alt) a.at(0, 20, 0, () => { a.rect(-24, -14, 24, 14, 6, '#f6e8ff', 520); for (let i = 0; i < 4; i++) a.line([[-20, -8 + i * 5], [20, -8 + i * 5]], 521 + i, 0.8); a.circ(-24, 0, 6, 14, '#e0c8f0', 526); });   // a bolt of silk, for export
    else a.curve([[-36, 40], [-30, 10], [-40, -30]], 530, 0.9); });
};

// PIRÁMIDE DEL ADIVINO: the stepped pyramid out of the canopy, the garnet portobello on its altar, the moon's beam
ART.pyramid = a => {
  a.layer(-1, () => a.nim('#c8d8ff'));
  a.layer(-0.6, () => { a.circ(-86, -66, 16, 16, '#f6f1d8', 540); a.circ(-80, -70, 13, 13, '#e8e0c0', 541, 0.8); });   // the moon
  if (a.alt) a.layer(-0.3, () => { a.g.save(); if (!ST.holo) { a.g.fillStyle = rgba('#fff6b0', 0.55); a.g.beginPath(); a.g.moveTo(-82, -60); a.g.lineTo(-6, -46); a.g.lineTo(6, -38); a.g.closePath(); a.g.fill(); } a.line([[-82, -62], [0, -42]], 542, 1.2); a.g.restore(); });   // the pinhole beam
  a.layer(0.1, () => {
    for (let i = 0; i < 5; i++) { const w = 92 - i * 16, y = 62 - i * 18; a.rect(-w, y - 18, w, y, 1, i % 2 ? '#d9b98a' : '#c9a26a', 550 + i); }
    a.rect(-12, -38, 12, -28, 1, '#c9a26a', 556);                                                              // the altar
    a.blob([[-14, -40], [-10, -52], [10, -52], [14, -40]], '#9b1b30', 557); a.rect(-3, -40, 3, -30, 1, '#f3e2c0', 558, 1.4);   // the garnet portobello
    if (a.alt) { a.star(0, -48, 22, rgba('#fff2a8', 0.8), 559); a.blob([[-14, -40], [-10, -52], [10, -52], [14, -40]], '#d9304a', 560); }
  });
  a.layer(0.6, () => mgCanopy(a, 96, 570));
};

// BLOOM'S WARSHIP: a mushroom battleship, the throne at the viewport, spore rings in its wake
ART.warship = a => {
  a.layer(-1, () => a.nim('#ffd0a0'));
  a.layer(-0.4, () => { for (let i = 0; i < 3; i++) mgSporeRing(a, -70 - i * 22, 30 + i * 6, 16 + i * 6, 580 + i); });
  a.layer(0.4, () => a.at(a.alt ? 10 : 0, a.alt ? -6 : 0, -0.08, () => {
    a.blob([[-60, 10], [-50, 30], [50, 30], [70, 14], [50, 6]], MG_STEM, 590);                                 // the hull (the stem, laid down)
    a.blob([[-70, 8], [-60, -30], [-20, -56], [30, -54], [70, -26], [80, 8]], '#c9661f', 591);               // the cap, armoured
    for (const [x, y, r] of [[-40, -24, 6], [-4, -40, 5], [36, -30, 6], [56, -8, 4]]) a.dot(x, y, r, MG_SPOT);
    a.rect(4, -12, 36, 6, 8, '#bfe6f6', 592); a.at(20, 0, 0, () => { a.blob([[-6, 6], [-6, -8], [0, -12], [6, -8], [6, 6]], '#c9a26a', 593, 1.2); });   // the viewport and the throne
    for (let i = 0; i < 3; i++) a.circ(-30 + i * 28, 30, 5, 5, '#3a3440', 594 + i, 1.4);
    if (a.alt) { a.line([[80, 6], [130, -6]], 598, 4); if (!ST.holo) { a.g.save(); a.g.strokeStyle = rgba('#f9d38a', 0.9); a.g.lineWidth = 2; a.g.beginPath(); a.g.moveTo(80, 6); a.g.lineTo(130, -6); a.g.stroke(); a.g.restore(); } }
  }));
  a.layer(0.8, () => { for (let i = 0; i < 4; i++) a.dot(-110 + i * 14, 60 - i * 4, 2.2, '#f9d38a'); });
};

// SPREADING LICHEN: the fungal jungle blankets a planet in spores (rule: relights a dark ring)
ART.lichen = a => {
  a.layer(-1, () => a.nim('#c8f0a0'));
  a.layer(-0.3, () => { planet(a, 0, 20, 64, a.alt ? '#9fcf72' : '#b0a898', 600); });
  a.layer(0.2, () => {
    const n = a.alt ? 14 : 6;
    for (let i = 0; i < n; i++) { const an = Math.PI * (1.05 + i / 13 * 0.9), r = 60; a.blob([[Math.cos(an) * r - 10, 20 + Math.sin(an) * r + 4], [Math.cos(an) * (r + 10), 20 + Math.sin(an) * (r + 12)], [Math.cos(an) * r + 10, 20 + Math.sin(an) * r + 4]], '#7bbf6a', 610 + i, 1.6); }
    if (a.alt) { a.circ(0, 20, 84, 22, null, 630, 2); a.star(64, -56, 12, '#ffd34d', 631); }               // its ring lights back up
  });
  a.layer(0.7, () => { for (let i = 0; i < 10; i++) a.puff(-100 + H2(i, 7) * 200, -80 + H2(i, 8) * 60, 5 + H2(i, 9) * 6, 640 + i, '#f2e6a0'); });
};

// ── 🐀 FLIP CAPONE: a rat in a black-and-cream pinstripe suit and trilby, buck teeth, the tail (🎬 hologram design), grey for Gil
ART.capone = a => {
  const flag = () => { a.line([[0, 40], [0, -60]], 650, 3); a.blob([[2, -60], [50, -54], [44, -36], [52, -20], [2, -26]], '#fdfcf5', 651); };   // PARLAY: the white flag
  a.layer(-1, () => a.nim('#c9ccd6'));
  if (!a.alt) a.layer(-0.7, () => { a.g.save(); a.g.globalAlpha = ST.holo ? 0.5 : 0.38; a.at(62, -10, 0, flag, 0.9); a.g.restore(); });
  a.layer(0.35, () => a.at(-10, 8, 0, () => {
    a.curve([[24, 70], [60, 80], [76, 60], [62, 46], [52, 58]], 652, 3.4);                                      // the tail
    a.blob([[-34, 70], [-38, 10], [-20, -12], [20, -12], [38, 10], [34, 70]], MG_RAT2, 653);                    // the round pinstripe suit
    for (let i = -3; i <= 3; i++) a.line([[i * 9, -8], [i * 10, 68]], 654 + i, 0.9, true);
    a.poly([[-8, -12], [0, 10], [8, -12]], CREAM, 661, 1.4);                                                    // the shirt
    a.blob([[-34, 6], [-46, 30], [-36, 42], [-28, 28]], MG_RAT2, 662);
    a.blob([[34, 6], [46, -10], [44, -32], [36, -30], [36, -12], [28, 0]], MG_RAT2, 663);                       // a hand up: the cackle
    a.circ(42, -34, 5, 5, '#f2a7b9', 664, 1.4);
    a.line([[-16, 70], [-18, 84]], 665, 3); a.line([[16, 70], [18, 84]], 666, 3);
    a.blob([[-22, -10], [-26, -34], [-10, -50], [14, -50], [24, -34], [40, -26], [42, -18], [20, -10]], MG_RAT, 667);   // head, the snout turned to one side
    a.circ(42, -22, 3.4, 3, '#f2a7b9', 668, 1.2);
    a.rect(24, -14, 30, -6, 1, CREAM, 669, 1);                                                                   // buck teeth
    for (const s of [-1, 1]) { a.circ(s * 8 + 2, -34, 5.5, 5.5, CREAM, 670 + s, 1.6); a.dot(s * 8 + 3, -34, 1.8); }
    for (let i = 0; i < 3; i++) a.line([[40, -22 + i * 2], [58, -28 + i * 5]], 673 + i, 0.8);
    a.blob([[-30, -46], [-24, -54], [20, -56], [30, -46]], INK, 676, 1.6);                                     // the trilby
    a.blob([[-18, -54], [-14, -70], [12, -70], [16, -56]], '#3a3440', 677); a.line([[-16, -58], [15, -60]], 678, 2.4);
  }));
  if (a.alt) a.layer(0.8, () => a.at(-80, 10, -0.1, flag, 0.75));
};

// RAT CRUISERS: small black cruisers with thin, fleshy, segmented tails
function mgRatCruiser(a, x, y, rot, s, seed) {
  a.at(x, y, rot, () => {
    const P = [[-30, 0]]; for (let i = 1; i <= 6; i++) P.push([-30 - i * 9, Math.sin(i * 1.2 + seed) * 6]);
    a.curve(P, seed, 3.2); if (!ST.holo) { a.g.save(); a.g.strokeStyle = '#f2a7b9'; a.g.lineWidth = 1.6; a.g.lineCap = 'round'; a.g.beginPath(); trace(a.g, P, false, false); a.g.stroke(); a.g.restore(); }
    for (let i = 1; i < 6; i++) a.line([[P[i][0], P[i][1] - 3], [P[i][0], P[i][1] + 3]], seed + i, 0.8);
    a.blob([[-32, -2], [-20, -12], [20, -10], [36, 0], [20, 10], [-20, 10]], '#26222c', seed + 10);
    a.circ(18, -2, 4, 3, '#e8506a', seed + 11, 1);
    for (const k of [-1, 1]) a.blob([[-10, k * 8], [-18, k * 18], [-4, k * 10]], '#26222c', seed + 12 + k, 1.6);
  }, s);
}
ART.cruisers = a => {
  a.layer(-1, () => a.nim('#c9ccd6'));
  a.layer(-0.5, () => { for (let i = 0; i < 12; i++) a.dot(-120 + H2(i, 31) * 240, -90 + H2(i, 32) * 180, 1 + H2(i, 33), '#fff6d8'); if (a.alt) planet(a, 100, -60, 30, '#b0a898', 690); });
  const k = a.alt ? 1 : 0;
  a.layer(0.2, () => mgRatCruiser(a, -40 + k * 40, -40 - k * 6, -0.15 - k * 0.2, 0.9, 700));
  a.layer(0.5, () => mgRatCruiser(a, 30 + k * 30, 0 - k * 20, -0.1 - k * 0.2, 1.1, 720));
  a.layer(0.8, () => { mgRatCruiser(a, -50 + k * 50, 50 - k * 20, -0.2 - k * 0.2, 1.2, 740); if (a.alt) for (let i = 0; i < 3; i++) a.line([[50 + i * 12, -10 - i * 8], [90 + i * 8, -50 - i * 6]], 760 + i, 1.6); });
};

// THE RAT KING: a great crawling ball of a warstation, angry eyes, a grid (EP3 scene 6)
ART.ratking = a => {
  a.layer(-1, () => a.nim('#a9b8d8'));
  a.layer(-0.5, () => { for (let i = 0; i < 6; i++) { const an = -Math.PI * 0.9 + i * 0.36; a.line([[0, 0], [Math.cos(an) * 160, Math.sin(an) * 160]], 770 + i, 0.6); } });
  const step = a.alt ? 1 : 0;
  a.layer(0.1, () => { for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const lift = ((i + step) % 2) * 10;   // the legs
    a.line([[s * 40, 10 + i * 8], [s * (74 + i * 12), -10 + i * 6 - lift], [s * (82 + i * 14), 70 - lift], [s * (90 + i * 14), 72 - lift]], 780 + i + (s > 0 ? 10 : 0), 3); } });
  a.layer(0.4, () => {
    a.circ(0, 4, 62, 62, '#6a7290', 800, 3);
    for (let i = -2; i <= 2; i++) { a.curve([[i * 22, -56], [i * 28, 4], [i * 22, 62]], 801 + i, 1, true); a.curve([[-58, i * 22 + 4], [0, i * 26 + 8], [58, i * 22 + 4]], 806 + i, 1); }
    for (const [x, y] of [[-30, -30], [26, 36], [-10, 40]]) a.rect(x, y, x + 12, y + 8, 1, rgba('#bfe6f6', 0.6), 812 + x, 0.8);
    for (const s of [-1, 1]) { a.line([[s * 34, -22], [s * 6, -12]], 815 + s, 4.4); a.circ(s * 20, 0, 11, 11, a.alt ? '#ff8fa3' : '#e6f4fb', 817 + s, 2.4); }
  });
};

// GIL'S REINFORCEMENTS: rats in helmets dropping from a transport
function mgTrooper(a, x, y, s, chute, seed) {
  a.at(x, y, 0, () => {
    if (chute) { a.blob([[-22, -40], [-16, -56], [16, -56], [22, -40]], '#e8e0d0', seed); for (const k of [-1, 0, 1]) a.line([[k * 20, -40], [0, -14]], seed + 2 + k, 0.8); }
    a.blob([[-10, 16], [-12, -4], [12, -4], [10, 16]], MG_RAT2, seed + 5);
    a.circ(0, -10, 9, 8, MG_RAT, seed + 6); a.blob([[-10, -12], [-9, -20], [9, -20], [10, -12]], '#5a7a4a', seed + 7, 1.6);   // helmet
    a.dot(-3, -8, 1.4, INK); a.dot(3, -8, 1.4, INK); a.circ(8, -6, 2, 2, '#f2a7b9', seed + 8, 0.8);
    a.curve([[8, 14], [18, 22], [14, 30]], seed + 9, 1.4);
  }, s);
}
ART.reinforce = a => {
  a.layer(-1, () => a.nim('#c9ccd6'));
  a.layer(-0.5, () => { a.fillRect(-130, 70, 130, 110, rgba('#9fcf72', 0.5)); a.curve([[-130, 70], [0, 64], [130, 70]], 830, 1.4); });
  a.layer(0.0, () => a.at(30, -66, 0.05, () => { a.blob([[-50, 0], [-40, -16], [40, -16], [56, 0], [40, 12], [-40, 12]], '#26222c', 831); a.rect(-14, 6, 14, 16, 2, '#5c606b', 832, 1.4); a.curve([[-50, 0], [-70, 6], [-84, -4]], 833, 2.2); }));   // the transport
  const land = a.alt ? 1 : 0;
  a.layer(0.4, () => { for (let i = 0; i < 3; i++) { const x = -60 + i * 50, y = land ? 52 : -6 + i * 18; mgTrooper(a, x, y, 1, !land, 840 + i * 12); } });
  if (land) a.layer(0.8, () => { for (let i = 0; i < 3; i++) a.puff(-74 + i * 50, 68, 6, 880 + i, '#e8e0d0'); });
};

// PORT ROYAL (Mook's combo: Pirate Cruiser + Rum Distillery + The Tether): the pirate city on black sand
ART.portroyal = a => {
  a.layer(-1, () => a.nim('#ffcf8a'));
  a.layer(-0.6, () => { a.blob([[-130, 30], [-90, -20], [-60, -6], [-30, -40], [10, -10], [30, 30]], '#5a4a52', 890); a.puff(-30, -52, 8, 891, '#d8d0c8'); });   // the volcano
  a.layer(-0.2, () => {                                                                                          // the town
    const H = [[-110, 30, 26], [-80, 12, 22], [-54, 22, 28], [-28, 4, 24], [-2, 18, 26], [24, 8, 22]];
    H.forEach(([x, y, w], i) => { a.rect(x, y, x + w, 50, 1, ['#e6c79a', '#d98f6a', '#c9d8e0', '#e8b0a0', '#d9c9e8', '#f0dca0'][i], 900 + i); a.poly([[x - 3, y], [x + w / 2, y - 14], [x + w + 3, y]], '#a8442a', 910 + i, 1.6); a.rect(x + w / 2 - 3, 38, x + w / 2 + 3, 50, 1, '#3a3440', 920 + i, 1); });
    a.line([[60, -96], [62, 20]], 930, 1.4); for (let i = 0; i < 8; i++) a.circ(61 + (i % 2 ? 2 : -2), -90 + i * 13, 3, 5, null, 931 + i, 1);   // the Tether's chain
  });
  a.layer(0.2, () => { a.fillRect(-130, 50, 130, 110, rgba('#2e2a30', 0.75)); waves(a, 66, 7, 42, 940); a.rect(30, 46, 120, 54, 1, '#8a5a3a', 941); });   // black sand, the sea, the dock
  a.layer(0.5, () => a.at(78, 54, 0, () => { ship(a, { len: 36, ports: 2, flagCol: '#1c1a21', sailCol: '#e6e9ef' }); }));   // a Pirate Cruiser at the dock
  if (a.alt) a.layer(0.9, () => { for (let i = 0; i < 3; i++) a.at(-78 + i * 34, -64 + (i % 2) * 10, 0, () => { a.circ(0, 0, 14, 14, '#f9c74f', 950 + i); a.g.save(); a.g.fillStyle = ST.holo ? HOLO : INK; a.g.font = 'bold 13px ' + NUMFONT; a.g.textAlign = 'center'; a.g.textBaseline = 'middle'; a.g.fillText('+1', 0, 1); a.g.restore(); }); });
};

// ── art/rose-leo.js
// ── ROSE (Titania's lizards, the science road, the library's grav cards) and LEO (EP6) · drawn 2026-11-23 · helpers start rl
const RL_PINK = '#ec6fae', RL_PINK2 = '#c2457f', RL_PERI = '#9aa8f0', RL_LIZ = '#7fcf8a', RL_GOLD = '#f2c94c';
function rlLizardShip(a, col, fin) {                                     // a Geconian ship: a lizard body with fins and a curled tail (🎬 bible)
  a.blob([[-46, 0], [-30, -12], [20, -12], [44, -4], [52, 2], [44, 8], [20, 12], [-30, 12]], col, 300);
  a.curve([[-46, 0], [-62, 6], [-66, 20], [-56, 26], [-50, 18], [-56, 12]], 301, 2.2);              // the curled tail
  a.poly([[-10, -12], [4, -30], [14, -12]], fin || RL_PINK, 302, 1.8);                              // dorsal fin
  a.poly([[-4, 12], [8, 26], [16, 12]], fin || RL_PINK, 303, 1.8);
  a.circ(38, -2, 4, 4, CREAM, 304, 1.4); a.dot(39, -2, 1.6);
  for (let i = 0; i < 3; i++) a.line([[-70 - i * 10, -4 + i * 6], [-96 - i * 12, -4 + i * 6]], 305 + i, 1.1);   // pink streaks
}
function rlHex(a, x, y, r, fill, seed, lw) { const P = []; for (let i = 0; i < 6; i++) P.push([x + Math.cos(i * Math.PI / 3 + Math.PI / 6) * r, y + Math.sin(i * Math.PI / 3 + Math.PI / 6) * r]); a.poly(P, fill, seed, lw); }
function rlShield(a, r) {                                                // MOOD: PINK, a pink bubble nothing can hit
  a.circ(0, 0, r, r * 0.86, rgba(RL_PINK, ST.holo ? 0.1 : 0.22), 310, 2);
  for (let i = 0; i < 7; i++) { const an = i / 7 * Math.PI * 2; rlHex(a, Math.cos(an) * r * 0.55, Math.sin(an) * r * 0.45, r * 0.16, rgba(RL_PINK, ST.holo ? 0.05 : 0.18), 311 + i, 1); }
}
function rlCard(a, x, y, rot, back) {                                    // a card lying face down (Leo's commander)
  a.at(x, y, rot, () => { a.rect(-34, -48, 34, 48, 6, back ? '#e8b98a' : '#cfe0f6', 320, 2.4); if (back) { a.rect(-24, -36, 24, 36, 8, '#f0a0c8', 321, 1.6); for (let i = 0; i < 8; i++) a.line([[-16 + H2(i, 3) * 30, -28 + H2(i, 4) * 56], [-12 + H2(i, 3) * 30, -26 + H2(i, 4) * 56]], 322 + i, 1.6); } });
}
function rlStork(a, sleep) {                                             // a stork ball (Leo's species: Puff's, big) on one leg, in Leo's colours
  a.line([[-4, 30], [-4, 74]], 330, 3.2); a.poly([[-12, 74], [6, 74], [6, 80], [-12, 80]], '#ffe14d', 331, 1.6);
  if (sleep) a.curve([[4, 30], [16, 46], [2, 52]], 332, 3); else { a.line([[6, 30], [8, 74]], 333, 3.2); a.poly([[2, 74], [18, 74], [18, 80], [2, 80]], '#ffe14d', 334, 1.6); }
  a.circ(0, 0, 34, 34, '#5b8be0', 335);
  a.g.save(); a.g.beginPath(); a.g.rect(0, -40, 40, 80); a.g.clip(); a.circ(0, 0, 34, 34, '#e0506a', 335); a.g.restore(); a.circ(0, 0, 34, 34, null, 335);
  for (const s of [-1, 1]) { a.circ(s * 12, -6, 8, 8, CREAM, 336 + s, 1.8); if (sleep) a.line([[s * 12 - 6, -6], [s * 12 + 6, -6]], 338, 1.6); else a.dot(s * 12, -6, 2.4); }
  if (sleep) a.circ(0, 14, 3.5, 3.5, INK, 339, 1); else a.curve([[-8, 12], [0, 16], [8, 12]], 339, 1.6);
  a.poly([[-24, -30], [-18, -50], [18, -50], [24, -30]], '#e0506a', 340, 2); a.g.save(); a.g.beginPath(); a.g.rect(-30, -60, 30, 40); a.g.clip(); a.poly([[0, -30], [0, -50], [18, -50], [24, -30]], '#5b8be0', 340, 0); a.g.restore(); a.poly([[-24, -30], [-18, -50], [18, -50], [24, -30]], null, 340, 2);   // his bucket hat
  a.blob([[-40, -30], [0, -36], [40, -30], [36, -24], [0, -28], [-36, -24]], '#ffe14d', 341, 1.8); a.circ(0, -50, 3, 3, '#ffe14d', 342, 1.2);   // the yellow brim and button
}

// 🦎 Titania, Doge Princess: the chameleon (book: periwinkle sundress, aviators, sheepskin bomber, a fishbowl helmet at her hip)
ART.titania = a => {
  a.layer(-1, () => a.nim('#f7b6d6'));
  if (!a.alt) a.layer(-0.7, () => { a.g.save(); a.g.globalAlpha = ST.holo ? 0.5 : 0.45; a.at(46, -20, 0, () => rlShield(a, 70)); a.g.restore(); });
  a.layer(0.35, () => a.at(-14, -6, 0, () => {
    a.curve([[14, 46], [40, 52], [52, 36], [44, 24], [34, 30], [40, 38]], 340, 3);                    // curled tail
    for (const s of [-1, 1]) { a.line([[s * 8, 46], [s * 10, 80]], 341, 3); a.poly([[s * 10 - 6, 80], [s * 10 + 8 * s, 80], [s * 10 + 2, 74]], RL_PINK2, 342, 1.4); }   // two-toed feet
    a.poly([[-24, 4], [24, 4], [32, 50], [-32, 50]], RL_PERI, 343);                                  // the sundress
    a.blob([[-22, -14], [22, -14], [26, 12], [-26, 12]], '#b9845a', 344);                            // the bomber
    a.poly([[-24, -14], [-8, -14], [-10, -4], [-26, -4]], CREAM, 345, 1.4); a.poly([[24, -14], [8, -14], [10, -4], [26, -4]], CREAM, 346, 1.4);   // sheepskin collar
    a.blob([[-24, -8], [-40, 14], [-32, 22], [-20, 6]], '#b9845a', 347); a.circ(-36, 20, 4, 4, RL_PINK, 348, 1.4);
    a.at(30, 26, 0, () => { a.circ(0, 0, 13, 12, rgba('#bfe7ff', ST.holo ? 0.1 : 0.5), 349, 1.8); a.rect(-8, 9, 8, 13, 2, '#9aa3b0', 350, 1.2); });   // fishbowl helmet at the hip
    a.blob([[-20, -14], [-22, -40], [-6, -58], [12, -54], [22, -36], [20, -14]], RL_PINK, 351);       // head
    a.poly([[-8, -56], [-2, -70], [4, -60], [10, -72], [14, -54]], RL_PINK2, 352, 1.8);               // notched casque
    a.rect(-18, -42, 18, -30, 5, '#2a2630', 353, 1.6); a.line([[-1, -38], [1, -38]], 354, 1.2);       // aviator shades
    if (!ST.holo) { a.g.fillStyle = 'rgba(255,255,255,0.5)'; a.g.fillRect(-14, -40, 5, 3); a.g.fillRect(4, -40, 5, 3); }
    a.curve([[-8, -22], [0, -18], [10, -22]], 355, 1.6);
  }, 1.22));
  if (a.alt) a.layer(0.8, () => rlShield(a, 96));
};
ART.geconian = a => {                                                    // a hodgepodge of space-dews and cosmo-yachts
  a.layer(-1, () => a.nim('#f7b6d6'));
  a.layer(-0.5, () => { for (let i = 0; i < 12; i++) a.dot(-118 + H2(i, 31) * 236, -90 + H2(i, 32) * 180, 1.2, '#ffffff'); planet(a, 96, 64, 30, '#f4a6cb', 360); });
  const dx = a.alt ? 30 : 0;
  a.layer(0.1, () => a.at(-40 + dx, -46, -0.1, () => rlLizardShip(a, '#a7d8b0', RL_PINK2), 0.6));
  a.layer(0.3, () => a.at(52 + dx, -18, 0.05, () => rlLizardShip(a, '#c7a0e8', RL_PINK), 0.55));
  a.layer(0.6, () => a.at(-14 + dx, 30, -0.06, () => rlLizardShip(a, RL_LIZ, RL_PINK)));
  if (a.alt) a.layer(0.8, () => a.star(-80, 50, 14, '#ffd34d', 361));
};
ART.speedster = a => {                                                   // Titania's fuchsia speedster, out in front
  a.layer(-1, () => a.nim('#f7b6d6'));
  a.layer(-0.4, () => { for (let i = 0; i < 6; i++) a.line([[-130, -60 + i * 22], [-30 - H2(i, 5) * 60, -60 + i * 22]], 370 + i, 1); });
  const k = a.alt ? 40 : 0;
  a.layer(0.5, () => a.at(-6 + k, 6, -0.12, () => {
    a.blob([[-70, 4], [-40, -14], [40, -16], [80, -4], [86, 2], [60, 14], [-50, 16]], '#e0368c', 380);
    a.blob([[-6, -14], [8, -34], [36, -32], [44, -14]], rgba('#bfe7ff', ST.holo ? 0.1 : 0.8), 381, 2);   // the canopy
    a.at(22, -20, 0, () => { a.circ(0, 0, 7, 7, RL_PINK, 382, 1.4); a.rect(-6, -3, 6, 2, 2, '#2a2630', 383, 1); });
    a.poly([[-54, -8], [-74, -26], [-60, -4]], '#e0368c', 384, 1.8); a.poly([[-50, 12], [-70, 28], [-56, 10]], '#e0368c', 385, 1.8);
    a.circ(-74, 2, 6, 8, '#ffb02a', 386, 1.4); a.circ(-84, 2, 4, 5, '#ffe27a', 387, 1);              // exhaust
  }));
  if (a.alt) a.layer(0.8, () => { a.star(90, -50, 12, '#ffd34d', 388); for (let i = 0; i < 3; i++) a.line([[-110, 30 + i * 10], [-60, 30 + i * 10]], 389 + i, 1); });
};
ART.balistrai = a => {                                                   // Balistrai Corporation: an industry card, a tower that pays (+1 ECON)
  a.layer(-1, () => a.nim('#c9e9ff'));
  a.layer(-0.4, () => { a.fillRect(-130, 60, 130, 110, rgba('#9fd3a8', 0.6)); a.line([[-130, 60], [130, 60]], 400, 1.4); });
  a.layer(0.2, () => {
    a.poly([[-40, 60], [-30, -60], [30, -60], [40, 60]], '#b6c3d6', 401);
    for (let r = 0; r < 6; r++) for (let c = 0; c < 3; c++) a.rect(-22 + c * 16, -48 + r * 18, -12 + c * 16, -38 + r * 18, 1, r % 2 && c === 1 ? '#ffe27a' : '#e8f4ff', 402 + r, 1);
    a.poly([[-30, -60], [0, -84], [30, -60]], '#e0368c', 410);                                       // the pink roof
    a.line([[0, -84], [0, -96]], 411, 1.6); a.circ(0, -96, 3, 3, RL_GOLD, 412, 1);
    a.rect(-64, 20, -44, 60, 2, '#d7dde6', 413); a.rect(44, 10, 64, 60, 2, '#d7dde6', 414);
    a.line([[-54, 20], [-54, 4]], 415, 3); a.line([[54, 10], [54, -8]], 416, 3);
  });
  a.layer(0.6, () => { for (let i = 0; i < 3; i++) a.puff(-54 + (a.alt ? 0 : 0), -2 - i * 12, 5 + i * 2, 417 + i); for (let i = 0; i < 2; i++) a.puff(54, -14 - i * 12, 5 + i * 2, 420 + i);
    if (a.alt) a.at(84, -50, 0, () => { a.circ(0, 0, 16, 16, '#f9c74f', 422); a.g.save(); a.g.fillStyle = ST.holo ? HOLO : INK; a.g.font = 'bold 15px "Comic Sans MS", sans-serif'; a.g.textAlign = 'center'; a.g.textBaseline = 'middle'; a.g.fillText('+1', 0, 1); a.g.restore(); }); });
};

// 📚 the library's three cards (EP11) and what they make
function rlGemStar(a, r, fill, seed) {                                   // a star cut like a gem: an octagon with facets
  const P = []; for (let i = 0; i < 8; i++) { const an = i / 8 * Math.PI * 2 + Math.PI / 8; P.push([Math.cos(an) * r, Math.sin(an) * r]); }
  a.poly(P, fill, seed, 2.4); const Q = P.map(p => [p[0] * 0.5, p[1] * 0.5]); a.poly(Q, null, seed + 1, 1.2);
  for (let i = 0; i < 8; i++) a.line([P[i], Q[i]], seed + 2, 1);
}
ART.lucy = a => {                                                        // LUCY: a white star cut like a gem, in a drawer of black stone
  a.layer(-1, () => a.nim('#dfe6ff'));
  a.layer(-0.3, () => { a.rect(-90, 20, 90, 80, 6, '#2e2a30', 430); a.rect(-70, 30, 70, 70, 4, '#1c1a21', 431, 1.6); a.circ(0, 50, 6, 4, '#8a8590', 432, 1.4); });
  const up = a.alt ? -28 : 0;
  a.layer(0.5, () => a.at(0, -24 + up, a.t * 0.2, () => { rlGemStar(a, 34, '#f4f6ff', 433); if (!ST.holo) { const g = a.g, gl = g.createRadialGradient(0, 0, 4, 0, 0, 60); gl.addColorStop(0, 'rgba(255,255,255,0.7)'); gl.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gl; g.fillRect(-60, -60, 120, 120); } }));
  a.layer(0.8, () => { for (let i = 0; i < 4; i++) { const an = i * Math.PI / 2 + 0.4; a.line([[Math.cos(an) * 44, -24 + up + Math.sin(an) * 44], [Math.cos(an) * 58, -24 + up + Math.sin(an) * 58]], 436 + i, 1.4); } });
};
ART.ikaros = a => {                                                      // IKAROS: a kite of sunlight, a sail 7.5 micrometres thick
  a.layer(-1, () => a.nim('#ffe9a8'));
  a.layer(-0.5, () => { a.circ(-84, -60, 22, 22, '#ffd34d', 440); for (let i = 0; i < 8; i++) { const an = i / 8 * Math.PI * 2; a.line([[-84 + Math.cos(an) * 28, -60 + Math.sin(an) * 28], [-84 + Math.cos(an) * 38, -60 + Math.sin(an) * 38]], 441, 1.4); } });
  const open = a.alt ? 1 : 0.55;
  a.layer(0.3, () => a.at(28, 10, 0.78, () => {                           // a square sail, diagonal, spinning open
    const s = 70 * open; a.poly([[0, -s], [s, 0], [0, s], [-s, 0]], rgba('#fff4c8', ST.holo ? 0.1 : 0.9), 442);
    a.line([[0, -s], [0, s]], 443, 1); a.line([[-s, 0], [s, 0]], 444, 1);
    a.rect(-8, -8, 8, 8, 2, '#b6c3d6', 445, 1.6);                                                  // the little craft at the centre
  }));
  a.layer(0.6, () => { for (let i = 0; i < 4; i++) a.line([[-60 + i * 6, -40 + i * 10], [-10 + i * 8, -6 + i * 10]], 446 + i, 1); });   // sunlight pushing
};
ART.gw150914 = a => {                                                    // GW150914: two dark circles spiralling in, a chirp
  a.layer(-1, () => a.nim('#d8d0f0'));
  a.layer(-0.4, () => { for (let r = 1; r <= 5; r++) a.circ(0, 0, 22 * r, 16 * r, null, 450 + r, 1.2 - r * 0.15); });   // the ripples
  const ph = a.alt ? 0 : a.t * 2, d = a.alt ? 8 : 34;
  a.layer(0.4, () => {
    a.g.save(); if (!ST.holo) a.g.setLineDash([3, 4]); a.curve([[40, 0], [20, -26], [-10, -24], [-26, 0], [-10, 18], [8, 10]], 456, 1); a.g.restore();
    a.circ(Math.cos(ph) * d, Math.sin(ph) * d * 0.6, 16, 16, '#1c1a21', 457); a.circ(-Math.cos(ph) * d, -Math.sin(ph) * d * 0.6, 13, 13, '#2a2630', 458);
    if (a.alt) a.star(0, 0, 30, '#fff2a8', 459);
  });
  a.layer(0.7, () => a.curve([[-110, 74], [-90, 70], [-70, 78], [-56, 64], [-44, 84], [-34, 58], [-26, 90], [-20, 52]], 460, 1.6));   // the chirp
};
ART.gravdrive = a => {                                                   // THE GRAV DRIVE: a seed-hull ship riding the wave, the stars smeared
  a.layer(-1, () => a.nim('#c9d6ff'));
  a.layer(-0.6, () => { for (let i = 0; i < 14; i++) { const y = -90 + H2(i, 41) * 180, x = -120 + H2(i, 42) * 200; a.line([[x, y], [x + 30 + H2(i, 43) * 40, y]], 470 + i, 1); } });
  a.layer(-0.1, () => a.curve([[-130, 50], [-90, 30], [-50, 54], [-10, 30], [30, 54], [70, 30], [110, 54], [140, 40]], 485, 2.4));   // the wave
  const x = a.alt ? 40 : -10;
  a.layer(0.5, () => a.at(x, 10, -0.12, () => {
    a.blob([[-56, 0], [-30, -20], [30, -22], [60, -4], [62, 4], [30, 20], [-30, 18]], '#c79b6a', 486);   // the seed hull
    a.curve([[-40, 0], [0, -6], [50, 0]], 487, 1.2);
    a.at(6, -4, a.t * 0.3, () => rlGemStar(a, 9, '#f4f6ff', 488));                                   // LUCY inside
    a.poly([[-20, -18], [-4, -54], [30, -20]], rgba('#fff4c8', ST.holo ? 0.1 : 0.9), 491, 1.8);       // IKAROS as its sail
  }));
};
ART.part = a => {                                                        // THE WRITER (wiki: the Jaquet-Droz automata, 1770s: a boy doll that writes with a quill, ~6000 parts)
  a.layer(-1, () => a.nim('#c9e9ff'));
  a.layer(-0.4, () => { const P = []; for (let i = 0; i < 20; i++) { const an = i / 20 * Math.PI * 2, r = i % 2 ? 30 : 36; P.push([82 + Math.cos(an) * r, -54 + Math.sin(an) * r]); } a.poly(P, '#d7dde8', 500, 1.4); a.circ(82, -54, 10, 10, '#b6c3d6', 501, 1.2);
    const Q = []; for (let i = 0; i < 14; i++) { const an = i / 14 * Math.PI * 2 + 0.2, r = i % 2 ? 18 : 23; Q.push([-90 + Math.cos(an) * r, -66 + Math.sin(an) * r]); } a.poly(Q, '#d7dde8', 502, 1.2); });   // the works behind him
  a.layer(0.2, () => { a.rect(-70, 40, 80, 52, 2, '#a8744f', 503); a.line([[-60, 52], [-60, 90]], 504, 3); a.line([[70, 52], [70, 90]], 505, 3);   // the desk
    a.rect(-10, 32, 60, 40, 1, CREAM, 506, 1.2); if (a.alt) a.curve([[0, 36], [8, 34], [14, 37], [22, 34], [30, 36]], 507, 1); });   // the paper
  a.layer(0.5, () => a.at(-26, 0, 0, () => {
    a.blob([[-20, 40], [-22, 0], [-12, -10], [12, -10], [22, 0], [20, 40]], '#5b6fb0', 510);             // the coat
    a.circ(0, -28, 17, 18, '#f3d6c0', 511);                                                               // the porcelain head
    a.blob([[-17, -32], [-12, -48], [0, -50], [12, -48], [17, -32], [8, -40], [-8, -40]], '#a8744f', 512, 1.6);   // hair
    for (const s of [-1, 1]) { a.circ(s * 6, -28, 3, 3, CREAM, 513 + s, 1.2); a.dot(s * 6, a.alt ? -27 : -28, 1.2); }
    a.curve([[-4, -18], [0, -17], [4, -18]], 515, 1.2);
    const r = a.alt ? 0.35 : 0;
    a.at(16, 6, r, () => { a.line([[0, 0], [24, 22]], 516, 3); a.circ(25, 24, 3.5, 3.5, '#f3d6c0', 517, 1.2); a.curve([[22, 26], [34, 6], [44, -14]], 518, 1.2); });   // the arm and the quill
  }));
};
ART.core = a => {                                                        // ANTIKYTHERA (wiki: the ancient Greek bronze geared mechanism found in a shipwreck)
  a.layer(-1, () => a.nim('#bfe8d8'));
  a.layer(-0.4, () => { a.rect(-96, -84, 96, 84, 10, '#a8744f', 520); a.rect(-86, -74, 86, 74, 6, '#8a5a3a', 521, 1.4); });   // the wooden case
  const turn = a.alt ? 0.6 : 0, gear = (x, y, r, n, col, seed, rot) => { const P = []; for (let i = 0; i < n * 2; i++) { const an = i / (n * 2) * Math.PI * 2 + rot, rr = i % 2 ? r * 0.86 : r; P.push([x + Math.cos(an) * rr, y + Math.sin(an) * rr]); } a.poly(P, col, seed, 1.6); };
  a.layer(0.2, () => { gear(-40, 30, 34, 18, '#6fae8f', 522, -turn * 2); gear(46, 38, 26, 14, '#7fbf9c', 523, turn * 2.6); gear(48, -34, 20, 11, '#6fae8f', 524, -turn * 3); });   // bronze gone green
  a.layer(0.45, () => {
    gear(0, -6, 52, 28, '#8fcfaa', 525, turn);                                                            // the great wheel
    a.circ(0, -6, 40, 40, null, 526, 1.2);
    for (let i = 0; i < 4; i++) { const an = i * Math.PI / 2 + turn; a.line([[Math.cos(an) * 8, -6 + Math.sin(an) * 8], [Math.cos(an) * 40, -6 + Math.sin(an) * 40]], 527 + i, 2.4); }   // the spokes
    a.circ(0, -6, 8, 8, '#c58a3a', 531, 1.6);
    if (a.alt) { a.line([[0, -6], [0, -44]], 532, 2); a.circ(0, -48, 5, 5, '#ffd34d', 533, 1.2); a.circ(26, -24, 4, 4, '#cfd6e0', 534, 1); }   // its pointers: the sun, the moon
  });
};
ART.lab = a => {                                                         // Rose's works (no name yet): the lab the three cards fuse into
  a.layer(-1, () => a.nim('#f7b6d6'));
  a.layer(-0.4, () => { a.fillRect(-130, 56, 130, 110, rgba('#9fd3a8', 0.6)); a.line([[-130, 56], [130, 56]], 540, 1.4); for (let i = 0; i < 10; i++) a.dot(-118 + H2(i, 51) * 236, -90 + H2(i, 52) * 70, 1.2, '#ffffff'); });
  a.layer(0.2, () => {
    a.rect(-80, 0, 80, 56, 4, '#d7dde6', 541);
    a.blob([[-50, 0], [-46, -36], [-20, -56], [20, -56], [46, -36], [50, 0]], rgba('#bfe7ff', ST.holo ? 0.1 : 0.85), 542);   // the dome
    a.curve([[-40, -20], [0, -30], [40, -20]], 543, 1); a.line([[0, -56], [0, 0]], 544, 1);
    a.at(0, -24, 0, () => rlGemStar(a, 8, '#26c6da', 545));
    a.rect(60, -40, 76, 0, 2, '#e0368c', 548); a.rect(-76, -30, -60, 0, 2, '#b9845a', 549);
    for (let i = 0; i < 4; i++) a.rect(-70 + i * 40, 16, -54 + i * 40, 30, 2, '#ffe27a', 550 + i, 1.2);
  });
  a.layer(0.6, () => { a.at(-96, -60, -0.2, () => rlLizardShip(a, RL_LIZ, RL_PINK), 0.35);
    if (a.alt) a.at(92, -66, 0, () => rlCard(a, 0, 0, 0.2, false));                                  // +1 card a turn
  });
};

// 🐦 Leo (EP6): three actions from his 2020 card, a face-down commander, two units with no name yet
ART.leocmd = a => {                                                      // face down all game: who it is has not been said
  a.layer(-1, () => a.nim('#d8d0f0'));
  a.layer(-0.4, () => { a.g.save(); a.g.globalAlpha = 0.5; a.circ(0, 40, 90, 22, rgba('#7f8aa0', 0.4), 560, 1.2); a.g.restore(); });
  a.layer(0.4, () => a.at(0, a.alt ? -6 : 4, a.alt ? 0.25 : -0.08, () => { rlCard(a, 0, 0, 0, true);
    if (!ST.holo) { a.g.fillStyle = 'rgba(255,255,255,0.0)'; }
    a.at(0, 0, 0, () => { a.g.save(); a.g.fillStyle = ST.holo ? HOLO : INK; a.g.font = 'bold 40px "Comic Sans MS", sans-serif'; a.g.textAlign = 'center'; a.g.textBaseline = 'middle'; if (a.alt) a.g.fillText('?', 0, 2); a.g.restore(); });
  }, 1.4));
  a.layer(0.7, () => { for (let i = 0; i < 3; i++) a.dot(-70 + i * 70, -78 + (i % 2) * 10, 2.2, '#ffffff'); if (a.alt) a.star(70, -60, 12, '#ffd34d', 561); });
};
ART.absorb = a => {                                                      // a soft cloud swells over the planet and soaks up hit after hit
  a.layer(-1, () => a.nim('#cfe0f6'));
  a.layer(-0.3, () => planet(a, 0, 56, 50, '#9fd3a8', 570));
  const sw = a.alt ? 1.25 : 1;
  a.layer(0.3, () => a.at(0, 10, 0, () => { for (let i = 0; i < 7; i++) { const an = Math.PI + i / 6 * Math.PI; a.puff(Math.cos(an) * 66, Math.sin(an) * 46 + 6, 26, 571 + i, '#f8fbff'); } a.puff(0, -30, 30, 578, '#f8fbff'); }, sw));
  a.layer(0.6, () => { for (let i = 0; i < 3; i++) { const x = -90 + i * 80, y = -86; a.circ(x, y + (a.alt ? 30 : 0), 5, 5, '#3a3440', 580 + i); a.curve([[x, y - 20], [x, y - 2 + (a.alt ? 30 : 0)]], 583 + i, 1); }
    if (a.alt) for (let i = 0; i < 3; i++) a.puff(-90 + i * 80, -52, 6, 586 + i); });
};
ART.snooze = a => {                                                      // a moon rises and five dark rings light back up, one with each snore
  a.layer(-1, () => a.nim('#c9c3ef'));
  a.layer(-0.5, () => { if (!ST.holo) { a.g.fillStyle = rgba('#2b2350', 0.2); a.g.fillRect(-130, -110, 260, 220); } for (let i = 0; i < 12; i++) a.dot(-118 + H2(i, 61) * 236, -94 + H2(i, 62) * 90, 1.1, '#ffffff'); });
  const rise = a.alt ? -26 : 0;
  a.layer(-0.1, () => a.at(-60, -40 + rise, 0, () => { a.circ(0, 0, 26, 26, '#f6efc8', 590); if (!ST.holo) { a.g.fillStyle = rgba('#2b2350', 0.55); a.g.beginPath(); a.g.arc(10, -6, 24, 0, Math.PI * 2); a.g.fill(); } a.circ(0, 0, 26, 26, null, 590); }));
  a.layer(0.4, () => { for (let i = 0; i < 5; i++) { const x = -88 + i * 44, lit = a.alt || i < 2; a.circ(x, 60, 15, 6, lit ? '#ffe27a' : '#5a5368', 591 + i, 2); if (lit && !ST.holo) { a.g.fillStyle = 'rgba(255,226,122,0.35)'; a.g.beginPath(); a.g.ellipse(x, 60, 22, 10, 0, 0, Math.PI * 2); a.g.fill(); } } });
  a.layer(0.7, () => { const n = a.alt ? 5 : 2; for (let i = 0; i < n; i++) uText(a.g, 'Z', 30 + i * 16, -40 - i * 14, 12 + i * 3, { seed: 600 + i, col: '#3a3440' }); });
};
ART.smash = a => {                                                       // a giant fist of light comes down through the galaxy
  a.layer(-1, () => a.nim('#ffd6a8'));
  a.layer(-0.5, () => { for (let i = 0; i < 14; i++) a.dot(-118 + H2(i, 71) * 236, -94 + H2(i, 72) * 188, 1.2, '#ffffff'); planet(a, 0, 78, 34, '#f4a6cb', 610); });
  const down = a.alt ? 46 : 0;
  a.layer(0.3, () => a.at(0, -40 + down, 0, () => {                       // the fist, knuckles down (Leo's grey hand, three fingers and a thumb)
    a.rect(-16, -90, 16, -26, 6, '#c9ced6', 611);
    a.blob([[-34, -30], [34, -30], [38, 10], [-38, 10]], '#c9ced6', 612);
    for (let i = 0; i < 3; i++) a.circ(-22 + i * 22, 12, 11, 9, '#c9ced6', 613 + i);
    a.blob([[34, -24], [50, -10], [40, 2]], '#c9ced6', 616);
  }));
  a.layer(0.6, () => { if (a.alt) { a.star(0, 52, 34, '#ffb02a', 617); a.star(0, 52, 16, '#fff2a8', 618); } else for (let i = 0; i < 4; i++) a.line([[-50 + i * 33, -96], [-46 + i * 33, -60]], 619 + i, 1.2); });
};
ART.leoA = a => {                                                        // Leo unit A (no name yet): a stork ball standing guard on one leg
  a.layer(-1, () => a.nim('#cfe0f6'));
  a.layer(-0.4, () => { a.fillRect(-130, 70, 130, 110, rgba('#9fd3a8', 0.6)); a.line([[-130, 70], [130, 70]], 630, 1.4); });
  a.layer(0.4, () => a.at(0, -8, 0, () => rlStork(a, !a.alt), 1.05));
  a.layer(0.7, () => { if (!a.alt) for (let i = 0; i < 3; i++) uText(a.g, 'Z', 44 + i * 12, -46 - i * 12, 10 + i * 2, { seed: 640 + i, col: '#3a3440' }); else a.star(60, -50, 12, '#ffd34d', 643); });
};
ART.leoB = a => {                                                        // PFEILSTORCH (wiki: a stork that flew home from Africa with an arrow through it; proof that birds migrate)
  a.layer(-1, () => a.nim('#d8e8c8'));
  a.layer(-0.5, () => { a.fillRect(-130, 70, 130, 110, rgba('#9fd3a8', 0.6)); a.line([[-130, 70], [130, 70]], 650, 1.4); });
  a.layer(-0.2, () => { a.circ(-88, -60, 16, 16, '#ffd34d', 652); for (let i = 0; i < 3; i++) a.curve([[60 + i * 16, -70 + i * 8], [66 + i * 16, -76 + i * 8], [72 + i * 16, -70 + i * 8]], 653 + i, 1.2); });   // the far south sun, birds flying north
  a.layer(0.45, () => a.at(0, -2, a.alt ? 0.08 : 0, () => {
    rlStork(a, false);
    a.line([[-62, 12], [62, -6]], 656, 2.4);                                                            // the arrow, straight through, harmless
    a.poly([[62, -6], [52, -12], [54, 0]], '#8f8577', 657, 1.4);
    for (const s of [0, 1]) a.poly([[-62 + s * 8, 12], [-70 + s * 8, 4], [-74 + s * 8, 16]], '#e0506a', 658 + s, 1.2);   // the fletching
  }, 1.0));
  if (a.alt) a.layer(0.8, () => { a.at(64, -44, 0, () => { a.rect(-18, -10, 18, 10, 2, CREAM, 660, 1.4); a.line([[-12, -2], [12, -2]], 661, 0.8); a.line([[-12, 3], [6, 3]], 662, 0.8); }); a.line([[40, -36], [30, -22]], 663, 1.2); });   // a note: proof
};
// @@ART-END

// a card not drawn yet: its silhouette in the art window, so the face is whole (the art is the next pass)
function artPlaceholder(a, card) {
  a.nim('#c9d6e8');
  a.g.save(); a.g.globalAlpha = ST.holo ? 0.6 : 0.5; uText(a.g, 'ART TO COME', 0, 6, 13, { align: 'center', col: '#6a7180', seed: 3, whim: 0.8 }); a.g.restore();
}
function drawArt(g, card, o) { const a = artKit(g, o), f = ART[card.art || card.id]; if (f) f(a); else artPlaceholder(a, card); }

// ══ THE FACE ═════════════════════════════════════════════════════════════════════════════════════════════════
//   drawn in card units (300 × 420) under the caller's transform. o: { t, tilt, finish, depth, emboss, alt }
function face(g, card, o) {
  const t = o.t || 0, bk = boil(t), lw = 5, lw2 = 3, R = (x0, y0, x1, y1, r) => { const P = rectPts(x0, y0, x1, y1, r || 0.01, 6); return P; };
  const line = (P, l, seed, fill, closed) => ink(g, P, { fill, lw: l, amp: 0.5, seed: seed || 3, bk, poly: true, closed: closed !== false });
  const U = (str, x, y, cap, oo) => uText(g, str, x, y, cap, Object.assign({ t, col: INK, seed: (card.name.length * 7) | 0, emboss: !!o.emboss }, oo || {}));
  const num = (str, x, y, size, col, bold) => { g.save(); g.fillStyle = ST.holo ? HOLO : (col || INK); g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = (bold ? 'bold ' : '') + size + 'px ' + NUMFONT;
    if (o.emboss && !ST.holo) { g.fillStyle = 'rgba(255,255,255,0.8)'; g.fillText(str, x - 0.6, y - 0.6); g.fillStyle = 'rgba(0,0,0,0.4)'; g.fillText(str, x + 0.6, y + 0.6); g.fillStyle = col || INK; }
    g.fillText(str, x, y); g.restore(); };
  // the card and its thick frame (✏️)
  line(R(0, 0, 300, 420, 14), lw, 1, BLUE);
  // hm circle and the name
  ink(g, circlePts(34, 34, 22, 22, 18, 0, 0.02, 2), { fill: BLUE, lw: lw2, amp: 0.5, seed: 2, bk, poly: false });
  U('HM', 34, 40, 12, { align: 'center', seed: 3 });
  const nameRight = o.finish === 'first' ? 252 : 290;                   // room for the onyx gem
  let cap = 19; const nameW = nameRight - 64; while (uWidth(card.name, cap) > nameW && cap > 8) cap -= 0.5;
  U(card.name, 62 + nameW / 2, 28 + cap / 2, cap, { align: 'center' });
  // the art window
  const AW = R(28, 58, 272, 252, 22);
  line(AW, lw, 4, PAPER);
  g.save(); g.beginPath(); trace(g, AW, true, true); g.clip();
  artWindow(g, card, o);
  g.restore(); line(AW, lw, 4, null);
  // the set number (★ for a commander) · numbers in the plain round hand
  line(R(28, 214, 70, 252, 4), lw2, 5, BLUE);
  const no = String(card.no || ''), parts = no.split(' ');
  if (no === '★') num('★', 49, 234, 20);
  else if (parts.length > 1) { num(parts[0], 49, 223, 8); num(parts[1], 49, 238, 11); }
  else num(no, 49, 234, 12);
  // A · D · M
  const rowsY = [264, 297, 330], RH = 33, labels = ['A', 'D', 'M'];
  line(R(10, 260, 228, 364, 4), lw, 6, CREAM);
  for (let i = 0; i < 3; i++) {
    const yy = rowsY[i], L = labels[i], name = (card.moves && card.moves[L]) || '', val = L === 'M' ? null : card[L];
    if (i) line([[10, yy], [228, yy]], lw2, 7 + i, null, false);
    line([[34, i ? yy : 260], [34, i < 2 ? yy + RH : 364]], lw2, 9 + i, null, false);
    U(L, 22, yy + 23, 13, { align: 'center', seed: 40 + i });
    const big = L === 'M' && card.big, maxW = (val != null ? 140 : 182); let c2 = big ? 14.5 : 13;
    while (uWidth(name, c2) > maxW && c2 > 6) c2 -= 0.5;
    if (name) U(name, 42, yy + 16.5 + c2 / 2, c2, { seed: 50 + i * 9, nib: big ? 1.35 : 1 });
    if (val != null) {                                                    // the power disc: his digit colour, the digit always printed
      const cx = 205, cy = yy + 16.5, d = String(val).slice(-1), col = DIGIT[d] || CREAM;
      ink(g, circlePts(cx, cy, 13.5, 13.5, 16, 0, 0.02, 12 + i), { fill: ST.holo ? null : col, lw: lw2, amp: 0.5, seed: 12 + i, bk, poly: false });
      num(String(val), cx, cy + 1, 17, DIGIT_INK[d] || '#fdfcf5', true);
    }
  }
  // ECON (circle) and DEV (square)
  U('ECON', 264, 272, 9, { align: 'center', seed: 61 }); U('DEV', 264, 328, 9, { align: 'center', seed: 62 });
  line([[240, 278], [290, 278]], lw2 * 0.8, 20, null, false);
  ink(g, circlePts(264, 298, 16, 16, 16, 0, 0.02, 21), { fill: BLUE, lw: lw2, amp: 0.5, seed: 21, bk, poly: false });
  line(R(248, 333, 280, 363, 3), lw2, 22, BLUE);
  if (card.econ != null) num(String(card.econ), 264, 299, 19);
  if (card.dev != null) num(String(card.dev), 264, 349, 19);
  // under the table: the rule (plain round hand, so every number reads) then the flavor (the Halo hand)
  const top = 370, bot = 413, W = 276;
  let rs = 10, fc = 8.2, rl, fl;
  for (let k = 0; k < 14; k++) {
    rl = card.rule ? pWrap(g, card.rule, rs, W) : []; fl = card.flavor ? uWrap(card.flavor, fc, W) : [];
    const hgt = rl.length * rs * 1.18 + (rl.length && fl.length ? 3 : 0) + fl.length * fc * 1.5;
    if (hgt <= bot - top) break; rs -= 0.35; fc -= 0.3;
  }
  const hgt = rl.length * rs * 1.18 + (rl.length && fl.length ? 3 : 0) + fl.length * fc * 1.5; let y = top + (bot - top - hgt) / 2;
  g.save(); g.fillStyle = ST.holo ? HOLO : '#23202a'; g.font = rs + 'px ' + NUMFONT; g.textAlign = 'center'; g.textBaseline = 'top';
  for (const L of rl) { g.fillText(L, 150, y); y += rs * 1.18; } g.restore();
  if (rl.length && fl.length) y += 3;
  fl.forEach((L, i) => { U(L, 150, y + fc * 1.12, fc, { align: 'center', seed: 70 + i, col: '#3a3440', whim: 0.8 }); y += fc * 1.5; });
}
// the picture inside the window: flat print, a lenticular pair, or the First Edition's endless depth
function artWindow(g, card, o) {
  const fin = o.finish || 'plain', tilt = o.tilt || { x: 0, y: 0 }, t = o.t || 0;
  g.save(); g.translate(150, 155);
  if (fin === 'first' && !ST.holo) tunnel(g, tilt, card);
  const base = { t, tilt, depth: fin === 'first' ? 1.6 : 0 };
  if (fin === 'laminate' || fin === 'lenticular' || o.alt !== undefined) {
    // a lenticular: two pictures interlaced in strips; tilt sideways and the strips turn from one to the other
    const m = o.alt !== undefined ? (o.alt ? 1 : 0) : smooth((tilt.x - 0.1) / 0.5);
    drawArt(g, card, Object.assign({}, base, { alt: false }));
    if (m > 0.001) {
      const sw = fin === 'lenticular' ? 5 : 3.5;
      g.save(); g.beginPath(); for (let x = -130; x < 130; x += sw) g.rect(x, -105, sw * m, 210); g.clip();
      g.fillStyle = PAPER; g.fillRect(-130, -105, 260, 210); drawArt(g, card, Object.assign({}, base, { alt: true })); g.restore();
    }
    if (!ST.holo) {                                                       // the ridges of the lens
      g.save(); g.globalAlpha = fin === 'lenticular' ? 0.16 : 0.07; g.fillStyle = '#ffffff'; const sw = fin === 'lenticular' ? 5 : 3.5, off = ((tilt.x * 7) % sw + sw) % sw;
      for (let x = -130 + off; x < 130; x += sw) g.fillRect(x, -105, sw * 0.35, 210); g.restore();
      if (fin === 'lenticular') { g.save(); g.globalCompositeOperation = 'overlay'; const gr = g.createLinearGradient(-130 + tilt.x * 80, -100, 130 + tilt.x * 80, 100);
        ['#ff5f6d', '#ffc371', '#7cff9c', '#5fd3ff', '#b78cff', '#ff5f6d'].forEach((c, i) => gr.addColorStop(i / 5, rgba(c, 0.38))); g.fillStyle = gr; g.fillRect(-130, -105, 260, 210); g.restore(); }
    }
  } else drawArt(g, card, base);
  g.restore();
}
// the First Edition's picture with "depth that feels endless": frames falling away to a vanishing point that follows the tilt
function tunnel(g, tilt, card) {
  g.save(); const vx = -tilt.x * 46, vy = -tilt.y * 34;
  g.fillStyle = '#efe6d2'; g.fillRect(-130, -105, 260, 210);
  for (let i = 0; i < 12; i++) { const s = Math.pow(0.78, i + 1), x = vx * (1 - s), y = vy * (1 - s);
    g.strokeStyle = rgba('#7a6a50', 0.22 * s + 0.04); g.lineWidth = 1.2 * s + 0.3; g.beginPath(); const P = rectPts(x - 122 * s, y - 97 * s, x + 122 * s, y + 97 * s, 22 * s, 4); trace(g, P, true, true); g.stroke(); }
  for (let i = 0; i < 40; i++) { const z = 0.15 + H2(i, 51) * 0.85, x = (H2(i, 52) - 0.5) * 240 * z + vx * (1 - z), y = (H2(i, 53) - 0.5) * 190 * z + vy * (1 - z); g.fillStyle = rgba('#5a4a30', 0.25 + 0.3 * z); g.beginPath(); g.arc(x, y, 0.5 + z, 0, Math.PI * 2); g.fill(); }
  g.restore();
}

// ══ FINISHES (his canon, 10-CARDS.md): which rarity gets which is not decided yet, so each is just a render option ═══
//   plain       the EP7 print
//   laminate    a thin plastic border with silver tessellated sprinkles, a flat lenticular picture
//   first       FIRST EDITION: thick metal, an onyx gem top right, embossed lettering, a 3D picture with endless depth, a light sweep
//   lenticular  the whole picture is a lenticular pair, with a rainbow sheen
const FIN = { plain: 0, laminate: 7, first: 17, lenticular: 0 };
function draw(g, card, x, y, w, opts) {
  const o = Object.assign({ finish: 'plain', t: 0, tilt: { x: 0, y: 0 } }, opts || {}), k = w / 300, m = FIN[o.finish] || 0;
  g.save(); g.translate(x, y); g.scale(k, k); g.lineJoin = 'round'; g.lineCap = 'round';
  if (o.finish === 'laminate') laminate(g, o);
  if (o.finish === 'first') metal(g, o);
  const s = (300 - 2 * m) / 300;
  g.save(); g.translate(m, (420 - 420 * s) / 2); g.scale(s, s);
  face(g, card, Object.assign({}, o, { emboss: o.finish === 'first' }));
  g.restore();
  if (o.finish === 'first') { gem(g, o); sweep(g, o, 0.42); }
  if (o.finish === 'laminate') sweep(g, o, 0.12);
  if (o.finish === 'lenticular') sweep(g, o, 0.10);
  g.restore();
}
function laminate(g, o) {
  const P = rectPts(0, 0, 300, 420, 18, 6);
  g.save(); g.beginPath(); trace(g, P, true, true); g.fillStyle = '#dfe6ee'; g.fill(); g.clip();
  // silver tessellated sprinkles: a triangle tiling, each tile catching the light at its own tilt
  const s = 7, h = s * 0.866;
  for (let r = 0; r * h < 420 + h; r++) for (let c = -1; c * s < 300 + s; c++) for (const up of [0, 1]) {
    const x = c * s + (r % 2 ? s / 2 : 0) + (up ? s / 2 : 0), y = r * h, inner = x > 5 && x < 288 && y > 5 && y < 408;
    if (inner) continue;
    const hsh = H2(r * 131 + c, up + 5), lit = Math.pow(c01(0.5 + 0.5 * Math.cos(hsh * 12 + o.tilt.x * 4 + o.tilt.y * 3)), 6);
    const v = Math.round(120 + 135 * lit + 30 * hsh); g.fillStyle = 'rgba(' + v + ',' + Math.min(255, v + 6) + ',' + Math.min(255, v + 16) + ',' + (0.55 + 0.45 * lit) + ')';
    g.beginPath(); if (up) { g.moveTo(x, y + h); g.lineTo(x + s / 2, y); g.lineTo(x + s, y + h); } else { g.moveTo(x, y); g.lineTo(x + s, y); g.lineTo(x + s / 2, y + h); } g.closePath(); g.fill();
  }
  g.restore();
  g.save(); g.beginPath(); trace(g, P, true, true); g.strokeStyle = 'rgba(120,130,145,0.9)'; g.lineWidth = 1.4; g.stroke(); g.restore();
}
function metal(g, o) {
  const P = rectPts(0, 0, 300, 420, 20, 6), tx = o.tilt.x, ty = o.tilt.y;
  g.save(); g.beginPath(); trace(g, P, true, true);
  const gr = g.createLinearGradient(0 + tx * 60, 0 + ty * 60, 300 + tx * 60, 420 + ty * 60);
  [['#3d4048', 0], ['#9ea3ad', 0.22], ['#50545e', 0.4], ['#c9ccd3', 0.58], ['#4a4d56', 0.78], ['#8c919b', 1]].forEach(([c, s]) => gr.addColorStop(s, c));
  g.fillStyle = gr; g.fill(); g.clip();
  g.globalAlpha = 0.12; g.strokeStyle = '#ffffff'; g.lineWidth = 0.5;                                 // brushed
  for (let y = 0; y < 420; y += 1.6) { g.beginPath(); g.moveTo(0, y + H2(y * 10, 3) * 0.8); g.lineTo(300, y + H2(y * 10, 4) * 0.8); g.stroke(); }
  g.restore();
  g.save(); g.beginPath(); trace(g, P, true, true); g.lineWidth = 3; g.strokeStyle = '#1e2026'; g.stroke();
  const I = rectPts(13, 13, 287, 407, 15, 6); g.beginPath(); trace(g, I, true, true); g.lineWidth = 2; g.strokeStyle = 'rgba(255,255,255,0.55)'; g.stroke();
  for (const [x, y] of [[9, 210], [291, 210], [150, 9], [150, 411]]) { const rg = g.createRadialGradient(x - 1, y - 1, 0.5, x, y, 4); rg.addColorStop(0, '#f3f4f7'); rg.addColorStop(1, '#4a4d56'); g.fillStyle = rg; g.beginPath(); g.arc(x, y, 3.4, 0, Math.PI * 2); g.fill(); }   // rivets
  g.restore();
}
function gem(g, o) {                                                      // the onyx gem, top right (📖)
  const x = 268, y = 32, r = 17, tx = o.tilt.x, ty = o.tilt.y;
  g.save();
  const bz = g.createLinearGradient(x - r, y - r, x + r, y + r); bz.addColorStop(0, '#e9ebef'); bz.addColorStop(0.5, '#6d717b'); bz.addColorStop(1, '#d4d7dd');
  g.fillStyle = bz; g.beginPath(); g.arc(x, y, r + 4, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#1e2026'; g.lineWidth = 1.6; g.stroke();
  const on = g.createRadialGradient(x - 5 - tx * 6, y - 6 - ty * 6, 1, x, y, r); on.addColorStop(0, '#5a5f6e'); on.addColorStop(0.35, '#15161b'); on.addColorStop(1, '#050507');
  g.fillStyle = on; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.18)'; g.lineWidth = 0.8;                                         // facets
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; g.beginPath(); g.moveTo(x + Math.cos(a) * r * 0.45, y + Math.sin(a) * r * 0.45); g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); g.stroke(); }
  g.beginPath(); for (let i = 0; i <= 8; i++) { const a = i / 8 * Math.PI * 2; g.lineTo(x + Math.cos(a) * r * 0.45, y + Math.sin(a) * r * 0.45); } g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.85)'; g.beginPath(); g.ellipse(x - 6 - tx * 5, y - 7 - ty * 5, 4, 2.2, -0.6, 0, Math.PI * 2); g.fill();
  g.restore();
}
function sweep(g, o, strength) {                                          // a band of light across the card, following the tilt (and the clock, when sweep: 'auto')
  const P = rectPts(0, 0, 300, 420, 18, 6);
  let p = 0.5 + o.tilt.x * 0.55 - o.tilt.y * 0.35;
  if (o.sweep === 'auto') p = ((o.t || 0) * 0.35) % 1.6 - 0.3;
  const cx = -150 + p * 600, gr = g.createLinearGradient(cx - 45, -30, cx + 45, 30);
  gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,' + strength + ')'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.save(); g.beginPath(); trace(g, P, true, true); g.clip(); g.globalCompositeOperation = 'lighter'; g.fillStyle = gr; g.fillRect(0, 0, 300, 420); g.restore();
}

// ══ THE BACK: the Poptart (🎬 EP7, crimped crust, pink frosting, sprinkles in his digit colours, HALO ALIQUID NIHIL) ══
function drawBack(g, x, y, w, opts) {
  const o = opts || {}, k = w / 300, bk = boil(o.t || 0);
  g.save(); g.translate(x, y); g.scale(k, k);
  ink(g, rectPts(0, 0, 300, 420, 14, 6), { fill: '#e8b98a', lw: 5, amp: 0.6, seed: 31, bk, poly: true });
  for (let i = 0; i < 26; i++) { const u = i / 26; dot(g, 14 + u * 272, 14, 3, '#b07a52'); dot(g, 14 + u * 272, 406, 3, '#b07a52'); }
  for (let i = 0; i < 36; i++) { const u = i / 36; dot(g, 14, 14 + u * 392, 3, '#b07a52'); dot(g, 286, 14 + u * 392, 3, '#b07a52'); }
  ink(g, rectPts(38, 44, 262, 376, 26, 6), { fill: '#f0a0c8', lw: 3.5, amp: 0.8, seed: 32, bk, poly: true });
  for (let i = 0; i < 40; i++) { const sx = 50 + H2(i, 3) * 200, sy = 56 + H2(i, 7) * 308, a = H2(i, 11) * Math.PI, c = DIGIT[i % 10]; if (Math.abs(sy - 214) < 42) continue;
    g.save(); g.translate(sx, sy); g.rotate(a); g.fillStyle = c; g.strokeStyle = INK; g.lineWidth = 1; g.fillRect(-7, -2.2, 14, 4.4); g.strokeRect(-7, -2.2, 14, 4.4); g.restore(); }
  uText(g, 'HALO ALIQUID', 150, 206, 21, { align: 'center', t: o.t || 0, seed: 211 }); uText(g, 'NIHIL', 150, 240, 21, { align: 'center', t: o.t || 0, seed: 245 });
  g.restore();
}

// ══ THE HOLOGRAM: a played card stands up as cyan light in dark space (canon: a card played on the table becomes one) ══
//   draws the card's picture as light, its name over it, scanlines and a flicker. x, y = top-left, w × h.
function drawHolo(g, card, x, y, w, h, opts) {
  const o = opts || {}, t = o.t || 0, k = Math.min(w / 300, h / 250), fl = 0.86 + 0.14 * (0.5 + 0.5 * Math.sin(t * 31)) * (H2(Math.floor(t * 12), 7) > 0.2 ? 1 : 0.6);
  g.save(); g.globalAlpha = (o.alpha === undefined ? 1 : o.alpha) * fl;
  g.translate(x + w / 2, y + h * 0.56); g.scale(k, k);
  ST.holo = true; ST.glow = 6 * k * (o.dpr || 1);
  try { drawArt(g, card, { t, tilt: { x: 0, y: 0 }, depth: 0, alt: !!o.alt }); uText(g, card.name, 0, -104, 13, { align: 'center', t, seed: 5 }); }
  finally { ST.holo = false; ST.glow = 0; }
  g.restore();
  g.save(); g.globalAlpha = 0.18 * (o.alpha === undefined ? 1 : o.alpha); g.fillStyle = '#001018';       // scanlines
  for (let yy = y; yy < y + h; yy += 3 * (o.dpr || 1)) g.fillRect(x, yy + ((t * 40) % 3), w, 1 * (o.dpr || 1)); g.restore();
}

function render(card, opts) {
  const o = Object.assign({ w: 300, dpr: 1 }, opts || {}), c = (o.canvas || document.createElement('canvas'));
  c.width = Math.round(o.w * o.dpr); c.height = Math.round(o.w * 1.4 * o.dpr);
  const g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height);
  if (o.back) drawBack(g, 0, 0, c.width, o); else draw(g, card, 0, 0, c.width, o);
  return c;
}

// ══ A LIVE CARD in the page: tilt toward the cursor, the finish answers the tilt, play() = the hologram moment ══════
//   ctl = HaloCards.mount(el, card, { w: 240, finish: 'plain' });  ctl.setFinish('first');  ctl.play();  ctl.destroy();
//   HaloCards.clock: a function returning seconds; replace it to drive the animation frame by frame (recording).
let CSS_DONE = false;
function css() {
  if (CSS_DONE || typeof document === 'undefined') return; CSS_DONE = true;
  const s = document.createElement('style'); s.textContent =
    '.hc-wrap{position:relative;display:inline-block;perspective:900px;}' +
    '.hc-card{position:relative;transform-style:preserve-3d;will-change:transform;border-radius:5%;}' +
    '.hc-card canvas{display:block;border-radius:5%;}' +
    '.hc-shadow{position:absolute;left:8%;right:8%;bottom:-6%;height:10%;border-radius:50%;background:radial-gradient(rgba(0,0,0,.45),rgba(0,0,0,0) 70%);pointer-events:none;}' +
    '.hc-pad{position:absolute;left:50%;bottom:-6%;width:150%;height:40%;transform:translateX(-50%);border-radius:50%;pointer-events:none;opacity:0;' +
      'background:radial-gradient(ellipse at center,rgba(127,243,255,.55),rgba(0,188,212,.12) 45%,rgba(0,0,0,0) 70%);}' +
    '.hc-holo{position:absolute;left:50%;bottom:20%;transform-origin:50% 100%;pointer-events:none;opacity:0;}';
  document.head.appendChild(s);
}
const api = { clock: () => performance.now() / 1000 };
function mount(el, card, opts) {
  css();
  const o = Object.assign({ w: 240, finish: 'plain', boil: true }, opts || {}), dpr = o.dpr || Math.min(2, (typeof devicePixelRatio !== 'undefined' ? devicePixelRatio : 1));
  const wrap = document.createElement('div'); wrap.className = 'hc-wrap'; wrap.style.width = o.w + 'px'; wrap.style.height = o.w * 1.4 + 'px';
  const pad = document.createElement('div'); pad.className = 'hc-pad';
  const shadow = document.createElement('div'); shadow.className = 'hc-shadow';
  const cardEl = document.createElement('div'); cardEl.className = 'hc-card';
  const cv = document.createElement('canvas'); cv.style.width = o.w + 'px'; cv.style.height = o.w * 1.4 + 'px';
  const holo = document.createElement('canvas'), HW = o.w * 1.25, HH = o.w * 1.15; holo.className = 'hc-holo'; holo.width = HW * dpr; holo.height = HH * dpr; holo.style.width = HW + 'px'; holo.style.height = HH + 'px'; holo.style.marginLeft = -HW / 2 + 'px';
  cardEl.appendChild(cv); wrap.append(pad, shadow, cardEl, holo); el.appendChild(wrap);
  const st = { finish: o.finish, tx: 0, ty: 0, gx: 0, gy: 0, over: false, playing: -1, raf: 0, dead: false, lastBoil: -1, card };
  const paint = (t) => { render(st.card, { canvas: cv, w: o.w, dpr, finish: st.finish, t: o.boil ? t : 0, tilt: { x: st.tx, y: st.ty }, sweep: o.sweep }); };
  const onMove = e => { const r = wrap.getBoundingClientRect(); st.gx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1)); st.gy = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1)); st.over = true; kick(); };
  const onLeave = () => { st.gx = 0; st.gy = 0; st.over = false; kick(); };
  wrap.addEventListener('pointermove', onMove); wrap.addEventListener('pointerleave', onLeave);
  function frame() {
    st.raf = 0; if (st.dead) return;
    const t = api.clock(); st.tx += (st.gx - st.tx) * 0.18; st.ty += (st.gy - st.ty) * 0.18;
    let pose = { rx: -st.ty * 14, ry: st.tx * 16, z: st.over ? 18 : 0, s: 1, lay: 0, holo: 0, pad: 0, glow: 0 };
    if (st.playing >= 0) pose = playPose(t - st.playing, pose);
    cardEl.style.transform = `translateY(${-pose.z * 0.6 + pose.lay * o.w * 0.42}px) translateZ(${pose.z}px) rotateX(${pose.rx + pose.lay * 72}deg) rotateY(${pose.ry * (1 - pose.lay)}deg) scale(${pose.s})`;
    cardEl.style.filter = pose.glow ? `drop-shadow(0 0 ${12 * pose.glow}px rgba(127,243,255,${0.9 * pose.glow}))` : '';
    shadow.style.opacity = String(0.6 - pose.lay * 0.5); pad.style.opacity = String(pose.pad);
    const b = boil(t), moving = Math.abs(st.gx - st.tx) > 0.002 || Math.abs(st.gy - st.ty) > 0.002;
    if (moving || (st.over && b !== st.lastBoil) || st.playing >= 0) { paint(t); st.lastBoil = b; }
    if (pose.holo > 0) { holo.style.opacity = '1'; holo.style.transform = `scaleY(${pose.holo}) scaleX(${0.6 + 0.4 * pose.holo})`;
      const hg = holo.getContext('2d'); hg.setTransform(1, 0, 0, 1, 0, 0); hg.clearRect(0, 0, holo.width, holo.height);
      const cone = hg.createLinearGradient(0, holo.height, 0, 0); cone.addColorStop(0, 'rgba(127,243,255,0.30)'); cone.addColorStop(1, 'rgba(127,243,255,0)');
      hg.fillStyle = cone; hg.beginPath(); hg.moveTo(holo.width * 0.3, holo.height); hg.lineTo(holo.width * 0.7, holo.height); hg.lineTo(holo.width, 0); hg.lineTo(0, 0); hg.closePath(); hg.fill();
      drawHolo(hg, st.card, 0, 0, holo.width, holo.height * 0.92, { t, dpr, alt: (t - st.playing) > 2.2, alpha: Math.min(1, pose.holo * 1.3) });
    } else holo.style.opacity = '0';
    if (st.playing >= 0 && t - st.playing > PLAY_LEN) st.playing = -1;
    if (st.over || moving || st.playing >= 0) kick();
  }
  function kick() { if (!o.manual && !st.raf && !st.dead) st.raf = requestAnimationFrame(frame); }   // manual: the caller calls ctl.frame() (recording)
  paint(0); kick();
  return {
    el: wrap, canvas: cv,
    setFinish(f) { st.finish = f; paint(api.clock()); kick(); },
    setCard(c) { st.card = c; paint(api.clock()); },
    play() { st.playing = api.clock(); kick(); },
    frame,                                                                // one frame now (for recording with a replaced clock)
    tiltTo(x, y, snap) { st.gx = x; st.gy = y; st.over = !!(x || y); if (snap) { st.tx = x; st.ty = y; } kick(); },
    destroy() { st.dead = true; if (st.raf) cancelAnimationFrame(st.raf); wrap.remove(); },
  };
}
// the play moment, as a function of seconds since play(): lift · lay on the table · it lights · the hologram stands up · it settles
const PLAY_LEN = 5.0;
function playPose(s, p) {
  const k = (a, b) => smooth((s - a) / (b - a));
  const lift = k(0, 0.45) * (1 - k(0.45, 0.9)), lay = k(0.45, 1.0) * (1 - k(4.3, 5.0)), light = k(0.9, 1.3) * (1 - k(4.2, 4.8));
  const up = k(1.15, 1.9) * (1 - k(3.9, 4.5)), wobble = up * Math.sin(s * 9) * 0.04 * (1 - k(1.9, 2.4));
  return { rx: p.rx * (1 - lay), ry: p.ry, z: p.z + lift * 70, s: 1 + lift * 0.08, lay, glow: light, pad: light * 0.95, holo: Math.max(0, up + wobble) };
}

api._eval = src => eval(src);                                             // dev only: stage.html loads an art/*.js file into this scope to try it
Object.assign(api, { DIGIT, draw, render, drawBack, drawHolo, drawArt, mount, playPose, PLAY_LEN, ART, uText, uWidth, version: '0.1' });
root.HaloCards = api;
if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
