"use client";

import { type ThreeEvent } from "@react-three/fiber";
import { beachCastles, beachUmbrella, LEVEL, tileCenter } from "@/game/island";
import { input } from "@/game/input";
import { palette, toon } from "@/game/materials";
import { isPaused, useGame } from "@/game/store";

type V3 = [number, number, number];

const SAND = "#E2C88A";
const SAND_WET = "#C9A86A";
const SAND_DEEP = "#B89258";
const BUCKET = "#3DB4E0";
const BUCKET_LIP = "#2A92BC";
const SHOVEL = "#E8C84A";
const BLADE = "#C9C4D8";
const TOWEL_A = "#F26B6B";
const TOWEL_B = "#FFF4DE";
const DUCK = "#FFD24A";
const DUCK_BEAK = "#FF9A3C";

function onTap(e: ThreeEvent<MouseEvent>) {
  if (isPaused(useGame.getState())) return;
  e.stopPropagation();
  input.tapTarget = { x: e.point.x, z: e.point.z };
}

function Box({ p, s, c, r, shadow = true }: { p: V3; s: V3; c: string; r?: V3; shadow?: boolean }) {
  return (
    <mesh position={p} rotation={r} material={toon(c)} castShadow={shadow} receiveShadow>
      <boxGeometry args={s} />
    </mesh>
  );
}

function Cyl({ p, r, h, c, rt, seg = 10, rot }: { p: V3; r: number; h: number; c: string; rt?: number; seg?: number; rot?: V3 }) {
  return (
    <mesh position={p} rotation={rot} material={toon(c)} castShadow receiveShadow>
      <cylinderGeometry args={[rt ?? r, r, h, seg]} />
    </mesh>
  );
}

function KeepCastle() {
  return (
    <group>
      <Cyl p={[0, 0.07, 0]} r={0.48} h={0.14} c={SAND} rt={0.44} seg={12} />
      <Box p={[0, 0.32, 0]} s={[0.58, 0.42, 0.58]} c={SAND} />
      <Box p={[0, 0.56, 0]} s={[0.64, 0.08, 0.64]} c={SAND_WET} />
      {(
        [
          [-0.26, -0.26],
          [0.26, -0.26],
          [-0.26, 0.26],
          [0.26, 0.26],
        ] as const
      ).map(([x, z]) => (
        <group key={`${x}${z}`} position={[x, 0, z]}>
          <Cyl p={[0, 0.38, 0]} r={0.12} h={0.52} c={SAND} rt={0.1} />
          <mesh position={[0, 0.72, 0]} material={toon(SAND_DEEP)} castShadow>
            <coneGeometry args={[0.16, 0.22, 8]} />
          </mesh>
        </group>
      ))}
      {[-0.22, 0, 0.22].map((x) => (
        <Box key={`n${x}`} p={[x, 0.64, -0.3]} s={[0.12, 0.12, 0.1]} c={SAND} />
      ))}
      {[-0.22, 0, 0.22].map((x) => (
        <Box key={`s${x}`} p={[x, 0.64, 0.3]} s={[0.12, 0.12, 0.1]} c={SAND} />
      ))}
      <Box p={[0, 0.22, 0.3]} s={[0.16, 0.22, 0.04]} c={SAND_DEEP} shadow={false} />
      <mesh position={[0.02, 0.86, 0.02]} material={toon(palette.woodDeep)} castShadow>
        <cylinderGeometry args={[0.018, 0.018, 0.34, 6]} />
      </mesh>
      <Box p={[0.1, 0.98, 0.02]} s={[0.16, 0.1, 0.02]} c={palette.coral} shadow={false} />
    </group>
  );
}

function TripleCastle() {
  return (
    <group>
      <Cyl p={[0, 0.06, 0]} r={0.5} h={0.12} c={SAND} rt={0.46} />
      {(
        [
          [-0.16, 0.22, 0.12],
          [0.18, 0.34, -0.08],
          [0.02, 0.16, 0.2],
        ] as const
      ).map(([x, h, z], k) => (
        <group key={k} position={[x, 0, z]}>
          <Cyl p={[0, h / 2 + 0.08, 0]} r={0.14 - k * 0.015} h={h} c={k === 1 ? SAND_WET : SAND} rt={0.11 - k * 0.01} />
          <mesh position={[0, h + 0.18, 0]} material={toon(SAND_DEEP)} castShadow>
            <coneGeometry args={[0.16 - k * 0.015, 0.2, 8]} />
          </mesh>
        </group>
      ))}
      <Box p={[0.02, 0.2, 0.04]} s={[0.38, 0.16, 0.12]} c={SAND} />
    </group>
  );
}

function TinyCastle() {
  return (
    <group>
      <Cyl p={[0, 0.05, 0]} r={0.28} h={0.1} c={SAND} rt={0.24} />
      <mesh position={[0, 0.22, 0]} material={toon(SAND)} castShadow>
        <coneGeometry args={[0.22, 0.28, 8]} />
      </mesh>
      <mesh position={[0, 0.4, 0]} material={toon(SAND_WET)} castShadow>
        <coneGeometry args={[0.14, 0.2, 8]} />
      </mesh>
      <mesh position={[0.01, 0.58, 0]} material={toon(palette.woodDeep)} castShadow>
        <cylinderGeometry args={[0.014, 0.014, 0.22, 6]} />
      </mesh>
      <Box p={[0.08, 0.66, 0]} s={[0.12, 0.08, 0.018]} c={palette.sun} shadow={false} />
    </group>
  );
}

function Sandcastle({ kind, rot }: { kind: (typeof beachCastles)[number]["kind"]; rot: number }) {
  return (
    <group rotation={[0, rot, 0]} onClick={onTap}>
      {kind === "keep" ? <KeepCastle /> : kind === "triple" ? <TripleCastle /> : <TinyCastle />}
    </group>
  );
}

function Scallop({ color, s = 1 }: { color: string; s?: number }) {
  return (
    <group scale={s} rotation={[-0.85, 0, 0.15]}>
      <mesh material={toon(color)} castShadow>
        <sphereGeometry args={[0.09, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
      </mesh>
      <mesh position={[0, 0.01, 0.01]} scale={[0.72, 0.35, 0.72]} material={toon(palette.cream)}>
        <sphereGeometry args={[0.07, 8, 6]} />
      </mesh>
    </group>
  );
}

function SpiralShell({ color, s = 1 }: { color: string; s?: number }) {
  return (
    <group scale={s} rotation={[-0.5, 0.4, 0.2]}>
      <mesh material={toon(color)} castShadow>
        <coneGeometry args={[0.08, 0.14, 8]} />
      </mesh>
      <mesh position={[0, -0.03, -0.03]} scale={[1, 0.55, 1]} material={toon(palette.cream)}>
        <sphereGeometry args={[0.045, 8, 6]} />
      </mesh>
    </group>
  );
}

function Clam({ color, s = 1 }: { color: string; s?: number }) {
  return (
    <group scale={s}>
      <mesh rotation={[-1.05, 0, 0]} material={toon(color)} castShadow>
        <sphereGeometry args={[0.08, 10, 8, 0, Math.PI * 2, 0, 1.2]} />
      </mesh>
      <mesh position={[0, 0.03, 0.02]} rotation={[-2.15, 0, 0]} material={toon(palette.peach)} castShadow>
        <sphereGeometry args={[0.07, 10, 8, 0, Math.PI * 2, 0, 1.1]} />
      </mesh>
    </group>
  );
}

function Starfish({ color, s = 1 }: { color: string; s?: number }) {
  return (
    <group scale={s} rotation={[-Math.PI / 2, 0, 0.3]}>
      <mesh material={toon(color)} castShadow>
        <cylinderGeometry args={[0.055, 0.055, 0.035, 8]} />
      </mesh>
      {[0, 1, 2, 3, 4].map((k) => (
        <mesh key={k} position={[Math.sin((k * Math.PI * 2) / 5) * 0.08, 0, Math.cos((k * Math.PI * 2) / 5) * 0.08]} rotation={[0, (k * Math.PI * 2) / 5, 0]} material={toon(color)} castShadow>
          <boxGeometry args={[0.045, 0.03, 0.1]} />
        </mesh>
      ))}
    </group>
  );
}

function BucketAndShovel() {
  return (
    <group onClick={onTap}>
      <Cyl p={[0, 0.16, 0]} r={0.16} h={0.28} c={BUCKET} rt={0.13} />
      <Cyl p={[0, 0.3, 0]} r={0.175} h={0.05} c={BUCKET_LIP} />
      <Cyl p={[0, 0.22, 0]} r={0.12} h={0.08} c={SAND} />
      <mesh position={[0, 0.38, 0]} rotation={[Math.PI / 2, 0, 0]} material={toon(BUCKET_LIP)} castShadow>
        <torusGeometry args={[0.15, 0.018, 6, 12, Math.PI]} />
      </mesh>
      <group position={[0.28, 0, 0.08]} rotation={[0, 0.4, 0.35]}>
        <Box p={[0, 0.22, 0]} s={[0.045, 0.36, 0.045]} c={palette.wood} />
        <Box p={[0, 0.42, 0]} s={[0.07, 0.05, 0.05]} c={SHOVEL} />
        <Box p={[0, 0.04, 0]} s={[0.14, 0.03, 0.16]} c={BLADE} />
      </group>
    </group>
  );
}

function BeachBall() {
  return (
    <group onClick={onTap}>
      <mesh position={[0, 0.18, 0]} material={toon(palette.cream)} castShadow>
        <sphereGeometry args={[0.18, 14, 12]} />
      </mesh>
      <mesh position={[0, 0.18, 0]} rotation={[0.4, 0.2, 0]} material={toon(palette.coral)} castShadow>
        <torusGeometry args={[0.155, 0.035, 8, 16]} />
      </mesh>
      <mesh position={[0, 0.18, 0]} rotation={[1.2, 0.8, 0.3]} material={toon(palette.sun)} castShadow>
        <torusGeometry args={[0.155, 0.03, 8, 16]} />
      </mesh>
    </group>
  );
}

function UmbrellaAndTowel({ facing }: { facing: number }) {
  return (
    <group rotation={[0, facing, 0]} onClick={onTap}>
      <Box p={[0.42, 0.025, 0.55]} s={[0.72, 0.03, 1.05]} c={TOWEL_A} />
      {[-0.28, 0, 0.28].map((z) => (
        <Box key={z} p={[0.42, 0.032, 0.55 + z]} s={[0.72, 0.012, 0.12]} c={TOWEL_B} shadow={false} />
      ))}
      <Cyl p={[0, 0.62, 0]} r={0.03} h={1.24} c={palette.woodDeep} rt={0.025} />
      <mesh position={[0, 1.18, 0]} material={toon(palette.coral)} castShadow>
        <coneGeometry args={[0.72, 0.28, 8]} />
      </mesh>
      <mesh position={[0, 1.12, 0]} material={toon(palette.cream)} castShadow={false}>
        <coneGeometry args={[0.58, 0.08, 8]} />
      </mesh>
      <mesh position={[0, 1.34, 0]} material={toon(palette.sun)} castShadow>
        <sphereGeometry args={[0.06, 8, 8]} />
      </mesh>
      <group position={[0.58, 0.02, 0.18]} rotation={[0, 0.3, 0]}>
        <Box p={[0, 0.02, 0]} s={[0.16, 0.04, 0.28]} c={palette.indigo} />
        <Box p={[0.2, 0.02, 0]} s={[0.16, 0.04, 0.28]} c={palette.cream} />
      </group>
    </group>
  );
}

function Driftwood() {
  return (
    <group onClick={onTap}>
      <mesh position={[0, 0.07, 0]} rotation={[0.15, 0.4, 0.35]} material={toon(palette.woodDeep)} castShadow>
        <cylinderGeometry args={[0.05, 0.07, 0.85, 7]} />
      </mesh>
      <mesh position={[0.18, 0.1, 0.12]} rotation={[-0.4, 0.2, 1.1]} material={toon(palette.wood)} castShadow>
        <cylinderGeometry args={[0.03, 0.045, 0.38, 6]} />
      </mesh>
    </group>
  );
}

function RubberDuck() {
  return (
    <group onClick={onTap}>
      <mesh position={[0, 0.1, 0]} material={toon(DUCK)} castShadow>
        <sphereGeometry args={[0.1, 10, 8]} />
      </mesh>
      <mesh position={[0.02, 0.2, 0.04]} material={toon(DUCK)} castShadow>
        <sphereGeometry args={[0.065, 8, 8]} />
      </mesh>
      <mesh position={[0.08, 0.19, 0.05]} rotation={[0, 0.3, 0.2]} material={toon(DUCK_BEAK)} castShadow>
        <boxGeometry args={[0.07, 0.03, 0.05]} />
      </mesh>
      <mesh position={[0.04, 0.23, 0.08]} material={toon(palette.ink)}>
        <sphereGeometry args={[0.012, 6, 6]} />
      </mesh>
    </group>
  );
}

const SHELLS: { i: number; j: number; dx: number; dz: number; rot: number; kind: "scallop" | "spiral" | "clam"; color: string; s: number }[] = [
  { i: 25, j: 42, dx: 0.12, dz: -0.08, rot: 0.4, kind: "scallop", color: palette.peach, s: 1 },
  { i: 29, j: 43, dx: -0.18, dz: 0.1, rot: 1.2, kind: "spiral", color: palette.lavender, s: 0.95 },
  { i: 34, j: 42, dx: 0.2, dz: 0.14, rot: -0.5, kind: "clam", color: palette.cream, s: 1.05 },
  { i: 37, j: 42, dx: -0.1, dz: -0.16, rot: 0.8, kind: "scallop", color: palette.coral, s: 0.9 },
  { i: 23, j: 43, dx: 0.16, dz: 0.2, rot: 2.1, kind: "spiral", color: palette.peach, s: 1.1 },
  { i: 36, j: 44, dx: 0.08, dz: -0.12, rot: -1.1, kind: "scallop", color: palette.sun, s: 0.85 },
  { i: 31, j: 44, dx: -0.22, dz: 0.18, rot: 0.3, kind: "clam", color: "#F7C6A8", s: 1 },
  { i: 40, j: 42, dx: 0.05, dz: 0.08, rot: 1.6, kind: "spiral", color: palette.cream, s: 0.88 },
  { i: 24, j: 41, dx: -0.14, dz: 0.22, rot: -0.7, kind: "scallop", color: palette.lavender, s: 0.8 },
  { i: 35, j: 41, dx: 0.24, dz: -0.2, rot: 0.15, kind: "clam", color: palette.peach, s: 0.92 },
  { i: 27, j: 45, dx: -0.12, dz: 0.06, rot: 1.05, kind: "scallop", color: palette.cream, s: 0.95 },
  { i: 30, j: 45, dx: 0.18, dz: -0.14, rot: -0.4, kind: "spiral", color: palette.coral, s: 0.82 },
];

const STARS: { i: number; j: number; dx: number; dz: number; color: string; s: number }[] = [
  { i: 29, j: 45, dx: 0.1, dz: -0.08, color: palette.orange, s: 1.15 },
  { i: 34, j: 45, dx: -0.16, dz: 0.12, color: palette.coral, s: 1 },
  { i: 37, j: 44, dx: 0.2, dz: 0.05, color: "#FF9A62", s: 0.9 },
  { i: 25, j: 45, dx: 0.05, dz: 0.1, color: palette.sun, s: 0.85 },
];

export function Beach() {
  const bucket = tileCenter(28, 44);
  const ball = tileCenter(35, 44);
  const wood = tileCenter(24, 44);
  const duck = tileCenter(29, 41);
  return (
    <group>
      {beachCastles.map((c) => {
        const p = tileCenter(c.i, c.j);
        return (
          <group key={`${c.i},${c.j}`} position={[p.x, LEVEL, p.z]}>
            <Sandcastle kind={c.kind} rot={c.rot} />
          </group>
        );
      })}
      <group position={[bucket.x + 0.08, LEVEL, bucket.z - 0.1]}>
        <BucketAndShovel />
      </group>
      <group position={[ball.x - 0.12, LEVEL, ball.z + 0.16]} rotation={[0, 0.5, 0]}>
        <BeachBall />
      </group>
      <group position={[beachUmbrella.x, LEVEL, beachUmbrella.z]}>
        <UmbrellaAndTowel facing={beachUmbrella.facing} />
      </group>
      <group position={[wood.x, LEVEL, wood.z]} rotation={[0, -0.45, 0]}>
        <Driftwood />
      </group>
      <group position={[duck.x + 0.18, LEVEL, duck.z + 0.12]} rotation={[0, -0.7, 0]}>
        <RubberDuck />
      </group>
      {SHELLS.map((s, k) => {
        const p = tileCenter(s.i, s.j);
        return (
          <group key={`sh${k}`} position={[p.x + s.dx, LEVEL + 0.02, p.z + s.dz]} rotation={[0, s.rot, 0]} onClick={onTap}>
            {s.kind === "scallop" ? <Scallop color={s.color} s={s.s} /> : s.kind === "spiral" ? <SpiralShell color={s.color} s={s.s} /> : <Clam color={s.color} s={s.s} />}
          </group>
        );
      })}
      {STARS.map((s, k) => {
        const p = tileCenter(s.i, s.j);
        return (
          <group key={`st${k}`} position={[p.x + s.dx, LEVEL + 0.02, p.z + s.dz]} onClick={onTap}>
            <Starfish color={s.color} s={s.s} />
          </group>
        );
      })}
    </group>
  );
}
