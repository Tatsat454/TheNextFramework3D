"use client";

import type { ThreeEvent } from "@react-three/fiber";
import { input } from "@/game/input";
import { boardTile, LEVEL, plazaBenches, plazaLanterns, plazaSign } from "@/game/island";
import { palette, toon } from "@/game/materials";
import { isPaused, useGame } from "@/game/store";

const POST = "#F0E6D0";
const GLOW = "#FFE3A3";
const CAP = "#5A3A2E";
const BENCH = "#A8703F";
const BENCH_DEEP = "#8C5A32";

function onTap(e: ThreeEvent<MouseEvent>) {
  if (isPaused(useGame.getState())) return;
  e.stopPropagation();
  input.tapTarget = { x: e.point.x, z: e.point.z };
}

function Lantern({ x, z, night }: { x: number; z: number; night: boolean }) {
  return (
    <group position={[x, LEVEL, z]} onClick={onTap}>
      <mesh position={[0, 0.06, 0]} material={toon(POST)} castShadow receiveShadow>
        <boxGeometry args={[0.38, 0.12, 0.38]} />
      </mesh>
      <mesh position={[0, 0.42, 0]} material={toon(POST)} castShadow receiveShadow>
        <boxGeometry args={[0.24, 0.6, 0.24]} />
      </mesh>
      <mesh
        position={[0, 0.88, 0]}
        material={toon(GLOW, { emissive: GLOW, emissiveIntensity: night ? 1.15 : 0.42, noOcclude: true })}
        castShadow={false}
      >
        <boxGeometry args={[0.32, 0.32, 0.32]} />
      </mesh>
      <mesh position={[0, 1.06, 0]} material={toon(CAP)} castShadow>
        <boxGeometry args={[0.4, 0.05, 0.4]} />
      </mesh>
      <mesh position={[0, 1.16, 0]} rotation={[0, Math.PI / 4, 0]} material={toon(CAP)} castShadow>
        <coneGeometry args={[0.26, 0.16, 4]} />
      </mesh>
      <pointLight position={[0, 0.88, 0]} color={GLOW} intensity={night ? 0.5 : 0} distance={3.5} decay={2} />
    </group>
  );
}

function Bench({ x, z, facing }: { x: number; z: number; facing: number }) {
  return (
    <group position={[x, LEVEL, z]} rotation={[0, facing, 0]} onClick={onTap}>
      {[
        [-0.38, -0.14],
        [0.38, -0.14],
        [-0.38, 0.16],
        [0.38, 0.16],
      ].map(([lx, lz]) => (
        <mesh key={`${lx}${lz}`} position={[lx, 0.16, lz]} material={toon(BENCH_DEEP)} castShadow>
          <boxGeometry args={[0.08, 0.32, 0.08]} />
        </mesh>
      ))}
      <mesh position={[0, 0.34, 0.02]} material={toon(BENCH)} castShadow receiveShadow>
        <boxGeometry args={[0.96, 0.08, 0.42]} />
      </mesh>
      <mesh position={[0, 0.54, -0.16]} material={toon(BENCH)} castShadow>
        <boxGeometry args={[0.96, 0.36, 0.08]} />
      </mesh>
      <mesh position={[-0.44, 0.44, 0.02]} material={toon(BENCH_DEEP)} castShadow>
        <boxGeometry args={[0.08, 0.22, 0.42]} />
      </mesh>
      <mesh position={[0.44, 0.44, 0.02]} material={toon(BENCH_DEEP)} castShadow>
        <boxGeometry args={[0.08, 0.22, 0.42]} />
      </mesh>
    </group>
  );
}

function Signpost() {
  return (
    <group position={[plazaSign.x, LEVEL, plazaSign.z]} rotation={[0, plazaSign.facing, 0]} onClick={onTap}>
      <mesh position={[0, 0.55, 0]} material={toon(palette.woodDeep)} castShadow>
        <cylinderGeometry args={[0.055, 0.07, 1.1, 8]} />
      </mesh>
      <mesh position={[0, 1.02, 0.05]} material={toon(palette.wood)} castShadow>
        <boxGeometry args={[0.62, 0.4, 0.08]} />
      </mesh>
      <mesh position={[0, 1.03, 0.1]} material={toon(palette.cream)} castShadow={false}>
        <boxGeometry args={[0.5, 0.26, 0.02]} />
      </mesh>
      <mesh position={[0, 1.03, 0]} material={toon(palette.cream)} castShadow={false}>
        <boxGeometry args={[0.5, 0.26, 0.02]} />
      </mesh>
      <mesh position={[-0.1, 1.06, 0.12]} material={toon(palette.woodDeep)} castShadow={false}>
        <boxGeometry args={[0.22, 0.04, 0.01]} />
      </mesh>
      <mesh position={[0.12, 0.96, 0.12]} material={toon(palette.blossom)} castShadow={false}>
        <boxGeometry args={[0.14, 0.1, 0.01]} />
      </mesh>
      <mesh position={[0, 1.26, 0.05]} material={toon(CAP)} castShadow>
        <boxGeometry args={[0.7, 0.05, 0.16]} />
      </mesh>
    </group>
  );
}

function Bulletin() {
  return (
    <group position={[boardTile.x, LEVEL, boardTile.z]} rotation={[0, boardTile.facing, 0]} onClick={onTap}>
      <mesh position={[-0.38, 0.5, 0]} material={toon(palette.woodDeep)} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 1.0, 8]} />
      </mesh>
      <mesh position={[0.38, 0.5, 0]} material={toon(palette.woodDeep)} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 1.0, 8]} />
      </mesh>
      <mesh position={[0, 0.85, 0.02]} material={toon(palette.wood)} castShadow>
        <boxGeometry args={[0.95, 0.62, 0.08]} />
      </mesh>
      <mesh position={[-0.2, 0.9, 0.07]} material={toon(palette.cream)} castShadow={false}>
        <boxGeometry args={[0.26, 0.3, 0.01]} />
      </mesh>
      <mesh position={[0.16, 0.95, 0.07]} material={toon(palette.sun)} castShadow={false}>
        <boxGeometry args={[0.22, 0.2, 0.01]} />
      </mesh>
      <mesh position={[0.2, 0.7, 0.07]} material={toon(palette.blossom)} castShadow={false}>
        <boxGeometry args={[0.26, 0.16, 0.01]} />
      </mesh>
    </group>
  );
}

export function PlazaFurniture({ night }: { night: boolean }) {
  return (
    <group>
      {plazaLanterns.map((p) => (
        <Lantern key={p.a} x={p.x} z={p.z} night={night} />
      ))}
      {plazaBenches.map((b) => (
        <Bench key={b.a} x={b.x} z={b.z} facing={b.facing} />
      ))}
      <Signpost />
      <Bulletin />
    </group>
  );
}
