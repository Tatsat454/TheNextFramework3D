"use client";

import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { input } from "@/game/input";
import { fountain, gazebo, LEVEL, nearGazebo, nearPlazaProp, plazaBlossoms, plazaPathOpening, plazaRing } from "@/game/island";
import { palette, toon } from "@/game/materials";
import { reducedMotion } from "@/game/player-state";
import { mulberry32 } from "@/game/rng";
import { isPaused, useGame } from "@/game/store";

const SAND = "#F2DDA4";
const STONE = "#EAD2B0";
const PINK = "#FF8FB1";
const WHITE = "#FFFFFF";
const YELLOW = "#FFD23F";
const RED = "#FF6B6B";
const LUPINE = "#8A6BE0";
const BUSH = "#4DB35E";
const ROCK = "#B8B8C0";

const tmp = new THREE.Object3D();

const skipPlant = (x: number, z: number, extra = 0) => plazaPathOpening(x, z, extra) || nearGazebo(x, z, extra + 0.15) || nearPlazaProp(x, z, extra);

type Inst = { x: number; y: number; z: number; sx: number; sy: number; sz: number; ry: number };

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
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [ref, items]);
}

function onTap(e: ThreeEvent<MouseEvent>) {
  if (isPaused(useGame.getState())) return;
  e.stopPropagation();
  input.tapTarget = { x: e.point.x, z: e.point.z };
}

function layout() {
  const rand = mulberry32(77);
  const { x: cx, z: cz, grassInner, grassOuter, sandInner, sandOuter } = plazaRing;
  const y = LEVEL;

  const stones: Inst[] = [];
  const nStone = 24;
  for (let k = 0; k < nStone; k++) {
    const a = (k / nStone) * Math.PI * 2 + (rand() - 0.5) * 0.14;
    const r = sandInner + 0.32 + rand() * 0.62;
    stones.push({
      x: cx + Math.cos(a) * r,
      y: y + 0.055,
      z: cz + Math.sin(a) * r,
      sx: 0.46 + rand() * 0.28,
      sy: 0.07 + rand() * 0.025,
      sz: 0.36 + rand() * 0.24,
      ry: a + (rand() - 0.5) * 0.7,
    });
  }
  for (let k = 0; k < 12; k++) {
    const a = ((k + 0.5) / 12) * Math.PI * 2 + (rand() - 0.5) * 0.12;
    const r = sandInner + 0.22 + rand() * 0.18;
    stones.push({
      x: cx + Math.cos(a) * r,
      y: y + 0.05,
      z: cz + Math.sin(a) * r,
      sx: 0.34 + rand() * 0.16,
      sy: 0.06,
      sz: 0.28 + rand() * 0.14,
      ry: a + rand() * 0.5,
    });
  }

  const blooms: Record<string, Inst[]> = { [PINK]: [], [WHITE]: [], [YELLOW]: [], [RED]: [] };
  const bloomColors = [PINK, WHITE, YELLOW, PINK, WHITE, YELLOW, RED, PINK];
  for (let k = 0; k < 92; k++) {
    const a = k * 2.399963 + rand() * 0.08;
    const u = rand();
    const r = Math.sqrt(grassInner * grassInner + (grassOuter * grassOuter - grassInner * grassInner) * u);
    const c = bloomColors[k % bloomColors.length]!;
    blooms[c]!.push({
      x: cx + Math.cos(a) * r,
      y: y + 0.04,
      z: cz + Math.sin(a) * r,
      sx: 0.72 + rand() * 0.45,
      sy: 0.72 + rand() * 0.4,
      sz: 0.72 + rand() * 0.45,
      ry: rand() * Math.PI * 2,
    });
  }

  const lupines: Inst[] = [];
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2 + 0.19 + (rand() - 0.5) * 0.2;
    const r = grassInner + 0.16 + rand() * (grassOuter - grassInner - 0.2);
    lupines.push({
      x: cx + Math.cos(a) * r,
      y: y + 0.04,
      z: cz + Math.sin(a) * r,
      sx: 0.85 + rand() * 0.35,
      sy: 0.9 + rand() * 0.45,
      sz: 0.85 + rand() * 0.35,
      ry: rand() * Math.PI,
    });
  }

  const tufts: Inst[] = [];
  for (let k = 0; k < 28; k++) {
    const a = ((k + 0.35) / 28) * Math.PI * 2 + (rand() - 0.5) * 0.15;
    const r = sandInner + 0.15 + rand() * (sandOuter - sandInner - 0.2);
    tufts.push({
      x: cx + Math.cos(a) * r,
      y: y + 0.045,
      z: cz + Math.sin(a) * r,
      sx: 0.7 + rand() * 0.5,
      sy: 0.55 + rand() * 0.4,
      sz: 0.7 + rand() * 0.5,
      ry: rand() * Math.PI,
    });
  }

  const connectors: { dx: number; dz: number; ry: number; sx: number; sz: number }[] = [
    { dx: 0, dz: 1, ry: 0, sx: 1.85, sz: 1.15 },
    { dx: 0, dz: -1, ry: 0, sx: 1.85, sz: 1.15 },
    { dx: 2.6, dz: -1.6, ry: Math.atan2(2.6, -1.6), sx: 1.9, sz: 1.55 },
    { dx: -2.4, dz: -0.9, ry: Math.atan2(-2.4, -0.9), sx: 1.8, sz: 1.35 },
  ];

  const { gardenInner, gardenOuter } = plazaRing;
  const bushColors = [PINK, WHITE, RED, PINK, WHITE];
  // Sit just outside the stepping stones, in the gaps between N/S/E/W path wedges.
  const bushSpecs = [
    { a: 0.58, r: 3.82 },
    { a: 0.98, r: 3.96 },
    { a: 1.36, r: 3.78 },
    { a: 2.68, r: 4.12 },
    { a: -2.52, r: 4.06 },
    { a: -1.42, r: 3.88 },
    { a: -1.02, r: 3.74 },
    { a: -0.6, r: 3.94 },
    { a: 1.58, r: 4.18 },
  ];
  const bushes: Inst[] = [];
  bushSpecs.forEach((spec, i) => {
    const a = spec.a + (rand() - 0.5) * 0.06;
    const r = spec.r + (rand() - 0.5) * 0.08;
    const x = cx + Math.cos(a) * r;
    const z = cz + Math.sin(a) * r;
    if (skipPlant(x, z, -0.12)) return;
    const s = 1.22 + rand() * 0.32;
    bushes.push({ x, y, z, sx: s, sy: 1.08 + rand() * 0.2, sz: s, ry: a + rand() });
    const nDot = 6 + Math.floor(rand() * 3);
    for (let d = 0; d < nDot; d++) {
      const da = a + (rand() - 0.5) * 1.5;
      const dr = 0.14 + rand() * 0.3;
      const c = bushColors[(i + d) % bushColors.length]!;
      blooms[c]!.push({
        x: x + Math.cos(da) * dr,
        y: y + 0.3 + rand() * 0.24,
        z: z + Math.sin(da) * dr,
        sx: 0.9 + rand() * 0.4,
        sy: 0.9 + rand() * 0.35,
        sz: 0.9 + rand() * 0.4,
        ry: rand() * Math.PI * 2,
      });
    }
    // Tall lupine cluster tucked against each bush.
    const nLup = 2 + Math.floor(rand() * 2);
    for (let d = 0; d < nLup; d++) {
      const da = a + (d - 0.4) * 0.28 + (rand() - 0.5) * 0.12;
      const dr = 0.38 + rand() * 0.22;
      lupines.push({
        x: x + Math.cos(da) * dr,
        y: y + 0.04,
        z: z + Math.sin(da) * dr,
        sx: 1.05 + rand() * 0.35,
        sy: 1.2 + rand() * 0.5,
        sz: 1.05 + rand() * 0.35,
        ry: rand() * Math.PI,
      });
    }
  });

  const rocks: Inst[] = [
    { a: 0.8, r: 3.62 },
    { a: 2.72, r: 3.92 },
  ]
    .map((o, i) => ({
      x: cx + Math.cos(o.a) * o.r,
      y: y + 0.18,
      z: cz + Math.sin(o.a) * o.r,
      sx: 1.22 + i * 0.12,
      sy: 0.92 + (i % 2) * 0.1,
      sz: 1.08 + (i % 2) * 0.14,
      ry: o.a * 0.55,
    }))
    .filter((r) => !nearGazebo(r.x, r.z, 0.2) && !nearPlazaProp(r.x, r.z, 0.15));
  const gazeboRock = {
    x: gazebo.x + 1.95,
    y: y + 0.18,
    z: gazebo.z + 0.72,
    sx: 1.3,
    sy: 0.95,
    sz: 1.12,
    ry: 0.4,
  };
  if (!nearPlazaProp(gazeboRock.x, gazeboRock.z, 0.15)) rocks.push(gazeboRock);

  for (let k = 0; k < 20; k++) {
    const a = k * 0.41 + 0.2;
    const r = gardenInner + 0.22 + rand() * (gardenOuter - gardenInner - 0.5);
    const x = cx + Math.cos(a) * r;
    const z = cz + Math.sin(a) * r;
    if (skipPlant(x, z, 0.04)) continue;
    lupines.push({
      x,
      y: y + 0.04,
      z,
      sx: 0.95 + rand() * 0.4,
      sy: 1.1 + rand() * 0.5,
      sz: 0.95 + rand() * 0.4,
      ry: rand() * Math.PI,
    });
  }

  for (let k = 0; k < 36; k++) {
    const a = k * 0.33 + 0.07;
    const r = gardenInner + 0.15 + rand() * (gardenOuter - gardenInner - 0.35);
    const x = cx + Math.cos(a) * r;
    const z = cz + Math.sin(a) * r;
    if (skipPlant(x, z, 0.08)) continue;
    tufts.push({
      x,
      y: y + 0.04,
      z,
      sx: 0.8 + rand() * 0.55,
      sy: 0.65 + rand() * 0.45,
      sz: 0.8 + rand() * 0.55,
      ry: rand() * Math.PI,
    });
  }

  for (let k = 0; k < 40; k++) {
    const a = k * 2.399 + 0.4;
    const r = gardenInner + 0.22 + rand() * 0.72;
    const x = cx + Math.cos(a) * r;
    const z = cz + Math.sin(a) * r;
    if (skipPlant(x, z, 0.04)) continue;
    const c = bushColors[k % bushColors.length]!;
    blooms[c]!.push({
      x,
      y: y + 0.04,
      z,
      sx: 0.75 + rand() * 0.4,
      sy: 0.75 + rand() * 0.35,
      sz: 0.75 + rand() * 0.4,
      ry: rand() * Math.PI * 2,
    });
  }

  return { stones, blooms, lupines, tufts, connectors, bushes, rocks, cx, cz, y, grassInner, grassOuter, sandInner, sandOuter };
}

export function Plaza() {
  const data = useMemo(layout, []);
  const stoneRef = useRef<THREE.InstancedMesh>(null);
  const tuftRef = useRef<THREE.InstancedMesh>(null);
  const lupineRef = useRef<THREE.InstancedMesh>(null);
  const bushRef = useRef<THREE.InstancedMesh>(null);
  const rockRef = useRef<THREE.InstancedMesh>(null);
  const bloomRefs = useRef<Record<string, THREE.InstancedMesh | null>>({});
  const stoneGeo = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 1, 0.16), []);
  const tuftGeo = useMemo(
    () =>
      mergeGeometries([
        new THREE.ConeGeometry(0.045, 0.22, 4).rotateZ(0.28).translate(-0.04, 0.1, 0),
        new THREE.ConeGeometry(0.045, 0.26, 4).translate(0, 0.12, 0.02),
        new THREE.ConeGeometry(0.045, 0.2, 4).rotateZ(-0.28).translate(0.05, 0.09, -0.02),
      ]),
    [],
  );
  const bloomGeo = useMemo(
    () =>
      mergeGeometries([
        new THREE.IcosahedronGeometry(0.055, 0).translate(0, 0.08, 0),
        new THREE.IcosahedronGeometry(0.032, 0).translate(0.03, 0.07, 0.02),
      ]),
    [],
  );
  const lupineGeo = useMemo(
    () =>
      mergeGeometries([
        new THREE.CylinderGeometry(0.012, 0.016, 0.28, 5).translate(0, 0.14, 0),
        new THREE.SphereGeometry(0.032, 6, 5).translate(0, 0.22, 0),
        new THREE.SphereGeometry(0.038, 6, 5).translate(0.01, 0.28, 0.01),
        new THREE.SphereGeometry(0.034, 6, 5).translate(-0.01, 0.34, 0),
        new THREE.SphereGeometry(0.026, 6, 5).translate(0, 0.4, 0.01),
      ]),
    [],
  );
  const bushGeo = useMemo(() => {
    const blob = (r: number, x: number, y: number, z: number) => new THREE.IcosahedronGeometry(r, 1).translate(x, y, z);
    return mergeGeometries([
      blob(0.4, 0, 0.34, 0),
      blob(0.3, 0.28, 0.28, 0.1),
      blob(0.28, -0.26, 0.26, -0.08),
      blob(0.24, 0.08, 0.5, -0.1),
      blob(0.22, -0.1, 0.3, 0.22),
      blob(0.2, 0.18, 0.38, -0.2),
    ]);
  }, []);
  const rockGeo = useMemo(
    () =>
      mergeGeometries([
        new THREE.IcosahedronGeometry(0.34, 1).scale(1.08, 0.62, 0.9),
        new THREE.IcosahedronGeometry(0.2, 1).translate(0.14, -0.02, 0.08).scale(1, 0.68, 0.95),
      ]),
    [],
  );

  useInstances(stoneRef, data.stones);
  useInstances(tuftRef, data.tufts);
  useInstances(lupineRef, data.lupines);
  useInstances(bushRef, data.bushes);
  useInstances(rockRef, data.rocks);

  const bloomEntries = useMemo(() => Object.entries(data.blooms).filter(([, list]) => list.length), [data.blooms]);

  useLayoutEffect(() => {
    for (const [color, list] of bloomEntries) {
      const mesh = bloomRefs.current[color];
      if (!mesh) continue;
      list.forEach((it, k) => {
        tmp.position.set(it.x, it.y, it.z);
        tmp.rotation.set(0, it.ry, 0);
        tmp.scale.set(it.sx, it.sy, it.sz);
        tmp.updateMatrix();
        mesh.setMatrixAt(k, tmp.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    }
  }, [bloomEntries]);

  const { cx, cz, y, grassInner, grassOuter, sandInner, sandOuter } = data;

  return (
    <group>
      <mesh position={[cx, y + 0.028, cz]} rotation={[-Math.PI / 2, 0, 0]} material={toon(SAND, { noOcclude: true })} receiveShadow onClick={onTap}>
        <ringGeometry args={[sandInner, sandOuter, 18]} />
      </mesh>
      <mesh position={[cx, y + 0.036, cz]} rotation={[-Math.PI / 2, 0, 0]} material={toon(palette.grass, { noOcclude: true })} receiveShadow onClick={onTap}>
        <ringGeometry args={[grassInner, grassOuter, 16]} />
      </mesh>
      {data.connectors.map((c, k) => {
        const len = Math.hypot(c.dx, c.dz);
        return (
          <mesh
            key={k}
            position={[cx + (c.dx / len) * (sandOuter - 0.12), y + 0.03, cz + (c.dz / len) * (sandOuter - 0.12)]}
            rotation={[0, c.ry, 0]}
            material={toon(SAND, { noOcclude: true })}
            receiveShadow
            onClick={onTap}
          >
            <boxGeometry args={[c.sx, 0.05, c.sz]} />
          </mesh>
        );
      })}
      <instancedMesh ref={stoneRef} args={[stoneGeo, toon(STONE), data.stones.length]} receiveShadow castShadow />
      <instancedMesh ref={bushRef} args={[bushGeo, toon(BUSH, { flatShading: true }), data.bushes.length]} castShadow receiveShadow />
      <instancedMesh ref={rockRef} args={[rockGeo, toon(ROCK, { flatShading: true }), data.rocks.length]} castShadow receiveShadow />
      <instancedMesh ref={tuftRef} args={[tuftGeo, toon(palette.foliage), data.tufts.length]} />
      {bloomEntries.map(([color, list]) => (
        <instancedMesh
          key={color}
          ref={(m) => {
            bloomRefs.current[color] = m;
          }}
          args={[bloomGeo, toon(color, { flatShading: true }), list.length]}
        />
      ))}
      <instancedMesh ref={lupineRef} args={[lupineGeo, toon(LUPINE, { flatShading: true }), data.lupines.length]} />
      <PlazaBlossoms />
    </group>
  );
}

const CANOPY = "#FFB7D2";
const CANOPY_DEEP = "#FF9EBF";
const TRUNK = "#4E2F22";
const PETAL = "#FFB7D2";
const WATER_R = 1.08;
const WATER_Y = LEVEL + 0.39;
const GROUND_Y = LEVEL + 0.045;
const PER_TREE = 32;

function blob(r: number, x: number, y: number, z: number) {
  return new THREE.IcosahedronGeometry(r, 1).translate(x, y, z);
}

function PlazaBlossoms() {
  const trunkGeo = useMemo(
    () =>
      mergeGeometries([
        new THREE.CylinderGeometry(0.15, 0.22, 1.12, 7).translate(0, 0.56, 0),
        new THREE.SphereGeometry(0.2, 6, 5).translate(0, 1.12, 0),
      ]),
    [],
  );
  const canopyGeo = useMemo(
    () =>
      mergeGeometries([
        blob(0.82, 0, 1.92, 0),
        blob(0.58, 0.62, 1.62, 0.18),
        blob(0.54, -0.58, 1.7, -0.16),
        blob(0.5, 0.08, 2.48, -0.06),
        blob(0.46, 0.22, 1.58, 0.58),
        blob(0.44, -0.18, 1.52, -0.52),
        blob(0.4, 0.48, 2.18, 0.32),
        blob(0.38, -0.44, 2.22, 0.2),
        blob(0.34, 0.12, 2.05, -0.48),
      ]),
    [],
  );
  const deepGeo = useMemo(
    () => mergeGeometries([blob(0.46, -0.28, 1.78, 0.28), blob(0.4, 0.38, 1.88, -0.22), blob(0.32, 0.05, 1.48, 0.12)]),
    [],
  );

  return (
    <group>
      {plazaBlossoms.map((t) => (
        <group key={t.seed} position={[t.x, t.y, t.z]} rotation={[0, t.seed * Math.PI * 2, 0]} scale={t.s}>
          <mesh geometry={trunkGeo} material={toon(TRUNK)} castShadow />
          <mesh geometry={canopyGeo} material={toon(CANOPY, { flatShading: true, sway: true })} castShadow receiveShadow />
          <mesh geometry={deepGeo} material={toon(CANOPY_DEEP, { flatShading: true, sway: true })} castShadow />
        </group>
      ))}
    </group>
  );
}

type Petal = {
  tree: number;
  t: number;
  dur: number;
  ox: number;
  oz: number;
  spin: number;
  sway: number;
  wind: number;
  seek: boolean;
  waterA: number;
  waterR: number;
  waterSp: number;
  mode: 0 | 1 | 2;
  rest: number;
  rx: number;
  rz: number;
};

function seedPetal(p: Petal, k: number, rand: () => number) {
  p.tree = k % plazaBlossoms.length;
  p.t = rand() * 0.2;
  p.dur = 4.4 + rand() * 2.4;
  p.ox = (rand() - 0.5) * 1.5;
  p.oz = (rand() - 0.5) * 1.5;
  p.spin = rand() * 6;
  p.sway = 1.2 + rand() * 1.1;
  p.wind = 0.08 + rand() * 0.18;
  p.seek = k % 3 === 0 || rand() < 0.28;
  p.waterA = rand() * Math.PI * 2;
  p.waterR = 0.28 + rand() * 0.72;
  p.waterSp = 0.08 + rand() * 0.1;
  p.mode = 0;
  p.rest = 0;
  p.rx = 0;
  p.rz = 0;
}

/** Drawn after the fountain so petals sit on the water instead of under it. */
export function PlazaPetals() {
  const count = plazaBlossoms.length * PER_TREE;
  const ref = useRef<THREE.InstancedMesh>(null);
  const tmpObj = useMemo(() => new THREE.Object3D(), []);
  const state = useMemo(() => {
    const rand = mulberry32(41);
    return Array.from({ length: count }, (_, k) => {
      const p = {} as Petal;
      seedPetal(p, k, rand);
      p.t = rand() * p.dur;
      if (k % 5 === 0) {
        p.mode = 2;
        p.rest = rand() * 2.5;
      } else if (k % 6 === 1) {
        p.mode = 1;
        p.rest = rand() * 0.8;
        const tree = plazaBlossoms[p.tree]!;
        p.rx = tree.x + p.ox * 1.2;
        p.rz = tree.z + p.oz * 1.2;
      }
      return p;
    });
  }, [count]);

  useFrame((_, rawDt) => {
    const mesh = ref.current;
    if (!mesh || !plazaBlossoms.length) return;
    const dt = Math.min(rawDt, 1 / 20);
    const rm = reducedMotion.value;
    for (let k = 0; k < state.length; k++) {
      const p = state[k]!;
      const tree = plazaBlossoms[p.tree]!;
      const canopy = tree.y + 1.85 * tree.s;

      if (rm) {
        if (k % 7 === 0) {
          tmpObj.position.set(fountain.x + Math.cos(p.waterA) * p.waterR, WATER_Y, fountain.z + Math.sin(p.waterA) * p.waterR);
          tmpObj.rotation.set(1.2, p.spin, 0);
          tmpObj.scale.setScalar(0.85);
        } else if (k % 4 === 0) {
          tmpObj.position.set(tree.x + p.ox, GROUND_Y, tree.z + p.oz);
          tmpObj.rotation.set(1.35, p.spin, 0.2);
          tmpObj.scale.setScalar(0.8);
        } else {
          tmpObj.scale.setScalar(0);
        }
        tmpObj.updateMatrix();
        mesh.setMatrixAt(k, tmpObj.matrix);
        continue;
      }

      if (p.mode === 0) {
        p.t += dt;
        const u = Math.min(1, p.t / p.dur);
        let x = tree.x + p.ox + Math.sin(p.t * p.sway + p.spin) * 0.38 + u * p.wind * 1.4;
        let z = tree.z + p.oz + Math.cos(p.t * p.sway * 0.85 + p.spin) * 0.28 + u * 0.12;
        if (p.seek) {
          const tx = fountain.x + Math.cos(p.waterA) * p.waterR;
          const tz = fountain.z + Math.sin(p.waterA) * p.waterR;
          const kSeek = u * u * 0.92;
          x += (tx - x) * kSeek;
          z += (tz - z) * kSeek;
        }
        const y = canopy - u * (canopy - GROUND_Y + 0.02);
        const d = Math.hypot(x - fountain.x, z - fountain.z);
        if (u >= 1 || y <= GROUND_Y + 0.01) {
          p.rx = x;
          p.rz = z;
          p.rest = 0;
          p.mode = d < WATER_R ? 2 : 1;
        }
        tmpObj.position.set(x, Math.max(y, GROUND_Y), z);
        tmpObj.rotation.set(p.t * 1.8 + p.spin, p.t * 0.9 + p.spin, Math.sin(p.t * 2.2) * 0.6);
        tmpObj.scale.set(1, 0.55, 1);
      } else if (p.mode === 1) {
        p.rest += dt;
        const fade = Math.max(0, 1 - Math.max(0, p.rest - 1.15) / 1.1);
        tmpObj.position.set(p.rx, GROUND_Y, p.rz);
        tmpObj.rotation.set(1.4, p.spin + p.rest * 0.05, 0.15);
        tmpObj.scale.setScalar(fade);
        if (fade <= 0) seedPetal(p, k, () => Math.random());
      } else {
        p.rest += dt;
        p.waterA += p.waterSp * dt;
        const r = p.waterR + Math.sin(p.rest * 0.7 + p.spin) * 0.04;
        const x = fountain.x + Math.cos(p.waterA) * r;
        const z = fountain.z + Math.sin(p.waterA) * r;
        const fade = Math.max(0, 1 - Math.max(0, p.rest - 3.4) / 1.6);
        tmpObj.position.set(x, WATER_Y + Math.sin(p.rest * 1.4 + p.spin) * 0.01, z);
        tmpObj.rotation.set(1.15, p.waterA, 0.2);
        tmpObj.scale.set(0.95 * fade, 0.45 * fade, 0.95 * fade);
        if (fade <= 0) seedPetal(p, k, () => Math.random());
      }
      tmpObj.updateMatrix();
      mesh.setMatrixAt(k, tmpObj.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  if (!count) return null;
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false} material={toon(PETAL, { side: THREE.DoubleSide, noOcclude: true, transparent: true, opacity: 0.95, emissive: "#FFD0E0" })}>
      <circleGeometry args={[0.078, 5]} />
    </instancedMesh>
  );
}
