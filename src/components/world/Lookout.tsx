"use client";

import { useMemo } from "react";
import * as THREE from "three";
import type { ThreeEvent } from "@react-three/fiber";
import { input } from "@/game/input";
import { LEVEL, lookout } from "@/game/island";
import { palette, toon } from "@/game/materials";
import { isPaused, useGame } from "@/game/store";

const POST = "#C4A06A";
const ROPE = "#8C5A32";
const BRASS = "#D4A017";
const BODY = "#5A3A2E";
const STONE = "#C8B79A";
const GLOW = "#FFE3A3";
const CAP = "#5A3A2E";

function onTap(e: ThreeEvent<MouseEvent>) {
  if (isPaused(useGame.getState())) return;
  e.stopPropagation();
  input.tapTarget = { x: e.point.x, z: e.point.z };
}

function signTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 96;
  const g = c.getContext("2d")!;
  g.fillStyle = "#E8D5A8";
  g.fillRect(0, 0, 256, 96);
  g.fillStyle = "#5A3A2E";
  g.font = "bold 42px ui-rounded, 'Trebuchet MS', sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("Lookout", 128, 50);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function RopeFence() {
  const posts = lookout.posts;
  return (
    <group>
      {posts.map((p, k) => (
        <mesh key={k} position={[p.x, LEVEL + 0.42, p.z]} material={toon(POST)} castShadow>
          <cylinderGeometry args={[0.06, 0.07, 0.84, 8]} />
        </mesh>
      ))}
      {posts.slice(0, -1).map((p, k) => {
        const n = posts[k + 1]!;
        const dx = n.x - p.x;
        const dz = n.z - p.z;
        const len = Math.hypot(dx, dz);
        const a = Math.atan2(dx, dz);
        return (
          <group key={`r${k}`} position={[(p.x + n.x) / 2, LEVEL, (p.z + n.z) / 2]} rotation={[0, a, 0]}>
            {[0.52, 0.28].map((y) => (
              <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} material={toon(ROPE)}>
                <cylinderGeometry args={[0.028, 0.028, len, 6]} />
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
}

function Lamp() {
  const { x, z } = lookout.lamp;
  return (
    <group position={[x, LEVEL, z]} onClick={onTap}>
      <mesh position={[0, 0.06, 0]} material={toon(palette.cream)} castShadow>
        <boxGeometry args={[0.34, 0.12, 0.34]} />
      </mesh>
      <mesh position={[0, 0.7, 0]} material={toon(palette.cream)} castShadow>
        <boxGeometry args={[0.16, 1.16, 0.16]} />
      </mesh>
      <mesh position={[0, 1.38, 0]} material={toon(GLOW, { emissive: GLOW, emissiveIntensity: 0.5, noOcclude: true })}>
        <boxGeometry args={[0.28, 0.28, 0.28]} />
      </mesh>
      <mesh position={[0, 1.56, 0]} material={toon(CAP)} castShadow>
        <boxGeometry args={[0.36, 0.06, 0.36]} />
      </mesh>
      <mesh position={[0, 1.66, 0]} rotation={[0, Math.PI / 4, 0]} material={toon(CAP)} castShadow>
        <coneGeometry args={[0.22, 0.14, 4]} />
      </mesh>
    </group>
  );
}

function Telescope() {
  return (
    <group position={[lookout.x, LEVEL, lookout.z]} rotation={[0, lookout.facing, 0]} onClick={onTap}>
      <mesh position={[0, 0.1, 0]} material={toon(STONE)} castShadow receiveShadow>
        <cylinderGeometry args={[0.32, 0.36, 0.2, 10]} />
      </mesh>
      <mesh position={[0, 0.28, 0]} material={toon("#B8B8C0")} castShadow>
        <cylinderGeometry args={[0.22, 0.26, 0.16, 10]} />
      </mesh>
      <mesh position={[0, 0.58, 0]} material={toon(BODY)} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 0.48, 8]} />
      </mesh>
      <mesh position={[0, 0.86, 0.18]} rotation={[0.42, 0, 0]} material={toon(BRASS)} castShadow>
        <cylinderGeometry args={[0.08, 0.11, 0.72, 10]} />
      </mesh>
      <mesh position={[0, 0.72, -0.14]} rotation={[0.42, 0, 0]} material={toon(BODY)} castShadow>
        <cylinderGeometry args={[0.06, 0.07, 0.22, 8]} />
      </mesh>
      <mesh position={[0.12, 0.42, 0.08]} material={toon(BRASS)} castShadow>
        <boxGeometry args={[0.08, 0.06, 0.04]} />
      </mesh>
    </group>
  );
}

function LookoutSign() {
  const tex = useMemo(signTexture, []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }), [tex]);
  const { x, z, facing } = lookout.sign;
  return (
    <group position={[x, LEVEL, z]} rotation={[0, facing, 0]} onClick={onTap}>
      <mesh position={[0, 0.42, 0]} material={toon(palette.woodDeep)} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 0.84, 8]} />
      </mesh>
      <mesh position={[0, 0.92, 0.04]} material={toon(palette.wood)} castShadow>
        <boxGeometry args={[0.72, 0.32, 0.06]} />
      </mesh>
      <mesh position={[0, 0.92, 0.08]} material={mat}>
        <planeGeometry args={[0.64, 0.24]} />
      </mesh>
    </group>
  );
}

export function Lookout() {
  return (
    <group>
      <RopeFence />
      <Lamp />
      <Telescope />
      <LookoutSign />
    </group>
  );
}
