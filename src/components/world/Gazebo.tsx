"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { gazebo, LEVEL } from "@/game/island";
import { toon } from "@/game/materials";

const CREAM = "#F2E6D0";
const CREAM_RIM = "#FAF0DC";
const ROOF = "#B89AE0";
const ROOF_LIP = "#C9B0EA";
const GOLD = "#E8C35A";
const VINE = "#4E8F48";
const WISTERIA = "#9B6ED4";
const WISTERIA_DEEP = "#7A4CB8";

const tmp = new THREE.Object3D();

function sectorCylinder(r: number, h: number, half: number) {
  return new THREE.CylinderGeometry(r, r, h, 12, 1, false, Math.PI / 2 - half, half * 2);
}

export function Gazebo() {
  const vineRef = useRef<THREE.InstancedMesh>(null);
  const bloomRef = useRef<THREE.InstancedMesh>(null);
  const deepRef = useRef<THREE.InstancedMesh>(null);

  const vineGeo = useMemo(
    () =>
      mergeGeometries([
        new THREE.CylinderGeometry(0.018, 0.028, 0.72, 5).translate(0, -0.36, 0),
        new THREE.CylinderGeometry(0.014, 0.02, 0.4, 5).rotateZ(0.35).translate(0.08, -0.55, 0.02),
      ]),
    [],
  );
  const clusterGeo = useMemo(
    () =>
      mergeGeometries([
        new THREE.SphereGeometry(0.055, 6, 5).translate(0, -0.42, 0),
        new THREE.SphereGeometry(0.07, 6, 5).translate(0.02, -0.55, 0.01),
        new THREE.SphereGeometry(0.062, 6, 5).translate(-0.02, -0.68, 0),
        new THREE.SphereGeometry(0.048, 6, 5).translate(0.01, -0.8, 0.02),
        new THREE.SphereGeometry(0.034, 6, 5).translate(0, -0.9, 0),
      ]),
    [],
  );

  const lowStepGeo = useMemo(() => sectorCylinder(gazebo.steps[1].r, gazebo.steps[1].h, gazebo.stepHalf), []);
  const midStepGeo = useMemo(() => sectorCylinder(gazebo.steps[0].r, gazebo.steps[0].h, gazebo.stepHalf), []);
  const vines = useMemo(() => {
    const list: { a: number; y: number; s: number; drop: number }[] = [];
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2 + 0.08;
      const front = Math.cos(a) > -0.15;
      if (!front && k % 2 === 1) continue;
      list.push({ a, y: 1.92, s: 0.85 + (k % 3) * 0.12, drop: front ? 1 : 0.78 });
    }
    return list;
  }, []);

  useLayoutEffect(() => {
    const place = (mesh: THREE.InstancedMesh | null, yOff: number, sMul: number) => {
      if (!mesh) return;
      vines.forEach((v, k) => {
        const r = 1.52;
        tmp.position.set(Math.sin(v.a) * r, v.y + yOff, Math.cos(v.a) * r);
        tmp.rotation.set(0.18, v.a, 0.08);
        tmp.scale.set(v.s, v.s * v.drop * sMul, v.s);
        tmp.updateMatrix();
        mesh.setMatrixAt(k, tmp.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    };
    place(vineRef.current, 0, 1);
    place(bloomRef.current, 0.02, 1);
    place(deepRef.current, -0.06, 0.92);
  }, [vines]);

  const colH = 1.52;
  const deck = gazebo.deckH;

  return (
    <group position={[gazebo.x, LEVEL, gazebo.z]} rotation={[0, gazebo.facing, 0]}>
      <mesh position={[0, deck / 2, 0]} material={toon(CREAM)} castShadow receiveShadow>
        <cylinderGeometry args={[gazebo.platformR, gazebo.platformR, deck, 20]} />
      </mesh>
      <mesh position={[0, deck + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} material={toon(CREAM_RIM, { noOcclude: true })} receiveShadow>
        <circleGeometry args={[gazebo.platformR - 0.04, 20]} />
      </mesh>
      <mesh position={[0, gazebo.steps[0].h / 2, 0]} geometry={midStepGeo} material={toon(CREAM)} receiveShadow castShadow />
      <mesh position={[0, gazebo.steps[1].h / 2, 0]} geometry={lowStepGeo} material={toon(CREAM)} receiveShadow castShadow />
      {gazebo.columns.map((_, k) => {
        const a = Math.PI / 6 + (k * Math.PI) / 3;
        const x = Math.sin(a) * gazebo.columnRing;
        const z = Math.cos(a) * gazebo.columnRing;
        return (
          <group key={k} position={[x, deck, z]}>
            <mesh position={[0, 0.05, 0]} material={toon(CREAM_RIM)} castShadow>
              <cylinderGeometry args={[0.16, 0.16, 0.1, 8]} />
            </mesh>
            <mesh position={[0, colH / 2, 0]} material={toon(CREAM)} castShadow>
              <cylinderGeometry args={[0.11, 0.125, colH, 8]} />
            </mesh>
            <mesh position={[0, colH + 0.05, 0]} material={toon(CREAM_RIM)} castShadow>
              <cylinderGeometry args={[0.17, 0.14, 0.1, 8]} />
            </mesh>
          </group>
        );
      })}
      <mesh position={[0, deck + colH + 0.1, 0]} material={toon(ROOF_LIP)} castShadow>
        <cylinderGeometry args={[1.68, 1.68, 0.1, 8]} />
      </mesh>
      <mesh position={[0, deck + colH + 0.58, 0]} material={toon(ROOF, { flatShading: true })} castShadow>
        <cylinderGeometry args={[0.08, 1.64, 0.92, 8]} />
      </mesh>
      <mesh position={[0, deck + colH + 1.08, 0]} material={toon(GOLD, { emissive: "#C9A227" })} castShadow>
        <sphereGeometry args={[0.08, 8, 6]} />
      </mesh>
      <mesh position={[0, deck + colH + 1.2, 0]} material={toon(GOLD, { emissive: "#C9A227" })}>
        <coneGeometry args={[0.045, 0.16, 6]} />
      </mesh>
      <instancedMesh ref={vineRef} args={[vineGeo, toon(VINE, { flatShading: true }), vines.length]} />
      <instancedMesh ref={bloomRef} args={[clusterGeo, toon(WISTERIA, { flatShading: true }), vines.length]} />
      <instancedMesh ref={deepRef} args={[clusterGeo, toon(WISTERIA_DEEP, { flatShading: true }), vines.length]} />
    </group>
  );
}
