import type { ItemId, LandmarkId, ResidentId } from "@/content/landmarks";
import { museumExhibits, skills } from "@/content/landmarks";
import { mulberry32, valueNoise } from "./rng";

/** Simulation grid. Land itself is a ~40×36 oval inside this, with void around it so the island floats. */
export const W = 64;
export const H = 56;
export const LEVEL = 1.28;
/** House-pond water sits just below the low terrace. */
export const WATER_Y = LEVEL - 0.2;

export type Dir = "N" | "S" | "E" | "W";
export type TileKind = "void" | "water" | "grass" | "sand" | "path" | "ramp" | "dock";

export type Tile = {
  i: number;
  j: number;
  h: number;
  kind: TileKind;
  ramp?: Dir;
  rampK0?: number;
  rampK1?: number;
  blocked: boolean;
  shade: number;
  d: number;
};

export type Vec2 = { x: number; z: number };

export const tileCenter = (i: number, j: number): Vec2 => ({ x: i + 0.5 - W / 2, z: j + 0.5 - H / 2 });
export const worldToTile = (x: number, z: number) => ({ i: Math.floor(x + W / 2), j: Math.floor(z + H / 2) });

const noise = valueNoise(7);
const rand = mulberry32(20260924);

const grid: Tile[] = [];
export const tileAt = (i: number, j: number): Tile | undefined =>
  i < 0 || j < 0 || i >= W || j >= H ? undefined : grid[j * W + i];

const inEllipse = (i: number, j: number, cx: number, cz: number, rx: number, rz: number) => {
  const nx = (i + 0.5 - cx) / rx;
  const nz = (j + 0.5 - cz) / rz;
  return nx * nx + nz * nz < 1;
};

const CX = 32;
const CZ = 28;
// ~44×36 tiles of land: extra width on the west so the house pond has a shore.
for (let j = 0; j < H; j++) {
  for (let i = 0; i < W; i++) {
    const wobble = (noise(i * 0.18, j * 0.18) - 0.5) * 0.12;
    const rx = (i + 0.5 < CX ? 24 : 20) + wobble;
    const land = inEllipse(i, j, CX, CZ, rx, 18 + wobble * 0.8);
    const plateau = land && (inEllipse(i, j, 32, 14.5, 12.2, 8.2) || (i >= 31 && i <= 34 && j >= 16 && j <= 21));
    const bluff = land && (inEllipse(i, j, 46.5, 16.5, 5.4, 4.6) || (i >= 40 && i <= 47 && j >= 13 && j <= 18));
    grid.push({
      i,
      j,
      h: land ? (plateau || bluff ? 2 : 1) : 0,
      kind: land ? "grass" : "void",
      blocked: !land,
      shade: 0,
      d: 0,
    });
  }
}

{
  const q: Tile[] = [];
  for (const t of grid) {
    t.d = t.kind === "void" ? 0 : Infinity;
    if (t.kind === "void") q.push(t);
  }
  for (let k = 0; k < q.length; k++) {
    const t = q[k];
    for (const [di, dj] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const n = tileAt(t.i + di, t.j + dj);
      if (n && n.d > t.d + 1) {
        n.d = t.d + 1;
        q.push(n);
      }
    }
  }
}

/** House pond in tile space, with a walkable islet and a south front yard. */
export const pond = { x: 15.4, z: 38.2, rx: 7.6, rz: 4.6, isletX: 16.0, isletZ: 37.6, isletRx: 4.0, isletRz: 3.2 };
for (const t of grid) {
  if (t.kind === "void") continue;
  if (!inEllipse(t.i, t.j, pond.x, pond.z, pond.rx, pond.rz)) continue;
  if (inEllipse(t.i, t.j, pond.isletX, pond.isletZ, pond.isletRx, pond.isletRz)) continue;
  t.kind = "water";
  t.blocked = true;
  t.h = 1;
}

/** Pond spills south over the rim as a short river, then falls off the island. */
export const stream = { i0: 15, i1: 18, j0: 41, j1: 45 };
for (let j = stream.j0; j <= stream.j1; j++) {
  for (let i = stream.i0; i <= stream.i1; i++) {
    const t = tileAt(i, j);
    if (!t) continue;
    t.kind = "water";
    t.blocked = true;
    t.h = 1;
  }
}

export const stairs: { i: number; j: number; h: number; dir: Dir }[] = [];
function addRampTile(t: Tile, fromLevel: number, k0: number, k1: number) {
  t.kind = "ramp";
  t.ramp = "N";
  t.h = fromLevel;
  t.rampK0 = k0;
  t.rampK1 = k1;
  t.blocked = false;
  stairs.push({ i: t.i, j: t.j, h: fromLevel, dir: "N" });
}
for (const i of [32, 33]) {
  const upper = tileAt(i, 21);
  const lower = tileAt(i, 22);
  if (upper && lower && upper.kind !== "void" && lower.kind !== "void") {
    addRampTile(upper, 1, 1, 0.5);
    addRampTile(lower, 1, 0.5, 0);
  }
}

export type RampRun = { i0: number; i1: number; j0: number; j1: number; h: number; dir: Dir };
export const rampRuns: RampRun[] = [];
{
  const seen = new Set<string>();
  const isRamp = (i: number, j: number, h: number, dir: Dir) =>
    stairs.some((s) => s.i === i && s.j === j && s.h === h && s.dir === dir);
  for (const s of stairs) {
    const start = `${s.i},${s.j}`;
    if (seen.has(start)) continue;
    const stack = [[s.i, s.j]];
    const cells: [number, number][] = [];
    while (stack.length) {
      const [ci, cj] = stack.pop()!;
      const key = `${ci},${cj}`;
      if (seen.has(key) || !isRamp(ci, cj, s.h, s.dir)) continue;
      seen.add(key);
      cells.push([ci, cj]);
      stack.push([ci + 1, cj], [ci - 1, cj], [ci, cj + 1], [ci, cj - 1]);
    }
    rampRuns.push({
      i0: Math.min(...cells.map((c) => c[0])),
      i1: Math.max(...cells.map((c) => c[0])),
      j0: Math.min(...cells.map((c) => c[1])),
      j1: Math.max(...cells.map((c) => c[1])),
      h: s.h,
      dir: s.dir,
    });
  }
}

const paint = (i0: number, j0: number, i1: number, j1: number) => {
  for (let j = Math.min(j0, j1); j <= Math.max(j0, j1); j++)
    for (let i = Math.min(i0, i1); i <= Math.max(i0, i1); i++) {
      const t = tileAt(i, j);
      if (t && (t.kind === "grass" || t.kind === "sand")) t.kind = "path";
    }
};

const bridge = (i0: number, j0: number, i1: number, j1: number) => {
  for (let j = Math.min(j0, j1); j <= Math.max(j0, j1); j++)
    for (let i = Math.min(i0, i1); i <= Math.max(i0, i1); i++) {
      const t = tileAt(i, j);
      if (!t || t.kind === "void") continue;
      t.kind = "path";
      t.blocked = false;
      t.h = 1;
    }
};

// Southern beach crescent — the whole south apron is sand, no leftover grass patches.
for (const t of grid) {
  if (t.kind !== "grass" || t.h !== 1) continue;
  if (t.j >= 40) t.kind = "sand";
}

// Spine: spawn / plaza / stairs / museum. District spokes stay short.
paint(32, 42, 33, 23); // beach → stairs
paint(32, 20, 33, 13); // stairs top → museum door
paint(30, 28, 35, 32); // plaza hub
paint(16, 39, 31, 40); // house door → spine
paint(24, 29, 31, 29); // town hall front
paint(18, 33, 24, 33); // garden front
paint(35, 28, 40, 28); // → arcade
paint(36, 29, 39, 32); // → market
bridge(16, 39, 24, 40); // across the house pond, on the door line

export const dock = { i0: 32, i1: 33, j0: 43, j1: 47 };
for (let jj = dock.j0; jj <= dock.j1; jj++)
  for (let ii = dock.i0; ii <= dock.i1; ii++) {
    const t = tileAt(ii, jj);
    if (!t) continue;
    t.kind = "dock";
    t.h = 1;
    t.blocked = false;
  }

export type LandmarkPlacement = {
  id: LandmarkId;
  rect: [number, number, number, number];
  level: number;
  center: Vec2;
  interact: Vec2;
  radius: number;
};

const block = (i0: number, j0: number, i1: number, j1: number) => {
  for (let j = j0; j <= j1; j++)
    for (let i = i0; i <= i1; i++) {
      const t = tileAt(i, j);
      if (t) t.blocked = true;
    }
};

const place = (id: LandmarkId, rect: [number, number, number, number], interactOffset = 1.25, radius = 2.0): LandmarkPlacement => {
  const [i0, j0, i1, j1] = rect;
  block(i0, j0, i1, j1);
  const a = tileCenter(i0, j0);
  const b = tileCenter(i1, j1);
  const center = { x: (a.x + b.x) / 2, z: (a.z + b.z) / 2 };
  return {
    id,
    rect,
    level: tileAt(i0, j0)!.h,
    center,
    interact: { x: center.x, z: b.z + interactOffset },
    radius,
  };
};

export const landmarkPlacements: LandmarkPlacement[] = [
  place("house", [15, 36, 17, 38]),
  place("townhall", [24, 26, 27, 28], 1.3, 2.3),
  place("museum", [31, 10, 34, 12], 1.2, 1.8),
  place("arcade", [38, 26, 40, 27], 1.1, 1.6),
  place("market", [38, 31, 39, 32], 1.15, 1.9),
  place("garden", [18, 30, 23, 32], 1.2, 1.7),
];
{
  const end = tileCenter(32, dock.j1);
  landmarkPlacements.push({
    id: "dock",
    rect: [dock.i0, dock.j0, dock.i1, dock.j1],
    level: 1,
    center: { x: end.x + 0.4, z: end.z - 0.6 },
    interact: { x: end.x + 0.3, z: end.z + 0.4 },
    radius: 1.6,
  });
}

export const gardenGate = (() => {
  const g = landmarkPlacements.find((l) => l.id === "garden")!;
  const [i0, , i1, j1] = g.rect;
  return tileCenter(Math.round((i0 + i1) / 2), j1);
})();
{
  const g = landmarkPlacements.find((l) => l.id === "garden")!;
  g.interact = { x: gardenGate.x, z: gardenGate.z + 1.15 };
}
{
  const m = landmarkPlacements.find((l) => l.id === "market")!;
  const [i0] = m.rect;
  const west = tileCenter(i0, m.rect[1]);
  m.interact = { x: west.x - 1.2, z: m.center.z };
}

export const getPlacement = (id: LandmarkId) => landmarkPlacements.find((l) => l.id === id)!;

export const mailboxTile = { i: 18, j: 39 };
export const boardTile = { i: 28, j: 29 };
block(mailboxTile.i, mailboxTile.j, mailboxTile.i, mailboxTile.j);
block(boardTile.i, boardTile.j, boardTile.i, boardTile.j);

export const pedestals = museumExhibits.map((slug, k) => {
  const left = k < 3;
  const i = left ? 29 + k : 34 + (k - 3);
  const j = 14;
  block(i, j, i, j);
  const c = tileCenter(i, j);
  return { slug, i, j, x: c.x, z: c.z, level: 2, interact: { x: c.x, z: c.z + 0.95 } };
});

export const gardenRows = skills.map((skill, k) => {
  const i = 18 + k;
  const top = tileCenter(i, 30);
  const front = tileCenter(i, 32);
  return {
    skillId: skill.id,
    i,
    x: top.x,
    z0: top.z - 0.15,
    z1: front.z + 0.15,
    level: 1,
    interact: { x: top.x, z: front.z + 1.2 },
  };
});

export type TreeKind = "round" | "blossom" | "pine" | "fruit";
export type TreeSpot = { kind: TreeKind; x: number; z: number; y: number; s: number; seed: number; item?: ItemId };

const reserved = new Set<number>();
const reserve = (i: number, j: number, r = 1) => {
  for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) reserved.add((j + dj) * W + (i + di));
};
for (const t of grid) if (t.kind === "path" || t.kind === "ramp" || t.kind === "dock" || t.kind === "sand") reserve(t.i, t.j, 1);
for (const l of landmarkPlacements) {
  const [i0, j0, i1, j1] = l.rect;
  for (let j = j0 - 1; j <= j1 + 2; j++) for (let i = i0 - 1; i <= i1 + 1; i++) reserve(i, j, 0);
}
for (const p of pedestals) reserve(p.i, p.j, 1);

const free = (t: Tile | undefined) => !!t && t.kind === "grass" && !t.blocked && !reserved.has(t.j * W + t.i);

export const trees: TreeSpot[] = [];
const plant = (kind: TreeKind, i: number, j: number, s = 1, item?: ItemId) => {
  const t = tileAt(i, j);
  if (!t || t.kind === "void" || t.kind === "water") return;
  t.blocked = true;
  const c = tileCenter(i, j);
  trees.push({ kind, x: c.x, z: c.z, y: t.h * LEVEL, s, seed: rand(), item });
  reserve(i, j, kind === "pine" ? 0 : 1);
};

plant("fruit", 14, 35, 1, "sunpeach");
plant("fruit", 18, 35, 1, "honeypear");
plant("fruit", 13, 37, 0.95, "cloudberry");

// Secret Grove (northwest): a dense blossom thicket.
for (const [i, j, s] of [
  [13, 16, 1.05],
  [15, 15, 1],
  [17, 17, 0.95],
  [14, 19, 1.1],
  [16, 20, 0.9],
  [12, 18, 1],
  [18, 15, 0.95],
  [19, 18, 1],
  [13, 22, 0.9],
  [15, 23, 1.05],
] as const) {
  if (free(tileAt(i, j))) plant("blossom", i, j, s);
}

// A few orchard blossoms near the house and plaza.
for (const [i, j, s] of [
  [21, 35, 1],
  [22, 40, 0.95],
  [36, 35, 1],
  [28, 34, 0.9],
  [40, 22, 1],
] as const) {
  if (free(tileAt(i, j))) plant("blossom", i, j, s);
}

// Lighthouse bluff (northeast): a tight pine stand on the high ground.
for (const [i, j, s] of [
  [45, 14, 1.15],
  [48, 15, 1.05],
  [46, 18, 1],
  [49, 17, 0.95],
  [44, 16, 1.1],
] as const) {
  if (free(tileAt(i, j))) plant("pine", i, j, s);
}

// Pine ring on the outer low ground, skipping the southern beach.
for (const t of grid) {
  if (t.h !== 1 || t.d > 2 || t.j >= 41) continue;
  if (!free(t)) continue;
  if ((t.i + t.j) % 2 !== 0) continue;
  plant("pine", t.i, t.j, 0.88 + rand() * 0.28);
}

for (const [i, j, s] of [
  [22, 24, 1],
  [36, 24, 1],
  [26, 34, 0.9],
  [40, 34, 0.95],
  [29, 16, 0.85],
  [36, 12, 0.9],
  [22, 12, 1],
  [41, 20, 0.9],
] as const) {
  if (free(tileAt(i, j))) plant("round", i, j, s);
}

export type PropSpot = { x: number; z: number; y: number; s: number; r: number; c: number };
export const tufts: PropSpot[] = [];
export const flowers: PropSpot[] = [];
export const rocks: PropSpot[] = [];
for (const t of grid) {
  if (t.kind !== "grass" || t.blocked) continue;
  const c = tileCenter(t.i, t.j);
  const y = t.h * LEVEL;
  const grove = t.i <= 20 && t.j <= 24 && t.h === 1;
  const n = t.d <= 2 ? 1 + Math.floor(rand() * 2) : rand() < 0.4 ? 1 : 0;
  for (let k = 0; k < n; k++)
    tufts.push({ x: c.x + (rand() - 0.5) * 0.75, z: c.z + (rand() - 0.5) * 0.75, y, s: 0.7 + rand() * 0.5, r: rand() * Math.PI, c: 0 });
  const bloom = grove ? 0.55 : t.d <= 2 ? 0.4 : 0.14;
  if (!reserved.has(t.j * W + t.i) && rand() < bloom) {
    const count = 1 + Math.floor(rand() * 3);
    const c0 = Math.floor(rand() * 4);
    for (let k = 0; k < count; k++)
      flowers.push({ x: c.x + (rand() - 0.5) * 0.65, z: c.z + (rand() - 0.5) * 0.65, y, s: 0.85 + rand() * 0.35, r: rand() * 6, c: (c0 + (k % 2)) % 4 });
  }
  if (!reserved.has(t.j * W + t.i) && t.d <= 2 && rand() < 0.1) {
    rocks.push({ x: c.x + (rand() - 0.5) * 0.3, z: c.z + (rand() - 0.5) * 0.3, y, s: 0.4 + rand() * 0.35, r: rand() * 6, c: 0 });
  }
}

for (const t of grid) t.shade = 0;

const nearestWalkable = (i: number, j: number) => {
  for (let r = 0; r < 6; r++)
    for (let dj = -r; dj <= r; dj++)
      for (let di = -r; di <= r; di++) {
        const t = tileAt(i + di, j + dj);
        if (t && !t.blocked && t.kind !== "water" && t.kind !== "void" && t.kind !== "ramp") return t;
      }
  return tileAt(i, j)!;
};

export type PickupSpot = { id: string; item: ItemId; x: number; z: number; y: number };
const pickup = (item: ItemId, i: number, j: number): PickupSpot => {
  const t = nearestWalkable(i, j);
  const c = tileCenter(t.i, t.j);
  return { id: `ground-${item}`, item, x: c.x, z: c.z, y: t.h * LEVEL };
};
export const pickups: PickupSpot[] = [
  pickup("spiral-shell", 30, 42),
  pickup("sand-dollar", 36, 41),
  pickup("pink-cowrie", 27, 42),
  pickup("moon-snail", 22, 41),
  pickup("taxi-token", 31, 29),
  pickup("lightning-jar", 37, 25),
  pickup("carbon-offcut", 40, 30),
  pickup("tiny-cartridge", 14, 18),
  pickup("pixel-petal", 46, 18),
];

export const spawn = (() => {
  const c = tileCenter(32, 40);
  return { x: c.x + 0.5, z: c.z };
})();

export const residentHomes: Record<ResidentId, Vec2[]> = {
  bramble: [tileCenter(34, 36), tileCenter(30, 34), tileCenter(35, 32)],
  drizzle: [tileCenter(32, 27), tileCenter(28, 30), tileCenter(25, 32)],
  pip: [tileCenter(37, 28), tileCenter(41, 28), tileCenter(39, 25)],
  sol: [tileCenter(32, 16), tileCenter(35, 14), tileCenter(30, 15)],
};

export const tiles = grid;

export function heightAt(x: number, z: number): number {
  const { i, j } = worldToTile(x, z);
  const t = tileAt(i, j);
  if (!t || t.kind === "void") return 0;
  if (t.kind !== "ramp") return t.h * LEVEL;
  const fz = z + H / 2 - j;
  const u = Math.min(1, Math.max(0, fz));
  const k0 = t.rampK0 ?? 1;
  const k1 = t.rampK1 ?? 0;
  return (t.h + k0 + (k1 - k0) * u) * LEVEL;
}

export function isWalkable(x: number, z: number): boolean {
  const { i, j } = worldToTile(x, z);
  const t = tileAt(i, j);
  return !!t && !t.blocked && t.kind !== "water" && t.kind !== "void";
}

export function canStep(fromX: number, fromZ: number, toX: number, toZ: number): boolean {
  if (!isWalkable(toX, toZ)) return false;
  const from = tileAt(worldToTile(fromX, fromZ).i, worldToTile(fromX, fromZ).j);
  const to = tileAt(worldToTile(toX, toZ).i, worldToTile(toX, toZ).j);
  if (!from || !to) return false;
  const dh = Math.abs(heightAt(toX, toZ) - heightAt(fromX, fromZ));
  if (from.kind === "ramp" || to.kind === "ramp") return dh <= LEVEL + 0.25;
  if (from.h === to.h) return true;
  return dh < 0.5;
}

export const bounds = { minX: -W / 2, maxX: W / 2, minZ: -H / 2, maxZ: H / 2 };

export function asciiMap() {
  const rows: string[] = [];
  for (let j = 0; j < H; j++) {
    let row = "";
    for (let i = 0; i < W; i++) {
      const t = tileAt(i, j)!;
      const tree = trees.find((tr) => worldToTile(tr.x, tr.z).i === i && worldToTile(tr.x, tr.z).j === j);
      const lm = landmarkPlacements.find((l) => i >= l.rect[0] && j >= l.rect[1] && i <= l.rect[2] && j <= l.rect[3]);
      if (t.kind === "void") row += " ";
      else if (t.kind === "water") row += "~";
      else if (t.kind === "dock") row += "=";
      else if (t.kind === "ramp") row += "^";
      else if (lm) row += lm.id[0]!.toUpperCase();
      else if (tree) row += tree.kind === "pine" ? "A" : tree.kind === "fruit" ? "F" : tree.kind === "blossom" ? "B" : "T";
      else if (t.blocked) row += "#";
      else if (t.kind === "path") row += ":";
      else if (t.kind === "sand") row += ".";
      else row += String(t.h);
    }
    rows.push(row);
  }
  return rows.join("\n");
}
