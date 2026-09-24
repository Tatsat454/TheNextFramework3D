"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { getItem } from "@/content/landmarks";
import { flowers, rocks, trees, tufts, type TreeSpot } from "@/game/island";
import { palette, toon } from "@/game/materials";
import { player, reducedMotion } from "@/game/player-state";
import { useGame } from "@/game/store";

const tmp = new THREE.Object3D();
const col = new THREE.Color();

type Part = { geo: THREE.BufferGeometry; mat: THREE.Material; shadow?: boolean };

/** One InstancedMesh per part, all sharing the same per-tree transforms. */
function InstancedTrees({ spots, parts }: { spots: TreeSpot[]; parts: Part[] }) {
  const refs = useRef<(THREE.InstancedMesh | null)[]>([]);
  useLayoutEffect(() => {
    for (const mesh of refs.current) {
      if (!mesh) continue;
      spots.forEach((t, k) => {
        tmp.position.set(t.x, t.y, t.z);
        tmp.rotation.set(0, t.seed * Math.PI * 2, 0);
        tmp.scale.setScalar(t.s);
        tmp.updateMatrix();
        mesh.setMatrixAt(k, tmp.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    }
  }, [spots]);
  if (!spots.length) return null;
  return (
    <group>
      {parts.map((p, k) => (
        <instancedMesh
          key={k}
          ref={(m) => {
            refs.current[k] = m;
          }}
          args={[p.geo, p.mat, spots.length]}
          castShadow={p.shadow ?? true}
          receiveShadow
        />
      ))}
    </group>
  );
}

const blob = (r: number, x: number, y: number, z: number) => new THREE.IcosahedronGeometry(r, 1).translate(x, y, z);

function useTreeParts() {
  return useMemo(() => {
    const trunk = new THREE.CylinderGeometry(0.13, 0.18, 0.9, 7).translate(0, 0.45, 0);
    const pineTrunk = new THREE.CylinderGeometry(0.1, 0.14, 0.5, 6).translate(0, 0.25, 0);
    const pineLayers = mergeGeometries([
      new THREE.ConeGeometry(0.72, 1.0, 8).translate(0, 0.85, 0),
      new THREE.ConeGeometry(0.58, 0.9, 8).translate(0, 1.4, 0),
      new THREE.ConeGeometry(0.4, 0.8, 8).translate(0, 1.9, 0),
    ]);
    const roundFoliage = mergeGeometries([blob(0.7, 0, 1.4, 0), blob(0.54, 0.42, 1.14, 0.2), blob(0.5, -0.38, 1.2, -0.18), blob(0.46, 0.05, 1.88, -0.05), blob(0.4, 0.1, 1.2, 0.45)]);
    const foliage = toon(palette.foliage, { flatShading: true, sway: true });
    const blossom = toon(palette.blossom, { flatShading: true, sway: true });
    const wood = toon(palette.wood);
    const pine = toon(palette.pine, { flatShading: true, sway: true });
    return {
      pine: [
        { geo: pineTrunk, mat: toon(palette.woodDeep) },
        { geo: pineLayers, mat: pine },
      ],
      round: [
        { geo: trunk, mat: wood },
        { geo: roundFoliage, mat: foliage },
      ],
      blossom: [
        { geo: trunk, mat: wood },
        { geo: roundFoliage, mat: blossom },
      ],
    };
  }, []);
}

function FruitTree({ tree, index }: { tree: TreeSpot; index: number }) {
  const group = useRef<THREE.Group>(null);
  const shakeAt = useGame((s) => s.shakes[String(index)] ?? 0);
  const collected = useGame((s) => (tree.item ? !!s.collected[`fruit-${tree.item}`] : true));
  const dropped = useGame((s) => (tree.item ? s.drops.some((d) => d.id === `fruit-${tree.item}`) : true));
  const parts = useMemo(() => {
    const foliage = mergeGeometries([blob(0.66, 0, 1.4, 0), blob(0.5, 0.4, 1.15, 0.2), blob(0.46, -0.36, 1.2, -0.18), blob(0.42, 0.05, 1.85, -0.05)]);
    return { trunk: new THREE.CylinderGeometry(0.14, 0.19, 0.95, 7).translate(0, 0.47, 0), foliage };
  }, []);
  const fruitColor = tree.item ? getItem(tree.item).color : palette.orange;

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const t = (performance.now() - shakeAt) / 1000;
    const amp = shakeAt && t < 0.9 && !reducedMotion.value ? (1 - t / 0.9) * 0.09 : 0;
    g.rotation.z = Math.sin(t * 38) * amp;
    g.rotation.x = Math.cos(t * 31) * amp * 0.6;
    if (!reducedMotion.value) g.children[1].rotation.y = Math.sin(state.clock.elapsedTime * 0.8 + index) * 0.02;
  });

  return (
    <group position={[tree.x, tree.y, tree.z]} scale={tree.s}>
      <group ref={group}>
        <mesh geometry={parts.trunk} material={toon(palette.wood)} castShadow />
        <group>
          <mesh geometry={parts.foliage} material={toon(palette.foliage, { flatShading: true })} castShadow receiveShadow />
          {!collected && !dropped && (
            <>
              <mesh position={[0.55, 1.25, 0.42]} material={toon(fruitColor)} castShadow>
                <sphereGeometry args={[0.13, 12, 10]} />
              </mesh>
              <mesh position={[-0.42, 1.5, 0.5]} material={toon(fruitColor)}>
                <sphereGeometry args={[0.11, 12, 10]} />
              </mesh>
              <mesh position={[0.1, 1.05, 0.62]} material={toon(fruitColor)}>
                <sphereGeometry args={[0.12, 12, 10]} />
              </mesh>
            </>
          )}
        </group>
      </group>
    </group>
  );
}

/** Tufts and flowers lean away from the player when brushed. */
function useBrushable(ref: React.RefObject<THREE.InstancedMesh | null>, spots: typeof tufts, strength: number, lift = 0) {
  const tiltRef = useRef<Float32Array>(new Float32Array(0));
  const compose = (mesh: THREE.InstancedMesh, k: number, amount: number, dx: number, dz: number) => {
    const s = spots[k];
    tmp.position.set(s.x, s.y + lift, s.z);
    const len = Math.hypot(dx, dz) || 1;
    tmp.quaternion.setFromAxisAngle(new THREE.Vector3(dz / len, 0, -dx / len), amount);
    tmp.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), s.r));
    tmp.scale.setScalar(s.s);
    tmp.updateMatrix();
    mesh.setMatrixAt(k, tmp.matrix);
  };
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    spots.forEach((s, k) => {
      compose(mesh, k, 0, 1, 0);
      if (mesh.instanceColor || s.c >= 0) {
        const accents = [palette.orange, palette.sun, palette.violet, palette.blossom];
        mesh.setColorAt(k, col.set(accents[s.c % 4]));
      }
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, spots]);
  useFrame(() => {
    const mesh = ref.current;
    if (!mesh || reducedMotion.value) return;
    if (tiltRef.current.length !== spots.length) tiltRef.current = new Float32Array(spots.length);
    const tilt = tiltRef.current;
    let dirty = false;
    for (let k = 0; k < spots.length; k++) {
      const s = spots[k];
      const dx = s.x - player.x;
      const dz = s.z - player.z;
      if (Math.abs(dx) > 1.6 && Math.abs(dz) > 1.6 && tilt[k] === 0) continue;
      const d = Math.hypot(dx, dz);
      const target = d < 0.75 && Math.abs(s.y - player.y) < 0.4 ? (1 - d / 0.75) * strength : 0;
      const next = tilt[k] + (target - tilt[k]) * 0.2;
      if (Math.abs(next - tilt[k]) < 0.0005 && target === 0) {
        if (tilt[k] !== 0) {
          tilt[k] = 0;
          compose(mesh, k, 0, dx, dz);
          dirty = true;
        }
        continue;
      }
      tilt[k] = next;
      compose(mesh, k, next, dx, dz);
      dirty = true;
    }
    if (dirty) mesh.instanceMatrix.needsUpdate = true;
  });
}

function Ground() {
  const tuftGeo = useMemo(
    () =>
      mergeGeometries([
        new THREE.ConeGeometry(0.05, 0.3, 4).rotateZ(0.25).translate(-0.05, 0.13, 0),
        new THREE.ConeGeometry(0.05, 0.36, 4).translate(0, 0.16, 0.02),
        new THREE.ConeGeometry(0.05, 0.28, 4).rotateZ(-0.3).translate(0.06, 0.12, -0.02),
      ]),
    [],
  );
  const stemGeo = useMemo(() => new THREE.CylinderGeometry(0.018, 0.018, 0.3, 4).translate(0, 0.15, 0), []);
  const headGeo = useMemo(
    () =>
      mergeGeometries([
        new THREE.IcosahedronGeometry(0.075, 0).translate(0, 0.33, 0),
        new THREE.IcosahedronGeometry(0.045, 0).translate(0, 0.35, 0.05),
      ]),
    [],
  );
  const rockGeo = useMemo(() => new THREE.IcosahedronGeometry(0.5, 0).scale(1, 0.6, 0.85), []);
  const tuftRef = useRef<THREE.InstancedMesh>(null);
  const stemRef = useRef<THREE.InstancedMesh>(null);
  const headRef = useRef<THREE.InstancedMesh>(null);
  const rockRef = useRef<THREE.InstancedMesh>(null);

  const tuftSpots = useMemo(() => tufts.map((t) => ({ ...t, c: -1 })), []);
  const stemSpots = useMemo(() => flowers.map((f) => ({ ...f, c: -1 })), []);
  useBrushable(tuftRef, tuftSpots, 0.9);
  useBrushable(stemRef, stemSpots, 0.7);
  useBrushable(headRef, flowers, 0.7);

  useLayoutEffect(() => {
    const mesh = rockRef.current;
    if (!mesh) return;
    rocks.forEach((r, k) => {
      tmp.position.set(r.x, r.y + r.s * 0.18, r.z);
      tmp.quaternion.setFromEuler(new THREE.Euler(0, r.r, 0));
      tmp.scale.setScalar(r.s);
      tmp.updateMatrix();
      mesh.setMatrixAt(k, tmp.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, []);

  return (
    <group>
      <instancedMesh ref={tuftRef} args={[tuftGeo, toon(palette.foliage), tufts.length]} />
      <instancedMesh ref={stemRef} args={[stemGeo, toon(palette.foliageDeep), flowers.length]} />
      <instancedMesh ref={headRef} args={[headGeo, toon("#FFFFFF", { flatShading: true }), flowers.length]} />
      <instancedMesh ref={rockRef} args={[rockGeo, toon(palette.rock, { flatShading: true }), rocks.length]} castShadow receiveShadow />
    </group>
  );
}

export function Nature() {
  const parts = useTreeParts();
  const groups = useMemo(
    () => ({
      pine: trees.filter((t) => t.kind === "pine"),
      round: trees.filter((t) => t.kind === "round"),
      blossom: trees.filter((t) => t.kind === "blossom"),
    }),
    [],
  );
  return (
    <group>
      <InstancedTrees spots={groups.pine} parts={parts.pine} />
      <InstancedTrees spots={groups.round} parts={parts.round} />
      <InstancedTrees spots={groups.blossom} parts={parts.blossom} />
      {trees.map((t, k) => (t.kind === "fruit" ? <FruitTree key={k} tree={t} index={k} /> : null))}
      <Ground />
    </group>
  );
}
