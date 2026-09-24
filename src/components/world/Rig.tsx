"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { LandmarkId } from "@/content/landmarks";
import { getPlacement } from "@/game/island";
import { bend } from "@/game/materials";
import { player, reducedMotion } from "@/game/player-state";
import { useGame } from "@/game/store";
import type { TimePreset } from "@/game/time-of-day";

const OFFSET = new THREE.Vector3(0, 14.8, 18.4);

export function CameraRig() {
  const { camera, size } = useThree();
  const aspect = size.width / Math.max(1, size.height);
  const portrait = aspect < 0.85 ? 1.28 : aspect < 1.2 ? 1.12 : 1;
  const focus = useRef(new THREE.Vector3(player.x, player.y, player.z));
  const zoom = useRef(1);
  const init = useRef(false);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20);
    const s = useGame.getState();
    const target = new THREE.Vector3(player.x, player.y, player.z);
    let z = 1;
    if (s.nearby?.startsWith("landmark:")) {
      const c = getPlacement(s.nearby.slice(9) as LandmarkId).center;
      target.x += (c.x - player.x) * 0.22;
      target.z += (c.z - player.z) * 0.22;
      z = 0.85;
    }
    if (s.card || s.dialog) z = Math.min(z, 0.9);
    target.x = THREE.MathUtils.clamp(target.x, -18, 18);
    target.z = THREE.MathUtils.clamp(target.z, -20, 18);

    const k = reducedMotion.value ? 1 - Math.pow(1 - 0.2, dt * 60) : 1 - Math.pow(1 - 0.08, dt * 60);
    if (!init.current) {
      focus.current.copy(target);
      init.current = true;
    }
    focus.current.lerp(target, k);
    zoom.current += (z - zoom.current) * k * 0.6;
    camera.position.copy(focus.current).addScaledVector(OFFSET, zoom.current * portrait);
    camera.lookAt(focus.current.x, focus.current.y + 0.6, focus.current.z - 1.6);
    bend.uBendCenter.value.copy(focus.current);
    bend.uPlayer.value.set(player.x, player.y + 0.55, player.z);
  });
  return null;
}

export function Lights({ preset, shadows }: { preset: TimePreset; shadows: boolean }) {
  const sun = useRef<THREE.DirectionalLight>(null);
  const { scene } = useThree();
  useEffect(() => {
    if (sun.current) scene.add(sun.current.target);
  }, [scene]);
  useFrame((st) => {
    bend.uTime.value = st.clock.elapsedTime;
    const l = sun.current;
    if (!l) return;
    // Keep a tight shadow frustum around the part of the island in view.
    const fx = THREE.MathUtils.clamp(player.x, -22, 22);
    const fz = THREE.MathUtils.clamp(player.z, -20, 22);
    l.position.set(fx + preset.sunDir[0], preset.sunDir[1], fz + preset.sunDir[2]);
    l.target.position.set(fx, 0, fz);
  });
  return (
    <>
      <fog attach="fog" args={[preset.fog, 62, 125]} />
      <hemisphereLight args={[preset.hemiSky, preset.hemiGround, preset.hemiIntensity]} />
      <ambientLight intensity={0.34} />
      <directionalLight
        ref={sun}
        color={preset.sun}
        intensity={preset.sunIntensity}
        castShadow={shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-intensity={0.28}
        shadow-bias={-0.0006}
        shadow-normalBias={0.05}
        shadow-radius={8}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
        shadow-camera-near={1}
        shadow-camera-far={90}
      />
      <directionalLight
        color="#FFE6D8"
        intensity={0.38}
        position={[-preset.sunDir[0] * 0.6, 18, -preset.sunDir[2] * 0.4]}
      />
    </>
  );
}
