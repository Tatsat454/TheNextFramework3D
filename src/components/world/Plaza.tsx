"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { ThreeEvent } from "@react-three/fiber";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { input } from "@/game/input";
import { LEVEL, plazaRing } from "@/game/island";
import { palette, toon } from "@/game/materials";
import { mulberry32 } from "@/game/rng";
import { isPaused, useGame } from "@/game/store";

const SAND = "#F2DDA4";
const STONE = "#EAD2B0";
const PINK = "#FF8FB1";
const WHITE = "#FFFFFF";
const YELLOW = "#FFD23F";
const RED = "#FF6B6B";
const LUPINE = "#8A6BE0";

const tmp = new THREE.Object3D();

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
  const nStone = 20;
  for (let k = 0; k < nStone; k++) {
    const a = (k / nStone) * Math.PI * 2 + (rand() - 0.5) * 0.18;
    const r = sandInner + 0.38 + rand() * 0.52;
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
    { dx: 2.5, dz: -2.0, ry: Math.atan2(2.5, -2.0), sx: 1.5, sz: 1.2 },
    { dx: -2.5, dz: -1.0, ry: Math.atan2(-2.5, -1.0), sx: 1.55, sz: 1.15 },
  ];

  return { stones, blooms, lupines, tufts, connectors, cx, cz, y, grassInner, grassOuter, sandInner, sandOuter };
}

export function Plaza() {
  const data = useMemo(layout, []);
  const stoneRef = useRef<THREE.InstancedMesh>(null);
  const tuftRef = useRef<THREE.InstancedMesh>(null);
  const lupineRef = useRef<THREE.InstancedMesh>(null);
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

  useInstances(stoneRef, data.stones);
  useInstances(tuftRef, data.tufts);
  useInstances(lupineRef, data.lupines);

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
    </group>
  );
}
