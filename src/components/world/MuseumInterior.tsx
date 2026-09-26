"use client";

import { useLayoutEffect } from "react";
import { useThree } from "@react-three/fiber";
import { MUSEUM, MUSEUM_COLORS, museumStairSouth } from "@/game/interiors";
import { toon } from "@/game/materials";
import { ClearColor } from "./Interior";

type V3 = [number, number, number];
const C = MUSEUM_COLORS;

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

function StairFlight({ x, halfW, rails }: { x: number; halfW: number; rails: boolean }) {
  const m = MUSEUM;
  const z1 = museumStairSouth();
  const run = m.steps * m.stepD;
  const treads = Array.from({ length: m.steps }, (_, i) => {
    const h = m.deckH - i * m.stepH;
    const z = m.deckZ + (i + 0.5) * m.stepD;
    return { i, h, z };
  });
  const railX = [x - halfW - 0.07, x + halfW + 0.07];
  const pitch = Math.atan2(m.deckH, run);
  const railLen = Math.hypot(run, m.deckH) + 0.12;
  const railZ = (m.deckZ + z1) / 2;
  const railY = m.deckH / 2 + 0.42;
  return (
    <group>
      {treads.map((t) => (
        <Box key={t.i} p={[x, t.h / 2, t.z]} s={[halfW * 2, t.h, m.stepD + 0.02]} c={t.i % 2 ? C.stone : C.stoneDeep} />
      ))}
      {rails &&
        railX.map((rx) => (
          <group key={rx}>
            <Box p={[rx, railY, railZ]} s={[0.1, 0.1, railLen]} c={C.rail} r={[-pitch, 0, 0]} />
            <Box p={[rx, m.deckH / 2 + 0.12, m.deckZ + 0.04]} s={[0.12, m.deckH + 0.24, 0.12]} c={C.rail} />
            <Box p={[rx, 0.28, z1 - 0.06]} s={[0.12, 0.56, 0.12]} c={C.rail} />
          </group>
        ))}
    </group>
  );
}

function Terrace() {
  const m = MUSEUM;
  const depth = m.deckZ - -m.halfD;
  const cz = (-m.halfD + m.deckZ) / 2;
  const gaps = [
    { x0: -m.sideX - m.sideHalf, x1: -m.sideX + m.sideHalf },
    { x0: -m.centerHalf, x1: m.centerHalf },
    { x0: m.sideX - m.sideHalf, x1: m.sideX + m.sideHalf },
  ];
  const face = (x0: number, x1: number) => {
    const w = x1 - x0;
    if (w < 0.08) return null;
    return <Box key={`${x0}:${x1}`} p={[(x0 + x1) / 2, m.deckH / 2, m.deckZ]} s={[w, m.deckH, 0.16]} c={C.floorDeep} />;
  };
  const xs = [-m.halfW + 0.12, ...gaps.flatMap((g) => [g.x0, g.x1]), m.halfW - 0.12];
  const faces = [];
  for (let i = 0; i < xs.length; i += 2) faces.push(face(xs[i]!, xs[i + 1]!));
  return (
    <group>
      <Box p={[0, m.deckH / 2, cz]} s={[m.halfW * 2 - 0.22, m.deckH, depth]} c={C.floor} />
      <Box p={[0, m.deckH + 0.015, cz]} s={[m.halfW * 2 - 0.28, 0.03, depth - 0.08]} c={C.floorDeep} shadow={false} />
      {faces}
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
      <StairFlight x={0} halfW={m.centerHalf} rails={false} />
      <StairFlight x={-m.sideX} halfW={m.sideHalf} rails />
      <StairFlight x={m.sideX} halfW={m.sideHalf} rails />
      <Carpet />
      <Walls />
    </group>
  );
}
