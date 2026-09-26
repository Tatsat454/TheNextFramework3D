"use client";

import { useLayoutEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { MUSEUM, MUSEUM_COLORS, MUSEUM_PEDESTALS, museumStairSouth } from "@/game/interiors";
import { toon } from "@/game/materials";
import { ClearColor } from "./Interior";
import { ExhibitObject } from "./ExhibitObject";

type V3 = [number, number, number];
const C = MUSEUM_COLORS;
const ROCK = [C.rockA, C.rockB, C.rockC] as const;

function Box({ p, s, c, r, glow, shadow = true }: { p: V3; s: V3; c: string; r?: V3; glow?: boolean; shadow?: boolean }) {
  return (
    <mesh position={p} rotation={r} material={toon(c, { emissive: glow ? c : undefined, noOcclude: true })} castShadow={shadow} receiveShadow={shadow}>
      <boxGeometry args={s} />
    </mesh>
  );
}

function SouthWindow({ x }: { x: number }) {
  const z = MUSEUM.halfD;
  return (
    <group position={[x, 1.85, z]}>
      <Box p={[0, 0, 0]} s={[1.35, 1.35, 0.12]} c="#C48A55" shadow={false} />
      <Box p={[0, 0, 0]} s={[1.12, 1.12, 0.28]} c="#FFE7A8" glow shadow={false} />
      <Box p={[0, 0, 0.15]} s={[0.06, 1.12, 0.02]} c="#C48A55" shadow={false} />
      <Box p={[0, 0, 0.15]} s={[1.12, 0.06, 0.02]} c="#C48A55" shadow={false} />
      <Box p={[0, 0, -0.15]} s={[0.06, 1.12, 0.02]} c="#C48A55" shadow={false} />
      <Box p={[0, 0, -0.15]} s={[1.12, 0.06, 0.02]} c="#C48A55" shadow={false} />
    </group>
  );
}

function SouthWallSegment({ cx, span, winX }: { cx: number; span: number; winX: number }) {
  const t = 0.22;
  const z = MUSEUM.halfD;
  const h = 3.15;
  const winW = 1.42;
  const winH = 1.42;
  const winY = 1.85;
  const sill = winY - winH / 2;
  const headerH = h - (winY + winH / 2);
  const headerY = winY + winH / 2 + headerH / 2;
  const x0 = cx - span / 2;
  const x1 = cx + span / 2;
  const leftW = winX - winW / 2 - x0;
  const rightW = x1 - (winX + winW / 2);
  return (
    <group>
      <Box p={[cx, sill / 2, z]} s={[span, sill, t]} c={C.wall} />
      <Box p={[x0 + leftW / 2, winY, z]} s={[leftW, winH, t]} c={C.wall} />
      <Box p={[x1 - rightW / 2, winY, z]} s={[rightW, winH, t]} c={C.wall} />
      <Box p={[cx, headerY, z]} s={[span, headerH, t]} c={C.wall} />
    </group>
  );
}

function Walls() {
  const h = 3.15;
  const y = h / 2;
  const t = 0.22;
  const { halfW: hw, halfD: hd } = MUSEUM;
  const winX = 5.05;
  return (
    <group>
      <Box p={[0, y, -hd]} s={[hw * 2 + 0.22, h, t]} c={C.wall} shadow={false} />
      <SouthWallSegment cx={-4.4} span={7.2} winX={-winX} />
      <SouthWallSegment cx={4.4} span={7.2} winX={winX} />
      <Box p={[-0.82, 1.15, hd]} s={[0.18, 2.3, 0.28]} c="#8B5A32" />
      <Box p={[0.82, 1.15, hd]} s={[0.18, 2.3, 0.28]} c="#8B5A32" />
      <Box p={[0, 2.32, hd]} s={[1.82, 0.16, 0.28]} c="#8B5A32" />
      <Box p={[hw, y, 0]} s={[t, h, hd * 2 + 0.22]} c={C.wall} />
      <Box p={[-hw, y, 0]} s={[t, h, hd * 2 + 0.22]} c={C.wall} />
      <SouthWindow x={-winX} />
      <SouthWindow x={winX} />
    </group>
  );
}

function StairRail({ x }: { x: number }) {
  const m = MUSEUM;
  const z0 = m.deckZ + 0.05;
  const z1 = museumStairSouth() - 0.02;
  const run = z1 - z0;
  const pitch = Math.atan2(m.deckH, run);
  const len = Math.hypot(run, m.deckH) + 0.12;
  const hand = 0.5;
  const midZ = (z0 + z1) / 2;
  const midY = m.deckH / 2 + hand;
  return (
    <group>
      <Box p={[x, (m.deckH + 0.1) / 2, z0]} s={[0.1, m.deckH + 0.1, 0.1]} c={C.rail} />
      <Box p={[x, (hand + 0.1) / 2, z1]} s={[0.1, hand + 0.1, 0.1]} c={C.rail} />
      <Box p={[x, midY, midZ]} s={[0.08, 0.08, len]} c={C.rail} r={[pitch, 0, 0]} />
    </group>
  );
}

function StairFlight({ x, halfW, rails }: { x: number; halfW: number; rails: boolean }) {
  const m = MUSEUM;
  const TH = 0.13;
  const treads = Array.from({ length: m.steps }, (_, i) => {
    const top = m.deckH - i * m.stepH;
    const z = m.deckZ + (i + 0.5) * m.stepD;
    return { i, top, z };
  });
  return (
    <group>
      <Box p={[x, m.deckH - TH / 2, m.deckZ - 0.06]} s={[halfW * 2, TH, 0.28]} c={C.stone} />
      {treads.map((t) => (
        <Box key={t.i} p={[x, t.top - TH / 2, t.z]} s={[halfW * 2, TH, m.stepD + 0.04]} c={t.i % 2 ? C.stoneDeep : C.stone} />
      ))}
      {rails && (
        <>
          <StairRail x={x - halfW - 0.08} />
          <StairRail x={x + halfW + 0.08} />
        </>
      )}
    </group>
  );
}

function blob(r: number, x: number, y: number, z: number, sx = 1, sy = 1, sz = 1) {
  const g = new THREE.IcosahedronGeometry(r, 0);
  g.scale(sx, sy, sz);
  g.translate(x, y, z);
  return g;
}

function useBoulderGeos() {
  return useMemo(() => {
    const big = mergeGeometries([
      blob(0.44, 0, 0.3, 0, 1.18, 0.72, 1.02),
      blob(0.3, 0.24, 0.24, 0.1, 1.05, 0.68, 0.92),
      blob(0.28, -0.22, 0.22, -0.12, 1.12, 0.62, 0.95),
      blob(0.22, 0.04, 0.46, -0.06, 0.95, 0.7, 0.9),
    ])!;
    const mid = mergeGeometries([
      blob(0.36, 0, 0.24, 0, 1.08, 0.68, 1.05),
      blob(0.22, 0.18, 0.18, -0.12, 1.15, 0.58, 0.88),
      blob(0.2, -0.16, 0.16, 0.1, 1, 0.6, 0.95),
    ])!;
    const squat = mergeGeometries([
      blob(0.4, 0, 0.22, 0, 1.35, 0.55, 1.1),
      blob(0.24, 0.2, 0.16, 0.08, 1.1, 0.5, 0.9),
      blob(0.2, -0.18, 0.14, -0.1, 1.05, 0.48, 0.95),
    ])!;
    const small = mergeGeometries([
      blob(0.22, 0, 0.15, 0, 1.12, 0.62, 1),
      blob(0.14, 0.12, 0.12, 0.06, 1.05, 0.55, 0.9),
    ])!;
    const face = mergeGeometries([
      blob(0.38, 0, 0.42, 0, 1.25, 1.15, 0.52),
      blob(0.28, 0.22, 0.62, 0.04, 1.05, 0.95, 0.48),
      blob(0.26, -0.2, 0.28, 0.05, 1.15, 0.9, 0.5),
      blob(0.2, 0.04, 0.88, -0.02, 0.95, 0.7, 0.45),
    ])!;
    return [big, mid, squat, small, face];
  }, []);
}

type Spot = { p: V3; s: V3; ry: number; geo: number; c: number };

function cliffSpots(x0: number, x1: number): Spot[] {
  const m = MUSEUM;
  const spots: Spot[] = [];
  const w = x1 - x0;
  const n = Math.max(3, Math.round(w / 0.38));
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const x = x0 + t * w;
    const jig = ((i * 5 + 3) % 7) * 0.04 - 0.12;
    spots.push({
      p: [x + jig * 0.35, 0, m.deckZ - 0.02],
      s: [1.05 + (i % 3) * 0.1, 1.42 + (i % 2) * 0.1, 0.78],
      ry: i * 0.67,
      geo: 4,
      c: i % 3,
    });
    spots.push({
      p: [x - jig, 0.06, m.deckZ + 0.1],
      s: [0.78 + (i % 2) * 0.12, 1.05, 0.62],
      ry: i * 1.05 + 0.35,
      geo: i % 3,
      c: (i + 2) % 3,
    });
    if (i % 2 === 0) {
      spots.push({
        p: [x + jig * 0.8, 0.55, m.deckZ + 0.06],
        s: [0.62, 0.8, 0.5],
        ry: i * 0.4 + 1.2,
        geo: 2,
        c: (i + 1) % 3,
      });
    }
  }
  return spots;
}

function terraceRocks(): Spot[] {
  const y = MUSEUM.deckH;
  const back: Spot[] = [
    // NW corner mound
    { p: [-6.75, y, -5.25], s: [1.75, 1.55, 1.6], ry: 0.4, geo: 0, c: 0 },
    { p: [-5.95, y, -5.5], s: [1.35, 1.2, 1.25], ry: 1.8, geo: 2, c: 2 },
    { p: [-7.28, y, -4.4], s: [1.25, 1.1, 1.15], ry: 2.4, geo: 1, c: 1 },
    { p: [-6.35, y, -4.55], s: [1.05, 0.95, 1.0], ry: 0.9, geo: 1, c: 2 },
    { p: [-7.38, y, -5.5], s: [0.9, 0.85, 0.85], ry: 3.1, geo: 0, c: 0 },
    { p: [-7.05, y, -3.85], s: [0.95, 0.85, 0.9], ry: 1.2, geo: 2, c: 1 },
    // North wall, west of center
    { p: [-4.65, y, -5.48], s: [1.2, 1.05, 1.05], ry: 0.2, geo: 0, c: 1 },
    { p: [-3.55, y, -5.55], s: [1.1, 1.0, 1.0], ry: 1.4, geo: 2, c: 0 },
    { p: [-2.5, y, -5.42], s: [0.95, 0.9, 0.9], ry: 2.2, geo: 1, c: 2 },
    { p: [-4.05, y, -5.15], s: [0.75, 0.7, 0.75], ry: 0.7, geo: 3, c: 1 },
    // Behind the center exhibit pad
    { p: [-0.95, y, -5.5], s: [1.2, 1.1, 1.05], ry: 0.6, geo: 0, c: 2 },
    { p: [0.2, y, -5.58], s: [1.15, 1.2, 1.05], ry: 2.0, geo: 2, c: 0 },
    { p: [1.05, y, -5.42], s: [1.0, 0.95, 0.95], ry: 1.1, geo: 1, c: 1 },
    { p: [0.15, y, -5.1], s: [0.7, 0.65, 0.7], ry: 2.5, geo: 3, c: 2 },
    // North wall, east of center
    { p: [2.5, y, -5.42], s: [0.95, 0.9, 0.9], ry: 0.5, geo: 1, c: 0 },
    { p: [3.55, y, -5.55], s: [1.1, 1.0, 1.0], ry: 2.6, geo: 2, c: 2 },
    { p: [4.65, y, -5.48], s: [1.2, 1.05, 1.05], ry: 1.7, geo: 0, c: 1 },
    { p: [4.05, y, -5.15], s: [0.75, 0.7, 0.75], ry: 0.3, geo: 3, c: 0 },
    // NE corner mound
    { p: [6.75, y, -5.25], s: [1.75, 1.55, 1.6], ry: 2.1, geo: 0, c: 2 },
    { p: [5.95, y, -5.5], s: [1.35, 1.2, 1.25], ry: 0.3, geo: 2, c: 0 },
    { p: [7.28, y, -4.4], s: [1.25, 1.1, 1.15], ry: 1.2, geo: 1, c: 1 },
    { p: [6.35, y, -4.55], s: [1.05, 0.95, 1.0], ry: 2.8, geo: 1, c: 0 },
    { p: [7.38, y, -5.5], s: [0.9, 0.85, 0.85], ry: 0.8, geo: 0, c: 2 },
    { p: [7.05, y, -3.85], s: [0.95, 0.85, 0.9], ry: 2.3, geo: 2, c: 1 },
    // West terrace edge
    { p: [-7.38, y, -3.35], s: [0.85, 0.8, 0.9], ry: 0.4, geo: 1, c: 0 },
    { p: [-7.42, y, -2.15], s: [0.75, 0.7, 0.8], ry: 1.9, geo: 2, c: 2 },
    { p: [-7.35, y, -1.05], s: [0.7, 0.65, 0.75], ry: 2.5, geo: 3, c: 1 },
    { p: [-7.28, y, -0.62], s: [0.8, 0.7, 0.7], ry: 0.15, geo: 0, c: 0 },
    // East terrace edge
    { p: [7.38, y, -3.35], s: [0.85, 0.8, 0.9], ry: 2.8, geo: 1, c: 2 },
    { p: [7.42, y, -2.15], s: [0.75, 0.7, 0.8], ry: 0.6, geo: 2, c: 0 },
    { p: [7.35, y, -1.05], s: [0.7, 0.65, 0.75], ry: 1.4, geo: 3, c: 1 },
    { p: [7.28, y, -0.62], s: [0.8, 0.7, 0.7], ry: 2.2, geo: 0, c: 2 },
    // Rocky lip on the terrace, between stair landings
    { p: [-3.55, y, -0.58], s: [0.7, 0.6, 0.65], ry: 0.8, geo: 2, c: 1 },
    { p: [-2.55, y, -0.52], s: [0.62, 0.55, 0.6], ry: 1.6, geo: 3, c: 0 },
    { p: [2.55, y, -0.52], s: [0.62, 0.55, 0.6], ry: 0.3, geo: 3, c: 2 },
    { p: [3.55, y, -0.58], s: [0.7, 0.6, 0.65], ry: 2.1, geo: 2, c: 1 },
    { p: [-7.05, y, -0.55], s: [0.65, 0.55, 0.6], ry: 1.1, geo: 3, c: 2 },
    { p: [7.05, y, -0.55], s: [0.65, 0.55, 0.6], ry: 2.4, geo: 3, c: 0 },
  ];
  const m = MUSEUM;
  const gaps = [
    { x0: -m.halfW + 0.2, x1: -m.sideX - m.sideHalf - 0.06 },
    { x0: -m.sideX + m.sideHalf + 0.06, x1: -m.centerHalf - 0.06 },
    { x0: m.centerHalf + 0.06, x1: m.sideX - m.sideHalf - 0.06 },
    { x0: m.sideX + m.sideHalf + 0.06, x1: m.halfW - 0.2 },
  ];
  return [...back, ...gaps.flatMap((g) => cliffSpots(g.x0, g.x1))];
}

function floorRocks(): Spot[] {
  return [
    // West wall, south of the west stairs — near the future fish pad
    { p: [-7.15, 0, 2.45], s: [0.95, 0.9, 0.95], ry: 0.5, geo: 0, c: 1 },
    { p: [-6.45, 0, 3.05], s: [0.8, 0.75, 0.8], ry: 1.8, geo: 1, c: 0 },
    { p: [-6.95, 0, 1.85], s: [0.7, 0.65, 0.7], ry: 2.4, geo: 2, c: 2 },
    { p: [-6.25, 0, 2.35], s: [0.55, 0.5, 0.55], ry: 0.9, geo: 3, c: 1 },
    // Base of the cliff between west and center stairs
    { p: [-3.15, 0, 0.48], s: [0.7, 0.6, 0.65], ry: 0.4, geo: 2, c: 0 },
    { p: [-2.55, 0, 0.42], s: [0.52, 0.45, 0.5], ry: 1.7, geo: 3, c: 1 },
    { p: [-6.55, 0, 0.62], s: [0.58, 0.5, 0.55], ry: 0.2, geo: 3, c: 2 },
    // East wall, south of the east stairs — near the future crystal pad
    { p: [7.15, 0, 2.45], s: [0.95, 0.9, 0.95], ry: 2.1, geo: 0, c: 0 },
    { p: [6.45, 0, 3.05], s: [0.8, 0.75, 0.8], ry: 0.4, geo: 1, c: 2 },
    { p: [6.95, 0, 1.85], s: [0.7, 0.65, 0.7], ry: 1.1, geo: 2, c: 1 },
    { p: [6.25, 0, 2.35], s: [0.55, 0.5, 0.55], ry: 2.8, geo: 3, c: 0 },
    // Base of the cliff between east and center stairs
    { p: [3.15, 0, 0.48], s: [0.7, 0.6, 0.65], ry: 2.5, geo: 2, c: 2 },
    { p: [2.55, 0, 0.42], s: [0.52, 0.45, 0.5], ry: 0.6, geo: 3, c: 0 },
    { p: [6.55, 0, 0.62], s: [0.58, 0.5, 0.55], ry: 1.9, geo: 3, c: 1 },
  ];
}

function DigSite({ geos }: { geos: THREE.BufferGeometry[] }) {
  const spots = useMemo(() => [...terraceRocks(), ...floorRocks()], []);
  return (
    <group>
      {spots.map((s, i) => (
        <mesh
          key={i}
          geometry={geos[s.geo]}
          position={s.p}
          scale={s.s}
          rotation={[0, s.ry, 0]}
          material={toon(ROCK[s.c]!, { flatShading: true, noOcclude: true })}
          castShadow
          receiveShadow
        />
      ))}
    </group>
  );
}

function CliffFill() {
  const m = MUSEUM;
  const gaps = [
    { x0: -m.halfW + 0.12, x1: -m.sideX - m.sideHalf },
    { x0: -m.sideX + m.sideHalf, x1: -m.centerHalf },
    { x0: m.centerHalf, x1: m.sideX - m.sideHalf },
    { x0: m.sideX + m.sideHalf, x1: m.halfW - 0.12 },
  ];
  return (
    <group>
      {gaps.map((g) => {
        const w = g.x1 - g.x0;
        if (w < 0.1) return null;
        const cx = (g.x0 + g.x1) / 2;
        return (
          <group key={`${g.x0}:${g.x1}`}>
            <Box p={[cx, m.deckH / 2, m.deckZ + 0.02]} s={[w, m.deckH, 0.22]} c={C.rockC} />
          </group>
        );
      })}
    </group>
  );
}

function Terrace() {
  const m = MUSEUM;
  const depth = m.deckZ - -m.halfD;
  const cz = (-m.halfD + m.deckZ) / 2;
  return (
    <group>
      <Box p={[0, m.deckH / 2, cz]} s={[m.halfW * 2 - 0.22, m.deckH, depth]} c={C.rockA} />
      <Box p={[0, m.deckH + 0.015, cz]} s={[m.halfW * 2 - 0.28, 0.03, depth - 0.08]} c={C.rockB} shadow={false} />
      <CliffFill />
    </group>
  );
}

function sandRing(radius: number, count: number, seed: number) {
  const rocks: { x: number; z: number; s: number; ry: number; c: number }[] = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + seed * 0.31 + 0.18;
    // Leave a gap on the south face so the plaque stays readable from the aisle.
    if (Math.cos(a) > 0.78) continue;
    const jig = 0.04 + ((i * 13 + seed * 7) % 5) * 0.012;
    rocks.push({
      x: Math.sin(a) * (radius + jig),
      z: Math.cos(a) * (radius + jig),
      s: 0.48 + ((i + seed) % 3) * 0.1,
      ry: a + i * 0.4,
      c: (i + seed) % 3,
    });
  }
  return rocks;
}

function Pedestal({ x, z, y, large, geo, slug }: { x: number; z: number; y: number; large: boolean; geo: THREE.BufferGeometry; slug: string }) {
  const padR = large ? 1.08 : 0.78;
  const ring = sandRing(padR * 0.92, large ? 9 : 7, Math.abs(Math.round(x * 10 + z * 3)));
  return (
    <group position={[x, y, z]}>
      <mesh rotation={[0, Math.PI / 8, 0]} position={[0, 0.03, 0]} material={toon(C.sand, { noOcclude: true })} receiveShadow>
        <cylinderGeometry args={[padR, padR, 0.06, 8]} />
      </mesh>
      {ring.map((r, i) => (
        <mesh
          key={i}
          geometry={geo}
          position={[r.x, 0.04, r.z]}
          scale={[r.s, r.s * 0.9, r.s]}
          rotation={[0, r.ry, 0]}
          material={toon(ROCK[r.c]!, { flatShading: true, noOcclude: true })}
          castShadow
          receiveShadow
        />
      ))}
      <Box p={[0, 0.22, 0]} s={[0.72, 0.44, 0.72]} c={C.navy} />
      <Box p={[0, 0.46, 0]} s={[0.8, 0.08, 0.8]} c={C.navy} />
      <Box p={[0, 0.505, 0]} s={[0.84, 0.022, 0.84]} c={C.gold} />
      <Box p={[0, 0.55, 0]} s={[0.66, 0.08, 0.66]} c={C.velvet} />
      <Box p={[0, 0.3, 0.38]} s={[0.22, 0.12, 0.04]} c={C.gold} />
      <Box p={[0, 0.3, 0.4]} s={[0.16, 0.06, 0.02]} c="#C48A55" shadow={false} />
      <group position={[0, 0.59, 0]} scale={1.28}>
        <ExhibitObject slug={slug} />
      </group>
      <pointLight color="#FFE6C8" intensity={0.42} distance={2.4} position={[0, 1.15, 0.15]} />
    </group>
  );
}

function Exhibits({ geo }: { geo: THREE.BufferGeometry }) {
  return (
    <group>
      {MUSEUM_PEDESTALS.map((p) => (
        <Pedestal key={p.id} x={p.x} z={p.z} y={p.tier === "top" ? MUSEUM.deckH : 0} large={p.tier === "low"} geo={geo} slug={p.slug} />
      ))}
    </group>
  );
}

function Carpet() {
  const z1 = museumStairSouth();
  const zDoor = 5.35;
  const z0 = z1 - 0.08;
  const len = zDoor - z0;
  const cz = (z0 + zDoor) / 2;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.028, cz]} material={toon(C.gold, { noOcclude: true })}>
        <planeGeometry args={[1.92, len + 0.06]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, cz]} material={toon(C.carpet, { noOcclude: true })}>
        <planeGeometry args={[1.68, len]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.045, 5.42]} material={toon(C.gold, { noOcclude: true })}>
        <planeGeometry args={[1.78, 0.78]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.055, 5.42]} material={toon(C.carpet, { noOcclude: true })}>
        <planeGeometry args={[1.55, 0.62]} />
      </mesh>
    </group>
  );
}

function MuseumLights() {
  return (
    <>
      <hemisphereLight args={["#FFF6E6", "#B87A4B", 0.72]} />
      <ambientLight intensity={0.44} />
      <directionalLight color="#FFE7A8" intensity={1.12} position={[6, 10, -8]} />
      <pointLight color="#FFD9CC" intensity={0.55} distance={16} position={[0, 3.1, 0]} />
      <pointLight color="#FFE6C8" intensity={0.28} distance={10} position={[0, 2.8, -3.2]} />
    </>
  );
}

export function MuseumWorld() {
  const { scene } = useThree();
  const geos = useBoulderGeos();
  useLayoutEffect(() => {
    const prev = scene.fog;
    scene.fog = null;
    return () => {
      scene.fog = prev;
    };
  }, [scene]);
  const m = MUSEUM;
  return (
    <group>
      <ClearColor color="#141022" />
      <MuseumLights />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} material={toon(C.floor, { noOcclude: true })} receiveShadow>
        <planeGeometry args={[m.halfW * 2, m.halfD * 2]} />
      </mesh>
      <Terrace />
      <DigSite geos={geos} />
      <StairFlight x={0} halfW={m.centerHalf} rails={false} />
      <StairFlight x={-m.sideX} halfW={m.sideHalf} rails />
      <StairFlight x={m.sideX} halfW={m.sideHalf} rails />
      <Carpet />
      <Exhibits geo={geos[3]!} />
      <Walls />
    </group>
  );
}
