import type { ItemId, LandmarkId, ResidentId } from "@/content/landmarks";
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

const isSolid = (t: Tile | undefined) => !!t && t.kind !== "void" && t.kind !== "water";
// Close 1-tile stair corners on the south apron so the beach isn't a stack of shelves.
for (let pass = 0; pass < 2; pass++) {
  const fill: Tile[] = [];
  const cut: Tile[] = [];
  for (const t of grid) {
    if (t.j < 39) continue;
    const n = tileAt(t.i, t.j - 1);
    const s = tileAt(t.i, t.j + 1);
    const e = tileAt(t.i + 1, t.j);
    const w = tileAt(t.i - 1, t.j);
    if (t.kind === "void") {
      if (isSolid(n) && isSolid(w) && !isSolid(s) && !isSolid(e)) fill.push(t);
      else if (isSolid(n) && isSolid(e) && !isSolid(s) && !isSolid(w)) fill.push(t);
    } else if (t.kind === "sand" || t.kind === "grass") {
      const neighbors = [isSolid(n), isSolid(s), isSolid(e), isSolid(w)].filter(Boolean).length;
      if (neighbors <= 1) cut.push(t);
    }
  }
  for (const t of fill) {
    t.kind = "sand";
    t.blocked = false;
    t.h = 1;
  }
  for (const t of cut) {
    t.kind = "void";
    t.blocked = true;
    t.h = 0;
  }
}

// Square the west beach so the pond shore meets the sand in a clean apron.
for (let i = 19; i <= 23; i++) {
  for (let j = 41; j <= 45; j++) {
    const t = tileAt(i, j);
    if (!t || t.kind !== "void") continue;
    if (isSolid(tileAt(i + 1, j)) || isSolid(tileAt(i, j - 1))) {
      t.kind = "sand";
      t.blocked = false;
      t.h = 1;
    }
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
paint(16, 39, 31, 40); // house door → spine
paint(24, 29, 30, 29); // town hall front (meets the plaza ring)
paint(35, 28, 40, 28); // → arcade
paint(35, 28, 35, 31); // arcade walk drops south to the ring
paint(36, 29, 40, 32); // → market (west approach)
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

/** Sandcastles on the south crescent. Path, dock, spawn and collectible shells stay clear. */
export type BeachCastleKind = "keep" | "triple" | "tiny";
export const beachCastles: { i: number; j: number; kind: BeachCastleKind; rot: number; hit: number }[] = [
  { i: 26, j: 43, kind: "keep", rot: 0.22, hit: 0.58 },
  { i: 38, j: 43, kind: "triple", rot: -0.38, hit: 0.52 },
  { i: 20, j: 43, kind: "tiny", rot: 0.64, hit: 0.34 },
  { i: 30, j: 44, kind: "tiny", rot: -0.28, hit: 0.32 },
];
for (const c of beachCastles) {
  const t = tileAt(c.i, c.j);
  if (t && t.kind === "sand") t.blocked = true;
}

/** Beach umbrella pole — a small circle so you can still walk around the towel. */
export const beachUmbrella = (() => {
  const c = tileCenter(39, 41);
  return { x: c.x + 0.08, z: c.z - 0.06, facing: -0.52 };
})();

export function beachPropHit(x: number, z: number) {
  if (Math.hypot(x - beachUmbrella.x, z - beachUmbrella.z) < 0.18) return true;
  for (const c of beachCastles) {
    const p = tileCenter(c.i, c.j);
    if (Math.hypot(x - p.x, z - p.z) < c.hit) return true;
  }
  return false;
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
  place("market", [41, 31, 42, 32], 1.15, 1.9),
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

{
  const m = landmarkPlacements.find((l) => l.id === "market")!;
  const [i0] = m.rect;
  const west = tileCenter(i0, m.rect[1]);
  m.interact = { x: west.x - 1.2, z: m.center.z };
}

export const getPlacement = (id: LandmarkId) => landmarkPlacements.find((l) => l.id === id)!;

export const mailboxTile = { i: 18, j: 39 };
block(mailboxTile.i, mailboxTile.j, mailboxTile.i, mailboxTile.j);

/** Plaza hub center — two-tier fountain. Collision is a circle matching the basin, not a tile rect. */
export const fountain = (() => {
  const a = tileCenter(30, 28);
  const b = tileCenter(35, 32);
  const x = (a.x + b.x) / 2;
  const z = (a.z + b.z) / 2;
  return { x, z };
})();

/** Outer cream lip of the basin (lathe r≈1.56). */
export const fountainRadius = 1.52;

export function fountainHit(x: number, z: number) {
  return Math.hypot(x - fountain.x, z - fountain.z) < fountainRadius;
}

/** Circular plaza around the fountain. Terrain hides the square path fill inside this radius. */
export const plazaRing = {
  x: fountain.x,
  z: fountain.z,
  grassInner: 1.58,
  grassOuter: 2.14,
  sandInner: 2.02,
  sandOuter: 3.38,
  skipPath: 2.88,
  gardenInner: 3.52,
  gardenOuter: 4.95,
};

/** Round cream gazebo on the northeast rim, steps facing the fountain. */
export const gazebo = (() => {
  const x = fountain.x + 2.48;
  const z = fountain.z - 5.08;
  const facing = Math.atan2(fountain.x - x, fountain.z - z);
  const columnRing = 1.26;
  const cf = Math.cos(facing);
  const sf = Math.sin(facing);
  const columns = Array.from({ length: 6 }, (_, k) => {
    const a = Math.PI / 5 + (k * Math.PI) / 3;
    const lx = Math.sin(a) * columnRing;
    const lz = Math.cos(a) * columnRing;
    return { x: x + lx * cf + lz * sf, z: z - lx * sf + lz * cf };
  });
  return {
    x,
    z,
    facing,
    platformR: 1.46,
    deckH: 0.38,
    columnRing,
    columnRad: 0.1,
    stepHalf: 0.95,
    steps: [
      { r: 1.78, h: 0.24 },
      { r: 2.28, h: 0.12 },
    ] as const,
    columns,
  };
})();

const angAbs = (a: number, b: number) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));

export function nearGazebo(x: number, z: number, extra = 0) {
  return Math.hypot(x - gazebo.x, z - gazebo.z) < gazebo.steps[1].r + extra;
}

const ringPt = (a: number, r: number) => ({
  x: fountain.x + Math.cos(a) * r,
  z: fountain.z + Math.sin(a) * r,
  a,
});

/** Stone lanterns sit on the four diagonals of the paving ring. NE is shifted east of the gazebo steps. */
export const plazaLanterns = [
  ringPt(Math.PI / 4, 3.5),
  ringPt((3 * Math.PI) / 4, 3.5),
  ringPt((5 * Math.PI) / 4, 3.52),
  ringPt(-0.48, 3.6),
];

/** Garden benches on the west and east of the ring, facing the fountain. */
export const plazaBenches = [Math.PI, 0.16].map((a) => {
  const p = ringPt(a, a < 1 ? 3.68 : 4.06);
  return { ...p, facing: Math.atan2(fountain.x - p.x, fountain.z - p.z) };
});

/** Wooden signpost just west of the south path as it meets the plaza. */
export const plazaSign = (() => {
  const c = tileCenter(31, 35);
  return { i: 31, j: 35, x: c.x, z: c.z, facing: 0.12 };
})();

/** Bulletin board flanking the gazebo steps, east of the walk. */
export const boardTile = (() => {
  const a = gazebo.facing + gazebo.stepHalf + 0.4;
  const r = 2.08;
  const x = gazebo.x + Math.sin(a) * r;
  const z = gazebo.z + Math.cos(a) * r;
  const { i, j } = worldToTile(x, z);
  return { i, j, x, z, facing: Math.atan2(fountain.x - x, fountain.z - z) };
})();

export function nearPlazaProp(x: number, z: number, extra = 0) {
  if (plazaLanterns.some((p) => Math.hypot(x - p.x, z - p.z) < 0.42 + extra)) return true;
  if (plazaBenches.some((p) => Math.hypot(x - p.x, z - p.z) < 0.72 + extra)) return true;
  if (Math.hypot(x - plazaSign.x, z - plazaSign.z) < 0.45 + extra) return true;
  if (Math.hypot(x - boardTile.x, z - boardTile.z) < 0.7 + extra) return true;
  return false;
}

export function plazaPropHit(x: number, z: number) {
  if (plazaLanterns.some((p) => Math.hypot(x - p.x, z - p.z) < 0.16)) return true;
  for (const b of plazaBenches) {
    const dx = x - b.x;
    const dz = z - b.z;
    const c = Math.cos(-b.facing);
    const s = Math.sin(-b.facing);
    const lx = dx * c - dz * s;
    const lz = dx * s + dz * c;
    if (Math.abs(lx) < 0.52 && Math.abs(lz) < 0.28) return true;
  }
  if (Math.hypot(x - plazaSign.x, z - plazaSign.z) < 0.2) return true;
  const bdx = x - boardTile.x;
  const bdz = z - boardTile.z;
  const bc = Math.cos(-boardTile.facing);
  const bs = Math.sin(-boardTile.facing);
  const blx = bdx * bc - bdz * bs;
  const blz = bdx * bs + bdz * bc;
  if (Math.abs(blx) < 0.52 && Math.abs(blz) < 0.18) return true;
  return false;
}

export function gazeboColumnHit(x: number, z: number) {
  return gazebo.columns.some((c) => Math.hypot(x - c.x, z - c.z) < gazebo.columnRad + 0.05);
}

export function inGazeboWalk(x: number, z: number) {
  if (gazeboColumnHit(x, z)) return false;
  const dx = x - gazebo.x;
  const dz = z - gazebo.z;
  const d = Math.hypot(dx, dz);
  if (d <= gazebo.platformR - 0.02) return true;
  if (d > gazebo.steps[1].r + 0.55) return false;
  return angAbs(Math.atan2(dx, dz), gazebo.facing) < gazebo.stepHalf + 0.12;
}

export function gazeboHeightAt(x: number, z: number): number | null {
  const dx = x - gazebo.x;
  const dz = z - gazebo.z;
  const d = Math.hypot(dx, dz);
  if (d <= gazebo.platformR) return LEVEL + gazebo.deckH;
  if (d > gazebo.steps[1].r) return null;
  if (angAbs(Math.atan2(dx, dz), gazebo.facing) > gazebo.stepHalf) return null;
  if (d <= gazebo.steps[0].r) return LEVEL + gazebo.steps[0].h;
  return LEVEL + gazebo.steps[1].h;
}

const PLAZA_OPENINGS: [number, number][] = [
  [0, 0.78],
  [Math.PI, 0.5],
  [Math.atan2(2.6, -1.6), 0.55],
  [Math.atan2(-2.4, -0.9), 0.52],
  [Math.atan2(gazebo.x - plazaRing.x, gazebo.z - plazaRing.z), 0.48],
];

export function plazaPathOpening(x: number, z: number, extra = 0) {
  const a = Math.atan2(x - plazaRing.x, z - plazaRing.z);
  return PLAZA_OPENINGS.some(([oa, w]) => Math.abs(Math.atan2(Math.sin(a - oa), Math.cos(a - oa))) < w + extra);
}

export function inPlazaPathSkip(x: number, z: number) {
  const d = Math.hypot(x - plazaRing.x, z - plazaRing.z);
  if (d >= plazaRing.skipPath) return false;
  const { i } = worldToTile(x, z);
  // Keep the east/west district walks beige so they meet the ring instead of stopping short.
  if (i >= 35 || i <= 29) return false;
  return true;
}

{
  for (const t of grid) {
    if (t.kind === "void" || t.kind === "path" || t.kind === "ramp" || t.kind === "dock") continue;
    const c = tileCenter(t.i, t.j);
    if (gazeboHeightAt(c.x, c.z) !== null || inGazeboWalk(c.x, c.z)) t.blocked = false;
  }
  block(boardTile.i, boardTile.j, boardTile.i, boardTile.j);
}

/** One outdoor exhibit, on the museum lawn where the player was standing. */
export const pedestals = (() => {
  const i = 30;
  const j = 16;
  block(i, j, i, j);
  const c = tileCenter(i, j);
  return [{ slug: "nyc-taxi-ddc", i, j, x: c.x, z: c.z, level: 2, interact: { x: c.x, z: c.z + 0.95 } }];
})();

export type TreeKind = "round" | "blossom" | "pine" | "fruit";
export type TreeSpot = { kind: TreeKind; x: number; z: number; y: number; s: number; seed: number; item?: ItemId };

const reserved = new Set<number>();
const reserve = (i: number, j: number, r = 1) => {
  for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) reserved.add((j + dj) * W + (i + di));
};
for (const t of grid) if (t.kind === "path" || t.kind === "ramp" || t.kind === "dock" || t.kind === "sand") reserve(t.i, t.j, 1);
for (const t of grid) {
  const c = tileCenter(t.i, t.j);
  if (Math.hypot(c.x - fountain.x, c.z - fountain.z) < plazaRing.gardenOuter + 0.2) reserve(t.i, t.j, 0);
  if (nearGazebo(c.x, c.z, 0.35)) reserve(t.i, t.j, 0);
}
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

// A few orchard blossoms near the house — plaza framing trees are separate.
for (const [i, j, s] of [
  [21, 35, 1],
  [22, 40, 0.95],
  [40, 22, 1],
] as const) {
  if (free(tileAt(i, j))) plant("blossom", i, j, s);
}

/** Cherry trees that frame the plaza (west, east, northwest, northeast). */
export const plazaBlossoms: { x: number; z: number; y: number; s: number; seed: number }[] = [];
const plantPlazaBlossom = (i: number, j: number, s: number, seed: number) => {
  const t = tileAt(i, j);
  if (!t || t.kind === "void" || t.kind === "water") return;
  t.blocked = true;
  const c = tileCenter(i, j);
  plazaBlossoms.push({ x: c.x, z: c.z, y: t.h * LEVEL, s, seed });
  reserve(i, j, 1);
};
plantPlazaBlossom(27, 32, 1.42, 0.21);
plantPlazaBlossom(37, 32, 1.36, 0.74);
plantPlazaBlossom(29, 24, 1.5, 0.43);
plantPlazaBlossom(38, 22, 1.38, 0.58);

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
  pickup("taxi-token", 30, 32),
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
};

export const tiles = grid;

export function heightAt(x: number, z: number): number {
  const gz = gazeboHeightAt(x, z);
  if (gz !== null) return gz;
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
  if (fountainHit(x, z)) return false;
  if (gazeboColumnHit(x, z)) return false;
  if (plazaPropHit(x, z)) return false;
  if (beachPropHit(x, z)) return false;
  if (inGazeboWalk(x, z)) return true;
  const { i, j } = worldToTile(x, z);
  const t = tileAt(i, j);
  return !!t && !t.blocked && t.kind !== "water" && t.kind !== "void";
}

export function canStep(fromX: number, fromZ: number, toX: number, toZ: number): boolean {
  if (!isWalkable(toX, toZ)) return false;
  const dh = Math.abs(heightAt(toX, toZ) - heightAt(fromX, fromZ));
  if (inGazeboWalk(fromX, fromZ) || inGazeboWalk(toX, toZ)) return dh <= 0.28;
  const from = tileAt(worldToTile(fromX, fromZ).i, worldToTile(fromX, fromZ).j);
  const to = tileAt(worldToTile(toX, toZ).i, worldToTile(toX, toZ).j);
  if (!from || !to) return false;
  if (from.kind === "ramp" || to.kind === "ramp") return dh <= LEVEL + 0.25;
  if (dh > 0.28) return false;
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
