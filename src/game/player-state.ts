import { heightAt, spawn } from "./island";

/** Mutable, non-React player state shared by the camera, props and residents each frame. */
export const player = {
  x: spawn.x,
  z: spawn.z,
  y: heightAt(spawn.x, spawn.z),
  facing: 0,
  speed: 0,
  moving: false,
  running: false,
  onSand: false,
};

/** Player projected to the screen, 0–1, used by the interior iris wipe. */
export const playerScreen = { x: 0.5, y: 0.55 };

export const reducedMotion = { value: false };

/** Dev-only camera override for screenshots (`window.__pocket.debugCam`). */
export const debugCam = { close: false, gazebo: false };

/** Plaza pose: sitting, gazebo photo-spot, coin toss. */
export const pose = {
  sitting: false,
  bench: -1,
  gazeboFocus: false,
  gazeboChimed: false,
  tossAt: 0,
  tossFromX: 0,
  tossFromY: 0,
  tossFromZ: 0,
};

/** Per-lantern glow scale, written each frame so tests can see night flicker. */
export const lanternPulse = { night: false, glow: [1, 1, 1, 1] };
