"use client";

import { PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { presetFromSearch } from "@/game/time-of-day";
import { useGame } from "@/game/store";
import { Ambient } from "./Ambient";
import { ArcadeWorld } from "./ArcadeInterior";
import { ClearColor, InteriorWorld } from "./Interior";
import { Landmarks } from "./Landmarks";
import { Nature } from "./Nature";
import { Pickups } from "./Pickups";
import { Player } from "./Player";
import { Prompt } from "./Prompt";
import { Residents } from "./Residents";
import { CameraRig, Lights } from "./Rig";
import { Sky } from "./Sky";
import { Terrain } from "./Terrain";
import { TownHallWorld } from "./TownHallInterior";

function FirstFrame({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  useFrame(() => {
    frames.current++;
    if (frames.current === 3) onReady();
  });
  return null;
}

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

function isLowPower() {
  if (new URLSearchParams(window.location.search).has("hq")) return false;
  const cores = navigator.hardwareConcurrency ?? 8;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  return cores <= 4 || (coarse && cores <= 6);
}

const hour = () => new Date().getHours();

/** Client-only (loaded with ssr: false), so reading browser APIs in initializers is safe. */
export default function IslandCanvas({ onReady, onNoWebGL }: { onReady: () => void; onNoWebGL: () => void }) {
  const [supported] = useState(hasWebGL);
  const [lowPower] = useState(isLowPower);
  const [shadows, setShadows] = useState(!lowPower);
  const [dpr, setDpr] = useState(lowPower ? 1.25 : 1.75);
  const [h, setH] = useState(hour);
  const [search, setSearch] = useState(() => window.location.search);
  const preset = presetFromSearch(search, h);
  const interior = useGame((s) => s.interior);

  useEffect(() => {
    if (!supported) onNoWebGL();
  }, [supported, onNoWebGL]);

  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty("--sky-top", preset.sky[0]);
    root.setProperty("--sky-mid", preset.sky[1]);
    root.setProperty("--sky-bottom", preset.sky[2]);
  }, [preset]);

  useEffect(() => {
    const id = setInterval(() => setH(hour()), 60_000);
    const onPop = () => setSearch(window.location.search);
    window.addEventListener("popstate", onPop);
    return () => {
      clearInterval(id);
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  if (!supported) return null;
  return (
    <Canvas
      flat
      shadows={{ type: THREE.PCFSoftShadowMap, enabled: true }}
      dpr={[1, dpr]}
      gl={{ alpha: false, antialias: true, powerPreference: "high-performance" }}
      camera={{ fov: 32, near: 0.5, far: 180, position: [0, 18, 22] }}
      onCreated={({ gl }) => {
        gl.setClearColor(preset.fog, 1);
        if (process.env.NODE_ENV !== "production") (window as unknown as { __gl: THREE.WebGLRenderer }).__gl = gl;
      }}
    >
      <PerformanceMonitor
        onDecline={() => {
          setShadows(false);
          setDpr(1);
        }}
      />
      {interior === "arcade" ? (
        <ArcadeWorld />
      ) : interior === "townhall" ? (
        <TownHallWorld />
      ) : interior ? (
        <InteriorWorld />
      ) : (
        <>
          <ClearColor color={preset.fog} />
          <Sky preset={preset} />
          <Lights preset={preset} shadows={shadows} />
          <Terrain />
          <Nature />
          <Landmarks />
          <Pickups />
          <Residents />
          <Ambient />
        </>
      )}
      <CameraRig />
      <Player />
      <Prompt />
      <FirstFrame onReady={onReady} />
    </Canvas>
  );
}
