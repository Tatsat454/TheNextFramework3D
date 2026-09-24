"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { flowers, gardenRows, LEVEL, pond, tileCenter, trees, WATER_Y, W } from "@/game/island";
import { flat, palette, toon } from "@/game/materials";
import { player, reducedMotion } from "@/game/player-state";
import { mulberry32 } from "@/game/rng";
import { useGame } from "@/game/store";

const rand = mulberry32(99);

function Butterflies() {
  const colors = [palette.blossom, palette.sun, palette.lavender, palette.orange, "#FFFFFF", palette.blossom];
  const data = useMemo(
    () =>
      colors.map((c, k) => {
        const f = flowers[Math.floor(rand() * flowers.length)];
        return { c, hx: f.x, hz: f.z, hy: f.y, x: f.x, z: f.z, y: f.y + 0.8, flee: 0, seed: k * 3.1 };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const refs = useRef<(THREE.Group | null)[]>([]);
  useFrame((st, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20);
    const t = st.clock.elapsedTime;
    data.forEach((b, k) => {
      const g = refs.current[k];
      if (!g) return;
      const dx = b.x - player.x;
      const dz = b.z - player.z;
      const d = Math.hypot(dx, dz);
      if (d < 1.8) b.flee = 1;
      b.flee = Math.max(0, b.flee - dt * 0.35);
      const wx = b.hx + Math.sin(t * 0.4 + b.seed) * 1.6;
      const wz = b.hz + Math.cos(t * 0.33 + b.seed * 1.7) * 1.4;
      let tx = wx;
      let tz = wz;
      if (b.flee > 0 && d > 0.01) {
        tx = b.x + (dx / d) * 3;
        tz = b.z + (dz / d) * 3;
      }
      b.x += (tx - b.x) * dt * (0.6 + b.flee * 2);
      b.z += (tz - b.z) * dt * (0.6 + b.flee * 2);
      b.y += (b.hy + 0.7 + b.flee * 1.4 + Math.sin(t * 2 + b.seed) * 0.2 - b.y) * dt * 2;
      g.position.set(b.x, b.y, b.z);
      g.rotation.y = Math.atan2(tx - b.x, tz - b.z);
      const flap = reducedMotion.value ? 0.5 : Math.sin(t * (16 + b.flee * 10) + b.seed) * 0.9;
      (g.children[0] as THREE.Object3D).rotation.z = flap;
      (g.children[1] as THREE.Object3D).rotation.z = -flap;
    });
  });
  return (
    <group>
      {data.map((b, k) => (
        <group key={k} ref={(g) => { refs.current[k] = g; }}>
          <group>
            <mesh position={[0.07, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} material={toon(b.c, { side: THREE.DoubleSide })}>
              <circleGeometry args={[0.07, 8]} />
            </mesh>
          </group>
          <group>
            <mesh position={[-0.07, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} material={toon(b.c, { side: THREE.DoubleSide })}>
              <circleGeometry args={[0.07, 8]} />
            </mesh>
          </group>
          <mesh material={toon(palette.ink)}>
            <capsuleGeometry args={[0.012, 0.06, 2, 4]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Petals() {
  const blossoms = useMemo(() => trees.filter((t) => t.kind === "blossom"), []);
  const count = blossoms.length * 10;
  const ref = useRef<THREE.InstancedMesh>(null);
  const state = useMemo(
    () =>
      Array.from({ length: count }).map((_, k) => {
        const tree = blossoms[k % blossoms.length];
        return { tree, t: rand() * 5, ox: (rand() - 0.5) * 1.4, oz: (rand() - 0.5) * 1.4, spin: rand() * 6 };
      }),
    [blossoms, count],
  );
  const tmp = useMemo(() => new THREE.Object3D(), []);
  useFrame((_, rawDt) => {
    const mesh = ref.current;
    if (!mesh) return;
    const dt = Math.min(rawDt, 1 / 20);
    state.forEach((p, k) => {
      if (!reducedMotion.value) p.t += dt;
      const life = p.t % 5;
      const y = p.tree.y + 1.9 - life * 0.42;
      const drift = Math.sin(p.t * 1.7 + p.spin) * 0.3;
      tmp.position.set(p.tree.x + p.ox + drift + life * 0.2, Math.max(p.tree.y + 0.03, y), p.tree.z + p.oz + life * 0.08);
      tmp.rotation.set(p.t * 2 + p.spin, p.t + p.spin, 0);
      const s = y < p.tree.y + 0.05 ? Math.max(0, 1 - (life - 4.4) * 2) : 1;
      tmp.scale.setScalar(s);
      tmp.updateMatrix();
      mesh.setMatrixAt(k, tmp.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });
  if (!count) return null;
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false} material={toon(palette.blossom, { side: THREE.DoubleSide })}>
      <circleGeometry args={[0.05, 5]} />
    </instancedMesh>
  );
}

function Bees() {
  const bees = useMemo(() => [0, 1, 2, 3].map((k) => ({ f: flowers[(k * 37 + 11) % flowers.length], seed: k * 2.3 })), []);
  const refs = useRef<(THREE.Group | null)[]>([]);
  useFrame((st) => {
    const t = st.clock.elapsedTime;
    bees.forEach((b, k) => {
      const g = refs.current[k];
      if (!g) return;
      const r = 0.45 + Math.sin(t * 0.7 + b.seed) * 0.15;
      g.position.set(b.f.x + Math.cos(t * 1.8 + b.seed) * r, b.f.y + 0.55 + Math.sin(t * 4 + b.seed) * 0.08, b.f.z + Math.sin(t * 1.8 + b.seed) * r);
      g.rotation.y = -t * 1.8 - b.seed;
    });
  });
  return (
    <group>
      {bees.map((_, k) => (
        <group key={k} ref={(g) => { refs.current[k] = g; }}>
          <mesh scale={[1, 0.85, 1.25]} material={toon(palette.sun)}>
            <sphereGeometry args={[0.045, 8, 6]} />
          </mesh>
          <mesh scale={[1.05, 0.9, 0.35]} material={toon(palette.ink)}>
            <sphereGeometry args={[0.045, 8, 6]} />
          </mesh>
          <mesh position={[0, 0.05, 0]} material={flat("#FFFFFF", 0.7)}>
            <sphereGeometry args={[0.028, 6, 4]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function FishShadows() {
  const fish = useMemo(() => {
    const p = tileCenter(Math.floor(pond.x), Math.floor(pond.z));
    return [
      { cx: p.x - 1.6, cz: p.z + 0.4, r: 3.6 },
      { cx: p.x + 1.8, cz: p.z - 0.6, r: 3.1 },
      { cx: p.x + 0.2, cz: p.z + 1.8, r: 2.6 },
    ].map((f, k) => ({ ...f, seed: k * 1.9, speed: 0.28 + k * 0.05 }));
  }, []);
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame((st) => {
    const t = st.clock.elapsedTime;
    fish.forEach((f, k) => {
      const m = refs.current[k];
      if (!m) return;
      const a = t * f.speed + f.seed;
      const wobble = Math.sin(t * 0.9 + f.seed) * 0.3;
      m.position.set(f.cx + Math.cos(a) * f.r, WATER_Y + 0.02, f.cz + Math.sin(a) * (f.r * 0.6 + wobble));
      m.rotation.z = -a - Math.PI / 2;
    });
  });
  return (
    <group>
      {fish.map((_, k) => (
        <mesh key={k} ref={(m) => { refs.current[k] = m; }} rotation={[-Math.PI / 2, 0, 0]} scale={[0.55, 1, 1]} material={flat("#3E5E86", 0.28)}>
          <circleGeometry args={[0.2, 12]} />
        </mesh>
      ))}
    </group>
  );
}

function CloudShadows() {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const grd = g.createRadialGradient(64, 64, 8, 64, 64, 62);
    grd.addColorStop(0, "rgba(40,30,90,0.55)");
    grd.addColorStop(1, "rgba(40,30,90,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c);
    return t;
  }, []);
  const clouds = useMemo(() => [0, 1, 2].map((k) => ({ z: -12 + k * 12, s: 7 + k * 2, speed: 0.5 + k * 0.15, off: k * 17 })), []);
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame((st) => {
    const t = st.clock.elapsedTime;
    clouds.forEach((c, k) => {
      const m = refs.current[k];
      if (!m) return;
      const span = W + 20;
      const x = ((t * c.speed + c.off) % span) - span / 2;
      m.position.set(x, 2.2 * LEVEL, c.z + Math.sin(t * 0.05 + k) * 2);
    });
  });
  return (
    <group>
      {clouds.map((c, k) => (
        <mesh key={k} ref={(m) => { refs.current[k] = m; }} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
          <planeGeometry args={[c.s, c.s * 0.6]} />
          <meshBasicMaterial map={tex} transparent opacity={0.14} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function Sparkles() {
  const waterAt = useGame((s) => s.waterAt);
  const ref = useRef<THREE.InstancedMesh>(null);
  const tmp = useMemo(() => new THREE.Object3D(), []);
  const seeds = useMemo(() => Array.from({ length: 18 }).map(() => ({ a: rand() * Math.PI * 2, r: rand() * 0.4 + 0.1, v: rand() * 0.8 + 0.6, z: rand() })), []);
  useFrame(() => {
    const mesh = ref.current;
    if (!mesh) return;
    if (!waterAt) {
      mesh.visible = false;
      return;
    }
    const row = gardenRows.find((r) => r.skillId === waterAt.id);
    const k = (performance.now() - waterAt.at) / 1000;
    if (!row || k > 1.6) {
      mesh.visible = false;
      return;
    }
    mesh.visible = true;
    seeds.forEach((s, i) => {
      const zz = row.z0 + s.z * (row.z1 - row.z0);
      tmp.position.set(row.x + Math.cos(s.a) * s.r, row.level * LEVEL + 0.3 + k * s.v, zz + Math.sin(s.a) * s.r * 0.4);
      tmp.scale.setScalar(Math.max(0, 1 - k / 1.6));
      tmp.rotation.set(k * 3, k * 2, 0);
      tmp.updateMatrix();
      mesh.setMatrixAt(i, tmp.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, seeds.length]} frustumCulled={false} material={flat(palette.glow, 0.95, true)}>
      <octahedronGeometry args={[0.07, 0]} />
    </instancedMesh>
  );
}

export function Ambient() {
  return (
    <group>
      <Butterflies />
      <Petals />
      <Bees />
      <FishShadows />
      <CloudShadows />
      <Sparkles />
    </group>
  );
}

