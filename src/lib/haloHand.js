// ═════════════════════════════════════════════════════════════════════════════════════
// MM_UNCIAL7 · THE HALO HAND: the lettering of Halo Aliquid Nihil (cards, and anything the old pantheon carved).
//   🗣 Mook 2026-10-08: "font could be more whimsical handdrawn for a more ancient look i always thaught of Celtic
//   sandscript as an inspiration and symbolic because the halo is this ancient pantheon in the lore."
//   🎬 Claude's (his to change):
//    · CELTIC UNCIAL, drawn with a BROAD NIB: every stroke is swept by a flat pen held at a low angle, so downstrokes
//      come out thick and cross-strokes thin, like a scribe's. A hairline round pen runs down the middle so no stroke
//      ever vanishes. One case only (uncial has no lower case): the round E, the arched M, the h-shaped H, the curled T.
//      The A is POINTED, not the uncial bowl-A: that one reads as a d ("ARCH" came out "dRCh").
//    · B, D, P and Q KEEP THEIR CAPITAL SHAPES (stem + bowl) on purpose: the uncial ∂-shaped D and the b/d/p/q
//      mirror family are exactly the letters that flip for a dyslexic reader.
//    · WHIMSY: each letter sits a hair off the line and leans a hair (stable per letter, from mmH2), and the ink
//      boils 7.5 times a second like the rest of the show's line (mmBoil). Never random().
//    · o.bar: a heavy headline bar over each word, Sanskrit-style (Devanagari's shirorekha), the letters hanging from it
//      (the "sandscript" reading: Celtic letters, Sanskrit bar). Off unless asked.
//    · Digits are drawn too, but the cards keep their NUMBERS in the plain round hand (colour + glyph + word law).
//   c7UText(g, str, x, y, cap, o) draws str with its baseline at y, cap = the capital height in px; returns its width.
//   c7UWidth(str, cap, o) measures. o = { align: 'left'|'center'|'right', col, t, seed, whim (0..1.5), nib (x), bar }.
//   Every global starts c7U / C7U. Needs mm_core.js (mmH2, mmSN1, mmBoil).
// ═════════════════════════════════════════════════════════════════════════════════════
const C7U_ARC = (cx, cy, rx, ry, a0, a1) => {             // an arc as points (degrees; canvas: 0 right, 90 down)
  const n = Math.max(3, Math.ceil(Math.abs(a1 - a0) / 12)), P = [];
  for (let i = 0; i <= n; i++) { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; P.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); }
  return P;
};
const C7U_S = (...parts) => { const P = []; for (const q of parts) { if (typeof q[0] === 'number') P.push(q); else for (const r of q) P.push(r); } return P; };
// glyphs in em: x right, y up is NEGATIVE (baseline 0, capital top −1). w = the advance. s = strokes (each a point list).
const C7U_G = {
  A: { w: 0.86, s: [[[0.06, 0.0], [0.20, -0.44], [0.33, -0.82], [0.44, -1.0]], [[0.36, -0.96], [0.44, -1.0], [0.56, -0.7], [0.68, -0.3], [0.80, 0.0]], [[0.19, -0.36], [0.44, -0.42], [0.67, -0.35]]] },   // a pointed A: the uncial bowl-A reads as a d
  B: { w: 0.82, s: [[[0.14, -1.0], [0.14, 0.0]], C7U_S([0.14, -1.0], C7U_ARC(0.40, -0.76, 0.25, 0.24, -90, 90), [0.14, -0.52]), C7U_S([0.14, -0.52], C7U_ARC(0.44, -0.27, 0.29, 0.26, -90, 90), [0.14, 0.0])] },
  C: { w: 0.82, s: [C7U_ARC(0.47, -0.5, 0.38, 0.5, -45, -315)] },
  D: { w: 0.88, s: [[[0.14, -1.0], [0.14, 0.0]], C7U_S([0.14, -1.0], [0.34, -1.0], C7U_ARC(0.40, -0.5, 0.38, 0.5, -80, 80), [0.34, 0.0], [0.14, 0.0])] },
  E: { w: 0.78, s: [C7U_ARC(0.46, -0.5, 0.37, 0.5, -55, -305), [[0.12, -0.52], [0.56, -0.52]]] },
  F: { w: 0.70, s: [[[0.16, -1.0], [0.16, 0.06]], [[0.16, -1.0], [0.50, -1.0], [0.66, -0.94]], [[0.16, -0.55], [0.52, -0.55]]] },
  G: { w: 0.90, s: [C7U_ARC(0.47, -0.5, 0.38, 0.5, -45, -350), [[0.86, -0.44], [0.56, -0.44]]] },
  H: { w: 0.80, s: [[[0.14, -1.06], [0.14, 0.0]], [[0.14, -0.5], [0.30, -0.64], [0.50, -0.64], [0.62, -0.5], [0.63, -0.15], [0.66, -0.02], [0.74, 0.0]]] },
  I: { w: 0.34, s: [[[0.16, -1.0], [0.16, 0.0]]] },
  J: { w: 0.50, s: [[[0.36, -1.0], [0.36, -0.1], [0.28, 0.06], [0.08, 0.08]]] },
  K: { w: 0.74, s: [[[0.14, -1.0], [0.14, 0.0]], [[0.62, -0.98], [0.16, -0.48]], [[0.24, -0.56], [0.50, -0.2], [0.68, 0.0]]] },
  L: { w: 0.70, s: [[[0.14, -1.04], [0.14, -0.06], [0.20, 0.0], [0.60, 0.0], [0.66, -0.08]]] },
  M: { w: 1.06, s: [[[0.14, -0.96], [0.14, 0.0]], [[0.14, -0.82], [0.28, -0.98], [0.42, -0.96], [0.52, -0.8], [0.52, 0.0]], [[0.52, -0.82], [0.66, -0.98], [0.80, -0.96], [0.90, -0.8], [0.90, -0.08], [0.96, 0.0]]] },
  N: { w: 0.86, s: [[[0.14, 0.0], [0.14, -1.0]], [[0.14, -1.0], [0.42, -0.5], [0.70, 0.0]], [[0.70, 0.0], [0.70, -1.0]]] },
  O: { w: 0.92, s: [C7U_ARC(0.46, -0.5, 0.38, 0.5, -90, 270)] },
  P: { w: 0.72, s: [[[0.14, -1.0], [0.14, 0.14]], C7U_S([0.14, -1.0], C7U_ARC(0.38, -0.73, 0.27, 0.27, -90, 90), [0.14, -0.46])] },
  Q: { w: 0.94, s: [C7U_ARC(0.46, -0.5, 0.38, 0.5, -90, 270), [[0.52, -0.12], [0.70, 0.05], [0.90, 0.12]]] },
  R: { w: 0.80, s: [[[0.14, -1.0], [0.14, 0.0]], C7U_S([0.14, -1.0], C7U_ARC(0.36, -0.76, 0.25, 0.24, -90, 90), [0.14, -0.52]), [[0.30, -0.52], [0.50, -0.22], [0.62, -0.04], [0.74, 0.0]]] },
  S: { w: 0.74, s: [[[0.64, -0.86], [0.50, -0.99], [0.30, -0.99], [0.16, -0.85], [0.20, -0.65], [0.46, -0.5], [0.64, -0.3], [0.60, -0.08], [0.42, 0.0], [0.20, -0.02], [0.08, -0.14]]] },
  T: { w: 0.82, s: [[[0.06, -0.94], [0.20, -1.0], [0.60, -1.0], [0.76, -0.94]], [[0.42, -1.0], [0.38, -0.5], [0.40, -0.16], [0.50, -0.02], [0.66, 0.0]]] },
  U: { w: 0.84, s: [[[0.14, -1.0], [0.14, -0.3], [0.24, -0.06], [0.42, 0.0], [0.58, -0.08], [0.68, -0.3]], [[0.70, -1.0], [0.70, -0.06], [0.76, 0.0]]] },
  V: { w: 0.80, s: [[[0.06, -1.0], [0.24, -0.5], [0.40, 0.0]], [[0.40, 0.0], [0.58, -0.5], [0.74, -1.0]]] },
  W: { w: 1.02, s: [[[0.04, -1.0], [0.26, 0.0]], [[0.26, 0.0], [0.50, -0.72]], [[0.50, -0.72], [0.74, 0.0]], [[0.74, 0.0], [0.98, -1.0]]] },
  X: { w: 0.78, s: [[[0.08, -1.0], [0.70, 0.0]], [[0.70, -1.0], [0.08, 0.0]]] },
  Y: { w: 0.78, s: [[[0.06, -1.0], [0.38, -0.48]], [[0.72, -1.0], [0.38, -0.48], [0.38, 0.0]]] },
  Z: { w: 0.78, s: [[[0.08, -1.0], [0.66, -1.0]], [[0.66, -1.0], [0.08, 0.0]], [[0.08, 0.0], [0.70, 0.0]]] },
  '0': { w: 0.76, s: [C7U_ARC(0.38, -0.5, 0.28, 0.5, -90, 270)] },
  '1': { w: 0.50, s: [[[0.16, -0.84], [0.32, -1.0], [0.32, 0.0]]] },
  '2': { w: 0.72, s: [[[0.10, -0.8], [0.22, -0.97], [0.42, -1.0], [0.58, -0.86], [0.56, -0.62], [0.08, 0.0]], [[0.08, 0.0], [0.64, 0.0]]] },
  '3': { w: 0.70, s: [[[0.10, -0.88], [0.30, -1.0], [0.52, -0.92], [0.54, -0.66], [0.30, -0.54]], [[0.30, -0.54], [0.56, -0.42], [0.58, -0.14], [0.36, 0.0], [0.08, -0.1]]] },
  '4': { w: 0.74, s: [[[0.50, -1.0], [0.06, -0.32]], [[0.06, -0.32], [0.68, -0.32]], [[0.50, -0.7], [0.50, 0.05]]] },
  '5': { w: 0.70, s: [[[0.60, -1.0], [0.18, -1.0]], [[0.18, -1.0], [0.14, -0.56]], [[0.14, -0.56], [0.40, -0.62], [0.58, -0.42], [0.56, -0.14], [0.36, 0.0], [0.10, -0.08]]] },
  '6': { w: 0.72, s: [[[0.56, -0.94], [0.36, -1.0], [0.16, -0.78], [0.12, -0.4], [0.20, -0.08], [0.38, 0.0], [0.56, -0.12], [0.60, -0.36], [0.44, -0.56], [0.24, -0.54], [0.13, -0.4]]] },
  '7': { w: 0.70, s: [[[0.08, -1.0], [0.64, -1.0]], [[0.64, -1.0], [0.30, 0.0]]] },
  '8': { w: 0.72, s: [C7U_ARC(0.36, -0.75, 0.21, 0.25, -90, 270), C7U_ARC(0.36, -0.25, 0.25, 0.25, -90, 270)] },
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
  ' ': { w: 0.36, s: [] },
};
const C7U_TRACK = 0.07;
// a stroke smoothed (Catmull-Rom) and resampled every ~0.035 em
function c7USmooth(P) {
  if (P.length < 2) return P.slice();
  const out = [P[0]];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || P[i + 1];
    const n = Math.max(1, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / 0.035));
    for (let j = 1; j <= n; j++) { const t = j / n, t2 = t * t, t3 = t2 * t;
      const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]); }
  }
  return out;
}
const C7U_SM = {};          // smoothed strokes, made once per glyph
function c7UGlyph(ch) {
  const G = C7U_G[ch]; if (!G) return null;
  if (!C7U_SM[ch]) C7U_SM[ch] = G.s.map(c7USmooth);
  return { w: G.w, s: C7U_SM[ch] };
}
function c7UWidth(str, cap, o) {
  o = o || {}; const tr = o.track === undefined ? C7U_TRACK : o.track; let w = 0;
  for (const c of String(str).toUpperCase()) { const G = C7U_G[c]; w += ((G ? G.w : 0.7) + tr); }
  return Math.max(0, w - tr) * cap;
}
function c7UText(g, str, x, y, cap, o) {
  o = o || {}; str = String(str).toUpperCase();
  const W = c7UWidth(str, cap, o), tr = o.track === undefined ? C7U_TRACK : o.track;
  const whim = o.whim === undefined ? 1 : o.whim, seed = (o.seed | 0) + 7, bk = o.t === undefined ? 0 : mmBoil(o.t);
  const nibW = 0.15 * cap * (o.nib || 1), th = o.angle === undefined ? 0.2 : o.angle, hair = Math.max(0.6, 0.05 * cap * (o.nib || 1));
  const nx = Math.cos(th) * nibW / 2, ny = -Math.sin(th) * nibW / 2, col = o.col || (typeof C7_CARD_INK !== 'undefined' ? C7_CARD_INK : '#1c1a21');
  let cx = x - (o.align === 'center' ? W / 2 : o.align === 'right' ? W : 0);
  const words = []; let wd = null;                        // for the headline bar
  g.save(); g.fillStyle = col; g.strokeStyle = col; g.lineCap = 'round'; g.lineJoin = 'round';
  const nib = new Path2D(), line = new Path2D();
  let i = 0;
  for (const ch of str) {
    const G = c7UGlyph(ch);
    if (ch === ' ' || !G) { if (wd) { words.push(wd); wd = null; }
      if (!G && ch !== ' ') { g.font = (cap * 1.3) + 'px Georgia, serif'; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.fillText(ch, cx, y); }
      cx += ((G ? G.w : 0.7) + tr) * cap; i++; continue; }
    if (!wd) wd = [cx, cx]; wd[1] = cx + G.w * cap;
    const dy = (mmH2(i + seed, 11) - 0.5) * 0.07 * cap * whim, rot = (mmH2(i + seed, 23) - 0.5) * 0.08 * whim, sc = 1 + (mmH2(i + seed, 37) - 0.5) * 0.06 * whim;
    const ox = cx + G.w * cap / 2, oy = y - 0.5 * cap, cr = Math.cos(rot), sr = Math.sin(rot);
    let k = 0;
    for (const S of G.s) {
      const Q = S.map((p, j) => {                             // em → px, the lean, the bounce, the boil
        const px = (p[0] - G.w / 2) * cap * sc, py = (p[1] + 0.5) * cap * sc;
        const wob = 0.011 * cap * whim, wx = mmSN1(j * 0.31 + bk * 5.3, seed * 13 + i * 7 + k) * wob, wy = mmSN1(j * 0.31 + bk * 5.3 + 40, seed * 13 + i * 7 + k) * wob;
        return [ox + px * cr - py * sr + wx, oy + dy + px * sr + py * cr + wy];
      });
      for (let j = 0; j < Q.length - 1; j++) {               // the broad nib, swept: one quad a segment, all wound the same way
        const p = Q[j], q = Q[j + 1];
        let A = [[p[0] + nx, p[1] + ny], [q[0] + nx, q[1] + ny], [q[0] - nx, q[1] - ny], [p[0] - nx, p[1] - ny]];
        const ar = (A[1][0] - A[0][0]) * (A[2][1] - A[0][1]) - (A[2][0] - A[0][0]) * (A[1][1] - A[0][1]);
        if (ar < 0) A = A.reverse();
        nib.moveTo(A[0][0], A[0][1]); nib.lineTo(A[1][0], A[1][1]); nib.lineTo(A[2][0], A[2][1]); nib.lineTo(A[3][0], A[3][1]); nib.closePath();
      }
      line.moveTo(Q[0][0], Q[0][1]); for (let j = 1; j < Q.length; j++) line.lineTo(Q[j][0], Q[j][1]);
      k++;
    }
    cx += (G.w + tr) * cap; i++;
  }
  if (wd) words.push(wd);
  g.fill(nib, 'nonzero'); g.lineWidth = hair; g.stroke(line);
  if (o.bar) { g.lineWidth = 0.1 * cap; g.lineCap = 'butt';                // the Sanskrit-style headline bar
    for (const [a, b] of words) { g.beginPath(); g.moveTo(a - 0.05 * cap, y - 1.0 * cap); g.lineTo(b + 0.05 * cap, y - 1.0 * cap); g.stroke(); } }
  g.restore();
  return W;
}
// wrap words into lines no wider than maxW (for the flavor line)
function c7UWrap(str, cap, maxW, o) {
  const words = String(str).split(' '), lines = []; let cur = '';
  for (const wd of words) { const t = cur ? cur + ' ' + wd : wd; if (c7UWidth(t, cap, o) > maxW && cur) { lines.push(cur); cur = wd; } else cur = t; }
  if (cur) lines.push(cur); return lines;
}

// Minimal deterministic helpers from squareeyes/blocks_v2/mm_core.js.
function mmHash(n) { n = n | 0; n = Math.imul(n ^ (n >>> 16), 0x45d9f3b); n = Math.imul(n ^ (n >>> 16), 0x45d9f3b); n = n ^ (n >>> 16); return (n >>> 0) / 4294967296; }
function mmH2(a, b) { return mmHash(Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663) ^ 0x5bd1e995); }
function mmLerp(a, b, k) { return a + (b - a) * k; }
function mmVN1(x, seed) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return mmLerp(mmH2(i, seed | 0), mmH2(i + 1, seed | 0), u); }
function mmSN1(x, seed) { return mmVN1(x, seed) * 2 - 1; }
function mmBoil(t) { return Math.floor(t * 7.5 + 1e-6); }
export { c7UText, c7UWidth, c7UWrap };