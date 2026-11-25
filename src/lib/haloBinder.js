// HALO Poptarts: booster packs, the binder and the Draft Night deck, kept in this browser.
// Storage is wrapped: if localStorage is blocked (private window, cleared data) the page still works, it just forgets on reload.
import { HALO_CARDS, HALO_BASICS, HALO_COMBOS, HALO_STARTERS, HALO_BREAKERS } from "../content/haloCards.js";

export const BY_ID = Object.fromEntries([...HALO_CARDS, ...HALO_BASICS].map((c) => [c.id, c]));
export const SET_SIZE = HALO_CARDS.length;
export const DECK_SIZE = 40; // 11-24 (Mook): a whole 40-card deck, played card for card (was 20, doubled at the table)
const KEY = "halo-binder-v1";

// 🆕 pack recipe (Claude's, for Mook's tick): 8 cards = 5 common · 2 uncommon · 1 hit (rare or commander).
// The hit is lenticular; 1 in 10 hits is a First Edition. Finish is looks only: same numbers.
export const PACK = { common: 5, uncommon: 2, hit: 1, firstEditionOdds: 0.1 };
// canon: Draft Night, three packs each, no trades. 11-24 (Mook: "more cards to start with", arena): a new account opens its road
// starter, then a COUNTER Poptart (a ring-breaker for every other road), then the three Draft Night packs.
export const STARTER_PACKS = 5;

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
// 11-23 playtest: the hit never repeats a commander or a fused card you already own (a second commander, or a card that can't go in a deck, was a dud)
export function makePack(rnd = Math.random, commanderHit = false, owned = {}) {
  const seen = new Set(Object.keys(owned).filter((id) => BY_ID[id] && (BY_ID[id].type === "commander" || BY_ID[id].fused)));
  const cards = [
    ...Array.from({ length: PACK.common }, () => ({ id: pick(COMMONS, rnd, seen).id, finish: "laminate" })),
    ...Array.from({ length: PACK.uncommon }, () => ({ id: pick(UNCOMMONS, rnd, seen).id, finish: "laminate" })),
  ];
  const pool = (commanderHit ? COMMANDERS : HITS).filter((c) => !seen.has(c.id) || (c.type !== "commander" && !c.fused));
  const hit = pick(pool.length ? pool : HITS, rnd, seen);
  cards.push({ id: hit.id, finish: rnd() < PACK.firstEditionOdds ? "first" : "lenticular", hit: true });
  return cards;
}

// the seven roads, one per ring. `key` matches HALO_STARTERS and each card's `road`; colours are the game table's road tags.
// The copy follows the 11-23 rules: Religion converts, Politics seals peace pacts, the crowd is built.
export const ROADS = [
  { key: "industry", ring: "Industry", road: "The last planet lit", how: "Knock every rival planet dark.", color: "#ef5350" },
  { key: "economy", ring: "Economy", road: "Buy the win", how: "Bank ECON and pay the price in one go.", color: "#f6c744" },
  { key: "science", ring: "Science", road: "The great machine", how: "A Core in the middle, Parts on the other eight squares. It must still stand on your next turn.", color: "#26c6da" },
  { key: "food", ring: "Food", road: "The harvest", how: "Relight your rings, again and again, with Food lit. The harvest comes in.", color: "#8bc34a" },
  { key: "pop", ring: "Population", road: "The crowd", how: "Burgages grow a Cottar each turn. Fill all nine squares and hold a round.", color: "#ff9800" },
  { key: "religion", ring: "Religion", road: "Convert them", how: "Take their units onto your grid. Hold 2 converts at the start of your turn (3 in a free-for-all).", color: "#c58af9" },
  { key: "politics", ring: "Politics", road: "The peace pact", how: "A sealed rival cannot attack your cards; tearing it costs them 5 ECON. Hold 2 treaties (1 in a 1 on 1).", color: "#90a4ae" },
];
export const ROAD_BY = Object.fromEntries(ROADS.map((r) => [r.key, r]));
// how the game says a win happened (engine finish(..., { how })) → the road it walked
export const HOW_ROAD = { table: "industry", econ: "economy", tech: "science", food: "food", pop: "pop", religion: "religion", politics: "politics" };

// v 1 throughout: fields added later (road, roadWins, cheered) default here, so old saved binders keep working
const fresh = () => ({ v: 1, start: 2, owned: {}, finishes: {}, packsLeft: STARTER_PACKS, packsOpened: 0, nights: 1, deck: null, points: 0, beaten: {}, claimed: [], learned: false, road: null, roadWins: {}, cheered: null });

// 🆕 bounties (Claude's, for Mook's tick): beat a cast deck 1 on 1 with your Draft Night deck to earn points,
// spend them at Tortimer's Card Bazaar. Every win pays WIN_POINTS; the first win over a boss also pays its BOUNTY.
export const WIN_POINTS = 2, BOUNTY = 3, PACK_PRICE = 3;

// read the wins the game wrote (public/halo/play, reportResult) and pay the ones not paid yet: returns [binder, news]
export function claimResults(b) {
  let list = [];
  try { list = JSON.parse(window.localStorage.getItem("halo-results-v1") || "[]"); } catch { return [b, []]; }
  const claimed = new Set(b.claimed || []), beaten = { ...(b.beaten || {}) }, lostTo = { ...(b.lostTo || {}) }, roadWins = { ...(b.roadWins || {}) }, news = [];
  let points = b.points || 0;
  for (const r of Array.isArray(list) ? list : []) {
    if (!r || claimed.has(r.seed)) continue;
    claimed.add(r.seed);
    // 11-25 (playtest report: "nothing moved after a loss"): a loss still pays 0, but the board keeps the count
    if (!r.won) { lostTo[r.boss] = (lostTo[r.boss] || 0) + 1; news.push({ boss: r.boss, won: false, got: 0 }); continue; }
    const first = !beaten[r.boss], got = WIN_POINTS + (first ? BOUNTY : 0), road = HOW_ROAD[r.how] || "industry";
    beaten[r.boss] = (beaten[r.boss] || 0) + 1; points += got; roadWins[road] = (roadWins[road] || 0) + 1;
    news.push({ boss: r.boss, won: true, got, first, road });
  }
  if (!news.length) return [b, []];
  return [{ ...b, points, beaten, lostTo, roadWins, claimed: [...claimed].slice(-200) }, news];
}

export const buyPack = (b) => ((b.points || 0) < PACK_PRICE ? b : { ...b, points: b.points - PACK_PRICE, packsLeft: b.packsLeft + 1 });

let memory = null; // used when storage is blocked
// 11-24: a binder made before the counter Poptart gets it as a gift: one extra pack, opened next
const giftCounter = (b) => (b.start === 1 && b.road && !b.gotCounter && !b.giftCounter && b.packsOpened >= 1 ? { ...b, giftCounter: true, packsLeft: b.packsLeft + 1 } : b);
export function loadBinder() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) { const b = JSON.parse(raw); if (b && b.v === 1 && b.owned) return giftCounter({ ...fresh(), start: 1, ...b }); }   // start 1 = made before the 11-24 new start
  } catch { /* storage blocked or bad data: start fresh */ }
  return memory ? { ...memory } : fresh();
}
export function saveBinder(b) {
  memory = b;
  try { window.localStorage.setItem(KEY, JSON.stringify(b)); return true; } catch { return false; }
}
// Start over (Mook 11-24): a brand-new account in this browser. The game's win list goes too, or its wins would be
// paid out again to the new binder (its `claimed` list starts empty). The coach on/off setting is kept.
export function resetBinder() {
  memory = null;
  try { window.localStorage.removeItem(KEY); window.localStorage.removeItem("halo-results-v1"); } catch { /* storage blocked: memory is cleared */ }
  return fresh();
}

// a road's starter Poptart: its seven cards, then its commander as the lenticular hit
export function starterPack(road, rnd = Math.random) {
  const s = HALO_STARTERS[road];
  return [...s.cards.map((id) => ({ id, finish: "laminate" })), { id: s.cmd, finish: rnd() < PACK.firstEditionOdds ? "first" : "lenticular", hit: true }];
}

// 11-24: the COUNTER Poptart: one ring-breaker for every road but yours (Industry, the knock-out road, has none of its own)
export function counterPack(road) {
  return Object.entries(HALO_BREAKERS).filter(([r]) => r !== road).map(([, id]) => ({ id, finish: "laminate" }));
}
// is the next pack the counter Poptart?
export const nextIsCounter = (b) => !!b.road && !b.gotCounter && b.packsLeft > 0 && (b.start === 1 ? !!b.giftCounter : b.packsOpened === 1);
// the breaker that answers a road (the bounty board names it), or null
export const breakerFor = (road) => HALO_BREAKERS[road] || null;

// open the next pack: returns [newBinder, cards]. The first pack is your road's starter (if you chose one), the second the counter Poptart.
export function openPack(b) {
  if (b.packsLeft <= 0) return [b, null];
  const starter = b.road && HALO_STARTERS[b.road] && b.packsOpened === 0, counter = !!b.road && !b.gotCounter && (b.start === 1 ? !!b.giftCounter : b.packsOpened === 1);
  const cards = starter ? starterPack(b.road) : counter ? counterPack(b.road) : makePack(Math.random, b.packsOpened === 0, b.owned);
  const owned = { ...b.owned }, finishes = { ...b.finishes };
  for (const c of cards) {
    owned[c.id] = (owned[c.id] || 0) + 1;
    const f = finishes[c.id] || [];
    if (!f.includes(c.finish)) finishes[c.id] = [...f, c.finish];
  }
  return [{ ...b, owned, finishes, packsLeft: b.packsLeft - 1, packsOpened: b.packsOpened + 1, gotCounter: b.gotCounter || counter }, cards];
}

// 🗣 Mook 11-23: one Draft Night per visitor (three packs, one deck). More packs come only from the Bazaar (bounty points).

export const bestFinish = (b, id) => {
  const f = b.finishes[id] || [];
  return f.includes("first") ? "first" : f.includes("lenticular") ? "lenticular" : "laminate";
};

// ----- Draft Night deck: { cmd, cards: [40 ids] } from owned cards (up to the copies owned) + unlimited basics
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

// 11-23: the mixed-deck combos. For each: which pieces are in the deck, which are missing, and whether Armillaria (the wild) can finish it.
export function comboStatus(cards, owned = {}) {
  const inDeck = new Set(cards), wild = inDeck.has("mycelium");
  return HALO_COMBOS.map((co) => {
    const named = co.parts.filter((x) => !x.startsWith("kInd_")), basic = co.parts.find((x) => x.startsWith("kInd_"));
    const have = named.filter((x) => inDeck.has(x)), own = named.filter((x) => owned[x]);
    const ready = have.length === 2 || (have.length === 1 && wild);
    const gap = have.length === 1 && wild ? named.find((x) => !inDeck.has(x)) : null;   // the piece Armillaria stands in for
    return { ...co, named, basic, have, own, ready, gap, basicIn: inDeck.has(basic), canBuild: own.length === 2 || (own.length === 1 && !!owned.mycelium) };
  });
}

// fill the empty places with basics. First the basic each READY combo needs (six of it, so it turns up), then the
// grunt / soldier / wall / heavy mix of every planet (4 · 4 · 2 · 1)
export function fillWithBasics(cards) {
  const out = cards.slice();
  for (const co of comboStatus(out)) if (co.ready) for (let k = out.filter((x) => x === co.basic).length; k < 6 && out.length < DECK_SIZE; k++) out.push(co.basic);
  const mix = ["kInd_grunt", "kInd_soldier", "kInd_grunt", "kInd_soldier", "kInd_wall", "kInd_grunt", "kInd_soldier", "kInd_heavy", "kInd_grunt", "kInd_soldier", "kInd_wall"];
  for (let i = 0; out.length < DECK_SIZE; i++) out.push(mix[i % mix.length]);
  return out;
}

// the link the game reads (public/halo/play/index.html, readDraft): #draft=<base64url JSON>
// `road` (your road, from the binder) gives the deck its road perks at the table
export function playLink(root, deck, who, boss, road) {
  const json = JSON.stringify({ v: 1, who: who || "Your Draft deck", cmd: deck.cmd, cards: deck.cards, road: road || null });
  const b64 = btoa(unescape(encodeURIComponent(json))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${root}#draft=${b64}${boss ? `&boss=${boss}` : ""}`;
}
