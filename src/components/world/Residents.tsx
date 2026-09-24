"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import type { ResidentId } from "@/content/landmarks";
import { residents } from "@/content/landmarks";
import { residentSpots } from "@/game/interact";
import { heightAt, residentHomes } from "@/game/island";
import { flat, palette, toon } from "@/game/materials";
import { player, reducedMotion } from "@/game/player-state";
import { useGame } from "@/game/store";

function Eyes({ y, z, spread = 0.09, size = 1 }: { y: number; z: number; spread?: number; size?: number }) {
  return (
    <group position={[0, y, z]} name="eyes">
      {[-1, 1].map((s) => (
        <group key={s} position={[s * spread, 0, 0]}>
          <mesh scale={[0.8 * size, 1.15 * size, 0.5]} material={toon(palette.ink)}>
            <sphereGeometry args={[0.038, 10, 8]} />
          </mesh>
          <mesh position={[0.01, 0.016, 0.018]} material={flat("#FFFFFF")}>
            <sphereGeometry args={[0.011 * size, 6, 6]} />
          </mesh>
        </group>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={`c${s}`} position={[s * (spread + 0.06), -0.05, -0.01]} scale={[1, 0.6, 0.4]} material={flat("#FF9E9E", 0.5)}>
          <sphereGeometry args={[0.035, 8, 6]} />
        </mesh>
      ))}
    </group>
  );
}

function Feet({ color, y = 0.04, spread = 0.1 }: { color: string; y?: number; spread?: number }) {
  return (
    <group name="feet">
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * spread, y, 0.04]} scale={[1, 0.7, 1.3]} material={toon(color)} castShadow>
          <sphereGeometry args={[0.05, 8, 6]} />
        </mesh>
      ))}
    </group>
  );
}

function Bramble() {
  return (
    <group>
      <Feet color="#5FAE82" />
      <mesh position={[0, 0.27, 0]} scale={[1, 0.8, 0.95]} material={toon("#8FD1A4")} castShadow>
        <sphereGeometry args={[0.3, 18, 14]} />
      </mesh>
      {[[-0.14, 0.46, 0.1], [0.12, 0.49, -0.05], [0.02, 0.5, 0.14], [-0.05, 0.44, -0.18]].map((p, k) => (
        <mesh key={k} position={p as [number, number, number]} material={toon(palette.foliage, { flatShading: true })}>
          <icosahedronGeometry args={[0.09, 0]} />
        </mesh>
      ))}
      <Eyes y={0.3} z={0.27} />
    </group>
  );
}

function Drizzle() {
  return (
    <group>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.07, 0.1, 0]} material={toon(palette.lavender)}>
          <capsuleGeometry args={[0.025, 0.12, 3, 6]} />
        </mesh>
      ))}
      <Feet color={palette.lavender} y={0.03} spread={0.07} />
      <group position={[0, 0.36, 0]} name="float">
        {[[0, 0, 0, 0.2], [-0.17, -0.04, 0, 0.14], [0.17, -0.03, 0, 0.15], [0.05, 0.12, -0.03, 0.14], [-0.08, 0.1, 0.02, 0.12]].map(([x, y, z, r], k) => (
          <mesh key={k} position={[x, y, z]} material={toon("#FFFFFF")} castShadow>
            <sphereGeometry args={[r, 14, 10]} />
          </mesh>
        ))}
        <Eyes y={0} z={0.19} spread={0.07} />
      </group>
    </group>
  );
}

function Pip() {
  return (
    <group>
      <Feet color="#A9A2C2" spread={0.08} />
      <mesh position={[0, 0.2, 0]} scale={[1, 0.78, 0.9]} material={toon(palette.rock)} castShadow>
        <sphereGeometry args={[0.24, 16, 12]} />
      </mesh>
      <group position={[0, 0.38, 0]}>
        <mesh position={[0, 0.06, 0]} material={toon(palette.foliageDeep)}>
          <cylinderGeometry args={[0.012, 0.015, 0.12, 5]} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.07, 0.13, 0]} rotation={[0, 0, s * -0.8]} scale={[1.6, 0.35, 0.9]} material={toon(palette.foliage)}>
            <sphereGeometry args={[0.05, 8, 6]} />
          </mesh>
        ))}
      </group>
      <Eyes y={0.22} z={0.2} spread={0.07} size={0.9} />
    </group>
  );
}

function Sol() {
  return (
    <group>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.07, 0.03, 0.06]} rotation={[Math.PI / 2, 0, 0]} material={toon(palette.orange)}>
          <coneGeometry args={[0.045, 0.1, 6]} />
        </mesh>
      ))}
      <mesh position={[0, 0.27, 0]} material={toon(palette.sun)} castShadow>
        <sphereGeometry args={[0.25, 18, 14]} />
      </mesh>
      <mesh position={[0, 0.22, 0.12]} scale={[1, 0.9, 0.6]} material={toon("#FFE7A8")}>
        <sphereGeometry args={[0.16, 14, 10]} />
      </mesh>
      <mesh position={[0, 0.27, 0.26]} rotation={[Math.PI / 2, 0, 0]} material={toon(palette.orange)}>
        <coneGeometry args={[0.04, 0.09, 8]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.24, 0.25, -0.02]} rotation={[0, 0, s * 0.6]} scale={[0.4, 1, 0.8]} material={toon("#F2B53C")} name={s < 0 ? "wingL" : "wingR"}>
          <sphereGeometry args={[0.12, 10, 8]} />
        </mesh>
      ))}
      {[-0.3, 0, 0.3].map((r) => (
        <mesh key={r} position={[r * 0.1, 0.53, -0.02]} rotation={[0, 0, r]} material={toon(palette.orange)}>
          <coneGeometry args={[0.03, 0.12, 5]} />
        </mesh>
      ))}
      <Eyes y={0.33} z={0.22} spread={0.08} />
    </group>
  );
}

const bodies: Record<ResidentId, () => React.JSX.Element> = { bramble: Bramble, drizzle: Drizzle, pip: Pip, sol: Sol };

function Resident({ id }: { id: ResidentId }) {
  const homes = residentHomes[id];
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const st = useRef({ x: homes[0].x, z: homes[0].z, y: heightAt(homes[0].x, homes[0].z), target: 1, wait: 1.5, facing: 0, phase: homes[0].x * 1.7 + homes[0].z, blinkAt: 2 + (homes[0].x % 2) });
  const arrivalAt = useGame((s) => s.arrivalAt[id] ?? 0);
  const talking = useGame((s) => s.dialog?.speaker === id);
  const Body = bodies[id];

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20);
    const g = group.current;
    if (!g) return;
    const s = st.current;
    const t = state.clock.elapsedTime;
    const dPlayer = Math.hypot(player.x - s.x, player.z - s.z);
    let moving = false;
    if (talking || dPlayer < 2.2) {
      const face = Math.atan2(player.x - s.x, player.z - s.z);
      s.facing += (((face - s.facing + Math.PI * 3) % (Math.PI * 2)) - Math.PI) * 0.12;
    } else if (s.wait > 0) {
      s.wait -= dt;
      if (s.wait < 1.2 && !reducedMotion.value) s.facing += Math.sin(t * 1.5) * 0.01;
    } else {
      const goal = homes[s.target];
      const dx = goal.x - s.x;
      const dz = goal.z - s.z;
      const d = Math.hypot(dx, dz);
      if (d < 0.1) {
        s.target = (s.target + 1 + Math.floor(Math.random() * (homes.length - 1))) % homes.length;
        s.wait = 2 + Math.random() * 2.5;
      } else {
        const step = Math.min(d, 0.9 * dt);
        s.x += (dx / d) * step;
        s.z += (dz / d) * step;
        const face = Math.atan2(dx, dz);
        s.facing += (((face - s.facing + Math.PI * 3) % (Math.PI * 2)) - Math.PI) * 0.1;
        moving = true;
      }
    }
    s.y += (heightAt(s.x, s.z) - s.y) * 0.2;
    if (moving) s.phase += dt * 9;
    const hop = moving && !reducedMotion.value ? Math.abs(Math.sin(s.phase)) * 0.06 : 0;
    g.position.set(s.x, s.y + hop, s.z);
    g.rotation.y = s.facing;
    residentSpots.set(id, { x: s.x, z: s.z, y: s.y });

    if (inner.current) {
      const since = arrivalAt ? (performance.now() - arrivalAt) / 1000 : 10;
      const pop = since < 0.9 ? 1 - Math.pow(1 - since / 0.9, 3) * Math.cos(since * 9) : 1;
      const breathe = reducedMotion.value ? 1 : 1 + Math.sin(t * 2.4 + s.phase) * 0.025;
      inner.current.scale.set(pop, pop * breathe, pop);
      const eyes = inner.current.getObjectByName("eyes");
      if (eyes) {
        if (t > s.blinkAt) {
          eyes.scale.y = 0.1;
          if (t > s.blinkAt + 0.12) {
            eyes.scale.y = 1;
            s.blinkAt = t + 3 + Math.random() * 2;
          }
        }
      }
      const float = inner.current.getObjectByName("float");
      if (float && !reducedMotion.value) float.position.y = 0.36 + Math.sin(t * 2) * 0.03;
      if (talking && !reducedMotion.value) inner.current.rotation.z = Math.sin(t * 12) * 0.04;
      else inner.current.rotation.z = 0;
    }
  });

  return (
    <group ref={group}>
      <group ref={inner}>
        <Body />
      </group>
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]} material={flat("#3B3470", 0.16)}>
        <circleGeometry args={[0.26, 16]} />
      </mesh>
    </group>
  );
}

export function Residents() {
  const arrived = useGame((s) => s.arrived);
  return (
    <group>
      {residents.map((r) => (arrived[r.id] ? <Resident key={r.id} id={r.id} /> : null))}
    </group>
  );
}
