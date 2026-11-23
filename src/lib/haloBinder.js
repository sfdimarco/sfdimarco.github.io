// HALO Poptarts: booster packs, the binder and the Draft Night deck, kept in this browser.
// Storage is wrapped: if localStorage is blocked (private window, cleared data) the page still works, it just forgets on reload.
import { HALO_CARDS, HALO_BASICS } from "../content/haloCards.js";

export const BY_ID = Object.fromEntries([...HALO_CARDS, ...HALO_BASICS].map((c) => [c.id, c]));
export const SET_SIZE = HALO_CARDS.length;
export const DECK_SIZE = 20; // the game's 20-card list; the table scales it to 40 like every deck
const KEY = "halo-binder-v1";

// 🆕 pack recipe (Claude's, for Mook's tick): 8 cards = 5 common · 2 uncommon · 1 hit (rare or commander).
// The hit is lenticular; 1 in 10 hits is a First Edition. Finish is looks only: same numbers.
export const PACK = { common: 5, uncommon: 2, hit: 1, firstEditionOdds: 0.1 };
export const STARTER_PACKS = 3; // canon: Draft Night, three packs each, no trades

const pool = (r) => HALO_CARDS.filter((c) => c.rarity === r);
const COMMONS = pool("common"), UNCOMMONS = pool("uncommon"), HITS = [...pool("rare"), ...pool("commander")], COMMANDERS = pool("commander");

const pick = (list, rnd, avoid) => {
  for (let tries = 0; tries < 12; tries++) {
    const c = list[Math.floor(rnd() * list.length)];
    if (!avoid.has(c.id)) { avoid.add(c.id); return c; }
  }
  return list[Math.floor(rnd() * list.length)];
};

// one 8-card pack, hit last. `commanderHit` makes the hit a commander (the first starter pack: everyone can lead a deck).
export function makePack(rnd = Math.random, commanderHit = false) {
  const seen = new Set();
  const cards = [
    ...Array.from({ length: PACK.common }, () => ({ id: pick(COMMONS, rnd, seen).id, finish: "laminate" })),
    ...Array.from({ length: PACK.uncommon }, () => ({ id: pick(UNCOMMONS, rnd, seen).id, finish: "laminate" })),
  ];
  const hit = pick(commanderHit ? COMMANDERS : HITS, rnd, seen);
  cards.push({ id: hit.id, finish: rnd() < PACK.firstEditionOdds ? "first" : "lenticular", hit: true });
  return cards;
}

const fresh = () => ({ v: 1, owned: {}, finishes: {}, packsLeft: STARTER_PACKS, packsOpened: 0, nights: 1, deck: null, points: 0, beaten: {}, claimed: [] });

// 🆕 bounties (Claude's, for Mook's tick): beat a cast deck 1 on 1 with your Draft Night deck to earn points,
// spend them at Tortimer's Card Bazaar. Every win pays WIN_POINTS; the first win over a boss also pays its BOUNTY.
export const WIN_POINTS = 2, BOUNTY = 3, PACK_PRICE = 3;

// read the wins the game wrote (public/halo/play, reportResult) and pay the ones not paid yet: returns [binder, news]
export function claimResults(b) {
  let list = [];
  try { list = JSON.parse(window.localStorage.getItem("halo-results-v1") || "[]"); } catch { return [b, []]; }
  const claimed = new Set(b.claimed || []), beaten = { ...(b.beaten || {}) }, news = [];
  let points = b.points || 0;
  for (const r of Array.isArray(list) ? list : []) {
    if (!r || claimed.has(r.seed)) continue;
    claimed.add(r.seed);
    if (!r.won) { news.push({ boss: r.boss, won: false, got: 0 }); continue; }
    const first = !beaten[r.boss], got = WIN_POINTS + (first ? BOUNTY : 0);
    beaten[r.boss] = (beaten[r.boss] || 0) + 1; points += got;
    news.push({ boss: r.boss, won: true, got, first });
  }
  if (!news.length) return [b, []];
  return [{ ...b, points, beaten, claimed: [...claimed].slice(-200) }, news];
}

export const buyPack = (b) => ((b.points || 0) < PACK_PRICE ? b : { ...b, points: b.points - PACK_PRICE, packsLeft: b.packsLeft + 1 });

let memory = null; // used when storage is blocked
export function loadBinder() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) { const b = JSON.parse(raw); if (b && b.v === 1 && b.owned) return { ...fresh(), ...b }; }
  } catch { /* storage blocked or bad data: start fresh */ }
  return memory ? { ...memory } : fresh();
}
export function saveBinder(b) {
  memory = b;
  try { window.localStorage.setItem(KEY, JSON.stringify(b)); return true; } catch { return false; }
}

// open the next pack: returns [newBinder, cards]
export function openPack(b) {
  if (b.packsLeft <= 0) return [b, null];
  const cards = makePack(Math.random, b.packsOpened === 0);
  const owned = { ...b.owned }, finishes = { ...b.finishes };
  for (const c of cards) {
    owned[c.id] = (owned[c.id] || 0) + 1;
    const f = finishes[c.id] || [];
    if (!f.includes(c.finish)) finishes[c.id] = [...f, c.finish];
  }
  return [{ ...b, owned, finishes, packsLeft: b.packsLeft - 1, packsOpened: b.packsOpened + 1 }, cards];
}

// 🗣 Mook 11-23: one Draft Night per visitor (three packs, one deck). More packs come only from the Bazaar (bounty points).

export const bestFinish = (b, id) => {
  const f = b.finishes[id] || [];
  return f.includes("first") ? "first" : f.includes("lenticular") ? "lenticular" : "laminate";
};

// ----- Draft Night deck: { cmd, cards: [20 ids] } from owned cards (up to the copies owned) + unlimited basics
export function deckProblems(b, deck) {
  const out = [];
  if (!deck || !deck.cmd || !b.owned[deck.cmd]) out.push("Pick a commander you own.");
  const n = deck ? deck.cards.length : 0;
  if (n !== DECK_SIZE) out.push(`${n} of ${DECK_SIZE} cards.`);
  const cnt = {};
  (deck ? deck.cards : []).forEach((id) => (cnt[id] = (cnt[id] || 0) + 1));
  for (const [id, k] of Object.entries(cnt)) {
    const c = BY_ID[id];
    if (!c || !c.deckable) out.push(`${id} cannot go in a deck.`);
    else if (c.rarity !== "basic" && k > (b.owned[id] || 0)) out.push(`You own ${b.owned[id] || 0} ${c.name}, not ${k}.`);
  }
  return out;
}

// fill the empty places with basics, keeping the grunt / soldier / wall / heavy mix of every planet (4 · 4 · 2 · 1)
export function fillWithBasics(cards) {
  const out = cards.slice(), mix = ["kInd_grunt", "kInd_soldier", "kInd_grunt", "kInd_soldier", "kInd_wall", "kInd_grunt", "kInd_soldier", "kInd_heavy", "kInd_grunt", "kInd_soldier", "kInd_wall"];
  for (let i = 0; out.length < DECK_SIZE; i++) out.push(mix[i % mix.length]);
  return out;
}

// the link the game reads (public/halo/play/index.html, readDraft): #draft=<base64url JSON>
export function playLink(root, deck, who, boss) {
  const json = JSON.stringify({ v: 1, who: who || "Your Draft deck", cmd: deck.cmd, cards: deck.cards });
  const b64 = btoa(unescape(encodeURIComponent(json))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${root}#draft=${b64}${boss ? `&boss=${boss}` : ""}`;
}
