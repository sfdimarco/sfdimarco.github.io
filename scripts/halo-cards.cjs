// Builds src/content/haloCards.js from the HALO rules engine in .geo/halo (cards.js, kits.js, engine.js, picks.js).
//   node scripts/halo-cards.cjs [path to .geo/halo]
// Run it again whenever the card data changes. The site never imports the engine itself: it ships this snapshot.
//
// The pool: the 69 real cards (no "_b" rebalance copies, no kit cards). Numbers are the ones the table PLAYS
// (the "_b" numbers where the rebalance is on), so a card in the binder reads the same as in the game.
// Basics: the four core kit roles (grunt, soldier, wall, heavy), free and unlimited in Draft Night deck building.
"use strict";
const fs = require("fs"), path = require("path");
const HALO = process.argv[2] || "D:/Mook/Documents/Claude/Projects/.geo/halo";
const { C, DECKS, LIB, REBAL } = require(path.join(HALO, "cards.js"));
const E = require(path.join(HALO, "engine.js"));
const P = require(path.join(HALO, "picks.js"));

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const plays = (id) => (P.bal && REBAL[id] ? C[REBAL[id]] : C[id]);

// whose deck a card comes from (the first deck that lists it)
const owner = {};
for (const [k, d] of Object.entries(DECKS)) {
  if (d.kit) continue;
  owner[d.commander] = owner[d.commander] || d.who;
  for (const id of [...d.cards, ...(LIB[k] || [])]) owner[id] = owner[id] || d.who;
}
for (const co of [["gravdrive", "Rose"], ["portroyal", "Mook"], ["archcity", "Finley"], ["lab", "Rose"],
  // 11-23: the mixed-deck combos (two decks each) and Mush's wild fungus
  ["mycelium", "Mush"], ["misadventure", "Mook & Mush"], ["libertalia", "Mook & Gil"], ["dilmun", "Mush & Tortimer"], ["uraniborg", "Rose & Leo"], ["palais", "Bronconius & Finley"], ["hamelin", "The Fhat & Gil"]]) owner[co[0]] = owner[co[0]] || co[1];

function words(c) {
  if (c.type === "trap") return `Set face down on a square. It ${E.TRIG[c.trig]}.`;
  if (c.type === "action") return c.fx === "barrage" ? `Knock out one enemy front card with D ${P.barrageD || 3} or less.` : c.fx === "siege" ? "Knock out one enemy front card with D 6 or more." : cap(E.FX[c.fx]) + ".";
  if (c.type === "commander") return `Lose them and you are out. Big move, once a game: ${E.BIG[c.big]}.`;
  const t = [c.type === "structure" ? "Blocks a lane; does not attack." : ""];
  if (c.move === "smite") t.push("Papal Smite: after a turn on the grid, put out any one enemy ring.");
  if (c.income) t.push(`Pays +${c.income} ECON at the start of your turn.`);
  if (c.tags.includes("runner")) t.push("Runner: may attack any empty enemy lane.");
  if (c.tags.includes("anylane")) t.push("Reach: may attack any lane of any enemy.");
  if (c.tags.includes("grav")) t.push("LUCY + IKAROS + GW150914 in a line fuse into THE GRAV DRIVE.");
  if (c.tags.includes("part") || c.tags.includes("core")) t.push("The great machine: Core in the middle, Parts on the other eight squares, and you win.");
  if (c.tags.includes("lab")) t.push("You draw one more card a turn.");
  // 11-23 night, v3 keywords
  if (c.tags.includes("flank")) t.push("FLANK: may attack the lane next to its own.");
  if (c.tags.includes("volley")) t.push("VOLLEY: fires from any row, straight across its lane.");
  if (c.tags.includes("pierce")) t.push("PIERCE: may hit the card BEHIND the front one.");
  if (c.tags.includes("ally")) t.push("ALLY: may be played on a team-mate's empty square, to fight for them.");
  if (c.tags.includes("banner")) t.push("BANNER: your units and your team-mates' units in this lane get +1 A.");
  if (c.tags.includes("forge") && c.spawns) t.push(`Start of your turn${c.needRing !== undefined ? ", Population lit" : ""}: ${/^[AEIOU]/i.test(C[c.spawns].name) ? "an" : "a"} ${C[c.spawns].name} (A ${C[c.spawns].A} D ${C[c.spawns].D}) appears on an empty square next to it.`);
  if (c.tags.includes("nurture")) t.push("TRAIN: start of your turn, one unit next to it gets +1 A and +1 D (up to +3).");
  if (c.ramp) t.push(`Its income grows by 1 each turn it stands (up to +${c.income + c.ramp}).`);
  if (c.tags.includes("kontor")) t.push("While it stands, your units cost 1 less (never below 1).");
  if (c.tags.includes("faith")) t.push("FAITH +1: you can convert bigger units.");
  if (c.tags.includes("crowd") && c.type === "structure") t.push("Counts in your crowd.");
  if (c.tags.includes("token")) t.push("A token: made on the table, never in a deck.");
  if (c.tags.includes("wild")) t.push("Wild: in a combo line it stands in for any ONE missing card.");
  const base = c.id.replace(/_b$/, ""), nm = (x) => (/^kInd_/.test(x) ? `a ${cap(x.slice(5))} basic (${C[x].name})` : C[x].name);
  const co = E.COMBOS.find((x) => x.makes === base);
  if (c.tags.includes("fused")) t.push(co ? `Made, not played: ${co.parts.map(nm).join(" + ")} in a line fuse into it.` : "Made, not played: three cards in a line fuse into it.");
  for (const x of E.COMBOS) if (x.mix && x.parts.includes(base)) t.push(`Combo: with ${x.parts.filter((y) => y !== base).map(nm).join(" + ")} in a line = ${C[x.makes].name}.`);
  return t.filter(Boolean).join(" ");
}

// 🆕 rarity (Claude's rule, for Mook's tick): commanders are hits; fused cards and the big ones are rare;
// actions, traps and the special pieces are uncommon; plain cheap bodies are common.
function rarity(c) {
  if (c.type === "commander") return "commander";
  if (c.tags.includes("token")) return "token";   // made on the table: never in a pack
  if (c.tags.includes("fused")) return "rare";
  if ((c.econ || 0) >= 5 || (c.A || 0) + (c.D || 0) >= 11 || (c.A || 0) >= 7 || c.move === "smite" || c.tags.includes("core")) return "rare";
  if (c.type === "action" || c.type === "trap" || c.income || c.tags.some((t) => ["grav", "runner", "anylane", "part", "science", "wild"].includes(t)) || (c.econ || 0) >= 3) return "uncommon";
  return "common";
}

// 11-23 night: the ROAD cards. Each road's own role cards (from the ring kits, named and drawn) join the set, so a player can build toward a road.
const ROAD_KIT = { industry: "kInd", economy: "kEco", science: "kSci", food: "kFood", pop: "kPop", politics: "kPol", religion: "kRel" };
const KIT_ROLES = { kInd: ["brute", "runner", "barrage"], kEco: ["market", "banker", "takeover"], kSci: ["part", "core", "scientist"], kFood: ["farm", "harvester", "seed"], kPop: ["villager", "guard"], kPol: ["envoy", "diplomat"], kRel: ["sigil", "preacher", "acolyte", "revival"] };
const ROAD_OF_KIT = Object.fromEntries(Object.entries(ROAD_KIT).map(([r, k]) => [k, r]));
const ROAD_WHO = { industry: "the Industry road", economy: "the Economy road", science: "the Science road", food: "the Food road", pop: "the Population road", politics: "the Politics road", religion: "the Religion road" };
const roadCards = Object.entries(KIT_ROLES).flatMap(([k, roles]) => roles.map((r) => `${k}_${r}`));
const real = [...Object.keys(C).filter((id) => !id.endsWith("_b") && !C[id].kit), ...roadCards];
const cards = real.map((id, i) => {
  const c = plays(id);
  return {
    id, no: i + 1, name: c.name, type: c.type,
    A: c.type === "action" || c.type === "trap" ? null : c.A, D: c.type === "action" || c.type === "trap" ? null : c.D,
    cost: c.tags.includes("fused") || c.type === "commander" ? null : c.econ,
    rarity: rarity(c), who: owner[id] || (c.road && ROAD_WHO[c.road]) || (C[id].kit && ROAD_WHO[ROAD_OF_KIT[C[id].kit]]) || "the library",
    road: c.road || (C[id].kit && ROAD_OF_KIT[C[id].kit]) || null,
    deckable: c.type !== "commander" && !c.tags.includes("fused") && !c.tags.includes("token"),
    tags: c.tags.filter((t) => t !== "fused"), fused: c.tags.includes("fused"),
    text: words(c), noName: /no name yet/.test(c.name),
  };
});
const basics = ["grunt", "soldier", "wall", "heavy"].map((r) => {
  const c = C["kInd_" + r];
  return { id: c.id, no: null, name: cap(r), type: c.type, A: c.A, D: c.D, cost: c.econ, rarity: "basic", who: "every planet", deckable: true, tags: [], fused: false, text: words(c), noName: false };
});
// the cast as bosses for the bounty board: every show deck (not the kit test decks), with its commander
let bosses = Object.entries(DECKS).filter(([, d]) => !d.kit).map(([key, d]) => ({ key, who: d.who, cmd: d.commander }));

// 11-23: the mixed-deck combos (cards.js MIX_COMBOS), for Draft Night's "combos you can make"
const combos = E.COMBOS.filter((co) => co.mix).map((co) => ({ makes: co.makes, parts: co.parts }));
// 11-23: how hard each boss is for a Draft Night deck (_scratch/mixed.js, 2 160 games, bots on both sides). Easy first.
const TIER = { fhat: 1, gil: 1, leo: 1, mook: 2, mush: 2, bronconius: 2, finley: 3, tortimer: 3, rose: 3 };
bosses.forEach((b) => (b.tier = TIER[b.key] || 2));
const ORDER = ["leo", "fhat", "gil", "mook", "mush", "bronconius", "finley", "tortimer", "rose"];   // Leo first: half asleep
bosses.sort((a, b) => a.tier - b.tier || ORDER.indexOf(a.key) - ORDER.indexOf(b.key));

// 11-23 night 🆕: ROAD STARTERS. Mush asks which road calls you; your FIRST Poptart is that road's commander + seven cards that walk it.
const STARTERS = {
  industry: { label: "Industry", win: "Knock every rival planet dark.", cmd: "barbarossa", cards: ["kInd_brute", "kInd_brute", "caracole", "hwacha", "corvus", "carroccio", "arsenale"] },
  economy: { label: "Economy", win: "Bank ECON and buy the win.", cmd: "rabbit", cards: ["kEco_market", "kEco_banker", "kEco_banker", "fondaco", "kontor", "vittles", "kEco_takeover"] },
  science: { label: "Science", win: "Build the great machine: a Core in the middle, Parts all round.", cmd: "titania", cards: ["kSci_core", "replicator", "replicator", "kSci_part", "kSci_part", "kSci_part", "kSci_scientist"] },
  food: { label: "Food", win: "Grow your rings back, turn after turn: the harvest.", cmd: "bloom", cards: ["kFood_farm", "kFood_farm", "kFood_harvester", "kFood_seed", "kFood_seed", "testudo", "palaestra"] },
  pop: { label: "Population", win: "Build villages that grow your crowd; fill all nine squares and hold.", cmd: "capone", cards: ["burgage", "burgage", "burgage", "kPop_villager", "kPop_villager", "kPop_guard", "arsenale"] },
  religion: { label: "Religion", win: "Convert their units to your side; hold two and win.", cmd: "doria", cards: ["damascus", "damascus", "reliquary", "reliquary", "kRel_acolyte", "kRel_preacher", "kRel_sigil"] },
  politics: { label: "Politics", win: "Make peace pacts with your rivals; hold them and win.", cmd: "arch", cards: ["kPol_envoy", "kPol_envoy", "kPol_envoy", "kPol_diplomat", "kPol_diplomat", "varangian", "testudo"] },
};
for (const st of Object.values(STARTERS)) for (const id of [st.cmd, ...st.cards]) if (!C[id]) throw new Error("starter card missing: " + id);

const out = `// GENERATED by scripts/halo-cards.cjs from .geo/halo/cards.js on ${new Date().toISOString().slice(0, 10)}. Do not edit by hand: run the script.
// ${cards.length} cards in the set (numbered in cards.js order) + ${basics.length} basics for Draft Night deck building.
export const HALO_CARDS = ${JSON.stringify(cards, null, 0).replace(/},{/g, "},\n  {")};
export const HALO_BASICS = ${JSON.stringify(basics, null, 0).replace(/},{/g, "},\n  {")};
export const HALO_BOSSES = ${JSON.stringify(bosses)};
export const HALO_COMBOS = ${JSON.stringify(combos)};
export const HALO_STARTERS = ${JSON.stringify(STARTERS)};
`;
fs.writeFileSync(path.join(__dirname, "..", "src", "content", "haloCards.js"), out);
const by = {}; cards.forEach((c) => (by[c.rarity] = by[c.rarity] || []).push(c.id));
for (const [k, v] of Object.entries(by)) console.log(k.padEnd(10), String(v.length).padStart(3), v.join(" "));
