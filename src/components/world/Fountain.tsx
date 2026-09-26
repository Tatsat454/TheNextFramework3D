"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { fountain, LEVEL } from "@/game/island";
import { toon } from "@/game/materials";
import { reducedMotion } from "@/game/player-state";

const STONE = "#F2E6D0";
const STONE_DEEP = "#E4D2B4";
const STONE_RIM = "#FAF0DC";
const WATER = "#7FD3F0";
const SEG = 12;
const SPRAY = 16;
const DROP = 12;
const STREAMS = 8;

const tmp = new THREE.Object3D();

export function Fountain() {
  const sprayRef = useRef<THREE.InstancedMesh>(null);
  const dropRef = useRef<THREE.InstancedMesh>(null);
  const ringsRef = useRef<THREE.Group>(null);
  const sprayGeo = useMemo(() => new THREE.IcosahedronGeometry(1, 0), []);
  const dropGeo = useMemo(() => new THREE.SphereGeometry(1, 8, 6), []);
  const waterMat = useMemo(
    () => toon(WATER, { water: true, ripple: true, emissive: "#5EC4E4", transparent: true, opacity: 0.92 }),
    [],
  );
  const sprayMat = useMemo(() => toon(WATER, { emissive: "#A8ECF8", transparent: true, opacity: 0.82 }), []);
  const dropMat = useMemo(() => toon(WATER, { emissive: "#7FD3F0", transparent: true, opacity: 0.78 }), []);
  const streamMat = useMemo(() => toon(WATER, { water: true, emissive: "#7FD3F0", transparent: true, opacity: 0.7 }), []);

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
        const s = 0.28 + u * 0.78;
        child.scale.set(s, 1, s);
      });
    }

    const spray = sprayRef.current;
    if (spray) {
      for (let k = 0; k < SPRAY; k++) {
        const life = rm ? 0.25 + (k % 5) * 0.12 : (t * 1.7 + k * 0.41) % 1;
        const ang = k * 2.15 + t * 0.4;
        const spread = 0.04 + life * 0.18;
        tmp.position.set(Math.cos(ang) * spread, 1.54 + life * 0.46, Math.sin(ang) * spread);
        tmp.scale.setScalar((1 - life) * 0.085);
        tmp.updateMatrix();
        spray.setMatrixAt(k, tmp.matrix);
      }
      spray.instanceMatrix.needsUpdate = true;
    }

    const drops = dropRef.current;
    if (drops) {
      for (let k = 0; k < DROP; k++) {
        const a = (k / DROP) * Math.PI * 2 + 0.2;
        const life = rm ? (k / DROP) : (t * 1.15 + k * 0.19) % 1;
        const r = 0.44 + life * 0.22;
        tmp.position.set(Math.cos(a) * r, 1.18 - life * 0.74, Math.sin(a) * r);
        tmp.scale.setScalar(0.055 * (1 - life * 0.4));
        tmp.updateMatrix();
        drops.setMatrixAt(k, tmp.matrix);
      }
      drops.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group position={[fountain.x, LEVEL, fountain.z]}>
      <mesh position={[0, 0.05, 0]} material={toon(STONE_DEEP)} castShadow receiveShadow>
        <cylinderGeometry args={[1.54, 1.58, 0.1, SEG]} />
      </mesh>
      <mesh position={[0, 0.28, 0]} material={toon(STONE)} castShadow receiveShadow>
        <cylinderGeometry args={[1.46, 1.5, 0.38, SEG]} />
      </mesh>
      <mesh position={[0, 0.24, 0]} material={toon(STONE_DEEP)} receiveShadow>
        <cylinderGeometry args={[1.18, 1.22, 0.16, SEG]} />
      </mesh>
      <mesh position={[0, 0.48, 0]} rotation={[-Math.PI / 2, 0, 0]} material={toon(STONE_RIM)} castShadow>
        <torusGeometry args={[1.38, 0.17, 8, SEG]} />
      </mesh>
      <mesh position={[0, 0.4, 0]} material={waterMat}>
        <cylinderGeometry args={[1.16, 1.16, 0.06, SEG]} />
      </mesh>
      <group ref={ringsRef} position={[0, 0.44, 0]}>
        {[0, 1].map((k) => (
          <mesh key={k} rotation={[-Math.PI / 2, 0, 0]} material={toon(WATER, { transparent: true, opacity: 0.28, emissive: "#7FD3F0" })}>
            <torusGeometry args={[1.0, 0.028, 6, 20]} />
          </mesh>
        ))}
      </group>
      <mesh position={[0, 0.74, 0]} material={toon(STONE)} castShadow receiveShadow>
        <cylinderGeometry args={[0.24, 0.34, 0.58, 10]} />
      </mesh>
      <mesh position={[0, 1.04, 0]} material={toon(STONE_RIM)} castShadow>
        <cylinderGeometry args={[0.32, 0.28, 0.1, 10]} />
      </mesh>
      <mesh position={[0, 1.18, 0]} material={toon(STONE)} castShadow receiveShadow>
        <cylinderGeometry args={[0.52, 0.56, 0.22, 10]} />
      </mesh>
      <mesh position={[0, 1.16, 0]} material={toon(STONE_DEEP)} receiveShadow>
        <cylinderGeometry args={[0.38, 0.4, 0.1, 10]} />
      </mesh>
      <mesh position={[0, 1.3, 0]} rotation={[-Math.PI / 2, 0, 0]} material={toon(STONE_RIM)} castShadow>
        <torusGeometry args={[0.5, 0.11, 7, 10]} />
      </mesh>
      <mesh position={[0, 1.24, 0]} material={waterMat}>
        <cylinderGeometry args={[0.38, 0.38, 0.05, 10]} />
      </mesh>
      <mesh position={[0, 1.4, 0]} material={toon(STONE)} castShadow>
        <cylinderGeometry args={[0.07, 0.1, 0.2, 8]} />
      </mesh>
      <mesh position={[0, 1.52, 0]} material={toon(STONE_RIM)}>
        <sphereGeometry args={[0.08, 8, 6]} />
      </mesh>
      {Array.from({ length: STREAMS }, (_, k) => {
        const a = (k / STREAMS) * Math.PI * 2;
        const r = 0.48;
        return (
          <mesh key={k} position={[Math.cos(a) * r, 0.82, Math.sin(a) * r]} material={streamMat}>
            <cylinderGeometry args={[0.028, 0.048, 0.76, 6]} />
          </mesh>
        );
      })}
      <instancedMesh ref={sprayRef} args={[sprayGeo, sprayMat, SPRAY]} />
      <instancedMesh ref={dropRef} args={[dropGeo, dropMat, DROP]} />
    </group>
  );
}
