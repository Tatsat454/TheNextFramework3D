"use client";

import { PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";
import type { TimePreset } from "@/game/time-of-day";
import { Ambient } from "./Ambient";
import { Landmarks } from "./Landmarks";
import { Nature } from "./Nature";
import { Pickups } from "./Pickups";
import { Player } from "./Player";
import { Prompt } from "./Prompt";
import { Residents } from "./Residents";
import { CameraRig, Lights } from "./Rig";
import { Terrain } from "./Terrain";

function FirstFrame({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  useFrame(() => {
    frames.current++;
    if (frames.current === 3) onReady();
  });
  return null;
}

export default function IslandCanvas({ preset, onReady, lowPower }: { preset: TimePreset; onReady: () => void; lowPower: boolean }) {
  const [shadows, setShadows] = useState(!lowPower);
  const [dpr, setDpr] = useState(lowPower ? 1.25 : 1.75);
  return (
    <Canvas
      shadows={{ type: THREE.PCFSoftShadowMap, enabled: true }}
      dpr={[1, dpr]}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      camera={{ fov: 30, near: 0.5, far: 140, position: [0, 18, 16] }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        if (process.env.NODE_ENV !== "production") (window as unknown as { __gl: THREE.WebGLRenderer }).__gl = gl;
      }}
    >
      <PerformanceMonitor
        onDecline={() => {
          setShadows(false);
          setDpr(1);
        }}
      />
      <Lights preset={preset} shadows={shadows} />
      <CameraRig />
      <Terrain />
      <Nature />
      <Landmarks />
      <Pickups />
      <Residents />
      <Player />
      <Ambient />
      <Prompt />
      <FirstFrame onReady={onReady} />
    </Canvas>
  );
}
