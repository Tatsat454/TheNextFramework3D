"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { palette, toon } from "@/game/materials";
import { reducedMotion } from "@/game/player-state";
import { cloudX, skyClouds } from "@/game/sky-clouds";
import type { TimePreset } from "@/game/time-of-day";

function makeSkyTexture(top: string, mid: string, horizon: string) {
  const c = document.createElement("canvas");
  c.width = 8;
  c.height = 512;
  const g = c.getContext("2d")!;
  const grd = g.createLinearGradient(0, 0, 0, 512);
  grd.addColorStop(0, top);
  grd.addColorStop(0.42, mid);
  grd.addColorStop(0.78, horizon);
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

function PuffClouds() {
  const geo = useMemo(
    () =>
      mergeGeometries([
        new THREE.SphereGeometry(1.15, 8, 6),
        new THREE.SphereGeometry(0.88, 8, 6).translate(1.05, 0.12, 0.18),
        new THREE.SphereGeometry(0.82, 8, 6).translate(-0.95, 0.08, -0.12),
        new THREE.SphereGeometry(0.62, 8, 6).translate(0.15, 0.42, 0.08),
      ]),
    [],
  );
  const refs = useRef<(THREE.Group | null)[]>([]);
  useFrame((st) => {
    const t = reducedMotion.value ? 8 : st.clock.elapsedTime;
    skyClouds.forEach((c, k) => {
      const g = refs.current[k];
      if (!g) return;
      g.position.set(cloudX(c, t), c.y, c.z + Math.sin(t * 0.04 + k) * 1.2);
    });
  });
  return (
    <group>
      {skyClouds.map((c, k) => (
        <group key={k} ref={(g) => { refs.current[k] = g; }} scale={c.s * 0.42}>
          <mesh geometry={geo} material={toon("#FFFFFF", { noOcclude: true })} />
        </group>
      ))}
    </group>
  );
}

function TinyIsland({ x, z, s, fade }: { x: number; z: number; s: number; fade: number }) {
  const pine = toon(palette.pine, { flatShading: true, transparent: true, opacity: fade });
  const grass = toon(palette.grass, { flatShading: true, transparent: true, opacity: fade });
  const wood = toon(palette.woodDeep, { transparent: true, opacity: fade });
  return (
    <group position={[x, -0.15, z]} scale={s}>
      <mesh material={grass} position={[0, 0.55, 0]} castShadow={false}>
        <sphereGeometry args={[1.8, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh material={grass} position={[0.9, 0.28, 0.35]} scale={[0.7, 0.45, 0.7]}>
        <sphereGeometry args={[1.1, 7, 5, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh material={wood} position={[-0.35, 0.95, 0.1]}>
        <cylinderGeometry args={[0.08, 0.1, 0.55, 5]} />
      </mesh>
      <mesh material={pine} position={[-0.35, 1.45, 0.1]}>
        <coneGeometry args={[0.42, 0.85, 6]} />
      </mesh>
      <mesh material={wood} position={[0.55, 0.82, -0.2]}>
        <cylinderGeometry args={[0.06, 0.08, 0.4, 5]} />
      </mesh>
      <mesh material={pine} position={[0.55, 1.18, -0.2]}>
        <coneGeometry args={[0.32, 0.65, 6]} />
      </mesh>
    </group>
  );
}

function DistantIslands() {
  return (
    <group>
      <TinyIsland x={-34} z={-28} s={1.15} fade={0.62} />
      <TinyIsland x={8} z={-42} s={0.95} fade={0.52} />
      <TinyIsland x={36} z={-18} s={1.05} fade={0.58} />
    </group>
  );
}

export function Sky({ preset }: { preset: TimePreset }) {
  return (
    <group>
      <SkyDome preset={preset} />
      <PuffClouds />
      <DistantIslands />
    </group>
  );
}
