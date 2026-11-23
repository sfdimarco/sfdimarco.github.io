// The illustrated HALO card faces: .geo/halo/card-art (halo-cards.js + halo-card-data.js), copied to public/halo/cards/.
// Loaded once, on first use. Until they load (or if they fail) the site shows its plain placeholder face.
import { useEffect, useState } from "react";

const base = `${import.meta.env.BASE_URL}halo/cards/`;
let loading = null;
const ready = () => typeof window !== "undefined" && !!window.HaloCards && !!window.HALO_CARD_DATA;

function addScript(src) {
  return new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = src; s.async = false; s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
}

export function loadHaloArt() {
  if (ready()) return Promise.resolve(true);
  if (!loading) loading = addScript(base + "halo-card-data.js").then(() => addScript(base + "halo-cards.js")).then(ready).catch(() => false);
  return loading;
}

// true once the renderer is in the page
export function useHaloArt() {
  const [ok, setOk] = useState(ready);
  useEffect(() => { if (!ok) loadHaloArt().then((v) => v && setOk(true)); }, [ok]);
  return ok;
}

let byId = null;
export function artCard(id) {
  if (!ready()) return null;
  if (!byId) byId = Object.fromEntries(window.HALO_CARD_DATA.cards.map((c) => [c.id, c]));
  return byId[id] || null;
}

// the site's finishes → the renderer's: laminate (packs' commons and uncommons), lenticular (the hit), first (First Edition)
const FINISH = { laminate: "laminate", lenticular: "lenticular", first: "first", basic: "plain" };

// Cards are drawn once to a canvas (cached per card and finish) and copied into the page: no image encoding.
// Drawing takes ~20–120 ms a card, so new ones are drawn a few per animation frame and the page never freezes.
const cache = {}, queue = [];
let pumping = false;
function pump() {
  const t = performance.now();
  while (queue.length && performance.now() - t < 20) {
    const job = queue.shift();
    if (job.dead) continue;
    if (!(job.key in cache)) { try { cache[job.key] = job.make(); } catch { cache[job.key] = null; } }
    job.cb(cache[job.key]);
  }
  if (queue.length) requestAnimationFrame(pump); else pumping = false;
}
// calls cb(canvas or null) when this face is ready; returns a cancel function
export function whenDrawn(id, finish, back, cb) {
  if (!ready()) { cb(null); return () => {}; }
  const key = back ? "back" : `${id}|${finish}`;
  if (key in cache) { cb(cache[key]); return () => {}; }
  const c = back ? null : artCard(id);
  if (!back && !c) { cb(null); return () => {}; }
  const job = { key, cb, dead: false,
    make: () => window.HaloCards.render(c, { w: 170, dpr: 1.5, back: !!back, finish: FINISH[finish] || "plain" }) };
  queue.push(job);
  if (!pumping) { pumping = true; requestAnimationFrame(pump); }
  return () => { job.dead = true; };
}

// a live card that tilts toward the cursor; returns the controller (setFinish, play, destroy) or null
export function mountCard(el, id, finish, w) {
  const c = artCard(id);
  if (!c || !el) return null;
  try { return window.HaloCards.mount(el, c, { w, finish: FINISH[finish] || "plain" }); } catch { return null; }
}
