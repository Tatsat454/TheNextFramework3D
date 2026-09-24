import type { ItemId, LandmarkId, ResidentId } from "@/content/landmarks";
import { museumExhibits, skills } from "@/content/landmarks";
import { mulberry32, valueNoise } from "./rng";

export const W = 52;
export const H = 44;
export const LEVEL = 1.28;
export const WATER_Y = LEVEL * 2 - 0.16;

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

// Compact floating oval, matching the target diorama.
const CX = 26;
const CZ = 21;
for (let j = 0; j < H; j++) {
  for (let i = 0; i < W; i++) {
    const nx = (i + 0.5 - CX) / 10.4;
    const nz = (j + 0.5 - CZ) / 9.2;
    const wobble = (noise(i * 0.22, j * 0.22) - 0.5) * 0.16;
    const land = nx * nx + nz * nz < 1 + wobble;
    const upper = land && j <= 20;
    grid.push({
      i,
      j,
      h: land ? (upper ? 2 : 1) : 0,
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
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const n = tileAt(t.i + di, t.j + dj);
      if (n && n.d > t.d + 1) {
        n.d = t.d + 1;
        q.push(n);
      }
    }
  }
}

// Pond on the upper terrace, right of the garden.
export const pond = { x: 31.2, z: 17.6, rx: 2.3, rz: 1.7 };
for (const t of grid) {
  if (t.kind === "void") continue;
  const nx = (t.i + 0.5 - pond.x) / pond.rx;
  const nz = (t.j + 0.5 - pond.z) / pond.rz;
  if (t.h === 2 && nx * nx + nz * nz < 1) {
    t.kind = "water";
    t.blocked = true;
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
for (const i of [26, 27]) {
  const upper = tileAt(i, 20);
  const lower = tileAt(i, 21);
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
paint(26, 28, 27, 22); // spawn → stairs
paint(26, 19, 27, 16); // stairs top → town hall
paint(19, 26, 26, 27); // house
paint(27, 16, 31, 16); // → market
paint(24, 17, 27, 17); // garden front

export const dock = { i0: 30, i1: 31, j0: 19, j1: 20 };
for (let jj = dock.j0; jj <= dock.j1; jj++)
  for (let ii = dock.i0; ii <= dock.i1; ii++) {
    const t = tileAt(ii, jj);
    if (!t) continue;
    t.kind = "dock";
    t.h = 2;
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
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
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
  place("house", [18, 25, 20, 27]),
  place("townhall", [21, 13, 24, 15], 1.3, 2.3),
  place("museum", [18, 13, 20, 14], 1.2, 1.8),
  place("market", [29, 13, 31, 14], 1.15, 1.9),
  place("arcade", [32, 14, 33, 15], 1.1, 1.6),
  place("garden", [23, 17, 28, 19], 1.2, 1.7),
];
{
  const end = tileCenter(30, dock.j1);
  landmarkPlacements.push({
    id: "dock",
    rect: [dock.i0, dock.j0, dock.i1, dock.j1],
    level: 2,
    center: { x: end.x + 0.4, z: end.z - 0.6 },
    interact: { x: end.x + 0.3, z: end.z + 0.4 },
    radius: 1.6,
  });
}
{
  const g = landmarkPlacements.find((l) => l.id === "garden")!;
  const gate = tileCenter(25, 19);
  g.interact = { x: gate.x, z: gate.z + 1.15 };
}

export const getPlacement = (id: LandmarkId) => landmarkPlacements.find((l) => l.id === id)!;

export const mailboxTile = { i: 21, j: 27 };
export const boardTile = { i: 25, j: 16 };
block(mailboxTile.i, mailboxTile.j, mailboxTile.i, mailboxTile.j);
block(boardTile.i, boardTile.j, boardTile.i, boardTile.j);

export const pedestals = museumExhibits.map((slug, k) => {
  const i = 18 + (k % 3);
  const j = 16 + Math.floor(k / 3);
  block(i, j, i, j);
  const c = tileCenter(i, j);
  return { slug, i, j, x: c.x, z: c.z, level: 2, interact: { x: c.x, z: c.z + 0.95 } };
});

export const gardenRows = skills.map((skill, k) => {
  const i = 23 + k;
  const top = tileCenter(i, 17);
  const front = tileCenter(i, 19);
  return {
    skillId: skill.id,
    i,
    x: top.x,
    z0: top.z - 0.15,
    z1: front.z + 0.15,
    level: 2,
    interact: { x: top.x, z: front.z + 1.2 },
  };
});

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
  !!t && t.kind === "grass" && !t.blocked && !reserved.has(t.j * W + t.i);

export const trees: TreeSpot[] = [];
const plant = (kind: TreeKind, i: number, j: number, s = 1, item?: ItemId) => {
  const t = tileAt(i, j);
  if (!t || t.kind === "void") return;
  t.blocked = true;
  const c = tileCenter(i, j);
  trees.push({ kind, x: c.x, z: c.z, y: t.h * LEVEL, s, seed: rand(), item });
  reserve(i, j, kind === "pine" ? 0 : 1);
};

plant("fruit", 17, 24, 1, "sunpeach");
plant("fruit", 22, 24, 1, "honeypear");
plant("fruit", 16, 22, 0.95, "cloudberry");

for (const [i, j, s] of [
  [16, 27, 1],
  [34, 26, 1.05],
  [15, 18, 1],
  [35, 18, 1],
  [33, 22, 0.95],
] as const) {
  if (free(tileAt(i, j))) plant("blossom", i, j, s);
}

for (const [i, j, s] of [
  [19, 12, 1.1],
  [23, 12, 1],
  [27, 12, 1.15],
  [16, 14, 0.95],
  [34, 13, 1],
  [15, 26, 1],
  [35, 24, 0.9],
  [17, 29, 1.05],
  [33, 29, 1],
  [21, 30, 0.85],
  [30, 30, 0.9],
] as const) {
  if (free(tileAt(i, j))) plant("pine", i, j, s);
}

for (const [i, j, s] of [
  [16, 21, 1],
  [34, 21, 1],
  [18, 29, 0.9],
  [32, 28, 0.95],
  [22, 12, 0.85],
  [30, 12, 0.9],
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
  const n = t.d <= 2 ? 1 + Math.floor(rand() * 2) : rand() < 0.45 ? 1 : 0;
  for (let k = 0; k < n; k++)
    tufts.push({ x: c.x + (rand() - 0.5) * 0.75, z: c.z + (rand() - 0.5) * 0.75, y, s: 0.7 + rand() * 0.5, r: rand() * Math.PI, c: 0 });
  if (!reserved.has(t.j * W + t.i) && rand() < (t.d <= 2 ? 0.45 : 0.18)) {
    const count = 1 + Math.floor(rand() * 3);
    const c0 = Math.floor(rand() * 4);
    for (let k = 0; k < count; k++)
      flowers.push({ x: c.x + (rand() - 0.5) * 0.65, z: c.z + (rand() - 0.5) * 0.65, y, s: 0.85 + rand() * 0.35, r: rand() * 6, c: (c0 + (k % 2)) % 4 });
  }
  if (!reserved.has(t.j * W + t.i) && t.d <= 2 && rand() < 0.12) {
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
  pickup("spiral-shell", 24, 29),
  pickup("sand-dollar", 32, 26),
  pickup("pink-cowrie", 17, 28),
  pickup("moon-snail", 34, 23),
  pickup("taxi-token", 25, 16),
  pickup("lightning-jar", 28, 14),
  pickup("carbon-offcut", 33, 16),
  pickup("tiny-cartridge", 16, 23),
  pickup("pixel-petal", 34, 19),
];

export const spawn = (() => {
  const c = tileCenter(26, 28);
  return { x: c.x + 0.5, z: c.z };
})();

export const residentHomes: Record<ResidentId, Vec2[]> = {
  bramble: [tileCenter(28, 27), tileCenter(24, 26), tileCenter(29, 25)],
  drizzle: [tileCenter(27, 18), tileCenter(25, 16), tileCenter(22, 18)],
  pip: [tileCenter(31, 26), tileCenter(29, 24), tileCenter(32, 23)],
  sol: [tileCenter(28, 16), tileCenter(30, 15), tileCenter(26, 15)],
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
      if (t.kind === "void") row += " ";
      else if (t.kind === "water") row += "~";
      else if (t.kind === "dock") row += "=";
      else if (t.kind === "ramp") row += "^";
      else if (tree) row += tree.kind === "pine" ? "A" : tree.kind === "fruit" ? "F" : tree.kind === "blossom" ? "B" : "T";
      else if (t.blocked) row += "#";
      else if (t.kind === "path") row += ":";
      else row += String(t.h);
    }
    rows.push(row);
  }
  return rows.join("\n");
}
