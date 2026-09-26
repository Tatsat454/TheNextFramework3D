import type { LandmarkId } from "@/content/landmarks";
import { arcadeInteriorCopy, houseInteriorCopy, townHallInteriorCopy } from "@/content/landmarks";
import { getPlacement, heightAt, LEVEL } from "./island";
import { player } from "./player-state";
import { useGame } from "./store";

export type InteriorId = "house" | "arcade" | "townhall";

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
      { id: "notices", x: -5.35, z: 3.55, y: 1.7, r: 1.15 },
    ],
    blocked: [
      { x0: -1.62, z0: 0.62, x1: 1.62, z1: 1.72 }, // front desk
      { x0: 4.05, z0: -4.55, x1: 6.55, z1: -2.55 }, // mayor desk
      { x0: -6.55, z0: 2.85, x1: -4.15, z1: 4.15 }, // notice board
      { x0: -6.45, z0: -0.55, x1: -5.35, z1: 0.85 }, // west bench
      { x0: 5.35, z0: -0.55, x1: 6.45, z1: 0.85 }, // east bench
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
  player.y = 0;
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
