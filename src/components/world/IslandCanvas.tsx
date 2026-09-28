"use client";

import { PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { input, onWorldTap } from "@/game/input";
import { isNightTime, presetFromSearch } from "@/game/time-of-day";
import { isPaused, useGame } from "@/game/store";
import { Ambient } from "./Ambient";
import { ArcadeWorld } from "./ArcadeInterior";
import { Beach } from "./Beach";
import { Fountain } from "./Fountain";
import { ClearColor, InteriorWorld } from "./Interior";
import { Landmarks } from "./Landmarks";
import { Nature } from "./Nature";
import { Gazebo } from "./Gazebo";
import { Lookout } from "./Lookout";
import { Plaza, PlazaPetals } from "./Plaza";
import { PlazaFurniture } from "./PlazaFurniture";
import { Pickups } from "./Pickups";
import { Player } from "./Player";
import { Prompt } from "./Prompt";
import { Residents } from "./Residents";
import { CameraRig, Lights } from "./Rig";
import { Sky } from "./Sky";
import { Terrain } from "./Terrain";
import { MuseumWorld } from "./MuseumInterior";
import { TownHallWorld } from "./TownHallInterior";

function FirstFrame({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  useFrame(() => {
    frames.current++;
    if (frames.current === 3) onReady();
  });
  return null;
}

const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const tapNdc = new THREE.Vector2();
const tapHit = new THREE.Vector3();
const tapRay = new THREE.Raycaster();

/** Indoor floors have no outdoor Terrain onClick. Project every canvas tap onto y=0. */
function IndoorGroundTap() {
  const { camera, gl } = useThree();
  const interior = useGame((s) => s.interior);
  useEffect(() => {
    if (!interior) return;
    const el = gl.domElement;
    const onDown = (ev: PointerEvent) => {
      if (ev.button !== 0) return;
      if (isPaused(useGame.getState())) return;
      const rect = el.getBoundingClientRect();
      tapNdc.set(((ev.clientX - rect.left) / rect.width) * 2 - 1, -((ev.clientY - rect.top) / rect.height) * 2 + 1);
      tapRay.setFromCamera(tapNdc, camera);
      if (tapRay.ray.intersectPlane(floorPlane, tapHit)) {
        input.tapTarget = { x: tapHit.x, z: tapHit.z };
      }
    };
    el.addEventListener("pointerdown", onDown, { passive: true });
    return () => el.removeEventListener("pointerdown", onDown);
  }, [camera, gl, interior]);
  return null;
}

function Indoor({ children }: { children: React.ReactNode }) {
  return (
    <group onPointerDown={onWorldTap} onClick={onWorldTap}>
      {children}
    </group>
  );
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
      style={{ touchAction: "none" }}
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
        <Indoor>
          <ArcadeWorld />
        </Indoor>
      ) : interior === "townhall" ? (
        <Indoor>
          <TownHallWorld />
        </Indoor>
      ) : interior === "museum" ? (
        <Indoor>
          <MuseumWorld />
        </Indoor>
      ) : interior ? (
        <Indoor>
          <InteriorWorld />
        </Indoor>
      ) : (
        <>
          <ClearColor color={preset.fog} />
          <Sky preset={preset} />
          <Lights preset={preset} shadows={shadows} />
          <Terrain />
          <Beach />
          <Nature />
          <Plaza />
          <PlazaFurniture night={isNightTime(search, h)} />
          <Fountain />
          <Gazebo />
          <Lookout />
          <PlazaPetals />
          <Landmarks />
          <Pickups />
          <Residents />
          <Ambient />
        </>
      )}
      <IndoorGroundTap />
      <CameraRig />
      <Player />
      <Prompt />
      <FirstFrame onReady={onReady} />
    </Canvas>
  );
}
