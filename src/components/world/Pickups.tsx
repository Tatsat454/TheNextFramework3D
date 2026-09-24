"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { getItem, type ItemId } from "@/content/landmarks";
import { pickups } from "@/game/island";
import { flat, palette, toon } from "@/game/materials";
import { reducedMotion } from "@/game/player-state";
import { useGame } from "@/game/store";

function ItemModel({ item }: { item: ItemId }) {
  const it = getItem(item);
  if (it.kind === "shell") {
    return (
      <group scale={0.9}>
        <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2 + 0.3, 0, 0]} scale={[1, 1, 0.45]} material={toon(it.color)} castShadow>
          <coneGeometry args={[0.13, 0.22, 10]} />
        </mesh>
        <mesh position={[0, 0.05, -0.06]} scale={[1, 0.5, 1]} material={toon(palette.cream)}>
          <sphereGeometry args={[0.07, 10, 8]} />
        </mesh>
      </group>
    );
  }
  if (it.kind === "fruit") {
    return (
      <group>
        <mesh position={[0, 0.13, 0]} material={toon(it.color)} castShadow>
          <sphereGeometry args={[0.14, 14, 12]} />
        </mesh>
        <mesh position={[0.02, 0.29, 0]} rotation={[0, 0, -0.5]} scale={[1.6, 0.4, 0.9]} material={toon(palette.foliage)}>
          <sphereGeometry args={[0.05, 8, 6]} />
        </mesh>
      </group>
    );
  }
  return (
    <group>
      <mesh position={[0, 0.16, 0]} material={toon(it.color, { emissive: it.color === palette.ink ? undefined : it.color })} castShadow>
        <octahedronGeometry args={[0.12, 0]} />
      </mesh>
    </group>
  );
}

function Pickup({ id, item, x, y, z, droppedAt, fromY }: { id: string; item: ItemId; x: number; y: number; z: number; droppedAt?: number; fromY?: number }) {
  const ref = useRef<THREE.Group>(null);
  const glint = useRef<THREE.Mesh>(null);
  const hidden = getItem(item).kind === "hidden";
  const seed = useRef(Math.random() * 10);
  useFrame((state) => {
    const g = ref.current;
    if (!g) return;
    const t = state.clock.elapsedTime + seed.current;
    let py = y;
    if (droppedAt) {
      const k = (performance.now() - droppedAt) / 1000;
      if (k < 0.9 && !reducedMotion.value) {
        const fall = Math.max(0, (fromY ?? 1.2) * (1 - (k / 0.45) ** 2));
        const bounce = k > 0.45 ? Math.abs(Math.sin(((k - 0.45) / 0.45) * Math.PI)) * 0.18 * (1 - (k - 0.45) / 0.45) : 0;
        py = y + fall + bounce;
      }
    }
    g.position.set(x, py, z);
    if (!reducedMotion.value) {
      g.rotation.y = hidden ? t * 1.5 : Math.sin(t) * 0.2;
      if (hidden) g.position.y += 0.08 + Math.sin(t * 2.4) * 0.05;
    }
    if (glint.current) {
      const s = Math.max(0, Math.sin(t * 2.2)) ** 6;
      glint.current.scale.setScalar(0.3 + s);
      glint.current.visible = s > 0.02;
    }
  });
  const collected = useGame((s) => !!s.collected[id]);
  if (collected) return null;
  return (
    <group ref={ref}>
      <ItemModel item={item} />
      <mesh ref={glint} position={[0.08, hidden ? 0.36 : 0.26, 0]} material={flat(palette.glow, 0.95, true)}>
        <octahedronGeometry args={[0.06, 0]} />
      </mesh>
    </group>
  );
}

export function Pickups() {
  const drops = useGame((s) => s.drops);
  return (
    <group>
      {pickups.map((p) => (
        <Pickup key={p.id} id={p.id} item={p.item} x={p.x} y={p.y} z={p.z} />
      ))}
      {drops.map((d) => (
        <Pickup key={d.id} id={d.id} item={d.item} x={d.x} y={d.y} z={d.z} droppedAt={d.at} fromY={1.2} />
      ))}
    </group>
  );
}
