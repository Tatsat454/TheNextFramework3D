"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { mulberry32 } from "@/game/rng";
import type { TimePreset } from "@/game/time-of-day";

function makeSkyTexture(top: string, mid: string, horizon: string) {
  const c = document.createElement("canvas");
  c.width = 8;
  c.height = 512;
  const g = c.getContext("2d")!;
  const grd = g.createLinearGradient(0, 0, 0, 512);
  grd.addColorStop(0, top);
  grd.addColorStop(0.38, mid);
  grd.addColorStop(0.62, horizon);
  grd.addColorStop(1, horizon);
  g.fillStyle = grd;
  g.fillRect(0, 0, 8, 512);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function SkyDome({ preset }: { preset: TimePreset }) {
  const tex = useMemo(
    () => makeSkyTexture(preset.sky[0], preset.sky[1], preset.sky[2]),
    [preset.sky],
  );
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: tex,
        side: THREE.BackSide,
        fog: false,
        depthWrite: false,
        toneMapped: false,
      }),
    [tex],
  );
  return (
    <mesh material={mat} renderOrder={-20} frustumCulled={false}>
      <sphereGeometry args={[90, 40, 24]} />
    </mesh>
  );
}

function SunGlow({ preset }: { preset: TimePreset }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const m = ref.current;
    if (!m) return;
    m.position.set(preset.sunDir[0] * 3.2, preset.sunDir[1] * 1.7, preset.sunDir[2] * 3.2);
    m.lookAt(0, 8, 0);
  });
  return (
    <mesh ref={ref} renderOrder={-18} frustumCulled={false}>
      <circleGeometry args={[7.2, 28]} />
      <meshBasicMaterial color={preset.sun} transparent opacity={0.9} depthWrite={false} fog={false} toneMapped={false} />
    </mesh>
  );
}

function SkyClouds() {
  const group = useRef<THREE.Group>(null);
  const clouds = useMemo(() => {
    const r = mulberry32(42);
    return Array.from({ length: 10 }, (_, i) => {
      const band = i < 6;
      return {
        x: (r() - 0.5) * (band ? 64 : 80),
        y: band ? 13 + r() * 7 : 18 + r() * 12,
        z: band ? -4 - r() * 18 : -20 - r() * 30,
        s: (band ? 2.6 : 2.0) + r() * 2.4,
        speed: 0.08 + r() * 0.12,
        puffs: Array.from({ length: 4 }, () => ({
          ox: (r() - 0.5) * 3.4,
          oy: (r() - 0.5) * 0.6,
          oz: (r() - 0.5) * 1.6,
          rs: 0.85 + r() * 0.9,
        })),
      };
    });
  }, []);
  useFrame((_, rawDt) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(rawDt, 1 / 20);
    g.children.forEach((child, k) => {
      const c = clouds[k];
      child.position.x += c.speed * dt;
      if (child.position.x > 48) child.position.x = -48;
    });
  });
  const puffMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#FFFFFF",
        fog: false,
        depthWrite: false,
        transparent: true,
        opacity: 0.92,
        toneMapped: false,
      }),
    [],
  );
  const shadeMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#D4E6F4",
        fog: false,
        depthWrite: false,
        transparent: true,
        opacity: 0.88,
        toneMapped: false,
      }),
    [],
  );
  const puffGeo = useMemo(() => new THREE.SphereGeometry(1, 10, 8), []);
  return (
    <group ref={group}>
      {clouds.map((c, i) => (
        <group key={i} position={[c.x, c.y, c.z]} scale={c.s}>
          {c.puffs.map((p, k) => (
            <mesh
              key={k}
              position={[p.ox, p.oy - (k % 2 ? 0.15 : 0), p.oz]}
              scale={[p.rs * 1.45, p.rs * 0.78, p.rs * 1.1]}
              geometry={puffGeo}
              material={k % 2 ? shadeMat : puffMat}
            />
          ))}
        </group>
      ))}
    </group>
  );
}

export function Sky({ preset }: { preset: TimePreset }) {
  return (
    <group>
      <SkyDome preset={preset} />
      <SunGlow preset={preset} />
      <SkyClouds />
    </group>
  );
}
