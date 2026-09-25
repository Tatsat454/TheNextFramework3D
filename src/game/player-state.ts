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
