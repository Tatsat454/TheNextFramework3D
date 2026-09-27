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
    <group scale={1.72}>
      <Cyl p={[0, 0.08, 0]} r={0.56} h={0.16} c={SAND} rt={0.5} seg={12} />
      <Box p={[0, 0.38, 0]} s={[0.7, 0.52, 0.7]} c={SAND} />
      <Box p={[0, 0.68, 0]} s={[0.78, 0.1, 0.78]} c={SAND_WET} />
      {(
        [
          [-0.3, -0.3],
          [0.3, -0.3],
          [-0.3, 0.3],
          [0.3, 0.3],
        ] as const
      ).map(([x, z]) => (
        <group key={`${x}${z}`} position={[x, 0, z]}>
          <Cyl p={[0, 0.46, 0]} r={0.15} h={0.64} c={SAND} rt={0.12} />
          <mesh position={[0, 0.88, 0]} material={toon(SAND_DEEP)} castShadow>
            <coneGeometry args={[0.2, 0.28, 8]} />
          </mesh>
        </group>
      ))}
      {[-0.26, 0, 0.26].map((x) => (
        <Box key={`n${x}`} p={[x, 0.78, -0.36]} s={[0.14, 0.16, 0.12]} c={SAND} />
      ))}
      {[-0.26, 0, 0.26].map((x) => (
        <Box key={`s${x}`} p={[x, 0.78, 0.36]} s={[0.14, 0.16, 0.12]} c={SAND} />
      ))}
      <Box p={[0, 0.26, 0.36]} s={[0.2, 0.28, 0.05]} c={SAND_DEEP} shadow={false} />
      <mesh position={[0.02, 1.08, 0.02]} material={toon(palette.woodDeep)} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.4, 6]} />
      </mesh>
      <Box p={[0.12, 1.24, 0.02]} s={[0.2, 0.12, 0.025]} c={palette.coral} shadow={false} />
    </group>
  );
}

function TripleCastle() {
  return (
    <group scale={1.58}>
      <Cyl p={[0, 0.08, 0]} r={0.62} h={0.16} c={SAND} rt={0.56} />
      {(
        [
          [-0.2, 0.42, 0.14],
          [0.22, 0.62, -0.1],
          [0.02, 0.3, 0.24],
        ] as const
      ).map(([x, h, z], k) => (
        <group key={k} position={[x, 0, z]}>
          <Cyl p={[0, h / 2 + 0.1, 0]} r={0.18 - k * 0.018} h={h} c={k === 1 ? SAND_WET : SAND} rt={0.14 - k * 0.012} />
          <mesh position={[0, h + 0.26, 0]} material={toon(SAND_DEEP)} castShadow>
            <coneGeometry args={[0.22 - k * 0.018, 0.28, 8]} />
          </mesh>
        </group>
      ))}
      <Box p={[0.02, 0.26, 0.04]} s={[0.5, 0.22, 0.16]} c={SAND} />
    </group>
  );
}

function TinyCastle() {
  return (
    <group scale={1.48}>
      <Cyl p={[0, 0.07, 0]} r={0.36} h={0.14} c={SAND} rt={0.3} />
      <mesh position={[0, 0.3, 0]} material={toon(SAND)} castShadow>
        <coneGeometry args={[0.3, 0.4, 8]} />
      </mesh>
      <mesh position={[0, 0.56, 0]} material={toon(SAND_WET)} castShadow>
        <coneGeometry args={[0.2, 0.28, 8]} />
      </mesh>
      <mesh position={[0.01, 0.8, 0]} material={toon(palette.woodDeep)} castShadow>
        <cylinderGeometry args={[0.018, 0.018, 0.28, 6]} />
      </mesh>
      <Box p={[0.1, 0.9, 0]} s={[0.16, 0.1, 0.022]} c={palette.sun} shadow={false} />
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
    <group scale={s * 1.85} rotation={[-0.85, 0, 0.15]}>
      <mesh material={toon(color)} castShadow>
        <sphereGeometry args={[0.11, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
      </mesh>
      <mesh position={[0, 0.01, 0.01]} scale={[0.72, 0.35, 0.72]} material={toon(palette.cream)}>
        <sphereGeometry args={[0.08, 8, 6]} />
      </mesh>
    </group>
  );
}

function SpiralShell({ color, s = 1 }: { color: string; s?: number }) {
  return (
    <group scale={s * 1.85} rotation={[-0.5, 0.4, 0.2]}>
      <mesh material={toon(color)} castShadow>
        <coneGeometry args={[0.1, 0.18, 8]} />
      </mesh>
      <mesh position={[0, -0.04, -0.04]} scale={[1, 0.55, 1]} material={toon(palette.cream)}>
        <sphereGeometry args={[0.055, 8, 6]} />
      </mesh>
    </group>
  );
}

function Clam({ color, s = 1 }: { color: string; s?: number }) {
  return (
    <group scale={s * 1.85}>
      <mesh rotation={[-1.05, 0, 0]} material={toon(color)} castShadow>
        <sphereGeometry args={[0.1, 10, 8, 0, Math.PI * 2, 0, 1.2]} />
      </mesh>
      <mesh position={[0, 0.04, 0.03]} rotation={[-2.15, 0, 0]} material={toon(palette.peach)} castShadow>
        <sphereGeometry args={[0.085, 10, 8, 0, Math.PI * 2, 0, 1.1]} />
      </mesh>
    </group>
  );
}

function Starfish({ color, s = 1 }: { color: string; s?: number }) {
  return (
    <group scale={s * 1.9} rotation={[-Math.PI / 2, 0, 0.3]}>
      <mesh material={toon(color)} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.045, 8]} />
      </mesh>
      {[0, 1, 2, 3, 4].map((k) => (
        <mesh key={k} position={[Math.sin((k * Math.PI * 2) / 5) * 0.1, 0, Math.cos((k * Math.PI * 2) / 5) * 0.1]} rotation={[0, (k * Math.PI * 2) / 5, 0]} material={toon(color)} castShadow>
          <boxGeometry args={[0.055, 0.038, 0.14]} />
        </mesh>
      ))}
    </group>
  );
}

function BucketAndShovel() {
  return (
    <group scale={1.35} onClick={onTap}>
      <Cyl p={[0, 0.18, 0]} r={0.2} h={0.34} c={BUCKET} rt={0.16} />
      <Cyl p={[0, 0.36, 0]} r={0.22} h={0.06} c={BUCKET_LIP} />
      <Cyl p={[0, 0.26, 0]} r={0.14} h={0.1} c={SAND} />
      <mesh position={[0, 0.46, 0]} rotation={[Math.PI / 2, 0, 0]} material={toon(BUCKET_LIP)} castShadow>
        <torusGeometry args={[0.18, 0.022, 6, 12, Math.PI]} />
      </mesh>
      <group position={[0.34, 0, 0.1]} rotation={[0, 0.4, 0.35]}>
        <Box p={[0, 0.26, 0]} s={[0.055, 0.44, 0.055]} c={palette.wood} />
        <Box p={[0, 0.5, 0]} s={[0.08, 0.06, 0.06]} c={SHOVEL} />
        <Box p={[0, 0.05, 0]} s={[0.18, 0.04, 0.2]} c={BLADE} />
      </group>
    </group>
  );
}

function BeachBall() {
  return (
    <group scale={1.25} onClick={onTap}>
      <mesh position={[0, 0.2, 0]} material={toon(palette.cream)} castShadow>
        <sphereGeometry args={[0.2, 14, 12]} />
      </mesh>
      <mesh position={[0, 0.2, 0]} rotation={[0.4, 0.2, 0]} material={toon(palette.coral)} castShadow>
        <torusGeometry args={[0.175, 0.04, 8, 16]} />
      </mesh>
      <mesh position={[0, 0.2, 0]} rotation={[1.2, 0.8, 0.3]} material={toon(palette.sun)} castShadow>
        <torusGeometry args={[0.175, 0.035, 8, 16]} />
      </mesh>
    </group>
  );
}

function UmbrellaAndTowel({ facing }: { facing: number }) {
  return (
    <group rotation={[0, facing, 0]} onClick={onTap}>
      <Box p={[0.55, 0.03, 0.7]} s={[0.95, 0.04, 1.35]} c={TOWEL_A} />
      {[-0.38, 0, 0.38].map((z) => (
        <Box key={z} p={[0.55, 0.04, 0.7 + z]} s={[0.95, 0.016, 0.16]} c={TOWEL_B} shadow={false} />
      ))}
      <Cyl p={[0, 0.78, 0]} r={0.038} h={1.56} c={palette.woodDeep} rt={0.03} />
      <mesh position={[0, 1.48, 0]} material={toon(palette.coral)} castShadow>
        <coneGeometry args={[0.95, 0.52, 8]} />
      </mesh>
      <mesh position={[0, 1.38, 0]} material={toon(palette.cream)} castShadow={false}>
        <coneGeometry args={[0.72, 0.14, 8]} />
      </mesh>
      <mesh position={[0, 1.78, 0]} material={toon(palette.sun)} castShadow>
        <sphereGeometry args={[0.08, 8, 8]} />
      </mesh>
      <group position={[0.78, 0.03, 0.22]} rotation={[0, 0.3, 0]}>
        <Box p={[0, 0.025, 0]} s={[0.2, 0.05, 0.36]} c={palette.indigo} />
        <Box p={[0.24, 0.025, 0]} s={[0.2, 0.05, 0.36]} c={palette.cream} />
      </group>
    </group>
  );
}

function Driftwood() {
  return (
    <group scale={1.35} onClick={onTap}>
      <mesh position={[0, 0.08, 0]} rotation={[0.15, 0.4, 0.35]} material={toon(palette.woodDeep)} castShadow>
        <cylinderGeometry args={[0.06, 0.085, 1.05, 7]} />
      </mesh>
      <mesh position={[0.22, 0.12, 0.14]} rotation={[-0.4, 0.2, 1.1]} material={toon(palette.wood)} castShadow>
        <cylinderGeometry args={[0.035, 0.055, 0.48, 6]} />
      </mesh>
    </group>
  );
}

function RubberDuck() {
  return (
    <group scale={1.55} onClick={onTap}>
      <mesh position={[0, 0.12, 0]} material={toon(DUCK)} castShadow>
        <sphereGeometry args={[0.12, 10, 8]} />
      </mesh>
      <mesh position={[0.03, 0.24, 0.05]} material={toon(DUCK)} castShadow>
        <sphereGeometry args={[0.08, 8, 8]} />
      </mesh>
      <mesh position={[0.1, 0.23, 0.06]} rotation={[0, 0.3, 0.2]} material={toon(DUCK_BEAK)} castShadow>
        <boxGeometry args={[0.085, 0.036, 0.06]} />
      </mesh>
      <mesh position={[0.05, 0.28, 0.1]} material={toon(palette.ink)}>
        <sphereGeometry args={[0.014, 6, 6]} />
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
