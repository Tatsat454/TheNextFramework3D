"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { plazaCopy } from "@/content/landmarks";
import { sfx } from "@/game/audio";
import { fountain, LEVEL } from "@/game/island";
import { toon } from "@/game/materials";
import { pose, reducedMotion } from "@/game/player-state";
import { useGame } from "@/game/store";

const STONE = "#F2E6D0";
const STONE_RIM = "#FAF0DC";
const WATER = "#7FD3F0";
const SEG = 12;
const SPRAY = 18;
const DROP = 14;
const STREAMS = 8;

const tmp = new THREE.Object3D();

function lathe(pts: [number, number][], segs = SEG) {
  return new THREE.LatheGeometry(
    pts.map(([x, y]) => new THREE.Vector2(x, y)),
    segs,
  );
}

export function Fountain() {
  const sprayRef = useRef<THREE.InstancedMesh>(null);
  const dropRef = useRef<THREE.InstancedMesh>(null);
  const ringsRef = useRef<THREE.Group>(null);
  const sprayGeo = useMemo(() => new THREE.SphereGeometry(1, 7, 6), []);
  const dropGeo = useMemo(() => new THREE.SphereGeometry(1, 7, 6), []);
  const basinGeo = useMemo(
    () =>
      lathe([
        [0.0, 0.0],
        [1.56, 0.0],
        [1.54, 0.1],
        [1.48, 0.14],
        [1.46, 0.4],
        [1.56, 0.48],
        [1.42, 0.56],
        [1.24, 0.46],
        [1.18, 0.2],
        [0.36, 0.2],
        [0.34, 0.1],
        [0.0, 0.1],
      ]),
    [],
  );
  const upperGeo = useMemo(
    () =>
      lathe(
        [
          [0.12, 1.02],
          [0.3, 1.02],
          [0.56, 1.1],
          [0.54, 1.24],
          [0.64, 1.3],
          [0.5, 1.36],
          [0.4, 1.22],
          [0.12, 1.22],
        ],
        10,
      ),
    [],
  );
  const waterMat = useMemo(
    () => toon(WATER, { water: true, ripple: true, emissive: "#4ECAEA", transparent: true, opacity: 0.94 }),
    [],
  );
  const sprayMat = useMemo(() => toon(WATER, { emissive: "#A8ECF8", transparent: true, opacity: 0.85 }), []);
  const dropMat = useMemo(() => toon(WATER, { emissive: "#7FD3F0", transparent: true, opacity: 0.82 }), []);
  const streamMat = useMemo(() => toon(WATER, { water: true, emissive: "#7FD3F0", transparent: true, opacity: 0.72 }), []);

  useLayoutEffect(() => {
    tmp.scale.setScalar(0);
    tmp.position.set(0, 0, 0);
    tmp.updateMatrix();
    const spray = sprayRef.current;
    const drops = dropRef.current;
    if (spray) {
      for (let k = 0; k < SPRAY; k++) spray.setMatrixAt(k, tmp.matrix);
      spray.instanceMatrix.needsUpdate = true;
    }
    if (drops) {
      for (let k = 0; k < DROP; k++) drops.setMatrixAt(k, tmp.matrix);
      drops.instanceMatrix.needsUpdate = true;
    }
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const rm = reducedMotion.value;

    const rings = ringsRef.current;
    if (rings) {
      rings.children.forEach((child, i) => {
        const u = rm ? 0.35 + i * 0.25 : (t * 0.38 + i * 0.48) % 1;
        const s = 0.32 + u * 0.72;
        child.scale.set(s, 1, s);
      });
    }

    const spray = sprayRef.current;
    if (spray) {
      for (let k = 0; k < SPRAY; k++) {
        const life = rm ? 0.25 + (k % 5) * 0.12 : (t * 1.85 + k * 0.37) % 1;
        const ang = k * 2.15 + t * 0.55;
        const spread = 0.03 + life * 0.14;
        tmp.position.set(Math.cos(ang) * spread, 1.56 + life * 0.5, Math.sin(ang) * spread);
        tmp.scale.setScalar((1 - life) * 0.055);
        tmp.updateMatrix();
        spray.setMatrixAt(k, tmp.matrix);
      }
      spray.instanceMatrix.needsUpdate = true;
    }

    const drops = dropRef.current;
    if (drops) {
      for (let k = 0; k < DROP; k++) {
        const a = (k / DROP) * Math.PI * 2 + 0.18;
        const life = rm ? k / DROP : (t * 1.2 + k * 0.17) % 1;
        const r = 0.46 + life * 0.2;
        tmp.position.set(Math.cos(a) * r, 1.2 - life * 0.78, Math.sin(a) * r);
        tmp.scale.setScalar(0.048 * (1 - life * 0.35));
        tmp.updateMatrix();
        drops.setMatrixAt(k, tmp.matrix);
      }
      drops.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group position={[fountain.x, LEVEL, fountain.z]}>
      <mesh geometry={basinGeo} material={toon(STONE)} castShadow receiveShadow />
      <mesh position={[0, 0.52, 0]} rotation={[-Math.PI / 2, 0, 0]} material={toon(STONE_RIM)} castShadow>
        <torusGeometry args={[1.4, 0.1, 8, SEG]} />
      </mesh>
      <mesh position={[0, 0.34, 0]} material={waterMat}>
        <cylinderGeometry args={[1.14, 1.14, 0.08, SEG]} />
      </mesh>
      <group ref={ringsRef} position={[0, 0.39, 0]}>
        {[0, 1].map((k) => (
          <mesh key={k} rotation={[-Math.PI / 2, 0, 0]} material={toon(WATER, { transparent: true, opacity: 0.32, emissive: "#7FD3F0" })}>
            <torusGeometry args={[1.0, 0.03, 6, 20]} />
          </mesh>
        ))}
      </group>
      <mesh position={[0, 0.62, 0]} material={toon(STONE)} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.32, 0.84, 10]} />
      </mesh>
      <mesh position={[0, 1.04, 0]} material={toon(STONE_RIM)} castShadow>
        <cylinderGeometry args={[0.3, 0.26, 0.1, 10]} />
      </mesh>
      <mesh geometry={upperGeo} material={toon(STONE)} castShadow receiveShadow />
      <mesh position={[0, 1.34, 0]} rotation={[-Math.PI / 2, 0, 0]} material={toon(STONE_RIM)} castShadow>
        <torusGeometry args={[0.52, 0.08, 7, 10]} />
      </mesh>
      <mesh position={[0, 1.26, 0]} material={waterMat}>
        <cylinderGeometry args={[0.38, 0.38, 0.06, 10]} />
      </mesh>
      <mesh position={[0, 1.42, 0]} material={toon(STONE)} castShadow>
        <cylinderGeometry args={[0.07, 0.1, 0.2, 8]} />
      </mesh>
      <mesh position={[0, 1.54, 0]} material={toon(STONE_RIM)}>
        <sphereGeometry args={[0.075, 8, 6]} />
      </mesh>
      {Array.from({ length: STREAMS }, (_, k) => {
        const a = (k / STREAMS) * Math.PI * 2;
        const r = 0.5;
        return (
          <mesh key={k} position={[Math.cos(a) * r, 0.78, Math.sin(a) * r]} material={streamMat}>
            <cylinderGeometry args={[0.026, 0.044, 0.84, 6]} />
          </mesh>
        );
      })}
      <instancedMesh ref={sprayRef} args={[sprayGeo, sprayMat, SPRAY]} />
      <instancedMesh ref={dropRef} args={[dropGeo, dropMat, DROP]} />
      <CoinToss />
    </group>
  );
}

const SPARK = 12;
const tmpSpark = new THREE.Object3D();

function CoinToss() {
  const coin = useRef<THREE.Group>(null);
  const sparkRef = useRef<THREE.InstancedMesh>(null);
  const state = useRef({ shown: 0, spark: 0, landed: false });

  useFrame(() => {
    const now = performance.now();
    const age = (now - pose.tossAt) / 1000;
    const active = pose.tossAt > 0 && age < 2.4;
    const g = coin.current;
    if (g) g.visible = active && age < 0.72;

    if (active && age < 0.72 && g) {
      const u = reducedMotion.value ? 1 : Math.min(1, age / 0.7);
      const tx = fountain.x;
      const tz = fountain.z;
      const x = pose.tossFromX + (tx - pose.tossFromX) * u;
      const z = pose.tossFromZ + (tz - pose.tossFromZ) * u;
      const y = pose.tossFromY + (LEVEL + 0.42 - pose.tossFromY) * u + Math.sin(u * Math.PI) * 1.45;
      g.position.set(x - fountain.x, y - LEVEL, z - fountain.z);
      g.rotation.set(u * 6.2, u * 9.1, u * 3.4);
    }

    if (active && age >= 0.7 && state.current.shown !== pose.tossAt) {
      state.current.shown = pose.tossAt;
      state.current.spark = now;
      state.current.landed = true;
      sfx.plink();
      const wishes = plazaCopy.fountain.wishes;
      const line = wishes[Math.floor(Math.random() * wishes.length)]!;
      useGame.setState({
        dialog: {
          speaker: "fountain",
          name: "Fountain",
          role: "Wish",
          tagColor: "#7FD3F0",
          voice: [280, 380],
          lines: [line],
          index: 0,
        },
      });
    }

    const spark = sparkRef.current;
    if (!spark) return;
    const st = state.current.spark;
    const su = st ? (now - st) / 700 : 2;
    for (let k = 0; k < SPARK; k++) {
      if (su >= 1) {
        tmpSpark.scale.setScalar(0);
      } else {
        const a = (k / SPARK) * Math.PI * 2;
        const r = 0.12 + su * 0.42;
        tmpSpark.position.set(Math.cos(a) * r, 0.44 + su * 0.35, Math.sin(a) * r);
        tmpSpark.scale.setScalar((1 - su) * 0.045);
      }
      tmpSpark.updateMatrix();
      spark.setMatrixAt(k, tmpSpark.matrix);
    }
    spark.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <group ref={coin} visible={false}>
        <mesh material={toon("#E8C35A", { emissive: "#E8C35A" })} castShadow>
          <cylinderGeometry args={[0.09, 0.09, 0.024, 12]} />
        </mesh>
      </group>
      <instancedMesh ref={sparkRef} args={[undefined, toon("#FFE38A", { emissive: "#FFE38A", noOcclude: true }), SPARK]}>
        <octahedronGeometry args={[1, 0]} />
      </instancedMesh>
    </>
  );
}
