import type { LandmarkId } from "@/content/landmarks";
import { arcadeInteriorCopy, houseInteriorCopy, museumExhibits, townHallInteriorCopy } from "@/content/landmarks";
import { getPlacement, heightAt, LEVEL } from "./island";
import { player } from "./player-state";
import { useGame } from "./store";

export type InteriorId = "house" | "arcade" | "townhall" | "museum";

export type InteriorObjectId = keyof typeof houseInteriorCopy | keyof typeof arcadeInteriorCopy | keyof typeof townHallInteriorCopy;

type Rect = { x0: number; z0: number; x1: number; z1: number };

export type InteriorObject = {
  id: string;
  x: number;
  z: number;
  y: number;
  r: number;
};

export type InteriorDef = {
  id: InteriorId;
  landmarkId: LandmarkId;
  name: string;
  /** Player spawn just inside the south door, facing the room. */
  spawn: { x: number; z: number; facing: number };
  doormat: { x: number; z: number; w: number; d: number };
  /** Island door-mat, relative to the landmark center in z. */
  outsidePad: { z: number; w: number; d: number };
  objects: InteriorObject[];
  blocked: Rect[];
};

export type DoorZone = { kind: "enter"; id: InteriorId } | { kind: "exit" };

export const HOUSE_COLORS = {
  floor: "#D9A066",
  wall: "#FFF6E6",
  wainscot: "#C48A55",
  rug: "#E8513F",
};

export const ARCADE_COLORS = {
  floor: "#2B2350",
  floorAlt: "#3A2F6B",
  wall: "#1E1B3A",
};

export const TOWN_COLORS = {
  floor: "#C48A55",
  wall: "#FFF6E6",
  wainscot: "#4B3FB5",
  rugA: "#7B2D3B",
  rugB: "#E8C07A",
};

export const MUSEUM_COLORS = {
  floor: "#B87A4B",
  floorDeep: "#A56B3E",
  wall: "#FFF6E6",
  carpet: "#8B1E2B",
  gold: "#D4A13A",
  rail: "#D98A3A",
  stone: "#C6C0B4",
  stoneDeep: "#AFA89C",
  rockA: "#8C6A4F",
  rockB: "#A07C5C",
  rockC: "#6E5240",
  navy: "#1E1B3A",
  velvet: "#8B1E2B",
  sand: "#D9B98A",
};

/** 16×12 tile gallery. +z is south (door / camera). Raised north tier at deckH. */
export const MUSEUM = {
  halfW: 8,
  halfD: 6,
  deckH: 1.2,
  /** South face of the raised tier. z <= this is up. */
  deckZ: -0.32,
  steps: 10,
  stepH: 1.2 / 10,
  stepD: 0.21,
  centerHalf: 1.22,
  sideX: 5.1,
  sideHalf: 0.78,
};

export function museumOnStair(x: number) {
  const m = MUSEUM;
  return Math.abs(x) < m.centerHalf || Math.abs(x - m.sideX) < m.sideHalf || Math.abs(x + m.sideX) < m.sideHalf;
}

export function museumStairSouth() {
  return MUSEUM.deckZ + MUSEUM.steps * MUSEUM.stepD;
}

/** Five gallery pedestals. +z is south (plaque faces the door). */
export const MUSEUM_PEDESTALS = [
  { id: "exhibit1", n: 1, x: 0, z: -3.55, tier: "top" as const, slug: museumExhibits[0] },
  { id: "exhibit2", n: 2, x: -3.42, z: -2.38, tier: "top" as const, slug: museumExhibits[1] },
  { id: "exhibit3", n: 3, x: 3.42, z: -2.38, tier: "top" as const, slug: museumExhibits[2] },
  { id: "exhibit4", n: 4, x: -3.22, z: 2.22, tier: "low" as const, slug: museumExhibits[3] },
  { id: "exhibit5", n: 5, x: 3.22, z: 2.22, tier: "low" as const, slug: museumExhibits[4] },
] as const;

export function museumHeightAt(x: number, z: number) {
  const m = MUSEUM;
  if (z <= m.deckZ) return m.deckH;
  const z1 = museumStairSouth();
  if (z <= z1 && museumOnStair(x)) {
    const i = Math.min(m.steps - 1, Math.max(0, Math.floor((z - m.deckZ) / m.stepD)));
    return m.deckH - i * m.stepH;
  }
  return 0;
}

export function interiorHeightAt(id: InteriorId, x: number, z: number) {
  return id === "museum" ? museumHeightAt(x, z) : 0;
}

const CABINET_X = [-4.5, -1.5, 1.5, 4.5] as const;
export const TOWN_FRAMES_X = [-5.4, -3.24, -1.08, 1.08, 3.24, 5.4] as const;

/** 10×8 tile bedroom, origin at the room center. +z is south (toward the door / camera). */
export const interiors: Record<InteriorId, InteriorDef> = {
  house: {
    id: "house",
    landmarkId: "house",
    name: "My House",
    spawn: { x: 0, z: 2.45, facing: Math.PI },
    doormat: { x: 0, z: 3.32, w: 1.55, d: 0.82 },
    outsidePad: { z: 1.58, w: 1.2, d: 0.78 },
    objects: [
      { id: "bed", x: -2.05, z: -1.7, y: 1.15, r: 1.15 },
      { id: "bookshelf", x: -0.95, z: -2.55, y: 2.1, r: 1.1 },
      { id: "picture", x: 0.62, z: -2.55, y: 2.15, r: 1.05 },
      { id: "computer", x: 2.45, z: -1.65, y: 1.55, r: 1.2 },
      { id: "tv", x: 2.7, z: 1.62, y: 1.35, r: 1.2 },
    ],
    blocked: [
      { x0: -4.08, z0: -2.98, x1: -2.22, z1: -0.42 }, // bed
      { x0: -1.82, z0: -3.78, x1: -0.08, z1: -3.22 }, // bookshelf
      { x0: 2.72, z0: -2.12, x1: 4.55, z1: -1.18 }, // desk
      { x0: 3.35, z0: -3.75, x1: 4.7, z1: -3.02 }, // kitchen
      { x0: 3.28, z0: 0.82, x1: 4.55, z1: 2.42 }, // tv stand
      { x0: 0.72, z0: 0.72, x1: 1.68, z1: 2.38 }, // couch
      { x0: -4.68, z0: -3.78, x1: -4.22, z1: -3.32 },
      { x0: 4.22, z0: -3.78, x1: 4.68, z1: -3.32 },
      { x0: -4.68, z0: 3.18, x1: -4.22, z1: 3.62 },
      { x0: 4.22, z0: 3.18, x1: 4.68, z1: 3.62 },
      { x0: -8.15, z0: -0.45, x1: -6.85, z1: 1.15 }, // tub
      { x0: -6.15, z0: -0.4, x1: -5.55, z1: 0.35 }, // toilet
      { x0: -6.3, z0: 2.45, x1: -5.5, z1: 3.05 }, // sink
    ],
  },
  arcade: {
    id: "arcade",
    landmarkId: "arcade",
    name: "The Inspiration Arcade",
    spawn: { x: 0, z: 2.7, facing: Math.PI },
    doormat: { x: 0, z: 3.85, w: 1.6, d: 0.85 },
    outsidePad: { z: 0.98, w: 1.05, d: 0.72 },
    objects: CABINET_X.map((x, i) => ({
      id: `cabinet${i + 1}`,
      x,
      z: -2.45,
      y: 1.7,
      r: 1.15,
    })),
    blocked: [
      ...CABINET_X.map((x) => ({ x0: x - 0.7, z0: -4.35, x1: x + 0.7, z1: -2.85 })),
      { x0: -5.35, z0: 2.15, x1: -3.55, z1: 3.55 }, // beanbag corner
    ],
  },
  townhall: {
    id: "townhall",
    landmarkId: "townhall",
    name: "The Island Records",
    spawn: { x: 0, z: 3.55, facing: Math.PI },
    doormat: { x: 0, z: 4.42, w: 1.65, d: 0.88 },
    outsidePad: { z: 2.12, w: 1.15, d: 0.78 },
    objects: [
      ...TOWN_FRAMES_X.map((x, i) => ({
        id: `frame${i + 1}`,
        x,
        z: -4.15,
        y: 2.05,
        r: 1.05,
      })),
      { id: "clerk", x: -1.85, z: 1.42, y: 1.55, r: 1.55 },
      { id: "stamp", x: 0.55, z: 1.55, y: 1.25, r: 0.85 },
      { id: "certificate", x: 5.35, z: -4.15, y: 2.15, r: 1.1 },
      { id: "notices", x: -6.15, z: 2.85, y: 1.7, r: 1.15 },
    ],
    blocked: [
      { x0: -1.62, z0: 0.62, x1: 1.62, z1: 1.72 }, // front desk
      { x0: 4.05, z0: -4.55, x1: 6.55, z1: -2.55 }, // mayor desk
      { x0: -6.72, z0: 2.15, x1: -6.15, z1: 3.55 }, // notice board, west wall
      { x0: -6.45, z0: -0.55, x1: -5.35, z1: 0.85 }, // west bench
      { x0: 5.35, z0: -0.55, x1: 6.45, z1: 0.85 }, // east bench
    ],
  },
  museum: {
    id: "museum",
    landmarkId: "museum",
    name: "The Museum",
    spawn: { x: 0, z: 4.55, facing: Math.PI },
    doormat: { x: 0, z: 5.42, w: 1.7, d: 0.88 },
    outsidePad: { z: 1.62, w: 1.15, d: 0.78 },
    objects: [],
    blocked: [
      // Side-stair rails
      { x0: -MUSEUM.sideX - MUSEUM.sideHalf - 0.16, z0: MUSEUM.deckZ - 0.08, x1: -MUSEUM.sideX - MUSEUM.sideHalf + 0.02, z1: museumStairSouth() + 0.08 },
      { x0: -MUSEUM.sideX + MUSEUM.sideHalf - 0.02, z0: MUSEUM.deckZ - 0.08, x1: -MUSEUM.sideX + MUSEUM.sideHalf + 0.16, z1: museumStairSouth() + 0.08 },
      { x0: MUSEUM.sideX - MUSEUM.sideHalf - 0.16, z0: MUSEUM.deckZ - 0.08, x1: MUSEUM.sideX - MUSEUM.sideHalf + 0.02, z1: museumStairSouth() + 0.08 },
      { x0: MUSEUM.sideX + MUSEUM.sideHalf - 0.02, z0: MUSEUM.deckZ - 0.08, x1: MUSEUM.sideX + MUSEUM.sideHalf + 0.16, z1: museumStairSouth() + 0.08 },
      // Terrace boulders — back wall and corners (leave exhibit pads and stair landings open)
      { x0: -7.72, z0: -5.85, x1: -5.45, z1: -4.15 },
      { x0: 5.45, z0: -5.85, x1: 7.72, z1: -4.15 },
      { x0: -5.2, z0: -5.85, x1: -2.15, z1: -4.95 },
      { x0: -1.35, z0: -5.85, x1: 1.35, z1: -4.98 },
      { x0: 2.15, z0: -5.85, x1: 5.2, z1: -4.95 },
      { x0: -7.72, z0: -4.2, x1: -6.95, z1: -0.55 },
      { x0: 6.95, z0: -4.2, x1: 7.72, z1: -0.55 },
      // Lower-floor clusters near future pedestals (keep carpet, stairs, and approaches clear)
      { x0: -7.72, z0: 1.62, x1: -6.05, z1: 3.42 },
      { x0: 6.05, z0: 1.62, x1: 7.72, z1: 3.42 },
      { x0: -3.58, z0: 0.18, x1: -2.48, z1: 0.78 },
      { x0: 2.48, z0: 0.18, x1: 3.58, z1: 0.78 },
      ...MUSEUM_PEDESTALS.map((p) => ({ x0: p.x - 0.4, z0: p.z - 0.4, x1: p.x + 0.4, z1: p.z + 0.4 })),
      { x0: -5.22, z0: 3.9, x1: -3.48, z1: 4.58 },
      { x0: 3.48, z0: 3.9, x1: 5.22, z1: 4.58 },
      { x0: -7.58, z0: 4.38, x1: -6.48, z1: 5.42 },
      { x0: 6.48, z0: 4.38, x1: 7.58, z1: 5.42 },
    ],
  },
};

export const interiorByLandmark = (id: LandmarkId): InteriorDef | undefined =>
  Object.values(interiors).find((room) => room.landmarkId === id);

export const getInterior = (id: InteriorId) => interiors[id];

export function propCopy(interior: InteriorId, id: string) {
  if (interior === "arcade") return arcadeInteriorCopy[id as keyof typeof arcadeInteriorCopy];
  if (interior === "townhall") return townHallInteriorCopy[id as keyof typeof townHallInteriorCopy];
  return houseInteriorCopy[id as keyof typeof houseInteriorCopy];
}

const RADIUS = 0.28;

function overlaps(x: number, z: number, b: Rect) {
  return x + RADIUS > b.x0 && x - RADIUS < b.x1 && z + RADIUS > b.z0 && z - RADIUS < b.z1;
}

export function canStepInterior(id: InteriorId, x: number, z: number) {
  if (id === "arcade") {
    const inRoom = x > -5.72 && x < 5.72 && z > -4.12 && z < 4.12;
    const inAlcove = Math.abs(x) < 0.88 && z >= 4.12 && z < 4.38;
    if (!inRoom && !inAlcove) return false;
    return !interiors.arcade.blocked.some((b) => overlaps(x, z, b));
  }
  if (id === "townhall") {
    const inRoom = x > -6.72 && x < 6.72 && z > -4.72 && z < 4.72;
    const inAlcove = Math.abs(x) < 0.92 && z >= 4.72 && z < 5.12;
    if (!inRoom && !inAlcove) return false;
    return !interiors.townhall.blocked.some((b) => overlaps(x, z, b));
  }
  if (id === "museum") {
    const hw = MUSEUM.halfW - 0.28;
    const hd = MUSEUM.halfD - 0.28;
    const inRoom = x > -hw && x < hw && z > -hd && z < hd;
    const inAlcove = Math.abs(x) < 0.92 && z >= hd && z < hd + 0.42;
    if (!inRoom && !inAlcove) return false;
    if (interiors.museum.blocked.some((b) => overlaps(x, z, b))) return false;
    const dh = Math.abs(museumHeightAt(x, z) - museumHeightAt(player.x, player.z));
    return dh <= 0.28;
  }
  const inRoom = x > -4.62 + RADIUS && x < 4.62 - RADIUS && z > -3.62 + RADIUS && z < 3.52;
  const inAlcove = Math.abs(x) < 0.82 && z >= 3.52 && z < 3.78;
  const inBath = x <= -4.62 && x > -8.05 && z > -0.25 && z < 3.1;
  const inArch = x > -5.2 && x < -4.5 && z > 0.45 && z < 1.95;
  if (!inRoom && !inAlcove && !inBath && !inArch) return false;
  return !interiors.house.blocked.some((b) => overlaps(x, z, b));
}

function inPad(x: number, z: number, cx: number, cz: number, w: number, d: number) {
  return Math.abs(x - cx) <= w / 2 && Math.abs(z - cz) <= d / 2;
}

export function outsideDoor(id: InteriorId) {
  const room = interiors[id];
  const pl = getPlacement(room.landmarkId);
  const pad = room.outsidePad;
  return { x: pl.center.x, z: pl.center.z + pad.z, w: pad.w, d: pad.d, y: pl.level * LEVEL };
}

export function outsideExitSpawn(id: InteriorId) {
  const pl = getPlacement(interiors[id].landmarkId);
  return { x: pl.interact.x, z: pl.interact.z + 0.55, facing: 0, y: pl.level * LEVEL };
}

let doorLatch = 0;
export function armDoorLatch(ms = 640) {
  doorLatch = performance.now() + ms;
}

/** Walk-on trigger: enter from the island door mat, or exit from the interior doormat. */
export function doorZoneAt(x: number, z: number): DoorZone | null {
  if (performance.now() < doorLatch) return null;
  const id = useGame.getState().interior;
  if (id) {
    const m = interiors[id].doormat;
    return inPad(x, z, m.x, m.z, m.w, m.d) ? { kind: "exit" } : null;
  }
  for (const room of Object.values(interiors)) {
    const door = outsideDoor(room.id);
    if (inPad(x, z, door.x, door.z, door.w, door.d)) return { kind: "enter", id: room.id };
  }
  return null;
}

export function placePlayerInside(id: InteriorId) {
  const room = interiors[id];
  player.x = room.spawn.x;
  player.z = room.spawn.z;
  player.y = interiorHeightAt(id, room.spawn.x, room.spawn.z);
  player.facing = room.spawn.facing;
  player.moving = false;
  player.onSand = false;
}

export function placePlayerOutside(id: InteriorId) {
  const spawn = outsideExitSpawn(id);
  player.x = spawn.x;
  player.z = spawn.z;
  player.y = spawn.y;
  player.facing = spawn.facing;
  player.moving = false;
  player.y = heightAt(player.x, player.z);
}

export const WIPE_OUT_MS = 460;
export const WIPE_IN_MS = 520;
export const WIPE_OUT_MS_REDUCED = 160;
export const WIPE_IN_MS_REDUCED = 180;
