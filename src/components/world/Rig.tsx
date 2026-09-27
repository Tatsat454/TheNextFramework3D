"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { LandmarkId } from "@/content/landmarks";
import { MUSEUM, MUSEUM_CURATOR, MUSEUM_PEDESTALS } from "@/game/interiors";
import { beachUmbrella, fountain, gazebo, getPlacement, LEVEL, lighthouse, lookout, spawn } from "@/game/island";
import { bend } from "@/game/materials";
import { debugCam, player, playerScreen, pose, reducedMotion } from "@/game/player-state";
import { useGame } from "@/game/store";
import type { TimePreset } from "@/game/time-of-day";

const OFFSET = new THREE.Vector3(0, 14.8, 18.4);
/** Lower and a little to the side so a sit isn't hidden by plaza trees. */
const SIT_OFFSET = new THREE.Vector3(3.05, 6.2, 8.15);
const INTERIOR_OFFSET = new THREE.Vector3(-1.4, 18.4, 8.6);
const MUSEUM_OFFSET = new THREE.Vector3(0, 21.8, 12.6);
const sitOff = new THREE.Vector3();
const ARCADE_OFFSET = new THREE.Vector3(0, 19.6, 10.4);
const TOWN_OFFSET = new THREE.Vector3(0, 17.2, 14.6);
const HOUSE_LOOK = new THREE.Vector3(-1.45, 0.25, -0.1);
const MUSEUM_LOOK = new THREE.Vector3(0, 0.55, -0.35);
const ARCADE_LOOK = new THREE.Vector3(0, 0.22, 0.15);
const TOWN_LOOK = new THREE.Vector3(0, 0.35, -0.35);
const tmp = new THREE.Vector3();
const lookPos = new THREE.Vector3();
const lookAtPt = new THREE.Vector3();
const LOOKOUT_MS = 5200;

export function CameraRig() {
  const { camera, size } = useThree();
  const aspect = size.width / Math.max(1, size.height);
  const portrait = aspect < 0.85 ? 1.28 : aspect < 1.2 ? 1.12 : 1;
  const focus = useRef(new THREE.Vector3(player.x, player.y, player.z));
  const zoom = useRef(1);
  const sitBlend = useRef(0);
  const init = useRef(false);
  const lastInterior = useRef<string | null>(null);

  useFrame((_, rawDt) => {
    if (debugCam.gazebo) {
      camera.position.set(gazebo.x + 1.85, LEVEL + 3.55, gazebo.z + 6.15);
      camera.lookAt(gazebo.x, LEVEL + 1.12, gazebo.z);
      bend.uBend.value = 0.0016;
      bend.uBendCenter.value.set(gazebo.x, LEVEL, gazebo.z);
      bend.uPlayer.value.set(player.x, player.y + 0.55, player.z);
      return;
    }
    if (debugCam.lookoutSpot) {
      camera.position.set(lookout.x - 0.35, lookout.y + 2.75, lookout.z + 3.85);
      camera.lookAt(lookout.x + 0.85, lookout.y + 0.7, lookout.z - 0.45);
      bend.uBend.value = 0.0016;
      bend.uBendCenter.value.set(lookout.x, lookout.y, lookout.z);
      bend.uPlayer.value.set(player.x, player.y + 0.55, player.z);
      return;
    }
    if (debugCam.close) {
      camera.position.set(fountain.x + 2.15, LEVEL + 2.35, fountain.z + 3.45);
      camera.lookAt(fountain.x, LEVEL + 0.82, fountain.z);
      bend.uBend.value = 0.0016;
      bend.uBendCenter.value.set(fountain.x, LEVEL, fountain.z);
      bend.uPlayer.value.set(player.x, player.y + 0.55, player.z);
      return;
    }
    if (debugCam.museumCurator) {
      const { x, z } = MUSEUM_CURATOR;
      camera.position.set(0.22, 1.48, 5.52);
      camera.lookAt(x, 0.52, z);
      const persp = camera as THREE.PerspectiveCamera;
      if (persp.isPerspectiveCamera) {
        persp.fov = 34;
        persp.updateProjectionMatrix();
      }
      bend.uBend.value = 0;
      bend.uBendCenter.value.set(x, 0, z);
      bend.uPlayer.value.set(player.x, player.y + 0.55, player.z);
      return;
    }
    if (debugCam.beach) {
      camera.position.set(4.6, LEVEL + 4.85, 23.2);
      camera.lookAt(0.2, LEVEL + 0.38, 15.1);
      const persp = camera as THREE.PerspectiveCamera;
      if (persp.isPerspectiveCamera) {
        persp.fov = 34;
        persp.updateProjectionMatrix();
      }
      bend.uBend.value = 0.0016;
      bend.uBendCenter.value.set(spawn.x, LEVEL, beachUmbrella.z);
      bend.uPlayer.value.set(player.x, player.y + 0.55, player.z);
      return;
    }
    if (debugCam.lookout) {
      camera.position.set(lighthouse.x + 5.2, lighthouse.y + 4.15, lighthouse.z + 11.8);
      camera.lookAt(lighthouse.x, lighthouse.y + 3.15, lighthouse.z);
      const persp = camera as THREE.PerspectiveCamera;
      if (persp.isPerspectiveCamera) {
        persp.fov = 34;
        persp.updateProjectionMatrix();
      }
      bend.uBend.value = 0.001;
      bend.uBendCenter.value.set(lighthouse.x, lighthouse.y, lighthouse.z);
      bend.uPlayer.value.set(player.x, player.y + 0.55, player.z);
      return;
    }
    if (debugCam.museumPedestal) {
      const ex = MUSEUM_PEDESTALS[0];
      const y = MUSEUM.deckH;
      camera.position.set(ex.x + 0.55, y + 2.05, ex.z + 2.45);
      camera.lookAt(ex.x, y + 0.48, ex.z);
      const persp = camera as THREE.PerspectiveCamera;
      if (persp.isPerspectiveCamera) {
        persp.fov = 28;
        persp.updateProjectionMatrix();
      }
      bend.uBend.value = 0;
      bend.uBendCenter.value.set(ex.x, y, ex.z);
      bend.uPlayer.value.set(player.x, player.y + 0.55, player.z);
      return;
    }
    const dt = Math.min(rawDt, 1 / 20);
    const s = useGame.getState();
    if (s.interior !== lastInterior.current) {
      lastInterior.current = s.interior;
      init.current = false;
    }
    const inside = !!s.interior;
    const arcade = s.interior === "arcade";
    const townhall = s.interior === "townhall";
    const museum = s.interior === "museum";
    const target = inside
      ? arcade
        ? ARCADE_LOOK.clone()
        : townhall
          ? TOWN_LOOK.clone()
          : museum
            ? MUSEUM_LOOK.clone()
            : HOUSE_LOOK.clone()
      : new THREE.Vector3(player.x, player.y, player.z);
    let z = 1;
    if (!inside && s.nearby?.startsWith("landmark:")) {
      const c = getPlacement(s.nearby.slice(9) as LandmarkId).center;
      target.x += (c.x - player.x) * 0.22;
      target.z += (c.z - player.z) * 0.22;
      z = 0.85;
    }
    if (s.card || s.dialog) z = Math.min(z, 0.9);
    if (pose.gazeboFocus && !pose.sitting) z = Math.min(z, 0.78);
    const lookoutAt = s.lookoutAt || pose.lookoutAt;
    if (!inside && !lookoutAt) {
      target.x = THREE.MathUtils.clamp(target.x, -18, 18);
      target.z = THREE.MathUtils.clamp(target.z, -20, 18);
    }

    const k = reducedMotion.value ? 1 - Math.pow(1 - 0.2, dt * 60) : 1 - Math.pow(1 - 0.08, dt * 60);
    if (!init.current) {
      focus.current.copy(target);
      init.current = true;
    }
    focus.current.lerp(target, inside ? 1 : k);
    zoom.current += (z - zoom.current) * k * 0.6;
    sitBlend.current += ((pose.sitting ? 1 : 0) - sitBlend.current) * k;
    sitOff.copy(OFFSET).lerp(SIT_OFFSET, sitBlend.current);
    const offset = inside ? (arcade ? ARCADE_OFFSET : townhall ? TOWN_OFFSET : museum ? MUSEUM_OFFSET : INTERIOR_OFFSET) : sitOff;
    camera.position.copy(focus.current).addScaledVector(offset, zoom.current * (inside ? 1 : portrait));
    const persp = camera as THREE.PerspectiveCamera;
    if (persp.isPerspectiveCamera) {
      persp.fov = inside ? (arcade ? 40 : townhall ? 42 : museum ? 36 : 38) : 32;
      persp.updateProjectionMatrix();
    }
    if (inside) camera.lookAt(focus.current.x, focus.current.y + 0.15, focus.current.z);
    else camera.lookAt(focus.current.x, focus.current.y + (pose.sitting ? 0.38 : 0.6), focus.current.z - 1.6);
    if (lookoutAt) {
      const elapsed = performance.now() - lookoutAt;
      if (elapsed >= LOOKOUT_MS) {
        pose.lookoutAt = 0;
        if (s.lookoutAt) useGame.setState({ lookoutAt: 0 });
      } else {
        let u = 1;
        if (reducedMotion.value) u = elapsed < LOOKOUT_MS - 400 ? 1 : 0;
        else if (elapsed < 1200) u = elapsed / 1200;
        else if (elapsed < 3400) u = 1;
        else u = 1 - (elapsed - 3400) / (LOOKOUT_MS - 3400);
        const e = u * u * (3 - 2 * u);
        lookPos.set(lighthouse.x + 5.2, lighthouse.y + 4.15, lighthouse.z + 11.8);
        lookAtPt.set(lighthouse.x, lighthouse.y + 3.15, lighthouse.z);
        camera.position.lerp(lookPos, e);
        tmp.set(
          focus.current.x + (lookAtPt.x - focus.current.x) * e,
          focus.current.y + 0.6 + (lookAtPt.y - (focus.current.y + 0.6)) * e,
          focus.current.z - 1.6 + (lookAtPt.z - (focus.current.z - 1.6)) * e,
        );
        camera.lookAt(tmp);
        if (persp.isPerspectiveCamera) {
          persp.fov = 32 - e * 4;
          persp.updateProjectionMatrix();
        }
      }
    }
    bend.uBend.value = inside ? 0 : 0.0016;
    bend.uBendCenter.value.copy(focus.current);
    bend.uPlayer.value.set(player.x, player.y + 0.55, player.z);
    tmp.set(player.x, player.y + 0.7, player.z).project(camera);
    playerScreen.x = THREE.MathUtils.clamp((tmp.x + 1) / 2, 0.08, 0.92);
    playerScreen.y = THREE.MathUtils.clamp((-tmp.y + 1) / 2, 0.08, 0.92);
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
