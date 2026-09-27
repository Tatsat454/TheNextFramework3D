"use client";

import { useMemo } from "react";
import * as THREE from "three";
import type { TimePreset } from "@/game/time-of-day";

function makeSkyTexture(top: string, mid: string, horizon: string) {
  const c = document.createElement("canvas");
  c.width = 8;
  c.height = 512;
  const g = c.getContext("2d")!;
  const grd = g.createLinearGradient(0, 0, 0, 512);
  grd.addColorStop(0, top);
  grd.addColorStop(0.28, mid);
  grd.addColorStop(0.55, horizon);
  grd.addColorStop(1, horizon);
  g.fillStyle = grd;
  g.fillRect(0, 0, 8, 512);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function SkyDome({ preset }: { preset: TimePreset }) {
  const tex = useMemo(
    () => makeSkyTexture(preset.sky[0], preset.sky[1], preset.sky[2]),
    [preset.sky],
  );
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: tex,
        side: THREE.BackSide,
        fog: false,
        depthWrite: false,
        toneMapped: false,
      }),
    [tex],
  );
  return (
    <mesh material={mat} renderOrder={-20} frustumCulled={false}>
      <sphereGeometry args={[110, 40, 24]} />
    </mesh>
  );
}

export function Sky({ preset }: { preset: TimePreset }) {
  return (
    <group>
      <SkyDome preset={preset} />
    </group>
  );
}
