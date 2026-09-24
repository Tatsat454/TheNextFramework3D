"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { ThreeEvent } from "@react-three/fiber";
import { dock, LEVEL, rampRuns, tileAt, tileCenter, tiles, WATER_Y } from "@/game/island";
import { input } from "@/game/input";
import { palette, toon } from "@/game/materials";
import { isPaused, useGame } from "@/game/store";

const CAP = 0.1;
const BASE = -0.6;
const TILE = 1.08;

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

/** Dirt wedge: south (+z) is the lip, north (−z) meets the upper terrace. */
function makeWedge(width: number, length: number, rise: number, lip = 0.16) {
  const hw = width / 2;
  const hl = length / 2;
  const v = [
    -hw, 0, hl, hw, 0, hl, -hw, lip, hl, hw, lip, hl, -hw, 0, -hl, hw, 0, -hl, -hw, rise, -hl, hw, rise, -hl,
  ];
  const idx = [
    0, 1, 3, 0, 3, 2, 5, 4, 6, 5, 6, 7, 4, 5, 1, 4, 1, 0, 2, 3, 7, 2, 7, 6, 4, 0, 2, 4, 2, 6, 1, 5, 7, 1, 7, 3,
  ];
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

export function Terrain() {
  const data = useMemo(() => {
    const grass: { x: number; y: number; z: number; sx: number; sz: number; c: string }[] = [];
    const sand: { x: number; y: number; z: number; sx: number; sz: number; c: string }[] = [];
    const dirt: { x: number; y: number; z: number; sx: number; sy: number; sz: number; c: string }[] = [];
    const shallow: { x: number; y: number; z: number }[] = [];
    const strata: { x: number; y: number; z: number; c: string; sx?: number; sy?: number; sz?: number }[] = [];
    for (const t of tiles) {
      const { x, z } = tileCenter(t.i, t.j);
      if (t.kind === "water") {
        const nearLand = [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
          [1, 1],
          [-1, -1],
          [1, -1],
          [-1, 1],
        ].some(([a, b]) => {
          const n = tileAt(t.i + a, t.j + b);
          return n && n.kind !== "water" && n.kind !== "dock";
        });
        if (nearLand) shallow.push({ x, y: WATER_Y + 0.012, z });
        continue;
      }
      if (t.kind === "dock") continue;
      const top = t.h * LEVEL;
      const sy = top - CAP * 0.4 - BASE;
      dirt.push({ x, y: BASE + sy / 2, z, sx: TILE, sy, sz: TILE, c: palette.dirt });
      if (t.kind === "ramp") continue;
      const capY = top - CAP / 2;
      if (t.kind === "sand") sand.push({ x, y: capY, z, sx: TILE, sz: TILE, c: palette.sand });
      else if (t.kind === "path") sand.push({ x, y: capY, z, sx: TILE, sz: TILE, c: t.h === 1 ? palette.sand : palette.earth });
      else grass.push({ x, y: capY, z, sx: TILE, sz: TILE, c: t.shade ? palette.grassShade : palette.grass });
      if (t.h >= 2) {
        const exposed = [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ].some(([a, b]) => {
          const n = tileAt(t.i + a, t.j + b);
          return !n || n.kind === "water" || (n.h < t.h && n.kind !== "ramp");
        });
        if (exposed) for (let k = 1; k < t.h; k++) strata.push({ x, y: k * LEVEL + LEVEL * 0.42, z, c: "#D2B07A", sx: TILE, sy: 0.1, sz: TILE });
      }
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
    return { grass, sand, dirt, shallow, strata, planks, posts };
  }, []);

  const ramps = useMemo(() => {
    return rampRuns.map((run) => {
      const a = tileCenter(run.i0, run.j0);
      const b = tileCenter(run.i1, run.j1);
      const width = run.i1 - run.i0 + 1 + 0.12;
      const length = run.j1 - run.j0 + 1 + 0.1;
      const rise = LEVEL;
      const lip = 0.15;
      return {
        x: (a.x + b.x) / 2,
        y: run.h * LEVEL,
        z: (a.z + b.z) / 2,
        width,
        length,
        rise,
        lip,
        wedge: makeWedge(width, length, rise, lip),
        angle: -Math.atan2(rise - lip, length),
        surfaceLen: Math.hypot(length, rise - lip),
      };
    });
  }, []);

  const capGeo = useMemo(() => new THREE.BoxGeometry(1, CAP, 1), []);
  const box = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const dirtGeo = useMemo(() => {
    const g = new THREE.BoxGeometry(1, 1, 1);
    const pos = g.attributes.position;
    const cols = new Float32Array(pos.count * 3);
    for (let k = 0; k < pos.count; k++) {
      const v = pos.getY(k) > 0 ? 1 : 0.78;
      cols.set([v, v, v * 0.97], k * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(cols, 3));
    return g;
  }, []);
  const plankGeo = useMemo(() => new RoundedBoxGeometry(2.1, 0.12, 0.3, 1, 0.03), []);
  const shallowGeo = useMemo(() => new THREE.PlaneGeometry(1.08, 1.08).rotateX(-Math.PI / 2), []);
  const postGeo = useMemo(() => new THREE.CylinderGeometry(0.09, 0.09, 1.1, 8), []);
  const waterGeo = useMemo(() => new THREE.PlaneGeometry(240, 240, 120, 120).rotateX(-Math.PI / 2), []);
  const grassRef = useRef<THREE.InstancedMesh>(null);
  const sandRef = useRef<THREE.InstancedMesh>(null);
  const dirtRef = useRef<THREE.InstancedMesh>(null);
  const shallowRef = useRef<THREE.InstancedMesh>(null);
  const plankRef = useRef<THREE.InstancedMesh>(null);
  const postRef = useRef<THREE.InstancedMesh>(null);
  const strataRef = useRef<THREE.InstancedMesh>(null);

  useInstances(grassRef, data.grass);
  useInstances(sandRef, data.sand);
  useInstances(dirtRef, data.dirt);
  useInstances(strataRef, data.strata);
  useInstances(shallowRef, data.shallow);
  useInstances(plankRef, data.planks);
  useInstances(postRef, data.posts);

  const onTap = (e: ThreeEvent<MouseEvent>) => {
    if (isPaused(useGame.getState())) return;
    e.stopPropagation();
    input.tapTarget = { x: e.point.x, z: e.point.z };
  };

  const white = toon("#FFFFFF", { noOcclude: true });
  const dirtMat = toon(palette.dirt, { noOcclude: true });
  const earthMat = toon(palette.earth, { noOcclude: true });
  const woodMat = toon(palette.wood, { noOcclude: true });

  return (
    <group>
      <instancedMesh ref={grassRef} args={[capGeo, white, data.grass.length]} receiveShadow onClick={onTap} />
      <instancedMesh ref={sandRef} args={[capGeo, white, data.sand.length]} receiveShadow onClick={onTap} />
      <instancedMesh ref={dirtRef} args={[dirtGeo, toon("#FFFFFF", { vertexColors: true, noOcclude: true }), data.dirt.length]} receiveShadow />
      <instancedMesh ref={strataRef} args={[box, white, data.strata.length]} />
      {ramps.map((r, k) => (
        <group key={k} position={[r.x, r.y, r.z]} onClick={onTap}>
          <mesh geometry={r.wedge} material={dirtMat} receiveShadow castShadow />
          <mesh
            position={[0, (r.lip + r.rise) / 2 + 0.02, 0]}
            rotation={[r.angle, 0, 0]}
            material={earthMat}
            receiveShadow
          >
            <boxGeometry args={[r.width - 0.08, 0.08, r.surfaceLen]} />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh
              key={side}
              position={[side * (r.width / 2 - 0.07), (r.lip + r.rise) / 2 + 0.12, 0]}
              rotation={[r.angle, 0, 0]}
              material={woodMat}
              castShadow
            >
              <boxGeometry args={[0.1, 0.2, r.surfaceLen + 0.04]} />
            </mesh>
          ))}
        </group>
      ))}
      <instancedMesh ref={plankRef} args={[plankGeo, white, data.planks.length]} receiveShadow castShadow onClick={onTap} />
      <instancedMesh ref={postRef} args={[postGeo, toon(palette.woodDeep), data.posts.length]} />
      <instancedMesh ref={shallowRef} args={[shallowGeo, toon(palette.shallow, { transparent: true, opacity: 0.8, water: true, emissive: "#6FB9CF" }), data.shallow.length]} />
      <mesh geometry={waterGeo} position={[0, WATER_Y, 0]} material={toon(palette.water, { water: true, emissive: "#2F8FB0" })} receiveShadow />
    </group>
  );
}
