"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { ThreeEvent } from "@react-three/fiber";
import { dock, LEVEL, stairs, tileAt, tileCenter, tiles, WATER_Y } from "@/game/island";
import { input } from "@/game/input";
import { palette, toon } from "@/game/materials";
import { isPaused, useGame } from "@/game/store";

const CAP = 0.22;
const BASE = -0.6;

const tmp = new THREE.Object3D();
const color = new THREE.Color();

function useInstances(
  ref: React.RefObject<THREE.InstancedMesh | null>,
  items: { x: number; y: number; z: number; sx?: number; sy?: number; sz?: number; ry?: number; c?: string }[],
) {
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    items.forEach((it, k) => {
      tmp.position.set(it.x, it.y, it.z);
      tmp.rotation.set(0, it.ry ?? 0, 0);
      tmp.scale.set(it.sx ?? 1, it.sy ?? 1, it.sz ?? 1);
      tmp.updateMatrix();
      mesh.setMatrixAt(k, tmp.matrix);
      if (it.c) mesh.setColorAt(k, color.set(it.c));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [ref, items]);
}

export function Terrain() {
  const data = useMemo(() => {
    const grass: { x: number; y: number; z: number; c: string }[] = [];
    const sand: { x: number; y: number; z: number; c: string }[] = [];
    const dirt: { x: number; y: number; z: number; sy: number; c: string }[] = [];
    const shallow: { x: number; y: number; z: number }[] = [];
    for (const t of tiles) {
      const { x, z } = tileCenter(t.i, t.j);
      if (t.kind === "water") {
        const nearLand = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]].some(([a, b]) => {
          const n = tileAt(t.i + a, t.j + b);
          return n && n.kind !== "water" && n.kind !== "dock";
        });
        if (nearLand) shallow.push({ x, y: WATER_Y + 0.012, z });
        continue;
      }
      if (t.kind === "dock") continue;
      const top = t.h * LEVEL;
      const sy = top - CAP * 0.6 - BASE;
      const shadeJitter = ((t.i * 7 + t.j * 13) % 5) / 100;
      dirt.push({ x, y: BASE + sy / 2, z, sy, c: `#${color.set(palette.dirt).offsetHSL(0, 0, -shadeJitter).getHexString()}` });
      const capY = top - CAP / 2;
      if (t.kind === "sand") sand.push({ x, y: capY, z, c: palette.sand });
      else if (t.kind === "path") sand.push({ x, y: capY, z, c: t.h === 1 ? palette.sand : "#F1DFBF" });
      else if (t.kind === "ramp") sand.push({ x, y: capY, z, c: palette.earth });
      else grass.push({ x, y: capY, z, c: t.shade ? palette.grassShade : palette.grass });
    }

    const steps: { x: number; y: number; z: number; sx: number; sy: number; sz: number; c: string }[] = [];
    const rails: { x: number; y: number; z: number; sx: number; sy: number; sz: number; c: string }[] = [];
    for (const s of stairs) {
      const { x, z } = tileCenter(s.i, s.j);
      const base = s.h * LEVEL;
      for (let k = 0; k < 4; k++) {
        const h = (k + 1) * 0.25;
        steps.push({ x, y: base + h / 2 - 0.02, z: z + 0.5 - 0.125 - k * 0.25, sx: 0.9, sy: h, sz: 0.25, c: k % 2 ? palette.earth : "#EADCC8" });
      }
      const left = tileAt(s.i - 1, s.j)?.kind !== "ramp";
      const right = tileAt(s.i + 1, s.j)?.kind !== "ramp";
      if (left) rails.push({ x: x - 0.47, y: base + 0.5, z, sx: 0.08, sy: 1.02, sz: 1, c: palette.wood });
      if (right) rails.push({ x: x + 0.47, y: base + 0.5, z, sx: 0.08, sy: 1.02, sz: 1, c: palette.wood });
    }

    const planks: { x: number; y: number; z: number; c: string }[] = [];
    const posts: { x: number; y: number; z: number }[] = [];
    for (let j = dock.j0 - 1; j <= dock.j1; j++) {
      const a = tileCenter(dock.i0, j);
      const b = tileCenter(dock.i1, j);
      const cx = (a.x + b.x) / 2;
      for (let k = 0; k < 3; k++) planks.push({ x: cx, y: LEVEL - 0.015, z: a.z - 0.33 + k * 0.33, c: k % 2 ? palette.wood : "#C4976B" });
      if (j >= dock.j0 && (j - dock.j0) % 2 === 0) {
        posts.push({ x: a.x - 0.42, y: LEVEL - 0.55, z: a.z });
        posts.push({ x: b.x + 0.42, y: LEVEL - 0.55, z: a.z });
      }
    }
    return { grass, sand, dirt, shallow, steps, rails, planks, posts };
  }, []);

  const capGeo = useMemo(() => new RoundedBoxGeometry(1, CAP, 1, 1, 0.035), []);
  const box = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const plankGeo = useMemo(() => new RoundedBoxGeometry(2.1, 0.12, 0.3, 1, 0.03), []);
  const shallowGeo = useMemo(() => new THREE.PlaneGeometry(1.02, 1.02).rotateX(-Math.PI / 2), []);
  const postGeo = useMemo(() => new THREE.CylinderGeometry(0.09, 0.09, 1.1, 8), []);
  const waterGeo = useMemo(() => new THREE.PlaneGeometry(240, 240, 120, 120).rotateX(-Math.PI / 2), []);

  const grassRef = useRef<THREE.InstancedMesh>(null);
  const sandRef = useRef<THREE.InstancedMesh>(null);
  const dirtRef = useRef<THREE.InstancedMesh>(null);
  const shallowRef = useRef<THREE.InstancedMesh>(null);
  const stepRef = useRef<THREE.InstancedMesh>(null);
  const railRef = useRef<THREE.InstancedMesh>(null);
  const plankRef = useRef<THREE.InstancedMesh>(null);
  const postRef = useRef<THREE.InstancedMesh>(null);

  useInstances(grassRef, data.grass);
  useInstances(sandRef, data.sand);
  useInstances(dirtRef, data.dirt);
  useInstances(shallowRef, data.shallow);
  useInstances(stepRef, data.steps);
  useInstances(railRef, data.rails);
  useInstances(plankRef, data.planks);
  useInstances(postRef, data.posts);

  const onTap = (e: ThreeEvent<MouseEvent>) => {
    if (isPaused(useGame.getState())) return;
    e.stopPropagation();
    input.tapTarget = { x: e.point.x, z: e.point.z };
  };

  const white = toon("#FFFFFF");
  return (
    <group>
      <instancedMesh ref={grassRef} args={[capGeo, white, data.grass.length]} receiveShadow onClick={onTap} />
      <instancedMesh ref={sandRef} args={[capGeo, white, data.sand.length]} receiveShadow onClick={onTap} />
      <instancedMesh ref={dirtRef} args={[box, white, data.dirt.length]} receiveShadow />
      <instancedMesh ref={stepRef} args={[box, white, data.steps.length]} receiveShadow castShadow onClick={onTap} />
      <instancedMesh ref={railRef} args={[box, white, data.rails.length]} castShadow />
      <instancedMesh ref={plankRef} args={[plankGeo, white, data.planks.length]} receiveShadow castShadow onClick={onTap} />
      <instancedMesh ref={postRef} args={[postGeo, toon(palette.woodDeep), data.posts.length]} />
      <instancedMesh ref={shallowRef} args={[shallowGeo, toon(palette.shallow, { transparent: true, opacity: 0.75, water: true }), data.shallow.length]} />
      <mesh geometry={waterGeo} position={[0, WATER_Y, 0]} material={toon(palette.water, { water: true })} receiveShadow />
    </group>
  );
}
