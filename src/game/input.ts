"use client";

import type { ThreeEvent } from "@react-three/fiber";
import { isPaused, useGame } from "./store";

/** Live keyboard + tap-to-move state, read every frame by the player. */
export const input = {
  keys: new Set<string>(),
  tapTarget: null as { x: number; z: number } | null,
  interactQueued: false,
};

/** Floor / furniture / doormat pointer → walk target. Mouse and finger. */
export function onWorldTap(e: ThreeEvent<PointerEvent> | ThreeEvent<MouseEvent>) {
  if (typeof e.button === "number" && e.button !== 0) return;
  if (isPaused(useGame.getState())) return;
  e.stopPropagation();
  input.tapTarget = { x: e.point.x, z: e.point.z };
}

export function moveAxes() {
  const k = input.keys;
  let x = 0;
  let z = 0;
  if (k.has("ArrowLeft") || k.has("KeyA")) x -= 1;
  if (k.has("ArrowRight") || k.has("KeyD")) x += 1;
  if (k.has("ArrowUp") || k.has("KeyW")) z -= 1;
  if (k.has("ArrowDown") || k.has("KeyS")) z += 1;
  const running = k.has("ShiftLeft") || k.has("ShiftRight");
  return { x, z, running };
}
