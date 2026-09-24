import type { ItemId, LandmarkId, ResidentId } from "@/content/landmarks";
import { museumExhibits, skills } from "@/content/landmarks";
import { mulberry32, valueNoise } from "./rng";

export const W = 52;
export const H = 44;
export const LEVEL = 1.35;
export const WATER_Y = LEVEL - 0.4;

export type Dir = "N" | "S" | "E" | "W";
export type TileKind = "water" | "grass" | "sand" | "path" | "ramp" | "dock";

export type Tile = {
  i: number;
  j: number;
  h: number;
  kind: TileKind;
  ramp?: Dir;
  /** Height mix at fz=0 / fx=0 (north or west edge), 0–1 above `h`. */
  rampK0?: number;
  /** Height mix at fz=1 / fx=1 (south or east edge), 0–1 above `h`. */
  rampK1?: number;
  blocked: boolean;
  shade: number;
  /** Distance to open sea, in tiles. */
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

// ── 1. Island mask ─────────────────────────────────────────────
const CX = 26;
const CZ = 22;
for (let j = 0; j < H; j++) {
  for (let i = 0; i < W; i++) {
    const nx = (i + 0.5 - CX) / 22;
    const nz = (j + 0.5 - CZ) / 18;
    const wobble = (noise(i * 0.18, j * 0.18) - 0.5) * 0.28;
    const land = nx * nx + nz * nz < 1 + wobble;
    grid.push({ i, j, h: land ? 1 : 0, kind: land ? "grass" : "water", blocked: !land, shade: 0, d: 0 });
  }
}

// ── 2. Distance to sea (BFS) ───────────────────────────────────
{
  const q: Tile[] = [];
  for (const t of grid) {
    t.d = t.kind === "water" ? 0 : Infinity;
    if (t.kind === "water") q.push(t);
  }
  for (let k = 0; k < q.length; k++) {
    const t = q[k];
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const n = tileAt(t.i + di, t.j + dj);
      if (n && n.d > t.d + 1) {
        n.d = t.d + 1;
        q.push(n);
      }
    }
  }
}

// ── 3. Beach, tiers ────────────────────────────────────────────
const superellipse = (i: number, j: number, cx: number, cz: number, rx: number, rz: number, p: number) =>
  Math.abs((i + 0.5 - cx) / rx) ** p + Math.abs((j + 0.5 - cz) / rz) ** p < 1;

for (const t of grid) {
  if (t.kind === "water") continue;
  const beachWidth = t.j > 30 ? 3 : 2;
  if (t.d <= beachWidth) t.kind = "sand";
  if (t.d >= 4 && superellipse(t.i, t.j, 26, 16, 16, 8.2, 4)) t.h = 2;
}
for (let j = 10; j <= 16; j++) {
  for (let i = 29; i <= 39; i++) {
    const corner = (i === 29 || i === 39) && (j === 10 || j === 16);
    const t = tileAt(i, j)!;
    if (!corner && t.h === 2) t.h = 3;
  }
}

// ── 4. Pond ────────────────────────────────────────────────────
export const pond = { x: 11, z: 25, rx: 3, rz: 2.1 };
for (const t of grid) {
  const nx = (t.i + 0.5 - pond.x) / pond.rx;
  const nz = (t.j + 0.5 - pond.z) / pond.rz;
  if (t.h === 1 && nx * nx + nz * nz < 1) {
    t.kind = "water";
    t.blocked = true;
  }
}

// ── 5. Slopes (Animal Crossing ramps, two tiles deep) ──────────
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
function addStairsNorth(cols: number[], fromLevel: number) {
  for (const i of cols) {
    let edge = -1;
    for (let j = 0; j < H; j++) if (tileAt(i, j)?.h === fromLevel + 1) edge = j;
    if (edge < 0) continue;
    const upper = tileAt(i, edge + 1);
    const lower = tileAt(i, edge + 2);
    const usable = (t: Tile | undefined): t is Tile => !!t && t.kind !== "water" && t.kind !== "dock" && t.h <= fromLevel + 1;
    if (usable(upper) && usable(lower)) {
      addRampTile(upper, fromLevel, 1, 0.5);
      addRampTile(lower, fromLevel, 0.5, 0);
    } else if (usable(upper)) {
      addRampTile(upper, fromLevel, 1, 0);
    }
  }
}
addStairsNorth([24, 25, 26, 27], 1);
addStairsNorth([15, 16], 1);
addStairsNorth([33, 34, 35], 2);

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

// ── 6. Paths ───────────────────────────────────────────────────
const paint = (i0: number, j0: number, i1: number, j1: number) => {
  for (let j = Math.min(j0, j1); j <= Math.max(j0, j1); j++)
    for (let i = Math.min(i0, i1); i <= Math.max(i0, i1); i++) {
      const t = tileAt(i, j);
      if (t && (t.kind === "grass" || t.kind === "sand")) t.kind = "path";
    }
};
paint(25, 34, 26, 24); // spawn → main slope
paint(24, 33, 27, 27); // wide approach onto the main slope
paint(18, 31, 26, 32); // → house
paint(26, 34, 32, 35); // → dock
paint(31, 34, 32, 37);
paint(26, 29, 37, 30); // → market
paint(15, 24, 16, 30); // west slope → house path
paint(15, 31, 18, 32);
paint(25, 14, 26, 23); // lvl2 trunk → town hall
paint(15, 19, 40, 20); // lvl2 avenue
paint(15, 20, 16, 23); // → west slope top
paint(33, 16, 35, 20); // → plateau slope
paint(30, 15, 38, 16); // plateau walkway
paint(34, 13, 35, 14);

// ── 7. Dock (walkable planks over the sea) ─────────────────────
export const dock = { i0: 31, i1: 32, j0: 0, j1: 0 };
{
  let j = 34;
  while (tileAt(31, j)!.kind !== "water") j++;
  dock.j0 = j;
  dock.j1 = j + 4;
  for (let jj = dock.j0; jj <= dock.j1; jj++)
    for (let ii = dock.i0; ii <= dock.i1; ii++) {
      const t = tileAt(ii, jj)!;
      t.kind = "dock";
      t.h = 1;
      t.blocked = false;
    }
}

// ── 8. Landmarks ───────────────────────────────────────────────
export type LandmarkPlacement = {
  id: LandmarkId;
  /** Footprint in tiles, inclusive. */
  rect: [number, number, number, number];
  level: number;
  center: Vec2;
  interact: Vec2;
  radius: number;
};

const block = (i0: number, j0: number, i1: number, j1: number) => {
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) tileAt(i, j)!.blocked = true;
};

const place = (id: LandmarkId, rect: [number, number, number, number], interactOffset = 1.3, radius = 2.2): LandmarkPlacement => {
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
  place("house", [17, 28, 19, 30]),
  place("townhall", [23, 10, 27, 13], 1.4, 2.4),
  place("museum", [33, 10, 36, 12], 1.4, 2.2),
  place("market", [36, 27, 38, 28], 1.1),
  place("arcade", [38, 17, 40, 18], 1.2),
  place("garden", [11, 13, 18, 17], 1.4, 1.8),
];
{
  const end = tileCenter(31, dock.j1);
  landmarkPlacements.push({
    id: "dock",
    rect: [dock.i0, dock.j0, dock.i1, dock.j1],
    level: 1,
    center: { x: end.x + 0.5, z: end.z - 2 },
    interact: { x: end.x + 0.5, z: end.z - 0.3 },
    radius: 1.8,
  });
}
// Garden: the fence is solid; paths run along the front.
{
  const g = landmarkPlacements.find((l) => l.id === "garden")!;
  const gate = tileCenter(12, 17);
  g.interact = { x: gate.x, z: gate.z + 1.3 };
}

export const getPlacement = (id: LandmarkId) => landmarkPlacements.find((l) => l.id === id)!;

// Notice board beside Town Hall, mailbox by the house.
block(28, 13, 28, 13);
block(20, 30, 20, 30);

// ── 9. Museum pedestals ────────────────────────────────────────
export const pedestals = museumExhibits.map((slug, k) => {
  const i = k < 3 ? 30 + k : 34 + k; // 30,31,32 | 37,38,39
  const j = 14;
  block(i, j, i, j);
  const c = tileCenter(i, j);
  return { slug, i, j, x: c.x, z: c.z, level: 3, interact: { x: c.x, z: c.z + 1 } };
});

// ── 10. Garden rows (one per skill) ────────────────────────────
export const gardenRows = skills.map((skill, k) => {
  const i = 13 + k;
  const top = tileCenter(i, 14);
  const front = tileCenter(i, 17);
  return {
    skillId: skill.id,
    i,
    x: top.x,
    z0: top.z - 0.4,
    z1: front.z - 0.1,
    level: 2,
    interact: { x: top.x, z: front.z + 1.35 },
  };
});

// ── 11. Trees and props (seeded) ───────────────────────────────
export type TreeKind = "round" | "blossom" | "pine" | "fruit";
export type TreeSpot = { kind: TreeKind; x: number; z: number; y: number; s: number; seed: number; item?: ItemId };

const reserved = new Set<number>();
const reserve = (i: number, j: number, r = 1) => {
  for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) reserved.add((j + dj) * W + (i + di));
};
for (const t of grid) if (t.kind === "path" || t.kind === "ramp" || t.kind === "dock") reserve(t.i, t.j, 1);
for (const l of landmarkPlacements) {
  const [i0, j0, i1, j1] = l.rect;
  for (let j = j0 - 1; j <= j1 + 2; j++) for (let i = i0 - 1; i <= i1 + 1; i++) reserve(i, j, 0);
}
for (const p of pedestals) reserve(p.i, p.j, 1);

const free = (t: Tile | undefined) =>
  !!t && (t.kind === "grass" || t.kind === "sand") && !t.blocked && !reserved.has(t.j * W + t.i);

/** Only needs to stop at the edges of its own tier. */
const flatAround = (t: Tile) => {
  for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const n = tileAt(t.i + di, t.j + dj);
    if (!n || n.h !== t.h || n.kind === "water") return false;
  }
  return true;
};

export const trees: TreeSpot[] = [];
const plant = (kind: TreeKind, i: number, j: number, s = 1, item?: ItemId) => {
  const t = tileAt(i, j)!;
  t.blocked = true;
  const c = tileCenter(i, j);
  const jitter = kind === "pine" ? 0.18 : 0;
  trees.push({ kind, x: c.x + (rand() - 0.5) * jitter, z: c.z + (rand() - 0.5) * jitter, y: t.h * LEVEL, s, seed: rand(), item });
  reserve(i, j, kind === "pine" ? 0 : 1);
};

// Hand-placed fruit trees near the house and a blossom grove.
plant("fruit", 13, 27, 1, "sunpeach");
plant("fruit", 22, 27, 1, "honeypear");
plant("fruit", 20, 22, 1, "cloudberry");
for (const [i, j] of [[29, 26], [41, 24], [21, 16], [30, 22], [9, 20], [43, 31]] as const) {
  if (free(tileAt(i, j))) plant("blossom", i, j, 1);
}

// Dense pine border on the outer ring, fading toward the south so the camera stays open.
for (const t of grid) {
  if (!free(t) || t.kind !== "grass" || !flatAround(t)) continue;
  const southness = (t.j - 26) / 14;
  const ring = t.d >= 3 && t.d <= 6;
  const backRow = t.h >= 2 && t.j <= 12 && t.d <= 8;
  const chance = ring ? (southness > 0 ? 0.7 - southness * 0.75 : 0.9) : backRow ? 0.7 : 0;
  if (rand() < chance) plant("pine", t.i, t.j, 0.85 + rand() * 0.35);
}

// Scattered round trees inland.
for (const t of grid) {
  if (!free(t) || t.kind !== "grass" || !flatAround(t)) continue;
  if (t.d > 6 && rand() < 0.07) plant("round", t.i, t.j, 0.85 + rand() * 0.3);
}

export type PropSpot = { x: number; z: number; y: number; s: number; r: number; c: number };
export const tufts: PropSpot[] = [];
export const flowers: PropSpot[] = [];
export const rocks: PropSpot[] = [];
for (const t of grid) {
  if (t.kind !== "grass" || t.blocked) continue;
  const c = tileCenter(t.i, t.j);
  const y = t.h * LEVEL;
  const n = rand() < 0.55 ? 1 + Math.floor(rand() * 2) : 0;
  for (let k = 0; k < n; k++)
    tufts.push({ x: c.x + (rand() - 0.5) * 0.8, z: c.z + (rand() - 0.5) * 0.8, y, s: 0.7 + rand() * 0.6, r: rand() * Math.PI, c: 0 });
  if (!reserved.has(t.j * W + t.i) || rand() < 0.08) {
    if (rand() < 0.3) {
      const count = 1 + Math.floor(rand() * 3);
      const c0 = Math.floor(rand() * 4);
      for (let k = 0; k < count; k++)
        flowers.push({ x: c.x + (rand() - 0.5) * 0.7, z: c.z + (rand() - 0.5) * 0.7, y, s: 0.8 + rand() * 0.4, r: rand() * 6, c: (c0 + (k % 2)) % 4 });
    }
  }
  if (!reserved.has(t.j * W + t.i) && rand() < 0.02) {
    rocks.push({ x: c.x + (rand() - 0.5) * 0.4, z: c.z + (rand() - 0.5) * 0.4, y, s: 0.35 + rand() * 0.3, r: rand() * 6, c: 0 });
  }
}
for (const t of grid) {
  if (t.kind === "sand" && !t.blocked && rand() < 0.015) {
    const c = tileCenter(t.i, t.j);
    rocks.push({ x: c.x, z: c.z, y: t.h * LEVEL, s: 0.3 + rand() * 0.25, r: rand() * 6, c: 0 });
  }
}

// Shade patches: big soft noise blobs on grass.
for (const t of grid) t.shade = noise(t.i * 0.23 + 40, t.j * 0.23 + 40) > 0.58 ? 1 : 0;

// ── 12. Pickups and residents ──────────────────────────────────
const nearestWalkable = (i: number, j: number) => {
  for (let r = 0; r < 6; r++)
    for (let dj = -r; dj <= r; dj++)
      for (let di = -r; di <= r; di++) {
        const t = tileAt(i + di, j + dj);
        if (t && !t.blocked && t.kind !== "water" && t.kind !== "ramp") return t;
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
  pickup("spiral-shell", 22, 37),
  pickup("sand-dollar", 36, 35),
  pickup("pink-cowrie", 7, 34),
  pickup("moon-snail", 44, 30),
  pickup("taxi-token", 29, 12),
  pickup("lightning-jar", 39, 14),
  pickup("carbon-offcut", 41, 20),
  pickup("tiny-cartridge", 7, 26),
  pickup("pixel-petal", 42, 25),
];

export const spawn = (() => {
  const c = tileCenter(26, 33);
  return { x: c.x - 0.5, z: c.z };
})();

export const residentHomes: Record<ResidentId, Vec2[]> = {
  bramble: [tileCenter(28, 33), tileCenter(29, 31), tileCenter(23, 33)],
  drizzle: [tileCenter(27, 21), tileCenter(31, 19), tileCenter(21, 19)],
  pip: [tileCenter(33, 30), tileCenter(30, 28), tileCenter(34, 32)],
  sol: [tileCenter(33, 14), tileCenter(36, 16), tileCenter(31, 16)],
};

// ── Queries ────────────────────────────────────────────────────
export const tiles = grid;

export function heightAt(x: number, z: number): number {
  const { i, j } = worldToTile(x, z);
  const t = tileAt(i, j);
  if (!t) return 0;
  if (t.kind !== "ramp") return t.h * LEVEL;
  const fx = x + W / 2 - i;
  const fz = z + H / 2 - j;
  const u = t.ramp === "E" || t.ramp === "W" ? Math.min(1, Math.max(0, fx)) : Math.min(1, Math.max(0, fz));
  const k0 = t.rampK0 ?? (t.ramp === "N" || t.ramp === "W" ? 1 : 0);
  const k1 = t.rampK1 ?? (t.ramp === "N" || t.ramp === "W" ? 0 : 1);
  return (t.h + k0 + (k1 - k0) * u) * LEVEL;
}

export function isWalkable(x: number, z: number): boolean {
  const { i, j } = worldToTile(x, z);
  const t = tileAt(i, j);
  return !!t && !t.blocked && t.kind !== "water";
}

export function canStep(fromX: number, fromZ: number, toX: number, toZ: number): boolean {
  if (!isWalkable(toX, toZ)) return false;
  const from = tileAt(worldToTile(fromX, fromZ).i, worldToTile(fromX, fromZ).j);
  const to = tileAt(worldToTile(toX, toZ).i, worldToTile(toX, toZ).j);
  if (!from || !to) return false;
  const dh = Math.abs(heightAt(toX, toZ) - heightAt(fromX, fromZ));
  // Slopes connect two terraces; a leading-edge probe samples partway up, so allow a full level.
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
      if (t.kind === "water") row += "~";
      else if (t.kind === "dock") row += "=";
      else if (t.kind === "ramp") row += "^";
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
