"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { ThreeEvent } from "@react-three/fiber";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { input } from "@/game/input";
import { getPlacement, LEVEL, tileAt, tileCenter, tiles } from "@/game/island";
import { palette, toon } from "@/game/materials";
import { mulberry32 } from "@/game/rng";
import { isPaused, useGame } from "@/game/store";

const VOID_Y = 0.12;

const tmp = new THREE.Object3D();
const color = new THREE.Color();

type Inst = { x: number; y: number; z: number; sx: number; sy: number; sz: number; ry: number; c?: string };

const FACES = [
  { dir: "E" as const, dx: 1, dz: 0 },
  { dir: "W" as const, dx: -1, dz: 0 },
  { dir: "S" as const, dx: 0, dz: 1 },
  { dir: "N" as const, dx: 0, dz: -1 },
];

function useInstances(ref: React.RefObject<THREE.InstancedMesh | null>, items: Inst[]) {
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    items.forEach((it, k) => {
      tmp.position.set(it.x, it.y, it.z);
      tmp.rotation.set(0, it.ry, 0);
      tmp.scale.set(it.sx, it.sy, it.sz);
      tmp.updateMatrix();
      mesh.setMatrixAt(k, tmp.matrix);
      if (it.c) mesh.setColorAt(k, color.set(it.c));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [ref, items]);
}

function onTap(e: ThreeEvent<MouseEvent>) {
  if (isPaused(useGame.getState())) return;
  e.stopPropagation();
  input.tapTarget = { x: e.point.x, z: e.point.z };
}

function museumFootprint(i: number, j: number) {
  const [i0, j0, i1, j1] = getPlacement("museum").rect;
  return i >= i0 && i <= i1 && j >= j0 && j <= j1;
}

function buildCliffs() {
  const faces: Inst[] = [];
  const rocks: Inst[] = [];
  const tufts: Inst[] = [];
  const stems: Inst[] = [];
  const heads: Inst[] = [];
  const accents = [palette.orange, palette.sun, palette.violet, palette.blossom];

  for (const t of tiles) {
    if (t.h !== 2 || t.kind === "void" || t.kind === "water" || t.kind === "ramp") continue;
    const topY = t.h * LEVEL;
    const { x, z } = tileCenter(t.i, t.j);

    for (const face of FACES) {
      const n = tileAt(t.i + face.dx, t.j + face.dz);
      if (n?.kind === "ramp") continue;
      const outer = !n || n.kind === "void";
      const drop = !!n && n.kind !== "void" && n.h < t.h;
      if (!outer && !drop) continue;

      const lowY = outer ? VOID_Y : n.h * LEVEL;
      const seed = (t.i * 131 + t.j * 17 + face.dx * 7 + face.dz * 13) >>> 0;
      const rand = mulberry32(seed + 20260927);
      const alongX = face.dz === 0;
      const nLayers = outer ? 5 : 3;

      for (let k = 0; k < nLayers; k++) {
        const u = (k + 0.45 + rand() * 0.12) / nLayers;
        const stripe = k === 1 || (outer && k === 3);
        const out = 0.14 + u * (outer ? 0.78 : 0.4);
        const sy = (topY - lowY) / nLayers * (0.7 + rand() * 0.22);
        const along = 0.78 + rand() * 0.2;
        const thick = 0.2 + rand() * 0.1;
        const y = topY - u * (topY - lowY) * 0.94;
        const ox = x + face.dx * (0.5 + out);
        const oz = z + face.dz * (0.5 + out);
        const slide = (rand() - 0.5) * 0.16;
        faces.push({
          x: ox + (alongX ? 0 : slide),
          y,
          z: oz + (alongX ? slide : 0),
          sx: alongX ? thick : along,
          sy,
          sz: alongX ? along : thick,
          ry: (rand() - 0.5) * 0.14,
          c: stripe ? palette.cliffStripe : palette.cliff,
        });
      }

      if (rand() < 0.55) {
        const u = 0.28 + rand() * 0.45;
        const out = 0.22 + u * (outer ? 0.55 : 0.28);
        const along = 0.34 + rand() * 0.2;
        const side = (rand() < 0.5 ? -1 : 1) * (0.28 + rand() * 0.16);
        faces.push({
          x: x + face.dx * (0.5 + out) + (alongX ? 0 : side),
          y: topY - u * (topY - lowY) * 0.9,
          z: z + face.dz * (0.5 + out) + (alongX ? side : 0),
          sx: alongX ? 0.22 + rand() * 0.1 : along,
          sy: 0.22 + rand() * 0.16,
          sz: alongX ? along : 0.22 + rand() * 0.1,
          ry: (rand() - 0.5) * 0.4,
          c: rand() < 0.35 ? palette.cliffStripe : palette.cliff,
        });
      }

      if (rand() < 0.38 && n?.kind !== "path") {
        const count = 1 + (rand() < 0.35 ? 1 : 0);
        for (let r = 0; r < count; r++) {
          const out = 0.52 + rand() * 0.34;
          const side = (rand() - 0.5) * 0.42;
          const s = 0.38 + rand() * 0.34;
          rocks.push({
            x: x + face.dx * (0.52 + out) + (alongX ? 0 : side),
            y: lowY + s * 0.2,
            z: z + face.dz * (0.52 + out) + (alongX ? side : 0),
            sx: s * (0.9 + rand() * 0.25),
            sy: s * (0.55 + rand() * 0.2),
            sz: s * (0.8 + rand() * 0.25),
            ry: rand() * Math.PI,
            c: palette.cliffRock,
          });
        }
      }

      if (t.kind !== "path" && !museumFootprint(t.i, t.j)) {
        const rimX = x + face.dx * 0.32 + (alongX ? 0 : (rand() - 0.5) * 0.28);
        const rimZ = z + face.dz * 0.32 + (alongX ? (rand() - 0.5) * 0.28 : 0);
        tufts.push({
          x: rimX,
          y: topY,
          z: rimZ,
          sx: 0.85 + rand() * 0.4,
          sy: 0.75 + rand() * 0.4,
          sz: 0.85 + rand() * 0.4,
          ry: rand() * Math.PI,
        });
        if (rand() < 0.55) {
          const bloom = accents[Math.floor(rand() * accents.length)]!;
          const fx = rimX + (rand() - 0.5) * 0.22;
          const fz = rimZ + (rand() - 0.5) * 0.22;
          const s = 0.85 + rand() * 0.3;
          stems.push({ x: fx, y: topY, z: fz, sx: s, sy: s, sz: s, ry: rand() * Math.PI });
          heads.push({ x: fx, y: topY, z: fz, sx: s, sy: s, sz: s, ry: rand() * Math.PI, c: bloom });
        }
      }
    }
  }

  return { faces, rocks, tufts, stems, heads };
}

export function Cliffs() {
  const data = useMemo(buildCliffs, []);
  const faceRef = useRef<THREE.InstancedMesh>(null);
  const rockRef = useRef<THREE.InstancedMesh>(null);
  const tuftRef = useRef<THREE.InstancedMesh>(null);
  const stemRef = useRef<THREE.InstancedMesh>(null);
  const headRef = useRef<THREE.InstancedMesh>(null);

  const box = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const rockGeo = useMemo(() => new THREE.IcosahedronGeometry(0.5, 0).scale(1, 0.62, 0.88), []);
  const tuftGeo = useMemo(
    () =>
      mergeGeometries([
        new THREE.ConeGeometry(0.05, 0.3, 4).rotateZ(0.25).translate(-0.05, 0.13, 0),
        new THREE.ConeGeometry(0.05, 0.36, 4).translate(0, 0.16, 0.02),
        new THREE.ConeGeometry(0.05, 0.28, 4).rotateZ(-0.3).translate(0.06, 0.12, -0.02),
      ]),
    [],
  );
  const stemGeo = useMemo(() => new THREE.CylinderGeometry(0.018, 0.018, 0.3, 4).translate(0, 0.15, 0), []);
  const headGeo = useMemo(
    () =>
      mergeGeometries([
        new THREE.IcosahedronGeometry(0.075, 0).translate(0, 0.33, 0),
        new THREE.IcosahedronGeometry(0.045, 0).translate(0, 0.35, 0.05),
      ]),
    [],
  );

  useInstances(faceRef, data.faces);
  useInstances(rockRef, data.rocks);
  useInstances(tuftRef, data.tufts);
  useInstances(stemRef, data.stems);
  useInstances(headRef, data.heads);

  if (!data.faces.length) return null;
  return (
    <group>
      <instancedMesh
        ref={faceRef}
        args={[box, toon("#FFFFFF", { noOcclude: true }), data.faces.length]}
        castShadow
        receiveShadow
        onClick={onTap}
      />
      <instancedMesh ref={rockRef} args={[rockGeo, toon(palette.cliffRock, { flatShading: true }), data.rocks.length]} castShadow receiveShadow />
      <instancedMesh ref={tuftRef} args={[tuftGeo, toon(palette.foliage), data.tufts.length]} />
      <instancedMesh ref={stemRef} args={[stemGeo, toon(palette.foliageDeep), data.stems.length]} />
      <instancedMesh ref={headRef} args={[headGeo, toon("#FFFFFF", { flatShading: true }), data.heads.length]} />
    </group>
  );
}
