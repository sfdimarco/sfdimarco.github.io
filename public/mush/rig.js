/* Mush, drawn by the show's own rig: mm_core.js, mm_palette2020.js, mm_cast.js, mm_cast2020.js and mm_motion.js from the GeoV episode blocks, poured into one scope the way GeoV does. The rig files are unedited; MM_SCN is GeoV's scene registry, stubbed. */
window.MushRig = (function () {
const MM_SCN = {};
// ── mm_core.js
// ═══════════════════════════════════════════════════════════════════════════════════════
// MM CORE · the grammar every shot of SQUARE EYES shares: numbers, colours, marker ink,
//   paper, and two alphabets (Mook's marker capitals and TV Gurl's square letters).
//   Every name starts mm / MM so it can never shadow a p5 word.
//   Nothing uses random(): GeoV reseeds it every frame. mmHash() is stable forever.
// ═══════════════════════════════════════════════════════════════════════════════════════
const MM_W = 1280, MM_H = 720, MM_FPS = 30;

// ── numbers ──────────────────────────────────────────────────────────────────────────
function mmHash(n) { n = n | 0; n = Math.imul(n ^ (n >>> 16), 0x45d9f3b); n = Math.imul(n ^ (n >>> 16), 0x45d9f3b); n = n ^ (n >>> 16); return (n >>> 0) / 4294967296; }
function mmH2(a, b) { return mmHash(Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663) ^ 0x5bd1e995); }
function mmH3(a, b, c) { return mmHash(Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663) ^ Math.imul(c | 0, 83492791)); }
function mmClamp(x, a, b) { return x < a ? a : x > b ? b : x; }
function mmC01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
function mmLerp(a, b, k) { return a + (b - a) * k; }
function mmSeg(x, a, b) { return b === a ? (x >= b ? 1 : 0) : mmC01((x - a) / (b - a)); }   // 0 before a, 1 after b
function mmSmooth(k) { k = mmC01(k); return k * k * (3 - 2 * k); }
function mmIO(k) { k = mmC01(k); return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }
function mmOut(k) { k = mmC01(k); return 1 - Math.pow(1 - k, 3); }
function mmIn(k) { k = mmC01(k); return k * k * k; }
function mmBack(k, s) { k = mmC01(k); const c = s === undefined ? 1.70158 : s; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); }
function mmPulse(x, a, b, fin, fout) { return mmSeg(x, a, a + fin) * (1 - mmSeg(x, b - fout, b)); }
function mmVN1(x, seed) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return mmLerp(mmH2(i, seed | 0), mmH2(i + 1, seed | 0), u); }
function mmSN1(x, seed) { return mmVN1(x, seed) * 2 - 1; }
function mmVN2(x, y, seed) {
  const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy), s = seed | 0;
  return mmLerp(mmLerp(mmH3(i, j, s), mmH3(i + 1, j, s), ux), mmLerp(mmH3(i, j + 1, s), mmH3(i + 1, j + 1, s), ux), uy);
}
// a cartoon is drawn ON TWOS: every drawing is held for two frames (15 drawings a second)
function mmTwos(t) { return Math.floor(t * 15 + 1e-6) / 15; }
// and the marker line BOILS: it is redrawn 7.5 times a second, never quite the same
function mmBoil(t) { return Math.floor(t * 7.5 + 1e-6); }

// ── keys: mmKey(t, [[t0, v0], [t1, v1, 'io'], ...]) → value (number, array or object) ──
function mmEase(name, k) {
  k = mmC01(k);
  switch (name) {
    case 'lin': return k; case 'in': return mmIn(k); case 'out': return mmOut(k); case 'hold': return k < 1 ? 0 : 1;
    case 'back': return mmBack(k); case 'snap': return mmBack(k, 2.6); case 'smooth': return mmSmooth(k);
    default: return mmIO(k);
  }
}
function mmMixAny(a, b, k) {
  if (typeof a === 'number' && typeof b === 'number') return a + (b - a) * k;
  if (Array.isArray(a) && Array.isArray(b)) return a.map((v, i) => mmMixAny(v, b[i], k));
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const o = {}; for (const key in a) o[key] = key in b ? mmMixAny(a[key], b[key], k) : a[key];
    for (const key in b) if (!(key in a)) o[key] = b[key]; return o;
  }
  return k < 0.5 ? a : b;
}
function mmKey(t, K) {
  if (t <= K[0][0]) return K[0][1];
  for (let i = 1; i < K.length; i++) if (t < K[i][0]) {
    const a = K[i - 1], b = K[i]; return mmMixAny(a[1], b[1], mmEase(b[2] || 'io', (t - a[0]) / (b[0] - a[0])));
  }
  return K[K.length - 1][1];
}

// ── colour ───────────────────────────────────────────────────────────────────────────
//   MOOK: red | teal, straight off his hand-coloured title card (the hood lining maroon | navy,
//   the sprigs blue). MUSH: bright blue | pink-red. TV GURL: off his drawing of her.
const MM = {
  ink: '#1c1a21', paper: '#f6f1e5', white: '#fdfcf5',
  mkRed: '#d33440', mkTeal: '#4db6c8', mkMaroon: '#7c1b27', mkNavy: '#223f95', mkSprig: '#2848a8',
  muBlue: '#3b79e0', muRed: '#e8506a', muFace: '#f6ebcb', muSpot: '#e7d4a2', muEyePink: '#f2a7b9', muYellow: '#f2c230',
  tvPink: '#d27d9e', tvBlue: '#6e95f2', tvScreen: '#f6b4c3', tvBezel: '#c9bfaa', tvLeg: '#b9b09c', tvDark: '#26222c',
  mouth: '#3c1925', tongue: '#e0707d',
};
// his number colours: 0 cyan · 1 red · 2 blue · 3 yellow · 4 green · 5 orange · 6 pink · 7 purple · 8 white · 9 black
const MM_DIG = { '0': '#10A6B8', '1': '#D7263D', '2': '#2455D3', '3': '#F2C230', '4': '#2FA84F', '5': '#F07A1A', '6': '#EE6AA7', '7': '#7B3FB5', '8': '#FFFFFF', '9': '#161616' };
// Mush speaks in colour (Boomwhacker): C red · D orange · E yellow · F green · G teal · A purple · B pink
const MM_NOTE = { C: '#e0323f', D: '#f07a1a', E: '#f2c230', F: '#2fa84f', G: '#14a6b5', A: '#7b3fb5', B: '#ee6aa7' };
function mmRGB(h) {
  if (h[0] === 'r') { const m = h.match(/[\d.]+/g); return [+m[0], +m[1], +m[2]]; }
  h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mmRGBA(h, a) { const c = mmRGB(h); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
function mmMix(h1, h2, k) { const a = mmRGB(h1), b = mmRGB(h2); return 'rgb(' + [0, 1, 2].map(i => Math.round(mmLerp(a[i], b[i], mmC01(k)))).join(',') + ')'; }
function mmShade(h, k) { return k >= 0 ? mmMix(h, '#ffffff', k) : mmMix(h, '#000000', -k); }

// ── the lens GeoV applies before draw() is kept, so everything is drawn in stage units ──
let MM_M = null;
function mmBegin(g, bg) {
  MM_M = g.getTransform();
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  g.fillStyle = bg || MM.paper; g.fillRect(0, 0, g.canvas.width, g.canvas.height); g.restore();
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.lineJoin = 'round'; g.lineCap = 'round'; g.setLineDash([]);
}

// ── MARKER INK ───────────────────────────────────────────────────────────────────────
//   A shape is a list of points. The ink is a Catmull-Rom curve through them, wobbled by
//   smooth noise that changes on every boil (so the line breathes, it never jitters).
function mmWob(P, seed, amp, bk) {
  if (!amp) return P;
  const n = P.length, out = new Array(n);
  for (let i = 0; i < n; i++) {
    const u = i * 0.37 + bk * 5.31;
    out[i] = [P[i][0] + mmSN1(u, seed * 7 + 1) * amp, P[i][1] + mmSN1(u + 71.3, seed * 7 + 2) * amp];
  }
  return out;
}
function mmTrace(g, P, closed, poly) {
  const n = P.length; if (n < 2) return;
  g.moveTo(P[0][0], P[0][1]);
  if (poly) { for (let i = 1; i < n; i++) g.lineTo(P[i][0], P[i][1]); if (closed) g.closePath(); return; }
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = P[closed ? (i - 1 + n) % n : Math.max(0, i - 1)], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[closed ? (i + 2) % n : Math.min(n - 1, i + 2)];
    g.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
  }
  if (closed) g.closePath();
}
// o: { fill, lw, ink, closed (true), seed, amp, bk, alpha }
function mmInk(g, P, o) {
  const Q = o.amp ? mmWob(P, o.seed | 0, o.amp, o.bk | 0) : P;
  const closed = o.closed !== false;
  // a closed shape of six points or fewer is ARCHITECTURE (straight lines); more points = a drawn curve
  const poly = o.poly !== undefined ? o.poly : (closed && P.length <= 6);
  g.beginPath(); mmTrace(g, Q, closed, poly);
  if (o.fill && closed) { g.fillStyle = o.fill; g.fill(); }
  if (o.lw) { g.lineWidth = o.lw; g.strokeStyle = o.ink || MM.ink; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); }
  return Q;
}
// a closed shape filled with TWO colours either side of a seam (seam: open polyline, top → bottom,
// running past the shape at both ends). colL fills left of the seam.
function mmSplit(g, P, seam, colL, colR, o) {
  const Q = o.amp ? mmWob(P, o.seed | 0, o.amp, o.bk | 0) : P;
  g.save();
  g.beginPath(); mmTrace(g, Q, true); g.fillStyle = colR; g.fill(); g.clip();
  g.beginPath(); g.moveTo(seam[0][0] - 4000, seam[0][1]);
  for (const p of seam) g.lineTo(p[0], p[1]);
  g.lineTo(seam[seam.length - 1][0] - 4000, seam[seam.length - 1][1]); g.closePath();
  g.fillStyle = colL; g.fill();
  if (o.seamLw) { g.beginPath(); mmTrace(g, seam, false); g.lineWidth = o.seamLw; g.strokeStyle = o.ink || MM.ink; g.stroke(); }
  g.restore();
  if (o.lw) { g.beginPath(); mmTrace(g, Q, true); g.lineWidth = o.lw; g.strokeStyle = o.ink || MM.ink; g.lineJoin = 'round'; g.stroke(); }
  return Q;
}
// a limb: one constant-width noodle through its points, inked (round ends)
function mmTube(g, P, w, col, lw, o) {
  o = o || {};
  const Q = o.amp ? mmWob(P, o.seed | 0, o.amp, o.bk | 0) : P;
  g.lineJoin = 'round'; g.lineCap = o.cap || 'round';
  g.beginPath(); mmTrace(g, Q, false);
  g.strokeStyle = o.ink || MM.ink; g.lineWidth = w + 2 * lw; g.stroke();
  g.strokeStyle = col; g.lineWidth = w; g.stroke();
  return Q;
}
function mmCirclePts(cx, cy, rx, ry, n, rot, lump, seed) {
  const P = []; const c = Math.cos(rot || 0), s = Math.sin(rot || 0);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, k = 1 + (lump || 0) * (mmSN1(i * 0.9, seed | 0) * 0.6 + Math.sin(a * 2 + (seed | 0)) * 0.4);
    const x = Math.cos(a) * rx * k, y = Math.sin(a) * ry * k;
    P.push([cx + x * c - y * s, cy + x * s + y * c]);
  }
  return P;
}
function mmRectPts(x0, y0, x1, y1, r, per) {       // a rounded rectangle as points (for wobble)
  const P = [], k = per || 4;
  const corner = (cx, cy, a0) => { for (let i = 0; i <= k; i++) { const a = a0 + (i / k) * Math.PI / 2; P.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
  corner(x1 - r, y0 + r, -Math.PI / 2); corner(x1 - r, y1 - r, 0); corner(x0 + r, y1 - r, Math.PI / 2); corner(x0 + r, y0 + r, Math.PI);
  return P;
}
function mmDot(g, x, y, r, col) { g.beginPath(); g.arc(x, y, Math.max(0.3, r), 0, Math.PI * 2); g.fillStyle = col; g.fill(); }

// ── THE PAPER: the whole film is marker on paper. Made once, shared by every clip. ───
function mmMakePaper() {
  const W = MM_W, H = MM_H, c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d'), im = x.createImageData(W, H), d = im.data;
  for (let y = 0; y < H; y++) for (let i = 0; i < W; i++) {
    const big = mmVN2(i / 210, y / 210, 11) * 0.6 + mmVN2(i / 70, y / 70, 12) * 0.4;
    const streak = mmVN2((i * 0.8 + y * 0.6) / 5.5, (i * 0.6 - y * 0.8) / 90, 13);   // marker strokes, on the diagonal
    const grain = mmH2(i * 7919 + 13, y);
    let v = 0.965 + 0.03 * big + 0.018 * streak - 0.035 * grain * grain * grain;
    v = Math.min(1, v);
    const o = (y * W + i) * 4; d[o] = 255 * v; d[o + 1] = 255 * Math.min(1, v * 0.997 + 0.002); d[o + 2] = 255 * Math.min(1, v * 0.985 + 0.01); d[o + 3] = 255;
  }
  x.putImageData(im, 0, 0);
  return c;
}
function mmPaper() { return window.__mmPaper || (window.__mmPaper = mmMakePaper()); }
// the finish: paper grain over everything, in screen space. Sets its own alpha and blend (a lesson
// Finnegans Weights paid for: a finish pass must never inherit the state of the last thing drawn).
function mmFinish(g, o) {
  o = o || {};
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = o.paper === undefined ? 1 : o.paper; g.globalCompositeOperation = 'multiply';
  g.drawImage(mmPaper(), 0, 0, g.canvas.width, g.canvas.height);
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  if (o.fade) { g.fillStyle = mmRGBA(o.fadeCol || '#000000', mmC01(o.fade)); g.fillRect(0, 0, g.canvas.width, g.canvas.height); }
  g.restore();
}

// ── MOOK'S MARKER CAPITALS (single strokes on a 4 × 6 grid, y down, baseline 6) ─────
const MM_CAPS = {
  A: [[[0, 6], [2, 0], [4, 6]], [[0.8, 3.8], [3.2, 3.8]]],
  B: [[[0, 6], [0, 0], [2.8, 0], [3.6, 0.8], [3.6, 2.2], [2.8, 3], [0, 3]], [[2.8, 3], [3.8, 3.8], [3.8, 5.2], [3, 6], [0, 6]]],
  C: [[[4, 1], [3, 0], [1, 0], [0, 1], [0, 5], [1, 6], [3, 6], [4, 5]]],
  D: [[[0, 0], [0, 6], [2.6, 6], [4, 4.6], [4, 1.4], [2.6, 0], [0, 0]]],
  E: [[[4, 0], [0, 0], [0, 6], [4, 6]], [[0, 3], [3, 3]]],
  F: [[[4, 0], [0, 0], [0, 6]], [[0, 3], [3, 3]]],
  G: [[[4, 1], [3, 0], [1, 0], [0, 1], [0, 5], [1, 6], [3, 6], [4, 5], [4, 3.4], [2.4, 3.4]]],
  H: [[[0, 0], [0, 6]], [[4, 0], [4, 6]], [[0, 3], [4, 3]]],
  I: [[[1, 0], [3, 0]], [[2, 0], [2, 6]], [[1, 6], [3, 6]]],
  J: [[[1, 0], [4, 0]], [[3, 0], [3, 5], [2, 6], [1, 6], [0, 5]]],
  K: [[[0, 0], [0, 6]], [[4, 0], [0, 3.6]], [[1.3, 2.6], [4, 6]]],
  L: [[[0, 0], [0, 6], [4, 6]]],
  M: [[[0, 6], [0, 0], [2, 3.4], [4, 0], [4, 6]]],
  N: [[[0, 6], [0, 0], [4, 6], [4, 0]]],
  O: [[[1, 0], [3, 0], [4, 1], [4, 5], [3, 6], [1, 6], [0, 5], [0, 1], [1, 0]]],
  P: [[[0, 6], [0, 0], [3, 0], [4, 0.8], [4, 2.4], [3, 3.2], [0, 3.2]]],
  Q: [[[1, 0], [3, 0], [4, 1], [4, 5], [3, 6], [1, 6], [0, 5], [0, 1], [1, 0]], [[2.6, 4.4], [4.2, 6.4]]],
  R: [[[0, 6], [0, 0], [3, 0], [4, 0.8], [4, 2.4], [3, 3.2], [0, 3.2]], [[1.8, 3.2], [4, 6]]],
  S: [[[4, 1], [3, 0], [1, 0], [0, 1], [0, 2.2], [1, 3], [3, 3], [4, 3.8], [4, 5], [3, 6], [1, 6], [0, 5]]],
  T: [[[0, 0], [4, 0]], [[2, 0], [2, 6]]],
  U: [[[0, 0], [0, 5], [1, 6], [3, 6], [4, 5], [4, 0]]],
  V: [[[0, 0], [2, 6], [4, 0]]],
  W: [[[0, 0], [1, 6], [2, 2.6], [3, 6], [4, 0]]],
  X: [[[0, 0], [4, 6]], [[4, 0], [0, 6]]],
  Y: [[[0, 0], [2, 3], [4, 0]], [[2, 3], [2, 6]]],
  Z: [[[0, 0], [4, 0], [0, 6], [4, 6]]],
  '0': [[[1, 0], [3, 0], [4, 1], [4, 5], [3, 6], [1, 6], [0, 5], [0, 1], [1, 0]]],
  '1': [[[1, 1], [2, 0], [2, 6]], [[1, 6], [3, 6]]],
  '2': [[[0, 1], [1, 0], [3, 0], [4, 1], [4, 2.3], [0, 6], [4, 6]]],
  '3': [[[0, 0.8], [1, 0], [3, 0], [4, 0.9], [4, 2.2], [3, 3], [1.6, 3]], [[3, 3], [4, 3.8], [4, 5.1], [3, 6], [1, 6], [0, 5.2]]],
  '4': [[[3, 6], [3, 0], [0, 4], [4, 4]]],
  '5': [[[4, 0], [0.4, 0], [0, 2.8], [2.8, 2.6], [4, 3.6], [4, 5], [3, 6], [1, 6], [0, 5.2]]],
  '6': [[[3.6, 0.3], [2.6, 0], [1, 0], [0, 1.2], [0, 5], [1, 6], [3, 6], [4, 5], [4, 3.6], [3, 2.8], [1, 2.8], [0, 3.6]]],
  '7': [[[0, 0], [4, 0], [1.4, 6]]],
  '8': [[[2, 3], [0.6, 2.2], [0.6, 0.8], [1.4, 0], [2.6, 0], [3.4, 0.8], [3.4, 2.2], [2, 3], [0, 4], [0, 5.2], [1, 6], [3, 6], [4, 5.2], [4, 4], [2, 3]]],
  '9': [[[4, 2.6], [3, 3.3], [1, 3.3], [0, 2.4], [0, 1], [1, 0], [3, 0], [4, 1], [4, 5], [3, 6], [1, 6], [0.4, 5.6]]],
  '.': [[[2, 5.7], [2, 6]]], ',': [[[2.2, 5.6], [1.6, 6.8]]], '!': [[[2, 0], [2, 4.2]], [[2, 5.7], [2, 6]]],
  '?': [[[0, 1], [1, 0], [3, 0], [4, 1], [4, 2], [2, 3.4], [2, 4.2]], [[2, 5.7], [2, 6]]],
  "'": [[[2, 0], [1.8, 1.4]]], '-': [[[0.8, 3.2], [3.2, 3.2]]], ':': [[[2, 1.7], [2, 2]], [[2, 5.7], [2, 6]]],
  '&': [[[4, 6], [0.8, 1.6], [1.2, 0.2], [2.6, 0.2], [2.8, 1.4], [0, 4], [0, 5.2], [1, 6], [2.4, 6], [4, 3.8]]],
  '(': [[[2.8, 0], [1.6, 1.6], [1.6, 4.4], [2.8, 6]]], ')': [[[1.2, 0], [2.4, 1.6], [2.4, 4.4], [1.2, 6]]],
  '"': [[[1.4, 0], [1.3, 1.3]], [[2.6, 0], [2.5, 1.3]]], '/': [[[4, 0], [0, 6]]], '·': [[[2, 3], [2, 3.2]]], '%': [[[4, 0.2], [0, 5.8]], [[1.70, 1.20], [1.47, 1.77], [0.90, 2.00], [0.33, 1.77], [0.10, 1.20], [0.33, 0.63], [0.90, 0.40], [1.47, 0.63], [1.70, 1.20]], [[3.90, 4.80], [3.67, 5.37], [3.10, 5.60], [2.53, 5.37], [2.30, 4.80], [2.53, 4.23], [3.10, 4.00], [3.67, 4.23], [3.90, 4.80]]],
};
const MM_CAPS_ADV = { I: 4.2, '1': 4.2, '.': 3, ',': 3, '!': 3, "'": 3, ':': 3, ' ': 3.2, '·': 3 };
function mmCapsWidth(str, size, track) {
  let w = 0; for (const ch of str) w += (MM_CAPS_ADV[ch] || 5) + (track || 0); return w * size / 6;
}
// hand lettering. o: { size (cap height px), col (fill), out (outline px), w (stroke px), align, seed,
//   jit (how hand-made), bk (boil), alpha, each(i, ch) -> {dx, dy, rot, s, col, a} }
function mmCaps(g, str, x, y, o) {
  o = o || {};
  const size = o.size || 40, u = size / 6, jit = o.jit === undefined ? 1 : o.jit, seed = o.seed | 0, bk = o.bk | 0;
  const w = o.w || size * 0.13, out = o.out === undefined ? 0 : o.out;
  const total = mmCapsWidth(str, size, o.track);
  let cx = o.align === 'c' ? x - total / 2 : o.align === 'r' ? x - total : x;
  const chars = [...str], passes = [];
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i].toUpperCase(), adv = ((MM_CAPS_ADV[ch] || 5) + (o.track || 0)) * u, gl = MM_CAPS[ch];
    if (gl) {
      const e = o.each ? (o.each(i, ch) || {}) : {};
      const rot = (mmH2(seed + i, 1) - 0.5) * 0.12 * jit + (e.rot || 0), s = (1 + (mmH2(seed + i, 2) - 0.5) * 0.12 * jit) * (e.s || 1);
      const dy = (mmH2(seed + i, 3) - 0.5) * 0.12 * size * jit + (e.dy || 0), dx = e.dx || 0;
      const gcx = cx + adv / 2 - ((o.track || 0) * u) / 2 + dx, gcy = y - 3 * u + dy;   // the glyph turns about its own centre
      const cr = Math.cos(rot), sr = Math.sin(rot);
      const strokes = gl.map((st, k) => st.map(([gx, gy], j) => {
        const lx = (gx - 2) * u * s, ly = (gy - 3) * u * s;
        const wx = mmSN1(j * 0.9 + bk * 3.1 + k * 7, seed * 31 + i) * u * 0.07 * jit, wy = mmSN1(j * 0.9 + bk * 3.1 + k * 7 + 50, seed * 31 + i) * u * 0.07 * jit;
        return [gcx + lx * cr - ly * sr + wx, gcy + lx * sr + ly * cr + wy];
      }));
      passes.push({ strokes, col: e.col || o.col || MM.ink, a: e.a === undefined ? 1 : e.a });
    }
    cx += adv;
  }
  g.save(); g.lineJoin = 'round'; g.lineCap = 'round';
  const drawPass = (width, colOf) => {
    for (const p of passes) {
      if (p.a <= 0.003) continue; g.globalAlpha = (o.alpha === undefined ? 1 : o.alpha) * p.a;
      g.strokeStyle = colOf(p); g.lineWidth = width;
      for (const st of p.strokes) { g.beginPath(); mmTrace(g, st, false); g.stroke(); }
    }
  };
  if (out) drawPass(w + 2 * out, () => o.outCol || MM.ink);
  drawPass(w, p => p.col);
  g.restore(); g.globalAlpha = 1;
  return total;
}

// ── TV GURL'S SQUARE LETTERS (5 × 7: she sees in squares, so she writes in squares) ──
const MM_PIX = {
  A: [14, 17, 17, 31, 17, 17, 17], B: [30, 17, 17, 30, 17, 17, 30], C: [14, 17, 16, 16, 16, 17, 14], D: [28, 18, 17, 17, 17, 18, 28],
  E: [31, 16, 16, 30, 16, 16, 31], F: [31, 16, 16, 30, 16, 16, 16], G: [14, 17, 16, 23, 17, 17, 15], H: [17, 17, 17, 31, 17, 17, 17],
  I: [14, 4, 4, 4, 4, 4, 14], J: [7, 2, 2, 2, 2, 18, 12], K: [17, 18, 20, 24, 20, 18, 17], L: [16, 16, 16, 16, 16, 16, 31],
  M: [17, 27, 21, 21, 17, 17, 17], N: [17, 17, 25, 21, 19, 17, 17], O: [14, 17, 17, 17, 17, 17, 14], P: [30, 17, 17, 30, 16, 16, 16],
  Q: [14, 17, 17, 17, 21, 18, 13], R: [30, 17, 17, 30, 20, 18, 17], S: [15, 16, 16, 14, 1, 1, 30], T: [31, 4, 4, 4, 4, 4, 4],
  U: [17, 17, 17, 17, 17, 17, 14], V: [17, 17, 17, 17, 17, 10, 4], W: [17, 17, 17, 21, 21, 21, 10], X: [17, 17, 10, 4, 10, 17, 17],
  Y: [17, 17, 10, 4, 4, 4, 4], Z: [31, 1, 2, 4, 8, 16, 31],
  '0': [14, 17, 19, 21, 25, 17, 14], '1': [4, 12, 4, 4, 4, 4, 14], '2': [14, 17, 1, 2, 4, 8, 31], '3': [31, 2, 4, 2, 1, 17, 14],
  '4': [2, 6, 10, 18, 31, 2, 2], '5': [31, 16, 30, 1, 1, 17, 14], '6': [6, 8, 16, 30, 17, 17, 14], '7': [31, 1, 2, 4, 8, 8, 8],
  '8': [14, 17, 17, 14, 17, 17, 14], '9': [14, 17, 17, 15, 1, 2, 12],
  '.': [0, 0, 0, 0, 0, 12, 12], ':': [0, 12, 12, 0, 12, 12, 0], '!': [4, 4, 4, 4, 4, 0, 4], '?': [14, 17, 1, 2, 4, 0, 4],
  ',': [0, 0, 0, 0, 12, 4, 8], "'": [4, 4, 8, 0, 0, 0, 0], ' ': [0, 0, 0, 0, 0, 0, 0], '-': [0, 0, 0, 31, 0, 0, 0],
};
// o: { cell (px per square), col, gap (0..1 of a cell), align ('c'), colOf(i, ch) }
function mmPixText(g, str, x, y, o) {
  o = o || {}; const c = o.cell || 6, gap = o.gap === undefined ? 0.12 : o.gap, adv = 6 * c;
  const total = str.length * adv - c;
  const x0 = o.align === 'c' ? x - total / 2 : o.align === 'r' ? x - total : x;
  [...str].forEach((ch, i) => {
    const rows = MM_PIX[ch.toUpperCase()]; if (!rows) return;
    g.fillStyle = o.colOf ? o.colOf(i, ch) : (o.col || MM.tvDark);
    for (let r = 0; r < 7; r++) for (let k = 0; k < 5; k++) if (rows[r] & (16 >> k)) {
      g.fillRect(x0 + i * adv + k * c + gap * c / 2, y + r * c + gap * c / 2, c * (1 - gap), c * (1 - gap));
      if (o.ink) { g.save(); g.strokeStyle = MM.tvDark; g.lineWidth = Math.max(1, c * 0.14); g.strokeRect(x0 + i * adv + k * c + gap * c / 2, y + r * c + gap * c / 2, c * (1 - gap), c * (1 - gap)); g.restore(); }
    }
  });
  return total;
}

// ── mm_palette2020.js
// ═══════════════════════════════════════════════════════════════════════════════════════
// MM PALETTE 2020 · a PALETTE SWAP, nothing else. Load it straight after mm_core.js.
//   Mook's own flat palette from 2020 (his palette card: Y #FFFE3C · R #EB6D83 · B #6092DB ·
//   S #9FAFB4 · W #FFEDED, and a black line), plus colours sampled from his 2020 drawings
//   (fifixed1.png the lineup, mook.png, mush.png, cast.png TV Gurl).
//   Only VALUES change. Every part keeps the MM key it had, so the construction and which part
//   gets which colour are exactly the film's. Take this file out of MY BLOCKS to get the film's
//   colours back (or, inside one clip: Object.assign(MM, MM_FILM)).
//   ⚑ = no 2020 source: made from its mapped colour the same way the film made it.
//   The full table: outputs/ep03/sheets/recolour_mapping.md
//   ⚠ Not reachable from here (hard-coded in mm_cast.js, not in MM): Mush's helmet glass '#dfeefa'.
// ═══════════════════════════════════════════════════════════════════════════════════════
const MM_FILM = Object.assign({}, MM);          // the film's colours, kept for an A/B inside one clip
const MM_PALETTE_2020 = {
  ink: '#000000',        // his black line (the core of his crayon line is pure black)
  paper: '#f6f1e5',      // unchanged: the background, not a character colour
  white: '#FFEDED',      // W · eye whites (his 2020 Mook eyes are exactly W)
  // MOOK
  mkRed: '#EB6D83',      // R
  mkTeal: '#6092DB',     // B · Mook's blue half
  mkMaroon: '#883F4C',   // ⚑ hood lining, his right: R darkened x0.58 (the film's maroon is its red x0.58)
  mkNavy: '#38557F',     // ⚑ hood lining, left + right eye rim: B darkened x0.58 (it also colours that eye's pupil)
  mkSprig: '#000000',    // his three hairs are black lines in 2020 (the title card had them blue)
  // MUSH
  muBlue: '#6092DB',     // B
  muRed: '#EB6D83',      // R
  muFace: '#EDEDDC',     // sampled: his moon face
  muSpot: '#D2D2B9',     // sampled: his moon spots
  muEyePink: '#F5B6C1',  // ⚑ the droopy lid on the small eye: R halfway to white (the film's pink is its red halfway to white)
  muYellow: '#FFFE3C',   // Y · the zip pull (his 2020 Mush buttons sample #FCFC3D, the same yellow)
  // TV GURL (sampled from cast.png: it holds exactly these five fills and a black line)
  tvPink: '#CF7B98',     // pink stripes, antenna balls, feet
  tvBlue: '#6890FF',     // blue stripes
  tvScreen: '#F4ADBA',   // the screen
  tvBezel: '#C3BEAE',    // the bezel, the side, the button panel
  tvLeg: '#C3BEAE',      // legs and antennae: the same khaki as the bezel in his drawing
  tvDark: '#000000',     // her face: eyes, nose, smile are black
  // MOUTHS
  mouth: '#000000',      // sampled: his 2020 Mook's mouth is a filled black shape
  tongue: '#F199A8',     // ⚑ R 30% toward white (the film's tongue is its red 30% toward white)
};
Object.assign(MM, MM_PALETTE_2020);

// ── mm_cast.js
// ═══════════════════════════════════════════════════════════════════════════════════════
// MM CAST · MOOK, MUSH and TV GURL, drawn in marker, built on Mook's one law:
//   "it's a sphere with a line down the middle to make it easy to spin."
//   seam_x = centre + sin(yaw) × halfWidth · at the BACK the two colours SWAP SIDES (mmPair)
//   yaw: 0 = looking at us · +π/2 = facing screen-right · π = back to us
//   Body space: X = screen-right when he faces us (so his RIGHT side is at −X), Y = down, Z = toward us.
// ═══════════════════════════════════════════════════════════════════════════════════════

// every two-colour fill goes through here, so the back view can never be forgotten on one part
function mmPair(yaw, rightSide, leftSide) { return Math.cos(yaw) >= 0 ? [rightSide, leftSide] : [leftSide, rightSide]; }
function mmProj(X, Z, yaw) { const c = Math.cos(yaw), s = Math.sin(yaw); return [X * c + Z * s, -X * s + Z * c]; }   // [screen x, depth]
// the visible meridian of a round thing: front meridian when we see the front, the back one otherwise
function mmSeamAng(yaw) { return Math.cos(yaw) >= 0 ? yaw : yaw + Math.PI; }

// 3-D two-bone limb: shoulder S, hand target H, lengths, pole = where the elbow points. Returns the elbow.
function mmIK(S, H, L1, L2, pole) {
  let dx = H[0] - S[0], dy = H[1] - S[1], dz = H[2] - S[2]; let d = Math.hypot(dx, dy, dz) || 1e-6;
  const dmax = (L1 + L2) * 0.999; if (d > dmax) { const k = dmax / d; dx *= k; dy *= k; dz *= k; d = dmax; }
  const n = [dx / d, dy / d, dz / d];
  const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  const pd = pole[0] * n[0] + pole[1] * n[1] + pole[2] * n[2];
  let p = [pole[0] - pd * n[0], pole[1] - pd * n[1], pole[2] - pd * n[2]]; const pl = Math.hypot(p[0], p[1], p[2]) || 1;
  p = [p[0] / pl, p[1] / pl, p[2] / pl];
  return { E: [S[0] + a * n[0] + h * p[0], S[1] + a * n[1] + h * p[1], S[2] + a * n[2] + h * p[2]], H: [S[0] + dx, S[1] + dy, S[2] + dz] };
}

// a mitt: palm + four splayed fingers, pointing along `ang` (radians, screen), size u
function mmMitt(g, x, y, ang, u, col, lw, o) {
  o = o || {};
  const fist = o.fist || 0, spread = o.spread === undefined ? 1 : o.spread, flip = o.flip ? -1 : 1;
  const ca = Math.cos(ang), sa = Math.sin(ang);
  const at = (f, s) => [x + ca * f - sa * s * flip, y + sa * f + ca * s * flip];
  const fl = u * (0.62 - 0.4 * fist), fw = u * 0.3;
  // fingers first, so the palm's ink covers their roots
  for (let k = 0; k < 4; k++) {
    const a = (k - 1.5) * 0.36 * spread * (1 - 0.6 * fist);
    const b = at(u * 0.35, (k - 1.5) * u * 0.2 * (1 - 0.3 * fist));
    const tip = [b[0] + (ca * Math.cos(a) - sa * Math.sin(a) * flip) * fl, b[1] + (sa * Math.cos(a) + ca * Math.sin(a) * flip) * fl];
    mmTube(g, [b, tip], fw, col, lw);
  }
  const P = mmCirclePts(x + ca * u * 0.12, y + sa * u * 0.12, u * 0.46, u * 0.4, 12, ang, 0.04, 5);
  mmInk(g, P, { fill: col, lw: lw });
}

// where a thumb points (body space, y down): forward and a little up, square to the forearm, a little toward the body
function mmThumbDir(E, W, out) {
  let d = [W[0] - E[0], W[1] - E[1], W[2] - E[2]]; const dl = Math.hypot(d[0], d[1], d[2]) || 1; d = [d[0] / dl, d[1] / dl, d[2] / dl];
  let f = [-out * 0.25, -0.35, 1], k = f[0] * d[0] + f[1] * d[1] + f[2] * d[2];
  let t = [f[0] - k * d[0], f[1] - k * d[1], f[2] - k * d[2]], tl = Math.hypot(t[0], t[1], t[2]);
  if (tl < 0.3) { f = [-out * 0.3, -1, 0.2]; k = f[0] * d[0] + f[1] * d[1] + f[2] * d[2]; t = [f[0] - k * d[0], f[1] - k * d[1], f[2] - k * d[2]]; tl = Math.hypot(t[0], t[1], t[2]) || 1; }
  return [t[0] / tl, t[1] / tl, t[2] / tl];
}
// THE HAND AS A .geo NODE. Mook, 2026-10-01: "think tubes and how blood from the heart pumps a clock to joints so these
//   finger tubes are on the clock but they are also how grabs ect works and the redundecy in /geo should be the perfect
//   kind of thing to map that movement so its easy to phisicaly predict then map and call".
//   A .geo mask has four bits, one per quadrant; here one per DIGIT (the .geo layout, the string reads TL TR BR BL):
//     bit 3 (8) TL = index · bit 2 (4) TR = middle · bit 1 (2) BR = ring · bit 0 (1) BL = thumb · 1 = that digit closes.
//   PREDICT: every mask is one fixed pose (each digit: its three joints at their full bend).
//   MAP: the 16 masks, and the .geo loop families as gestures (GATE fist/open, Y_LOOP a finger roll, DIAG a pinch …).
//   CALL: a gesture name, a mask, a list of masks (one a beat), a family, or [[beat, mask], …] → mmHandClock.
const MM_HAND_BIT = { i: 8, m: 4, r: 2, t: 1 };
const MM_HAND_GESTURE = {
  open: '0000', fist: '1111', grab: '1111', point: '0111', one: '0111', thumbsUp: '1110', pinch: '1001', ok: '1001',
  peace: '0011', two: '0011', three: '0001', fingerGun: '0110', hold: '1111',
  // DEPTH 2 (a .geo node per digit, its own four bits: knuckle · middle · tip · spread; the thumb: base · middle · tip · out),
  // written index middle ring thumb. A real pinch: the index's knuckle and middle joint bend, its tip stays straight (the
  // pad meets the thumb's pad); the thumb swings across with its tip straight.
  pinch2: '1100 0000 0000 1100', ok2: '1100 0001 0001 1100', hook: '0110 0110 0110 0000', flat: '1000 1000 1000 0000',
  claw: '0111 0111 0111 0110', spread: '0001 0001 0001 0001', cup: '1100 1100 1100 1000',
};
const MM_HAND_FAMILY = {                                   // the .geo loop families (BinaryQuadTreeTest.py), as gestures
  Y_LOOP: ['1000', '0100', '0010', '0001'],                // one digit at a time: index → middle → ring → thumb (drumming)
  X_LOOP: ['1100', '0101', '0011', '1010'],                // a pair cycling
  Z_LOOP: ['0111', '1011', '1101', '1110'],                // all but one (point, then …)
  DIAG_LOOP: ['1001', '0110'],                             // pinch ↔ finger gun
  GATE: ['0000', '1111'],                                  // open ↔ fist (a grab, a pump)
};
function mmHandBits(m) {                                    // '1001' | 9 | 'pinch' → the four digits' targets {i, m, r, t} (0/1)
  if (typeof m === 'string' && MM_HAND_GESTURE[m]) m = MM_HAND_GESTURE[m];
  if (typeof m === 'string' && m.replace(/\s/g, '').length === 16) { const J = mmHandJoints(m); const o = {}; for (const d of ['i', 'm', 'r', 't']) o[d] = (J[d][0] + J[d][1] + J[d][2]) / 3 > 0.5 ? 1 : 0; return o; }
  const n = typeof m === 'number' ? m : parseInt(m, 2) || 0;
  return { i: (n >> 3) & 1, m: (n >> 2) & 1, r: (n >> 1) & 1, t: n & 1 };
}
// every joint's target: depth 1 (4 bits: a digit closes all its joints) or depth 2 (16 bits: each joint, and the spread)
function mmHandJoints(m) {
  if (typeof m === 'string' && MM_HAND_GESTURE[m]) m = MM_HAND_GESTURE[m];
  const str = typeof m === 'string' ? m.replace(/\s/g, '') : null, o = {};
  if (str && str.length === 16) { ['i', 'm', 'r', 't'].forEach((d, k) => { o[d] = [0, 1, 2, 3].map(j => str[k * 4 + j] === '1' ? 1 : 0); }); return o; }
  const b = mmHandBits(m); for (const d of ['i', 'm', 'r', 't']) o[d] = [b[d], b[d], b[d], 0];
  return o;
}
// THE CLOCK: one heartbeat drives the hand. A change of mask leaves the heart on its beat and reaches every joint of a
// digit in turn (the knuckle, then the middle joint, then the tip: a pulse down a tube), each digit a hair after the
// last, so a grab ROLLS down the fingers. Pure function of t (any frame alone). → {mask, curls: {i: [k, m, t], m, r, t}}
//   prog: a gesture name or mask (held), a list of masks (one a beat, looping), a family name (its cycle), or
//         [[beat, mask], …] (keys; holds after the last). o: { bpm (100), t0 (0), pulse (s joint→joint, 0.05),
//         stagger (s digit→digit, 0.025), close (s for one joint to close, 0.14), from (the mask before beat 0), loop }
function mmHandClock(t, prog, o) {
  o = o || {};
  const B = 60 / (o.bpm || 100), t0 = o.t0 || 0, pulse = o.pulse === undefined ? 0.05 : o.pulse;
  const stag = o.stagger === undefined ? 0.025 : o.stagger, close = o.close || 0.14;
  let seq = null, keys = null;
  if (typeof prog === 'string' && MM_HAND_FAMILY[prog]) seq = MM_HAND_FAMILY[prog];
  else if (Array.isArray(prog) && prog.length && Array.isArray(prog[0])) keys = prog;
  else if (Array.isArray(prog)) seq = prog;
  const maskAt = (n) => {
    if (n < 0) return o.from !== undefined ? o.from : (keys ? keys[0][1] : seq ? seq[0] : prog);
    if (keys) { let m = keys[0][1]; for (const k of keys) if (k[0] <= n) m = k[1]; return m; }
    if (seq) return o.loop === false ? seq[Math.min(n, seq.length - 1)] : seq[n % seq.length];
    return prog;
  };
  const nNow = Math.floor((t - t0) / B), order = { i: 0, m: 1, r: 2, t: 3 }, curls = {};
  for (const d of ['i', 'm', 'r', 't']) {
    curls[d] = [0, 1, 2].map((j) => {
      // walk the last few beats: each change arrives at this joint pulse·j + stagger·digit after its beat
      let v = mmHandJoints(maskAt(nNow - 5))[d][j];
      for (let n = nNow - 4; n <= nNow; n++) {
        const want = mmHandJoints(maskAt(n))[d][j], arrive = t0 + n * B + j * pulse + order[d] * stag;
        if (t >= arrive && want !== v) { const k = mmIO((t - arrive) / close); v = k >= 1 ? want : mmLerp(v, want, k); }
        else if (t < arrive) break;
      }
      return v;
    });
  }
  return { mask: maskAt(nNow), curls };
}

// A HAND, REAL UNDERNEATH (Mook: "look at anatomy 3 fingers 1 thumb"; "they need 3 joint per finger.. or you can noodle
//   all of the parts"; "ur at micky mouse but we have maps of real hands bones muscles and joits lets find a fast way to
//   make that predictable in geo"). A tiny 3-D skeleton, posed by the real joints, drawn as tubes:
//   BONES · adult averages (mm; after Buryanov & Kotiuk, "Proportions of Hand Segments", 2010): the index, middle and
//     ring (3 fingers, as Mook draws them) with their three phalanges each; the thumb's metacarpal and two phalanges.
//   JOINTS · real ranges: knuckle (MCP) −20…90°, middle (PIP) 0…105°, tip (DIP) −5…80°; the thumb's base (CMC) swings it
//     across the palm, its MCP 0…55°, its IP −10…75°.
//   MUSCLES · the real couplings, so a pose is predictable: one tendon (FDP) bends the tip with the middle joint (tip ≈ ⅔
//     of the middle); the ring drags the middle, the middle drags the index (enslaving); closing fingers converge toward
//     the thumb's base; the ring side of the palm cups; a relaxed hand rests in a cascade (index least bent, ring most).
//   PREDICTABLE IN .geo: the four digits are a .geo mask (mmHandBits); each joint's 0..1 comes from the heartbeat clock
//     (mmHandClock: knuckle → middle → tip, index → thumb). Same input, same hand, from any angle.
//   toon: 0 = real proportions · 1 = Mickey (shorter, fatter fingers); noodle: 1 = rubber hose, 0 = jointed.
const MM_HAND_MM = {                                       // mm: [proximal, middle, distal] (+ the knuckle's place)
  i: { p: [39.8, 22.4, 15.8], s: 1, f: -0.012 }, m: { p: [44.6, 26.3, 17.4], s: 0, f: 0 }, r: { p: [41.4, 25.7, 17.3], s: -1, f: -0.03 },
  t: { mc: 46.2, p: [32.4, 23.0] },
};
const MM_HAND_LEN = 172;                                   // mm, wrist to the middle fingertip (the hand's length = u)
const MM_HAND_REST = { i: [15, 22, 10], m: [20, 30, 13], r: [27, 38, 18] };    // degrees: the relaxed cascade
function mmV(a, b, k) { return [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k]; }
function mmN3(v) { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
function mmX3(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
function mmD3(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
// a hand's frame from where its arm points (body space, y down): F along the hand, S toward the thumb, N out of the palm
function mmHandFrame(E, W, out, side) {
  const F = mmN3([W[0] - E[0], W[1] - E[1], W[2] - E[2]]), S = mmThumbDir(E, W, out);
  return { F, S, N: side === 'R' ? mmX3(F, S) : mmX3(S, F) };
}
//   x, y = the wrist; ang = the forearm on screen; u = the hand's length.
//   o: { frame: {F, S, N} (SCREEN space: x right, y down, z toward us; from mmHandFrame, projected), curls: {i, m, r, t:
//        [knuckle, middle, tip] 0..1} (mmHandClock), or mask ('1001' / a gesture name), or the old fist / point;
//        relax (0..1, how much of the resting cascade), spread (fan, 0..1.5), toon, noodle, wrist: [bend, side] (rad),
//        thumb / flip (no frame: where the thumb points on screen, which side) }
function mmHand(g, x, y, ang, u, col, lw, o) {
  o = o || {};
  const toon = mmC01(o.toon === undefined ? 0.6 : o.toon), noodle = mmC01(o.noodle === undefined ? 1 : o.noodle);
  const spread = o.spread === undefined ? 0.6 : o.spread, relax = mmC01(o.relax === undefined ? (o.curl === undefined ? 1 : o.curl / 0.3) : o.relax);
  let CU = o.curls;
  if (!CU) {
    CU = {};
    if (o.mask !== undefined) { const J = mmHandJoints(o.mask); for (const d of ['i', 'm', 'r', 't']) CU[d] = J[d].slice(0, 3); CU.spread = J; }
    else { const f = mmC01(o.fist || 0), p = mmC01(o.point || 0) > 0.5, bits = { i: p ? 0 : f, m: p ? 1 : f, r: p ? 1 : f, t: p ? 1 : f };
      for (const d of ['i', 'm', 'r', 't']) CU[d] = [bits[d], bits[d], bits[d]]; }
  }
  // THE FRAME on screen (x right, y down, z toward us)
  let F, S, N;
  if (o.frame) { F = mmN3(o.frame.F); S = mmN3(o.frame.S); N = mmN3(o.frame.N); }
  else {
    F = [Math.cos(ang), Math.sin(ang), 0];
    const th = o.thumb ? mmN3(o.thumb) : [-Math.sin(ang) * (o.flip ? -1 : 1), Math.cos(ang) * (o.flip ? -1 : 1), 0.35];
    S = mmN3(mmV(th, F, -mmD3(th, F))); N = o.flip ? mmX3(S, F) : mmX3(F, S);
  }
  if (o.wrist) {                                            // the wrist bends the hand (flexion toward the palm, then sideways)
    const wb = o.wrist[0] || 0, ws = o.wrist[1] || 0;
    const F1 = mmN3(mmV(mmV([0, 0, 0], F, Math.cos(wb)), N, Math.sin(wb))), N1 = mmN3(mmV(mmV([0, 0, 0], N, Math.cos(wb)), F, -Math.sin(wb)));
    F = mmN3(mmV(mmV([0, 0, 0], F1, Math.cos(ws)), S, Math.sin(ws))); S = mmN3(mmV(mmV([0, 0, 0], S, Math.cos(ws)), F1, -Math.sin(ws))); N = N1;
  }
  const W0 = [x, y, 0];
  const H = (f, s, n) => mmV(mmV(mmV(W0, F, f * u), S, s * u), N, n * u);   // hand space (×u) → screen
  // THE MUSCLES: joint activations → angles. Enslaving first (the ring drags the middle, the middle the index).
  const act = {};
  for (const d of ['i', 'm', 'r']) act[d] = CU[d].slice();
  for (let j = 0; j < 3; j++) {
    const i0 = CU.i[j], m0 = CU.m[j], r0 = CU.r[j];
    act.i[j] = mmC01(i0 + 0.12 * m0 * (1 - i0)); act.m[j] = mmC01(m0 + (0.15 * i0 + 0.3 * r0) * (1 - m0)); act.r[j] = mmC01(r0 + 0.42 * m0 * (1 - r0));
  }
  const D2R = Math.PI / 180, kF = mmLerp(1, 0.84, toon), fwR = mmLerp(0.105, 0.165, toon);
  const fingers = [];
  const knuckleS = { i: 0.16, m: 0.015, r: -0.13 }, palmL = mmLerp(0.49, 0.56, toon);
  for (const d of ['i', 'm', 'r']) {
    const B = MM_HAND_MM[d], a = act[d], rest = MM_HAND_REST[d], aAvg = (a[0] + a[1] + a[2]) / 3;
    const sp = CU.spread ? 1 + 1.4 * CU.spread[d][3] : 1;
    const conv = { i: -4, m: 4, r: 11 }[d], fan = { i: 13, m: 1, r: -11 }[d] * spread * sp;
    const abd = (fan * (1 - aAvg) + conv * aAvg) * D2R;
    // MCP, PIP from the clock; the tip rides the middle joint (FDP: ⅔), with its own late arrival
    const mcp = (rest[0] * relax * (1 - a[0]) + 90 * a[0]) * D2R;
    const pip = (rest[1] * relax * (1 - a[1]) + 105 * a[1]) * D2R;
    const dipOwn = (rest[2] * relax * (1 - a[2]) + 80 * a[2]) * D2R, dip = mmLerp(dipOwn, Math.min(dipOwn, pip * 0.67) + Math.max(0, dipOwn - pip * 0.67) * 0.3, 0.85);
    const cup = d === 'r' ? 0.035 * aAvg : 0;
    let p = H(palmL + B.f, knuckleS[d], -0.02 + cup);
    // the finger's direction: along the hand, turned by abduction (about N)
    let dir = mmN3(mmV(mmV([0, 0, 0], F, Math.cos(abd)), S, Math.sin(abd))), nb = N.slice();
    const pts = [p], lens = B.p.map(v => v / MM_HAND_LEN * kF);
    [mcp, pip, dip].forEach((th, j) => {
      const c = Math.cos(th), s2 = Math.sin(th), d2 = mmV(mmV([0, 0, 0], dir, c), nb, s2), n2 = mmV(mmV([0, 0, 0], nb, c), dir, -s2);
      dir = mmN3(d2); nb = mmN3(n2); p = mmV(p, dir, lens[j] * u); pts.push(p);
    });
    fingers.push({ d, pts, w: u * fwR * (d === 'm' ? 1 : 0.96), aAvg, tipFront: pts[3][2] - pts[0][2] });
  }
  // THE THUMB: its base (CMC) low on the palm's thumb side. Each bone's direction is keyed in hand space (f along the
  // hand, s toward the thumb side, n out of the palm) between OPEN (abducted, a thumbs-up) and CLOSED (lying across the
  // curled fingers, its tip by the middle finger): measured off real hands, so every in-between is predictable.
  const T = MM_HAND_MM.t, at = CU.t, tAvg = (at[0] + at[1] + at[2]) / 3, kT = mmLerp(1, 0.9, toon);
  const TH_OPEN = [[0.55, 0.62, 0.42], [0.78, 0.5, 0.2], [0.88, 0.36, 0.08]], TH_SHUT = [[0.78, 0.0, 0.62], [0.42, -0.86, 0.2], [0.12, -0.96, -0.2]];
  const TH_LEN = [T.mc * 0.72, T.p[0], T.p[1]];
  let tp = H(0.1, 0.11, 0.035); const tpts = [tp];
  for (let j = 0; j < 3; j++) {
    const k = mmSmooth(at[j]), o3 = TH_OPEN[j], c3 = TH_SHUT[j], rl = j ? 0.15 * relax * (1 - k) : 0;
    const v = mmN3([mmLerp(o3[0], c3[0], k) - rl, mmLerp(o3[1], c3[1], k), mmLerp(o3[2], c3[2], k) + rl]);
    const dir = mmN3(mmV(mmV(mmV([0, 0, 0], F, v[0]), S, v[1]), N, v[2]));
    tp = mmV(tp, dir, TH_LEN[j] / MM_HAND_LEN * kT * u); tpts.push(tp);
  }
  const tw = u * fwR * 1.1;
  // THE PALM: a solid (the wrist, the knuckle line, the thumb's fleshy root), its silhouette from any side
  const PP = [];
  for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2, c = Math.cos(a), s2 = Math.sin(a);
    PP.push(H(0.03, c * 0.115, s2 * 0.055));
    PP.push(H(palmL * 0.55, c * 0.17 + 0.01, s2 * 0.07));
    PP.push(H(palmL - 0.015, (c > 0 ? c * (0.16 + fwR * 0.5) : c * (0.13 + fwR * 0.5)) + 0.0, s2 * 0.065 + 0.01)); }
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; PP.push(H(0.16 + Math.cos(a) * 0.07, 0.12 + Math.sin(a) * 0.05, 0.05)); }
  const hull = (P) => { const Q = P.map(p => [p[0], p[1]]).sort((p, q) => p[0] - q[0] || p[1] - q[1]);
    const cr = (o2, a, b) => (a[0] - o2[0]) * (b[1] - o2[1]) - (a[1] - o2[1]) * (b[0] - o2[0]), lo = [], up = [];
    for (const p of Q) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (let i = Q.length - 1; i >= 0; i--) { const p = Q[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
    return lo.slice(0, -1).concat(up.slice(0, -1)); };
  const palm = hull(PP);
  // the digits as tubes: noodle = a curve through the joints; jointed = straight bones with small round knuckles
  const tubePts = (P) => {
    const Q = P.map(p => [p[0], p[1]]);
    if (noodle >= 0.999) return Q;
    const k = 0.18 * (1 - noodle), J = [Q[0]];
    for (let i = 0; i < Q.length - 1; i++) { const A = Q[i], B2 = Q[i + 1];
      if (i > 0) J.push([mmLerp(A[0], B2[0], k), mmLerp(A[1], B2[1], k)]);
      if (i < Q.length - 2) J.push([mmLerp(A[0], B2[0], 1 - k), mmLerp(A[1], B2[1], 1 - k)]);
      J.push(B2); }
    return J;
  };
  const front = (tipFront) => tipFront > u * 0.06;            // the digit comes toward us, off the palm
  const thumbF = tpts[3][2] - tpts[0][2], thumbFront = front(thumbF) || (tAvg > 0.5 && N[2] > -0.2);
  const back = fingers.filter(F2 => !front(F2.tipFront)).sort((a, b) => a.pts[2][2] - b.pts[2][2]);
  const fore = fingers.filter(F2 => front(F2.tipFront)).sort((a, b) => a.pts[2][2] - b.pts[2][2]);
  const tube = (P, w, c, l) => { g.lineJoin = 'round'; g.lineCap = 'round'; g.beginPath(); mmTrace(g, P, false); g.strokeStyle = c; g.lineWidth = w + (l || 0); g.stroke(); };
  // (EP9) o.held(g): a thing held in this hand, drawn between the hand's far parts and its near parts: palm to us, over the
  //   palm and under the fingers that curl toward us; back of the hand to us, under the palm and over the fingers curled
  //   away. So the hand closes round it from every side. Old episodes never pass it.
  let heldDone = !o.held; const doHeld = () => { if (!heldDone) { heldDone = true; o.held(g); } };
  if (!thumbFront) mmTube(g, tubePts(tpts.slice(1)), tw, col, lw);
  for (const F2 of back) mmTube(g, tubePts(F2.pts), F2.w, col, lw);
  if (N[2] < 0) doHeld();
  // the palm and an open thumb in front of it as ONE shape: all the ink, then all the colour
  const mergeThumb = thumbFront && tAvg <= 0.5;
  g.beginPath(); mmTrace(g, palm, true); g.lineJoin = 'round'; g.lineWidth = lw * 2; g.strokeStyle = MM.ink; g.stroke();
  if (mergeThumb) tube(tubePts(tpts), tw, MM.ink, 2 * lw);
  g.beginPath(); mmTrace(g, palm, true); g.fillStyle = col; g.fill();
  if (mergeThumb) tube(tubePts(tpts), tw, col, 0);
  doHeld();
  for (const F2 of fore) mmTube(g, tubePts(F2.pts), F2.w, col, lw);
  if (thumbFront && !mergeThumb) mmTube(g, tubePts(tpts.slice(1)), tw, col, lw);
}

// ─────────────────────────────────────────────────────────────────────────────────────
//  MOOK
// ─────────────────────────────────────────────────────────────────────────────────────
//  Built off his drawings: Mookdrawing.jpg (the line: round head a quarter of him, huge eyes wide
//  apart with tiny pupils, the lightning-bolt seam from between the eyes to a cross mouth, the hoodie's
//  cowl with two ring-ended drawstrings, square pocket, zip, noodle arms, mitts, long tube legs) and
//  the hand-coloured title card (the checkerboard: head red|teal, cowl red|teal lined maroon|navy,
//  torso teal|red; eye rims the OPPOSITE colour of the field they sit in; three blue sprigs).
//  ⚠ The card stops at the chest. Arms, hands, legs and shoes keep flipping segment by segment
//    (the crash-test-dummy rule) — that part is my reading, flagged in the notes.
const MK_SIDE = {   // [his RIGHT side, his LEFT side]
  head: ['mkRed', 'mkTeal'], hood: ['mkRed', 'mkTeal'], lining: ['mkMaroon', 'mkNavy'], torso: ['mkTeal', 'mkRed'],
  arm: ['mkRed', 'mkTeal'], hand: ['mkTeal', 'mkRed'], leg: ['mkRed', 'mkTeal'], shoe: ['mkTeal', 'mkRed'],
};
function mkCol(part, side) { return MM[MK_SIDE[part][side === 'R' ? 0 : 1]]; }

// poses: hand targets relative to the shoulder, in head radii (X out from the body is +, Y down, Z toward the way he faces)
const MK_POSE = {
  rest:     { R: [0.2, 2.3, 0.12], L: [0.2, 2.3, 0.12] },
  hips:     { R: [0.62, 1.15, -0.2, { fist: 1, elbowOut: 1 }], L: [0.62, 1.15, -0.2, { fist: 1, elbowOut: 1 }] },
  point:    { R: [0.2, -0.35, 2.1, { point: 1 }], L: [0.3, 1.85, 0.1] },
  pointUp:  { R: [0.35, -2.1, 0.6, { point: 1 }], L: [0.3, 1.85, 0.1] },
  wag:      { R: [0.1, -0.45, 2.0, { point: 1, front: 1 }], L: [0.2, 2.3, 0.12] },
  shrug:    { R: [0.95, 0.35, 0.55, { spread: 1.4 }], L: [0.95, 0.35, 0.55, { spread: 1.4 }] },
  armsUp:   { R: [1.15, -2.45, 0.1, { spread: 1.5 }], L: [1.15, -2.45, 0.1, { spread: 1.5 }] },
  coverEyes:{ R: [-0.5, -1.85, 1.15, { front: 1, spread: 0.7 }], L: [-0.5, -1.85, 1.15, { front: 1, spread: 0.7 }] },
  hug:      { R: [-0.75, 0.75, 1.25, { front: 1 }], L: [-0.75, 0.75, 1.25, { front: 1 }] },
  hold:     { R: [-0.35, 0.9, 1.5, { front: 1 }], L: [-0.35, 0.9, 1.5, { front: 1 }] },
  cup:      { R: [-0.15, 0.55, 1.4, { front: 1, spread: 0.6 }], L: [0.3, 1.85, 0.1] },
  reachBack:{ R: [-0.2, -1.1, -0.9, { behind: 1 }], L: [0.3, 1.85, 0.1] },
  string:   { R: [0.2, -2.25, 0.3, { fist: 1 }], L: [0.4, 1.6, 0.2] },
  climb:    { R: [0.05, -2.2, 0.5, { fist: 0.7 }], L: [0.05, -1.2, 0.7, { fist: 0.7 }] },
  shout:    { R: [-0.2, -0.75, 1.05, { front: 1, spread: 0.5 }], L: [-0.2, -0.75, 1.05, { front: 1, spread: 0.5 }] },
  fists:    { R: [0.4, 1.5, 0.3, { fist: 1 }], L: [0.4, 1.5, 0.3, { fist: 1 }] },
  knock:    { R: [0.25, 0.1, 2.0, { fist: 1 }], L: [0.3, 1.85, 0.1] },
  shh:      { R: [-0.9, -1.15, 1.2, { front: 1, fist: 0.8 }], L: [0.3, 1.85, 0.1] },
  flop:     { R: [0.9, 0.4, 0.8], L: [0.9, 0.4, 0.8] },
  crayon:   { R: [-0.1, 1.6, 1.6, { front: 1, fist: 0.8 }], L: [0.2, 1.6, 1.4, { front: 1 }] },
  poster:   { R: [0.35, -0.65, 1.55, { front: 1 }], L: [0.35, -0.65, 1.55, { front: 1 }] },
  wave:     { R: [0.9, -1.7, 0.4, { spread: 1.4 }], L: [0.3, 1.85, 0.1] },
  think:    { R: [-0.55, -0.55, 1.05, { front: 1, fist: 0.6 }], L: [-0.4, 1.05, 0.7, { front: 1 }] },
  gumball:  { R: [-0.2, 0.9, 1.6, { front: 1, spread: 0.5 }], L: [0.3, 1.85, 0.1] },
};
function mkPose(name) { return MK_POSE[name] || MK_POSE.rest; }
function mkPoseMix(a, b, k) {
  const A = typeof a === 'string' ? mkPose(a) : a, B = typeof b === 'string' ? mkPose(b) : b, out = {};
  for (const s of ['R', 'L']) {
    const pa = A[s], pb = B[s], oa = pa[3] || {}, ob = pb[3] || {};
    const o = {}; for (const key of new Set([...Object.keys(oa), ...Object.keys(ob)])) o[key] = mmLerp(oa[key] || 0, ob[key] || 0, k);
    out[s] = [mmLerp(pa[0], pb[0], k), mmLerp(pa[1], pb[1], k), mmLerp(pa[2], pb[2], k), o];
  }
  return out;
}

// C: { x, y, h, yaw, lean, bob, sx, sy, pose ('name' | mixed object), walk: {ph, amt} | null,
//      legs: 'stand'|'sit'|'crouch'|'float'|'kneel' , eyes: {lid, tilt, happy, squint, wide, look:[x,y], pupil},
//      mouth: {open, shape}, blink (auto if undefined), hood: {mush, peek, ant, wobble, droop}, t, seed,
//      headTilt, headTurn (extra yaw for the head only), lw (ink scale) }
function mookDraw(g, C) {
  const h = C.h, R = h / 8.9, yaw = C.yaw === undefined ? -0.12 : C.yaw, t = C.t || 0, bk = mmBoil(t) + (C.seed | 0) * 17;
  const lw = Math.max(1.6, R * 0.085) * (C.lw || 1), amp = Math.max(0.35, R * 0.022) * (C.wob === undefined ? 1 : C.wob);
  const sx = C.sx || 1, sy = C.sy || 1, lean = C.lean || 0;
  const hyaw = yaw + (C.headTurn || 0);
  g.save();
  g.translate(C.x, C.y); g.rotate(lean); g.scale(sx, sy);
  // ── the legs and the stance ──
  const walk = C.walk, legMode = C.legs || 'stand';
  let bob = (C.bob || 0);
  const hipY = -4.2 * R, hipX = 0.46 * R;
  const foot = { R: [-hipX, 0, 0.05 * R], L: [hipX, 0, 0.05 * R] };
  if (walk && walk.amt) {
    const ph = walk.ph * Math.PI * 2, st = (walk.stride || 0.9) * R * walk.amt;
    for (const [s, off] of [['R', 0], ['L', Math.PI]]) {
      const a = ph + off; foot[s][2] = Math.cos(a) * st; foot[s][1] = -Math.max(0, Math.sin(a)) * R * 0.55 * walk.amt;
    }
    bob += -Math.abs(Math.sin(ph)) * R * 0.18 * walk.amt;
  }
  if (legMode === 'crouch') { bob += 1.2 * R; foot.R[2] = 0.35 * R; foot.L[2] = 0.35 * R; foot.R[0] -= 0.25 * R; foot.L[0] += 0.25 * R; }
  if (legMode === 'kneel') { bob += 2.3 * R; }
  if (legMode === 'sit') { bob += 2.0 * R; foot.R = [-hipX, 0, 2.6 * R]; foot.L = [hipX, 0, 2.6 * R]; }
  if (legMode === 'dangle') { bob += 3.9 * R; foot.R = [-hipX - 0.1 * R, 0.4 * R, 1.6 * R]; foot.L = [hipX + 0.1 * R, 0.4 * R, 1.7 * R]; }
  if (legMode === 'float') { foot.R = [-hipX - 0.2 * R, -0.1 * R, -0.3 * R]; foot.L = [hipX + 0.35 * R, -0.45 * R, 0.25 * R]; }
  if (legMode === 'kick') { const k = Math.sin(t * 9); foot.R = [-hipX - 0.4 * R, -0.4 * R + k * 0.2 * R, 0.6 * R * k]; foot.L = [hipX + 0.4 * R, -0.5 * R - k * 0.2 * R, -0.6 * R * k]; }
  C.__bob = bob;                 // the body's real offset (walk bob + sitting/kneeling/dangling), for the hood
  const legs = [];
  for (const s of ['R', 'L']) {
    const X = s === 'R' ? -hipX : hipX;
    const hip = [X, hipY + bob, 0], F = [foot[s][0], foot[s][1], foot[s][2]];
    let E;
    if (legMode === 'kneel') { E = { E: [X, -0.1 * R, 0.4 * R], H: [X, -0.2 * R, -1.6 * R] }; }
    else E = mmIK(hip, F, 2.1 * R, 2.05 * R, [0, 0, 1]);            // the knee points the way he faces
    const [px0, d0] = mmProj(hip[0], hip[2], yaw), [px1] = mmProj(E.E[0], E.E[2], yaw), [px2, d2] = mmProj(E.H[0], E.H[2], yaw);
    legs.push({ s, d: d0 + d2 * 0.5, pts: [[px0, hip[1]], [px1, E.E[1]], [px2, E.H[1]]], ank: [px2, E.H[1]], X });
  }
  legs.sort((a, b) => a.d - b.d);
  const drawLeg = (L) => {
    mmTube(g, L.pts, 0.4 * R, mkCol('leg', L.s), lw, { amp, seed: 11 + (L.s === 'R' ? 1 : 2), bk });
    // the shoe: a wedge pointing the way he faces (front view: a little outward)
    const fwd = Math.sin(yaw), side = L.s === 'R' ? -1 : 1, ax = L.ank[0], ay = L.ank[1];
    const toe = fwd * 0.62 * R + side * 0.12 * R * Math.cos(yaw), heel = -fwd * 0.3 * R;
    const w = 0.34 * R + 0.26 * R * Math.abs(Math.cos(yaw));
    const P = [[ax + heel - (1 - Math.abs(fwd)) * w * 0.55 * side * 0 - w * 0.5 * (1 - Math.abs(fwd)), ay - 0.2 * R], [ax + toe + side * w * 0.35 * (1 - Math.abs(fwd)), ay - 0.12 * R],
               [ax + toe + side * w * 0.45 * (1 - Math.abs(fwd)) + fwd * 0.12 * R, ay + 0.12 * R], [ax + heel - w * 0.5 * (1 - Math.abs(fwd)), ay + 0.14 * R]];
    mmInk(g, P, { fill: mkCol('shoe', L.s), lw, amp: amp * 0.6, seed: 21 + (L.s === 'R' ? 1 : 2), bk, poly: false });
  };
  // ── the arms (IK in body space, then projected) ──
  const pose = typeof C.pose === 'object' && C.pose ? C.pose : mkPose(C.pose || 'rest');
  const shY = -6.2 * R + bob, shX = 1.0 * R;
  const arms = [];
  for (const s of ['R', 'L']) {
    const out = s === 'R' ? -1 : 1, tg = pose[s], o = tg[3] || {};
    let hx = tg[0], hy = tg[1], hz = tg[2];
    if (walk && walk.amt && C.pose === undefined) { hz += Math.cos(walk.ph * Math.PI * 2 + (s === 'R' ? Math.PI : 0)) * 0.7 * walk.amt; }
    const S = [out * shX, shY, 0];
    const H = [S[0] + out * hx * R, S[1] + hy * R, hz * R];
    const pole = o.elbowOut ? [out * 1, 0.2, -0.6] : [out * 0.45, 0.2, -1];
    const k = mmIK(S, H, 1.3 * R, 1.25 * R, pole);
    const [p0, d0] = mmProj(S[0], S[2], yaw), [p1] = mmProj(k.E[0], k.E[2], yaw), [p2, d2] = mmProj(k.H[0], k.H[2], yaw);
    const hf = mmHandFrame(k.E, k.H, out, s), pv = (v) => { const q = mmProj(v[0], v[2], yaw); return [q[0], v[1], q[1]]; };
    arms.push({ s, o, d: d0 * 0.6 + d2 * 0.4, pts: [[p0, S[1]], [p1, k.E[1]], [p2, k.H[1]]], frame: { F: pv(hf.F), S: pv(hf.S), N: pv(hf.N) },
                front: (o.front || 0) > 0.5 || d2 > 1.2 * R, behind: (o.behind || 0) > 0.5 });
  }
  const drawArm = (A) => {
    mmTube(g, A.pts, 0.46 * R, mkCol('arm', A.s), lw, { amp, seed: 31 + (A.s === 'R' ? 1 : 2), bk });
    const [a, b] = [A.pts[1], A.pts[2]];
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    mmHand(g, b[0], b[1], ang, 0.95 * R, mkCol('hand', A.s), lw * 0.9, { toon: 0.85, fist: A.o.fist || 0, spread: A.o.spread === undefined ? 0.8 : A.o.spread, flip: A.s === 'R', frame: A.frame, point: A.o.point || 0, mask: A.o.mask, curls: A.o.curls });
  };
  // ── the torso (a soft bell: an elliptical cylinder, so its seam slides like the head's) ──
  const Y = (v) => v * R + bob;
  const prof = [[-6.35, 0.92], [-6.0, 1.02], [-5.2, 1.12], [-4.4, 1.24], [-3.85, 1.34]];      // [y, half-width] top → hem
  const ca = Math.abs(Math.cos(yaw)), sa = Math.abs(Math.sin(yaw));
  const halfW = (a) => Math.sqrt(a * a * ca * ca + (0.78 * a) * (0.78 * a) * sa * sa) * R;
  const tL = [], tR = [];
  for (const [yy, a] of prof) { tL.push([-halfW(a), Y(yy)]); tR.push([halfW(a), Y(yy)]); }
  const hemY = Y(-3.85);
  const torso = [...tL.slice(0, -1), [-halfW(1.34) * 0.98, hemY], [-halfW(1.34) * 0.3, hemY + 0.12 * R], [halfW(1.34) * 0.3, hemY + 0.12 * R], [halfW(1.34) * 0.98, hemY], ...tR.slice(0, -1).reverse()];
  const ts = mmSeamAng(yaw), torsoSeam = [[Math.sin(ts) * 0.78 * 0.92 * R, Y(-6.8)]];
  for (const [yy, a] of prof) torsoSeam.push([Math.sin(ts) * 0.78 * a * R, Y(yy)]);
  torsoSeam.push([Math.sin(ts) * 0.78 * 1.34 * R, hemY + 0.5 * R]);
  const drawTorso = () => {
    const [cL, cR] = mmPair(yaw, mkCol('torso', 'R'), mkCol('torso', 'L'));
    mmSplit(g, torso, torsoSeam, cL, cR, { lw, amp, seed: 41, bk });
    const front = Math.cos(yaw);
    if (front > 0.12) {    // the zip IS the seam; the square pocket straddles it
      g.save(); g.globalAlpha = mmSeg(front, 0.12, 0.4);
      mmInk(g, torsoSeam.slice(1, -1), { closed: false, lw: lw * 0.75, amp: amp * 0.6, seed: 43, bk });
      const pw = 0.62 * R * front, px = Math.sin(yaw) * 0.78 * 1.15 * R;
      mmInk(g, [[px - pw, Y(-4.95)], [px + pw, Y(-4.95)], [px + pw * 1.04, Y(-4.2)], [px - pw * 1.04, Y(-4.2)]], { lw: lw * 0.75, amp: amp * 0.5, seed: 44, bk });
      g.restore();
    }
  };
  // ── the hood: a cowl round his neck, and (behind) the pouch Mush hides in ──
  const hood = C.hood || {};
  const drawPouch = (pass) => {
    // the pouch sits behind the neck (Z = −0.85 R). pass 'back' draws it before the head, 'front' never.
    const [px, pd] = mmProj(0, -0.72 * R, yaw), fat = hood.mush ? 1 + 0.16 * hood.mush : 1;
    const cx = px, cy = Y(-6.25), rx = (0.5 + 0.22 * sa) * R * fat, ry = 0.46 * R * fat;
    const [cL, cR] = mmPair(yaw, mkCol('hood', 'R'), mkCol('hood', 'L'));
    const P = mmCirclePts(cx, cy - 0.15 * R, rx, ry, 18, 0, 0.03, 51);
    const seam = [[cx + Math.sin(mmSeamAng(yaw)) * rx * 0.2, cy - 2 * R], [cx + Math.sin(mmSeamAng(yaw)) * rx * 0.2, cy + 2 * R]];
    mmSplit(g, P, seam, cL, cR, { lw, amp, seed: 52, bk });
    return { cx, cy: cy - 0.15 * R, rx, ry, d: pd };
  };
  const drawCowl = () => {
    // the roll: wider than his head, split like his head; the lining shows as a band under the chin
    const cy = Y(-6.5), rx = (1.3 - 0.2 * sa) * R, ry = 0.5 * R;
    const hs = mmSeamAng(yaw), sx_ = Math.sin(hs);
    const [cL, cR] = mmPair(yaw, mkCol('hood', 'R'), mkCol('hood', 'L'));
    const roll = mmCirclePts(sx_ * 0.2 * R, cy, rx, ry, 20, 0, 0.03, 61);
    const seam = [[sx_ * 0.95 * R, cy - R], [sx_ * 0.95 * R, cy + R]];
    mmSplit(g, roll, seam, cL, cR, { lw, amp, seed: 62, bk });
    if (Math.cos(yaw) > -0.2) {
      const [lL, lR] = mmPair(yaw, mkCol('lining', 'R'), mkCol('lining', 'L'));
      const band = mmCirclePts(sx_ * 0.5 * R, cy - 0.34 * R, rx * 0.74, ry * 0.62, 16, 0, 0.02, 63);
      mmSplit(g, band, seam, lL, lR, { lw: lw * 0.8, amp: amp * 0.7, seed: 64, bk });
    }
    // the drawstrings, with ring ends
    if (Math.cos(yaw) > 0.05) {
      g.save(); g.globalAlpha = mmSeg(Math.cos(yaw), 0.05, 0.35);
      for (const side of [-1, 1]) {
        const [px] = mmProj(side * 0.36 * R, 0.9 * R, yaw);
        const sw = (C.walk && C.walk.amt ? Math.sin(C.walk.ph * Math.PI * 2 + side) * 0.08 * R : 0);
        const top = [px, cy + 0.2 * R], bot = [px + sw + side * 0.04 * R, cy + 1.05 * R];
        mmInk(g, [top, [mmLerp(top[0], bot[0], 0.5) + side * 0.03 * R, mmLerp(top[1], bot[1], 0.5)], bot], { closed: false, lw: lw * 0.65, amp: amp * 0.5, seed: 65 + side, bk });
        g.beginPath(); g.arc(bot[0], bot[1] + 0.09 * R, 0.09 * R, 0, Math.PI * 2); g.lineWidth = lw * 0.6; g.strokeStyle = MM.ink; g.stroke();
      }
      g.restore();
    }
  };
  // ── the head ──
  const head = () => mookHead(g, C, R, hyaw, Y(-7.85), lw, amp, bk);
  // ── draw order: what's far first ──
  const farArm = arms.filter(A => A.behind || (A.d < -0.25 * R && !A.front));
  const midArm = arms.filter(A => !A.behind && !(A.d < -0.25 * R && !A.front) && !A.front);
  const frontArm = arms.filter(A => A.front && !A.behind);
  const pouchBehind = Math.cos(yaw) > -0.35;
  if (pouchBehind) C.__pouch = drawPouch('back');
  if (hood.mush && pouchBehind) mookHoodMush(g, C, R, yaw, lw, amp, bk, 'back');
  for (const A of farArm) drawArm(A);
  drawLeg(legs[0]); drawLeg(legs[1]);
  drawTorso();
  if (!pouchBehind) { drawCowl(); C.__pouch = drawPouch('front'); if (hood.mush) mookHoodMush(g, C, R, yaw, lw, amp, bk, 'front'); }
  else drawCowl();
  for (const A of midArm) drawArm(A);
  head();
  if (hood.mush && pouchBehind) mookHoodMush(g, C, R, yaw, lw, amp, bk, 'over');
  for (const A of frontArm) drawArm(A);
  g.restore();
  return { R, headX: C.x, headY: C.y + Y(-7.85) * sy, antTip: C.__antTip ? [C.x + C.__antTip[0] * sx, C.y + C.__antTip[1] * sy] : null };
}

// the head: a circle, split by a meridian with his lightning-bolt nose in it; eyes, mouth, sprigs
function mookHead(g, C, R, yaw, hy, lw, amp, bk) {
  const t = C.t || 0, tilt = C.headTilt || 0;
  g.save(); g.translate(0, hy); g.rotate(tilt);
  const Pc = mmCirclePts(0, 0, R, R * 1.0, 28, 0, 0.025, 71 + (C.seed | 0));
  const front = Math.cos(yaw) >= 0, ps = mmSeamAng(yaw);
  // the seam, top to bottom, as the projected meridian; the nose kinks it toward the way he looks
  const jut = (yaw > 0 ? 1 : -1) * 0.6 * mmSmooth(Math.abs(Math.sin(yaw)) / 0.1);
  const seam = [];
  const sv = [1.3, 1.0, 0.8, 0.55, 0.3, 0.04, -0.2, -0.3, -0.42, -0.58, -0.75, -0.92, -1.0, -1.3];
  for (const v of sv) {
    const vv = mmClamp(v, -1, 1), rho = Math.sqrt(Math.max(0, 1 - vv * vv));
    let phi = 0, rr = 1;
    if (front && v === -0.2) { phi = jut; rr = 1.1; }
    seam.push([R * rho * rr * Math.sin(ps + phi) + (v > 0.95 ? R * 0.05 : 0), -R * v]);
  }
  // the nose tip can stand out past the round of the head (near profile): give the outline a bump
  const tip = seam[6];
  let outline = Pc;
  if (front && Math.hypot(tip[0], tip[1]) > R * 0.96) {
    const ang = Math.atan2(tip[1], tip[0]);
    outline = Pc.map(p => { const a = Math.atan2(p[1], p[0]); let da = Math.abs(((a - ang + Math.PI * 3) % (Math.PI * 2)) - Math.PI); const k = Math.max(0, 1 - da / 0.28);
      const r = Math.hypot(p[0], p[1]) + k * (Math.hypot(tip[0], tip[1]) - R * 0.97); return [Math.cos(a) * r, Math.sin(a) * r]; });
  }
  const [cL, cR] = mmPair(yaw, mkCol('head', 'R'), mkCol('head', 'L'));
  // sprigs behind the head when they are round the back
  const sprigs = [0.16, 0.38, 0.6].map((phi, i) => {
    const a = phi + yaw, v = 0.93, rho = Math.sqrt(1 - v * v);
    return { x: R * rho * Math.sin(a) + R * 0.02, y: -R * v, d: Math.cos(a), i };
  });
  const drawSprig = (s) => {
    const lean = 0.25 + s.i * 0.18 + Math.sin(yaw) * 0.25 + (C.sprigWave ? Math.sin(t * 13 + s.i) * 0.2 : 0);
    const L = R * (0.42 + 0.05 * (s.i === 1));
    const P = [[s.x, s.y + 0.05 * R], [s.x + Math.sin(lean) * L * 0.5, s.y - L * 0.55], [s.x + Math.sin(lean) * L * 1.05 + 0.05 * R, s.y - L]];
    mmInk(g, P, { closed: false, lw: lw * 0.9, ink: MM.mkSprig, amp: amp * 0.4, seed: 81 + s.i, bk });
  };
  for (const s of sprigs) if (s.d < 0) drawSprig(s);
  mmSplit(g, outline, seam, cL, cR, { lw, amp, seed: 72 + (C.seed | 0), bk, seamLw: lw * 0.9 });
  for (const s of sprigs) if (s.d >= 0) drawSprig(s);
  if (front) mookFace(g, C, R, yaw, outline, seam, lw, amp, bk, t);
  g.restore();
}

function mookFace(g, C, R, yaw, outline, seam, lw, amp, bk, t) {
  const E = C.eyes || {}, M = C.mouth || {};
  // blink: now and then, for three frames
  let blink = 0;
  if (C.blink === undefined) { const bi = Math.floor((t + (C.seed | 0) * 1.7) / 3.7); const bt = bi * 3.7 + mmH2(bi, 9 + (C.seed | 0)) * 2.4 - (C.seed | 0) * 1.7; blink = (t >= bt && t < bt + 0.12) ? 1 : 0; }
  else blink = C.blink;
  g.save();
  g.beginPath(); mmTrace(g, outline, true); g.clip();
  // eyes: the one on his RIGHT sits on the red field and is rimmed blue; the one on his LEFT, rimmed red
  const eyes = [{ side: 'R', phi: -0.55, rim: MM.mkNavy, r: 0.37 }, { side: 'L', phi: 0.55, rim: MM.mkRed, r: 0.37 }];
  for (const e of eyes) {
    const a = e.phi + yaw, v = 0.3, rho = Math.sqrt(1 - v * v), vis = Math.cos(a);
    if (vis < 0.02) continue;
    const ex = R * rho * Math.sin(a), ey = -R * v - (e.side === 'R' ? 0.02 * R : 0);
    const wide = 1 + 0.14 * (E.wide || 0), rr = e.r * R * wide;
    const rx = rr * Math.max(0.22, Math.pow(vis, 0.8)), ry = rr * (1 - 0.72 * (E.squint || 0));
    const lid = mmC01(Math.max(E.lid || 0, blink)), happy = E.happy || 0;
    if (happy > 0.5) {             // closed happy arcs
      mmInk(g, [[ex - rx, ey + ry * 0.2], [ex, ey - ry * 0.55], [ex + rx, ey + ry * 0.2]], { closed: false, lw: lw * 1.1, amp: amp * 0.4, seed: 91, bk });
      continue;
    }
    const P = mmCirclePts(ex, ey, rx, ry, 16, 0, 0.02, 92 + (e.side === 'R' ? 1 : 2));
    mmInk(g, P, { fill: MM.white, amp: amp * 0.5, seed: 93, bk });
    // the pupil: tiny, in the rim colour
    const lk = E.look || [0, 0], pr = R * 0.075 * (E.pupil || 1);
    const pxx = ex + lk[0] * rx * 0.5 + Math.sin(yaw) * rx * 0.25, pyy = ey + lk[1] * ry * 0.45;
    if (lid < 0.85) mmDot(g, pxx, pyy, pr, e.rim);
    // lids: a flat upper lid, tilted for anger (inner corner down) or worry
    if (lid > 0.02 || E.tilt) {
      const tiltK = (E.tilt || 0) * (e.side === 'R' ? 1 : -1) * 0.5;
      const ly = ey - ry + 2 * ry * lid;
      g.save(); g.beginPath(); mmTrace(g, P, true); g.clip();
      g.beginPath(); g.moveTo(ex - rx * 1.3, ly - rx * 1.3 * tiltK - 2 * ry); g.lineTo(ex + rx * 1.3, ly + rx * 1.3 * tiltK - 2 * ry);
      g.lineTo(ex + rx * 1.3, ly + rx * 1.3 * tiltK); g.lineTo(ex - rx * 1.3, ly - rx * 1.3 * tiltK); g.closePath();
      g.fillStyle = mkCol('head', e.side); g.fill();
      g.beginPath(); g.moveTo(ex - rx * 1.3, ly - rx * 1.3 * tiltK); g.lineTo(ex + rx * 1.3, ly + rx * 1.3 * tiltK);
      g.lineWidth = lw * 0.9; g.strokeStyle = MM.ink; g.stroke(); g.restore();
    }
    mmInk(g, P, { lw: lw * 1.05, ink: e.rim, amp: amp * 0.5, seed: 93, bk });
  }
  // the mouth: on the seam, low on the face. Closed it crosses the seam (his cross mouth).
  const vm = -0.56, rho = Math.sqrt(1 - vm * vm), am = yaw, vis = Math.cos(am);
  if (vis > 0.08) {
    const mx = R * rho * Math.sin(am) + (C.mouthDX || 0) * R, my = R * 0.56;
    const open = mmC01(M.open || 0), shape = M.shape || 'talk', mw = R * (M.w || 1) * 0.3 * Math.max(0.35, vis);
    if (shape === 'smile' && open < 0.15) {
      mmInk(g, [[mx - mw * 1.2, my - 0.06 * R], [mx, my + 0.14 * R], [mx + mw * 1.2, my - 0.06 * R]], { closed: false, lw: lw * 1.05, amp: amp * 0.5, seed: 95, bk });
    } else if (shape === 'frown' && open < 0.15) {
      mmInk(g, [[mx - mw * 1.1, my + 0.1 * R], [mx, my - 0.06 * R], [mx + mw * 1.1, my + 0.1 * R]], { closed: false, lw: lw * 1.05, amp: amp * 0.5, seed: 95, bk });
    } else if (open < 0.08) {
      mmInk(g, [[mx - mw, my], [mx + mw, my + 0.01 * R]], { closed: false, lw: lw * 1.05, amp: amp * 0.4, seed: 95, bk });
    } else {
      const grin = shape === 'grin' || shape === 'smile' ? 1 : 0, o = shape === 'o' ? 1 : 0, shout = shape === 'shout' ? 1 : 0;
      const w = mw * (1.15 + 0.5 * grin + 0.35 * shout - 0.35 * o), hh = R * (0.07 + open * (0.33 + 0.18 * shout));
      const P = grin ? [[mx - w, my - hh * 0.3], [mx, my - hh * 0.1], [mx + w, my - hh * 0.3], [mx + w * 0.6, my + hh * 0.7], [mx, my + hh], [mx - w * 0.6, my + hh * 0.7]]
                     : mmCirclePts(mx, my + hh * 0.2, w, hh, 12, 0, 0.03, 96);
      mmInk(g, P, { fill: MM.mouth, amp: amp * 0.4, seed: 97, bk, poly: false });
      g.save(); g.beginPath(); mmTrace(g, P, true); g.clip();
      mmDot(g, mx, my + hh * 1.05, Math.max(w, hh) * 0.62, MM.tongue); g.restore();
      mmInk(g, P, { lw: lw * 1.0, amp: amp * 0.4, seed: 97, bk, poly: false });
    }
  }
  g.restore();
}

// Mush in Mook's hood. 'back': the pouch bulges and the antenna ball pokes up behind his head.
// 'over': eyes peeking out over his shoulder (hood.peek = −1 left / +1 right, 0 = hidden).
function mookHoodMush(g, C, R, yaw, lw, amp, bk, pass) {
  const H = C.hood, P = C.__pouch; if (!P) return;
  const t = C.t || 0;
  if (pass !== 'back' && pass !== 'front') return;
  const bob = C.__bob !== undefined ? C.__bob : (C.bob || 0);
  // peeking: Mush's little dome rises out of the hood BEHIND his head, beside it (the head, drawn after, hides half)
  if (H.peek) {
    const k = mmC01(Math.abs(H.peek)), side = H.peek > 0 ? 1 : -1;
    const D = 0.6 * R, cx = P.cx + side * 0.92 * R * Math.abs(Math.cos(yaw)), cy = -7.3 * R + bob + (1 - k) * 1.1 * R;
    g.save(); g.beginPath(); g.rect(cx - 3 * R, cy - 3 * R, 6 * R, (-6.75 * R + bob) - (cy - 3 * R)); g.clip();
    const dome = mmCirclePts(cx, cy, D, D, 16, 0, 0.02, 104);
    mmInk(g, dome, { fill: '#dfeefa', amp: amp * 0.5, seed: 105, bk });
    mmInk(g, mmCirclePts(cx + side * 0.08 * D, cy + 0.05 * D, 0.74 * D, 0.74 * D, 16, 0, 0.02, 106), { fill: MM.muFace, lw: lw * 0.7, amp: amp * 0.4, seed: 107, bk });
    const lk = H.look || [side * 0.6, 0.1], ex1 = cx - 0.24 * D, ex2 = cx + 0.3 * D, ey = cy - 0.08 * D;
    mmInk(g, mmCirclePts(ex1, ey, 0.24 * D, 0.24 * D, 12, 0, 0, 108), { fill: MM.white, lw: lw * 0.7 });
    mmInk(g, mmCirclePts(ex2, ey + 0.03 * D, 0.16 * D, 0.16 * D, 12, 0, 0, 109), { fill: MM.white, lw: lw * 0.7 });
    mmDot(g, ex1 + lk[0] * 0.1 * D, ey + lk[1] * 0.1 * D, 0.09 * D, MM.ink); mmDot(g, ex2 + lk[0] * 0.07 * D, ey + 0.05 * D + lk[1] * 0.07 * D, 0.065 * D, MM.ink);
    g.save(); g.beginPath(); g.arc(ex2, ey + 0.03 * D, 0.16 * D, 0, Math.PI * 2); g.clip(); g.fillStyle = MM.muEyePink; g.fillRect(ex2 - D, ey - D, 2 * D, D * 0.98); g.restore();
    g.globalAlpha = 0.55; g.strokeStyle = MM.white; g.lineWidth = D * 0.1; g.beginPath(); g.arc(cx, cy, 0.78 * D, -2.5, -1.9); g.stroke(); g.globalAlpha = 1;
    mmInk(g, dome, { lw: lw * 0.9, amp: amp * 0.5, seed: 105, bk });
    if (H.shh) {        // a stubby arm up to his helmet: shhh
      const mk = [cx + side * 0.05 * D, cy + 0.55 * D - H.shh * 0.25 * D];
      mmTube(g, [[cx + side * 0.7 * D, cy + 1.3 * D], mk], 0.26 * D, MM.muRed, lw * 0.8);
      mmInk(g, mmCirclePts(mk[0], mk[1], 0.17 * D, 0.17 * D, 10, 0, 0, 110), { fill: MM.muBlue, lw: lw * 0.8 });
    }
    g.restore();
  }
  // the antenna: a stalk and a blue ball over the pouch's rim (a peeking Mush carries it on his dome)
  if (H.ant !== 0) {
    const wob = (H.wobble || 0) * Math.sin(t * 17), droop = H.droop || 0;
    let bx = P.cx + P.rx * 0.35, by = P.cy - P.ry * 0.8;
    if (H.peek) { const k = mmC01(Math.abs(H.peek)), side = H.peek > 0 ? 1 : -1; bx = mmLerp(bx, P.cx + side * 0.92 * R * Math.abs(Math.cos(yaw)) + 0.3 * R * side, k); by = mmLerp(by, -7.3 * R + bob - 0.55 * R, k); }
    const tipA = -1.25 + 0.35 * wob + 1.4 * droop;
    const L = R * (0.95 + 0.25 * (H.antUp || 0));
    const tip = [bx + Math.cos(tipA) * L, by + Math.sin(tipA) * L];
    mmInk(g, [[bx, by + 0.2 * R], [mmLerp(bx, tip[0], 0.5) + 0.08 * R, mmLerp(by, tip[1], 0.5)], tip], { closed: false, lw: lw * 0.9, amp: amp * 0.4, seed: 101, bk });
    mmInk(g, mmCirclePts(tip[0], tip[1], 0.2 * R, 0.2 * R, 10, 0, 0.03, 102), { fill: MM.muBlue, lw: lw * 0.9, amp: amp * 0.4, seed: 103, bk });
    C.__antTip = tip;
  }
}

// ─────────────────────────────────────────────────────────────────────────────────────
//  MUSH
// ─────────────────────────────────────────────────────────────────────────────────────
//  Off his mushdoodle: a big round glass helmet with his face inside (one big round eye, one smaller
//  droopy one), an antenna with a ball, a short suit with a zip at the collar, stubby arms, wide feet.
//  Blue | red — Mook backwards. He is a flour sack: squash and stretch, and he never says a word.
const MU_SIDE = { suit: ['muBlue', 'muRed'], mitt: ['muRed', 'muBlue'], foot: ['muRed', 'muBlue'] };
function muCol(part, side) { return MM[MU_SIDE[part][side === 'R' ? 0 : 1]]; }
// C: { x, y, h, yaw, sx, sy (squash), lean, arms: {R:[ang, len], L:[...]}, eyes: {lid, happy, wide, look},
//      mouth: {open, shape}, ant: {wobble, droop, up}, walk: {ph, amt}, hop, t, seed, flat (pancake 0..1) }
function mushDraw(g, C) {
  const h = C.h, D = h / 3.7, yaw = C.yaw || 0, t = C.t || 0, bk = mmBoil(t) + 7 + (C.seed | 0) * 13;
  const lw = Math.max(1.5, D * 0.075) * (C.lw || 1), amp = Math.max(0.35, D * 0.02);
  let sx = C.sx || 1, sy = C.sy || 1;
  const flat = C.flat || 0;
  if (flat >= 0.85) return mushPancake(g, C, D, lw, amp, bk, t);
  if (flat) { sy = mmLerp(sy, 0.16, flat); sx = mmLerp(sx, 2.3, flat); }
  g.save(); g.translate(C.x, C.y); g.rotate(C.lean || 0); g.scale(sx, sy);
  const walk = C.walk; let bob = 0, footLift = [0, 0];
  if (walk && walk.amt) { const ph = walk.ph * Math.PI * 2; bob = -Math.abs(Math.sin(ph)) * D * 0.18 * walk.amt; footLift = [Math.max(0, Math.sin(ph)) * D * 0.25 * walk.amt, Math.max(0, -Math.sin(ph)) * D * 0.25 * walk.amt]; }
  bob -= (C.hop || 0) * D;
  const ca = Math.abs(Math.cos(yaw)), sa = Math.abs(Math.sin(yaw));
  // feet: two flat ovals pointing out (his doodle), on two short stubby legs
  const top = -1.66 * D + bob, hips = -0.52 * D + bob * 0.5;
  const legsM = [['R', -1], ['L', 1]].map(([s, out]) => {
    const [hx, d] = mmProj(out * 0.24 * D, 0, yaw), [fx, fd] = mmProj(out * 0.46 * D, 0.12 * D, yaw);
    const lift = s === 'R' ? footLift[0] : footLift[1];
    return { s, out, d: (d + fd) / 2, hip: [hx, hips - 0.1 * D], ank: [hx + (fx - hx) * 0.35, -0.2 * D - lift], foot: [fx + Math.sin(yaw) * 0.12 * D, -0.13 * D - lift] };
  }).sort((a, b) => a.d - b.d);
  const drawLegM = (L) => {
    mmTube(g, [L.hip, L.ank], 0.3 * D, muCol('suit', L.s), lw, { amp, seed: 113 + (L.s === 'R' ? 1 : 2), bk });
    const w = D * (0.4 + 0.1 * sa);
    mmInk(g, mmCirclePts(L.foot[0], L.foot[1], w, 0.15 * D, 14, 0, 0.03, 111), { fill: muCol('foot', L.s), lw, amp, seed: 112 + (L.s === 'R' ? 1 : 2), bk });
  };
  // the suit: a short sack, narrow at the shoulders
  const hw = (a) => Math.sqrt(a * a * ca * ca + (0.8 * a) * (0.8 * a) * sa * sa) * D;
  const bot = hips;
  const suit = [[-hw(0.4), top], [-hw(0.44), top + 0.4 * D], [-hw(0.5), bot - 0.2 * D], [-hw(0.47), bot + 0.02 * D], [0, bot + 0.1 * D],
                [hw(0.47), bot + 0.02 * D], [hw(0.5), bot - 0.2 * D], [hw(0.44), top + 0.4 * D], [hw(0.4), top]];
  const ss = mmSeamAng(yaw), sxs = (a) => Math.sin(ss) * 0.8 * a * D;
  const seam = [[sxs(0.4), top - 0.6 * D], [sxs(0.44), top + 0.3 * D], [sxs(0.5), bot], [sxs(0.5), bot + 0.6 * D]];
  // arms: stubby, sticking out (ang from straight down, + = outward; ~1.3 = nearly level, like his doodle)
  const armA = C.arms || {};
  const arms = [['R', -1], ['L', 1]].map(([s, out]) => {
    const [ang, len] = armA[s] || [1.25, 1];
    const [px, d] = mmProj(out * 0.4 * D, 0, yaw);
    const a = ang * out * Math.max(0.4, ca) + (walk && walk.amt ? Math.sin(walk.ph * Math.PI * 2 + (s === 'R' ? 0 : Math.PI)) * 0.3 * walk.amt : 0);
    const L = 0.55 * D * len;
    const base = [px, top + 0.3 * D], tip = [px + Math.sin(a) * L, base[1] + Math.cos(a) * L];
    return { s, d, base, tip, a };
  }).sort((a, b) => a.d - b.d);
  const drawArm = (A) => {
    mmTube(g, [A.base, [mmLerp(A.base[0], A.tip[0], 0.5), mmLerp(A.base[1], A.tip[1], 0.5) + 0.03 * D], A.tip], 0.28 * D, muCol('suit', A.s === 'R' ? 'R' : 'L'), lw, { amp, seed: 121 + (A.s === 'R' ? 1 : 2), bk });
    mmInk(g, mmCirclePts(A.tip[0], A.tip[1], 0.18 * D, 0.17 * D, 10, 0, 0.04, 123), { fill: muCol('mitt', A.s), lw, amp, seed: 124 + (A.s === 'R' ? 1 : 2), bk });
  };
  for (const A of arms) if (A.d < -0.2 * D) drawArm(A);
  for (const L of legsM) drawLegM(L);
  const [cL, cR] = mmPair(yaw, muCol('suit', 'R'), muCol('suit', 'L'));
  mmSplit(g, suit, seam, cL, cR, { lw, amp, seed: 131, bk });
  if (Math.cos(yaw) > 0.15) {   // the zip, and its yellow pull at the collar (Mush's one yellow thing)
    const zx = Math.sin(yaw) * 0.8 * 0.42 * D;
    mmInk(g, [[zx, top + 0.3 * D], [zx + Math.sin(yaw) * 0.05 * D, bot - 0.08 * D]], { closed: false, lw: lw * 0.7, amp: amp * 0.5, seed: 132, bk });
    mmInk(g, [[zx - 0.12 * D, top + 0.06 * D], [zx + 0.12 * D, top + 0.06 * D], [zx, top + 0.32 * D]], { fill: MM.muYellow, lw: lw * 0.8, amp: amp * 0.4, seed: 133, bk });
  }
  for (const A of arms) if (A.d >= -0.2 * D) drawArm(A);
  // the helmet: glass dome, his face inside, the antenna on top (behind or in front of the dome)
  const hc = [0, top - 0.86 * D];
  const ant = C.ant || {};
  const antPhi = 0.62, antA = antPhi + yaw, antX = hc[0] + Math.sin(antA) * 0.72 * D, antD = Math.cos(antA);
  const drawAnt = () => {
    const wob = (ant.wobble || 0) * Math.sin(t * 19) + 0.08 * Math.sin(t * 2.3 + 1), droop = ant.droop || 0;
    const bx = antX, by = hc[1] - 0.72 * D;
    const a = -1.35 + 0.35 * Math.sin(antA) + wob * 0.5 + droop * 1.5;
    const L = D * (0.72 + 0.2 * (ant.up || 0));
    const mid = [bx + Math.cos(a - 0.35) * L * 0.55, by + Math.sin(a - 0.35) * L * 0.55], tip = [bx + Math.cos(a) * L, by + Math.sin(a) * L];
    mmInk(g, mmCirclePts(bx, by + 0.02 * D, 0.13 * D, 0.08 * D, 8, 0, 0, 141), { fill: MM.muRed, lw: lw * 0.8 });
    mmInk(g, [[bx, by], mid, tip], { closed: false, lw: lw * 0.9, amp: amp * 0.4, seed: 142, bk });
    mmInk(g, mmCirclePts(tip[0], tip[1], 0.15 * D, 0.15 * D, 10, 0, 0.03, 143), { fill: MM.muBlue, lw: lw * 0.9, amp: amp * 0.4, seed: 144, bk });
    return tip;
  };
  let antTip = null;
  if (antD < 0) antTip = drawAnt();
  const dome = mmCirclePts(hc[0], hc[1], 0.98 * D, 0.95 * D, 26, 0, 0.02, 151);
  mmInk(g, dome, { fill: '#dfeefa', amp, seed: 152, bk });
  // the face: a cream moon disc that turns inside the glass
  const fv = Math.cos(yaw);
  if (fv > -0.1) {
    const fx = hc[0] + Math.sin(yaw) * 0.26 * D, fy = hc[1] + 0.06 * D, frx = 0.74 * D * Math.max(0.5, 0.55 + 0.45 * fv), fry = 0.74 * D;
    g.save(); g.beginPath(); mmTrace(g, dome, true); g.clip();
    const face = mmCirclePts(fx, fy, frx, fry, 22, 0, 0.02, 153);
    mmInk(g, face, { fill: MM.muFace, lw: lw * 0.8, amp: amp * 0.6, seed: 154, bk });
    g.save(); g.beginPath(); mmTrace(g, face, true); g.clip();
    for (const [u, v, r] of [[-0.45, 0.42, 0.1], [0.5, 0.5, 0.07], [0.35, -0.55, 0.06], [-0.6, -0.2, 0.05]]) mmDot(g, fx + u * frx, fy + v * fry, r * D, MM.muSpot);
    mushFace(g, C, D, yaw, fx, fy, frx, fry, lw, amp, bk, t);
    g.restore(); g.restore();
  }
  else {
    g.save(); g.beginPath(); mmTrace(g, dome, true); g.clip();
    mmInk(g, mmCirclePts(hc[0] - Math.sin(yaw) * 0.2 * D, hc[1] + 0.06 * D, 0.74 * D, 0.74 * D, 22, 0, 0.02, 153), { fill: MM.muFace, lw: lw * 0.8, amp: amp * 0.6, seed: 154, bk });
    g.restore();
  }
  // glass: a highlight and the rim
  g.save(); g.globalAlpha = 0.55; g.strokeStyle = MM.white; g.lineWidth = D * 0.09; g.lineCap = 'round';
  g.beginPath(); g.arc(hc[0], hc[1], 0.8 * D, -2.55, -1.95); g.stroke(); g.globalAlpha = 1; g.restore();
  mmInk(g, dome, { lw: lw * 1.05, amp, seed: 152, bk });
  if (antD >= 0) antTip = drawAnt();
  g.restore();
  return { D, top: C.y + (hc[1] - 0.95 * D) * sy, antTip: antTip ? [C.x + antTip[0] * sx, C.y + antTip[1] * sy] : null };
}

// Mush squashed flat as a doormat: a flat blue|red mat, his face a flat cream oval, eyes shut until they aren't
function mushPancake(g, C, D, lw, amp, bk, t) {
  const x = C.x, y = C.y, w = D * 2.3, hh = D * 0.26, open = C.eyes && C.eyes.lid !== undefined ? 1 - C.eyes.lid : 0;
  const mat = mmCirclePts(x, y - hh * 0.55, w, hh, 30, 0, 0.02, 181);
  mmSplit(g, mat, [[x, y - 2 * hh - 10], [x, y + 10]], MM.muBlue, MM.muRed, { lw, amp, seed: 182, bk });
  const face = mmCirclePts(x + D * 0.1, y - hh * 0.95, D * 0.95, hh * 0.62, 24, 0, 0.02, 183);
  mmInk(g, face, { fill: MM.muFace, lw: lw * 0.8, amp: amp * 0.6, seed: 184, bk });
  for (const [ex, er] of [[-0.35, 0.24], [0.42, 0.17]]) {
    const cx = x + D * 0.1 + ex * D, cy = y - hh * 1.0;
    if (open > 0.05) {
      mmInk(g, mmCirclePts(cx, cy, er * D, er * D * 0.55 * open + 1, 12, 0, 0, 185), { fill: MM.white, lw: lw * 0.8 });
      mmDot(g, cx + (C.eyes.look ? C.eyes.look[0] * er * D * 0.3 : 0), cy, er * D * 0.3 * Math.min(1, open * 1.5), MM.ink);
    } else mmInk(g, [[cx - er * D, cy], [cx + er * D, cy]], { closed: false, lw: lw * 0.9 });
  }
  return { D, top: y - hh * 2, antTip: null };
}
function mushFace(g, C, D, yaw, fx, fy, frx, fry, lw, amp, bk, t) {
  const E = C.eyes || {}, M = C.mouth || {};
  let blink = 0;
  if (C.blink === undefined) { const bi = Math.floor((t + 0.9) / 4.3); const bt = bi * 4.3 + mmH2(bi, 55) * 3 - 0.9; blink = (t >= bt && t < bt + 0.12) ? 1 : 0; }
  else blink = C.blink;
  const sh = Math.sin(yaw) * 0.35 * frx;
  const lk = E.look || [0, 0];
  // the big round eye (his right, our left) and the small droopy one
  const big = { x: fx - 0.36 * frx + sh, y: fy - 0.12 * fry, r: 0.3 * D * (1 + 0.12 * (E.wide || 0)) };
  const small = { x: fx + 0.4 * frx + sh, y: fy - 0.06 * fry, r: 0.19 * D * (1 + 0.12 * (E.wide || 0)) };
  const lid = Math.max(E.lid || 0, blink);
  if ((E.happy || 0) > 0.5) {
    for (const e of [big, small]) mmInk(g, [[e.x - e.r, e.y + e.r * 0.2], [e.x, e.y - e.r * 0.6], [e.x + e.r, e.y + e.r * 0.2]], { closed: false, lw: lw * 1.1, amp: amp * 0.3, seed: 161, bk });
  } else {
    for (const [e, droop] of [[big, 0], [small, 0.42]]) {
      const P = mmCirclePts(e.x, e.y, e.r, e.r, 14, 0, 0.02, 162);
      mmInk(g, P, { fill: MM.white, lw: lw * 0.9, amp: amp * 0.3, seed: 163, bk });
      mmDot(g, e.x + lk[0] * e.r * 0.45 + e.r * 0.12, e.y + lk[1] * e.r * 0.4 + (droop ? e.r * 0.25 : 0), e.r * 0.28, MM.ink);
      const L = mmC01(Math.max(droop, lid));
      if (L > 0.02) {
        g.save(); g.beginPath(); mmTrace(g, P, true); g.clip();
        g.fillStyle = droop ? MM.muEyePink : MM.muFace; g.fillRect(e.x - e.r * 1.2, e.y - e.r * 1.2, e.r * 2.4, e.r * 2.4 * L);
        g.beginPath(); g.moveTo(e.x - e.r * 1.2, e.y - e.r * 1.2 + e.r * 2.4 * L); g.lineTo(e.x + e.r * 1.2, e.y - e.r * 1.2 + e.r * 2.4 * L);
        g.lineWidth = lw * 0.8; g.strokeStyle = MM.ink; g.stroke(); g.restore();
        mmInk(g, P, { lw: lw * 0.9, amp: amp * 0.3, seed: 163, bk });
      }
    }
  }
  // a little nose and a little mouth
  mmInk(g, [[fx + sh + 0.02 * D, fy + 0.2 * fry], [fx + sh - 0.06 * D, fy + 0.26 * fry], [fx + sh + 0.01 * D, fy + 0.31 * fry]], { closed: false, lw: lw * 0.7, amp: amp * 0.3, seed: 164, bk });
  const open = mmC01(M.open || 0), shape = M.shape || 'line', mx = fx + sh + 0.02 * D, my = fy + 0.5 * fry;
  if (shape === 'grin' || open > 0.1) {
    const w = 0.2 * D * (shape === 'grin' ? 1.5 : 1), hh = 0.05 * D + open * 0.18 * D;
    const P = shape === 'grin' ? [[mx - w, my - hh * 0.2], [mx + w, my - hh * 0.2], [mx + w * 0.5, my + hh], [mx - w * 0.5, my + hh]] : mmCirclePts(mx, my, w * 0.7, hh, 10, 0, 0, 165);
    mmInk(g, P, { fill: MM.mouth, lw: lw * 0.8, amp: amp * 0.3, seed: 166, bk, poly: false });
  } else if (shape === 'frown') {
    mmInk(g, [[mx - 0.12 * D, my + 0.04 * D], [mx, my - 0.03 * D], [mx + 0.12 * D, my + 0.04 * D]], { closed: false, lw: lw * 0.8, amp: amp * 0.3, seed: 167, bk });
  } else if (shape === 'smile') {
    mmInk(g, [[mx - 0.14 * D, my - 0.03 * D], [mx, my + 0.05 * D], [mx + 0.14 * D, my - 0.03 * D]], { closed: false, lw: lw * 0.8, amp: amp * 0.3, seed: 167, bk });
  } else {
    mmInk(g, [[mx - 0.08 * D, my], [mx + 0.08 * D, my + 0.01 * D]], { closed: false, lw: lw * 0.8, amp: amp * 0.3, seed: 167, bk });
  }
}

// Mush's voice: coloured notes that float up out of him. notes = 'C5:0.12 E5:0.12', t0 = when the first sounds
function mushNotes(g, x, y, notes, t0, t, o) {
  o = o || {}; const s = o.size || 26;
  let tt = t0; const list = notes.split(/\s+/).filter(Boolean);
  list.forEach((n, i) => {
    const [pitch, dur] = n.split(':'); const L = pitch[0], oct = +pitch.slice(1) || 5;
    const age = t - tt; tt += +dur;
    if (age < 0 || age > 2.2) return;
    const k = age / 2.2, a = age < 0.08 ? age / 0.08 : 1 - mmSeg(k, 0.55, 1);
    const nx = x + (i - (list.length - 1) / 2) * s * 0.9 + Math.sin(age * 5 + i) * s * 0.25 + (o.dx || 0) * age * s;
    const ny = y - age * s * 2.2 - (oct - 4) * s * 0.5;
    mmNoteGlyph(g, nx, ny, s * (1 + 0.15 * Math.sin(age * 9)), MM_NOTE[L] || MM.ink, a, i);
  });
}
function mmNoteGlyph(g, x, y, s, col, a, i) {
  if (a <= 0.01) return;
  g.save(); g.globalAlpha = a;
  const head = mmCirclePts(x, y, s * 0.36, s * 0.27, 12, -0.4, 0, 170 + i);
  mmInk(g, head, { fill: col, lw: Math.max(1.4, s * 0.08) });
  mmInk(g, [[x + s * 0.3, y - s * 0.1], [x + s * 0.3, y - s * 1.15], [x + s * 0.72, y - s * 0.8]], { closed: false, lw: Math.max(1.4, s * 0.09) });
  g.restore();
}

// ─────────────────────────────────────────────────────────────────────────────────────
//  TV GURL
// ─────────────────────────────────────────────────────────────────────────────────────
//  Off his drawing: a television on four thin legs with pink ball feet, wavy pink and blue stripes, a
//  khaki bezel round a pink screen with her face (line eyes, a square nose, a smile), a panel of buttons,
//  two antennae with pink balls, and her cord and plug for a tail. She sees in squares.
// C: { x, y, h, flip (−1 faces left), walk: {ph, amt}, screen: fn(g, x0, y0, w, h) | {mode...}, lean, t, seed, hop }
function tvDraw(g, C) {
  const H = C.h, t = C.t || 0, bk = mmBoil(t) + 3 + (C.seed | 0) * 29, f = C.flip || 1;
  const lw = Math.max(1.5, H * 0.017) * (C.lw || 1), amp = Math.max(0.3, H * 0.005);
  const bw = 0.86 * H, bh = 0.56 * H, legL = 0.21 * H, side = 0.045 * H;
  g.save(); g.translate(C.x, C.y); g.rotate(C.lean || 0); g.scale(f * (C.sx || 1), C.sy || 1);
  const walk = C.walk; let bob = -(C.hop || 0) * H;
  const lift = [0, 0, 0, 0];
  if (walk && walk.amt) { const ph = walk.ph * Math.PI * 2; bob += -Math.abs(Math.sin(ph * 2)) * 0.03 * H * walk.amt;
    lift[0] = lift[3] = Math.max(0, Math.sin(ph)) * 0.07 * H * walk.amt; lift[1] = lift[2] = Math.max(0, -Math.sin(ph)) * 0.07 * H * walk.amt; }
  const x0 = -bw / 2, y1 = -legL + bob, y0 = y1 - bh;
  // the cord: out of her back-right, down to the ground, a plug on the end (a tail that swishes)
  const sw = Math.sin(t * 2.6 + (C.seed | 0)) * 0.08 * H + (walk && walk.amt ? Math.sin(walk.ph * Math.PI * 4) * 0.05 * H : 0);
  const c0 = [bw / 2 + side * 0.5, y1 - 0.08 * H], c1 = [bw / 2 + 0.2 * H + sw, -0.02 * H], c2 = [bw / 2 + 0.33 * H + sw * 1.4, -0.015 * H];
  mmInk(g, [c0, [bw / 2 + 0.12 * H, y1 + 0.02 * H], c1, c2], { closed: false, lw: lw * 1.3, amp: amp * 0.6, seed: 201, bk });
  mmInk(g, [[c2[0], c2[1] - 0.025 * H], [c2[0] + 0.05 * H, c2[1] - 0.025 * H], [c2[0] + 0.05 * H, c2[1] + 0.02 * H], [c2[0], c2[1] + 0.02 * H]], { fill: MM.tvBezel, lw: lw * 0.9 });
  for (const dy of [-0.012, 0.01]) mmInk(g, [[c2[0] + 0.05 * H, c2[1] + dy * H], [c2[0] + 0.085 * H, c2[1] + dy * H]], { closed: false, lw: lw * 0.8 });
  // legs: two at the back (a little in), two at the front corners
  const legs = [[x0 + 0.2 * bw, 0.55], [x0 + 0.62 * bw, 0.55], [x0 + 0.1 * bw, 1], [x0 + 0.84 * bw, 1]];
  legs.forEach(([lx, depth], i) => {
    const top = [lx, y1 - 0.02 * H], ft = [lx + (depth < 1 ? 0.02 * H : 0), -lift[i] - (depth < 1 ? 0.025 * H : 0)];
    mmTube(g, [top, ft], 0.019 * H, MM.tvLeg, lw * 0.75, { amp: amp * 0.5, seed: 211 + i, bk });
    mmInk(g, mmCirclePts(ft[0], ft[1] - 0.012 * H, 0.034 * H, 0.03 * H, 10, 0, 0, 215 + i), { fill: MM.tvPink, lw: lw * 0.8 });
  });
  // antennae
  for (const [ax, a] of [[x0 + 0.33 * bw, -1.85], [x0 + 0.62 * bw, -1.3]]) {
    const wob = Math.sin(t * 3 + ax) * 0.05;
    const tip = [ax + Math.cos(a + wob) * 0.26 * H, y0 + Math.sin(a + wob) * 0.26 * H];
    mmTube(g, [[ax, y0 + 0.01 * H], tip], 0.022 * H, MM.tvLeg, lw * 0.8, { amp: amp * 0.4, seed: 221, bk });
    mmInk(g, mmCirclePts(tip[0], tip[1], 0.042 * H, 0.042 * H, 10, 0, 0, 222), { fill: MM.tvPink, lw: lw * 0.9 });
  }
  // the side of the box (she's drawn a little three-quarter, like his drawing)
  { const sd = [[x0 + bw - 0.02 * H, y0 + 0.004 * H], [x0 + bw + side * 0.5, y0 - 0.012 * H], [x0 + bw + side, y0 - 0.028 * H], [x0 + bw + side, y0 + bh * 0.3], [x0 + bw + side, y1 - bh * 0.3], [x0 + bw + side, y1 - 0.05 * H], [x0 + bw + side * 0.5, y1 - 0.026 * H], [x0 + bw - 0.02 * H, y1 - 0.004 * H]];
    mmInk(g, sd, { fill: mmShade(MM.tvBezel, -0.1), lw, amp: amp * 0.6, seed: 231, bk, poly: true }); }
  // the box: wavy pink and blue stripes
  const box = mmRectPts(x0, y0, x0 + bw, y1, 0.05 * H, 3);
  const boxW = mmWob(box, 232, amp, bk);
  g.save(); g.beginPath(); mmTrace(g, boxW, true); g.fillStyle = MM.tvPink; g.fill(); g.clip();
  const nS = 7;
  for (let k = 0; k < nS; k += 2) {
    const yA = y0 + (k / nS) * bh, yB = y0 + ((k + 1) / nS) * bh;
    g.beginPath(); g.moveTo(x0 - 5, yA);
    for (let i = 0; i <= 16; i++) { const xx = x0 + (i / 16) * bw; g.lineTo(xx, yA + Math.sin(i * 0.75 + k * 1.3) * 0.045 * H); }
    for (let i = 16; i >= 0; i--) { const xx = x0 + (i / 16) * bw; g.lineTo(xx, yB + Math.sin(i * 0.7 + k * 1.7 + 1) * 0.045 * H); }
    g.closePath(); g.fillStyle = MM.tvBlue; g.fill(); g.lineWidth = lw * 0.45; g.strokeStyle = mmRGBA(MM.ink, 0.55); g.stroke();
  }
  g.restore();
  mmInk(g, boxW, { lw, amp: 0 });
  // the bezel and the screen
  const sx0 = x0 + 0.07 * bw, sy0 = y0 + 0.1 * bh, sx1 = x0 + 0.72 * bw, sy1 = y1 - 0.1 * bh;
  mmInk(g, mmRectPts(sx0, sy0, sx1, sy1, 0.05 * H, 3), { fill: MM.tvBezel, lw, amp, seed: 233, bk });
  const scr = [sx0 + 0.045 * bw, sy0 + 0.07 * bh, sx1 - 0.045 * bw, sy1 - 0.07 * bh];
  const scrP = mmRectPts(scr[0], scr[1], scr[2], scr[3], 0.035 * H, 3);
  g.save(); g.beginPath(); mmTrace(g, scrP, true); g.fillStyle = MM.tvScreen; g.fill(); g.clip();
  // the screen draws in stage space; flip it back so her words never read backwards
  g.save(); if (f < 0) { g.translate((scr[0] + scr[2]), 0); g.scale(-1, 1); }
  tvScreen(g, C, scr[0], scr[1], scr[2] - scr[0], scr[3] - scr[1], t, bk, lw);
  g.restore(); g.restore();
  mmInk(g, scrP, { lw: lw * 0.9, amp: amp * 0.5, seed: 234, bk });
  // the button panel
  const px0 = x0 + 0.77 * bw, px1 = x0 + 0.93 * bw, py0 = y0 + 0.2 * bh, py1 = y1 - 0.2 * bh;
  mmInk(g, mmRectPts(px0, py0, px1, py1, 0.015 * H, 2), { fill: MM.tvBezel, lw: lw * 0.9, amp: amp * 0.5, seed: 235, bk });
  for (let i = 0; i < 4; i++) {
    const by = py0 + (py1 - py0) * (0.1 + i * 0.22), bh2 = (py1 - py0) * 0.14;
    const on = C.buttons ? C.buttons(i, t) : 0;
    mmInk(g, mmRectPts(px0 + 0.025 * bw, by, px1 - 0.025 * bw, by + bh2, 0.01 * H, 1), { fill: on ? MM.tvPink : MM.tvScreen, lw: lw * 0.7 });
  }
  g.restore();
  return { scr: [C.x + f * (scr[0]), C.y + scr[1], C.x + f * scr[2], C.y + scr[3]], top: C.y + y0 };
}

// what her screen shows. C.screen: { mode: 'off'|'static'|'face'|'grid'|'text'|'clock'|'custom', ... }
function tvScreen(g, C, x, y, w, h, t, bk, lw) {
  const S = C.screen || { mode: 'face' };
  const mode = S.mode || 'face';
  if (mode === 'off') { g.fillStyle = '#3a3440'; g.fillRect(x - 2, y - 2, w + 4, h + 4); g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(x + w * 0.1, y + h * 0.12, w * 0.25, h * 0.08); return; }
  if (mode === 'static') {
    const n = 18, m = 12, fr = Math.floor(t * 30);
    for (let j = 0; j < m; j++) for (let i = 0; i < n; i++) { const v = mmH3(i, j, fr) * 200 + 30; g.fillStyle = 'rgb(' + v + ',' + v + ',' + (v + 10) + ')'; g.fillRect(x + i * w / n, y + j * h / m, w / n + 1, h / m + 1); }
    return;
  }
  if (mode === 'grid' && S.grid) { mmDrawGrid(g, S.grid, x, y, w, h, S.reveal === undefined ? 1 : S.reveal, S.hi); if (S.face) tvFace(g, x, y, w, h, S, t, bk, lw, true); return; }
  if (mode === 'text') {
    g.fillStyle = S.bg || MM.tvScreen; g.fillRect(x, y, w, h);
    const lines = String(S.text).split('\n');
    const cols = Math.max(...lines.map(l => l.length));
    const cell = Math.min((w * 0.9) / (cols * 6 - 1), (h * 0.8) / (lines.length * 9 - 2));
    const blinkOn = S.blink ? (Math.floor(t * 2.2) % 2 === 0) : true;
    if (blinkOn) lines.forEach((l, i) => mmPixText(g, l, x + w / 2, y + h / 2 - (lines.length * 9 - 2) * cell / 2 + i * 9 * cell, { cell, align: 'c', col: S.col || MM.tvDark, colOf: S.colOf }));
    return;
  }
  if (mode === 'clock') {
    g.fillStyle = S.bg || MM.tvScreen; g.fillRect(x, y, w, h);
    const s = Math.max(0, Math.ceil(S.left - 1e-6)), str = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
    const cell = Math.min((w * 0.86) / (str.length * 6 - 1), (h * 0.6) / 7);
    mmPixText(g, str, x + w / 2, y + h / 2 - 3.5 * cell, { cell, align: 'c', colOf: (i, ch) => MM_DIG[ch] || MM.tvDark, ink: true });
    // the little hourglass of squares filling at the bottom
    const k = S.total ? 1 - S.left / S.total : 0, nb = 16;
    for (let i = 0; i < nb; i++) { g.fillStyle = i / nb < k ? MM.tvDark : 'rgba(38,34,44,0.18)'; g.fillRect(x + w * 0.08 + i * (w * 0.84 / nb), y + h * 0.86, w * 0.84 / nb - 1.5, h * 0.06); }
    return;
  }
  if (mode === 'custom' && S.fn) { S.fn(g, x, y, w, h, t); return; }
  tvFace(g, x, y, w, h, S, t, bk, lw, false);
}
function tvFace(g, x, y, w, h, S, t, bk, lw, over) {
  const cx = x + w / 2, cy = y + h / 2, u = Math.min(w, h);
  const expr = S.expr || 'smile';
  let blink = 0; { const bi = Math.floor(t / 3.1); const bt = bi * 3.1 + mmH2(bi, 77) * 2; blink = (t >= bt && t < bt + 0.1) ? 1 : 0; }
  g.save(); g.strokeStyle = MM.tvDark; g.lineCap = 'round'; g.lineWidth = Math.max(1.4, u * 0.045);
  const look = S.look || [0, 0];
  for (const ex of [-0.23, 0.23]) {
    const X = cx + ex * w + look[0] * u * 0.05, Y = cy - 0.12 * h + look[1] * u * 0.04;
    g.beginPath();
    if (blink || expr === 'happy') { g.moveTo(X - u * 0.05, Y + u * 0.02); g.quadraticCurveTo(X, Y - u * 0.05, X + u * 0.05, Y + u * 0.02); }
    else if (expr === 'wide') { g.arc(X, Y, u * 0.045, 0, Math.PI * 2); }
    else { g.moveTo(X, Y - u * 0.07); g.lineTo(X, Y + u * 0.05); }
    g.stroke();
  }
  // the square nose
  g.strokeRect(cx - u * 0.035, cy + 0.0 * h, u * 0.07, u * 0.11);
  // the mouth
  const talk = S.talk || 0;
  g.beginPath();
  if (talk > 0.08) { g.ellipse(cx, cy + 0.27 * h, u * 0.1, u * 0.02 + talk * u * 0.07, 0, 0, Math.PI * 2); g.fillStyle = MM.tvDark; g.fill(); }
  else if (expr === 'o' || expr === 'wide') { g.arc(cx, cy + 0.27 * h, u * 0.04, 0, Math.PI * 2); g.stroke(); }
  else { g.moveTo(cx - u * 0.12, cy + 0.24 * h); g.quadraticCurveTo(cx, cy + 0.34 * h, cx + u * 0.12, cy + 0.24 * h); g.stroke(); }
  g.restore();
}
// a 16 × 16 grid of colour words, painted as squares (what she sees). grid: 256 colour strings or palette names.
const MM_PAL = { red: [214, 40, 57], dark_red: [140, 22, 36], pink: [232, 150, 180], orange: [232, 140, 50], brown: [120, 82, 52], tan: [196, 168, 128],
  yellow: [238, 208, 70], green: [78, 140, 66], dark_green: [42, 86, 46], cyan: [70, 200, 215], blue: [46, 86, 200], sky_blue: [140, 184, 232],
  pale_blue: [204, 224, 244], purple: [126, 72, 164], white: [246, 246, 246], light_grey: [196, 196, 196], grey: [128, 124, 116], dark_grey: [72, 72, 72], black: [16, 16, 16] };
const MM_PALK = Object.keys(MM_PAL);
function mmGridCol(w) { const c = MM_PAL[w]; return c ? 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')' : w; }
function mmDrawGrid(g, grid, x, y, w, h, reveal, hi) {
  // grid may be a string of 256 palette letters (a-s, see MM_PALK) — compact in the blocks
  const N = 16, cw = w / N, ch = h / N;
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const i = r * N + c; if (reveal < 1 && mmH2(i, 5) > reveal) continue;
    const word = typeof grid === 'string' ? MM_PALK[grid.charCodeAt(i) - 97] : grid[i];
    g.fillStyle = mmGridCol(word); g.fillRect(x + c * cw - 0.3, y + r * ch - 0.3, cw + 0.6, ch + 0.6);
  }
  g.save(); g.strokeStyle = 'rgba(38,34,44,0.22)'; g.lineWidth = 1;
  for (let k = 1; k < N; k++) { g.beginPath(); g.moveTo(x + k * cw, y); g.lineTo(x + k * cw, y + h); g.moveTo(x, y + k * ch); g.lineTo(x + w, y + k * ch); g.stroke(); }
  if (hi) for (const [c, r, col] of hi) { g.strokeStyle = col || '#ffffff'; g.lineWidth = Math.max(2, cw * 0.14); g.strokeRect(x + c * cw + 1, y + r * ch + 1, cw - 2, ch - 2); }
  g.restore();
}

// ── mm_cast2020.js
// ═══════════════════════════════════════════════════════════════════════════════════════
// MM CAST 2020 · "Match the 2020 details" (Mook, 2026-09-30). An OVERRIDE, loaded LAST:
//   mm_core.js, mm_palette2020.js, mm_cast.js, dh_car.js, mm_cast2020.js
//   The originals are untouched. GeoV pours MY BLOCKS into one scope, so a later function
//   declaration replaces the film's for EVERY caller; each function below is the film's own
//   code with the 2020 changes behind the flags in MM_2020. With every flag false the pixels
//   are exactly the film's (checked on 2026-09-30 against mm_cast.js + dh_car.js).
//   A before/after of any one item = one flag. A clip can flip one for itself: MM_2020.mushRobe = false.
//   Sources, in his order: his 2020 colour lineup (fifixed1.png) and cards (mook.png, mush.png),
//   his TV Gurl (cast.png) for colour and details; his 2021 animatic line drawings (spread_0xx.jpg)
//   for construction. 🎬 = my invention (his drawings do not show it), kept minimal.
//   The 24 numbered items: outputs/ep03/sheets/recolour_mapping.md. Notes: sheets/details2020/NOTES.md
// ═══════════════════════════════════════════════════════════════════════════════════════
const MM_2020 = {
  // ── MOOK ──
  mookLegsGrey: true,    //  1 grey legs (S), a grey cuff bar, a coloured sock above each shoe
  mookLegW: 0.2,         //    leg thickness in head radii (film 0.4 · his lineup 0.11 inside the line)
  mookCuffAt: 0.5,       //    the cuff bar's centre, head radii up the shin from the ankle (film 0.4 hid the sock; swept: 0.5)
  mookHoodFlip: true,    //  2 each part flips from the one above: head R|B, hood B|R, torso R|B, sleeves B|R, hands R|B
  mookPocketFill: true,  //  3 the pocket filled, the other way round from the torso behind it
  mookStringTips: true,  //  4 the drawstring tips are yellow dots
  mookEyesBlack: true,   //  5 black eye rims and pupils
  mookNoLining: true,    //  6 no hood lining under the chin
  mookHairBlack: true,   //  7 three black hairs (the palette already paints them black; this makes it so without it)
  mookMouthFilled: true, //  8 the resting mouth is a small filled black shape
  mookShoeFix: true,     //    the shoe that drew as a sliver at yaw 0 (a sign missing in the heel)
  mookShoe3D: true,      //    (EP3 joints) the shoe as a solid: blobs in foot space, turned with his foot, its outline the hull of
                         //    what we see: never a sliver from any side (the far shoe went to a sliver at yaw ±0.4 and from behind)
  mookFace2020: true,    //  + his face layout: eyes lower, a little smaller and closer (fifixed1.png = mook.png)
  // ── MUSH ──
  mushHelmetRing: true,  //  9 an opaque white ring round the face (no glass bubble), the face as big as he drew it
  mushBigEyeBlue: true,  // 10 the big eye is pale blue
  mushSmallEyeNoLid: true, // 11 the small eye is W all over, no droopy lid
  mushButtons: true,     // 12 three yellow buttons down his blue half
  mushSeamStitched: true, // 13 a stitched seam (three cross stitches) under a yellow pull pointing up
  mushRobe: true,        // 14 a long robe to his feet, arms down at his sides, feet under the hem, no legs
  mushRobeLen: 1.9,      //    how far the robe reaches below the helmet, in helmet radii (film ≈ 1.6 · his lineup 1.85, his card 1.97)
  mushArmRest: 1.25,     //    the film's resting arm angle (mm_stage passes 1.25 when a shot says nothing): with the robe
                         //    it hangs his sleeves at his sides; bigger angles still lift them (2.8 is still an arm up)
  mushSmile2020: true,   //  + his resting mouth is a small smile (only when a clip gives no mouth shape; the film's is a line)
  mushSpareFit: true,    //  + the car's spare-helmet prop (dh_car.js) sits on the 2020 helmet: its straps run down the white ring, never across his face
  mushCraters: true,     // 15 his craters (traced from mush.png), blotchy, with a thin grey edge
  mushCraterK: 1.0,      //    crater size (1 = as traced)
  mushAntennaBox: true,  // 16 the antenna stands on a red box
  mushAntenna2020: true, //  + his antenna: on his RIGHT (screen-left), short and straight out of the rim (lineup, card, 2021 animatic)
  mushFace2020: true,    //  + his face layout: the big eye far left and over the face's edge, the small one high and small
  // ── TV GURL ──
  tvStripeOrder: true,   // 17 pink at the top and the bottom (4 pink, 3 blue), the stripe lines solid black
  tvNoseFilled: true,    // 18 the nose filled with her stripe pink
  tvButtons: true,       // 19 stripe-pink buttons: three squares and a round one
  tvPlugPink: true,      // 20 a pink plug
  tvCordTube: true,      // 21 the cord is a khaki tube with a black line round it
  tvUnderside: true,     // 22 a khaki underside: his box is seen from low on her right, so the bottom shows
  tvSideKhaki: true,     // 23 the side is the bezel's khaki (not shaded darker), on every turn
  tvEyesFeet: true,      // 24 filled black oval eyes; flat pink pads for feet
  tvFace2020: true,      //  + his face layout on her screen: the eyes higher, the nose taller and centred, the smile lower
};

// New colour keys, only where the palette has none: his palette card, or sampled from his drawings.
const MM_2020_KEYS = {
  mkLeg: '#9FAFB4',        // S · Mook's legs and cuffs (fifixed1.png: his legs are exactly S)
  mkTip: '#FFFE3C',        // Y · Mook's drawstring tips
  muRing: '#FAFAFA',       // sampled: Mush's opaque helmet ring (fifixed1.png, mush.png)
  muEyeBig: '#EDF4FF',     // sampled: Mush's big eye, pale blue (fifixed1.png, mush.png)
  muCraterEdge: '#9FAFB4', // S · the thin grey crater edge (mush.png: its darkest core samples #99A5AE)
};
for (const k in MM_2020_KEYS) if (!(k in MM)) MM[k] = MM_2020_KEYS[k];

// ─────────────────────────────────────────────────────────────────────────────────────
//  MOOK
// ─────────────────────────────────────────────────────────────────────────────────────
// 2020: every segment flips from the one above (the crash-test dummy): head R|B, hood B|R, torso R|B,
// sleeves B|R, hands R|B; legs grey; socks R|B; shoes B|R. [his RIGHT side, his LEFT side]
const MK_FLIP_2020 = { hood: ['mkTeal', 'mkRed'], torso: ['mkRed', 'mkTeal'], arm: ['mkTeal', 'mkRed'], hand: ['mkRed', 'mkTeal'] };
function mkCol(part, side) {
  const i = side === 'R' ? 0 : 1, other = side === 'R' ? 'L' : 'R';
  if (part === 'leg' && MM_2020.mookLegsGrey) return MM.mkLeg;
  if (part === 'sock') return mkCol('shoe', other);       // his socks: the other colour from the shoe under them
  if (part === 'pocket') return mkCol('torso', other);    // his pocket: the other colour from the torso behind it
  const T = MM_2020.mookHoodFlip && MK_FLIP_2020[part] ? MK_FLIP_2020 : MK_SIDE;
  return MM[T[part][i]];
}

// MOOK'S SHOE AS A SOLID (MM_2020.mookShoe3D): a sneaker built from four round blobs in foot space (u forward from the ankle,
// w up from the sole, v across, in head radii R), turned the way his foot points (his yaw + a little turn-out), seen from
// the side as long, from the front as round, from behind as a heel; the outline is the hull of what the blobs show.
// L: the leg (ank: the ankle on screen, s: side). The sole sits where the old wedge's sole sat (0.14 R under the ankle).
const MM20_SHOE = [
  { c: [0.5, 0.15, 0], r: [0.22, 0.15, 0.27] },    // the toe: round and wide, a touch low (his 2020 shoes are wide and flat)
  { c: [0.24, 0.17, 0], r: [0.27, 0.17, 0.27] },   // the ball of the foot
  { c: [-0.17, 0.16, 0], r: [0.18, 0.16, 0.22] },  // the heel
  { c: [-0.02, 0.32, 0], r: [0.17, 0.12, 0.18] },  // the ankle's collar
];
function mm20Hull(P) {
  const Q = P.slice().sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
  for (const p of Q) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (let i = Q.length - 1; i >= 0; i--) { const p = Q[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
function mm20Shoe(g, L, yaw, R, lw, amp, bk) {
  const side = L.s === 'R' ? -1 : 1, phi = yaw + side * 0.42;          // his foot's own heading: his yaw, turned out (toes out, as he stands)
  const ax = L.ank[0], ay = L.ank[1], sole = ay + 0.14 * R, fx = Math.sin(phi), fz = Math.cos(phi);
  // foot space → screen: u along the foot (screen x = u·sin φ), v across (screen x = v·cos φ), w up
  const pts = [];
  for (const B of MM20_SHOE) for (let i = 0; i < 12; i++) for (let j = 0; j <= 4; j++) {
    const th = i / 12 * Math.PI * 2, ph = -Math.PI / 2 + j / 4 * Math.PI;
    const u = B.c[0] + B.r[0] * Math.cos(ph) * Math.cos(th), v = B.c[2] + B.r[2] * Math.cos(ph) * Math.sin(th), w = Math.max(0, B.c[1] + B.r[1] * Math.sin(ph));
    pts.push([ax + (u * fx + v * fz) * R, sole - w * R]);
  }
  const H = mm20Hull(pts), D = [];                                       // dense, so the marker curve hugs the hull
  for (let i = 0; i < H.length; i++) { const a = H[i], b = H[(i + 1) % H.length], n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / (0.12 * R)));
    for (let k = 0; k < n; k++) D.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]); }
  mmInk(g, D, { fill: mkCol('shoe', L.s), lw, amp: amp * 0.6, seed: 21 + (L.s === 'R' ? 1 : 2), bk, poly: false });
}

// a four-cornered patch split in two at x = splitX (straight edges, like the film's pocket), the split inked
function mm20SplitQuad(g, P, splitX, colL, colR, o) {
  const Q = o.amp ? mmWob(P, o.seed | 0, o.amp, o.bk | 0) : P;
  g.save();
  g.beginPath(); mmTrace(g, Q, true, true); g.fillStyle = colR; g.fill(); g.clip();
  g.fillStyle = colL; g.fillRect(splitX - 4000, -4000, 4000, 8000);
  g.beginPath(); g.moveTo(splitX, -4000); g.lineTo(splitX, 4000); g.lineWidth = o.lw; g.strokeStyle = MM.ink; g.stroke();
  g.restore();
  g.beginPath(); mmTrace(g, Q, true, true); g.lineWidth = o.lw; g.strokeStyle = MM.ink; g.lineJoin = 'round'; g.stroke();
  return Q;
}

// ── RUBBER HOSE (Mook, 2026-10-01 03:26: "squash and stretch … noodle arms and legs tubes that strech and bounce
//    cartoon phisyics thats what i mean by bugs bunny"). Opt-in on mookDraw; with none of these fields the pixels
//    are exactly the jointed rig's (checked: scratchpad toon/reg.py, 14 poses).
//    C.hose   max stretch of a limb past its bones (1 = none · 1.8 = 80 % longer); a number, or { arm, leg }.
//             The tube thins as it stretches (its volume kept: width ÷ √k). Past `hose` it stops, like a real arm.
//    C.noodle 0 = three joints (shoulder, elbow, wrist) · 1 = a noodle: one smooth arc, no elbow; a number or { arm, leg }.
//    C.foot   { R: [x, y, z], L: [x, y, z] } each foot's own target, body space px (y down from his feet line, z toward
//             us): one foot on the deck and one on the road in ONE pass (NOTES.md request 1).
function mm20HoseOpt(v, part, dflt) { if (v === undefined || v === null) return dflt; return typeof v === 'object' ? (v[part] === undefined ? dflt : v[part]) : v; }
// the inverse of sin(φ)/φ on [0, π): the half-angle of an arc of length L over a chord d (c = d / L)
function mm20ArcHalf(c) {
  if (c >= 0.99995) return Math.sqrt(Math.max(0, 6 * (1 - c)));
  if (c <= 0) return Math.PI - 1e-6;
  let lo = 0, hi = Math.PI;
  for (let i = 0; i < 44; i++) { const m = (lo + hi) / 2; if (Math.sin(m) / m > c) lo = m; else hi = m; }
  return (lo + hi) / 2;
}
// a limb in body space: root A, end target B, bones L1 L2, pole (where the elbow / knee points), hose (max stretch),
// noodle (0..1), n samples. → { E (the elbow; for a noodle, a virtual one along the end's tangent), H (the end),
//   k (stretch), P (n + 1 points, root → end, body space: the curve to draw) }
// The jointed curve is the 3-point Catmull-Rom mmTrace draws through A, E, H (the same curve, sampled: Catmull-Rom is
// affine, so sampling in 3-D and projecting is drawing the projected points); the noodle is a circular arc of the limb's
// length bulging toward the pole. noodle in between = the two blended point by point.
function mm20Limb(A, B, L1, L2, pole, hose, noodle, n) {
  const d = Math.hypot(B[0] - A[0], B[1] - A[1], B[2] - A[2]);
  const k = Math.max(1, Math.min(hose || 1, d / ((L1 + L2) * 0.999)));
  const ik = mmIK(A, B, L1 * k, L2 * k, pole), E = ik.E, H = ik.H;
  n = n || 12;
  const half = n / 2, P = [];
  const bez = (b0, b1, b2, b3, s) => { const u = 1 - s; return [0, 1, 2].map(i => u * u * u * b0[i] + 3 * u * u * s * b1[i] + 3 * u * s * s * b2[i] + s * s * s * b3[i]); };
  const add = (p, q, f) => [p[0] + q[0] * f, p[1] + q[1] * f, p[2] + q[2] * f];
  const sub = (p, q) => [p[0] - q[0], p[1] - q[1], p[2] - q[2]];
  // the jointed curve (mmTrace's Bezier form of the open Catmull-Rom through A, E, H)
  const seg0 = [A, add(A, sub(E, A), 1 / 6), add(E, sub(H, A), -1 / 6), E], seg1 = [E, add(E, sub(H, A), 1 / 6), add(H, sub(H, E), -1 / 6), H];
  const V = [];
  for (let i = 0; i <= n; i++) V.push(i <= half ? bez(...seg0, i / half) : bez(...seg1, (i - half) / half));
  const nd = mmC01(noodle || 0);
  if (nd <= 0) { for (const p of V) P.push(p); return { E, H, k, P }; }
  // the noodle: an arc of the limb's length L from A to H, bulging toward the pole
  const L = (L1 + L2) * k, ch = Math.hypot(H[0] - A[0], H[1] - A[1], H[2] - A[2]) || 1e-6;
  const nn = [(H[0] - A[0]) / ch, (H[1] - A[1]) / ch, (H[2] - A[2]) / ch];
  const pd = pole[0] * nn[0] + pole[1] * nn[1] + pole[2] * nn[2];
  let pp = [pole[0] - pd * nn[0], pole[1] - pd * nn[1], pole[2] - pd * nn[2]]; const pl = Math.hypot(pp[0], pp[1], pp[2]) || 1;
  pp = [pp[0] / pl, pp[1] / pl, pp[2] / pl];
  const phi = mm20ArcHalf(Math.min(1, ch / L));
  for (let i = 0; i <= n; i++) {
    const u = i / n, th = phi * (2 * u - 1);
    const along = phi < 1e-6 ? ch * u : (L / (2 * phi)) * (Math.sin(th) + Math.sin(phi)) * (ch / (L * Math.sin(phi) / phi));
    const bulge = phi < 1e-6 ? 0 : (L / (2 * phi)) * (Math.cos(th) - Math.cos(phi));
    const q = [A[0] + nn[0] * along + pp[0] * bulge, A[1] + nn[1] * along + pp[1] * bulge, A[2] + nn[2] * along + pp[2] * bulge];
    P.push([mmLerp(V[i][0], q[0], nd), mmLerp(V[i][1], q[1], nd), mmLerp(V[i][2], q[2], nd)]);
  }
  // a virtual elbow along the end's tangent (the hand / the shoe follow the curve's last direction)
  const T = sub(P[n], P[n - 1]), tl = Math.hypot(T[0], T[1], T[2]) || 1;
  const Ev = add(H, T, -L2 * k / tl);
  return { E: [mmLerp(E[0], Ev[0], nd), mmLerp(E[1], Ev[1], nd), mmLerp(E[2], Ev[2], nd)], H, k, P };
}
// body space → screen (mmProj), the limb's points; and its wobble: the jointed rig wobbles its three points (root,
// elbow, end), so the dense curve takes THOSE offsets, spread along it (the line keeps its old breath, never a wiggle)
function mm20LimbScreen(P, yaw, seed, amp, bk) {
  const S = P.map(q => [mmProj(q[0], q[2], yaw)[0], q[1]]), n = S.length - 1;
  if (!amp) return S;
  const key = [S[0], S[Math.round(n / 2)], S[n]], W = mmWob(key, seed | 0, amp, bk | 0), O = W.map((w, i) => [w[0] - key[i][0], w[1] - key[i][1]]);
  return S.map((p, i) => { const u = i / n, a = u < 0.5 ? O[0] : O[1], b = u < 0.5 ? O[1] : O[2], f = u < 0.5 ? 2 * u : 2 * u - 1;
    return [p[0] + mmLerp(a[0], b[0], f), p[1] + mmLerp(a[1], b[1], f)]; });
}
// a polyline cut `cut` px short of its end (along it)
function mm20CutEnd(S, cut) {
  let acc = 0; const lens = [];
  for (let i = 1; i < S.length; i++) { const l = Math.hypot(S[i][0] - S[i - 1][0], S[i][1] - S[i - 1][1]); lens.push(l); acc += l; }
  let want = Math.max(acc * 0.15, acc - cut), out = [S[0]];
  for (let i = 1; i < S.length; i++) {
    const l = lens[i - 1];
    if (want > l) { out.push(S[i]); want -= l; continue; }
    const f = l ? want / l : 0; out.push([mmLerp(S[i - 1][0], S[i][0], f), mmLerp(S[i - 1][1], S[i][1], f)]); break;
  }
  return out;
}

function mookDraw(g, C) {
  const h = C.h, R = h / 8.9, yaw = C.yaw === undefined ? -0.12 : C.yaw, t = C.t || 0, bk = mmBoil(t) + (C.seed | 0) * 17;
  const lw = Math.max(1.6, R * 0.085) * (C.lw || 1), amp = Math.max(0.35, R * 0.022) * (C.wob === undefined ? 1 : C.wob);
  const sx = C.sx || 1, sy = C.sy || 1, lean = C.lean || 0;
  const hyaw = yaw + (C.headTurn || 0);
  g.save();
  g.translate(C.x, C.y); g.rotate(lean); g.scale(sx, sy);
  // ── the legs and the stance ──
  const walk = C.walk, legMode = C.legs || 'stand';
  let bob = (C.bob || 0);
  const hipY = -4.2 * R, hipX = 0.46 * R;
  const foot = { R: [-hipX, 0, 0.05 * R], L: [hipX, 0, 0.05 * R] };
  if (walk && walk.amt) {
    const ph = walk.ph * Math.PI * 2, st = (walk.stride || 0.9) * R * walk.amt;
    for (const [s, off] of [['R', 0], ['L', Math.PI]]) {
      const a = ph + off; foot[s][2] = Math.cos(a) * st; foot[s][1] = -Math.max(0, Math.sin(a)) * R * 0.55 * walk.amt;
    }
    bob += -Math.abs(Math.sin(ph)) * R * 0.18 * walk.amt;
  }
  if (legMode === 'crouch') { bob += 1.2 * R; foot.R[2] = 0.35 * R; foot.L[2] = 0.35 * R; foot.R[0] -= 0.25 * R; foot.L[0] += 0.25 * R; }
  if (legMode === 'kneel') { bob += 2.3 * R; }
  if (legMode === 'sit') { bob += 2.0 * R; foot.R = [-hipX, 0, 2.6 * R]; foot.L = [hipX, 0, 2.6 * R]; }
  if (legMode === 'dangle') { bob += 3.9 * R; foot.R = [-hipX - 0.1 * R, 0.4 * R, 1.6 * R]; foot.L = [hipX + 0.1 * R, 0.4 * R, 1.7 * R]; }
  if (legMode === 'float') { foot.R = [-hipX - 0.2 * R, -0.1 * R, -0.3 * R]; foot.L = [hipX + 0.35 * R, -0.45 * R, 0.25 * R]; }
  if (legMode === 'kick') { const k = Math.sin(t * 9); foot.R = [-hipX - 0.4 * R, -0.4 * R + k * 0.2 * R, 0.6 * R * k]; foot.L = [hipX + 0.4 * R, -0.5 * R - k * 0.2 * R, -0.6 * R * k]; }
  if (C.foot) for (const s of ['R', 'L']) if (C.foot[s]) foot[s] = [C.foot[s][0], C.foot[s][1], C.foot[s][2]];   // each foot's own target
  C.__bob = bob;                 // the body's real offset (walk bob + sitting/kneeling/dangling), for the hood
  // (EP9, the cold open: asleep on his maths) C.bow (radians): he slumps forward over the table. Everything above the hem
  //  of his hoodie (where he sits) slides forward by its height × sin(bow) and comes down to its height × cos(bow): the hem
  //  stays on the bench, the back rounds into a slope, the shoulders and the head come forward and down. In 3D for the
  //  shoulders (the hands keep their targets, so they stay on the table) and the head (it keeps its shape); on screen for
  //  the torso, the hood and the pouch (in profile the slope, from the front a foreshortening). Old episodes never pass
  //  it: with no bow nothing here changes the drawing.
  const bow = C.bow || 0, bY0 = -3.85 * R + bob, bC = Math.cos(bow), bS = Math.sin(bow), ys = Math.sin(yaw), yc = Math.cos(yaw);
  const bowRot = (P) => { const u = Math.max(0, bY0 - P[1]); return [P[0], P[1] + u * (1 - bC), P[2] + u * bS]; };
  const bowed = (fn) => { if (!bow) return fn(); g.save(); g.transform(1, 0, -ys * bS, bC, bY0 * ys * bS, bY0 * (1 - bC)); const r = fn(); g.restore(); return r; };
  const bowedAt = (hc, fn) => { if (!bow) return fn(); const u = bY0 - hc; g.save(); g.translate(ys * u * bS, (bY0 - u * bC) - hc); fn(); g.restore(); };
  const hoseLeg = mm20HoseOpt(C.hose, 'leg', 1), noodLeg = mm20HoseOpt(C.noodle, 'leg', 0), toonLeg = hoseLeg > 1 || noodLeg > 0;
  const legs = [];
  for (const s of ['R', 'L']) {
    const X = s === 'R' ? -hipX : hipX;
    const hip = [X, hipY + bob, 0], F = [foot[s][0], foot[s][1], foot[s][2]];
    let E;
    if (legMode === 'kneel') { E = { E: [X, -0.1 * R, 0.4 * R], H: [X, -0.2 * R, -1.6 * R] }; }
    else if (toonLeg) E = mm20Limb(hip, F, 2.1 * R, 2.05 * R, [0, 0, 1], hoseLeg, noodLeg, 12);   // rubber hose
    else E = mmIK(hip, F, 2.1 * R, 2.05 * R, [0, 0, 1]);            // the knee points the way he faces
    const [px0, d0] = mmProj(hip[0], hip[2], yaw), [px1] = mmProj(E.E[0], E.E[2], yaw), [px2, d2] = mmProj(E.H[0], E.H[2], yaw);
    legs.push({ s, d: d0 + d2 * 0.5, pts: [[px0, hip[1]], [px1, E.E[1]], [px2, E.H[1]]], ank: [px2, E.H[1]], X, k: E.k || 1, curve: E.P || null });
  }
  // 📡 BEACONS (EP7, 🗣 "a beacon … watching the hand off"): C.beacon(name, [points], width) gets the joints as drawn, in body px.
  //    Off unless asked for: with no C.beacon nothing here runs and the drawing is unchanged.
  if (C.beacon) {
    for (const s of ['R', 'L']) { const X = s === 'R' ? -hipX : hipX, hip = [X, hipY + bob, 0], F = [foot[s][0], foot[s][1], foot[s][2]];
      const E = legMode === 'kneel' ? { E: [X, -0.1 * R, 0.4 * R], H: [X, -0.2 * R, -1.6 * R] } : (toonLeg ? mm20Limb(hip, F, 2.1 * R, 2.05 * R, [0, 0, 1], hoseLeg, noodLeg, 12) : mmIK(hip, F, 2.1 * R, 2.05 * R, [0, 0, 1]));
      C.beacon('leg' + s, E.P && E.P.length ? [hip].concat(E.P.slice(1)) : [hip, E.E, E.H], 0.42 * R);
      C.beacon('foot' + s, [E.H, [E.H[0], E.H[1], E.H[2] + 0.55 * R]], 0.6 * R); }   // (EP9: the toe at the ankle's own height, not the feet line: a lifted foot's shoe was left uncut)
    const bw = (L) => bow ? L.map(bowRot) : L;
    C.beacon('body', bw([[0, -3.73 * R + bob, 0], [0, -5.0 * R + bob, 0], [0, -6.35 * R + bob, 0]]), [2.75 * R, 2.4 * R, 1.9 * R]);
    C.beacon('head', bw([[0, -6.5 * R + bob, 0], [0, -8.9 * R + bob, 0]]), 2.9 * R); }
  legs.sort((a, b) => a.d - b.d);
  const drawLeg = (L) => {
    const grey = MM_2020.mookLegsGrey, sd = L.s === 'R' ? 1 : 2;
    if (L.curve) {
      // RUBBER HOSE: the leg is the curve (thinner as it stretches); the cuff, the sock and the shoe ride its end
      const S0 = mm20LimbScreen(L.curve, yaw), n = S0.length - 1, Sw = mm20LimbScreen(L.curve, yaw, 11 + sd, amp, bk), kq = Math.sqrt(L.k || 1);
      if (!grey) mmTube(g, Sw, 0.4 * R / kq, mkCol('leg', L.s), lw, { amp: 0 });
      else {
        const A = S0[n], K = S0[n - 2];
        let ux = A[0] - K[0], uy = A[1] - K[1]; const ul = Math.hypot(ux, uy) || 1; ux /= ul; uy /= ul;
        let shin = 0; for (let i = n / 2 + 1; i <= n; i++) shin += Math.hypot(S0[i][0] - S0[i - 1][0], S0[i][1] - S0[i - 1][1]);
        const at = (s) => [A[0] - ux * s * R, A[1] - uy * s * R];
        const ca_ = MM_2020.mookCuffAt, cut = Math.min(ca_ + 0.08, shin / R * 0.8);
        mmTube(g, mm20CutEnd(Sw, cut * R), MM_2020.mookLegW * R / kq, mkCol('leg', L.s), lw, { amp: 0 });
        mmTube(g, [at(0.02), at(ca_ - 0.14)], 0.24 * R, mkCol('sock', L.s), lw, { amp: amp * 0.5, seed: 17 + sd, bk });
        const c = at(ca_), nx = -uy, ny = ux, cw = 0.23 * R, ch = 0.085 * R;
        mmInk(g, [[c[0] - nx * cw - ux * ch, c[1] - ny * cw - uy * ch], [c[0] + nx * cw - ux * ch, c[1] + ny * cw - uy * ch],
                  [c[0] + nx * cw + ux * ch, c[1] + ny * cw + uy * ch], [c[0] - nx * cw + ux * ch, c[1] - ny * cw + uy * ch]],
              { fill: mkCol('leg', L.s), lw, amp: amp * 0.5, seed: 19 + sd, bk });
      }
    }
    else if (!grey) mmTube(g, L.pts, 0.4 * R, mkCol('leg', L.s), lw, { amp, seed: 11 + sd, bk });
    else {
      // 2020: a thin grey leg down to a grey CUFF BAR, a coloured SOCK under it, then the shoe.
      // Measured on fifixed1.png (R = his head radius, from the sole up): shoe 0-0.17, sock to 0.29, cuff 0.31-0.47.
      const A = L.pts[2], K = L.pts[1];
      let ux = A[0] - K[0], uy = A[1] - K[1]; const ul = Math.hypot(ux, uy) || 1; ux /= ul; uy /= ul;   // down the shin
      const at = (s) => [A[0] - ux * s * R, A[1] - uy * s * R];            // s head radii up the shin from the ankle
      const ca_ = MM_2020.mookCuffAt, cut = Math.min(ca_ + 0.08, ul / R * 0.8);
      mmTube(g, [L.pts[0], L.pts[1], at(cut)], MM_2020.mookLegW * R, mkCol('leg', L.s), lw, { amp, seed: 11 + sd, bk });
      mmTube(g, [at(0.02), at(ca_ - 0.14)], 0.24 * R, mkCol('sock', L.s), lw, { amp: amp * 0.5, seed: 17 + sd, bk });   // its round top stays under the cuff
      const c = at(ca_), nx = -uy, ny = ux, cw = 0.23 * R, ch = 0.085 * R;
      mmInk(g, [[c[0] - nx * cw - ux * ch, c[1] - ny * cw - uy * ch], [c[0] + nx * cw - ux * ch, c[1] + ny * cw - uy * ch],
                [c[0] + nx * cw + ux * ch, c[1] + ny * cw + uy * ch], [c[0] - nx * cw + ux * ch, c[1] - ny * cw + uy * ch]],
            { fill: mkCol('leg', L.s), lw, amp: amp * 0.5, seed: 19 + sd, bk });
    }
    // the shoe: a wedge pointing the way he faces (front view: a little outward)
    if (MM_2020.mookShoe3D) { mm20Shoe(g, L, yaw, R, lw, amp, bk); return; }
    const fwd = Math.sin(yaw), side = L.s === 'R' ? -1 : 1, ax = L.ank[0], ay = L.ank[1];
    const toe = fwd * 0.62 * R + side * 0.12 * R * Math.cos(yaw), heel = -fwd * 0.3 * R;
    const w = 0.34 * R + 0.26 * R * Math.abs(Math.cos(yaw));
    const hs = MM_2020.mookShoeFix ? side : 1;      // the film's heel always spread to screen-left: the right shoe folded to a sliver
    const P = [[ax + heel - (1 - Math.abs(fwd)) * w * 0.55 * side * 0 - hs * w * 0.5 * (1 - Math.abs(fwd)), ay - 0.2 * R], [ax + toe + side * w * 0.35 * (1 - Math.abs(fwd)), ay - 0.12 * R],
               [ax + toe + side * w * 0.45 * (1 - Math.abs(fwd)) + fwd * 0.12 * R, ay + 0.12 * R], [ax + heel - hs * w * 0.5 * (1 - Math.abs(fwd)), ay + 0.14 * R]];
    mmInk(g, P, { fill: mkCol('shoe', L.s), lw, amp: amp * 0.6, seed: 21 + (L.s === 'R' ? 1 : 2), bk, poly: false });
  };
  // ── the arms (IK in body space, then projected) ──
  const pose = typeof C.pose === 'object' && C.pose ? C.pose : mkPose(C.pose || 'rest');
  const shY = -6.2 * R + bob, shX = 1.0 * R;
  const hoseArm = mm20HoseOpt(C.hose, 'arm', 1), noodArm = mm20HoseOpt(C.noodle, 'arm', 0), toonArm = hoseArm > 1 || noodArm > 0;
  const arms = [];
  for (const s of ['R', 'L']) {
    const out = s === 'R' ? -1 : 1, tg = pose[s], o = tg[3] || {};
    let hx = tg[0], hy = tg[1], hz = tg[2];
    if (walk && walk.amt && C.pose === undefined) { hz += Math.cos(walk.ph * Math.PI * 2 + (s === 'R' ? Math.PI : 0)) * 0.7 * walk.amt; }
    const S0 = [out * shX, shY, 0];
    const H = [S0[0] + out * hx * R, S0[1] + hy * R, hz * R], S = bow ? bowRot(S0) : S0;   // (the bow moves the shoulder, not the hand's target)
    const pole = o.elbowOut ? [out * 1, 0.2, -0.6] : [out * 0.45, 0.2, -1];
    const k = toonArm ? mm20Limb(S, H, 1.3 * R, 1.25 * R, pole, hoseArm, noodArm, 10) : mmIK(S, H, 1.3 * R, 1.25 * R, pole);
    const [p0, d0] = mmProj(S[0], S[2], yaw), [p1] = mmProj(k.E[0], k.E[2], yaw), [p2, d2] = mmProj(k.H[0], k.H[2], yaw);
    const hf = mmHandFrame(k.E, k.H, out, s), pv = (v) => { const q = mmProj(v[0], v[2], yaw); return [q[0], v[1], q[1]]; };
    if (C.beacon) C.beacon('arm' + s, k.P && k.P.length ? [S].concat(k.P.slice(1)) : [S, k.E, k.H], 0.5 * R);
    arms.push({ s, o, d: d0 * 0.6 + d2 * 0.4, pts: [[p0, S[1]], [p1, k.E[1]], [p2, k.H[1]]], frame: { F: pv(hf.F), S: pv(hf.S), N: pv(hf.N) },
                front: (o.front || 0) > 0.5 || d2 > 1.2 * R, behind: (o.behind || 0) > 0.5, k: k.k || 1, curve: k.P || null });
  }
  const drawArm = (A) => {
    if (A.curve) mmTube(g, mm20LimbScreen(A.curve, yaw, 31 + (A.s === 'R' ? 1 : 2), amp, bk), 0.46 * R / Math.sqrt(A.k), mkCol('arm', A.s), lw, { amp: 0 });
    else mmTube(g, A.pts, 0.46 * R, mkCol('arm', A.s), lw, { amp, seed: 31 + (A.s === 'R' ? 1 : 2), bk });
    const [a, b] = [A.pts[1], A.pts[2]];
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    mmHand(g, b[0], b[1], ang, 0.95 * R, mkCol('hand', A.s), lw * 0.9, { toon: 0.85, fist: A.o.fist || 0, spread: A.o.spread === undefined ? 0.8 : A.o.spread, flip: A.s === 'R', frame: A.frame, point: A.o.point || 0, mask: A.o.mask, curls: A.o.curls,
      held: C.inHand ? (gg) => C.inHand(gg, A.s, b, ang, R, A.d) : undefined });   // (EP9) what he holds, inside his hand (mm_hands9.js); old episodes never pass it
  };
  // ── the torso (a soft bell: an elliptical cylinder, so its seam slides like the head's) ──
  const Y = (v) => v * R + bob;
  const prof = [[-6.35, 0.92], [-6.0, 1.02], [-5.2, 1.12], [-4.4, 1.24], [-3.85, 1.34]];      // [y, half-width] top → hem
  const ca = Math.abs(Math.cos(yaw)), sa = Math.abs(Math.sin(yaw));
  const halfW = (a) => Math.sqrt(a * a * ca * ca + (0.78 * a) * (0.78 * a) * sa * sa) * R;
  const tL = [], tR = [];
  for (const [yy, a] of prof) { tL.push([-halfW(a), Y(yy)]); tR.push([halfW(a), Y(yy)]); }
  const hemY = Y(-3.85);
  const torso = [...tL.slice(0, -1), [-halfW(1.34) * 0.98, hemY], [-halfW(1.34) * 0.3, hemY + 0.12 * R], [halfW(1.34) * 0.3, hemY + 0.12 * R], [halfW(1.34) * 0.98, hemY], ...tR.slice(0, -1).reverse()];
  const ts = mmSeamAng(yaw), torsoSeam = [[Math.sin(ts) * 0.78 * 0.92 * R, Y(-6.8)]];
  for (const [yy, a] of prof) torsoSeam.push([Math.sin(ts) * 0.78 * a * R, Y(yy)]);
  torsoSeam.push([Math.sin(ts) * 0.78 * 1.34 * R, hemY + 0.5 * R]);
  const drawTorso = () => {
    const [cL, cR] = mmPair(yaw, mkCol('torso', 'R'), mkCol('torso', 'L'));
    mmSplit(g, torso, torsoSeam, cL, cR, { lw, amp, seed: 41, bk });
    const front = Math.cos(yaw);
    if (front > 0.12) {    // the zip IS the seam; the square pocket straddles it
      g.save(); g.globalAlpha = mmSeg(front, 0.12, 0.4);
      mmInk(g, torsoSeam.slice(1, -1), { closed: false, lw: lw * 0.75, amp: amp * 0.6, seed: 43, bk });
      const P20 = MM_2020.mookPocketFill;          // 3 · his pocket: filled, and flatter (fifixed1.png: 57% of the torso's width, 58-82% down it)
      const pw = (P20 ? 0.68 : 0.62) * R * front, px = Math.sin(yaw) * 0.78 * 1.15 * R, pt = P20 ? -4.89 : -4.95, pb = P20 ? -4.3 : -4.2;
      const pk = [[px - pw, Y(pt)], [px + pw, Y(pt)], [px + pw * 1.04, Y(pb)], [px - pw * 1.04, Y(pb)]];
      if (P20) {            // 2020: filled, the other way round from the torso behind it
        const [pL, pR] = mmPair(yaw, mkCol('pocket', 'R'), mkCol('pocket', 'L'));
        mm20SplitQuad(g, pk, px, pL, pR, { lw: lw * 0.75, amp: amp * 0.5, seed: 44, bk });
      } else mmInk(g, pk, { lw: lw * 0.75, amp: amp * 0.5, seed: 44, bk });
      g.restore();
    }
  };
  // ── the hood: a cowl round his neck, and (behind) the pouch Mush hides in ──
  const hood = C.hood || {};
  const drawPouch = (pass) => {
    // the pouch sits behind the neck (Z = −0.85 R). pass 'back' draws it before the head, 'front' never.
    const [px, pd] = mmProj(0, -0.72 * R, yaw), fat = hood.mush ? 1 + 0.16 * hood.mush : 1;
    const cx = px, cy = Y(-6.25), rx = (0.5 + 0.22 * sa) * R * fat, ry = 0.46 * R * fat;
    const [cL, cR] = mmPair(yaw, mkCol('hood', 'R'), mkCol('hood', 'L'));
    const P = mmCirclePts(cx, cy - 0.15 * R, rx, ry, 18, 0, 0.03, 51);
    const seam = [[cx + Math.sin(mmSeamAng(yaw)) * rx * 0.2, cy - 2 * R], [cx + Math.sin(mmSeamAng(yaw)) * rx * 0.2, cy + 2 * R]];
    mmSplit(g, P, seam, cL, cR, { lw, amp, seed: 52, bk });
    return { cx, cy: cy - 0.15 * R, rx, ry, d: pd };
  };
  const drawCowl = () => {
    // the roll: wider than his head, split like his head; the lining shows as a band under the chin
    const kU = mmSmooth(mmC01(C.hoodUp || 0));                        // HOOD UP: the roll is pulled up into the hood
    const cy = Y(-6.5), rx = (1.3 - 0.2 * sa) * R * (1 - 0.22 * kU), ry = 0.5 * R * (1 - 0.3 * kU);
    const hs = mmSeamAng(yaw), sx_ = Math.sin(hs);
    const [cL, cR] = mmPair(yaw, mkCol('hood', 'R'), mkCol('hood', 'L'));
    const roll = mmCirclePts(sx_ * 0.2 * R, cy, rx, ry, 20, 0, 0.03, 61);
    const seam = [[sx_ * 0.95 * R, cy - R], [sx_ * 0.95 * R, cy + R]];
    mmSplit(g, roll, seam, cL, cR, { lw, amp, seed: 62, bk });
    if (Math.cos(yaw) > -0.2 && !MM_2020.mookNoLining) {
      const [lL, lR] = mmPair(yaw, mkCol('lining', 'R'), mkCol('lining', 'L'));
      const band = mmCirclePts(sx_ * 0.5 * R, cy - 0.34 * R, rx * 0.74, ry * 0.62, 16, 0, 0.02, 63);
      mmSplit(g, band, seam, lL, lR, { lw: lw * 0.8, amp: amp * 0.7, seed: 64, bk });
    }
    // the drawstrings, with ring ends
    if (Math.cos(yaw) > 0.05 && kU < 0.999) {
      g.save(); g.globalAlpha = mmSeg(Math.cos(yaw), 0.05, 0.35) * (1 - kU);
      for (const side of [-1, 1]) {
        const [px] = mmProj(side * 0.36 * R, 0.9 * R, yaw);
        const sw = (C.walk && C.walk.amt ? Math.sin(C.walk.ph * Math.PI * 2 + side) * 0.08 * R : 0);
        const top = [px, cy + 0.2 * R];
        let bot = [px + sw + side * 0.04 * R, cy + 1.05 * R];
        if (C.strings) {          // C.strings [dx, dy] (R): the drawstrings dragged (follow-through); a string never stretches
          const dx = bot[0] - top[0] + C.strings[0] * R, dy = bot[1] - top[1] + C.strings[1] * R, l0 = Math.hypot(bot[0] - top[0], bot[1] - top[1]), l1 = Math.hypot(dx, dy) || 1;
          bot = [top[0] + dx * l0 / l1, top[1] + dy * l0 / l1];
        }
        mmInk(g, [top, [mmLerp(top[0], bot[0], 0.5) + side * 0.03 * R, mmLerp(top[1], bot[1], 0.5)], bot], { closed: false, lw: lw * 0.65, amp: amp * 0.5, seed: 65 + side, bk });
        g.beginPath(); g.arc(bot[0], bot[1] + 0.09 * R, 0.09 * R, 0, Math.PI * 2);
        if (MM_2020.mookStringTips) { g.fillStyle = MM.mkTip; g.fill(); }        // 2020: yellow dots
        g.lineWidth = lw * 0.6; g.strokeStyle = MM.ink; g.stroke();
      }
      g.restore();
    }
  };
  // ── the head ──
  const head = () => mookHead(g, C, R, hyaw, Y(-7.85) + (C.headDy || 0) * R, lw, amp, bk);   // C.headDy: the head lags (R, + = down)
  // ── draw order: what's far first ──
  const farArm = arms.filter(A => A.behind || (A.d < -0.25 * R && !A.front));
  const midArm = arms.filter(A => !A.behind && !(A.d < -0.25 * R && !A.front) && !A.front);
  const frontArm = arms.filter(A => A.front && !A.behind);
  const pouchBehind = Math.cos(yaw) > -0.35, hoodK = mmSmooth(mmC01(C.hoodUp || 0));
  if (pouchBehind && hoodK < 0.5) C.__pouch = bowed(() => drawPouch('back'));
  if (hood.mush && pouchBehind) bowed(() => mookHoodMush(g, C, R, yaw, lw, amp, bk, 'back'));
  for (const A of farArm) drawArm(A);
  drawLeg(legs[0]); drawLeg(legs[1]);
  bowed(drawTorso);
  // (EP9, Mook's EP8 note at 0:34: "arms should be behind the hood in so shoulder lines connect with the hood"): with
  //  MK_FIX9 on, the arms go on before the cowl, so the hood's roll sits over his shoulders. Off for the old episodes.
  const fix9 = typeof MK_FIX9 !== 'undefined' && MK_FIX9;
  if (fix9) for (const A of midArm) drawArm(A);
  if (!pouchBehind) bowed(() => { drawCowl(); if (hoodK < 0.5) C.__pouch = drawPouch('front'); if (hood.mush && hoodK < 0.5) mookHoodMush(g, C, R, yaw, lw, amp, bk, 'front'); });
  else bowed(drawCowl);
  if (C.onChest) bowed(() => C.onChest(g, R, yaw, Y));           // what he wears on his chest (his mother's broach): over the cowl, under his arms
  if (!fix9) for (const A of midArm) drawArm(A);
  const hc = Y(-7.85) + (C.headDy || 0) * R;
  if (hoodK > 0.001) bowedAt(hc, () => mookHoodUp(g, C, R, hyaw, hc, lw, amp, bk, hoodK, head, Math.max(0, (C.hoodUp || 0) - 1)));
  else bowedAt(hc, head);
  if (hood.mush && pouchBehind) bowed(() => mookHoodMush(g, C, R, yaw, lw, amp, bk, 'over'));
  for (const A of frontArm) drawArm(A);
  g.restore();
  return { R, headX: C.x, headY: C.y + Y(-7.85) * sy, antTip: C.__antTip ? [C.x + C.__antTip[0] * sx, C.y + C.__antTip[1] * sy] : null };
}

// HOOD UP (Mook, 2026-10-01 03:20: "let mook wear his hood sometimes"; 🎬 no drawing of his shows it up: designed from
// his hoodie's own rules). The hood is a shell a little bigger than his head with a soft peak at the back-top, in the
// hood's colours (B|R, flipped from the head like every part of him), split by its own seam. His face shows through an
// oval opening (narrow side-on, none from behind) ringed by a thick rolled edge; the drawstrings hang from its lower
// corners. k 0..1 pulls it up: the shell rises from behind his neck, then the opening closes in round his face.
function mookHoodUp(g, C, R, yaw, hy, lw, amp, bk, k, head, over) {
  const sn = Math.sin(yaw), cs = Math.cos(yaw), tilt = C.headTilt || 0, hs = mmSeamAng(yaw);
  over = over || 0;                                                           // past 1: the hood flops forward over his eyes
  const [hL, hR] = mmPair(yaw, mkCol('hood', 'R'), mkCol('hood', 'L'));
  const ox = -sn * mmLerp(0.55, 0.1, k) * R + sn * over * 1.2 * R, oy = mmLerp(1.15, -0.05, k) * R + over * 1.7 * R, sc = mmLerp(0.7, 1, k);
  const ap = -Math.PI / 2 - sn * 0.6;                                         // the peak: up, toward the back of his head
  const shell = [];
  for (let i = 0; i < 36; i++) {
    const a = i / 36 * Math.PI * 2, da = Math.atan2(Math.sin(a - ap), Math.cos(a - ap));
    const r = R * 1.17 * sc + 0.24 * R * k * Math.exp(-(da * da) / (0.33 * 0.33));
    shell.push([ox + Math.cos(a) * r, oy + Math.sin(a) * r * 1.03]);
  }
  const seamX = ox + Math.sin(hs) * 1.1 * R * sc * 0.92;
  const seam = [[seamX, oy - 2.2 * R], [seamX, oy + 2.2 * R]];
  const drawShell = () => { g.save(); g.translate(0, hy); g.rotate(tilt); mmSplit(g, shell, seam, hL, hR, { lw, amp, seed: 801, bk, seamLw: lw * 0.8 }); g.restore(); };
  // the opening: on his face's side; side-on a narrow oval at the front, from behind none
  const vis = mmSeg(cs, -0.05, 0.25), oc = [sn * 0.5 * R + sn * over * 1.2 * R, 0.1 * R + over * 1.7 * R], orx = R * (0.32 + 0.52 * Math.abs(cs)), ory = 0.88 * R;
  const kc = mmSmooth(mmSeg(k, 0.62, 1));                                     // how far the opening has closed in
  if (vis <= 0.01 && k > 0.6) { head(); drawShell(); return; }                // from behind: the hood is all we see
  drawShell();
  if (kc <= 0) { head(); return; }
  const crx = mmLerp(3.2 * R, orx, kc), cry = mmLerp(3.2 * R, ory, kc);
  g.save(); g.translate(0, hy); g.rotate(tilt); g.beginPath(); g.ellipse(oc[0], oc[1], crx, cry, 0, 0, Math.PI * 2); g.rotate(-tilt); g.translate(0, -hy); g.clip();
  head();
  g.restore();
  // the rolled edge round the opening, and the drawstrings from its lower corners
  const kr = mmSmooth(mmSeg(kc, 0.55, 1)); if (kr <= 0.001) return;              // the rolled edge only once the opening is round his face
  g.save(); g.translate(0, hy); g.rotate(tilt); g.globalAlpha = kr * Math.max(0.35, vis);
  const ring = (rx, ry) => mmCirclePts(oc[0], oc[1], rx, ry, 30, 0, 0.02, 805);
  const outer = ring(crx + 0.15 * R, cry + 0.13 * R), inner = ring(crx, cry);
  g.save(); g.beginPath(); mmTrace(g, outer, true); mmTrace(g, inner.slice().reverse(), true); g.clip('evenodd');
  g.fillStyle = hR; g.fillRect(-4 * R, -4 * R, 8 * R, 8 * R); g.fillStyle = hL; g.fillRect(seamX - 8 * R, -4 * R, 8 * R, 8 * R);
  g.restore();
  mmInk(g, outer, { lw, amp: amp * 0.7, seed: 806, bk }); mmInk(g, inner, { lw: lw * 0.85, amp: amp * 0.7, seed: 807, bk });
  if (cs > 0.05) for (const side of [-1, 1]) {
    const top = [oc[0] + side * crx * 0.55, oc[1] + cry * 0.82], drag = C.strings || [0, 0];
    const bot = [top[0] + side * 0.05 * R + drag[0] * R * 0.5, top[1] + 0.95 * R + Math.min(0, drag[1]) * R * 0.3];
    mmInk(g, [top, [mmLerp(top[0], bot[0], 0.5) + side * 0.03 * R, mmLerp(top[1], bot[1], 0.5)], bot], { closed: false, lw: lw * 0.65, amp: amp * 0.5, seed: 808 + side, bk });
    g.beginPath(); g.arc(bot[0], bot[1] + 0.09 * R, 0.09 * R, 0, Math.PI * 2);
    if (MM_2020.mookStringTips) { g.fillStyle = MM.mkTip; g.fill(); } g.lineWidth = lw * 0.6; g.strokeStyle = MM.ink; g.stroke();
  }
  g.restore();
}

// the head: a circle, split by a meridian with his lightning-bolt nose in it; eyes, mouth, sprigs
function mookHead(g, C, R, yaw, hy, lw, amp, bk) {
  const t = C.t || 0, tilt = C.headTilt || 0;
  // (EP9, Mook's EP8 note: "his head could be a smidge bigger"): MK_FIX9 scales the head 7 %, its bottom kept in place
  const kH = (typeof MK_FIX9 !== 'undefined' && MK_FIX9) ? 1.07 : 1;
  g.save(); g.translate(0, hy - (kH - 1) * R); g.rotate(tilt); if (kH !== 1) { g.scale(kH, kH); lw /= kH; amp /= kH; }
  const Pc = mmCirclePts(0, 0, R, R * 1.0, 28, 0, 0.025, 71 + (C.seed | 0));
  const front = Math.cos(yaw) >= 0, ps = mmSeamAng(yaw);
  // the seam, top to bottom, as the projected meridian; the nose kinks it toward the way he looks
  const jut = (yaw > 0 ? 1 : -1) * 0.6 * mmSmooth(Math.abs(Math.sin(yaw)) / 0.1);
  const seam = [];
  // (EP9, 🗣 on the v2 nose: "the bridge of mooks nose needs to be higher so he dosent look like a scare crow … now its a bit
  //  too big"): MK_FIX9 moves the nose's four points up (bridge 0.3 → part-turned 0.14 → tip −0.08 → back in −0.22, from
  //  0.3 · 0.04 · −0.2 · −0.3) and turns them less (MK9_NOSE), so the nose sits higher and smaller. Indices stay the same.
  //  (v4, 🗣 on v3: "right shape on the first one just a smidge smaller and lower"): MK9_NOSE.vs is where the bridge starts.
  //  (🗣 on v4: "the og nose in the before looks better when its not clipping can i see it like that"): MK9_NOSE.og = the EP8 nose,
  //  drawn as before (under the eyes), with the other MK_FIX9 fixes kept.
  const fixN = typeof MK_FIX9 !== 'undefined' && MK_FIX9 && typeof MK9_NOSE !== 'undefined' && !MK9_NOSE.og;
  const sv = fixN ? [1.3, 1.0, 0.8, 0.55, (MK9_NOSE.vs !== undefined ? MK9_NOSE.vs : 0.3), MK9_NOSE.vb, MK9_NOSE.vt, MK9_NOSE.vr, -0.42, -0.58, -0.75, -0.92, -1.0, -1.3]
                  : [1.3, 1.0, 0.8, 0.55, 0.3, 0.04, -0.2, -0.3, -0.42, -0.58, -0.75, -0.92, -1.0, -1.3];
  for (let si = 0; si < sv.length; si++) {
    const v = sv[si], vv = mmClamp(v, -1, 1), rho = Math.sqrt(Math.max(0, 1 - vv * vv));
    let phi = 0, rr = 1;
    if (front && !fixN && v === -0.2) { phi = jut; rr = 1.1; }
    if (front && fixN) { if (si === 5) { phi = jut * MK9_NOSE.bridge; rr = MK9_NOSE.bout !== undefined ? MK9_NOSE.bout : 1.0 + 0.4 * (MK9_NOSE.out - 1); } if (si === 6) { phi = jut * MK9_NOSE.tip; rr = MK9_NOSE.out; } }
    seam.push([R * rho * rr * Math.sin(ps + phi) + (v > 0.95 ? R * 0.05 : 0), -R * v]);
  }
  // the nose tip can stand out past the round of the head (near profile): give the outline a bump
  const tip = seam[6];
  let outline = Pc;
  if (front && Math.hypot(tip[0], tip[1]) > R * 0.96) {
    const ang = Math.atan2(tip[1], tip[0]);
    outline = Pc.map(p => { const a = Math.atan2(p[1], p[0]); let da = Math.abs(((a - ang + Math.PI * 3) % (Math.PI * 2)) - Math.PI); const k = Math.max(0, 1 - da / 0.28);
      const r = Math.hypot(p[0], p[1]) + k * (Math.hypot(tip[0], tip[1]) - R * 0.97); return [Math.cos(a) * r, Math.sin(a) * r]; });
  }
  const [cL, cR] = mmPair(yaw, mkCol('head', 'R'), mkCol('head', 'L'));
  // sprigs behind the head when they are round the back
  const sprigs = [0.16, 0.38, 0.6].map((phi, i) => {
    const a = phi + yaw, v = 0.93, rho = Math.sqrt(1 - v * v);
    return { x: R * rho * Math.sin(a) + R * 0.02, y: -R * v, d: Math.cos(a), i };
  });
  const sprigInk = MM_2020.mookHairBlack ? MM.ink : MM.mkSprig;          // 7 · his three hairs are black lines
  const drawSprig = (s) => {
    const lean = 0.25 + s.i * 0.18 + Math.sin(yaw) * 0.25 + (C.sprigWave ? Math.sin(t * 13 + s.i) * 0.2 : 0) + (C.sprigLag || 0) * (0.8 + 0.2 * s.i);   // C.sprigLag (rad): the hairs dragged
    const L = R * (0.42 + 0.05 * (s.i === 1));
    const P = [[s.x, s.y + 0.05 * R], [s.x + Math.sin(lean) * L * 0.5, s.y - L * 0.55], [s.x + Math.sin(lean) * L * 1.05 + 0.05 * R, s.y - L]];
    mmInk(g, P, { closed: false, lw: lw * 0.9, ink: sprigInk, amp: amp * 0.4, seed: 81 + s.i, bk });
  };
  for (const s of sprigs) if (s.d < 0) drawSprig(s);
  mmSplit(g, outline, seam, cL, cR, { lw, amp, seed: 72 + (C.seed | 0), bk, seamLw: lw * 0.9 });
  for (const s of sprigs) if (s.d >= 0) drawSprig(s);
  if (front) mookFace(g, C, R, yaw, outline, seam, lw, amp, bk, t);
  g.restore();
}

function mookFace(g, C, R, yaw, outline, seam, lw, amp, bk, t) {
  const E = C.eyes || {}, M = C.mouth || {};
  const F20 = MM_2020.mookFace2020;
  // blink: now and then, for three frames
  let blink = 0;
  if (C.blink === undefined) { const bi = Math.floor((t + (C.seed | 0) * 1.7) / 3.7); const bt = bi * 3.7 + mmH2(bi, 9 + (C.seed | 0)) * 2.4 - (C.seed | 0) * 1.7; blink = (t >= bt && t < bt + 0.12) ? 1 : 0; }
  else blink = C.blink;
  g.save();
  g.beginPath(); mmTrace(g, outline, true); g.clip();
  // eyes: the one on his RIGHT sits on the red field and is rimmed blue; the one on his LEFT, rimmed red
  // 2020 (fifixed1.png = mook.png, R = his head radius; checked by overlaying his head on the rig's at the same width):
  // eye centres 0.02 R above the middle, 0.41 R out from the seam on average (0.45 and 0.37: he is turned a hair to his
  // right), whites 0.3 R, black pupils 0.07 R
  const eyes = F20 ? [{ side: 'R', phi: -0.44, rim: MM.mkNavy, r: 0.33 }, { side: 'L', phi: 0.44, rim: MM.mkRed, r: 0.33 }]
                   : [{ side: 'R', phi: -0.55, rim: MM.mkNavy, r: 0.37 }, { side: 'L', phi: 0.55, rim: MM.mkRed, r: 0.37 }];
  const ev = F20 ? 0.02 : 0.3;
  for (const e of eyes) {
    const a = e.phi + yaw, v = ev, rho = Math.sqrt(1 - v * v), vis = Math.cos(a);
    if (vis < 0.02) continue;
    const ex = R * rho * Math.sin(a), ey = -R * v - (e.side === 'R' ? 0.02 * R : 0);
    const wide = 1 + 0.14 * (E.wide || 0), rr = e.r * R * wide;
    const rx = rr * Math.max(0.22, Math.pow(vis, 0.8)), ry = rr * (1 - 0.72 * (E.squint || 0));
    const lid = mmC01(Math.max(E.lid || 0, blink)), happy = E.happy || 0;
    const rim = MM_2020.mookEyesBlack ? MM.ink : e.rim;             // 5 · black rims and pupils
    if (happy > 0.5) {             // closed happy arcs
      mmInk(g, [[ex - rx, ey + ry * 0.2], [ex, ey - ry * 0.55], [ex + rx, ey + ry * 0.2]], { closed: false, lw: lw * 1.1, amp: amp * 0.4, seed: 91, bk });
      continue;
    }
    if ((E.squeeze || 0) > 0.5) {  // 🎬 squeezed shut (a sneeze, a wince): a chevron pointing at the nose, > <
      const sd = e.side === 'R' ? 1 : -1;
      mmInk(g, [[ex - sd * rx * 0.85, ey - ry * 0.55], [ex + sd * rx * 0.6, ey], [ex - sd * rx * 0.85, ey + ry * 0.55]], { closed: false, lw: lw * 1.2, amp: amp * 0.4, seed: 91, bk });
      continue;
    }
    const P = mmCirclePts(ex, ey, rx, ry, 16, 0, 0.02, 92 + (e.side === 'R' ? 1 : 2));
    mmInk(g, P, { fill: MM.white, amp: amp * 0.5, seed: 93, bk });
    // the pupil: tiny, in the rim colour
    const lk = E.look || [0, 0], pr = R * 0.075 * (E.pupil || 1);
    const pxx = ex + lk[0] * rx * 0.5 + Math.sin(yaw) * rx * 0.25, pyy = ey + lk[1] * ry * 0.45;
    if (lid < 0.85) mmDot(g, pxx, pyy, pr, rim);
    // lids: a flat upper lid, tilted for anger (inner corner down) or worry
    if (lid > 0.02 || E.tilt) {
      const tiltK = (E.tilt || 0) * (e.side === 'R' ? 1 : -1) * 0.5;
      const ly = ey - ry + 2 * ry * lid;
      g.save(); g.beginPath(); mmTrace(g, P, true); g.clip();
      g.beginPath(); g.moveTo(ex - rx * 1.3, ly - rx * 1.3 * tiltK - 2 * ry); g.lineTo(ex + rx * 1.3, ly + rx * 1.3 * tiltK - 2 * ry);
      g.lineTo(ex + rx * 1.3, ly + rx * 1.3 * tiltK); g.lineTo(ex - rx * 1.3, ly - rx * 1.3 * tiltK); g.closePath();
      g.fillStyle = mkCol('head', e.side); g.fill();
      g.beginPath(); g.moveTo(ex - rx * 1.3, ly - rx * 1.3 * tiltK); g.lineTo(ex + rx * 1.3, ly + rx * 1.3 * tiltK);
      g.lineWidth = lw * 0.9; g.strokeStyle = MM.ink; g.stroke(); g.restore();
    }
    mmInk(g, P, { lw: lw * 1.05, ink: rim, amp: amp * 0.5, seed: 93, bk });
  }
  // (EP9, Mook's EP8 note: "nose in moments like this should be in the layer above his eye"): MK_FIX9 re-inks the seam's
  //  nose run (from the brow, through the kink, to under it) over the eyes, so a turned head's nose crosses the far eye
  //  🗣 2026-10-09 on the first try: "the color of that side should stay … the nose should be filled so size is better but keep
  //  the angle of his brow from the original" → the nose is a FILLED wedge in the colour of the side it grows from (the near
  //  side), bounded by the seam's own curve (sampled exactly as mmTrace draws it, so the brow keeps its angle) and closed
  //  along the straight seam beneath; then that curve is inked again on top.
  if (typeof MK_FIX9 !== 'undefined' && MK_FIX9 && !(typeof MK9_NOSE !== 'undefined' && MK9_NOSE.og) && seam && seam.length > 8) {
    const n = seam.length, cr = (i) => seam[Math.max(0, Math.min(n - 1, i))], curve = [];
    for (let i = 4; i < 7; i++) { const p0 = cr(i - 1), p1 = cr(i), p2 = cr(i + 1), p3 = cr(i + 2);
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      for (let k = (i === 4 ? 0 : 1); k <= 10; k++) { const u = k / 10, v = 1 - u;
        curve.push([v * v * v * p1[0] + 3 * v * v * u * c1[0] + 3 * v * u * u * c2[0] + u * u * u * p2[0], v * v * v * p1[1] + 3 * v * v * u * c1[1] + 3 * v * u * u * c2[1] + u * u * u * p2[1]]); } }
    const [hL, hR] = mmPair(yaw, mkCol('head', 'R'), mkCol('head', 'L')), tipX = seam[6][0] - (seam[4][0] + seam[7][0]) / 2;
    if (Math.abs(tipX) > 0.02 * R) {
      g.beginPath(); g.moveTo(curve[0][0], curve[0][1]); for (const p of curve) g.lineTo(p[0], p[1]); g.closePath();
      g.fillStyle = tipX > 0 ? hL : hR; g.fill();
    }
    g.beginPath(); g.moveTo(curve[0][0], curve[0][1]); for (const p of curve) g.lineTo(p[0], p[1]);
    g.lineWidth = lw * 0.9; g.strokeStyle = MM.ink; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke();
  }
  // the mouth: on the seam, low on the face. Closed it crosses the seam (his cross mouth).
  // 2020: a small filled black mouth 0.3 R wide and 0.1 R deep, low, just above the hood: 0.86 R below the middle
  // (EP9, Mook's EP8 note: "mooks mouth sits a bit to low on his head"): MK_FIX9 lifts it from 0.86 R to 0.72 R below the middle
  const mDrop = (typeof MK_FIX9 !== 'undefined' && MK_FIX9) ? 0.72 : 0.86;
  const vm = F20 ? -mDrop : -0.56, rho = Math.sqrt(1 - vm * vm), am = yaw, vis = Math.cos(am);
  if (vis > 0.08) {
    const mx = R * rho * Math.sin(am) + (C.mouthDX || 0) * R, my = R * (F20 ? mDrop : 0.56);
    const open = mmC01(M.open || 0), shape = M.shape || 'talk', mw = R * (M.w || 1) * 0.3 * Math.max(0.35, vis);
    if (shape === 'smile' && open < 0.15) {
      mmInk(g, [[mx - mw * 1.2, my - 0.06 * R], [mx, my + 0.14 * R], [mx + mw * 1.2, my - 0.06 * R]], { closed: false, lw: lw * 1.05, amp: amp * 0.5, seed: 95, bk });
    } else if (shape === 'frown' && open < 0.15) {
      mmInk(g, [[mx - mw * 1.1, my + 0.1 * R], [mx, my - 0.06 * R], [mx + mw * 1.1, my + 0.1 * R]], { closed: false, lw: lw * 1.05, amp: amp * 0.5, seed: 95, bk });
    } else if (open < 0.08) {
      if (MM_2020.mookMouthFilled) {      // 8 · a small filled lens, flat on top, round underneath
        const w2 = mw * 0.5, d2 = 0.1 * R;
        mmInk(g, [[mx - w2, my - d2 * 0.25], [mx - w2 * 0.3, my - d2 * 0.4], [mx + w2 * 0.3, my - d2 * 0.4], [mx + w2, my - d2 * 0.25],
                  [mx + w2 * 0.45, my + d2 * 0.5], [mx - w2 * 0.1, my + d2 * 0.6], [mx - w2 * 0.6, my + d2 * 0.4]],
              { fill: MM.mouth, lw: lw * 0.6, amp: amp * 0.3, seed: 95, bk, poly: false });
      } else mmInk(g, [[mx - mw, my], [mx + mw, my + 0.01 * R]], { closed: false, lw: lw * 1.05, amp: amp * 0.4, seed: 95, bk });
    } else {
      const grin = shape === 'grin' || shape === 'smile' ? 1 : 0, o = shape === 'o' ? 1 : 0, shout = shape === 'shout' ? 1 : 0;
      const w = mw * (1.15 + 0.5 * grin + 0.35 * shout - 0.35 * o), hh = R * (0.07 + open * (0.33 + 0.18 * shout));
      const P = grin ? [[mx - w, my - hh * 0.3], [mx, my - hh * 0.1], [mx + w, my - hh * 0.3], [mx + w * 0.6, my + hh * 0.7], [mx, my + hh], [mx - w * 0.6, my + hh * 0.7]]
                     : mmCirclePts(mx, my + hh * 0.2, w, hh, 12, 0, 0.03, 96);
      mmInk(g, P, { fill: MM.mouth, amp: amp * 0.4, seed: 97, bk, poly: false });
      g.save(); g.beginPath(); mmTrace(g, P, true); g.clip();
      mmDot(g, mx, my + hh * 1.05, Math.max(w, hh) * 0.62, MM.tongue); g.restore();
      mmInk(g, P, { lw: lw * 1.0, amp: amp * 0.4, seed: 97, bk, poly: false });
    }
  }
  g.restore();
}

// Mush in Mook's hood (the film's own). 2020: the little dome is his opaque white ring, the big eye pale blue,
// the small eye without its pink lid.
function mookHoodMush(g, C, R, yaw, lw, amp, bk, pass) {
  const H = C.hood, P = C.__pouch; if (!P) return;
  const t = C.t || 0;
  if (pass !== 'back' && pass !== 'front') return;
  const bob = C.__bob !== undefined ? C.__bob : (C.bob || 0);
  if (H.peek) {
    const k = mmC01(Math.abs(H.peek)), side = H.peek > 0 ? 1 : -1;
    const D = 0.6 * R, cx = P.cx + side * 0.92 * R * Math.abs(Math.cos(yaw)), cy = -7.3 * R + bob + (1 - k) * 1.1 * R;
    g.save(); g.beginPath(); g.rect(cx - 3 * R, cy - 3 * R, 6 * R, (-6.75 * R + bob) - (cy - 3 * R)); g.clip();
    const dome = mmCirclePts(cx, cy, D, D, 16, 0, 0.02, 104);
    mmInk(g, dome, { fill: MM_2020.mushHelmetRing ? MM.muRing : '#dfeefa', amp: amp * 0.5, seed: 105, bk });
    mmInk(g, mmCirclePts(cx + side * 0.08 * D, cy + 0.05 * D, 0.74 * D, 0.74 * D, 16, 0, 0.02, 106), { fill: MM.muFace, lw: lw * 0.7, amp: amp * 0.4, seed: 107, bk });
    const lk = H.look || [side * 0.6, 0.1], ex1 = cx - 0.24 * D, ex2 = cx + 0.3 * D, ey = cy - 0.08 * D;
    mmInk(g, mmCirclePts(ex1, ey, 0.24 * D, 0.24 * D, 12, 0, 0, 108), { fill: MM_2020.mushBigEyeBlue ? MM.muEyeBig : MM.white, lw: lw * 0.7 });
    mmInk(g, mmCirclePts(ex2, ey + 0.03 * D, 0.16 * D, 0.16 * D, 12, 0, 0, 109), { fill: MM.white, lw: lw * 0.7 });
    mmDot(g, ex1 + lk[0] * 0.1 * D, ey + lk[1] * 0.1 * D, 0.09 * D, MM.ink); mmDot(g, ex2 + lk[0] * 0.07 * D, ey + 0.05 * D + lk[1] * 0.07 * D, 0.065 * D, MM.ink);
    if (!MM_2020.mushSmallEyeNoLid) { g.save(); g.beginPath(); g.arc(ex2, ey + 0.03 * D, 0.16 * D, 0, Math.PI * 2); g.clip(); g.fillStyle = MM.muEyePink; g.fillRect(ex2 - D, ey - D, 2 * D, D * 0.98); g.restore(); }
    if (!MM_2020.mushHelmetRing) { g.globalAlpha = 0.55; g.strokeStyle = MM.white; g.lineWidth = D * 0.1; g.beginPath(); g.arc(cx, cy, 0.78 * D, -2.5, -1.9); g.stroke(); g.globalAlpha = 1; }
    mmInk(g, dome, { lw: lw * 0.9, amp: amp * 0.5, seed: 105, bk });
    if (H.shh) {        // a stubby arm up to his helmet: shhh
      const mk = [cx + side * 0.05 * D, cy + 0.55 * D - H.shh * 0.25 * D];
      mmTube(g, [[cx + side * 0.7 * D, cy + 1.3 * D], mk], 0.26 * D, MM.muRed, lw * 0.8);
      mmInk(g, mmCirclePts(mk[0], mk[1], 0.17 * D, 0.17 * D, 10, 0, 0, 110), { fill: MM.muBlue, lw: lw * 0.8 });
    }
    g.restore();
  }
  if (H.ant !== 0) {
    const wob = (H.wobble || 0) * Math.sin(t * 17), droop = H.droop || 0;
    let bx = P.cx + P.rx * 0.35, by = P.cy - P.ry * 0.8;
    if (H.peek) { const k = mmC01(Math.abs(H.peek)), side = H.peek > 0 ? 1 : -1; bx = mmLerp(bx, P.cx + side * 0.92 * R * Math.abs(Math.cos(yaw)) + 0.3 * R * side, k); by = mmLerp(by, -7.3 * R + bob - 0.55 * R, k); }
    const tipA = -1.25 + 0.35 * wob + 1.4 * droop;
    const L = R * (0.95 + 0.25 * (H.antUp || 0));
    const tip = [bx + Math.cos(tipA) * L, by + Math.sin(tipA) * L];
    mmInk(g, [[bx, by + 0.2 * R], [mmLerp(bx, tip[0], 0.5) + 0.08 * R, mmLerp(by, tip[1], 0.5)], tip], { closed: false, lw: lw * 0.9, amp: amp * 0.4, seed: 101, bk });
    mmInk(g, mmCirclePts(tip[0], tip[1], 0.2 * R, 0.2 * R, 10, 0, 0.03, 102), { fill: MM.muBlue, lw: lw * 0.9, amp: amp * 0.4, seed: 103, bk });
    C.__antTip = tip;
  }
}

// ─────────────────────────────────────────────────────────────────────────────────────
//  MUSH
// ─────────────────────────────────────────────────────────────────────────────────────
// the first k (0..1) of a polyline, by length (the end point slides smoothly along it)
function mm20Grow(P, k) {
  const seg = []; let L = 0;
  for (let i = 1; i < P.length; i++) { const l = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); seg.push(l); L += l; }
  let r = mmC01(k) * L; const out = [P[0]];
  for (let i = 1; i < P.length; i++) {
    if (r >= seg[i - 1]) { out.push(P[i]); r -= seg[i - 1]; continue; }
    const t = seg[i - 1] ? r / seg[i - 1] : 0; out.push([P[i - 1][0] + (P[i][0] - P[i - 1][0]) * t, P[i - 1][1] + (P[i][1] - P[i - 1][1]) * t]); break;
  }
  return out;
}
// His robe, measured on fifixed1.png (Rh = his helmet radius, heights above the ground for a robe that
// reaches 2.0 Rh below the helmet): [height, half-width under the arms]. The hem sits on the ground.
const MU_ROBE_2020 = [[2.3, 0.6], [2.1, 0.74], [1.9, 0.79], [1.6, 0.85], [1.25, 0.92], [1.0, 0.97], [0.8, 0.99], [0.55, 0.98], [0.35, 0.95], [0.2, 0.91], [0.08, 0.86]];
// his craters, traced from mush.png (face units: the moon face's centre and radii). Parts cut off by the face's
// edge or tucked under an eye in his drawing are carried on past it, so nothing shows a cut edge.
const MU_CRATERS_2020 = [
  [[0.115, -0.589], [0.013, -0.589], [-0.045, -0.656], [-0.045, -0.693], [-0.006, -0.718], [-0.019, -0.755], [0.08, -0.889], [0.2, -0.972], [0.257, -0.879], [0.301, -0.755], [0.218, -0.626]],
  [[-0.321, -0.515], [-0.436, -0.577], [-0.538, -0.589], [-0.571, -0.62], [-0.493, -0.836], [-0.347, -0.776], [-0.263, -0.693], [-0.263, -0.571]],
  [[0.743, -0.449], [0.603, -0.454], [0.571, -0.497], [0.589, -0.664], [0.709, -0.838], [0.728, -0.825], [0.816, -0.738], [0.924, -0.597], [0.949, -0.556], [0.931, -0.532]],
  [[0.988, 0.402], [0.834, 0.338], [0.855, 0.316], [0.731, 0.221], [0.564, 0.172], [0.506, 0.117], [0.481, 0.031], [0.442, 0.018], [0.436, -0.122], [0.477, -0.124], [0.529, -0.185], [0.692, -0.086], [0.821, -0.049], [0.951, 0.034], [1.052, 0.121], [1.06, 0.295], [1.018, 0.383]],
  [[-0.981, 0.491], [-1.023, 0.404], [-1.053, 0.317], [-0.895, 0.348], [-0.745, 0.189], [-0.744, 0.331], [-0.705, 0.319], [-0.686, 0.337]],
  [[0.359, 0.479], [0.295, 0.479], [0.256, 0.442], [0.231, 0.454], [0.212, 0.374], [0.263, 0.35], [0.346, 0.221], [0.385, 0.221], [0.494, 0.313], [0.494, 0.387], [0.423, 0.454]],
  [[-0.244, 0.54], [-0.359, 0.528], [-0.417, 0.485], [-0.442, 0.362], [-0.429, 0.325], [-0.455, 0.301], [-0.398, 0.12], [-0.237, 0.264], [-0.135, 0.411], [-0.135, 0.485], [-0.179, 0.528]],
  [[-0.658, 0.882], [-0.685, 0.861], [-0.767, 0.788], [-0.796, 0.69], [-0.822, 0.644], [-0.628, 0.515], [-0.538, 0.515], [-0.468, 0.607], [-0.5, 0.747], [-0.619, 0.896]],
  [[-0.055, 1.099], [-0.225, 1.077], [-0.252, 1.071], [-0.128, 0.798], [-0.013, 0.773], [0.098, 0.874], [0.206, 1.081], [0.056, 1.099], [-0.014, 1.1]],
];
// His sleeve and mitt, measured on fifixed1.png AND mush.png (they agree to 0.02), in Rw = his helmet's WHITE radius,
// the helmet's centre the origin, the ground his feet: the pivot tucked under the helmet's edge 0.84 out and 0.66 below
// its centre; the axis leans 0.265 rad out and runs 1.0 to the cuff; the bell is 0.09 half-wide at the top and 0.145
// at the cuff; the cuff is cut obliquely (its outer corner 0.137 up the axis, its inner corner 0.137 down); the mitt
// fills the cuff and comes to a point 0.273 below it. The robe's own line under the sleeve IS the sleeve's inner line,
// so at his sides the sleeve and the robe are one silhouette with one inner stroke (his), from 0.36 down the axis.
const MU_SLEEVE_2020 = { pivot: [0.84, 0.66], len: 1.0, lean: 0.265, hw0: 0.09, hw1: 0.145, cut: 0.137, tip: 0.273, stroke: 0.36 };
// ⚠ C.squash (−1 … 1): the robe squashes (+) or stretches (−) like a flour sack, keeping its area; the helmet
// rides on top. 2020 robe only.
function mushDraw(g, C) {
  const h = C.h, D = h / 3.7, yaw = C.yaw || 0, t = C.t || 0, bk = mmBoil(t) + 7 + (C.seed | 0) * 13;
  const lw = Math.max(1.5, D * 0.075) * (C.lw || 1), amp = Math.max(0.35, D * 0.02);
  let sx = C.sx || 1, sy = C.sy || 1;
  const flat = C.flat || 0;
  if (flat >= 0.85) return mushPancake(g, C, D, lw, amp, bk, t);
  if (flat) { sy = mmLerp(sy, 0.16, flat); sx = mmLerp(sx, 2.3, flat); }
  g.save(); g.translate(C.x, C.y); g.rotate(C.lean || 0); g.scale(sx, sy);
  const walk = C.walk; let bob = 0, footLift = [0, 0];
  if (walk && walk.amt) { const ph = walk.ph * Math.PI * 2; bob = -Math.abs(Math.sin(ph)) * D * 0.18 * walk.amt; footLift = [Math.max(0, Math.sin(ph)) * D * 0.25 * walk.amt, Math.max(0, -Math.sin(ph)) * D * 0.25 * walk.amt]; }
  bob -= (C.hop || 0) * D;
  const ca = Math.abs(Math.cos(yaw)), sa = Math.abs(Math.sin(yaw));
  const front = Math.cos(yaw);
  const ss = mmSeamAng(yaw);
  let hc, Dh = D, robeArms = null;
  // the yellow pull at the collar: the film's points down, his (2020) points up
  const drawPull = (zx, yb, hw, hh, up) => {
    const P = up ? [[zx - hw, yb], [zx + hw, yb], [zx, yb - hh]] : [[zx - hw, yb - hh], [zx + hw, yb - hh], [zx, yb]];
    mmInk(g, P, { fill: MM.muYellow, lw: lw * 0.8, amp: amp * 0.4, seed: 133, bk });
  };
  const drawButton = (x, y, rx, ry, i) => mmInk(g, mmCirclePts(x, y, rx, ry, 12, 0, 0.03, 171 + i), { fill: MM.muYellow, lw: lw * 0.6, amp: amp * 0.3, seed: 172 + i, bk });
  if (!MM_2020.mushRobe) {
    // ── the film's body: a short suit on stubby legs, arms out ──
    const top = -1.66 * D + bob, hips = -0.52 * D + bob * 0.5;
    const legsM = [['R', -1], ['L', 1]].map(([s, out]) => {
      const [hx, d] = mmProj(out * 0.24 * D, 0, yaw), [fx, fd] = mmProj(out * 0.46 * D, 0.12 * D, yaw);
      const lift = s === 'R' ? footLift[0] : footLift[1];
      return { s, out, d: (d + fd) / 2, hip: [hx, hips - 0.1 * D], ank: [hx + (fx - hx) * 0.35, -0.2 * D - lift], foot: [fx + Math.sin(yaw) * 0.12 * D, -0.13 * D - lift] };
    }).sort((a, b) => a.d - b.d);
    const drawLegM = (L) => {
      mmTube(g, [L.hip, L.ank], 0.3 * D, muCol('suit', L.s), lw, { amp, seed: 113 + (L.s === 'R' ? 1 : 2), bk });
      const w = D * (0.4 + 0.1 * sa);
      mmInk(g, mmCirclePts(L.foot[0], L.foot[1], w, 0.15 * D, 14, 0, 0.03, 111), { fill: muCol('foot', L.s), lw, amp, seed: 112 + (L.s === 'R' ? 1 : 2), bk });
    };
    const hw = (a) => Math.sqrt(a * a * ca * ca + (0.8 * a) * (0.8 * a) * sa * sa) * D;
    const bot = hips;
    const suit = [[-hw(0.4), top], [-hw(0.44), top + 0.4 * D], [-hw(0.5), bot - 0.2 * D], [-hw(0.47), bot + 0.02 * D], [0, bot + 0.1 * D],
                  [hw(0.47), bot + 0.02 * D], [hw(0.5), bot - 0.2 * D], [hw(0.44), top + 0.4 * D], [hw(0.4), top]];
    const sxs = (a) => Math.sin(ss) * 0.8 * a * D;
    const seam = [[sxs(0.4), top - 0.6 * D], [sxs(0.44), top + 0.3 * D], [sxs(0.5), bot], [sxs(0.5), bot + 0.6 * D]];
    const armA = C.arms || {};
    const arms = [['R', -1], ['L', 1]].map(([s, out]) => {
      const [ang, len] = armA[s] || [1.25, 1];
      const [px, d] = mmProj(out * 0.4 * D, 0, yaw);
      const a = ang * out * Math.max(0.4, ca) + (walk && walk.amt ? Math.sin(walk.ph * Math.PI * 2 + (s === 'R' ? 0 : Math.PI)) * 0.3 * walk.amt : 0);
      const L = 0.55 * D * len;
      const base = [px, top + 0.3 * D], tip = [px + Math.sin(a) * L, base[1] + Math.cos(a) * L];
      return { s, d, base, tip, a };
    }).sort((a, b) => a.d - b.d);
    const drawArm = (A) => {
      mmTube(g, [A.base, [mmLerp(A.base[0], A.tip[0], 0.5), mmLerp(A.base[1], A.tip[1], 0.5) + 0.03 * D], A.tip], 0.28 * D, muCol('suit', A.s === 'R' ? 'R' : 'L'), lw, { amp, seed: 121 + (A.s === 'R' ? 1 : 2), bk });
      mmInk(g, mmCirclePts(A.tip[0], A.tip[1], 0.18 * D, 0.17 * D, 10, 0, 0.04, 123), { fill: muCol('mitt', A.s), lw, amp, seed: 124 + (A.s === 'R' ? 1 : 2), bk });
    };
    for (const A of arms) if (A.d < -0.2 * D) drawArm(A);
    for (const L of legsM) drawLegM(L);
    const [cL, cR] = mmPair(yaw, muCol('suit', 'R'), muCol('suit', 'L'));
    mmSplit(g, suit, seam, cL, cR, { lw, amp, seed: 131, bk });
    if (front > 0.15) {   // the zip, and its yellow pull at the collar (Mush's one yellow thing)
      const zx = Math.sin(yaw) * 0.8 * 0.42 * D;
      const zy0 = top + 0.3 * D, zy1 = bot - 0.08 * D;
      mmInk(g, [[zx, zy0], [zx + Math.sin(yaw) * 0.05 * D, zy1]], { closed: false, lw: lw * 0.7, amp: amp * 0.5, seed: 132, bk });
      if (MM_2020.mushSeamStitched) {   // 13 · three cross stitches down the seam (his fractions of it)
        [0.27, 0.49, 0.72].forEach((f, i) => { const y = mmLerp(zy0, zy1, f), x = zx + Math.sin(yaw) * 0.05 * D * f;
          mmInk(g, [[x - 0.06 * D * ca, y - 0.02 * D], [x + 0.06 * D * ca, y + 0.02 * D]], { closed: false, lw: lw * 0.7, amp: amp * 0.3, seed: 135 + i, bk }); });
      }
      if (MM_2020.mushButtons) {        // 12 · three yellow buttons down his blue half, the top one biggest
        [[0.13, 0.075], [0.35, 0.056], [0.6, 0.05]].forEach(([f, r], i) => {
          const X = -0.22 * D, Z = 0.8 * 0.46 * D * Math.sqrt(Math.max(0, 1 - (0.22 / 0.46) ** 2));
          const [bx, bd] = mmProj(X, Z, yaw);
          if (bd > 0.05 * D) drawButton(bx, mmLerp(zy0, zy1, f), r * D * Math.max(0.3, bd / Z), r * D, i);
        });
      }
      if (MM_2020.mushSeamStitched) drawPull(zx, top + 0.3 * D, 0.12 * D, 0.26 * D, true);
      else mmInk(g, [[zx - 0.12 * D, top + 0.06 * D], [zx + 0.12 * D, top + 0.06 * D], [zx, top + 0.32 * D]], { fill: MM.muYellow, lw: lw * 0.8, amp: amp * 0.4, seed: 133, bk });
    }
    for (const A of arms) if (A.d >= -0.2 * D) drawArm(A);
    hc = [0, top - 0.86 * D];
  } else {
    // ── 2020: HIS ROBE, from under the helmet to the ground; arms down at his sides; feet under the hem ──
    const Lr = MM_2020.mushRobeLen, Rh = 3.47 * D / (Lr + 2), ky = Lr / 2;   // the helmet's top stays where the film's is
    Dh = Rh / 0.965;                                                            // the film builds the helmet in D: scale it
    const sq = mmClamp(C.squash || 0, -1, 1), qy = Math.exp(-0.55 * sq);         // squash + / stretch −
    const bulge = (u) => 1 + 0.18 * sq * (0.5 - u);                            // a squashed sack sags to its bottom
    let A0 = 0, A1 = 0;
    for (let i = 1; i < MU_ROBE_2020.length; i++) { const [y0, a0] = MU_ROBE_2020[i - 1], [y1, a1] = MU_ROBE_2020[i], dy = y0 - y1;
      A0 += (a0 + a1) * 0.5 * dy; A1 += (a0 * bulge(y0 / 2.3) + a1 * bulge(y1 / 2.3)) * 0.5 * dy; }
    const qx = A0 / (A1 * qy);                                                   // …and keeps its area
    const up2y = (up) => -up * Rh + bob * mmC01(up / (Lr * qy));                // the hem stays down, the shoulders bob: it stretches
    const aAt = (u) => {                                                         // his half-width at a height u (L = 2 units)
      const P = MU_ROBE_2020; if (u >= P[0][0]) return P[0][1] * bulge(1); if (u <= P[P.length - 1][0]) return P[P.length - 1][1] * bulge(0);
      for (let i = 1; i < P.length; i++) if (u >= P[i][0]) { const k = (u - P[i][0]) / (P[i - 1][0] - P[i][0]); return mmLerp(P[i][1], P[i - 1][1], k) * bulge(u / 2.3); }
      return P[0][1];
    };
    const hw = (a) => Math.sqrt(a * a * ca * ca + (0.8 * a) * (0.8 * a) * sa * sa) * Rh;
    // the robe's outline is drawn doubled and half eaten by the fills (see his arms, below), so its path sits half a
    // line inside his: the silhouette lands where his does and the hem's line stands on the ground, as before
    const ins = 0.5 * lw, side = [];
    for (const [u, a] of MU_ROBE_2020) side.push([hw(a * bulge(u / 2.3) * qx) - ins, up2y(u * ky * qy)]);
    const hemA = 0.86 * bulge(0) * qx;
    const robe = [...side.map(p => [-p[0], p[1]]), [-hw(hemA * 0.93) + ins, up2y(0.012) - ins], [-hw(hemA * 0.4), up2y(0) - ins], [hw(hemA * 0.4), up2y(0) - ins], [hw(hemA * 0.93) - ins, up2y(0.012) - ins], ...side.slice().reverse()];
    const sAt = (u) => Math.sin(ss) * 0.8 * aAt(u) * qx * Rh;                    // the seam, on the robe's surface
    const seam = [[sAt(2.3), up2y(2.3 * ky * qy) - Rh]];
    for (const [u] of MU_ROBE_2020) seam.push([sAt(u), up2y(u * ky * qy)]);
    seam.push([sAt(0.05), up2y(0) + 0.6 * Rh]);
    // a point on the robe's surface: X across his body (his right is −), u = height in his units
    const onRobe = (X, u) => { const a = aAt(u) * qx * Rh, Z = 0.8 * a * Math.sqrt(Math.max(0, 1 - (X / a) * (X / a)));
      const [x, d] = mmProj(X, Z, yaw); const nX = X / (a * a), nZ = Z / (0.64 * a * a), nl = Math.hypot(nX, nZ) || 1;
      return { x, y: up2y(u * ky * qy), d, face: (-nX * Math.sin(yaw) + nZ * Math.cos(yaw)) / nl }; };
    // ── his arms (MU_SLEEVE_2020) ──
    //   At his sides the sleeve and the robe are ONE silhouette (fifixed1.png, mush.png, and his 2021 animatic draw it
    //   so): every outline is drawn first, twice as wide, then every fill over it, so only the outer half of the line
    //   survives, round the union; then his one inner stroke. As he turns the line between an arm and the robe fades in
    //   (the near arm's own outline over the robe; the robe's outline over the far arm), so the turn never pops.
    //   The film's arm angles still act: its resting 1.25 hangs the sleeve at his side, 2.8 is still an arm raised.
    const Rw = Rh - 0.525 * lw, S0 = MU_SLEEVE_2020;                             // his helmet's white radius: his unit
    const shUp = Lr * qy;                                                        // the shoulders sit under the helmet's rim
    const hcY = up2y(shUp) - Rh;                                                 // the helmet's centre
    const armA = C.arms || {}, rest = MM_2020.mushArmRest;
    const toHis = (a) => a <= rest ? a * S0.lean / rest : S0.lean + (a - rest) * (Math.PI - S0.lean) / (Math.PI - rest);
    const kc = Math.abs(Math.cos(yaw));                                          // his oblique cuff is a front-view shape
    const Qr = mmWob(robe, 131, amp, bk);
    const arms = [['R', -1], ['L', 1]].map(([s, out]) => {
      const [angF, len, fwd] = armA[s] || [rest, 1, 0], cfw = Math.cos(fwd || 0), sfw = Math.sin(fwd || 0);   // (EP9) fwd: the arm swings forward too (0: his old frontal swing)
      const ang = toHis(angF) + (walk && walk.amt ? Math.sin(walk.ph * Math.PI * 2 + (s === 'R' ? 0 : Math.PI)) * 0.3 * walk.amt : 0);
      const PX = out * S0.pivot[0] * Rw * Math.min(qx, 1), PY = hcY + S0.pivot[1] * Rw;   // the pivot stays tucked under the helmet's edge
      const L = S0.len * Rw * (len === undefined ? 1 : len) * Math.sqrt(qy);
      const CX = PX + out * Math.sin(ang) * L * cfw, CY = PY + Math.cos(ang) * L * cfw;      // the cuff's centre
      const [p0, d0] = mmProj(PX, 0, yaw), [p1, d1] = mmProj(CX, sfw * L, yaw);
      let ax = p1 - p0, ay = CY - PY; const al = Math.hypot(ax, ay) || 1; ax /= al; ay /= al;
      let nx = -ay, ny = ax;                                                     // across the arm, pointing to his outside
      if (nx * (out * Math.cos(yaw) || 1) < 0) { nx = -nx; ny = -ny; }
      const at = (f, v) => [p0 + ax * f + nx * v, PY + ay * f + ny * v];         // f down the axis, v outward
      const hwAt = (f) => { const u = mmC01(f / al); return (S0.hw1 - (S0.hw1 - S0.hw0) * (1 - u) * (1 - u)) * Rw; };
      const cut = S0.cut * Rw * kc, fo = al - cut, fi = al + cut, fs = S0.stroke * al;   // cuff corners; his stroke's start
      const P = [];
      for (let i = 0; i <= 6; i++) { const f = fo * i / 6; P.push(at(f, hwAt(f) - 0.5 * lw)); }        // the outer edge, down (half a line in)
      const k0 = P.length;
      for (const f of [fi, mmLerp(fi, fs, 0.25), mmLerp(fi, fs, 0.5), mmLerp(fi, fs, 0.75), fs, fs * 0.5, 0])
        P.push(at(f, -hwAt(f) - 0.03 * Rw));                                     // the inner edge, up (a hair into the robe)
      P.push(at(-0.07 * Rw, -0.03 * Rw), at(-0.09 * Rw, 0.03 * Rw));             // the round top, under the helmet
      const sd = s === 'R' ? 1 : 2;
      const Q = mmWob(P, 121 + sd, amp * 0.6, bk);
      const mitt = [at(fo, hwAt(fo)), at(al + 0.06 * Rw, mmLerp(0.1, 0.125, kc) * Rw), at(al + 0.19 * Rw, mmLerp(0.06, 0.075, kc) * Rw),
                    at(al + S0.tip * Rw, 0.014 * Rw * kc), at(al + mmLerp(0.13, 0.19, kc) * Rw, -mmLerp(0.08, 0.03, kc) * Rw), at(fi, -hwAt(fi) - 0.03 * Rw)];
      return { s, sd, d: (d0 + d1) / 2, Q, inner: Q.slice(k0, k0 + 5), up: Q.slice(k0 + 5), mitt, col: muCol('suit', s), P0: [p0, PY], al, rise: -Math.cos(ang), fwd: (d1 - d0) / L,
               hand: at(al + 0.11 * Rw, 0), hAng: Math.atan2(ay, ax) };                // (scene 9: where a prop sits in the mitt)
    });
    // feet: flat half-ovals on the ground, poking out from under the hem, his ±0.795 Rw (fifixed1.png, mush.png)
    const feet = [['R', -1], ['L', 1]].map(([s, out]) => {
      const X = out * 0.795 * Rw * qx, Z = 0.5 * Rh, [x, d] = mmProj(X, Z, yaw), lift = s === 'R' ? footLift[0] : footLift[1];
      return { s, out, d, x: x + Math.sign(Math.sin(yaw)) * 0.06 * Rh * sa, lift };
    }).sort((a, b) => a.d - b.d);
    const drawFoot = (F) => {
      const fw = mmLerp(0.26, 0.3, sa) * Rh * Math.sqrt(qx), fh = 0.23 * Rh, y0 = -F.lift + 0.01 * Rh, P = [];
      for (let i = 0; i <= 10; i++) { const a = Math.PI * (1 - i / 10); P.push([F.x + Math.cos(a) * fw, y0 - Math.sin(a) * fh]); }
      P.push([F.x + fw * 0.7, y0 + 0.005 * Rh], [F.x - fw * 0.7, y0 + 0.005 * Rh]);
      mmInk(g, P, { fill: muCol('foot', F.s), lw, amp: amp * 0.6, seed: 112 + (F.s === 'R' ? 1 : 2), bk, poly: false });
    };
    const drawMitt = (A) => { if (C.inHand && C.inHand.under) C.inHand(g, A.s, A.hand, A.hAng, Rw, A.d);   // (EP9, the grip) what he holds, under his mitt
      mmInk(g, A.mitt, { fill: muCol('mitt', A.s), lw, amp: amp * 0.5, seed: 124 + A.sd, bk, poly: false }); };
    robeArms = { arms, drawMitt, Rw };
    const behind = (A) => A.d < -0.25 * Rw;                                      // round his back: the robe hides the mitt too
    const fade = (A) => mmSeg(Math.abs(A.d), 0.12 * Rw, 0.4 * Rw);               // how far the arm has left his side
    const fillArm = (A) => { g.beginPath(); mmTrace(g, A.Q, true); g.fillStyle = A.col; g.fill(); };
    for (const F of feet) if (F.d < 0) drawFoot(F);
    // 1 · every outline, doubled (the fills eat its inner half)
    g.save(); g.lineJoin = 'round'; g.strokeStyle = MM.ink; g.lineWidth = 2 * lw;
    g.beginPath(); mmTrace(g, Qr, true); g.stroke();
    for (const A of arms) { g.beginPath(); mmTrace(g, A.Q, true); g.stroke(); }
    g.restore();
    // 2 · the fills: the far arm, the robe (and its seam, buttons and pull), the near arm
    for (const A of arms) if (A.d < 0) { fillArm(A); if (behind(A)) drawMitt(A); }
    const [cL, cR] = mmPair(yaw, muCol('suit', 'R'), muCol('suit', 'L'));
    mmSplit(g, Qr, seam, cL, cR, { lw: 0 });
    if (front > 0.15) {
      const pullB = (Lr - 0.23) * qy, pullT = (Lr - 0.07) * qy;                 // his pull, just under the helmet
      const uTop = pullB / (ky * qy);                                          // the seam starts under the pull (his units)
      if (MM_2020.mushSeamStitched) {        // 13 · the seam, inked, with three cross stitches (his heights 1.42, 0.99, 0.54)
        const S = []; for (let i = 0; i <= 8; i++) { const u = mmLerp(uTop, 0.02, i / 8); S.push([sAt(u), up2y(u * ky * qy)]); }
        mmInk(g, S, { closed: false, lw: lw * 0.7, amp: amp * 0.5, seed: 132, bk });
        [1.42, 0.99, 0.54].forEach((u, i) => {
          const a = onRobe(-0.065 * Rh, u + 0.04), b = onRobe(0.065 * Rh, u - 0.04);
          mmInk(g, [[a.x, a.y], [b.x, b.y]], { closed: false, lw: lw * 0.7, amp: amp * 0.3, seed: 135 + i, bk });
        });
      } else {                               // the film's plain zip line
        const S = []; for (let i = 0; i <= 8; i++) { const u = mmLerp(uTop, 0.02, i / 8); S.push([sAt(u), up2y(u * ky * qy)]); }
        mmInk(g, S, { closed: false, lw: lw * 0.7, amp: amp * 0.5, seed: 132, bk });
      }
      if (MM_2020.mushButtons) {             // 12 · three yellow buttons down his blue half, the top one biggest (his sizes)
        [[1.68, 0.105], [1.26, 0.078], [0.77, 0.072]].forEach(([u, r], i) => {
          const B = onRobe(-0.41 * Rh * qx, u);
          if (B.face > 0.08) drawButton(B.x, B.y, r * Rh * Math.max(0.3, B.face), r * Rh, i);
        });
      }
      const zx = sAt(uTop), pw = 0.15 * Rh * Math.max(0.4, front);
      if (MM_2020.mushSeamStitched) drawPull(zx, up2y(pullB), pw, (pullT - pullB) * Rh, true);
      else drawPull(zx, up2y(pullT), pw, (pullT - pullB) * Rh, false);
    }
    for (const A of arms) if (A.d >= 0) fillArm(A);
    // 3 · the line between an arm and the robe as he turns, always his black (never faded to grey):
    //     the NEAR arm: his inner stroke grows up to the shoulder, then its whole outline shows over the robe;
    //     the FAR arm: his inner stroke, until it has gone round his back; then the robe's line over it
    const inkLine = (P, closed, clipP) => { g.save(); if (clipP) { g.beginPath(); mmTrace(g, clipP, true); g.clip(); }
      g.beginPath(); mmTrace(g, P, closed); g.lineWidth = lw; g.strokeStyle = MM.ink; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); g.restore(); };
    for (const A of arms) {
      const k = fade(A);
      if (A.d >= 0) {
        if (k >= 1) inkLine(A.Q, true, Qr);
        else inkLine(k > 0 ? A.inner.concat(mm20Grow([A.inner[A.inner.length - 1], A.up[0], A.up[1]], k).slice(1)) : A.inner, false);
      } else if (k < 0.5) inkLine(A.inner, false);
      else inkLine(Qr, true, A.Q);
    }
    for (const A of arms) if (!behind(A)) drawMitt(A);
    for (const F of feet) if (F.d >= 0) drawFoot(F);
    hc = [0, hcY];
  }
  // ── the helmet: his face inside, the antenna (behind or in front of the dome) ──
  const ant = C.ant || {};
  const A20 = MM_2020.mushAntenna2020;
  // the film's antenna: on his left, a long stalk curving up. 2020: on his RIGHT, short, straight out of the rim.
  const antPhi = 0.62, antA = antPhi + yaw, antX = hc[0] + Math.sin(antA) * 0.72 * Dh, antD = A20 ? Math.sin(0.715) * Math.sin(yaw) : Math.cos(antA);
  const drawAnt = () => {
    const wob = (ant.wobble || 0) * Math.sin(t * 19) + 0.08 * Math.sin(t * 2.3 + 1), droop = ant.droop || 0;
    if (A20) {
      // his (fifixed1.png, mush.png, the 2021 animatic), measured in U = the helmet's white radius: a red box lying along
      // the helmet's curve 41° off the top on his right, its centre 1.18 U out, 0.37 × 0.22 U, sitting on the helmet's
      // line; a stalk only 0.11 U long; the blue ball 0.138 U in radius, 1.54 U out. Built on the sphere: it turns with him.
      const Rh = 0.965 * Dh, U = Rh - 0.525 * lw, n3 = [-Math.sin(0.715), -Math.cos(0.715)];
      const [bx0] = mmProj(n3[0], 0, yaw);
      const P0 = [hc[0] + bx0 * 1.18 * U, hc[1] + n3[1] * 1.18 * U];            // the box's centre
      let ux = bx0, uy = n3[1]; const ul = Math.hypot(ux, uy) || 1; ux /= ul; uy /= ul;   // outward on screen
      const turn = wob * 0.5 + droop * 1.5 * (ux < 0 ? -1 : 1), cu = Math.cos(turn), su = Math.sin(turn);
      const vx = ux * cu - uy * su, vy = ux * su + uy * cu, L = U * (0.11 + 0.2 * (ant.up || 0));
      const bw = 0.185 * U, bh = 0.11 * U, nx = -uy, ny = ux;
      if (MM_2020.mushAntennaBox) mmInk(g, [[P0[0] - nx * bw - ux * bh, P0[1] - ny * bw - uy * bh], [P0[0] + nx * bw - ux * bh, P0[1] + ny * bw - uy * bh], [P0[0] + nx * bw + ux * bh, P0[1] + ny * bw + uy * bh], [P0[0] - nx * bw + ux * bh, P0[1] - ny * bw + uy * bh]], { fill: MM.muRed, lw: lw * 0.9, amp: amp * 0.3, seed: 141, bk });
      else mmInk(g, mmCirclePts(P0[0], P0[1], 0.13 * Dh, 0.08 * Dh, 8, Math.atan2(uy, ux) + Math.PI / 2, 0), { fill: MM.muRed, lw: lw * 0.8 });
      const s0 = [P0[0] + ux * bh, P0[1] + uy * bh], tip = [s0[0] + vx * L, s0[1] + vy * L];
      mmInk(g, [s0, [tip[0] + vx * 0.03 * U, tip[1] + vy * 0.03 * U]], { closed: false, lw: lw * 1.1, amp: amp * 0.2, seed: 142, bk });
      const ball = [tip[0] + vx * 0.138 * U, tip[1] + vy * 0.138 * U];
      mmInk(g, mmCirclePts(ball[0], ball[1], 0.138 * U, 0.138 * U, 10, 0, 0.03, 143), { fill: MM.muBlue, lw: lw * 0.9, amp: amp * 0.4, seed: 144, bk });
      return ball;                                     // the ball's centre, as the film's antenna reports it (Mush's notes rise from it)
    }
    const bx = antX, by = hc[1] - 0.72 * Dh;
    const a = -1.35 + 0.35 * Math.sin(antA) + wob * 0.5 + droop * 1.5;
    const L = Dh * (0.72 + 0.2 * (ant.up || 0));
    const mid = [bx + Math.cos(a - 0.35) * L * 0.55, by + Math.sin(a - 0.35) * L * 0.55], tip = [bx + Math.cos(a) * L, by + Math.sin(a) * L];
    if (MM_2020.mushAntennaBox) {        // 16 · his red box, standing along the stalk's first step
      const ux = Math.cos(a - 0.35), uy = Math.sin(a - 0.35), nx = -uy, ny = ux, bw = 0.12 * Dh, bh = 0.1 * Dh, c = [bx - ux * 0.02 * Dh, by + 0.02 * Dh];
      mmInk(g, [[c[0] - nx * bw - ux * bh, c[1] - ny * bw - uy * bh], [c[0] + nx * bw - ux * bh, c[1] + ny * bw - uy * bh], [c[0] + nx * bw + ux * bh, c[1] + ny * bw + uy * bh], [c[0] - nx * bw + ux * bh, c[1] - ny * bw + uy * bh]], { fill: MM.muRed, lw: lw * 0.8 });
    } else mmInk(g, mmCirclePts(bx, by + 0.02 * Dh, 0.13 * Dh, 0.08 * Dh, 8, 0, 0, 141), { fill: MM.muRed, lw: lw * 0.8 });
    mmInk(g, [[bx, by], mid, tip], { closed: false, lw: lw * 0.9, amp: amp * 0.4, seed: 142, bk });
    mmInk(g, mmCirclePts(tip[0], tip[1], 0.15 * Dh, 0.15 * Dh, 10, 0, 0.03, 143), { fill: MM.muBlue, lw: lw * 0.9, amp: amp * 0.4, seed: 144, bk });
    return tip;
  };
  let antTip = null;
  if (antD < 0) antTip = drawAnt();
  const ring = MM_2020.mushHelmetRing;
  // 9 · his helmet is an opaque white ring: round, the face's window CONCENTRIC in it at 0.872 of its white radius
  //     (fifixed1.png 0.861, mush.png 0.882; both centred to a pixel)
  const RwH = 0.965 * Dh - 0.525 * lw;                                           // the helmet's white radius
  const dome = ring ? mmCirclePts(hc[0], hc[1], 0.965 * Dh, 0.965 * Dh, 26, 0, 0.02, 151) : mmCirclePts(hc[0], hc[1], 0.98 * Dh, 0.95 * Dh, 26, 0, 0.02, 151);
  mmInk(g, dome, { fill: ring ? MM.muRing : '#dfeefa', amp, seed: 152, bk });
  // the face: a cream moon disc that turns inside the glass
  const fv = Math.cos(yaw);
  const F0x = ring ? 0.872 * RwH - 0.4 * lw : 0.74 * Dh, F0y = ring ? F0x : 0.74 * Dh, fdy = ring ? 0 : 0.06 * Dh;
  // 🎬 round his back an opaque helmet shows no face: the window slides off its edge (the dome clips it) and is gone
  const slide = ring ? 1.3 * mmSmooth(mmSeg(0.15 - fv, 0, 0.6)) : 0;
  if (fv > (ring ? -0.45 : -0.1)) {
    const fx = hc[0] + Math.sin(yaw) * (0.26 + slide) * Dh, fy = hc[1] + fdy, frx = F0x * Math.max(0.5, 0.55 + 0.45 * fv), fry = F0y;
    g.save(); g.beginPath(); mmTrace(g, dome, true); g.clip();
    const face = mmCirclePts(fx, fy, frx, fry, 22, 0, 0.02, 153);
    mmInk(g, face, { fill: MM.muFace, lw: lw * 0.8, amp: amp * 0.6, seed: 154, bk });
    const F20 = MM_2020.mushFace2020;
    g.save(); g.beginPath(); mmTrace(g, face, true); g.clip();
    if (MM_2020.mushCraters) {           // 15 · his craters, blotchy, a thin grey edge
      const k = MM_2020.mushCraterK;
      MU_CRATERS_2020.forEach((P, i) => {
        let cx = 0, cy = 0; for (const p of P) { cx += p[0]; cy += p[1]; } cx /= P.length; cy /= P.length;
        const Q = P.map(([u, v]) => [fx + (cx + (u - cx) * k) * frx, fy + (cy + (v - cy) * k) * fry]);
        mmInk(g, Q, { fill: MM.muSpot, lw: lw * 0.28, ink: MM.muCraterEdge, amp: amp * 0.3, seed: 190 + i, bk, poly: false });
      });
    } else for (const [u, v, r] of [[-0.45, 0.42, 0.1], [0.5, 0.5, 0.07], [0.35, -0.55, 0.06], [-0.6, -0.2, 0.05]]) mmDot(g, fx + u * frx, fy + v * fry, r * Dh, MM.muSpot);
    mushFace(g, C, Dh, yaw, fx, fy, frx, fry, lw, amp, bk, t, F20 ? { F0: F0x, U: RwH } : undefined);
    g.restore();
    if (MM_2020.mushCraters || F20) mmInk(g, face, { lw: lw * 0.8, amp: amp * 0.6, seed: 154, bk });   // his window's line on top: the craters
    g.restore();                                                                                        // and his big eye tuck under it
  }
  else if (!ring) {
    g.save(); g.beginPath(); mmTrace(g, dome, true); g.clip();
    mmInk(g, mmCirclePts(hc[0] - Math.sin(yaw) * 0.2 * Dh, hc[1] + fdy, F0x, F0y, 22, 0, 0.02, 153), { fill: MM.muFace, lw: lw * 0.8, amp: amp * 0.6, seed: 154, bk });
    g.restore();
  }
  // glass: a highlight and the rim (2020: an opaque ring has no glint)
  if (!ring) { g.save(); g.globalAlpha = 0.55; g.strokeStyle = MM.white; g.lineWidth = Dh * 0.09; g.lineCap = 'round';
    g.beginPath(); g.arc(hc[0], hc[1], 0.8 * Dh, -2.55, -1.95); g.stroke(); g.globalAlpha = 1; g.restore(); }
  mmInk(g, dome, { lw: lw * 1.05, amp, seed: 152, bk });
  // HINGE (2026-09-30): an arm on our side of him, raised, rises IN FRONT of his helmet (at 3/4 and side its shoulder is
  // nearer than the helmet's surface), but it was drawn under the helmet and vanished. It is drawn again over the
  // helmet from the hand inward: nothing while the arm hangs (his sleeves stay tucked under the rim as he drew them),
  // then, as the arm rises or swings toward us, everything farther than a shrinking distance from the shoulder, so the
  // arm comes out from behind the rim hand first, and is whole once it is up.
  if (robeArms) for (const A of robeArms.arms) {
    if (A.d < 0.2 * robeArms.Rw) continue;
    const sl = mmC01((Math.max(A.rise, A.fwd) - 0.3) / 0.5);
    if (sl <= 0) continue;
    const Rc = (1 - sl) * (A.al + 0.35 * robeArms.Rw);
    g.save(); g.beginPath(); g.rect(-1e4, -1e4, 2e4, 2e4); g.arc(A.P0[0], A.P0[1], Math.max(0.01, Rc), 0, Math.PI * 2, true); g.clip('evenodd');
    g.beginPath(); mmTrace(g, mmWob(dome, 152, amp, bk), true); g.clip();
    g.beginPath(); mmTrace(g, A.Q, true); g.fillStyle = A.col; g.fill();
    g.lineWidth = lw; g.strokeStyle = MM.ink; g.lineJoin = 'round'; g.stroke();
    robeArms.drawMitt(A);
    g.restore();
  }
  if (antD >= 0) antTip = drawAnt();
  // 🎬 scene 9: something in his hand (C.inHand(g, side, [x, y] the mitt's middle, the arm's angle, his unit, its depth)),
  //    drawn last, in his own space, so it rides every squash and lean with him (his water bottle)
  if (C.inHand && !C.inHand.under && robeArms) for (const A of robeArms.arms) C.inHand(g, A.s, A.hand, A.hAng, robeArms.Rw, A.d);
  g.restore();
  return { D, top: C.y + (hc[1] - 0.95 * Dh) * sy, antTip: antTip ? [C.x + antTip[0] * sx, C.y + antTip[1] * sy] : null };
}

// Mush squashed flat as a doormat (the film's own; 10 · his big eye is pale blue here too)
function mushPancake(g, C, D, lw, amp, bk, t) {
  const x = C.x, y = C.y, w = D * 2.3, hh = D * 0.26, open = C.eyes && C.eyes.lid !== undefined ? 1 - C.eyes.lid : 0;
  const mat = mmCirclePts(x, y - hh * 0.55, w, hh, 30, 0, 0.02, 181);
  mmSplit(g, mat, [[x, y - 2 * hh - 10], [x, y + 10]], MM.muBlue, MM.muRed, { lw, amp, seed: 182, bk });
  const face = mmCirclePts(x + D * 0.1, y - hh * 0.95, D * 0.95, hh * 0.62, 24, 0, 0.02, 183);
  mmInk(g, face, { fill: MM.muFace, lw: lw * 0.8, amp: amp * 0.6, seed: 184, bk });
  for (const [ex, er] of [[-0.35, 0.24], [0.42, 0.17]]) {
    const cx = x + D * 0.1 + ex * D, cy = y - hh * 1.0;
    if (open > 0.05) {
      mmInk(g, mmCirclePts(cx, cy, er * D, er * D * 0.55 * open + 1, 12, 0, 0, 185), { fill: ex < 0 && MM_2020.mushBigEyeBlue ? MM.muEyeBig : MM.white, lw: lw * 0.8 });
      mmDot(g, cx + (C.eyes.look ? C.eyes.look[0] * er * D * 0.3 : 0), cy, er * D * 0.3 * Math.min(1, open * 1.5), MM.ink);
    } else mmInk(g, [[cx - er * D, cy], [cx + er * D, cy]], { closed: false, lw: lw * 0.9 });
  }
  return { D, top: y - hh * 2, antTip: null };
}
function mushFace(g, C, D, yaw, fx, fy, frx, fry, lw, amp, bk, t, G) {
  const E = C.eyes || {}, M = C.mouth || (C.talk > 0.06 ? { open: C.talk } : {});      // C.talk (the shots' lip sync) opens his mouth too
  const F20 = MM_2020.mushFace2020 && G;           // G = { F0: the face's radius seen from the front, U: the helmet's white radius }
  const U = F20 ? G.U : 0, kx = F20 ? frx / G.F0 : 1;   // his layout is measured in U; across, it narrows as the face turns
  let blink = 0;
  if (C.blink === undefined) { const bi = Math.floor((t + 0.9) / 4.3); const bt = bi * 4.3 + mmH2(bi, 55) * 3 - 0.9; blink = (t >= bt && t < bt + 0.12) ? 1 : 0; }
  else blink = C.blink;
  const sh = Math.sin(yaw) * 0.35 * frx;
  const lk = E.look || [0, 0];
  // the big round eye (his right, our left) and the small one. 2020, measured on fifixed1.png AND mush.png (they agree
  // to 0.01), in U from the helmet's centre: the big eye at (−0.49, −0.10), its pale fill 0.29 in radius, a 0.03 pupil;
  // the small eye at (0.31, −0.20), fill 0.147, pupil 0.026. (+0.45 lw: the circle is drawn on the rim's centre line.)
  const big = F20 ? { x: fx + sh - 0.49 * U * kx, y: fy - 0.10 * U, r: (0.29 * U + 0.45 * lw) * (1 + 0.12 * (E.wide || 0)), pr: 0.03 * U, big: 1 }
                  : { x: fx - 0.36 * frx + sh, y: fy - 0.12 * fry, r: 0.3 * D * (1 + 0.12 * (E.wide || 0)), big: 1 };
  const small = F20 ? { x: fx + sh + 0.31 * U * kx, y: fy - 0.20 * U, r: (0.147 * U + 0.45 * lw) * (1 + 0.12 * (E.wide || 0)), pr: 0.026 * U }
                    : { x: fx + 0.4 * frx + sh, y: fy - 0.06 * fry, r: 0.19 * D * (1 + 0.12 * (E.wide || 0)) };
  const lid = Math.max(E.lid || 0, blink);
  if ((E.wince || 0) > 0.5) {          // 🎬 scene 9: squeezed shut, > <, both pointing in at his nose (a wince)
    for (const [e, sd] of [[big, 1], [small, -1]]) { const r = e.r * 0.85;
      mmInk(g, [[e.x - sd * r, e.y - r * 0.62], [e.x + sd * r * 0.55, e.y], [e.x - sd * r, e.y + r * 0.62]], { closed: false, lw: lw * 1.15, amp: amp * 0.3, seed: 161, bk }); }
  } else if ((E.happy || 0) > 0.5) {
    for (const e of [big, small]) mmInk(g, [[e.x - e.r, e.y + e.r * 0.2], [e.x, e.y - e.r * 0.6], [e.x + e.r, e.y + e.r * 0.2]], { closed: false, lw: lw * 1.1, amp: amp * 0.3, seed: 161, bk });
  } else {
    for (const [e, droop0] of [[big, 0], [small, 0.42]]) {
      const droop = MM_2020.mushSmallEyeNoLid ? 0 : droop0;          // 11 · his small eye has no droopy lid
      const P = mmCirclePts(e.x, e.y, e.r, e.r, 14, 0, 0.02, 162);
      const white = e.big && MM_2020.mushBigEyeBlue ? MM.muEyeBig : MM.white;   // 10 · his big eye is pale blue
      mmInk(g, P, { fill: white, lw: lw * 0.9, amp: amp * 0.3, seed: 163, bk });
      if (F20) mmDot(g, e.x + lk[0] * e.r * 0.45, e.y + lk[1] * e.r * 0.4, e.pr, MM.ink);
      else mmDot(g, e.x + lk[0] * e.r * 0.45 + e.r * 0.12, e.y + lk[1] * e.r * 0.4 + (droop0 ? e.r * 0.25 : 0), e.r * 0.28, MM.ink);
      const L = mmC01(Math.max(droop, lid));
      if (L > 0.02) {
        g.save(); g.beginPath(); mmTrace(g, P, true); g.clip();
        g.fillStyle = droop ? MM.muEyePink : MM.muFace; g.fillRect(e.x - e.r * 1.2, e.y - e.r * 1.2, e.r * 2.4, e.r * 2.4 * L);
        g.beginPath(); g.moveTo(e.x - e.r * 1.2, e.y - e.r * 1.2 + e.r * 2.4 * L); g.lineTo(e.x + e.r * 1.2, e.y - e.r * 1.2 + e.r * 2.4 * L);
        g.lineWidth = lw * 0.8; g.strokeStyle = MM.ink; g.stroke(); g.restore();
        mmInk(g, P, { lw: lw * 0.9, amp: amp * 0.3, seed: 163, bk });
      }
    }
  }
  // a little nose and a little mouth. 2020: his nose is a "(" 0.22 U tall and 0.065 U deep at (−0.07, 0.046) U;
  // his mouth is a small smile 0.15 U wide at (0.28, 0.585) U, low on the right (both drawings)
  if (F20) { const N = [], A = 1.15, nx0 = fx + sh - 0.0375 * U * kx, ny0 = fy + 0.046 * U;
    for (let i = 0; i <= 6; i++) { const a = -A + 2 * A * i / 6; N.push([nx0 - 0.065 * U * kx * (Math.cos(a) - Math.cos(A)) / (1 - Math.cos(A)), ny0 + 0.108 * U * Math.sin(a) / Math.sin(A)]); }
    mmInk(g, N, { closed: false, lw: lw * 0.85, amp: amp * 0.3, seed: 164, bk }); }
  else mmInk(g, [[fx + sh + 0.02 * D, fy + 0.2 * fry], [fx + sh - 0.06 * D, fy + 0.26 * fry], [fx + sh + 0.01 * D, fy + 0.31 * fry]], { closed: false, lw: lw * 0.7, amp: amp * 0.3, seed: 164, bk });
  const open = mmC01(M.open || 0), shape = M.shape || (F20 && MM_2020.mushSmile2020 ? 'smile' : 'line');
  const mx = F20 ? fx + sh + 0.28 * U * kx : fx + sh + 0.02 * D, my = F20 ? fy + 0.585 * U : fy + 0.5 * fry;
  if (shape === 'grin' || open > 0.1) {
    const w = 0.2 * D * (shape === 'grin' ? 1.5 : 1), hh = 0.05 * D + open * 0.18 * D;
    const P = shape === 'grin' ? [[mx - w, my - hh * 0.2], [mx + w, my - hh * 0.2], [mx + w * 0.5, my + hh], [mx - w * 0.5, my + hh]] : mmCirclePts(mx, my, w * 0.7, hh, 10, 0, 0, 165);
    mmInk(g, P, { fill: MM.mouth, lw: lw * 0.8, amp: amp * 0.3, seed: 166, bk, poly: false });
  } else if (shape === 'frown') {
    mmInk(g, [[mx - 0.12 * D, my + 0.04 * D], [mx, my - 0.03 * D], [mx + 0.12 * D, my + 0.04 * D]], { closed: false, lw: lw * 0.8, amp: amp * 0.3, seed: 167, bk });
  } else if (shape === 'smile') {
    if (F20) mmInk(g, [[-0.105, -0.012], [-0.06, 0.03], [0, 0.048], [0.06, 0.035], [0.105, -0.03], [0.07, -0.002], [0, 0.012], [-0.07, 0.002]]   // his: a filled
                        .map(([u, v]) => [mx + u * U * kx, my + v * U]), { fill: MM.ink, lw: lw * 0.3, amp: amp * 0.2, seed: 167, bk, poly: false });   // crescent, the right tip higher
    else mmInk(g, [[mx - 0.14 * D, my - 0.03 * D], [mx, my + 0.05 * D], [mx + 0.14 * D, my - 0.03 * D]], { closed: false, lw: lw * 0.8, amp: amp * 0.3, seed: 167, bk });
  } else {
    mmInk(g, [[mx - 0.08 * D, my], [mx + 0.08 * D, my + 0.01 * D]], { closed: false, lw: lw * 0.8, amp: amp * 0.3, seed: 167, bk });
  }
}

// THE CAR'S SPARE HELMET (dh_car.js, the film's prop, strapped over Mush's helmet). With the 2020 robe and ring his
// helmet is smaller (the same top) and his face fills most of it, so the film's straps would cross his face: here they
// run down his white ring instead, round the window, to under his chin. Flag off: the film's code, verbatim.
function dhCarSpareHelmet(g, U) {
  if (MM_2020.mushSpareFit && MM_2020.mushRobe && MM_2020.mushHelmetRing) return mm20SpareHelmet(g, U);
  const D = U.h / 3.7, yaw = U.yaw || 0, t = U.t || 0, bk = mmBoil(t) + 7 + 26;
  const lw = Math.max(1.5, D * 0.075), amp = Math.max(0.35, D * 0.02);
  const top = -1.66 * D - (U.hop || 0) * D, hcY = top - 0.86 * D, f = Math.sin(yaw), fc = Math.cos(yaw);
  g.save(); g.translate(U.x, U.y); g.rotate(U.lean || 0); g.scale(U.sx || 1, U.sy || 1);
  const cx = -0.05 * D * f, by = hcY - 0.78 * D, w = 0.42 * D, hh = 0.3 * D;
  for (const s of [-1, 1]) mmInk(g, [[cx + s * w * 0.9, by + 0.03 * D], [s * 0.93 * D, hcY + 0.05 * D], [s * 0.62 * D, hcY + 0.8 * D]], { closed: false, lw: lw * 1.5, ink: '#3d3a44', amp: amp * 0.4, seed: 301 + s, bk });
  const P = []; for (let i = 0; i <= 14; i++) { const a = Math.PI + i / 14 * Math.PI; P.push([cx + Math.cos(a) * w, by + Math.sin(a) * hh]); }
  P.push([cx + w * 1.02 + 0.14 * D * Math.max(0, f), by + 0.04 * D], [cx - w * 1.02 - 0.14 * D * Math.max(0, -f), by + 0.04 * D]);
  mmInk(g, P, { fill: DH_CAR_COL.spare || MM.muRed, lw, amp: amp * 0.5, seed: 303, bk, poly: false });
  for (const u of [-0.4, 0, 0.4]) { const x = cx + u * w * 0.8 + f * 0.05 * D; mmInk(g, [[x, by - hh * 0.72], [x, by - hh * 0.3]], { closed: false, lw: lw * 0.9, ink: '#3d3a44' }); }
  g.restore();
}
function mm20SpareHelmet(g, U) {
  const D = U.h / 3.7, yaw = U.yaw || 0, t = U.t || 0, bk = mmBoil(t) + 7 + 26, f = Math.sin(yaw);
  const lw = Math.max(1.5, D * 0.075) * (U.lw || 1), amp = Math.max(0.35, D * 0.02);
  // the 2020 helmet, as mushDraw builds it: its centre and radius (walk bob, hop and squash included)
  const Lr = MM_2020.mushRobeLen, Rh = 3.47 * D / (Lr + 2), qy = Math.exp(-0.55 * mmClamp(U.squash || 0, -1, 1));
  let bob = U.walk && U.walk.amt ? -Math.abs(Math.sin(U.walk.ph * Math.PI * 2)) * D * 0.18 * U.walk.amt : 0;
  bob -= (U.hop || 0) * D;
  const hcY = -(Lr * qy + 1) * Rh + bob, r = Rh - 0.525 * lw - 0.35 * lw;        // the strap rides the outer part of the white ring
  g.save(); g.translate(U.x, U.y); g.rotate(U.lean || 0); g.scale(U.sx || 1, U.sy || 1);
  const cx = -0.05 * D * f, by = hcY - 0.808 * Rh, w = 0.435 * Rh, hh = 0.31 * Rh;
  for (const s of [-1, 1]) {
    const a0 = Math.atan2(by + 0.03 * D - hcY, cx + s * w * 0.9), a1 = Math.atan2(Math.sin(1.22), s * Math.cos(1.22));   // down to 70° under the side
    let da = a1 - a0; if (s > 0 && da < 0) da += Math.PI * 2; if (s < 0 && da > 0) da -= Math.PI * 2;
    const P = [[cx + s * w * 0.9, by + 0.03 * D]];
    for (let i = 1; i <= 9; i++) { const a = a0 + da * i / 9; P.push([Math.cos(a) * r, hcY + Math.sin(a) * r]); }
    mmInk(g, P, { closed: false, lw: lw * 1.5, ink: '#3d3a44', amp: amp * 0.4, seed: 301 + s, bk });
  }
  const P = []; for (let i = 0; i <= 14; i++) { const a = Math.PI + i / 14 * Math.PI; P.push([cx + Math.cos(a) * w, by + Math.sin(a) * hh]); }
  P.push([cx + w * 1.02 + 0.14 * D * Math.max(0, f), by + 0.04 * D], [cx - w * 1.02 - 0.14 * D * Math.max(0, -f), by + 0.04 * D]);
  mmInk(g, P, { fill: DH_CAR_COL.spare || MM.muRed, lw, amp: amp * 0.5, seed: 303, bk, poly: false });
  for (const u of [-0.4, 0, 0.4]) { const x = cx + u * w * 0.8 + f * 0.05 * D; mmInk(g, [[x, by - hh * 0.72], [x, by - hh * 0.3]], { closed: false, lw: lw * 0.9, ink: '#3d3a44' }); }
  g.restore();
}

// ─────────────────────────────────────────────────────────────────────────────────────
//  TV GURL
// ─────────────────────────────────────────────────────────────────────────────────────
// a flat pink pad for a foot (cast.png): a low mound, flat on the ground. bottom = where it touches.
function mm20Pad(g, x, bottom, H, lw, seed) {
  const w = 0.036 * H, hh = 0.033 * H;
  mmInk(g, [[x - w, bottom], [x - w * 0.9, bottom - hh * 0.55], [x - w * 0.5, bottom - hh * 0.93], [x, bottom - hh], [x + w * 0.5, bottom - hh * 0.93],
            [x + w * 0.9, bottom - hh * 0.55], [x + w, bottom], [x + w * 0.35, bottom + 0.002 * H], [x - w * 0.35, bottom + 0.002 * H]],
        { fill: MM.tvPink, lw: lw * 0.8, poly: false, seed });
}
// her plug (cast.png): a pink body, round on the cord's side, two khaki prongs with a black line round them.
// at = where the cord arrives; (ux, uy) = the way the plug points.
function mm20Plug(g, at, ux, uy, H, lw, amp, bk) {
  const nx = -uy, ny = ux, L = 0.045 * H, W = 0.026 * H;
  const P = [];
  for (let i = 0; i <= 6; i++) { const a = Math.PI / 2 + Math.PI * i / 6; P.push([at[0] + ux * (W + Math.cos(a) * W) + nx * Math.sin(a) * W, at[1] + uy * (W + Math.cos(a) * W) + ny * Math.sin(a) * W]); }
  P.push([at[0] + ux * L - nx * W, at[1] + uy * L - ny * W], [at[0] + ux * L + nx * W, at[1] + uy * L + ny * W]);
  for (const s of [-0.45, 0.45]) {
    const b = [at[0] + ux * L + nx * s * W, at[1] + uy * L + ny * s * W];
    mmTube(g, [b, [b[0] + ux * 0.034 * H, b[1] + uy * 0.034 * H]], 0.008 * H, MM.tvBezel, lw * 0.55);
  }
  mmInk(g, P, { fill: MM.tvPink, lw: lw * 0.9, amp: amp * 0.3, seed: 202, bk, poly: false });
}
// her buttons: three stripe-pink squares and a round one (cast.png). slot(i) → [x0, y0, x1, y1]
function mm20Buttons(g, slot, lw, H, C, t, map) {
  const M = map || (P => P);
  for (let i = 0; i < 4; i++) {
    const [a0, b0, a1, b1] = slot(i), on = C.buttons ? C.buttons(i, t) : 0;
    const col = on ? MM.tvScreen : MM.tvPink;
    if (i < 3) mmInk(g, M(mmRectPts(a0, b0, a1, b1, 0.01 * H, 1)), { fill: col, lw: lw * 0.7, poly: false });
    else { const cx = (a0 + a1) / 2, cy = (b0 + b1) / 2, r = Math.min((a1 - a0) / 2, (b1 - b0) * 0.62);
      mmInk(g, M(mmCirclePts(cx, cy, r, r * 0.9, 14, 0, 0)), { fill: col, lw: lw * 0.7, poly: false }); }
  }
}

function tvDraw(g, C) {
  const H = C.h, t = C.t || 0, bk = mmBoil(t) + 3 + (C.seed | 0) * 29, f = C.flip || 1;
  const lw = Math.max(1.5, H * 0.017) * (C.lw || 1), amp = Math.max(0.3, H * 0.005);
  const bw = 0.86 * H, bh = 0.56 * H, legL = 0.21 * H, side = 0.045 * H;
  g.save(); g.translate(C.x, C.y); g.rotate(C.lean || 0); g.scale(f * (C.sx || 1), C.sy || 1);
  const walk = C.walk; let bob = -(C.hop || 0) * H;
  const lift = [0, 0, 0, 0];
  if (walk && walk.amt) { const ph = walk.ph * Math.PI * 2; bob += -Math.abs(Math.sin(ph * 2)) * 0.03 * H * walk.amt;
    lift[0] = lift[3] = Math.max(0, Math.sin(ph)) * 0.07 * H * walk.amt; lift[1] = lift[2] = Math.max(0, -Math.sin(ph)) * 0.07 * H * walk.amt; }
  const x0 = -bw / 2, y1 = -legL + bob, y0 = y1 - bh;
  // 22 · 2020: his box is seen from low on her right, so her side AND her underside show (cast.png: the back of the
  //      box sits about 0.06 of its width right of the front and 0.05 below it)
  const U20 = MM_2020.tvUnderside, dX = 0.065 * bw, dY = 0.05 * bw;
  const khaki = MM_2020.tvSideKhaki ? MM.tvBezel : mmShade(MM.tvBezel, -0.1);     // 23
  // the cord: out of her back-right, down to the ground, a plug on the end (a tail that swishes)
  const sw = Math.sin(t * 2.6 + (C.seed | 0)) * 0.08 * H + (walk && walk.amt ? Math.sin(walk.ph * Math.PI * 4) * 0.05 * H : 0);
  const c0 = [bw / 2 + side * 0.5, y1 - 0.08 * H], c1 = [bw / 2 + 0.2 * H + sw, -0.02 * H], c2 = [bw / 2 + 0.33 * H + sw * 1.4, -0.015 * H];
  if (MM_2020.tvCordTube) {          // 21 · a khaki tube with a black line round it, out from under her (cast.png)
    const s0 = U20 ? [x0 + 0.88 * bw + dX * 0.5, y1 + dY * 0.5] : c0;
    mmTube(g, [s0, [bw / 2 + 0.1 * H + sw * 0.3, y1 + 0.07 * H], c1, c2], 0.019 * H, MM.tvLeg, lw * 0.75, { amp: amp * 0.6, seed: 201, bk });
  } else mmInk(g, [c0, [bw / 2 + 0.12 * H, y1 + 0.02 * H], c1, c2], { closed: false, lw: lw * 1.3, amp: amp * 0.6, seed: 201, bk });
  if (MM_2020.tvPlugPink) mm20Plug(g, c2, 1, 0, H, lw, amp, bk);           // 20 · a pink plug, khaki prongs
  else {
    mmInk(g, [[c2[0], c2[1] - 0.025 * H], [c2[0] + 0.05 * H, c2[1] - 0.025 * H], [c2[0] + 0.05 * H, c2[1] + 0.02 * H], [c2[0], c2[1] + 0.02 * H]], { fill: MM.tvBezel, lw: lw * 0.9 });
    for (const dy of [-0.012, 0.01]) mmInk(g, [[c2[0] + 0.05 * H, c2[1] + dy * H], [c2[0] + 0.085 * H, c2[1] + dy * H]], { closed: false, lw: lw * 0.8 });
  }
  // legs: two at the back (a little in), two at the front corners
  const legs = [[x0 + 0.2 * bw, 0.55], [x0 + 0.62 * bw, 0.55], [x0 + 0.1 * bw, 1], [x0 + 0.84 * bw, 1]];
  legs.forEach(([lx, depth], i) => {
    const top = [lx, y1 - 0.02 * H], ft = [lx + (depth < 1 ? 0.02 * H : 0), -lift[i] - (depth < 1 ? 0.025 * H : 0)];
    mmTube(g, [top, ft], 0.019 * H, MM.tvLeg, lw * 0.75, { amp: amp * 0.5, seed: 211 + i, bk });
    if (MM_2020.tvEyesFeet) mm20Pad(g, ft[0], ft[1] + 0.018 * H, H, lw, 215 + i);   // 24 · flat pink pads
    else mmInk(g, mmCirclePts(ft[0], ft[1] - 0.012 * H, 0.034 * H, 0.03 * H, 10, 0, 0, 215 + i), { fill: MM.tvPink, lw: lw * 0.8 });
  });
  // antennae
  for (const [ax, a] of [[x0 + 0.33 * bw, -1.85], [x0 + 0.62 * bw, -1.3]]) {
    const wob = Math.sin(t * 3 + ax) * 0.05;
    const tip = [ax + Math.cos(a + wob) * 0.26 * H, y0 + Math.sin(a + wob) * 0.26 * H];
    mmTube(g, [[ax, y0 + 0.01 * H], tip], 0.022 * H, MM.tvLeg, lw * 0.8, { amp: amp * 0.4, seed: 221, bk });
    mmInk(g, mmCirclePts(tip[0], tip[1], 0.042 * H, 0.042 * H, 10, 0, 0, 222), { fill: MM.tvPink, lw: lw * 0.9 });
  }
  // the side of the box (she's drawn a little three-quarter, like his drawing)
  if (U20) {         // his underside and his side: two khaki faces behind the front, sharing the corner's diagonal
    const xr = x0 + bw;
    mmInk(g, [[x0 + 0.04 * H, y1 - 0.01 * H], [xr, y1 - 0.01 * H], [xr + dX, y1 + dY], [x0 + 0.04 * H + dX, y1 + dY]], { fill: khaki, lw, amp: amp * 0.6, seed: 236, bk, poly: true });
    mmInk(g, [[xr - 0.02 * H, y0 + 0.01 * H], [xr + dX, y0 + dY], [xr + dX, y1 + dY], [xr - 0.02 * H, y1 - 0.01 * H]], { fill: khaki, lw, amp: amp * 0.6, seed: 231, bk, poly: true });
  } else { const sd = [[x0 + bw - 0.02 * H, y0 + 0.004 * H], [x0 + bw + side * 0.5, y0 - 0.012 * H], [x0 + bw + side, y0 - 0.028 * H], [x0 + bw + side, y0 + bh * 0.3], [x0 + bw + side, y1 - bh * 0.3], [x0 + bw + side, y1 - 0.05 * H], [x0 + bw + side * 0.5, y1 - 0.026 * H], [x0 + bw - 0.02 * H, y1 - 0.004 * H]];
    mmInk(g, sd, { fill: khaki, lw, amp: amp * 0.6, seed: 231, bk, poly: true }); }
  // the box: wavy pink and blue stripes (17 · 2020: pink at the top and the bottom, the lines solid black)
  const S20 = MM_2020.tvStripeOrder;
  const box = mmRectPts(x0, y0, x0 + bw, y1, 0.05 * H, 3);
  const boxW = mmWob(box, 232, amp, bk);
  g.save(); g.beginPath(); mmTrace(g, boxW, true); g.fillStyle = MM.tvPink; g.fill(); g.clip();
  const nS = 7;
  for (let k = S20 ? 1 : 0; k < nS; k += 2) {
    const yA = y0 + (k / nS) * bh, yB = y0 + ((k + 1) / nS) * bh;
    g.beginPath(); g.moveTo(x0 - 5, yA);
    for (let i = 0; i <= 16; i++) { const xx = x0 + (i / 16) * bw; g.lineTo(xx, yA + Math.sin(i * 0.75 + k * 1.3) * 0.045 * H); }
    for (let i = 16; i >= 0; i--) { const xx = x0 + (i / 16) * bw; g.lineTo(xx, yB + Math.sin(i * 0.7 + k * 1.7 + 1) * 0.045 * H); }
    g.closePath(); g.fillStyle = MM.tvBlue; g.fill(); g.lineWidth = lw * (S20 ? 0.7 : 0.45); g.strokeStyle = S20 ? MM.ink : mmRGBA(MM.ink, 0.55); g.stroke();
  }
  g.restore();
  mmInk(g, boxW, { lw, amp: 0 });
  // the bezel and the screen
  const sx0 = x0 + 0.07 * bw, sy0 = y0 + 0.1 * bh, sx1 = x0 + 0.72 * bw, sy1 = y1 - 0.1 * bh;
  mmInk(g, mmRectPts(sx0, sy0, sx1, sy1, 0.05 * H, 3), { fill: MM.tvBezel, lw, amp, seed: 233, bk });
  const scr = [sx0 + 0.045 * bw, sy0 + 0.07 * bh, sx1 - 0.045 * bw, sy1 - 0.07 * bh];
  const scrP = mmRectPts(scr[0], scr[1], scr[2], scr[3], 0.035 * H, 3);
  g.save(); g.beginPath(); mmTrace(g, scrP, true); g.fillStyle = MM.tvScreen; g.fill(); g.clip();
  // the screen draws in stage space; flip it back so her words never read backwards
  g.save(); if (f < 0) { g.translate((scr[0] + scr[2]), 0); g.scale(-1, 1); }
  tvScreen(g, C, scr[0], scr[1], scr[2] - scr[0], scr[3] - scr[1], t, bk, lw);
  g.restore(); g.restore();
  mmInk(g, scrP, { lw: lw * 0.9, amp: amp * 0.5, seed: 234, bk });
  // the button panel
  const px0 = x0 + 0.77 * bw, px1 = x0 + 0.93 * bw, py0 = y0 + 0.2 * bh, py1 = y1 - 0.2 * bh;
  mmInk(g, mmRectPts(px0, py0, px1, py1, 0.015 * H, 2), { fill: MM.tvBezel, lw: lw * 0.9, amp: amp * 0.5, seed: 235, bk });
  const slot = (i) => { const by = py0 + (py1 - py0) * (0.1 + i * 0.22), bh2 = (py1 - py0) * 0.14; return [px0 + 0.025 * bw, by, px1 - 0.025 * bw, by + bh2]; };
  if (MM_2020.tvButtons) mm20Buttons(g, slot, lw, H, C, t);                  // 19 · three squares and a round one
  else for (let i = 0; i < 4; i++) {
    const [a0, b0, a1, b1] = slot(i), on = C.buttons ? C.buttons(i, t) : 0;
    mmInk(g, mmRectPts(a0, b0, a1, b1, 0.01 * H, 1), { fill: on ? MM.tvPink : MM.tvScreen, lw: lw * 0.7 });
  }
  g.restore();
  return { scr: [C.x + f * (scr[0]), C.y + scr[1], C.x + f * scr[2], C.y + scr[3]], top: C.y + y0 };
}

function tvFace(g, x, y, w, h, S, t, bk, lw, over) {
  const cx = x + w / 2, cy = y + h / 2, u = Math.min(w, h);
  const expr = S.expr || 'smile';
  const L20 = MM_2020.tvEyesFeet;      // 24 · filled black ovals (cast.png: 0.07 × 0.19 of the screen's height)
  const F20 = MM_2020.tvFace2020;      // + his layout (cast.png): eyes 0.21 h above the middle, 0.215 w out; the nose 0.075 × 0.15 u
                                       //   on the middle; the smile 0.1 u wide, 0.31-0.36 h down
  let blink = 0; { const bi = Math.floor(t / 3.1); const bt = bi * 3.1 + mmH2(bi, 77) * 2; blink = (t >= bt && t < bt + 0.1) ? 1 : 0; }
  g.save(); g.strokeStyle = MM.tvDark; g.lineCap = 'round'; g.lineWidth = Math.max(1.4, u * 0.045);
  const look = S.look || [0, 0];
  for (const ex of F20 ? [-0.215, 0.215] : [-0.23, 0.23]) {
    const X = cx + ex * w + look[0] * u * 0.05, Y = cy - (F20 ? 0.207 : 0.12) * h + look[1] * u * 0.04;
    g.beginPath();
    if (blink || expr === 'happy') { g.moveTo(X - u * 0.05, Y + u * 0.02); g.quadraticCurveTo(X, Y - u * 0.05, X + u * 0.05, Y + u * 0.02); g.stroke(); }
    else if (L20) { g.ellipse(X, Y - 0.01 * u, u * (expr === 'wide' ? 0.05 : 0.036), u * (expr === 'wide' ? 0.075 : 0.092), 0, 0, Math.PI * 2); g.fillStyle = MM.tvDark; g.fill(); }
    else if (expr === 'wide') { g.arc(X, Y, u * 0.045, 0, Math.PI * 2); g.stroke(); }
    else { g.moveTo(X, Y - u * 0.07); g.lineTo(X, Y + u * 0.05); g.stroke(); }
  }
  // the square nose (18 · 2020: filled with her stripe pink)
  const nw = F20 ? 0.075 : 0.07, nh = F20 ? 0.15 : 0.11, ny = F20 ? cy + 0.012 * h - u * nh / 2 : cy + 0.0 * h;
  if (MM_2020.tvNoseFilled) { g.fillStyle = MM.tvPink; g.fillRect(cx - u * nw / 2, ny, u * nw, u * nh); }
  g.strokeRect(cx - u * nw / 2, ny, u * nw, u * nh);
  // the mouth
  const talk = S.talk || 0;
  g.beginPath();
  if (talk > 0.08) { g.ellipse(cx, cy + 0.27 * h, u * 0.1, u * 0.02 + talk * u * 0.07, 0, 0, Math.PI * 2); g.fillStyle = MM.tvDark; g.fill(); }
  else if (expr === 'o' || expr === 'wide') { g.arc(cx, cy + 0.27 * h, u * 0.04, 0, Math.PI * 2); g.stroke(); }
  else if (F20) { g.moveTo(cx - u * 0.1, cy + 0.31 * h); g.quadraticCurveTo(cx, cy + 0.41 * h, cx + u * 0.1, cy + 0.31 * h); g.stroke(); }
  else { g.moveTo(cx - u * 0.12, cy + 0.24 * h); g.quadraticCurveTo(cx, cy + 0.34 * h, cx + u * 0.12, cy + 0.24 * h); g.stroke(); }
  g.restore();
}

// TV GURL FROM ANY SIDE (the film's dhTvTurn, dh_car.js — ⚠ its side and back are the film's invention: Mook has only
// drawn her from the front). 2020: the same details as his front view, carried round: stripes pink top and bottom,
// khaki sides, the underside khaki (it shows only when the camera is below her: elev < 0), the buttons, the cord as a
// khaki tube with a pink plug, flat pink pads.
function dhTvTurn(g, C) {
  const yaw = C.yaw || 0;
  if (Math.cos(yaw) > Math.cos(C.frontMax === undefined ? 0.9 : C.frontMax)) {
    const r = tvDraw(g, Object.assign({}, C, { flip: Math.sin(yaw) > 0.02 ? -1 : 1 }));
    return Object.assign(r || {}, { approved: true });
  }
  const H = C.h, t = C.t || 0, bk = mmBoil(t) + 3 + (C.seed | 0) * 29;
  const lw = Math.max(1.5, H * 0.017) * (C.lw || 1), amp = Math.max(0.3, H * 0.005);
  const bw = 0.86 * H, bh = 0.56 * H, legL = 0.21 * H, bd = (C.depth || 0.42) * H, wind = C.wind || 0;
  const T = dhAf(dhViewM(yaw, C.elev || 0, 1));
  const bob = (C.hop || 0) * H;
  const P = (x, y, z) => dhPj(T, [x, y + bob, z]);
  const S20 = MM_2020.tvStripeOrder;
  g.save(); g.translate(C.x, C.y); g.rotate(C.lean || 0); g.scale(C.sx || 1, C.sy || 1);
  const y0 = legL, y1 = legL + bh;                       // body bottom, top (Y up)
  // legs (all behind the body, as tvDraw does): four at the corners, pink ball feet (2020: flat pink pads)
  const legs = [[0.37, 0.3], [-0.37, 0.3], [0.37, -0.3], [-0.37, -0.3]].map(([lx, lz], i) => ({ i, X: lx * bw, Z: lz * bd, d: dhAfp(T, [lx * bw, 0, lz * bd])[2] })).sort((a, b) => a.d - b.d);
  for (const L of legs) {
    const top = P(L.X, y0 + 0.02 * H, L.Z), ft = P(L.X, 0.012 * H, L.Z);
    mmTube(g, [top, ft], 0.019 * H, MM.tvLeg, lw * 0.75, { amp: amp * 0.5, seed: 211 + L.i, bk });
    if (MM_2020.tvEyesFeet) mm20Pad(g, ft[0], ft[1] + 0.026 * H, H, lw, 215 + L.i);
    else mmInk(g, mmCirclePts(ft[0], ft[1] - 0.004 * H, 0.034 * H, 0.03 * H, 10, 0, 0, 215 + L.i), { fill: MM.tvPink, lw: lw * 0.8 });
  }
  // the cord: out of the back, low, on her left; it droops to the ground, or streams back in the wind
  const cordPts = () => {
    const ex = -0.3 * bw, ey = y0 + 0.08 * H, ez = -bd / 2, Pn = [];
    for (let i = 0; i <= 6; i++) {
      const s = i / 6, sw = Math.sin(t * 2.6 + (C.seed | 0) + s * 2) * 0.05 * H * s;
      const rest = [ex + sw * 0.6, Math.max(0.012 * H, ey - Math.sin(s * Math.PI / 2) * (ey - 0.012 * H) * 1.1), ez - s * 0.36 * H];
      const fly = [ex + Math.sin(t * 11 - s * 5) * 0.06 * H * s, ey + 0.05 * H * s - 0.03 * H * s * s + Math.sin(t * 13 - s * 6) * 0.03 * H * s, ez - s * 0.5 * H];
      Pn.push(P(mmLerp(rest[0], fly[0], wind), mmLerp(rest[1], fly[1], wind), mmLerp(rest[2], fly[2], wind)));
    }
    return Pn;
  };
  const drawCord = () => {
    const Pn = cordPts();
    if (MM_2020.tvCordTube) mmTube(g, Pn, 0.019 * H, MM.tvLeg, lw * 0.75, { amp: amp * 0.6, seed: 201, bk });
    else mmInk(g, Pn, { closed: false, lw: lw * 1.3, amp: amp * 0.6, seed: 201, bk });
    const e = Pn[6], d = Pn[5], a = Math.atan2(e[1] - d[1], e[0] - d[0]), ca = Math.cos(a), sa = Math.sin(a), s = 0.05 * H;
    if (MM_2020.tvPlugPink) { mm20Plug(g, e, ca, sa, H, lw, amp, bk); return; }
    const Q = [[0, -0.5], [1, -0.5], [1, 0.45], [0, 0.45]].map(([u, v]) => [e[0] + (ca * u - sa * v) * s, e[1] + (sa * u + ca * v) * s]);
    mmInk(g, Q, { fill: MM.tvBezel, lw: lw * 0.9, poly: true });
    for (const v of [-0.25, 0.2]) { const p0 = [e[0] + (ca * 1 - sa * v) * s, e[1] + (sa * 1 + ca * v) * s], p1 = [e[0] + (ca * 1.7 - sa * v) * s, e[1] + (sa * 1.7 + ca * v) * s]; mmInk(g, [p0, p1], { closed: false, lw: lw * 0.8 }); }
  };
  const backVis = dhAfv(T, [0, 0, -1])[2] > 0.02;
  if (!backVis) drawCord();
  // the body's faces (a convex box: draw what faces us)
  const Tb = dhAfx(T, dhAf(DH_I3, [0, bob, 0]));
  const face = (O, eu, ev, Lu, Lv) => dhFaceOf(Tb, O, eu, ev, Lu, Lv);
  const Ffront = face([bw / 2, y0, bd / 2], [-1, 0, 0], [0, 1, 0], bw, bh), Fback = face([-bw / 2, y0, -bd / 2], [1, 0, 0], [0, 1, 0], bw, bh);
  const Fright = face([bw / 2, y0, -bd / 2], [0, 0, 1], [0, 1, 0], bd, bh), Fleft = face([-bw / 2, y0, bd / 2], [0, 0, -1], [0, 1, 0], bd, bh);
  const Ftop = face([-bw / 2, y1, -bd / 2], [1, 0, 0], [0, 0, 1], bw, bd);
  const khaki = MM_2020.tvSideKhaki ? MM.tvBezel : mmShade(MM.tvBezel, -0.1);
  const stripes = (F, ph) => {                            // tvDraw's wavy stripes, on a face (u across, v up)
    const box = F.map(mmRectPts(0, 0, bw, bh, 0.05 * H, 3));
    const boxW = mmWob(box, 232 + ph, amp, bk);
    g.save(); g.beginPath(); mmTrace(g, boxW, true); g.fillStyle = MM.tvPink; g.fill(); g.clip();
    for (let k = S20 ? 1 : 0; k < 7; k += 2) {
      const vA = bh - (k / 7) * bh, vB = bh - ((k + 1) / 7) * bh, S = [];
      for (let i = 0; i <= 16; i++) S.push(F.at((i / 16) * bw, vA - Math.sin(i * 0.75 + k * 1.3 + ph) * 0.045 * H));
      for (let i = 16; i >= 0; i--) S.push(F.at((i / 16) * bw, vB - Math.sin(i * 0.7 + k * 1.7 + 1 + ph) * 0.045 * H));
      g.beginPath(); g.moveTo(S[0][0] - 0, S[0][1]); for (const p of S) g.lineTo(p[0], p[1]); g.closePath();
      g.fillStyle = MM.tvBlue; g.fill(); g.lineWidth = lw * (S20 ? 0.7 : 0.45); g.strokeStyle = S20 ? MM.ink : mmRGBA(MM.ink, 0.55); g.stroke();
    }
    g.restore(); mmInk(g, boxW, { lw, amp: 0 });
  };
  const sideStripes = C.sides !== 'khaki' && !MM_2020.tvSideKhaki;          // 23 · 2020: her sides are khaki on every turn
  const sideFace = (F, flip) => {
    if (sideStripes) { const W0 = F.Lu; const box = F.map(mmRectPts(0, 0, W0, bh, 0.04 * H, 3)); g.save(); g.beginPath(); mmTrace(g, box, true); g.fillStyle = MM.tvPink; g.fill(); g.clip();
      for (let k = S20 ? 1 : 0; k < 7; k += 2) { const vA = bh - (k / 7) * bh, vB = bh - ((k + 1) / 7) * bh, S = [];
        for (let i = 0; i <= 8; i++) S.push(F.at((i / 8) * W0, vA - Math.sin(i * 0.9 + k * 1.3 + flip) * 0.045 * H));
        for (let i = 8; i >= 0; i--) S.push(F.at((i / 8) * W0, vB - Math.sin(i * 0.8 + k * 1.7 + 1 + flip) * 0.045 * H));
        g.beginPath(); g.moveTo(S[0][0], S[0][1]); for (const p of S) g.lineTo(p[0], p[1]); g.closePath(); g.fillStyle = MM.tvBlue; g.fill(); g.lineWidth = lw * (S20 ? 0.7 : 0.45); g.strokeStyle = S20 ? MM.ink : mmRGBA(MM.ink, 0.55); g.stroke(); }
      g.restore(); mmInk(g, box, { lw, amp: 0 }); return; }
    mmInk(g, F.poly(), { fill: khaki, lw, amp: amp * 0.6, seed: 231 + flip, bk, poly: true });
    if (!MM_2020.tvSideKhaki) { const u = flip ? 0.035 * H : F.Lu - 0.035 * H; mmInk(g, F.map([[u, 0.03 * H], [u, bh - 0.03 * H]]), { closed: false, lw: lw * 0.6, ink: mmRGBA(MM.ink, 0.5) }); }
  };
  if (MM_2020.tvUnderside) {         // 22 · her underside is khaki (it shows from below)
    const Fbot = face([-bw / 2, y0, bd / 2], [1, 0, 0], [0, 0, -1], bw, bd);
    if (Fbot.vis) mmInk(g, Fbot.poly(), { fill: khaki, lw, amp: amp * 0.6, seed: 236, bk, poly: true });
  }
  if (Fright.vis) sideFace(Fright, 0);
  if (Fleft.vis) sideFace(Fleft, 1);
  if (Ftop.vis) mmInk(g, Ftop.poly(), { fill: MM.tvBezel, lw, amp: amp * 0.6, seed: 237, bk, poly: true });
  if (Fback.vis) {
    stripes(Fback, 2.1);
    const ex = P(-0.3 * bw, y0 + 0.08 * H, -bd / 2); mmDot(g, ex[0], ex[1], 0.02 * H, MM.tvDark);
  }
  let scrRect = null;
  if (Ffront.vis) {
    stripes(Ffront, 0);
    const fk = Math.abs(Math.cos(yaw));
    // the bezel and the screen, as tvDraw places them (u from her screen-left edge, v up)
    const bz = Ffront.map(mmRectPts(0.07 * bw, 0.1 * bh, 0.72 * bw, 0.9 * bh, 0.05 * H, 3));
    mmInk(g, bz, { fill: MM.tvBezel, lw, amp, seed: 233, bk, poly: false });
    const su0 = 0.07 * bw + 0.045 * bw, su1 = 0.72 * bw - 0.045 * bw, sv0 = 0.1 * bh + 0.07 * bh, sv1 = 0.9 * bh - 0.07 * bh;
    const scrP = Ffront.map(mmRectPts(su0, sv0, su1, sv1, 0.035 * H, 3));
    g.save(); g.beginPath(); mmTrace(g, scrP, true); g.fillStyle = MM.tvScreen; g.fill(); g.clip();
    if (fk > 0.3) {                                       // her screen, through the face's own affine map (so the face turns with her)
      const du = Ffront.du, dv = Ffront.dv, o = Ffront.o, xs = -bw / 2 + su0, ys = -(legL + sv1), w = su1 - su0, h2 = sv1 - sv0;
      g.transform(du[0], du[1], -dv[0], -dv[1], o[0] - du[0] * (-bw / 2) + dv[0] * (-legL - bob * 0), o[1] - du[1] * (-bw / 2) + dv[1] * (-legL));
      tvScreen(g, C, xs, ys, w, h2, t, bk, lw);
      scrRect = [xs, ys, w, h2];
    }
    g.restore();
    mmInk(g, scrP, { lw: lw * 0.9, amp: amp * 0.5, seed: 234, bk, poly: false });
    const pu0 = 0.77 * bw, pu1 = 0.93 * bw, pv0 = 0.2 * bh, pv1 = 0.8 * bh;
    mmInk(g, Ffront.map(mmRectPts(pu0, pv0, pu1, pv1, 0.015 * H, 2)), { fill: MM.tvBezel, lw: lw * 0.9, amp: amp * 0.5, seed: 235, bk, poly: false });
    const slot = (i) => { const bv1 = pv1 - (pv1 - pv0) * (0.1 + i * 0.22), bv0 = bv1 - (pv1 - pv0) * 0.14; return [pu0 + 0.025 * bw, bv0, pu1 - 0.025 * bw, bv1]; };
    if (MM_2020.tvButtons) mm20Buttons(g, slot, lw, H, C, t, (Pts) => Ffront.map(Pts));
    else for (let i = 0; i < 4; i++) { const [a0, b0, a1, b1] = slot(i); mmInk(g, Ffront.map(mmRectPts(a0, b0, a1, b1, 0.01 * H, 1)), { fill: MM.tvScreen, lw: lw * 0.7, poly: false }); }
  }
  // antennae: from the middle of the top, splayed as in his drawing; they lean back in the wind
  for (const [ux, a] of [[0.17, -1.85], [-0.12, -1.3]]) {
    const wob = Math.sin(t * 3 + ux * 10) * 0.05 + wind * Math.sin(t * 17 + ux * 20) * 0.08;
    const dx = -Math.cos(a + wob), dy = -Math.sin(a + wob), L = 0.26 * H;      // her +X is screen-left when she faces us
    const base = [ux * bw, y1 - 0.004 * H, 0], tip = [base[0] + dx * L, base[1] + dy * L * (1 - 0.12 * wind), base[2] - wind * 0.12 * H];
    const b2 = P(base[0], base[1], base[2]), t2 = P(tip[0], tip[1], tip[2]);
    mmTube(g, [b2, t2], 0.022 * H, MM.tvLeg, lw * 0.8, { amp: amp * 0.4, seed: 221, bk });
    mmInk(g, mmCirclePts(t2[0], t2[1], 0.042 * H, 0.042 * H, 10, 0, 0, 222), { fill: MM.tvPink, lw: lw * 0.9 });
  }
  if (backVis) drawCord();
  g.restore();
  return { approved: false, top: C.y + P(0, y1, 0)[1] };
}

// ── mm_motion.js
// ═══════════════════════════════════════════════════════════════════════════════════════
// MM MOTION · how the cast MOVES. Episode 3 (THE GROOVE MACHINE), the motion study.
//   A kit of pure functions of time and distance that DRIVE the rigs through the inputs they
//   already have (x, y, yaw, lean, bob, walk {ph, amt, stride}, pose, squash, arms, ant, ph,
//   hopH, headTurn, hairYaw, eyes …). It never edits a rig and never redraws a character:
//   every pixel is still mookDraw / mushDraw / finleyDraw / puffDraw.
//   Learned from HIS animation first (sheets/motion/STUDY.md): his 2021 animatic SEANTEST.mp4
//   and his 2020 run test moookrun.mp4. Choices his drawings do not show are marked 🎬.
//   Load after the rigs: mm_core.js, mm_palette2020.js, mm_cast.js … mm_cast2020.js,
//   mm_finley.js, mm_puff.js, mm_motion.js. Every name starts mmo / MMO (never a p5 word,
//   never `walk`, `t`, `cam` or `frame`: a code clip owns those). No random(): mmHash/mmH2/mmSN1.
//   NOTES: sheets/motion/NOTES.md (what each function does, its inputs, 🎬 vs his, rig requests).
// ═══════════════════════════════════════════════════════════════════════════════════════

// ── 0 · CLOCKS ───────────────────────────────────────────────────────────────────────────
// His animatic is drawn on 2s to 5s at 24 fps (acting: a drawing every 3 frames on average; a
// smear for 1; a pose that must read for 6-8). His 2020 run test holds every drawing 1/10 s.
// mmoOn(t, n): the time on n's at 24 fps (n = 2 → 12 drawings a second, n = 3 → 8).
function mmoOn(t, n, fps) { const k = (fps || 24) / (n || 2); return Math.floor(t * k + 1e-6) / k; }
// a drawing rate in drawings per second (his run test: 10)
function mmoRate(t, dps) { return Math.floor(t * dps + 1e-6) / dps; }

// ── 1 · CURVES: pose to pose, slow in and slow out ──────────────────────────────────────
// mmEase / mmKey / mmBack / mmIO / mmSmooth (mm_core.js) are the film's; these add the
// three beats every move in his animatic has: a little the other way, the move, past it and back.
function mmoBump(u, c, w) { const x = (u - c) / w; return Math.exp(-x * x); }
// anticipation → action → overshoot → settle, k 0..1 → value 0..1 (a: how far back first,
// o: how far past, pa: where the action starts, pb: where it arrives)
function mmoAAO(k, o) {
  o = o || {};
  const a = o.a === undefined ? 0.12 : o.a, ov = o.o === undefined ? 0.1 : o.o;
  const pa = o.pa === undefined ? 0.3 : o.pa, pb = o.pb === undefined ? 0.62 : o.pb;
  k = mmC01(k);
  if (k < pa) return -a * mmIO(k / pa);                                   // the wind-up, eased in and out
  if (k < pb) return mmLerp(-a, 1 + ov, mmIn((k - pa) / (pb - pa)) * 0.35 + mmIO((k - pa) / (pb - pa)) * 0.65);
  const s = (k - pb) / (1 - pb);                                           // past it, and back, with one small wobble
  return 1 + ov * Math.cos(s * Math.PI * 1.5) * Math.exp(-s * 2.2) * (1 - s);
}
// anticipation alone: 0 → −a → 1 (no overshoot)
function mmoAntic(k, a, pa) { return mmoAAO(k, { a: a === undefined ? 0.15 : a, o: 0, pa: pa === undefined ? 0.35 : pa, pb: 1 }); }
// overshoot alone: 0 → 1 + o → 1
function mmoOver(k, o, pb) { return mmoAAO(k, { a: 0, o: o === undefined ? 0.12 : o, pa: 0, pb: pb === undefined ? 0.5 : pb }); }
// follow-through after an event at tau = 0 (a landing, a stop): a decaying wobble.
// The numbers default to DOWNHILL's landing (dh_set_coldopen.js: exp(−9τ)·cos(22τ)).
function mmoSettle(tau, amp, w, damp) {
  if (tau < 0) return 0;
  return (amp === undefined ? 1 : amp) * Math.exp(-tau * (damp === undefined ? 9 : damp)) * Math.cos(tau * (w === undefined ? 22 : w));
}
// SECONDARY MOTION: what a soft thing (an antenna, a drawstring, hair) does when the thing it hangs
// from moves along fn(t). A damped spring, solved as a convolution over the last few tenths of a
// second, so any frame can be rendered alone (GeoV asks for frames in any order). Returns the
// spring's position; the LAG (fn(t) − spring) is the drag to bend the soft thing by.
//   o: { hz (its natural frequency, 2.2), damp (damping ratio, 0.35), n (samples, 36), span (s) }
function mmoSpring(fn, t, o) {
  o = o || {};
  const w = 2 * Math.PI * (o.hz || 2.2), z = o.damp === undefined ? 0.35 : o.damp, wd = w * Math.sqrt(Math.max(1e-4, 1 - z * z));
  const span = o.span || Math.min(2.5, 5 / (z * w)), n = o.n || 36, ds = span / n;
  let acc = 0, wsum = 0;
  for (let i = 0; i < n; i++) {
    const s = (i + 0.5) * ds, hk = Math.exp(-z * w * s) * Math.sin(wd * s);
    acc += hk * fn(t - s); wsum += hk;
  }
  return wsum ? acc / wsum : fn(t);
}
function mmoLag(fn, t, o) { return fn(t) - mmoSpring(fn, t, o); }

// ── 2 · DISTANCE CLOCKS: a path, and the walk paid for by it ────────────────────────────
// mmoPath(t, K): K = [[t, x], [t, x, ease], …] (mmKey's form). → { x, v (px/s), d (distance from the first key) }
function mmoPath(t, K) {
  const x = mmKey(t, K), e = 1 / 120, v = (mmKey(t + e, K) - mmKey(t - e, K)) / (2 * e);
  return { x, v, d: x - K[0][1] };
}

// ═══════════════════════════════════════════════════════════════════════════════════════
//  MOOK
// ═══════════════════════════════════════════════════════════════════════════════════════
// mookDraw's leg measures (mm_cast.js / mm_cast2020.js, in head radii R = h / 8.9): hips 4.2 up and
// ±0.46 out, thigh 2.1, shin 2.05, the hoodie's hem 3.85 up. Standing, the leg cannot quite reach the
// ground (4.2 > 4.15), so his ankle rests 0.054 up: the walk keeps it there, so the soles line up.
// ⚠ If the rig's legs change, change these (sheets/motion/NOTES.md).
const MMO_MK = { hipY: 4.2, hipX: 0.46, L1: 2.1, L2: 2.05, hem: 3.85, ank0: 0.054, liftK: 0.55, bobK: 0.18 };

// ── THE WALK on a distance clock ────────────────────────────────────────────────────────
// The rig's walk {ph, amt, stride}: foot z = cos(2π ph)·stride·R·amt, lifted while sin > 0, so
// (1) a RISING ph swings the lifted foot backwards (a moonwalk: the phase must FALL as he walks
// forward), and (2) z is a cosine of ph, so a planted foot paced linearly would still skate ±0.2 R.
// Here the phase is WARPED so cos(2π ph) runs linearly through every stance: the planted foot moves
// exactly as fast as the body, the other way. Then the hips are put where the planted leg can reach
// the ground (an inverted pendulum: lowest at the contact, highest at the passing) with a cartoon
// DOWN just after each contact (Williams), and the rig's own bob is cancelled.
//   d: distance walked (px, ≥ 0 forward; from mmoPath) · o: { h, dir (+1 right, −1 left), yaw (his
//   facing; default dir·1.3, a 3/4 profile that keeps his face), step (one foot to the other, in R:
//   2.0), lift (foot lift and the rig's own bob, ×0.55 R: 0.75), down (the dip after contact, R: 0.22),
//   bend (a knee kept soft, R: 0.06), lean (forward, rad: 0.05), arms (swing, R: 0.7), lag (the arms
//   trail the legs, cycles: 0.06), nod (the head, rad: 0.05), amt (0..1 blends into a stand) }
// → fields for mookDraw: { walk, bob, lean, pose, headTilt, dy (add to y), u (step progress), f (cycle) }
function mmoMookWalk(d, o) {
  o = o || {};
  const h = o.h || 300, R = h / 8.9, dir = o.dir || 1, M = MMO_MK;
  const yaw = o.yaw === undefined ? dir * 0.9 : o.yaw;
  const S = (o.step === undefined ? 2.6 : o.step) * R, amt = o.lift === undefined ? 0.75 : o.lift;
  const blend = o.amt === undefined ? 1 : mmC01(o.amt);
  // S is the step we SEE (screen x). The rig has no perspective: a 3/4 body walks along screen x by
  // stepping S / |sin yaw| in its own depth, so the planted foot keeps pace on screen.
  const sy_ = Math.max(0.45, Math.abs(Math.sin(yaw))), leanK = Math.cos(o.lean === undefined ? 0.11 : o.lean);   // his lean shortens what we see by cos
  const st = S / (2 * sy_ * leanK), stride = st / (R * amt);
  const c = Math.max(0, d) / (2 * S), f = c - Math.floor(c);
  let a, u, side;
  if (f < 0.5) { u = 2 * f; a = 2 * Math.PI - Math.acos(1 - 2 * u); side = 'R'; }   // his RIGHT foot planted (heel strike at f = 0)
  else { u = 2 * f - 1; a = Math.acos(2 * u - 1); side = 'L'; }                    // his LEFT foot planted
  const ph = a / (2 * Math.PI);
  // the hips: a planted leg that just reaches, minus a soft knee, minus the down after contact
  const zs = st * (1 - 2 * u), Lm = (M.L1 + M.L2) * R * 0.997;
  const reach = Math.sqrt(Math.max(0, Lm * Lm - zs * zs));
  const down = (o.down === undefined ? 0.22 : o.down) * R, bend = (o.bend === undefined ? 0.06 : o.bend) * R;
  const hipH = reach - bend - down * mmoBump(u, 0.16, 0.13) + 0.35 * down * mmoBump(u, 0.62, 0.12);
  const hipUp = Math.min(hipH, reach - 0.01 * R);                                 // never so high the planted foot lifts
  const rigBob = -Math.abs(Math.sin(a)) * M.bobK * R * amt;                         // what the rig adds by itself
  let bob = (M.hipY * R - hipUp) - rigBob;
  // the arms: an eased pendulum (not the rig's, which would follow the warped phase), trailing the legs
  const sw = (o.arms === undefined ? 0.7 : o.arms) * blend, lag = o.lag === undefined ? 0.06 : o.lag;
  const ca = Math.cos(2 * Math.PI * (f - lag));
  const hand = (fw) => [0.22 + 0.06 * Math.abs(fw), 2.28 - 0.32 * Math.max(0, fw) * Math.abs(fw), 0.12 + fw];
  const pR = hand(-sw * ca), pL = hand(sw * ca);                                    // his LEFT arm forward as his RIGHT foot lands
  const pose = { R: [pR[0], pR[1], pR[2], {}], L: [pL[0], pL[1], pL[2], {}] };
  // a forward lean (rotated about his feet by the rig): the planted foot is put back on the ground by dy
  const lean = dir * (o.lean === undefined ? 0.11 : o.lean) * blend;
  const Xs = (side === 'R' ? -1 : 1) * M.hipX * R;
  const xs = Xs * Math.cos(yaw) + zs * Math.sin(yaw), xo = (side === 'R' ? 1 : -1) * M.hipX * R * Math.cos(yaw) - zs * Math.sin(yaw);
  const near = mmSmooth(mmC01(Math.min(u, 1 - u) / 0.14));                           // near a contact: split the error between both feet
  const xref = mmLerp((xs + xo) / 2, xs, near);
  const dy = -xref * Math.sin(lean) - M.ank0 * R;                                   // his soles where standing puts them (the ankle 0.054 R up)
  const nod = (o.nod === undefined ? 0.05 : o.nod) * blend;
  const headTilt = dir * nod * (0.6 + 0.4 * Math.cos(2 * Math.PI * (2 * f - 0.22)));   // the head nods once a step, a beat after the down
  // blending toward a stand (amt < 1): the feet come together on a planted stance
  return { walk: { ph, amt: amt * blend, stride }, bob: bob * blend, lean, pose, headTilt, dy: dy * blend, u, f, side, yaw };
}


// ── ONE FOOT ANYWHERE (for the skate push): the rig's walk solved backwards ──────────────
// mookDraw moves its two feet as a pair (one is always the other's mirror), so a pose with one foot
// on the deck and the other on the road cannot be ONE call. mmoMookLegs draws him in two passes of
// his own rig (each pass puts one foot where it must be; a clip keeps only that leg) with identical
// hips, torso, arms and head. ⚠ A stopgap until the rig takes per-foot targets (NOTES.md request 1).
// mmoMookFoot(s, z, y, R): walk {ph, amt, stride} that puts his foot s ('R'|'L') at body depth z,
// height y (px, y < 0 lifted above the feet line, y > 0 below it), + the rig's own bob for that walk.
function mmoMookFoot(s, z, y, R) {
  const M = MMO_MK, L = M.liftK * R;
  let amt = y > 0 ? -1 : 1, sn = Math.abs(y) / L;
  if (sn > 0.95) { amt *= sn / 0.95; sn = 0.95; }
  let cs = Math.sqrt(1 - sn * sn) * (z >= 0 ? 1 : -1) * (y > 0 ? -1 : 1);
  if (Math.abs(cs) < 1e-4) cs = 1e-4;
  const stride = z / (cs * R * amt);
  const a = Math.atan2(sn, cs) - (s === 'L' ? Math.PI : 0);
  return { walk: { ph: a / (2 * Math.PI), amt, stride: Math.max(1e-4, stride) }, rigBob: -sn * M.bobK * R * amt };
}
// draw Mook with each foot at its own target. C: mookDraw's call (x, y = the feet line, h, yaw, lean, pose …
// no walk); F: { R: [z, y], L: [z, y] } body depth / height in px (before his lean: mmoMookPrelean);
// hipBob: his body offset (px, + = lower). Pass 1 = his body above the hem + the FRONT leg; pass 2 = the
// BACK leg alone. Each leg is clipped to a fat outline of itself (worked out with the rig's own mmIK).
function mmoMookLegs(g, C, F, hipBob) {
  const R = C.h / 8.9, M = MMO_MK, front = F.R[0] >= F.L[0] ? 'R' : 'L', back = front === 'R' ? 'L' : 'R';
  const yaw = C.yaw === undefined ? -0.12 : C.yaw, fwd = Math.sin(yaw) >= 0 ? 1 : -1;
  const sx = C.sx || 1, sy = C.sy || 1, bob = hipBob || 0, hemY = (-M.hem * R + bob) * sy;
  const legShape = (s) => {                         // circles along hip → knee → ankle, and a box round the shoe
    const X = (s === 'R' ? -1 : 1) * M.hipX * R, hip = [X, -M.hipY * R + bob, 0], Ft = [X, F[s][1], F[s][0]];
    const k = mmIK(hip, Ft, M.L1 * R, M.L2 * R, [0, 0, 1]);
    const P = [hip, k.E, k.H].map(q => [mmProj(q[0], q[2], yaw)[0] * sx, q[1] * sy]);
    const r = 0.3 * R * Math.max(sx, sy);
    for (let i = 0; i < 2; i++) for (let j = 0; j <= 16; j++) {
      const x = mmLerp(P[i][0], P[i + 1][0], j / 16), y = mmLerp(P[i][1], P[i + 1][1], j / 16);
      g.moveTo(x + r, y); g.arc(x, y, r, 0, Math.PI * 2);
    }
    const a = P[2], toe = fwd * Math.abs(Math.sin(yaw)) * 0.95 * R * sx, x0 = Math.min(a[0] - 0.55 * R * sx, a[0] + toe), x1 = Math.max(a[0] + 0.55 * R * sx, a[0] + toe + 0.2 * R * fwd);
    g.rect(Math.min(x0, x1), a[1] - 0.35 * R * sy, Math.abs(x1 - x0), 0.62 * R * sy);
  };
  const pass = (s, clip) => {
    const W = mmoMookFoot(s, F[s][0], F[s][1], R);
    const D = Object.assign({}, C, { x: 0, y: 0, lean: 0, walk: W.walk, bob: bob - W.rigBob });
    g.save(); g.translate(C.x, C.y); g.rotate(C.lean || 0);
    clip(); 
    const r = mookDraw(g, D);
    g.restore();
    return r;
  };
  const BIG = 40 * R;
  // pass 1: his body above the hem, and the front leg
  const out = pass(front, () => { g.beginPath(); g.rect(-BIG, -BIG, 2 * BIG, BIG + hemY + 0.05 * R); legShape(front); g.clip(); });
  // pass 2: the back leg alone, below the hem (its hips, hem and hands are pass 1's to the pixel)
  pass(back, () => { g.beginPath(); g.rect(-BIG, hemY - 0.02 * R, 2 * BIG, BIG); g.clip(); g.beginPath(); legShape(back); g.clip(); });
  return out;
}
// the hip height at which both feet reach (feet in px: [z, y]); bend = a knee kept soft
function mmoMookHip(F, R, bend) {
  const Lm = (MMO_MK.L1 + MMO_MK.L2) * R * 0.997;
  let hmax = 1e9;
  for (const s of ['R', 'L']) { const [z, y] = F[s]; hmax = Math.min(hmax, Math.sqrt(Math.max(0, Lm * Lm - z * z)) - Math.max(0, y)); }
  return hmax - (bend || 0) * R;
}

// feet wanted where we SEE them (after his lean) → where to ask for them before the rig turns him by lean
function mmoMookPrelean(F, lean, yaw, R) {
  const out = {}, c = Math.cos(lean || 0), s = Math.sin(lean || 0), cy = Math.cos(yaw), sy = Math.sin(yaw);
  const sY = Math.abs(sy) < 0.3 ? (sy >= 0 ? 0.3 : -0.3) : sy;
  for (const k of ['R', 'L']) {
    const X = (k === 'R' ? -1 : 1) * MMO_MK.hipX * R, xd = X * cy + F[k][0] * sY, yd = F[k][1];
    const xp = xd * c + yd * s, yp = -xd * s + yd * c;
    out[k] = [(xp - X * cy) / sY, yp];
  }
  return out;
}

// ── IDLE: a breath, a weight shift, a glance (aloof: the lids come down a little now and then) ──
//   → { sy, lean, headTilt, eyes, bob } for mookDraw. seed picks his own rhythm.
function mmoMookIdle(t, o) {
  o = o || {};
  const R = (o.h || 300) / 8.9, sd = o.seed === undefined ? 11 : o.seed;
  const br = Math.sin(t * 2 * Math.PI / 3.6);                                         // one breath every 3.6 s
  const shift = mmSN1(t / 2.8, sd) ;                                                  // his weight drifts
  const gi = Math.floor(t / 2.2), gk = mmSmooth(mmSeg(t - gi * 2.2, 0, 0.18));        // a glance every 2.2 s, eyes first
  const look = [mmLerp(mmSN1(gi - 1, sd + 3) * 0.6, mmSN1(gi, sd + 3) * 0.6, gk), mmLerp(mmSN1(gi - 1, sd + 4) * 0.2, mmSN1(gi, sd + 4) * 0.2, gk)];
  const lid = 0.12 + 0.18 * mmSmooth(mmSeg(mmSN1(t / 3.1, sd + 5), 0.2, 0.7));        // half-lidded, now and then
  return { sy: 1 + 0.008 * br, bob: -0.04 * R * br, lean: 0.012 * shift, headTilt: 0.05 * mmSN1(t / 3.4, sd + 2) + 0.02 * shift,
           eyes: { look, lid } };
}

// ── HEAD LEADS: a turn from yaw y0 to y1 starting at t0. The eyes go first, then the head (with a blink
//    on the way and a little overshoot), then the body (Williams; his 2021 animatic 0:47.4-0:48.5).
//   o: { eyes (s before the head, 0.08), head (its duration, 0.32), body (0.5), lagBody (0.12), over (0.1) }
//   → { yaw (body), headTurn (head − body), look: [x, y], blink (0|1), headTilt }
function mmoTurn(t, t0, y0, y1, o) {
  o = o || {};
  const dE = o.eyes === undefined ? 0.08 : o.eyes, dH = o.head === undefined ? 0.32 : o.head, dB = o.body === undefined ? 0.5 : o.body;
  const lag = o.lagBody === undefined ? 0.12 : o.lagBody, ov = o.over === undefined ? 0.1 : o.over, dy = y1 - y0, sg = dy >= 0 ? 1 : -1;
  const kE = mmSmooth(mmSeg(t, t0, t0 + dE)), kE2 = mmSmooth(mmSeg(t, t0 + dE + dH * 0.7, t0 + dE + dH + 0.25));
  const kH = mmoOver(mmSeg(t, t0 + dE, t0 + dE + dH), ov, 0.6), kB = mmIO(mmSeg(t, t0 + dE + lag, t0 + dE + lag + dB));
  const head = y0 + dy * kH, body = y0 + dy * kB;
  const blink = (t > t0 + dE + dH * 0.25 && t < t0 + dE + dH * 0.25 + 0.1) ? 1 : 0;
  const dip = -0.06 * Math.sin(Math.PI * mmSeg(t, t0 + dE, t0 + dE + dH));             // the head dips on its arc
  return { yaw: body, headTurn: head - body, look: [sg * 0.55 * kE * (1 - kE2), 0], blink, headTilt: dip * sg };
}

// ═══════════════════════════════════════════════════════════════════════════════════════
//  MUSH · a flour sack (his words): really squashy and stretchy, bouncier than anyone, and way cool
// ═══════════════════════════════════════════════════════════════════════════════════════
// His 2021 animatic (0:39.9-0:42.8, on 1s to 8s): a hop with one foot kicked out, a low wide squash, a tall
// stretch, arms flung wide, the antenna whipping behind him and straightening on the hold.
// The 2020 robe has no legs to step with (his feet only lift under the hem), so Mush travels in BOUNCES:
// planted while his feet are down (no skating), moving only in the air. Cool = unhurried: a long hang, a lean
// back, arms loose; 🎬 the skip (one foot tucked higher each bounce, alternating).
// A bounce, u 0..1 from the contact: impact squash → recover → a squash to load → the launch stretch →
// the air (neutral at the top, a stretch on the way down) → contact.
const MMO_MUSH = { g: 0.3, keys: [[0, -0.28], [0.045, 0.62, 'out'], [0.12, 0.08, 'io'], [0.22, 0.34, 'io'], [0.3, -0.42, 'in'], [0.46, -0.12, 'out'], [0.64, 0.02, 'io'], [0.86, -0.18, 'io'], [1.0, -0.28, 'in']] };
// the height of the air phase: a parabola that hangs (p > 2 keeps him near the top longer)
function mmoHang(w, p) { return 1 - Math.pow(Math.abs(2 * mmC01(w) - 1), p || 2.4); }
// o: { t0, x0, dir, h, rate (bounces/s: 1.45), len (px/bounce: 0.42 h), height (0.17 h), n (bounces), squash (×1),
//      lean (back, rad: 0.08), hang (2.4), skip (0.6) }
// → mushDraw fields: { x, y (lift, px up: subtract from the ground), squash, lean, yaw, arms, ant, walk, u, n, air }
function mmoMushBounce(t, o) {
  o = o || {};
  const h = o.h || 200, dir = o.dir || 1, rate = o.rate || 1.45, len = (o.len === undefined ? 0.42 : o.len) * h;
  const H = (o.height === undefined ? 0.17 : o.height) * h, N = o.n === undefined ? 1e9 : o.n, g0 = MMO_MUSH.g;
  const tau = Math.max(0, t - (o.t0 || 0)) * rate;
  let n = Math.floor(tau), u = tau - n;
  const done = n >= N;
  if (done) { n = N; u = 0; }
  const air = !done && u >= g0, w = air ? (u - g0) / (1 - g0) : 0;
  const yUp = air ? H * mmoHang(w, o.hang) : 0;
  // o.slide (0..1, 🎬 EP3's ride downhill): part of the way is slid on the ground, not flown (a skid-bounce: a tracking camera
  //   at his average speed would otherwise see him lurch back on every landing); 0 = planted (his 2020 bounce-walk)
  const sl = mmC01(o.slide || 0), x = (o.x0 || 0) + dir * len * ((1 - sl) * (n + (air ? w : 0)) + sl * (done ? n : tau));
  let sq = mmKey(u, MMO_MUSH.keys) * (o.squash === undefined ? 1.4 : o.squash);
  if (done) sq = 0.62 * mmoSettle(Math.max(0, t - (o.t0 || 0) - N / rate), 1, 14, 6);   // the last landing settles
  // the antenna: a spring that follows his height (overlap): it bends down as he rises, up as he falls,
  // whips down on the landing and rings out. Plus a drag back while he travels.
  const yAt = (tt) => { const tt2 = Math.max(0, tt - (o.t0 || 0)) * rate; let nn = Math.floor(tt2), uu = tt2 - nn; if (nn >= N) return 0; return uu >= g0 ? H * mmoHang((uu - g0) / (1 - g0), o.hang) : 0; };
  const lagY = mmoLag(yAt, t, { hz: 2.1, damp: 0.24 }) / h;
  const front = Math.sin(o.yaw === undefined ? dir * 0.9 : o.yaw) * dir;
  const droop = mmClamp(7.0 * lagY + (air ? 0.14 : 0.05) * (o.drag === undefined ? 1 : o.drag), -0.6, 0.8);
  // the arms: loose, flung out on the launch, floating up in the air, slapping down on the landing (overlap)
  // (his 0:42.28: arms flung wide in a low squat, the sack's corners flaring)
  const armL = 1.25 + 0.85 * Math.max(0, -sq) + 0.55 * Math.max(0, sq) + 0.5 * mmSmooth(w) * (1 - w) * 2 + 3.5 * lagY;
  const rest = 1.25, aR = Math.max(0.6, armL), aL = Math.max(0.6, armL * 0.9 + 0.12 * Math.sin(Math.PI * w));
  // the skip: one foot tucked higher in the air, the other foot next bounce
  const skip = (o.skip === undefined ? 0.6 : o.skip) * Math.sin(Math.PI * w);
  const ph = (n % 2 === 0) ? 0.25 : 0.75;
  const lean = -dir * (o.lean === undefined ? 0.08 : o.lean) * (0.7 + 0.3 * Math.cos(Math.PI * w)) + dir * 0.06 * Math.max(0, -sq) * (u < g0 + 0.1 ? 1 : 0);
  return { x, y: yUp, squash: sq, lean, yaw: o.yaw === undefined ? dir * 0.9 : o.yaw,
           arms: { R: [aR, 1], L: [aL, 1] }, ant: { droop, wobble: 0, up: Math.max(0, -sq) * 0.25 },
           walk: air && skip > 0.02 ? { ph, amt: skip } : null, u, n, air, done };
}
// one big HOP (an anticipation, the launch, the hang, the land, the overshoot), tau = time since its start
//   o: { h, height (0.45 h), dur (air time, 0.62 s), antic (0.3 s), dist (px travelled in the air), dir }
function mmoMushHop(tau, o) {
  o = o || {};
  const h = o.h || 200, H = (o.height === undefined ? 0.45 : o.height) * h, A = o.antic === undefined ? 0.3 : o.antic, T = o.dur || 0.62, dir = o.dir || 1;
  let sq = 0, y = 0, k = 0, x = 0;
  if (tau < 0) sq = 0;
  else if (tau < A) { const q = tau / A; sq = 0.85 * mmIO(mmSeg(q, 0, 0.75)) - 1.6 * mmIn(mmSeg(q, 0.75, 1)); }   // load low and wide … and SPRING
  else if (tau < A + T) { k = (tau - A) / T; y = H * mmoHang(k, 2.2); sq = -0.75 * (1 - mmSmooth(mmSeg(k, 0, 0.4))) + 0.1 * mmSeg(k, 0.4, 0.55) - 0.35 * mmIn(mmSeg(k, 0.6, 1)); x = (o.dist || 0) * k; }
  else { const s = tau - A - T; sq = 0.95 * mmoSettle(s, 1, 13, 5.5); x = o.dist || 0; k = 1; }
  const yAt = (tt) => (tt > A && tt < A + T) ? H * mmoHang((tt - A) / T, 2.2) : 0;
  const lagY = mmoLag(yAt, tau, { hz: 2.4, damp: 0.25 }) / h;
  return { y, squash: mmClamp(sq, -1, 1), x: dir * x, ant: { droop: mmClamp(3.5 * lagY + 0.06, -0.6, 0.7), wobble: 0, up: Math.max(0, -sq) * 0.3 },
           arms: { R: [1.25 + 1.2 * Math.max(0, -sq) + 1.5 * lagY, 1], L: [1.25 + 1.1 * Math.max(0, -sq) + 1.5 * lagY, 1] }, air: tau > A && tau < A + T };
}
// idle: a slow breath through the sack, the antenna swaying, a little 'hup' now and then
function mmoMushIdle(t, o) {
  o = o || {};
  const sd = o.seed === undefined ? 21 : o.seed;
  const br = Math.sin(t * 2 * Math.PI / 2.6);
  const hi = Math.floor(t / 3.3), hu = t - hi * 3.3 - 1.4 - mmH2(hi, sd) * 0.8;          // a 'hup': up on his toes, down
  const hup = hu > 0 && hu < 0.5 ? Math.sin(Math.PI * hu / 0.5) : 0;
  return { squash: 0.05 * br - 0.22 * hup + 0.18 * mmoSettle(hu - 0.5, 1, 18, 9) * (hu > 0.5 ? 1 : 0), lean: 0.02 * mmSN1(t / 2.4, sd),
           ant: { droop: 0.05 * mmSN1(t / 1.3, sd + 1) + 0.15 * hup, wobble: 0 }, arms: { R: [1.25 + 0.05 * br, 1], L: [1.25 + 0.05 * br, 1] } };
}

// ═══════════════════════════════════════════════════════════════════════════════════════
//  PUFF · the hop is already in her rig (puffDraw pose 'hop', ph 0..1: pfHopState). This only paces it:
//  ground while the boots are down (planted), travel only in the air.
// ═══════════════════════════════════════════════════════════════════════════════════════
// o: { t0, x0, dir, h, rate (hops/s: 1.5), len (px/hop: 0.34 h), hopH (0.22), n, yaw (dir·0.75) }
function mmoPuffHop(t, o) {
  o = o || {};
  const h = o.h || 150, dir = o.dir || 1, rate = o.rate || 1.5, len = (o.len === undefined ? 0.34 : o.len) * h, N = o.n === undefined ? 1e9 : o.n;
  const T0 = 0.26, T1 = 0.74;                                                            // pfHopState: the boots leave / touch down
  const tau = Math.max(0, t - (o.t0 || 0)) * rate;
  let n = Math.floor(tau), ph = tau - n;
  const done = n >= N;
  if (done) { n = N; ph = 0; }
  const w = mmC01((ph - T0) / (T1 - T0));
  const x = (o.x0 || 0) + dir * len * (n + w);
  const air = !done && ph > T0 && ph < T1;
  return { x, pose: done ? 'stand' : 'hop', ph: done ? 0 : ph, hopH: o.hopH === undefined ? 0.22 : o.hopH, yaw: o.yaw === undefined ? dir * 0.75 : o.yaw,
           lean: dir * 0.1 * Math.sin(Math.PI * w) * (air ? 1 : 0), air, n };
}
// PUFF'S BIG WALK (Mook, 2026-09-30: "puff needs a bigger walk"): stork steps on a distance clock. Long strides, the
//   knees lifting high (the boot comes up past the other shin), the ball riding UP over each planted leg and squashing
//   DOWN onto it at contact, stretched as it pushes off; the bow lags the bounce. d: distance walked (px).
//   Mook picked HUGE (2026-10-01, 1 am: "puff huge"): the defaults below.
//   o: { h, step (a, one boot to the other: 1.45), lift (a, the swing boot: 1.15), bob (a, up at the passing: 0.48),
//        drop (a, down after contact: 0.28), squash (0.17), lean (rad: 0.12), splay } → puffDraw inputs
function mmoPuffWalk(d, o) {
  o = o || {};
  const h = o.h || 150, a = h / (typeof PF !== 'undefined' ? PF.H : 4.1), S = o.step === undefined ? 1.45 : o.step;
  const c = Math.max(0, d) / (a * 2 * S), f = c - Math.floor(c), first = f < 0.5, u = first ? 2 * f : 2 * f - 1;
  const st = first ? 'R' : 'L', sw = first ? 'L' : 'R', feet = {};
  feet[st] = [0, 0, S * (0.5 - u)];                                                      // planted: runs back under the ball
  const lift = o.lift === undefined ? 1.15 : o.lift;
  feet[sw] = [0.04, lift * Math.pow(Math.sin(Math.PI * u), 0.75), -S * 0.5 + S * mmIO(u)];   // the stork step: up high, through
  // the ball: down onto the planted leg at contact, up over it at the passing, stretched on the push, squashed on the landing
  const bob = (o.bob === undefined ? 0.48 : o.bob) * Math.sin(Math.PI * u) - (o.drop === undefined ? 0.28 : o.drop) * mmoBump(u, 0.08, 0.12);
  const sq = 1 - (o.squash === undefined ? 0.17 : o.squash) * mmoBump(u, 0.06, 0.1) + 0.06 * mmoBump(u, 0.42, 0.14);
  const du = 0.02, bobAt = (q) => Math.sin(Math.PI * q) - 0.6 * mmoBump(q, 0.08, 0.12);
  const vel = (bobAt(Math.min(1, u + du)) - bobAt(Math.max(0, u - du))) / (2 * du);
  return { pose: 'stand', feet, lift: bob, sy: sq, sx: 1 / Math.sqrt(sq), lean: o.lean === undefined ? 0.12 : o.lean,
           bowWilt: mmClamp(vel * 0.12, -0.35, 0.35), tilt: 0.05 * Math.sin(2 * Math.PI * f), look: [0.35, -0.15], f, u, stance: st };
}
function mmoPuffGo(g, C, o) {
  o = o || {};
  const yaw = C.yaw === undefined ? 1.2 : C.yaw, dir = Math.sin(yaw) >= 0 ? 1 : -1;
  const P = o.path || (() => ({ x: C.x, d: 0 })), p = P(C.t || 0), w = mmoPuffWalk(p.d, Object.assign({ h: C.h }, o));
  return puffDraw(g, Object.assign({}, C, { x: o.track ? C.x : p.x, pose: w.pose, feet: w.feet, lift: w.lift, sy: w.sy, sx: w.sx,
    lean: (C.lean || 0) + dir * w.lean, bowWilt: (C.bowWilt || 0) + w.bowWilt, tilt: (C.tilt || 0) + w.tilt, look: C.look || [dir * 0.35, -0.15] }));
}
function mmoPuffIdle(t, o) {
  o = o || {};
  const sd = o.seed === undefined ? 31 : o.seed, br = Math.sin(t * 2 * Math.PI / 2.0);
  const gi = Math.floor(t / 1.7), gk = mmSmooth(mmSeg(t - gi * 1.7, 0, 0.12));
  return { sy: 1 + 0.025 * br, sx: 1 - 0.012 * br, bowWilt: 0.06 * mmSN1(t / 1.1, sd), lean: 0.03 * mmSN1(t / 2.2, sd + 1),
           look: [mmLerp(mmSN1(gi - 1, sd + 2) * 0.4, mmSN1(gi, sd + 2) * 0.4, gk) + 0.19, -0.3] };
}

// ═══════════════════════════════════════════════════════════════════════════════════════
//  FINLEY v2 · quick, confident, casual (🎬 the walk is mine: his animatic holds her poses, 4:16.6-4:19: upright, a
//  heel kicked up behind as she waves). Her rig walks for real now (mm_finley.js v2: hip, feet, toe, skirt.lag,
//  hair {lag, spin, lift}), so no more legs cut out of extra passes.
//  HER HAIR is Brave's (Pixar; Claudia Chung: "computed essentially two curves per hair curl, one that represented the
//  curls and another that represented the overall wave and movement"; "Curly hair is stiff in the way that it never loses
//  the curl or spiral, but yet in overall movement, it's actually quite soft and light"). So every lock keeps its own
//  curl (the rig) and ONE soft core (a damped spring, below) lags the head: the mass moves together, keeps its order,
//  never crosses her face (the rig's guard) and is the same every time a frame is drawn (GeoV draws frames in any order).
// ═══════════════════════════════════════════════════════════════════════════════════════
// THE WALK on a distance clock. d: distance walked (px). o: { h, step (H, one foot to the other: 0.2), lift (H: 0.05),
//   dip (H, the knee giving after contact: 0.012), sway (H, hips over the planted foot: 0.012), lean (rad: 0.035),
//   arms (swing, arm lengths: 0.28) } → { hip [x, y, z] (H), feet {R, L} (H), toe {R, L}, lean, pose, nod, f, u, stance }
function mmoFinleyWalk2(d, o) {
  o = o || {};
  const G = typeof FN_GEO !== 'undefined' ? FN_GEO : { hipY: 0.615, ankleY: 0.905 };
  const S = o.step === undefined ? 0.2 : o.step, lift = o.lift === undefined ? 0.05 : o.lift, L = G.ankleY - G.hipY;
  const c = Math.max(0, d) / ((o.h || 330) * 2 * S), f = c - Math.floor(c), first = f < 0.5, u = first ? 2 * f : 2 * f - 1;
  const zSt = S * (0.5 - u);                                     // the planted foot: ahead at contact, behind at toe-off
  const zSw = -S * 0.5 + S * mmIO(u);                            // the other comes through, eased (it plants, it does not slam)
  const ySw = lift * Math.sin(Math.PI * Math.pow(u, 0.85));       // its lift peaks a little early: a quick, light step
  // the hips ride the planted leg (lowest at contact, highest passing over it), and the knee gives just after contact
  const hipY = -(L - Math.sqrt(Math.max(0, L * L - zSt * zSt))) - (o.dip === undefined ? 0.012 : o.dip) * mmoBump(u, 0.16, 0.18);
  const sway = (o.sway === undefined ? 0.012 : o.sway) * Math.sin(Math.PI * u) * (first ? -1 : 1);   // over the planted foot
  const st = first ? 'R' : 'L', sw = first ? 'L' : 'R', feet = {}, toe = {};
  feet[st] = [0, 0, zSt]; feet[sw] = [0, ySw, zSw];
  toe[sw] = -0.55 * mmoBump(u, 0.08, 0.1) + 0.32 * mmoBump(u, 0.9, 0.08);      // peels off toe-last, reaches heel-first
  toe[st] = -0.25 * mmSeg(u, 0.75, 1);                                          // the planted foot rolls onto its toes
  const arm = o.arms === undefined ? 0.28 : o.arms, k = arm * Math.sin(2 * Math.PI * (f - 0.04));   // arms trail the legs a hair
  const hand = (q) => [0.26, 0.93 - 0.18 * Math.max(0, q), 0.06 + q, { spread: 0.5 }];
  return { hip: [sway, hipY, 0], feet, toe, lean: o.lean === undefined ? 0.035 : o.lean, pose: { R: hand(k), L: hand(-k) },
           nod: 0.022 * Math.cos(4 * Math.PI * f), f, u, stance: st };
}
// THE HAIR'S CORE: a damped spring following her head. headFn(t) → [x, y] (screen px). → the rig's hair input.
//   o: { yaw, r (head radius px), hz (2.2), damp (0.42), gain (1), liftK (0.6), spinFn (t → her head's yaw) }
function mmoHairCore(headFn, t, o) {
  o = o || {};
  const sp = { hz: o.hz || 2.2, damp: o.damp === undefined ? 0.42 : o.damp, n: o.n || 40 }, quick = { hz: 6, damp: 0.9, n: 24 };
  // the core trails the head: (the head, a touch smoothed) − (the soft spring). Smoothing the head first keeps a footfall's
  // jolt from twitching the locks: Brave's rule, "stability was key"
  const lx = mmoSpring((q) => headFn(q)[0], t, sp) - mmoSpring((q) => headFn(q)[0], t, quick);
  const ly = mmoSpring((q) => headFn(q)[1], t, sp) - mmoSpring((q) => headFn(q)[1], t, quick);
  const yaw = o.yaw || 0, k = (o.gain === undefined ? 1.6 : o.gain) / (o.r || 30);
  const out = { lag: [lx * Math.cos(yaw) * k, -ly * k, lx * Math.sin(yaw) * k], lift: mmClamp(-ly * k * (o.liftK === undefined ? 0.6 : o.liftK), -0.35, 0.35) };
  if (o.spinFn) out.spin = -mmoLag(o.spinFn, t, { hz: sp.hz * 0.9, damp: sp.damp, n: sp.n });
  return out;
}
// THE SKIRT'S HEM: a stiffer spring on her hips. hipFn(t) → [x, y] (screen px). → skirt.lag [x, z] (H, body space)
function mmoSkirtCore(hipFn, t, o) {
  o = o || {};
  const sp = { hz: o.hz || 3.2, damp: o.damp === undefined ? 0.5 : o.damp, n: 30 };
  const lx = -mmoLag((q) => hipFn(q)[0], t, sp), yaw = o.yaw || 0, k = (o.gain === undefined ? 0.7 : o.gain) / (o.H || 330);
  return [mmClamp(lx * Math.cos(yaw) * k, -0.05, 0.05), mmClamp(lx * Math.sin(yaw) * k, -0.05, 0.05)];
}
// DRAW HER WALKING. C: finleyDraw's call (x, y = the ground, h, yaw, t, …). o: { path: t → {x, d} (where she is and how far
//   she has walked, for the walk and for her hair's history), track (draw at C.x: a camera following her), the walk's
//   options, hairHz, hairDamp, hairGain }
function mmoFinleyGo(g, C, o) {
  o = o || {};
  const H = C.h, t = C.t || 0, yaw = C.yaw === undefined ? 1.45 : C.yaw, dir = Math.sin(yaw) >= 0 ? 1 : -1;
  const r = (typeof FN_GEO !== 'undefined' ? FN_GEO.headR : 0.106) * H;
  const P = o.path || (() => ({ x: C.x, d: 0 })), W = (q) => mmoFinleyWalk2(P(q).d, Object.assign({ h: H }, o));
  const headAt = (q) => { const p = P(q), w = W(q); return [p.x + dir * w.lean * 0.5 * H, C.y - (0.81 + w.hip[1]) * H]; };
  const w = W(t), p = P(t);
  const hair = mmoHairCore(headAt, t, { yaw, r, hz: o.hairHz, damp: o.hairDamp, gain: o.hairGain });
  const lag = mmoSkirtCore((q) => [P(q).x, -W(q).hip[1] * H], t, { yaw, H });
  const D = Object.assign({}, C, { x: o.track ? C.x : p.x, hip: w.hip, feet: w.feet, toe: w.toe, lean: (C.lean || 0) + dir * w.lean,
    pose: C.pose || w.pose, nod: (C.nod || 0) + w.nod, hair, skirt: { lag } });
  return finleyDraw(g, D);
}
// her idle: breathing, a weight shift, the hair settling, a look now and then (relaxed, casual)
function mmoFinleyIdle(t, o) {
  o = o || {};
  const sd = o.seed === undefined ? 41 : o.seed, br = Math.sin(t * 2 * Math.PI / 3.2);
  const gi = Math.floor(t / 2.6), gk = mmSmooth(mmSeg(t - gi * 2.6, 0, 0.15));
  const look = [mmLerp(mmSN1(gi - 1, sd) * 0.5, mmSN1(gi, sd) * 0.5, gk), 0];
  return { sy: 1 + 0.007 * br, lean: 0.015 * mmSN1(t / 2.9, sd + 1), headTurn: 0.12 * mmSN1(t / 3.7, sd + 3), eyes: { look },
           hair: { lag: [0.05 * mmSN1(t / 1.6, sd + 2), -0.03 * br, 0], spin: 0.05 * mmSN1(t / 2.1, sd + 4) } };
}
// the v1 names still answer (old shot files): the walk draws through the real rig now
function mmoFinleyWalk(d, o) { return mmoFinleyWalk2(d, o); }
function mmoFinleyDraw(g, C, W) { return finleyDraw(g, Object.assign({}, C, { hip: W.hip, feet: W.feet, toe: W.toe, lean: (C.lean || 0) + W.lean, pose: W.pose, nod: W.nod })); }

// ═══════════════════════════════════════════════════════════════════════════════════════
//  THE SKATEBOARD and MOOK ON IT (he skates; 🎬 every skate move is mine, read from his animatic's
//  board: 4:50.4-4:54.5, a long low deck, the push with the front foot on and the back foot down,
//  the board dropped nose first and slapping flat)
// ═══════════════════════════════════════════════════════════════════════════════════════
// 🎬 his animatic's board is uncoloured line; the deck takes Mook's two colours (MM keys, so a palette swaps them)
const MMO_KEYS = { mmoDeck: MM.mkRed, mmoDeckUnder: MM.mkTeal, mmoGrip: MM.mkLeg || '#9FAFB4', mmoWheel: MM.white, mmoTruck: MM.mkLeg || '#9FAFB4', mmoShadow: '#342848' };
for (const k in MMO_KEYS) if (!(k in MM)) MM[k] = MMO_KEYS[k];
// the board in Mook's head radii: deck 4.6 long, its top 0.46 off the road
const MMO_BOARD = { len: 4.6, top: 0.46, th: 0.13, wheel: 0.17, truck: 0.17, width: 0.95 };
// B: { x (centre), y (the road under it), R (Mook's head radius), dir (+1 nose right), pitch (rad, + nose up),
//      roll (rad, the kickflip: 0 = grip up), lift (px up off the road), spin (wheel turn, rad), t, seed }
function mmoBoard(g, B) {
  const R = B.R, Bd = MMO_BOARD, L = Bd.len * R / 2, th = Bd.th * R, wr = Bd.wheel * R, dir = B.dir || 1;
  const t = B.t || 0, bk = mmBoil(t) + (B.seed | 0) * 7 + 401, lw = Math.max(1.4, R * 0.075), amp = Math.max(0.3, R * 0.02);
  const roll = B.roll || 0, cr = Math.cos(roll), sr = Math.sin(roll), Wd = Bd.width * R;
  g.save(); g.translate(B.x, B.y - (B.lift || 0) - Bd.top * R); g.rotate(-(B.pitch || 0) * dir); g.scale(dir, 1);
  // the deck's cross-section rolls about its long axis: we see its thickness and, as it turns, its face
  const halfH = Math.max(th * 0.5, Math.abs(cr) * th * 0.5 + Math.abs(sr) * Wd * 0.5);
  const kick = 0.32 * R;                                                                      // nose and tail kick up
  const deck = [];
  for (let i = 0; i <= 16; i++) { const a = Math.PI / 2 + Math.PI * i / 16; deck.push([-L + halfH + Math.cos(a) * halfH * 1.4, Math.sin(a) * halfH - kick * Math.pow(Math.abs(Math.cos(a)), 6) * 0]); }
  const top = [], bot = [];
  for (let i = 0; i <= 12; i++) { const x = mmLerp(-L + halfH, L - halfH, i / 12), e = Math.pow(Math.abs(2 * i / 12 - 1), 6); top.push([x, -halfH - kick * e * cr]); bot.push([x, halfH - kick * e * cr]); }
  const P = [...top, ...[...Array(9)].map((_, i) => { const a = -Math.PI / 2 + Math.PI * i / 8; return [L - halfH + Math.cos(a) * halfH * 1.3, Math.sin(a) * halfH - kick * cr]; }),
             ...bot.slice().reverse(), ...[...Array(9)].map((_, i) => { const a = Math.PI / 2 + Math.PI * i / 8; return [-L + halfH + Math.cos(a) * halfH * 1.3, Math.sin(a) * halfH - kick * cr]; })];
  // the wheels and trucks hang under the deck: they turn with the roll (above it when it is upside down)
  const wy = (th * 0.5 + Bd.truck * R + wr * 0.8) * cr, wz = (th * 0.5 + Bd.truck * R + wr * 0.8) * sr;
  const wheels = () => { for (const sx of [-1, 1]) {
      const cx = sx * (L - 0.75 * R), cy = wy;
      mmInk(g, [[cx - 0.2 * R, cr * th * 0.4], [cx + 0.2 * R, cr * th * 0.4], [cx + 0.08 * R, cy], [cx - 0.08 * R, cy]], { fill: MM.mmoTruck, lw: lw * 0.8, amp: amp * 0.5, seed: 403 + sx, bk });
      for (const dz of [-1, 1]) { if (Math.abs(sr) < 0.15 && dz < 0) continue;
        const wx = cx + 0.02 * R * dz, wyy = cy + dz * wz * 0.0 + (dz > 0 ? 0 : 0) - Math.sign(sr || 1) * dz * Wd * 0.38 * Math.abs(sr);
        const Wp = mmCirclePts(wx, wyy, wr, wr, 12, 0, 0.03, 405 + sx + dz);
        mmInk(g, Wp, { fill: MM.mmoWheel, lw: lw * 0.9, amp: amp * 0.5, seed: 407 + sx, bk });
        const sp = B.spin || 0;                                                                // a spoke mark so the wheel is seen to turn
        mmInk(g, [[wx + Math.cos(sp) * wr * 0.15, wyy + Math.sin(sp) * wr * 0.15], [wx + Math.cos(sp) * wr * 0.7, wyy + Math.sin(sp) * wr * 0.7]], { closed: false, lw: lw * 0.6 });
      } } };
  if (cr >= 0) wheels();
  // the deck: grip (black) when its top faces us, the graphic (his two halves) when its bottom does
  const faceTop = sr > 0.25, faceBot = sr < -0.25;
  const fillC = faceTop ? MM.mmoGrip : faceBot ? MM.mmoDeckUnder : MM.mmoDeck;
  if (faceBot) mmSplit(g, P, [[0, -3 * R], [0, 3 * R]], MM.mmoDeckUnder, MM.mmoDeck, { lw, amp, seed: 409, bk });
  else mmInk(g, P, { fill: fillC, lw, amp, seed: 409, bk });
  if (!faceTop && !faceBot) mmInk(g, top.map(p => [p[0], p[1] + th * 0.35 * Math.sign(cr || 1)]), { closed: false, lw: lw * 0.6, amp: amp * 0.5, seed: 410, bk });
  if (cr < 0) wheels();
  g.restore();
}
// a soft contact shadow under anything on the road (MM.mmoShadow), shrinking as it lifts
function mmoShadowAt(g, x, y, rx, up) {
  const k = 1 / (1 + Math.max(0, up || 0) * 2.2);
  g.save(); g.fillStyle = mmRGBA(MM.mmoShadow, 0.16 * k); g.beginPath(); g.ellipse(x, y + 2, rx * (0.6 + 0.4 * k), rx * 0.17 * (0.6 + 0.4 * k), 0, 0, Math.PI * 2); g.fill(); g.restore();
}

// ── MOOK SKATES: a script of moves on one clock ─────────────────────────────────────────
// o: { t0, x0, dir, h, vb (cruise, px/s: 1.0 h), yaw (pushing: dir·1.25), yawGlide (dir·0.55: he opens to us),
//      script: [[move, start (s after t0)], …] with move 'push' | 'flip' (a kickflip); between moves he glides,
//      stance (feet apart on the deck, R: 0.8), crouch (R: 0.25) }
// → { board: mmoBoard's B, C: mookDraw's call, F: feet for mmoMookLegs (or null: one pass), bob, x, v }
const MMO_SK = { push: { reach: 0.2, plant: 0.2, contact: 0.32, back: 0.26, dv: 0.32 }, flip: { crouch: 0.26, pop: 0.06, air: 0.56, land: 0.45, jump: 2.0, roll: 0.7 } };
function mmoSkSpeed(tau, o) {
  const h = o.h || 300, vb = (o.vb === undefined ? 0.62 : o.vb) * h, P = MMO_SK.push;
  let v = vb;
  for (const [m, s0] of (o.script || [])) if (m === 'push') {
    const a = s0 + P.reach + P.plant * 0, b = a + P.contact, dv = P.dv * h;
    if (tau > a) v += dv * mmSmooth(mmSeg(tau, a, b)) * Math.exp(-Math.max(0, tau - b) / 2.2);
  }
  return v;
}
function mmoSkX(tau, o) {                                       // the board's distance: the speed, summed (deterministic)
  const n = Math.max(8, Math.ceil(tau * 40)), dt = tau / n;
  let x = 0; for (let i = 0; i < n; i++) x += mmoSkSpeed((i + 0.5) * dt, o) * dt;
  return x;
}
function mmoMookSkate(t, o) {
  o = o || {};
  const h = o.h || 300, R = h / 8.9, dir = o.dir || 1, tau = Math.max(0, t - (o.t0 || 0));
  const Bd = MMO_BOARD, deckH = Bd.top * R + Bd.th * R * 0.5;                              // the deck's top above the road
  const x = (o.x0 || 0) + dir * mmoSkX(tau, o), v = mmoSkSpeed(tau, o);
  const yawP = o.yaw === undefined ? dir * 1.25 : o.yaw, yawG = o.yawGlide === undefined ? dir * 0.55 : o.yawGlide;
  const st = (o.stance === undefined ? 0.8 : o.stance) * R;
  // which move is on, and how far in
  let move = 'glide', k0 = 0;
  for (const [m, s0] of (o.script || [])) {
    let P = MMO_SK[m]; if (!P) continue;
    if (m === 'flip' && o.toon) P = Object.assign({}, MMO_SK.toon, o.toonP || {});             // the toon kickflip's own beats
    const dur = m === 'push' ? P.reach + P.plant * 0 + P.contact + P.back : P.crouch + P.pop + P.air + P.land;
    if (tau >= s0 && tau < s0 + dur) { move = m; k0 = s0; }
  }
  const s = tau - k0;
  // yaw: profile to push, open to us to glide (the head leads the turn)
  let lastPush = -1e9, nextPush = 1e9;
  for (const [m, s0] of (o.script || [])) if (m === 'push') { const end = s0 + 0.74; if (end <= tau) lastPush = Math.max(lastPush, end); if (s0 > tau) nextPush = Math.min(nextPush, s0); }
  const kOpen = mmSmooth(mmSeg(tau, lastPush + 0.1, lastPush + 0.55)) * (1 - mmSmooth(mmSeg(tau, nextPush - 0.45, nextPush - 0.05)));
  const kHead = mmSmooth(mmSeg(tau, lastPush, lastPush + 0.35)) * (1 - mmSmooth(mmSeg(tau, nextPush - 0.55, nextPush - 0.15)));
  const yaw = mmLerp(yawP, yawG, (o.script || []).some(q => q[0] === 'push') ? kOpen : 1);
  const headTurn = (mmLerp(yawP, yawG, kHead) - yaw) * 0.9;
  const B = { x, y: o.y || 0, R, dir, pitch: 0, roll: 0, lift: 0, spin: -dir * x / (Bd.wheel * R), t };
  const C = { x, y: (o.y || 0) - deckH, h, yaw, headTurn, t, seed: 1, blink: o.blink, lean: 0, eyes: { look: [dir * 0.4, 0.05] } };
  // the glide: feet apart on the deck, knees soft, arms out a little for balance, a slow sway (he is cool)
  const sway = Math.sin(tau * 2 * Math.PI / 1.9);
  const glide = { bob: (0.32 + 0.05 * sway) * R, pose: { R: [0.75, 1.55 + 0.1 * sway, 0.35, { spread: 1.2 }], L: [0.7, 1.6 - 0.1 * sway, 0.2, { spread: 1.2 }] }, lean: dir * 0.02 * sway };
  let F = null, bob = glide.bob, pose = glide.pose, lean = glide.lean, wk = { ph: 0.5, amt: 1, stride: st / R }, phase = 'glide';
  if (move === 'push') {
    const P = MMO_SK.push, zF = 0.62 * R, zT = -st * 0.95, zP = 0.12 * R, sYaw = Math.max(0.5, Math.abs(Math.sin(yaw)));
    const a = P.reach, strokeLen = (o.stroke === undefined ? 2.0 : o.stroke) * R * sYaw;       // how far the board runs under the planted foot
    const xA = mmoSkX(k0 + a, o);
    let b = a + P.contact;                                                                // the foot lifts when the stroke is done (or the time is)
    if (mmoSkX(k0 + b, o) - xA > strokeLen) { let lo = a, hi = b; for (let i = 0; i < 14; i++) { const m = (lo + hi) / 2; if (mmoSkX(k0 + m, o) - xA > strokeLen) hi = m; else lo = m; } b = (lo + hi) / 2; }
    const c = b + P.back;
    let zb, yb;                                                                           // the back (push) foot: depth, height (+ = below the deck)
    if (s < a) { const k = s / a; zb = mmLerp(zT, zP, mmIO(k)); yb = deckH * mmIn(k) - 0.35 * R * Math.sin(Math.PI * Math.min(1, k * 1.15)); phase = 'reach'; }
    else if (s < b) { zb = zP - (mmoSkX(tau, o) - xA) / sYaw; yb = deckH; phase = 'push'; }   // planted on the road: it stays where it landed
    else if (s < c) { phase = 'recover'; const k = (s - b) / P.back, zE = zP - (mmoSkX(k0 + b, o) - xA) / sYaw;
      zb = mmLerp(zE, zT, mmIO(k)); yb = deckH * (1 - mmOut(k)) - 0.42 * R * Math.sin(Math.PI * k); }
    else { zb = zT; yb = 0; }
    const fs = dir > 0 ? 'L' : 'R', bs = fs === 'L' ? 'R' : 'L';                            // regular stance: his left foot forward going right
    const reachK = Math.sin(Math.PI * mmSeg(s, 0, c));
    lean = dir * (0.03 + 0.08 * reachK);
    const Fw = {}; Fw[fs] = [zF, 0]; Fw[bs] = [zb, yb];
    F = mmoMookPrelean(Fw, lean, yaw, R);
    bob = Math.max(0.3 * R, (MMO_MK.hipY * R - mmoMookHip(F, R, 0.12)));
    const sw = 0.5 * reachK * (bs === 'R' ? 1 : -1);
    pose = { R: [0.55, 1.7, 0.4 + sw, {}], L: [0.55, 1.7, 0.4 - sw, {}] };
    C.eyes = { look: [dir * 0.5, 0.15] };
  } else if (move === 'flip' && o.toon) {                                                     // TOON: see mmoToonFlip
    C.walk = undefined; C.pose = glide.pose;
    const T = mmoToonFlip(s, o, { C, board: B });
    const e = 1 / 120, rr = (mmoToonFlipBody(s + e, o).roll - mmoToonFlipBody(s - e, o).roll) / (2 * e);
    T.toon.rollRate = rr;
    return { board: B, C: T.C, F: null, bob: 0, x, v, move, phase: T.toon.body.phase, deckH, toon: T.toon };
  } else if (move === 'flip') {
    const P = MMO_SK.flip, a = P.crouch, b = a + P.pop, c = b + P.air, J = P.jump * R;
    if (s < a) {                                                                           // the crouch: anticipation, low and loaded
      const k = mmIO(s / a); phase = 'crouch'; bob = mmLerp(glide.bob, 1.15 * R, k); lean = dir * 0.06 * k;
      pose = mkPoseMix(glide.pose, { R: [0.5, 2.0, -0.6, { fist: 0.6 }], L: [0.5, 2.0, -0.7, { fist: 0.6 }] }, k);
    } else if (s < b) {                                                                    // the pop: legs snap straight, the tail slaps
      const k = (s - a) / P.pop; phase = 'pop'; bob = mmLerp(1.15 * R, -0.05 * R, mmOut(k)); C.y -= J * 0.12 * k;
      B.pitch = 0.42 * mmOut(k); B.lift = 0.15 * R * k;
      pose = { R: [0.9, -0.6, 0.3, { spread: 1.4 }], L: [0.9, -0.4, 0.2, { spread: 1.4 }] }; lean = dir * 0.02;
    } else if (s < c) {                                                                    // the air: tucked, the board flips under him
      const k = (s - b) / P.air, yUp = J * mmoHang(Math.min(1, k * 0.92 + 0.08), 2.2);
      C.y -= yUp + 0.12 * J * (1 - k);
      bob = (0.5 + 1.7 * Math.sin(Math.PI * Math.min(1, k * 1.1))) * R;                       // knees up: the tuck
      const kr = mmSeg(k, 0.0, P.roll), cat = mmSmooth(mmSeg(k, P.roll * 0.85, 0.86)); phase = k < P.roll ? 'flip' : 'catch';
      B.roll = -dir * 2 * Math.PI * mmIO(kr);
      B.pitch = 0.42 * (1 - mmSmooth(mmSeg(k, 0, 0.45)));
      B.lift = (yUp + 0.12 * J * (1 - k)) * mmLerp(0.5, 1, cat);                               // it rises to meet his feet: caught
      pose = { R: [1.1, -0.9 + 0.6 * k, 0.4, { spread: 1.5 }], L: [1.05, -0.7 + 0.6 * k, 0.1, { spread: 1.5 }] }; lean = dir * (0.04 - 0.06 * k);
      C.eyes = { look: [dir * 0.15, 0.85], wide: 0.6 };
    } else {                                                                               // the landing: squash, and ride it out (cool)
      const k = (s - c); phase = k < 0.25 ? 'land' : 'ride'; bob = glide.bob + 0.75 * R * Math.exp(-k * 7) + 0.25 * R * mmoSettle(k, 1, 16, 7);
      C.sy = 1 - 0.05 * Math.exp(-k * 9); C.sx = 1 + 0.04 * Math.exp(-k * 9);
      pose = mkPoseMix({ R: [1.1, 0.6, 0.3, { spread: 1.5 }], L: [1.05, 0.7, 0.1, { spread: 1.5 }] }, glide.pose, mmSmooth(k / P.land));
      C.eyes = { look: [dir * 0.35, 0], happy: k > 0.12 && k < 0.4 ? 0 : 0 };
    }
  }
  Object.assign(C, { bob, pose, lean: (C.lean || 0) + lean });
  if (!F) C.walk = wk;
  return { board: B, C, F, bob, x, v, move, phase, deckH };
}
// draw it: his shadow, the board's shadow, the board, then Mook (two passes while one foot is on the road)
function mmoSkateDraw(g, S) {
  const B = S.board, R = B.R;
  mmoShadowAt(g, B.x, B.y, MMO_BOARD.len * R * 0.55, (B.lift || 0) / (4 * R));
  if (S.toon) {                                    // toon: his own shadow too (it shrinks as he rises), multiples on the flip
    const up = (B.y - (S.C.y - 4.2 * R * (S.C.sy || 1))) / (4 * R) - 1.3;
    mmoShadowAt(g, S.C.x, B.y, 1.6 * R, Math.max(0, up));
    mmoBoardMultiples(g, B, S.toon.rollRate || 0, 3);
  }
  mmoBoard(g, B);
  if (S.F) return mmoMookLegs(g, Object.assign({}, S.C, { walk: undefined }), S.F, S.C.bob);
  return mookDraw(g, S.C);
}

// ── a ground line in his marker (the GIFs' stage) ───────────────────────────────────────
function mmoGround(g, y, x0, x1, t, o) {
  o = o || {};
  const P = []; for (let x = x0; x <= x1 + 1; x += (x1 - x0) / 24) P.push([x, y]);
  mmInk(g, P, { closed: false, lw: o.lw || 2.6, amp: o.amp === undefined ? 0.8 : o.amp, seed: 501, bk: mmBoil(t || 0) });
}

// ═══════════════════════════════════════════════════════════════════════════════════════
//  TOON · cartoon physics. Mook, 2026-10-01 03:26: "squash and stretch … noodle arms and legs tubes that strech and
//  bounce cartoon phisyics thats what i mean by bugs bunny … flex your understanding of how and why the charcaters move".
//  The rig's new inputs (mm_cast2020.js): hose (limbs stretch past their bones), noodle (a limb is one arc), foot (each
//  foot's own target), headDy (the head lags), strings (the drawstrings drag), sprigLag (the hairs drag); with sx, sy
//  (his squash, about his feet) and lean. The laws, in the order the eye reads them:
//   1 · a fast thing is a long thing: he stretches along the way he moves, by how fast (mmoSpeedStretch)
//   2 · the volume stays: sx = sy^−vol (vol ½ a body · 1 a flat sack of flour)
//   3 · the body hangs from its HIPS: they carry the path; scaled, leaned or crouched, the hips stay on it (mmoRootAt)
//   4 · nothing stops at once: hands, strings, hairs and the head trail on springs (mmoTrail): late, then past, then home
//   5 · he hangs at the top longer than physics would, and falls faster than he rose (mmoHang, p > 2)
//   6 · a foot that must be somewhere gets there: the leg stretches to reach it (mmoFootAt + hose)
// ═══════════════════════════════════════════════════════════════════════════════════════
const MMO_TOON = { vol: 0.5, hose: 1.75, noodle: 0.6, stretchK: 0.3, v0: 14 };
// squash and stretch with the volume kept: sy along the body, sx across it
function mmoSS(sy, vol) { return { sx: Math.pow(Math.max(0.2, sy), -(vol === undefined ? MMO_TOON.vol : vol)), sy }; }
// stretch on speed: v (px/s) along the body → sy ≥ 1 (k: how much at full speed, v0: full speed in head radii a second)
function mmoSpeedStretch(v, R, k, v0) { return 1 + (k === undefined ? MMO_TOON.stretchK : k) * Math.tanh(Math.abs(v) / ((v0 === undefined ? MMO_TOON.v0 : v0) * R)); }
// how far something soft is BEHIND a point moving along fn(t) (px; a damped spring, any frame on its own)
function mmoTrail(fn, t, o) { return mmoSpring(fn, t, o) - fn(t); }
// put Mook's hips at the screen point (hx, hy): his feet line (C.x, C.y) from his lean, sy and bob
function mmoRootAt(C, hx, hy) {
  const R = C.h / 8.9, c = 4.2 * R - (C.bob || 0), sy = C.sy || 1, l = C.lean || 0;
  C.x = hx - c * sy * Math.sin(l); C.y = hy + c * sy * Math.cos(l); return C;
}
// the screen point (X, Y) as a foot target in mookDraw's body space (his rig turns by lean and scales by sx, sy about his feet)
function mmoFootAt(C, s, X, Y) {
  const R = C.h / 8.9, lean = C.lean || 0, sx = C.sx || 1, sy = C.sy || 1, yaw = C.yaw === undefined ? -0.12 : C.yaw;
  const dx = X - C.x, dy = Y - C.y, c = Math.cos(lean), sn = Math.sin(lean);
  const lx = (dx * c + dy * sn) / sx, ly = (-dx * sn + dy * c) / sy;
  const Xb = (s === 'R' ? -1 : 1) * MMO_MK.hipX * R, cy = Math.cos(yaw);
  let sY = Math.sin(yaw); if (Math.abs(sY) < 0.3) sY = sY >= 0 ? 0.3 : -0.3;
  return [Xb, ly - MMO_MK.ank0 * R, (lx - Xb * cy) / sY];
}
// a point on the board (mmoBoard's own transform): u along the deck toward the nose, v down from its middle (px) → screen
function mmoBoardPt(B, u, v) {
  const dir = B.dir || 1, a = -(B.pitch || 0) * dir, ox = B.x, oy = B.y - (B.lift || 0) - MMO_BOARD.top * B.R;
  const x = dir * u, y = v; return [ox + x * Math.cos(a) - y * Math.sin(a), oy + x * Math.sin(a) + y * Math.cos(a)];
}

// ── THE TOON KICKFLIP: a body path (pure: the trails sample it at other times) ──────────────
// s: seconds into the move · o: the skate's o (h, toonJump in R) → { Hh (hips above the deck top, px), air (0..1: off the
// ground), syK (the keyed squash), lift, pitch, roll (the board), w (feet glued to the deck 0..1), phase, k }
MMO_SK.toon = { crouch: 0.32, pop: 0.07, air: 0.74, land: 0.6, jump: 3.0, bjump: 2.5, flips: 1, hang: 3.0, glue: 0.12, catch: [0.7, 0.88] };
function mmoToonFlipBody(s, o) {
  const h = o.h || 300, R = h / 8.9, P = Object.assign({}, MMO_SK.toon, o.toonP || {}), J = (o.toonJump === undefined ? P.jump : o.toonJump) * R;
  const a = P.crouch, b = a + P.pop, c = b + P.air, H0 = 3.88 * R, Hc = 2.55 * R, Hp = 5.0 * R;
  const out = { Hh: H0, air: 0, syK: 1, lift: 0, pitch: 0, roll: 0, w: 1, phase: 'glide', k: 0 };
  if (s < 0) return out;
  if (s < a) {                                       // the crouch: down, wide, loaded; the last fifth a moving hold
    const k = s / a, e = mmIO(Math.min(1, k / 0.8)), hold = Math.max(0, k - 0.8) / 0.2;
    out.Hh = mmLerp(H0, Hc, e) - 0.04 * R * Math.sin(Math.PI * hold); out.syK = 1 - 0.15 * e; out.phase = 'crouch'; out.k = k;
  } else if (s < b) {                                // the pop: the hips shoot up past standing, the feet stay on the deck
    const k = (s - a) / P.pop;
    out.Hh = mmLerp(Hc, Hp, mmOut(k)); out.syK = mmLerp(0.85, 1, k); out.pitch = 0.5 * mmOut(k); out.lift = 0.3 * R * k;
    out.air = k; out.phase = 'pop'; out.k = k;
  } else if (s < c) {                                // the air: up, HANG, down; the board flips under him
    const k = (s - b) / P.air;
    out.Hh = Hp + J * mmoHang(k, P.hang); out.air = 1; out.k = k;
    out.lift = (o.toonBJump === undefined ? P.bjump : o.toonBJump) * R * mmoHang(k, 2.0) + 0.3 * R * (1 - mmSmooth(mmC01(k / 0.25)));
    out.pitch = 0.5 * (1 - mmSmooth(mmC01(k / 0.4)));
    out.roll = -(o.dir || 1) * 2 * Math.PI * P.flips * mmIO(mmSeg(k, 0.1, 0.58));
    out.w = k < 0.3 ? 1 - mmSmooth(k / P.glue) : mmSmooth(mmSeg(k, P.catch[0], P.catch[1]));
    out.phase = k < 0.1 ? 'rise' : k < 0.58 ? 'flip' : k < P.catch[1] ? 'reach' : 'drop';
  } else {                                           // the landing: SPLAT, then past standing, then home
    const k = s - c;
    out.Hh = H0 - 1.45 * R * mmoSettle(k, 1, 13, 7.5);                 // the contact frame IS the splat (Chuck Jones: no in-between)
    out.syK = 1 - 0.3 * mmoSettle(k, 1, 17, 8); out.phase = k < 0.12 ? 'splat' : k < 0.3 ? 'rebound' : 'ride'; out.k = k;
  }
  return out;
}
// the whole toon kickflip on Mook: C (mookDraw), B (the board), F (feet: in C.foot already) at s seconds into the move.
// base: the glide's C and B at this moment (x, yaw, eyes …). Every soft thing trails the hips' path.
function mmoToonFlip(s, o, base) {
  const h = o.h || 300, R = h / 8.9, dir = o.dir || 1, P = Object.assign({}, MMO_SK.toon, o.toonP || {}), C = base.C, B = base.board;
  const Y0 = o.y || 0, deckTop = Y0 - (MMO_BOARD.top * R + MMO_BOARD.th * R * 0.5);
  const body = mmoToonFlipBody(s, o), hipY = (q) => deckTop - mmoToonFlipBody(q, o).Hh;
  // the hips' speed → the stretch (in the air only); the keyed squash on the ground
  const v = (hipY(s + 1 / 120) - hipY(s - 1 / 120)) * 60;
  const sy = body.syK * (1 + (mmoSpeedStretch(v, R, o.toonStretch) - 1) * body.air), SS = mmoSS(sy, o.toonVol);
  // the soft things: how far each trails the hips (px; + = below)
  const tA = mmoTrail(hipY, s, { hz: 2.2, damp: 0.3 }), tH = mmoTrail(hipY, s, { hz: 4.2, damp: 0.38 }), tS = mmoTrail(hipY, s, { hz: 1.6, damp: 0.22 });
  // the board
  Object.assign(B, { pitch: body.pitch, roll: body.roll, lift: body.lift });
  // the body: lean (forward into the crouch, back at the top: cool), squash, bob 0 (the hips carry it)
  const lean = dir * (body.phase === 'crouch' ? 0.07 * mmSmooth(body.k / 0.6) : body.phase === 'pop' ? 0.07 * (1 - body.k) : body.air ? -0.05 * Math.sin(Math.PI * body.k) : 0.03 * Math.exp(-body.k * 4));
  Object.assign(C, { sx: SS.sx, sy: SS.sy, lean, bob: 0, walk: undefined, hose: o.toonHose === undefined ? MMO_TOON.hose : o.toonHose, noodle: o.toonNoodle === undefined ? MMO_TOON.noodle : o.toonNoodle });
  mmoRootAt(C, B.x, deckTop - body.Hh);
  // the feet: glued to the deck (front foot at the nose bolts, back foot on the tail) or tucked up under him
  const fs = dir > 0 ? 'L' : 'R', u = { [fs]: 0.95 * R, [fs === 'L' ? 'R' : 'L']: -0.95 * R }, foot = {};
  for (const sd of ['R', 'L']) {
    const [X, Y] = mmoBoardPt(B, u[sd], -MMO_BOARD.th * R * 0.5), glued = mmoFootAt(C, sd, X, Y);
    const tuck = [(sd === 'R' ? -1 : 1) * MMO_MK.hipX * R, -2.6 * R + (sd === fs ? 0 : 0.3 * R), (sd === fs ? 1.0 : -0.3) * R];   // knees up
    foot[sd] = [0, 1, 2].map(i => mmLerp(tuck[i], glued[i], body.w));
  }
  C.foot = foot;
  // the arms: a pose for each beat (back to wind up, up on the pop, wide in the air, down on the splat), plus the trail
  const G = { R: [0.75, 1.55, 0.35, { spread: 1.2 }], L: [0.7, 1.6, 0.2, { spread: 1.2 }] };
  const Cr = { R: [0.45, 2.15, -0.95, { fist: 0.6 }], L: [0.45, 2.1, -1.05, { fist: 0.6 }] };
  const Up = { R: [1.5, -1.9, 0.3, { spread: 1.5 }], L: [1.4, -1.7, 0.1, { spread: 1.5 }] };
  const Out = { R: [2.0, 0.25, 0.3, { spread: 1.5 }], L: [1.9, 0.35, 0.1, { spread: 1.5 }] };
  const Dn = { R: [1.35, 1.2, 0.45, { spread: 1.4 }], L: [1.25, 1.3, 0.25, { spread: 1.4 }] };
  let pose;
  if (body.phase === 'crouch') pose = mkPoseMix(G, Cr, mmIO(Math.min(1, body.k / 0.8)));
  else if (body.phase === 'pop') pose = mkPoseMix(Cr, Up, mmOut(body.k));
  else if (body.air) pose = body.k < 0.3 ? mkPoseMix(Up, Out, mmIO(body.k / 0.3)) : body.k < 0.8 ? Out : mkPoseMix(Out, Dn, mmIO((body.k - 0.8) / 0.2));
  else pose = mkPoseMix(Dn, G, mmIO(mmC01(body.k / P.land)));
  const lagA = mmClamp(tA / R, -1.6, 1.2) * (o.toonArmLag === undefined ? 1 : o.toonArmLag), fl = 0.3 * Math.abs(lagA);   // a whip flings them out too
  pose = { R: [pose.R[0] + fl, pose.R[1] + lagA, pose.R[2], pose.R[3]], L: [pose.L[0] + fl, pose.L[1] + lagA * 0.9, pose.L[2], pose.L[3]] };
  C.pose = pose;
  // follow-through: the head arrives late, the strings and the hairs later still
  C.headDy = mmClamp(0.3 * tH / R, -0.12, 0.45);
  C.strings = [-dir * 0.15 * Math.abs(tS) / R, mmClamp(1.1 * tS / R, -1.6, 0.8)];
  C.sprigLag = mmClamp(-dir * 0.5 * tS / R, -0.9, 0.9);
  // the eyes: on the board through the flip, then out ahead; a slow blink once it's ridden out (cool)
  if (body.phase === 'crouch') C.eyes = { look: [dir * 0.3, 0.55], lid: 0.25 };
  else if (body.phase === 'pop' || body.air) C.eyes = { look: [dir * 0.15, 0.85], wide: body.phase === 'flip' ? 0.5 : 0.2 };
  else C.eyes = { look: [dir * 0.4, 0.05], lid: body.phase === 'ride' ? 0.18 : 0 };
  return { C, board: B, F: null, toon: { body, sy, v, tA, tH, tS } };
}
// multiples (Chuck Jones): a fast-spinning board leaves ghosts of where it just was
function mmoBoardMultiples(g, B, rollRate, n) {
  if (Math.abs(rollRate) < 4) return;
  const k = mmC01((Math.abs(rollRate) - 4) / 14);
  for (let i = n || 3; i >= 1; i--) {
    g.save(); g.globalAlpha = 0.16 * k * (1 - (i - 1) / (n || 3));
    mmoBoard(g, Object.assign({}, B, { roll: (B.roll || 0) - rollRate * 0.022 * i }));
    g.restore();
  }
}

// ── THE TOON SKATE: glide · the rubber-band push · the toon kickflip, on a slope ─────────
// Everything a skater does, on one clock, with the body hanging from its hips (mmoRootAt) and both feet put where they
// must be (mmoFootAt): on the deck, on the road, or tucked. The PUSH is a rubber band: the push foot sticks to the road
// and the leg stretches as the board runs on, until it can stretch no more — SNAP — the foot springs home and the board
// zips forward (the stretch was the push). On a slope the board lies along the road and he stands up out of it.
// o: { t0, x0, dir, h, y (the road under the board at x0, px), slope (the road on screen, rad: + = it falls to the
//      right), vb (cruise, ×h px/s: 0.9), script [[move, start (s after t0)], …] move 'push' | 'flip',
//      yaw (pushing: dir·1.3), yawGlide (dir·0.55), hose (1.75), noodle (0.6), wind (0..1, the ride's air: hair and
//      strings blown back), toonJump / toonBJump / toonP (the kickflip's dials, mmoToonFlipBody) }
// → { board: B, C (mookDraw; feet in C.foot), x, v, move, phase, body (mmoTSkBody), toon: { trails, rollRate } }
const MMO_TSK = { push: { reach: 0.16, plantMax: 0.55, snap: 0.15, back: 0.32, dv: 0.6, drop: 0.55, ahead: 0.4 } };
function mmoTSkDur(m, o) {
  if (m === 'flip') { const P = Object.assign({}, MMO_SK.toon, o.toonP || {}); return P.crouch + P.pop + P.air + P.land; }
  const P = MMO_TSK.push; return P.reach + P.plantMax + P.snap + P.back;
}
// the pushes' snap times (s after t0), in order: each foot lets go when its leg can stretch no more (or plantMax)
function mmoTSkSnaps(o) {
  const key = JSON.stringify([o.script, o.h, o.vb, o.hose]);
  if (o.__snaps && o.__snapsKey === key) return o.__snaps;
  const h = o.h || 300, R = h / 8.9, P = MMO_TSK.push, hose = o.hose === undefined ? MMO_TOON.hose : o.hose;
  const deckH = MMO_BOARD.top * R + MMO_BOARD.th * R * 0.5, hipH = 3.88 * R - P.drop * R + deckH;
  const Lmax = Math.sqrt(Math.max(0, Math.pow(0.9 * hose * 4.15 * R, 2) - hipH * hipH));
  const out = []; o.__snaps = out; o.__snapsKey = key;            // filled in order: a push only sees the snaps before it
  for (const [m, s0] of (o.script || [])) if (m === 'push') {
    const a = s0 + P.reach, v = mmoTSkSpeed(a, o);
    out.push({ s0, a, sn: a + Math.min(P.plantMax, (Lmax + P.ahead * R) / Math.max(1, v)) });
  }
  return out;
}
function mmoTSkSpeed(tau, o) {
  const h = o.h || 300, vb = (o.vb === undefined ? 0.9 : o.vb) * h, P = MMO_TSK.push;
  let v = vb;
  for (const q of (o.__snaps || [])) if (tau > q.sn) v += P.dv * h * mmSmooth(mmSeg(tau, q.sn, q.sn + 0.1)) * Math.exp(-Math.max(0, tau - q.sn - 0.1) / 2.0);
  return v;
}
function mmoTSkX(tau, o) {
  mmoTSkSnaps(o);
  const n = Math.max(8, Math.ceil(tau * 40)), dt = tau / n;
  let x = 0; for (let i = 0; i < n; i++) x += mmoTSkSpeed((i + 0.5) * dt, o) * dt;
  return x;
}
// the body's path (pure: the trails sample it at other times) → { X, Y (the board on the road), Hh (hips above the deck
// top), pitch / lift / roll (the board's own, before the slope), w (feet on the deck in a flip), syK, air, move, s, phase, k }
function mmoTSkBody(tau, o) {
  const h = o.h || 300, R = h / 8.9, dir = o.dir || 1, th = o.slope || 0;
  const snaps = mmoTSkSnaps(o), X = (o.x0 || 0) + dir * mmoTSkX(Math.max(0, tau), o), Y = (o.y || 0) + Math.tan(th) * (X - (o.x0 || 0));
  const out = { X, Y, Hh: 3.88 * R, pitch: 0, lift: 0, roll: 0, w: 1, syK: 1, air: 0, move: 'glide', s: 0, phase: 'glide', k: 0 };
  let move = 'glide', k0 = 0;
  for (const [m, s0] of (o.script || [])) if (tau >= s0 && tau < s0 + mmoTSkDur(m, o)) { move = m; k0 = s0; }
  const s = tau - k0; out.move = move; out.s = s;
  out.Hh += 0.05 * R * Math.sin(tau * 2 * Math.PI / 1.9);                        // the glide's slow sway (he is cool)
  if (move === 'flip') {
    const F = mmoToonFlipBody(s, o);
    Object.assign(out, { Hh: F.Hh, pitch: F.pitch, lift: F.lift, roll: F.roll, w: F.w, syK: F.syK, air: F.air, phase: F.phase, k: F.k });
  } else if (move === 'push') {
    const P = MMO_TSK.push, q = snaps.find(z => Math.abs(z.s0 - k0) < 1e-9), a = P.reach, sn = q.sn - k0, c = sn + P.snap;
    if (s < a) { out.phase = 'reach'; out.k = s / a; out.Hh -= P.drop * R * mmIO(s / a); }
    else if (s < sn) { out.phase = 'push'; out.k = (s - a) / (sn - a); out.Hh -= P.drop * R; }
    else if (s < c) { out.phase = 'SNAP'; out.k = (s - sn) / P.snap; out.Hh -= P.drop * R * (1 - mmOut(out.k)) - 0.45 * R * mmoSettle(s - sn, 1, 18, 7) * mmSmooth(out.k / 0.3); out.syK = 1 + 0.08 * Math.sin(Math.PI * out.k); }
    else { out.phase = 'settle'; out.k = (s - c) / P.back; out.Hh += 0.45 * R * mmoSettle(s - sn, 1, 18, 7); }
    out.push = { a, sn, c, xP: (o.x0 || 0) + dir * mmoTSkX(k0 + a, o) + dir * P.ahead * R };
  }
  return out;
}
function mmoToonSkate(t, o) {
  o = o || {};
  const h = o.h || 300, R = h / 8.9, dir = o.dir || 1, tau = Math.max(0, t - (o.t0 || 0)), th = o.slope || 0;
  const Bd = MMO_BOARD, deckH = Bd.top * R + Bd.th * R * 0.5, b = mmoTSkBody(tau, o);
  const B = { x: b.X, y: b.Y, R, dir, pitch: -dir * th + b.pitch, roll: b.roll, lift: b.lift, spin: -dir * b.X / (Bd.wheel * R), t };
  // the hips, and their path for the trails (screen px)
  const hipAt = (q) => { const z = mmoTSkBody(q, o); return [z.X, z.Y - deckH - z.Hh]; };
  const hx = (q) => hipAt(q)[0], hy = (q) => hipAt(q)[1];
  const vy = (hy(tau + 1 / 120) - hy(tau - 1 / 120)) * 60, v = mmoTSkSpeed(tau, o);
  const sy = b.syK * (1 + (mmoSpeedStretch(vy, R, o.toonStretch) - 1) * b.air), SS = mmoSS(sy, o.toonVol);
  const tr = { ax: mmoTrail(hx, tau, { hz: 2.0, damp: 0.3 }), ay: mmoTrail(hy, tau, { hz: 2.2, damp: 0.3 }), hd: mmoTrail(hy, tau, { hz: 4.2, damp: 0.38 }),
               sx: mmoTrail(hx, tau, { hz: 1.6, damp: 0.22 }), sy: mmoTrail(hy, tau, { hz: 1.6, damp: 0.22 }) };
  // facing: profile to push, open to us to glide and to flip (the head leads the turn)
  const yawP = o.yaw === undefined ? dir * 1.3 : o.yaw, yawG = o.yawGlide === undefined ? dir * 0.55 : o.yawGlide;
  let kP = 0;
  if (b.move === 'push') { const p = b.push; kP = b.s < p.a ? mmSmooth(b.s / p.a) : b.s < p.c ? 1 : 1 - mmSmooth((b.s - p.c) / MMO_TSK.push.back); }
  const yaw = mmLerp(yawG, yawP, kP), headTurn = (mmLerp(yawG, yawP, b.move === 'push' ? Math.min(1, kP * 1.3) : 0) - yaw);
  const C = { h, yaw, headTurn, t, seed: 1, blink: o.blink, bob: 0, sx: SS.sx, sy: SS.sy,
              hose: o.hose === undefined ? MMO_TOON.hose : o.hose, noodle: o.noodle === undefined ? MMO_TOON.noodle : o.noodle };
  // lean: into the crouch, back at the top of a flip (cool), forward into a push, a little into the hill
  let lean = dir * 0.03;
  if (b.move === 'flip') lean = dir * (b.phase === 'crouch' ? 0.07 * mmSmooth(b.k / 0.6) : b.phase === 'pop' ? 0.07 * (1 - b.k) : b.air ? -0.05 * Math.sin(Math.PI * b.k) : 0.03 * Math.exp(-b.k * 4));
  if (b.move === 'push') lean = dir * (0.03 + 0.12 * kP * (b.phase === 'SNAP' || b.phase === 'settle' ? 1 - mmSmooth(b.k) : 1));
  C.lean = lean;
  mmoRootAt(C, b.X, b.Y - deckH - b.Hh);
  // the feet: on the deck (front foot by the nose bolts, back foot on the tail), tucked in the air, or pushing the road
  const fs = dir > 0 ? 'L' : 'R', bs = fs === 'L' ? 'R' : 'L', u = { [fs]: 0.95 * R, [bs]: -0.95 * R }, foot = {};
  for (const sd of ['R', 'L']) {
    const [X, Y] = mmoBoardPt(B, u[sd], -Bd.th * R * 0.5);
    let tgt = mmoFootAt(C, sd, X, Y);
    if (b.move === 'flip' && b.w < 1) {
      const tuck = [(sd === 'R' ? -1 : 1) * MMO_MK.hipX * R, -2.6 * R + (sd === fs ? 0 : 0.3 * R), (sd === fs ? 1.0 : -0.3) * R];
      tgt = [0, 1, 2].map(i => mmLerp(tuck[i], tgt[i], b.w));
    }
    if (b.move === 'push' && sd === bs) {
      const p = b.push, ground = (x) => (o.y || 0) + Math.tan(th) * (x - (o.x0 || 0)) - 0.02 * R;
      const xT = X, yT = Y, xR = (b.s < p.a ? mmLerp(xT, p.xP, mmIO(b.s / p.a)) : p.xP);
      let fx, fy;
      if (b.s < p.a) { const k = b.s / p.a; fx = xR; fy = mmLerp(yT, ground(p.xP), mmIn(k)) - 0.55 * R * Math.sin(Math.PI * Math.min(1, k * 1.1)); }
      else if (b.s < p.sn) { fx = p.xP; fy = ground(p.xP); }                                         // stuck to the road
      else if (b.s < p.c) { const k = (b.s - p.sn) / MMO_TSK.push.snap, e = mmoOver(k, 0.3, 0.55);      // SNAP: home, past it, back
        fx = mmLerp(p.xP, xT, e); fy = mmLerp(ground(p.xP), yT, e) - 1.3 * R * Math.sin(Math.PI * Math.min(1, k * 1.15)); }
      else { fx = xT; fy = yT; }
      tgt = mmoFootAt(C, sd, fx, fy);
    }
    foot[sd] = tgt;
  }
  C.foot = foot;
  // the arms: a pose for each beat, plus the trail (back when he zips forward, down when he lands, up when he falls)
  const G = { R: [0.75, 1.55, 0.35, { spread: 1.2 }], L: [0.7, 1.6, 0.2, { spread: 1.2 }] };
  let pose = G;
  if (b.move === 'flip') {
    const Cr = { R: [0.45, 2.15, -0.95, { fist: 0.6 }], L: [0.45, 2.1, -1.05, { fist: 0.6 }] }, Up = { R: [1.5, -1.9, 0.3, { spread: 1.5 }], L: [1.4, -1.7, 0.1, { spread: 1.5 }] };
    const Out = { R: [2.0, 0.25, 0.3, { spread: 1.5 }], L: [1.9, 0.35, 0.1, { spread: 1.5 }] }, Dn = { R: [1.35, 1.2, 0.45, { spread: 1.4 }], L: [1.25, 1.3, 0.25, { spread: 1.4 }] };
    const P = Object.assign({}, MMO_SK.toon, o.toonP || {});
    if (b.phase === 'crouch') pose = mkPoseMix(G, Cr, mmIO(Math.min(1, b.k / 0.8)));
    else if (b.phase === 'pop') pose = mkPoseMix(Cr, Up, mmOut(b.k));
    else if (b.air) pose = b.k < 0.3 ? mkPoseMix(Up, Out, mmIO(b.k / 0.3)) : b.k < 0.8 ? Out : mkPoseMix(Out, Dn, mmIO((b.k - 0.8) / 0.2));
    else pose = mkPoseMix(Dn, G, mmIO(mmC01(b.k / P.land)));
  } else if (b.move === 'push') {
    const sw = Math.sin(Math.PI * mmC01(b.phase === 'reach' ? b.k * 0.5 : b.phase === 'push' ? 0.5 + 0.5 * b.k : 1));
    pose = { R: [0.6, 1.6, 0.4 + (bs === 'R' ? 1 : -1) * 0.9 * sw, {}], L: [0.6, 1.6, 0.4 - (bs === 'R' ? 1 : -1) * 0.9 * sw, {}] };
    pose = mkPoseMix(pose, G, b.phase === 'settle' ? mmSmooth(b.k) : 0);
  }
  const syaw = Math.abs(Math.sin(yaw)) < 0.3 ? (Math.sin(yaw) >= 0 ? 0.3 : -0.3) : Math.sin(yaw);
  const lagY = mmClamp(tr.ay / R, -1.6, 1.2), lagZ = mmClamp(tr.ax / R / syaw, -2.0, 2.0), fl = 0.3 * Math.abs(lagY);
  C.pose = { R: [pose.R[0] + fl, pose.R[1] + lagY, pose.R[2] + lagZ, pose.R[3]], L: [pose.L[0] + fl, pose.L[1] + lagY * 0.9, pose.L[2] + lagZ, pose.L[3]] };
  // follow-through, and the ride's wind: the head arrives late, the strings and the hairs later still, blown back
  const wind = o.wind || 0;
  C.headDy = mmClamp(0.3 * tr.hd / R, -0.12, 0.45);
  C.strings = [mmClamp(0.8 * tr.sx / R - dir * 0.6 * wind, -1.2, 1.2), mmClamp(1.1 * tr.sy / R - 0.25 * wind, -1.6, 0.8)];
  C.sprigLag = mmClamp(0.5 * tr.sx / R - dir * 0.35 * wind, -0.9, 0.9);
  // the eyes: down the road; on the board through a flip; at the road for the push
  if (b.move === 'flip') C.eyes = b.phase === 'crouch' ? { look: [dir * 0.3, 0.55], lid: 0.25 } : (b.phase === 'pop' || b.air) ? { look: [dir * 0.15, 0.85], wide: b.phase === 'flip' ? 0.5 : 0.2 } : { look: [dir * 0.4, 0.05], lid: b.phase === 'ride' ? 0.18 : 0 };
  else if (b.move === 'push') C.eyes = { look: [dir * 0.5, 0.2] };
  else C.eyes = { look: [dir * 0.45, 0.0], lid: 0.12 };
  const e = 1 / 120, rollRate = b.move === 'flip' ? (mmoTSkBody(tau + e, o).roll - mmoTSkBody(tau - e, o).roll) / (2 * e) : 0;
  return { board: B, C, x: b.X, v, move: b.move, phase: b.phase, body: b, toon: { trails: tr, rollRate, sy, vy } };
}
// draw it: shadows, multiples on a flip, the board, Mook (one pass: his feet are in C.foot)
function mmoToonSkateDraw(g, S, o) {
  const B = S.board, R = B.R;
  o = o || {};
  if (o.shadow !== false) {
    mmoShadowAt(g, B.x, B.y, MMO_BOARD.len * R * 0.55, (B.lift || 0) / (4 * R));
    const up = (B.y - (S.C.y - 4.2 * R * (S.C.sy || 1))) / (4 * R) - 1.3;
    mmoShadowAt(g, S.C.x, B.y, 1.6 * R, Math.max(0, up));
  }
  mmoBoardMultiples(g, B, S.toon.rollRate || 0, 3);
  mmoBoard(g, B);
  return mookDraw(g, S.C);
}

// ═══════════════════════════════════════════════════════════════════════════════════════
//  TV GURL ON A BOARD (EP3 scene 3: "Mush bounces along; TV Gurl rolls"; 🎬 the board is mine: the outline says
//  "skateboards and a bike"). She stands on the deck, tilts with it, her cord streams back; a crack in the road kicks
//  her up a little (squash on the bump, stretch off it, land, settle).
//  o: { t0, dir, h (her height px), y (the road under the board), slope (rad on screen), bumps: [t, …] (s), hopH (×h: 0.25),
//       wind (0..1: 1) } → { board: B (mmoBoard), C (dhTvTurn's call: x, y, h, yaw, lean, sx, sy, wind …) }
function mmoTvSkate(t, o) {
  o = o || {};
  const h = o.h || 200, dir = o.dir || 1, th = o.slope || 0, R = o.boardR || h * 1.2 / (0.47 * 1.2) / 8.9;   // the board is Mook's board: R from Mook's height
  const Bd = MMO_BOARD, deckH = Bd.top * R + Bd.th * R * 0.5, tau = t - (o.t0 || 0);
  let lift = 0, sq = 0, k = 0;
  for (const b of (o.bumps || [])) {                               // a crack: a little ollie, the board and her together
    const s = tau - b, A = 0.12, T = 0.36;
    if (s > -A && s < 0) sq += 0.12 * Math.sin(Math.PI * (s + A) / A);                     // she dips: anticipation
    else if (s >= 0 && s < T) { k = s / T; lift += (o.hopH === undefined ? 0.25 : o.hopH) * h * mmoHang(k, 2.4); sq -= 0.18 * Math.sin(Math.PI * Math.min(1, k * 2)) * (k < 0.5 ? 1 : 0); }
    else if (s >= T && s < T + 0.6) sq += 0.2 * mmoSettle(s - T, 1, 18, 8);                // SPLAT, settle
  }
  const B = { x: 0, y: o.y || 0, R, dir, pitch: -dir * th - (lift > 0 ? 0.25 * Math.sin(Math.PI * Math.min(1, k * 1.4)) * dir * 0 : 0), roll: 0, lift, spin: -dir * tau * 6, t, seed: 2 };
  const sy = 1 - mmClamp(sq, -0.4, 0.4), sx = Math.pow(sy, -0.5);
  const C = { x: 0, y: (o.y || 0) - deckH - lift, h, yaw: o.yaw === undefined ? dir * 0.9 : o.yaw, t, seed: 3, sides: 'stripes', depth: 0.32,
              screen: o.screen || { mode: 'face' }, lean: th, sx, sy, wind: o.wind === undefined ? 1 : o.wind };
  return { board: B, C };
}

// ═══════════════════════════════════════════════════════════════════════════════════════
//  FINLEY'S BIKE (EP3 scene 3: "Skateboards and a bike"; the book: Finley has a bike). 🎬 the bike is mine: a little
//  BMX sized to HER (her legs are short: hip to ankle 0.29 H), in her colours (blue frame, red fork: her one flip).
//  Bike space: x forward from her origin, y UP from the road, both in her height H. B: { x, y (the road under her),
//  H (px), dir, slope (the road on screen, rad), spin (the wheels' turn, rad), phi (the cranks', rad), t }
// ═══════════════════════════════════════════════════════════════════════════════════════
const MMO_BIKE = { r: 0.165, rearX: -0.37, frontX: 0.3, bbX: -0.03, bbY: 0.13, crank: 0.058, seat: [-0.17, 0.4], head: [0.215, 0.36], bar: [0.205, 0.53], grip: 0.03, barW: 0.13, pedW: 0.075 };
// bike space (fwd, up, lat: her left +) → screen. B.yaw (default dir·π/2: side-on) turns it like her rig turns her (fnPr):
// screen x = lat·cos(yaw) + fwd·sin(yaw); B.slope tilts the whole bike with the road. (Her rig is turned by the same yaw.)
function mmoBikePt(B, x, y, lat) {
  const yaw = B.yaw === undefined ? (B.dir || 1) * Math.PI / 2 : B.yaw, H = B.H;
  const c = Math.cos(B.slope || 0), s = Math.sin(B.slope || 0), X = ((lat || 0) * Math.cos(yaw) + x * Math.sin(yaw)) * H, Y = -y * H;
  return [B.x + X * c - Y * s, B.y + X * s + Y * c];
}
function mmoBikeDepth(B, x, lat) { const yaw = B.yaw === undefined ? (B.dir || 1) * Math.PI / 2 : B.yaw; return -(lat || 0) * Math.sin(yaw) + x * Math.cos(yaw); }
function mmoBikePedalB(B, side) {                     // a pedal in bike space: [fwd, up, lat]; 'near' is the side toward us
  const K = MMO_BIKE, a = (B.phi || 0) + (side === 'far' ? Math.PI : 0), yaw = B.yaw === undefined ? (B.dir || 1) * Math.PI / 2 : B.yaw;
  const nearLat = -Math.sign(Math.sin(yaw) || 1) * 1;                  // which lateral side faces the camera (depth > 0)
  const lat = (side === 'near' ? nearLat : -nearLat) * K.pedW;
  return [K.bbX + K.crank * Math.cos(a), K.bbY - K.crank * Math.sin(a), lat];
}
function mmoBikePedal(B, side) { const p = mmoBikePedalB(B, side); return mmoBikePt(B, p[0], p[1], p[2]); }
function mmoBikeDraw(g, B, layer) {
  const K = MMO_BIKE, H = B.H, P = (x, y, l) => mmoBikePt(B, x, y, l), bk = mmBoil(B.t || 0) + 61;
  const yaw = B.yaw === undefined ? (B.dir || 1) * Math.PI / 2 : B.yaw, side = Math.abs(Math.sin(yaw)), sl = B.slope || 0;
  const lw = Math.max(1.3, H * 0.0096), amp = Math.max(0.3, H * 0.0022), tw = 0.024 * H;
  const crank = (sd) => {
    const bb = P(K.bbX, K.bbY, 0), q = mmoBikePedalB(B, sd), pd = P(q[0], q[1], q[2]), pa = P(q[0], q[1], 0);
    mmTube(g, [bb, pa], 0.016 * H, MM.fnGrey, lw * 0.8, { amp: amp * 0.4, seed: 641 + (sd === 'far'), bk });
    const ca = Math.cos(sl), sa = Math.sin(sl), hw = 0.034 * H * Math.max(0.25, side), hh = 0.011 * H;   // the pedal: level with the bike
    mmInk(g, [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(([u, v]) => [pd[0] + u * ca - v * sa, pd[1] + u * sa + v * ca]), { fill: '#2a2730', lw: lw * 0.8, poly: true });
  };
  if (layer === 'front') { crank('near'); return; }
  crank('far');
  // the wheels: ellipses in the bike's plane (round side-on, a sliver from behind), spokes that turn (arcs when fast)
  const wheels = [K.rearX, K.frontX].map(wx => ({ wx, d: mmoBikeDepth(B, wx, 0) })).sort((a, b) => a.d - b.d);
  for (const W of wheels) {
    const c = P(W.wx, K.r, 0), R = K.r * H, rx = Math.max(0.07, side) * R;
    const ell = (k, n, sd) => { const Q = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, x = Math.cos(a) * rx * k, y = Math.sin(a) * R * k; Q.push([c[0] + x * Math.cos(sl) - y * Math.sin(sl), c[1] + x * Math.sin(sl) + y * Math.cos(sl)]); } return Q; };
    mmInk(g, ell(1, 26, 651), { fill: '#2a2730', lw, amp: amp * 0.6, seed: 652, bk });
    if (side > 0.2) {
      mmInk(g, ell(0.78, 22), { fill: MM.fnGrey, lw: lw * 0.7 });
      mmInk(g, ell(0.66, 22), { fill: mmMix(MM.fnGrey, '#ffffff', 0.45), lw: lw * 0.5 });
      const spin = (B.spin || 0) * (B.dir || 1), fast = Math.abs(B.spinRate || 0) > 14;
      g.save(); g.translate(c[0], c[1]); g.rotate(sl); g.scale(Math.max(0.07, side), 1); g.strokeStyle = MM.ink; g.lineWidth = Math.max(1, lw * 0.45);
      if (fast) { g.globalAlpha = 0.55; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(0, 0, R * (0.2 + 0.11 * i), spin + i * 1.3, spin + i * 1.3 + 1.9); g.stroke(); } }
      else { g.beginPath(); for (let i = 0; i < 8; i++) { const a = spin + i * Math.PI / 4; g.moveTo(0, 0); g.lineTo(Math.cos(a) * R * 0.66, Math.sin(a) * R * 0.66); } g.stroke(); }
      g.restore();
      mmDot(g, c[0], c[1], 0.028 * H, '#2a2730');
    }
  }
  // the frame (blue), the fork and the bars (red: her one flip), the saddle and grips (dark)
  const rear = P(K.rearX, K.r, 0), front = P(K.frontX, K.r, 0), bb = P(K.bbX, K.bbY, 0), st = P(K.seat[0] + 0.02, K.seat[1] - 0.05, 0), hd = P(K.head[0], K.head[1], 0), hb = P(K.head[0] - 0.02, K.head[1] - 0.09, 0);
  mmTube(g, [rear, bb], tw * 0.8, MM.fnBlue, lw, { amp, seed: 661, bk });                    // chain stay
  mmTube(g, [rear, st], tw * 0.8, MM.fnBlue, lw, { amp, seed: 662, bk });                    // seat stay
  mmTube(g, [bb, st], tw, MM.fnBlue, lw, { amp, seed: 663, bk });                           // seat tube
  mmTube(g, [st, hd], tw, MM.fnBlue, lw, { amp, seed: 664, bk });                           // top tube
  mmTube(g, [bb, hb], tw * 1.1, MM.fnBlue, lw, { amp, seed: 665, bk });                     // down tube
  mmTube(g, [front, hb, hd], tw * 0.9, MM.fnRed, lw, { amp, seed: 666, bk });               // the fork, up through the head tube
  const bar = P(K.bar[0], K.bar[1], 0);
  mmTube(g, [hd, P(K.bar[0] - 0.005, K.bar[1] - 0.06, 0), bar], tw * 0.75, MM.fnRed, lw, { amp, seed: 667, bk });   // the stem
  mmTube(g, [P(K.bar[0] + K.grip * 0.5, K.bar[1] - 0.005, -K.barW), bar, P(K.bar[0] + K.grip * 0.5, K.bar[1] - 0.005, K.barW)], tw * 0.75, MM.fnRed, lw, { amp, seed: 668, bk });   // the bar, end to end
  mmDot(g, bb[0], bb[1], 0.045 * H * Math.max(0.3, side), MM.fnGrey);                       // the chainring
  const s0 = P(K.seat[0] - 0.07, K.seat[1], 0), s1 = P(K.seat[0] + 0.06, K.seat[1] + 0.005, 0), s2 = P(K.seat[0] + 0.05, K.seat[1] - 0.025, 0), s3 = P(K.seat[0] - 0.07, K.seat[1] - 0.02, 0);
  mmTube(g, [P(K.seat[0] + 0.01, K.seat[1] - 0.02, 0), st], tw * 0.6, MM.fnGrey, lw * 0.8, { amp: amp * 0.5, seed: 670, bk });   // the seat post
  if (side > 0.3) mmInk(g, [s0, s1, s2, s3], { fill: '#2a2730', lw, amp: amp * 0.5, seed: 671, bk, poly: false });
  else mmInk(g, mmCirclePts((s0[0] + s1[0]) / 2, (s0[1] + s1[1]) / 2, 0.045 * H, 0.016 * H, 12, sl, 0, 672), { fill: '#2a2730', lw });   // the saddle, end-on
}
// FINLEY RIDES: on the saddle, her hands on the grips, her feet on the pedals; at liftAt she kicks her legs OUT and lets
// the pedals whirl (Dwarf does the work: "it's always pulling you down hill in any direction"), her hair streaming back.
// Every target is worked out in her own body space (the bike's space IS hers: forward, up, her left), so it holds from any
// side; the lean (her rig tilts her upper body on screen) is a pitch only side-on, so it fades as she turns away.
// o: { t0, dir, yaw (default dir·1.32), H (px), slope, dist (m → the wheels), mPerH (her height in m), liftAt (s), gear (2.2) }
//   → { B (the bike), C (finleyDraw's call), legsOut (0..1) }
function mmoFinleyRide(t, o) {
  o = o || {};
  const H = o.H || 282, dir = o.dir || 1, K = MMO_BIKE, G = typeof FN_GEO !== 'undefined' ? FN_GEO : { hipY: 0.615, ankleY: 0.905, shY: 0.358, shX: 0.083, upperL: 0.13, foreL: 0.125, hipX: 0.05 };
  const mH = o.mPerH || 1.128, dist = o.dist || 0, rM = K.r * mH, tau = t - (o.t0 || 0), la = o.liftAt === undefined ? 1e9 : o.liftAt;
  const yaw = o.yaw === undefined ? dir * 1.32 : o.yaw, side = Math.sin(yaw);
  // legs out: a dip (anticipation), up and out past it, settle (the joy is in the overshoot)
  const lo = mmoAAO(mmSeg(tau, la - 0.08, la + 0.42), { a: 0.25, o: 0.18, pa: 0.25, pb: 0.6 });
  const spinRate = (o.v || 3.4) / rM, phi = dist / (rM * (o.gear || 2.2)) + (tau > la ? 6.5 * Math.pow(tau - la, 1.6) : 0);
  const B = { x: 0, y: 0, H, dir, yaw, slope: o.slope || 0, spin: dist / rM, spinRate, phi, t };
  const leanP = 0.2 - 0.06 * mmC01(lo), lean = Math.sign(side || 1) * leanP * Math.abs(side);
  const hip = [0, K.seat[1] + 0.03 - (1 - G.hipY), K.seat[0]];
  const C = { x: 0, y: 0, h: H, yaw, t, seed: 4, colours: 'aug', tilt: o.slope || 0, lean, expr: o.expr || (lo > 0.5 ? 'happy' : 'neutral'), hip };
  // feet: on the pedals (the ankle ~0.1 H above the pedal), or OUT (forward and up, straight)
  const near = Math.sin(yaw) >= 0 ? 'R' : 'L', feet = {}, toe = {};
  for (const s of ['R', 'L']) {
    const q = mmoBikePedalB(B, s === near ? 'near' : 'far');
    const pz = q[0], py = q[1] + 0.1 - (1 - G.ankleY);
    const out = [0, 0.4 + (s === near ? -0.04 : 0.03), 0.12 + (s === near ? 0.03 : 0)];
    const k = mmClamp(lo, -0.3, 1.25);
    feet[s] = [0, mmLerp(py, out[1], k) - (k < 0 ? 0.02 * k : 0), mmLerp(pz, out[2], Math.max(0, k))];
    toe[s] = k > 0 ? 0.5 * k : 0;
  }
  C.feet = feet; C.toe = toe;
  // hands on the grips. The rig turns her upper body by the lean about her hip pivot: side-on that is a pitch (forward), so the
  // grip is turned back by the same pitch first; the upper body's offset (hip) is taken off; what is left is the arm's target
  const Larm = (G.upperL + G.foreL) * H, pose = {}, a = leanP * Math.abs(side);
  const pvU = (1 - G.hipY) + hip[1], pvZ = hip[2];                               // the pivot: up, fwd (H)
  for (const s of ['R', 'L']) {
    const outS = s === 'R' ? -1 : 1, gu = K.bar[1] - 0.005, gz = K.bar[0] + K.grip * 0.5;
    const dz = gz - pvZ, du = gu - pvU, zu = pvZ + dz * Math.cos(a) - du * Math.sin(a), uu = pvU + dz * Math.sin(a) + du * Math.cos(a);
    const X = outS * (G.shX + 0.03) * H, S1 = -(1 - G.shY) * H, S0 = outS * G.shX * H;
    const Hy = (-uu + hip[1]) * H, Hz = (zu - hip[2]) * H;
    pose[s] = [(X - S0) * outS / Larm, (Hy - S1) / Larm, Hz / Larm, { fist: 0.85 }];
  }
  C.pose = pose;
  return { B, C, legsOut: lo };
}
// Finley riding, drawn: the bike's far side, her, her backpack with PUFF riding in it (🎬 the pack is the storyboard's: green;
// Puff peeks over it: no arms, as in all his drawings; her bow flutters in the wind and she bounces on the bumps), the near crank.
// o: { puff (true), wind (0..1), bump (0..1: the pack jolts) }
function mmoFinleyRideDraw(g, R, o) {
  o = o || {};
  const B = R.B, C = R.C, H = C.h, t = C.t || 0, dir = B.dir || 1, wind = o.wind === undefined ? 1 : o.wind;
  mmoBikeDraw(g, B, 'back');
  // her hair in the wind: the whole mass pulled back and lifted (Brave: the curls keep their curl, the core takes the wind)
  const flut = 0.12 * Math.sin(t * 17) + 0.07 * Math.sin(t * 29 + 1);
  C.hair = { lag: [0.15 * flut, 0.35 * wind, -(1.35 + flut) * wind], lift: 0.28 * wind + 0.05 * flut, spin: 0 };
  // seen from the front her back (and the pack, and Puff) is behind her: lay them down first (EP3: the front-tracking shots)
  const packBehind = o.puff !== false && Math.cos(C.yaw || 0) > 0.2;
  if (packBehind) { const F0 = finleyDraw(mmoNullG(), C); mmoFinleyPack(g, C, F0, Object.assign({ puffPeek: mmC01((Math.cos(C.yaw || 0) - 0.9) / 0.08) }, o)); }
  const F = finleyDraw(g, C);
  if (!packBehind) mmoFinleyPack(g, C, F, o);
  mmoBikeDraw(g, B, 'front');
  return F;
}
// her backpack with PUFF riding in it (any pose: it hangs on her upper body through F.upperAt)
function mmoFinleyPack(g, C, F, o) {
  o = o || {};
  const H = C.h, t = C.t || 0, dir = Math.sin(C.yaw || 0) >= 0 ? 1 : -1, wind = o.wind === undefined ? 1 : o.wind;
  if (o.puff !== false && F && F.upperAt) {
    const G = FN_GEO, up = (y, z, x) => F.upperAt([x || 0, -(1 - y) * H, z * H]);
    // the pack: a box on her back (two corners on the back, two out behind), turned with her lean
    const a0 = up(0.39, -0.1), a1 = up(0.6, -0.1), b0 = up(0.39, -0.33), b1 = up(0.6, -0.33);
    const jolt = (o.bump || 0) * 0.02 * H;
    // PUFF first (the pack's front covers her boots and the bottom of her ball)
    const cx = (a0[0] + b0[0]) / 2, cyTop = (a0[1] + b0[1]) / 2, ph = 0.36 * H, aP = ph / 4.1;
    const bounce = Math.abs(Math.sin(t * 7.3)) * 0.12 * aP + jolt;
    const duck = mmC01(o.puffDuck || 0);                                      // EP3 (opt-in): she ducks down into the pack, only the bow showing
    const peek = mmC01(o.puffPeek || 0);                                     // EP3 (opt-in): from the front she leans out round Finley's head
    if (!o.empty) {                                                          // EP3 S12.12 (opt-in): the pack without Puff (he is out on the grass)
      if (peek > 0) { const yTop = Math.min(a0[1], b0[1]); g.save(); g.beginPath(); g.rect(-1e4, -1e4, 2e4, 1e4 + yTop + 0.02 * H); g.clip(); }   // she's IN the pack: nothing below its mouth
      else { const yBot = Math.max(a1[1], b1[1]); g.save(); g.beginPath(); g.rect(-1e4, -1e4, 2e4, 1e4 + yBot - 0.01 * H); g.clip(); }       // (EP3 s2) ducked down, her boots stay inside the pack
      puffDraw(g, { x: cx + dir * 0.01 * H + peek * 0.2 * H, y: cyTop + 2.25 * aP - bounce + duck * 0.62 * ph - peek * 0.06 * H, h: ph, yaw: dir * 0.85 - peek * 0.7, t, seed: 5, pose: 'stand',
                    look: o.puffLook || [0.45, -0.35], mouth: o.puffMouth || 'smile', bowWilt: -0.25 * wind + 0.2 * Math.sin(t * 21) + duck * 0.25 * Math.sin(t * 47), tilt: -dir * 0.08 });
      g.restore();
    }
    const P = [a0, b0, b1, a1], lw = Math.max(1.5, H * 0.0096);
    mmInk(g, P, { fill: '#7aa37a', lw, amp: Math.max(0.3, H * 0.002), seed: 681, bk: mmBoil(t), poly: true });
    const f0 = up(0.39, -0.2), f1 = up(0.47, -0.2), f2 = up(0.47, -0.33);
    mmInk(g, [a0, b0, f2, f1, up(0.47, -0.1)], { fill: '#5f8a62', lw: lw * 0.9, poly: true });          // the flap
    mmTube(g, [up(0.4, -0.1, -0.05), up(0.365, -0.02, -0.06), up(0.39, 0.05, -0.06), up(0.46, 0.04, -0.06)], 0.016 * H, '#5f8a62', lw * 0.8);   // the near strap, over her shoulder
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
//  THE DIVE (S11.04, "Everybody dives into the empty pool", slow motion). Three tools any rig can use:
//   mmoRamp: a speed ramp (the camera's slow motion): shot time → action time, from rate keys
//   mmoArc: a body thrown along an arc: its centre on the path, turned (lean) from take-off to landing, stretched by speed
//   mmoToonRun: the cartoon run (the feet go round in big wheels under him: Bugs Bunny's run; the arms pump)
// ═══════════════════════════════════════════════════════════════════════════════════════
// K: [[t, rate], …] (rate linear between keys, constant past the ends) → action time at shot time t (exact: trapezoids)
function mmoRamp(t, K) {
  let a = 0, tp = Math.min(t, K[0][0]); a += tp - 0 > 0 ? tp * K[0][1] : 0;
  if (t <= K[0][0]) return t * K[0][1];
  for (let i = 1; i < K.length; i++) {
    const t0 = K[i - 1][0], t1 = K[i][0], r0 = K[i - 1][1], r1 = K[i][1];
    if (t <= t1) { const r = mmLerp(r0, r1, (t - t0) / (t1 - t0)); return a + (t - t0) * (r0 + r) / 2; }
    a += (t1 - t0) * (r0 + r1) / 2;
  }
  return a + (t - K[K.length - 1][0]) * K[K.length - 1][1];
}
// u (0..1 of the flight) → the centre on the arc, its velocity, the lean and the squash. o: { x0, y0 (the centre at take-off),
//   x1, y1 (at landing), bulge (px the arc rises above the straight line), T (s of action time: for speed), turn0, turn1
//   (lean), turnEase ('io' | 'lin'), spin (extra turns, rad, spread over the flight), h (the body's height px), stretchK }
function mmoArc(u, o) {
  u = mmC01(u);
  const pos = (q) => [mmLerp(o.x0, o.x1, q), mmLerp(o.y0, o.y1, q) - 4 * (o.bulge || 0) * q * (1 - q)];
  const p = pos(u), e = 1e-3, pa = pos(Math.max(0, u - e)), pb = pos(Math.min(1, u + e)), du = Math.min(1, u + e) - Math.max(0, u - e);
  const vx = (pb[0] - pa[0]) / du / (o.T || 1), vy = (pb[1] - pa[1]) / du / (o.T || 1), sp = Math.hypot(vx, vy);
  const k = o.turnEase === 'lin' ? u : mmIO(u);
  const lean = mmLerp(o.turn0 || 0, o.turn1 || 0, k) + (o.spin || 0) * u;
  const R = (o.h || 300) / 8.9, sy = mmoSpeedStretch(sp, R, o.stretchK === undefined ? 0.3 : o.stretchK, o.v0 === undefined ? 30 : o.v0);
  return { x: p[0], y: p[1], vx, vy, sp, lean, sy, sx: Math.pow(sy, -0.5) };
}
// put any rig's centre (c px above its feet, along its own up) at (cx, cy): → its feet point (the rig's x, y)
function mmoFeetFor(cx, cy, c, lean, sy) { return [cx - c * (sy || 1) * Math.sin(lean || 0), cy + c * (sy || 1) * Math.cos(lean || 0)]; }
// THE CARTOON RUN: ph (cycles, from the distance run) → Mook's feet (C.foot, body space px) and arm pump. The feet go round
//   wheels under the hips (high knees, long reach), the body bobs twice a cycle, leans in, arms pump opposite.
//   o: { h, dir, wheel (R: 1.1), reach (R: 1.5), lean (0.32) }
function mmoToonRun(ph, o) {
  o = o || {};
  const R = (o.h || 300) / 8.9, dir = o.dir || 1, wr = (o.wheel === undefined ? 1.1 : o.wheel) * R, rz = (o.reach === undefined ? 1.5 : o.reach) * R;
  const foot = {}, yaw = o.yaw === undefined ? dir * 1.3 : o.yaw;
  for (const [s, off] of [['R', 0], ['L', 0.5]]) {
    const a = 2 * Math.PI * (ph + off);
    const z = -Math.cos(a) * rz, y = -Math.max(0, Math.sin(a)) * wr * 1.4;                        // up high swinging forward, on the ground pushing back
    foot[s] = [(s === 'R' ? -1 : 1) * MMO_MK.hipX * R, y, z];
  }
  const bob = 0.35 * R * Math.abs(Math.sin(2 * Math.PI * ph * 2)) ;
  const sw = Math.cos(2 * Math.PI * ph);
  const pose = { R: [0.4, 1.0, 0.2 + 1.0 * sw, { fist: 0.8 }], L: [0.4, 1.0, 0.2 - 1.0 * sw, { fist: 0.8 }] };
  return { foot, bob: 0.6 * R - bob, lean: dir * (o.lean === undefined ? 0.32 : o.lean), pose, yaw };
}

// ── MOOK PULLS HIS HOOD UP (🎬 a gesture for "let mook wear his hood sometimes": the hood is where he goes when the
//    world is too loud). His hands go up behind his neck (the shoulders rise: anticipation), pull it up and over (it
//    flops forward past his face and settles back: overshoot), come down; his head ducks into it, a breath out.
//    s: seconds since he starts (dur 1.3) · o: { down (true: pull it back DOWN instead) } → { hoodUp, pose, headTilt, bob, sy }
function mmoHoodPull(s, o) {
  o = o || {};
  const u = mmC01(s / 1.3), rise = mmSmooth(mmSeg(u, 0, 0.25)), pull = mmSeg(u, 0.22, 0.62), drop = mmSmooth(mmSeg(u, 0.6, 0.95));
  let k = mmoOver(pull, 0.2, 0.68);                                           // the hood: up, a flop past (over his eyes), back
  if (o.down) k = 1 - mmSmooth(pull);
  const behind = { R: [-0.15, -1.25, -0.75, { behind: 1, fist: 0.7 }], L: [-0.1, -1.3, -0.7, { behind: 1, fist: 0.7 }] };
  const over = { R: [-0.05, -2.05, 0.35, { fist: 0.8 }], L: [0.0, -2.0, 0.3, { fist: 0.8 }] };
  const rest = { R: [0.2, 2.3, 0.12, {}], L: [0.2, 2.3, 0.12, {}] };
  const front = { R: [-0.25, 0.1, 0.95, { fist: 0.5 }], L: [-0.2, 0.15, 0.9, { fist: 0.5 }] };   // up the front first (never out wide)
  let pose = rise < 0.5 ? mkPoseMix(rest, front, mmSmooth(rise / 0.5)) : mkPoseMix(front, behind, mmSmooth((rise - 0.5) / 0.5));
  if (u > 0.22) pose = mkPoseMix(behind, over, mmSmooth(pull));
  if (u > 0.6) pose = mkPoseMix(over, rest, drop);
  const duck = 0.12 * Math.sin(Math.PI * mmSeg(u, 0.45, 1));
  return { hoodUp: mmClamp(k, 0, 1.12), pose, headTilt: duck * 0.6, bob: 0.25 * (Math.min(1, s / 1.3) * 0 + rise * (1 - drop)) * 0 - 0.1 * rise * (1 - drop), sy: 1 + 0.03 * rise * (1 - drop) - 0.02 * duck };
}

// ═════════════════════════════════════════════════════════════════════════════════════════
//  EP3 · THE LONG RIDE kit (🎬 S03 extended: THE BRINK, THE WALL). Opt-in tools; nothing above changes.
// ═════════════════════════════════════════════════════════════════════════════════════════
// THE BOARD FROM ANY SIDE: mmoBoard's deck, kicks, trucks and wheels as a solid, turned by yaw (the bike's convention:
//   screen X = lat·cos(yaw) + x·sin(yaw); depth toward us = −lat·sin(yaw) + x·cos(yaw)) and seen from el (rad, + = from above).
//   B: { x, y (the road under it), R, yaw, el, pitch (+ nose up), roll (the kickflip, 0 = grip up), lift (px), spin, t, seed }
//   Side-on (yaw ±π/2, el 0) it draws what mmoBoard draws; from behind, the tail end-on with two wheels; from above, the grip.
function mmoBoard3D(g, B) {
  const R = B.R, Bd = MMO_BOARD, yaw = B.yaw === undefined ? Math.PI / 2 : B.yaw, el = B.el || 0;
  const t = B.t || 0, bk = mmBoil(t) + (B.seed | 0) * 7 + 401, lw = Math.max(1.4, R * 0.075), amp = Math.max(0.3, R * 0.02);
  const L = Bd.len * R / 2, Wd = Bd.width * R / 2, th = Bd.th * R, wr = Bd.wheel * R, kick = 0.32 * R, yTop = Bd.top * R;
  const cp = Math.cos(B.pitch || 0), sp = Math.sin(B.pitch || 0), cr = Math.cos(B.roll || 0), sr = Math.sin(B.roll || 0);
  const sy = Math.sin(yaw), cy = Math.cos(yaw), ce = Math.cos(el), se = Math.sin(el), yc = yTop - th * 0.5;
  // a board-space point [x fwd, y up, lat] → [screen x, screen y, depth toward us]; rolled about the long axis and
  //   pitched about the lateral axis, both through the deck's middle
  const P = (x, y, lat) => {
    let yy = y - yc, zz = lat;
    const y1 = yy * cr - zz * sr, z1 = yy * sr + zz * cr;
    const x2 = x * cp - y1 * sp, y2 = x * sp + y1 * cp;
    const X = z1 * cy + x2 * sy, D = -z1 * sy + x2 * cy, Y = -(y2 + yc + (B.lift || 0)) * ce + D * se;
    return [B.x + X, B.y + Y, D];
  };
  const kickAt = (x) => { const e = mmC01((Math.abs(x) - 0.62 * L) / (0.38 * L)); return kick * e * e; };
  // the deck's rim (a stadium: straight sides, round nose and tail), top and bottom
  const rim = (dy) => { const Q = [], n = 10;
    for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 + Math.PI * i / n, x = L - Wd + Math.cos(a) * Wd, z = Math.sin(a) * Wd; Q.push([x, kickAt(x) + dy, z]); }
    for (let i = 1; i < 8; i++) { const x = mmLerp(L - Wd, -L + Wd, i / 8); Q.push([x, kickAt(x) + dy, Wd]); }
    for (let i = 0; i <= n; i++) { const a = Math.PI / 2 + Math.PI * i / n, x = -L + Wd + Math.cos(a) * Wd, z = Math.sin(a) * Wd; Q.push([x, kickAt(x) + dy, z]); }
    for (let i = 1; i < 8; i++) { const x = mmLerp(-L + Wd, L - Wd, i / 8); Q.push([x, kickAt(x) + dy, -Wd]); }
    return Q; };
  const top = rim(yTop).map(q => P(q[0], q[1], q[2])), bot = rim(yTop - th).map(q => P(q[0], q[1], q[2]));
  // the up-vector of the deck after the roll: which face do we see?
  // which face do we see: the deck's normal (rolled, pitched, turned) against the direction to the eye (up el, toward us)
  const ny1 = cr, nz1 = sr, nx2 = -ny1 * sp, ny2 = ny1 * cp, nD = -nz1 * sy + nx2 * cy, toEye = ny2 * se + nD * ce;
  const faceTop = toEye > 0.03, faceBot = toEye < -0.03;
  // wheels and trucks hang under the deck (toward the deck's own down)
  const ax = L - 0.75 * R, wy = yTop - th - Bd.truck * R - wr * 0.8 + wr * 0.8;          // the axle's height (deck space)
  const wheel = (sx, sz) => { const c = P(sx * ax, wr, sz * Wd * 0.78); return { c, d: c[2], sx, sz }; };
  const W = [wheel(1, 1), wheel(1, -1), wheel(-1, 1), wheel(-1, -1)].sort((a, b) => a.d - b.d);
  const drawWheel = (w) => {
    const rx = Math.max(wr * Math.abs(sy) * 0.98, wr * 0.42), ry = wr * Math.max(0.35, Math.abs(cr) * ce + Math.abs(sr) * 0.5);
    const off = 0.11 * R * cy * Math.sign(w.sz);                                            // the wheel's width, seen as it turns
    const Wp = mmCirclePts(w.c[0] + off * 0.5, w.c[1], rx, ry, 12, 0, 0.03, 405 + w.sx + w.sz * 2);
    mmInk(g, Wp, { fill: MM.mmoWheel, lw: lw * 0.9, amp: amp * 0.5, seed: 407 + w.sx, bk });
    if (Math.abs(sy) > 0.35) { const s = B.spin || 0; mmInk(g, [[w.c[0] + Math.cos(s) * rx * 0.15, w.c[1] + Math.sin(s) * ry * 0.15], [w.c[0] + Math.cos(s) * rx * 0.7, w.c[1] + Math.sin(s) * ry * 0.7]], { closed: false, lw: lw * 0.6 }); }
  };
  const drawTruck = (sx) => {
    const a = P(sx * ax, wr, Wd * 0.78), b = P(sx * ax, wr, -Wd * 0.78), h0 = P(sx * ax, yTop - th, Wd * 0.35), h1 = P(sx * ax, yTop - th, -Wd * 0.35);
    mmInk(g, [a, b], { closed: false, lw: lw * 1.6, ink: MM.mmoTruck });
    mmInk(g, [[h0[0], h0[1]], [h1[0], h1[1]], [(a[0] + b[0]) / 2 + (h1[0] - h0[0]) * 0.15, (a[1] + b[1]) / 2], [(a[0] + b[0]) / 2 - (h1[0] - h0[0]) * 0.15, (a[1] + b[1]) / 2]],
          { fill: MM.mmoTruck, lw: lw * 0.8, amp: amp * 0.5, seed: 403 + sx, bk });
  };
  const under = () => { for (const w of W.filter(w => w.d < 0)) drawWheel(w); drawTruck(1); drawTruck(-1); for (const w of W.filter(w => w.d >= 0)) drawWheel(w); };
  if (!faceBot) under();
  // the deck: its edge band (quads between the two rims) and the face we see, inked as ONE silhouette: every piece is
  //   filled and stroked at 2 lw, then filled again on top — the inner halves of the strokes are covered, the outer
  //   half of the outline stays (the kick's concave curve survives, which a hull would lose)
  const face = faceBot ? bot : top, walls = [];
  for (let i = 0; i < top.length; i++) { const j = (i + 1) % top.length; walls.push({ q: [top[i], top[j], bot[j], bot[i]], d: (top[i][2] + top[j][2]) / 2 }); }
  walls.sort((a, b) => a.d - b.d);
  const pieces = walls.map(w => w.q).concat([face]), fillW = faceBot ? MM.mmoDeckUnder : MM.mmoDeck;
  const path = (Q) => { g.beginPath(); Q.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); };
  g.save(); g.lineJoin = 'round'; g.lineWidth = lw * 2; g.strokeStyle = MM.ink; g.fillStyle = fillW;
  for (const Q of pieces) { path(Q); g.stroke(); g.fill(); }
  for (const Q of pieces) { path(Q); g.fill(); }
  g.restore();
  // the face: grip on top (black-grey), his two colours underneath
  if (faceTop) mmInk(g, top.map(p => [p[0], p[1]]), { fill: MM.mmoGrip, lw: lw * 0.6, amp: amp * 0.5, seed: 411, bk, poly: false });
  else if (faceBot) mmSplit(g, bot.map(p => [p[0], p[1]]), [P(0, yTop - th, -3 * Wd), P(0, yTop - th, 3 * Wd)].map(p => [p[0], p[1]]), MM.mmoDeckUnder, MM.mmoDeck, { lw: lw * 0.6, amp: amp * 0.5, seed: 412, bk });
  else mmInk(g, top.map(p => [p[0], p[1]]), { closed: true, lw: lw * 0.45, amp: amp * 0.4, seed: 413, bk, poly: false });
  if (faceBot) under();
  return { top, bot, P };
}
// a convex hull (monotone chain) of 2-D points
function mmoHull2(pts) {
  const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]); if (p.length < 3) return p;
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], hi = [];
  for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (hi.length >= 2 && cr(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop(); hi.push(q); }
  return lo.slice(0, -1).concat(hi.slice(0, -1));
}

// THE CLIFF (Looney Tunes): off the edge you keep going, slow to a stop in the air, HANG — gravity waits until you
//   notice — then you're gone: a zip down, a poof where you were. One body's clock, in metres and seconds.
//   o: { t0 (at the lip), v (m/s there), glide (m it keeps going past the lip), stop (s to come to rest), pop (m: the rise
//        off the lip), tDrop (when gravity notices), g (cartoon gravity, m/s²: 40), tick (m: the little lift before the drop) }
//   → { x (m past the lip), y (m above the lip), vy, phase 'ride'|'glide'|'hang'|'tick'|'fall', u (0..1 in the glide),
//       fall (s since the drop), sy, sx (stretch on the fall, volume kept) }
function mmoCliff(t, o) {
  const t0 = o.t0 || 0, v = o.v || 6, gl = o.glide === undefined ? 1.2 : o.glide, st = o.stop || 0.45, pop = o.pop || 0;
  const n = Math.max(1, v * st / Math.max(0.01, gl)), tD = o.tDrop === undefined ? 1e9 : o.tDrop, G = o.g || 40, tick = o.tick === undefined ? 0.06 : o.tick;
  let x, y = 0, vy = 0, phase, u = 0;
  if (t < t0) { x = -v * (t0 - t); phase = 'ride'; }
  else { u = mmC01((t - t0) / st); x = gl * (1 - Math.pow(1 - u, n)); y = pop * (1 - Math.pow(1 - u, 2)); phase = u < 1 ? 'glide' : 'hang'; }
  const tt = 0.09;                                                             // the tick: a hair UP before the fall (the "uh-oh")
  if (t >= tD - tt && t < tD) { const k = (t - (tD - tt)) / tt; y += tick * Math.sin(Math.PI * 0.5 * k); phase = 'tick'; }
  let fall = 0;
  if (t >= tD) { fall = t - tD; y += tick - 0.5 * G * fall * fall; vy = -G * fall; phase = 'fall'; }
  const sy = phase === 'fall' ? 1 + Math.min(o.stretchMax || 2.2, (o.stretchK || 0.035) * Math.abs(vy)) : phase === 'tick' ? 0.94 : 1, sx = Math.pow(sy, -0.5);
  return { x, y, vy, phase, u, fall, sy, sx };
}
// the POOF: the little cloud left hanging where somebody was (k 0..1: it swells, thins and is gone)
function mmoPoof(g, x, y, r, k, seed, o) {
  o = o || {}; if (k <= 0 || k >= 1) return;
  const n = 7, grow = 0.55 + 0.75 * mmOut(k), a = (1 - mmSmooth(mmSeg(k, 0.35, 1))) * (o.alpha === undefined ? 1 : o.alpha);
  g.save(); g.globalAlpha *= a;
  for (let i = 0; i < n; i++) {
    const ang = i / n * Math.PI * 2 + mmH2(seed, i) * 0.6, d = r * grow * (0.45 + 0.25 * mmH2(seed + 3, i)), rr = r * grow * (0.38 + 0.2 * mmH2(seed + 5, i));
    const P = mmCirclePts(x + Math.cos(ang) * d, y + Math.sin(ang) * d * 0.75 - r * 0.25 * k, rr, rr * 0.9, 12, 0, 0.05, seed + i);
    mmInk(g, P, { fill: o.fill || '#f6ead8', lw: Math.max(1, r * 0.05), ink: o.ink || '#8b6f78', amp: r * 0.02, seed: seed + 20 + i });
  }
  g.restore();
}
// ZIP LINES: the streak a body leaves when it goes all at once (from where it was to where it is), thinning out
function mmoZip(g, x0, y0, x1, y1, w, k, seed) {
  if (k <= 0 || k >= 1) return;
  const a = 1 - mmSmooth(k), n = 4;
  g.save(); g.lineCap = 'round'; g.strokeStyle = 'rgba(52,40,72,' + (0.55 * a) + ')';
  for (let i = 0; i < n; i++) {
    const f = (i - (n - 1) / 2) / (n - 1), ox = f * w, lift = mmLerp(0, 1, mmH2(seed, i) * 0.5 + k * 0.5);
    g.lineWidth = Math.max(1, w * 0.07 * (1 - Math.abs(f)));
    g.beginPath(); g.moveTo(x0 + ox, mmLerp(y0, y1, lift * 0.6)); g.lineTo(x1 + ox, y1); g.stroke();
  }
  g.restore();
}
// TV GURL's gulp: colour bars (her screen's "please stand by"), a little wobbly, as a custom screen
function mmoTvBars(g, x, y, w, h, t) {
  const C = ['#e9e3d6', '#e8cf59', '#69c1c9', '#77b56a', '#c9679f', '#d4555a', '#4f69b5'], n = C.length, j = 0.6 * Math.sin(t * 40);
  for (let i = 0; i < n; i++) { g.fillStyle = C[i]; g.fillRect(x + i * w / n + j, y, w / n + 1, h * 0.72); }
  const D = ['#4f69b5', '#26222c', '#c9679f', '#26222c', '#69c1c9', '#26222c', '#e9e3d6'];
  for (let i = 0; i < n; i++) { g.fillStyle = D[i]; g.fillRect(x + i * w / n + j, y + h * 0.72, w / n + 1, h * 0.28); }
}
// MOOK ON THE BOARD FROM ANY SIDE: the solid board and him on it — his body turned off the board like a skater
//   (regular: left foot forward; gliding he opens 31° to the nose, as in S03.02), each foot planted on its bolts by the
//   toon legs (the deck points come from the board's own projection, so the feet sit on it from any side).
//   o: { x, y (the road under the board), h (his height, px), yaw (the BOARD's: π/2 nose right, π nose away), el, pitch, roll,
//        lift (px), spin, crouch (0..1: 0.25), stance ('regular'|'goofy'), open (rad: extra turn of his body), t,
//        C: { any mookDraw fields: pose, eyes, mouth, headTurn, headTilt, hoodUp, lean, sx, sy, strings, sprigLag, blink … } }
//   → { B (the board), C (his call), P (the board's projector), deck: { front, back, mid } }
function mmoMookBoard3D(g, o) {
  const h = o.h, R = h / 8.9, Bd = MMO_BOARD, t = o.t || 0, st = o.stance === 'goofy' ? -1 : 1;
  const B = { x: o.x, y: o.y, R, yaw: o.yaw, el: o.el || 0, pitch: o.pitch || 0, roll: o.roll || 0, lift: o.lift || 0, spin: o.spin || 0, t, seed: 3 };
  const D = mmoBoard3D(g, B), yTop = Bd.top * R;
  const pF = D.P(0.95 * R, yTop, 0), pB = D.P(-0.95 * R, yTop, 0), mid = D.P(0, yTop, 0);
  const crouch = o.crouch === undefined ? 0.25 : o.crouch, Hh = (4.0 - 0.85 * crouch) * R;
  const C = Object.assign({ h, yaw: o.yaw - st * 1.02 + (o.open || 0), t, seed: 1, hose: 1.6, noodle: 0.5, blink: undefined }, o.C || {});
  C.h = h; mmoRootAt(C, mid[0], mid[1] - Hh * (C.sy || 1));
  const fs = st > 0 ? 'L' : 'R', bs = fs === 'L' ? 'R' : 'L';
  C.foot = { [fs]: mmoFootAt(C, fs, pF[0], pF[1]), [bs]: mmoFootAt(C, bs, pB[0], pB[1]) };
  mookDraw(g, C);
  return { B, C, P: D.P, deck: { front: pF, back: pB, mid } };
}

// a drawing context that draws nothing (to ask a rig where its parts are before drawing it for real)
function mmoNullG() { if (!window.__mmoNullG) window.__mmoNullG = (typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(2, 2) : Object.assign(document.createElement('canvas'), { width: 2, height: 2 })).getContext('2d'); const q = window.__mmoNullG; q.setTransform(1, 0, 0, 1, 0, 0); return q; }

return { mushDraw, mushNotes, mmoMushBounce, mmoMushHop, mmoMushIdle, mmoShadowAt, mmBoil, MM };
})();
