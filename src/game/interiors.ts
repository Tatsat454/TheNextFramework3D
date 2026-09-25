import type { LandmarkId } from "@/content/landmarks";
import { houseInteriorCopy } from "@/content/landmarks";
import { getPlacement, heightAt, LEVEL } from "./island";
import { player } from "./player-state";
import { useGame } from "./store";

export type InteriorId = "house";

export type InteriorObjectId = keyof typeof houseInteriorCopy;

type Rect = { x0: number; z0: number; x1: number; z1: number };

export type InteriorObject = {
  id: InteriorObjectId;
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
  objects: InteriorObject[];
  blocked: Rect[];
};

export const HOUSE_COLORS = {
  floor: "#D9A066",
  wall: "#FFF6E6",
  wainscot: "#C48A55",
  rug: "#E8513F",
};

/** 10×8 tile bedroom, origin at the room center. +z is south (toward the door / camera). */
export const interiors: Record<InteriorId, InteriorDef> = {
  house: {
    id: "house",
    landmarkId: "house",
    name: "My House",
    spawn: { x: 0, z: 2.45, facing: Math.PI },
    doormat: { x: 0, z: 3.32, w: 1.55, d: 0.82 },
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
      { x0: 3.28, z0: 0.82, x1: 4.55, z1: 2.42 }, // tv stand
      { x0: -4.68, z0: -3.78, x1: -4.22, z1: -3.32 },
      { x0: 4.22, z0: -3.78, x1: 4.68, z1: -3.32 },
      { x0: -4.68, z0: 3.18, x1: -4.22, z1: 3.62 },
      { x0: 4.22, z0: 3.18, x1: 4.68, z1: 3.62 },
      { x0: -8.15, z0: -0.45, x1: -6.85, z1: 1.15 }, // tub
      { x0: -6.15, z0: -0.4, x1: -5.55, z1: 0.35 }, // toilet
      { x0: -6.3, z0: 2.45, x1: -5.5, z1: 3.05 }, // sink
    ],
  },
};

export const interiorByLandmark = (id: LandmarkId): InteriorDef | undefined =>
  Object.values(interiors).find((room) => room.landmarkId === id);

export const getInterior = (id: InteriorId) => interiors[id];

const RADIUS = 0.28;

function overlaps(x: number, z: number, b: Rect) {
  return x + RADIUS > b.x0 && x - RADIUS < b.x1 && z + RADIUS > b.z0 && z - RADIUS < b.z1;
}

export function canStepInterior(id: InteriorId, x: number, z: number) {
  const inRoom = x > -4.62 + RADIUS && x < 4.62 - RADIUS && z > -3.62 + RADIUS && z < 3.52;
  const inAlcove = Math.abs(x) < 0.82 && z >= 3.52 && z < 3.78;
  const inBath = x <= -4.62 && x > -8.05 && z > -0.25 && z < 3.1;
  const inArch = x > -5.2 && x < -4.5 && z > 0.45 && z < 1.95;
  if (!inRoom && !inAlcove && !inBath && !inArch) return false;
  return !interiors[id].blocked.some((b) => overlaps(x, z, b));
}

function inPad(x: number, z: number, cx: number, cz: number, w: number, d: number) {
  return Math.abs(x - cx) <= w / 2 && Math.abs(z - cz) <= d / 2;
}

export function outsideDoor(id: InteriorId) {
  const pl = getPlacement(interiors[id].landmarkId);
  return { x: pl.center.x, z: pl.center.z + 1.58, w: 1.2, d: 0.78, y: pl.level * LEVEL };
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
export function doorZoneAt(x: number, z: number): "enter" | "exit" | null {
  if (performance.now() < doorLatch) return null;
  const id = useGame.getState().interior;
  if (id) {
    const m = interiors[id].doormat;
    return inPad(x, z, m.x, m.z, m.w, m.d) ? "exit" : null;
  }
  const door = outsideDoor("house");
  return inPad(x, z, door.x, door.z, door.w, door.d) ? "enter" : null;
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
