"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { ThreeEvent } from "@react-three/fiber";
import { dock, H, LEVEL, rampRuns, tileAt, tileCenter, tiles, W, WATER_Y } from "@/game/island";
import { input } from "@/game/input";
import { palette, toon } from "@/game/materials";
import { isPaused, useGame } from "@/game/store";

const BASE = -0.85;

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
    const dirt: { x: number; y: number; z: number; sx: number; sy: number; sz: number; c: string }[] = [];
    const fall: number[] = [];
    const fallIdx: number[] = [];

    type Bucket = { pos: number[]; idx: number[]; corner: Map<string, number> };
    const grass: Bucket = { pos: [], idx: [], corner: new Map() };
    const path: Bucket = { pos: [], idx: [], corner: new Map() };
    const sand: Bucket = { pos: [], idx: [], corner: new Map() };
    const water: Bucket = { pos: [], idx: [], corner: new Map() };

    const weld = (b: Bucket, i0: number, j0: number, i1: number, j1: number, y: number) => {
      const corner = (i: number, j: number) => {
        const key = `${i},${j},${y.toFixed(3)}`;
        const hit = b.corner.get(key);
        if (hit !== undefined) return hit;
        const n = b.pos.length / 3;
        b.pos.push(i - W / 2, y, j - H / 2);
        b.corner.set(key, n);
        return n;
      };
      const a = corner(i0, j0);
      const c = corner(i1, j0);
      const d = corner(i1, j1);
      const e = corner(i0, j1);
      b.idx.push(a, e, d, a, d, c);
    };

    const pushFall = (x: number, z: number, w: number) => {
      const b = fall.length / 3;
      const y0 = WATER_Y + 0.04;
      const y1 = BASE - 1.35;
      const z0 = z + 0.5;
      const z1 = z + 1.35;
      fall.push(x - w, y0, z0, x + w, y0, z0, x + w, y1, z1, x - w, y1, z1);
      fallIdx.push(b, b + 3, b + 2, b, b + 2, b + 1);
    };

    for (const t of tiles) {
      if (t.kind === "void") continue;
      const { x, z } = tileCenter(t.i, t.j);
      if (t.kind === "water") {
        const top = LEVEL - 0.32;
        const sy = top - BASE;
        dirt.push({ x, y: BASE + sy / 2, z, sx: 1.08, sy, sz: 1.08, c: palette.dirt });
        weld(water, t.i, t.j, t.i + 1, t.j + 1, WATER_Y);
        const south = tileAt(t.i, t.j + 1);
        if ((!south || south.kind === "void") && t.j >= 40) pushFall(x, z, 0.72);
        continue;
      }
      const top = t.h * LEVEL;
      const sy = top - 0.02 - BASE;
      dirt.push({ x, y: BASE + sy / 2, z, sx: 1.08, sy, sz: 1.08, c: palette.dirt });
      if (t.kind === "ramp" || t.kind === "dock") continue;
      if (t.kind === "path") weld(path, t.i, t.j, t.i + 1, t.j + 1, top + 0.04);
      else if (t.kind === "sand") weld(sand, t.i, t.j, t.i + 1, t.j + 1, top + 0.02);
      else weld(grass, t.i, t.j, t.i + 1, t.j + 1, top + 0.02);
    }

    const geoOf = (pos: number[], idx: number[]) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      g.setIndex(idx);
      g.computeVertexNormals();
      g.computeBoundingSphere();
      return g;
    };

    const steps: { x: number; y: number; z: number; sx: number; sy: number; sz: number; c: string }[] = [];
    for (const run of rampRuns) {
      const a = tileCenter(run.i0, run.j0);
      const b = tileCenter(run.i1, run.j1);
      const cx = (a.x + b.x) / 2;
      const width = run.i1 - run.i0 + 1 - 0.18;
      const south = tileCenter(run.i0, run.j1).z + 0.5;
      const north = tileCenter(run.i0, run.j0).z - 0.5;
      const length = south - north;
      const n = 5;
      const base = run.h * LEVEL;
      for (let k = 0; k < n; k++) {
        const t = (k + 0.55) / n;
        steps.push({
          x: cx,
          y: base + t * LEVEL - 0.05,
          z: south - t * length,
          sx: width,
          sy: 0.11,
          sz: length / n + 0.06,
          c: k % 2 ? "#E8D5A8" : "#D7C08A",
        });
      }
    }

    const planks: { x: number; y: number; z: number; c: string }[] = [];
    const posts: { x: number; y: number; z: number }[] = [];
    const a = tileCenter(dock.i0, dock.j0);
    const b = tileCenter(dock.i1, dock.j1);
    const cx = (a.x + b.x) / 2;
    const y = LEVEL + 0.04;
    const south = b.z + 0.42;
    const north = a.z - 0.42;
    const span = south - north;
    const n = Math.max(5, Math.round(span / 0.36));
    for (let k = 0; k < n; k++) {
      planks.push({ x: cx, y, z: south - (k + 0.5) * (span / n), c: k % 2 ? palette.wood : "#C4976B" });
    }
    posts.push({ x: a.x - 0.35, y: LEVEL - 0.35, z: a.z });
    posts.push({ x: b.x + 0.35, y: LEVEL - 0.35, z: a.z });
    posts.push({ x: a.x - 0.35, y: LEVEL - 0.35, z: b.z });
    posts.push({ x: b.x + 0.35, y: LEVEL - 0.35, z: b.z });

    return {
      grassGeo: geoOf(grass.pos, grass.idx),
      pathGeo: geoOf(path.pos, path.idx),
      sandGeo: geoOf(sand.pos, sand.idx),
      waterGeo: geoOf(water.pos, water.idx),
      fallGeo: geoOf(fall, fallIdx),
      dirt,
      steps,
      planks,
      posts,
    };
  }, []);

  const box = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const dirtGeo = useMemo(() => {
    const g = new THREE.BoxGeometry(1, 1, 1);
    const pos = g.attributes.position;
    const cols = new Float32Array(pos.count * 3);
    for (let k = 0; k < pos.count; k++) {
      const v = pos.getY(k) > 0 ? 1 : 0.72;
      cols.set([v, v * 0.98, v * 0.9], k * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(cols, 3));
    return g;
  }, []);
  const plankGeo = useMemo(() => new RoundedBoxGeometry(2.05, 0.1, 0.32, 1, 0.03), []);
  const postGeo = useMemo(() => new THREE.CylinderGeometry(0.07, 0.07, 0.85, 8), []);

  const dirtRef = useRef<THREE.InstancedMesh>(null);
  const stepRef = useRef<THREE.InstancedMesh>(null);
  const plankRef = useRef<THREE.InstancedMesh>(null);
  const postRef = useRef<THREE.InstancedMesh>(null);

  useInstances(dirtRef, data.dirt);
  useInstances(stepRef, data.steps);
  useInstances(plankRef, data.planks);
  useInstances(postRef, data.posts);

  const onTap = (e: ThreeEvent<MouseEvent>) => {
    if (isPaused(useGame.getState())) return;
    e.stopPropagation();
    input.tapTarget = { x: e.point.x, z: e.point.z };
  };

  return (
    <group>
      <mesh geometry={data.grassGeo} material={toon(palette.grass, { noOcclude: true })} onClick={onTap} />
      <mesh geometry={data.pathGeo} material={toon(palette.earth, { noOcclude: true })} onClick={onTap} />
      <mesh geometry={data.sandGeo} material={toon(palette.sand, { noOcclude: true })} onClick={onTap} />
      <instancedMesh ref={dirtRef} args={[dirtGeo, toon("#FFFFFF", { vertexColors: true, noOcclude: true }), data.dirt.length]} receiveShadow />
      <instancedMesh ref={stepRef} args={[box, toon("#FFFFFF", { noOcclude: true }), data.steps.length]} receiveShadow castShadow onClick={onTap} />
      <instancedMesh ref={plankRef} args={[plankGeo, toon("#FFFFFF", { noOcclude: true }), data.planks.length]} receiveShadow castShadow onClick={onTap} />
      <instancedMesh ref={postRef} args={[postGeo, toon(palette.woodDeep), data.posts.length]} />
      <mesh
        geometry={data.waterGeo}
        material={toon(palette.water, { water: true, emissive: "#6FB9CF", transparent: true, opacity: 0.92 })}
      />
      <mesh
        geometry={data.fallGeo}
        material={toon(palette.shallow, { water: true, emissive: "#8FE4F4", transparent: true, opacity: 0.78, side: THREE.DoubleSide, noOcclude: true })}
      />
    </group>
  );
}
