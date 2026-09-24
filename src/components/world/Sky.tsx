"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { mulberry32 } from "@/game/rng";
import type { TimePreset } from "@/game/time-of-day";

function SkyDome({ preset }: { preset: TimePreset }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          uTop: { value: new THREE.Color(preset.sky[0]) },
          uMid: { value: new THREE.Color(preset.sky[1]) },
          uHorizon: { value: new THREE.Color(preset.sky[2]) },
        },
        vertexShader: /* glsl */ `
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          #include <common>
          uniform vec3 uTop;
          uniform vec3 uMid;
          uniform vec3 uHorizon;
          varying vec3 vDir;
          void main() {
            float h = clamp(vDir.y * 0.5 + 0.5, 0.0, 1.0);
            float up = clamp(vDir.y, 0.0, 1.0);
            vec3 col = mix(uHorizon, uMid, smoothstep(0.42, 0.58, h));
            col = mix(col, uTop, smoothstep(0.55, 0.92, h));
            col += vec3(0.07, 0.05, 0.0) * (1.0 - smoothstep(0.0, 0.18, up));
            gl_FragColor = vec4(col, 1.0);
            #include <colorspace_fragment>
          }
        `,
      }),
    // uniforms are mutated below when the preset changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  mat.uniforms.uTop.value.set(preset.sky[0]);
  mat.uniforms.uMid.value.set(preset.sky[1]);
  mat.uniforms.uHorizon.value.set(preset.sky[2]);
  return (
    <mesh material={mat} renderOrder={-20} frustumCulled={false}>
      <sphereGeometry args={[92, 48, 28]} />
    </mesh>
  );
}

function SunGlow({ preset }: { preset: TimePreset }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const m = ref.current;
    if (!m) return;
    m.position.set(preset.sunDir[0] * 3.4, preset.sunDir[1] * 1.8, preset.sunDir[2] * 3.4);
    m.lookAt(0, 8, 0);
  });
  return (
    <mesh ref={ref} renderOrder={-18} frustumCulled={false}>
      <circleGeometry args={[6.5, 28]} />
      <meshBasicMaterial color={preset.sun} transparent opacity={0.85} depthWrite={false} fog={false} />
    </mesh>
  );
}

function SkyClouds() {
  const group = useRef<THREE.Group>(null);
  const clouds = useMemo(() => {
    const r = mulberry32(42);
    return Array.from({ length: 16 }, () => ({
      x: (r() - 0.5) * 86,
      y: 18 + r() * 16,
      z: -4 - r() * 52,
      s: 1.6 + r() * 2.6,
      speed: 0.1 + r() * 0.16,
      puffs: Array.from({ length: 5 + Math.floor(r() * 3) }, () => ({
        ox: (r() - 0.5) * 3.4,
        oy: (r() - 0.5) * 0.7,
        oz: (r() - 0.5) * 1.7,
        rs: 0.75 + r() * 0.95,
      })),
    }));
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
    () => new THREE.MeshBasicMaterial({ color: "#F7FCFF", fog: false, depthWrite: false, transparent: true, opacity: 0.94 }),
    [],
  );
  const puffGeo = useMemo(() => new THREE.SphereGeometry(1, 10, 8), []);
  return (
    <group ref={group}>
      {clouds.map((c, i) => (
        <group key={i} position={[c.x, c.y, c.z]} scale={c.s}>
          {c.puffs.map((p, k) => (
            <mesh key={k} position={[p.ox, p.oy, p.oz]} scale={[p.rs * 1.35, p.rs * 0.72, p.rs]} geometry={puffGeo} material={puffMat} />
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
