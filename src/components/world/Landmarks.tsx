"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { skills } from "@/content/landmarks";
import { boardTile, gardenRows, getPlacement, LEVEL, mailboxTile, pedestals, tileCenter } from "@/game/island";
import { palette, toon } from "@/game/materials";
import { reducedMotion } from "@/game/player-state";
import { useGame } from "@/game/store";

type V3 = [number, number, number];

function Box({ p, s, c, r, glow, shadow = true }: { p: V3; s: V3; c: string; r?: V3; glow?: boolean; shadow?: boolean }) {
  return (
    <mesh position={p} rotation={r} material={toon(c, glow ? { emissive: c } : {})} castShadow={shadow} receiveShadow>
      <boxGeometry args={s} />
    </mesh>
  );
}

function Cyl({ p, r, h, c, seg = 12, rot, rt }: { p: V3; r: number; h: number; c: string; seg?: number; rot?: V3; rt?: number }) {
  return (
    <mesh position={p} rotation={rot} material={toon(c)} castShadow receiveShadow>
      <cylinderGeometry args={[rt ?? r, r, h, seg]} />
    </mesh>
  );
}

/** Chunky gable roof: a bevelled triangular prism with the ridge running along z. */
function Roof({ p, w, h, d, c, rotY = 0 }: { p: V3; w: number; h: number; d: number; c: string; rotY?: number }) {
  const geo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-w / 2, 0);
    shape.lineTo(w / 2, 0);
    shape.lineTo(0, h);
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 2 });
    g.translate(0, 0, -d / 2);
    return g;
  }, [w, h, d]);
  return <mesh geometry={geo} position={p} rotation={[0, rotY, 0]} material={toon(c)} castShadow receiveShadow />;
}

function Window({ p, rotY = 0, s = 0.42 }: { p: V3; rotY?: number; s?: number }) {
  return (
    <group position={p} rotation={[0, rotY, 0]}>
      <Box p={[0, 0, 0]} s={[s + 0.12, s + 0.12, 0.08]} c={palette.wood} shadow={false} />
      <Box p={[0, 0, 0.03]} s={[s, s, 0.06]} c="#E4DDFF" glow shadow={false} />
      <Box p={[0, 0, 0.07]} s={[0.04, s, 0.02]} c={palette.wood} shadow={false} />
    </group>
  );
}

function House() {
  const pl = getPlacement("house");
  const mail = tileCenter(mailboxTile.i, mailboxTile.j);
  const [i0, j0, i1, j1] = pl.rect;
  const a = tileCenter(i0, j0);
  const b = tileCenter(i1, j1);
  const y = 0;
  return (
    <group position={[pl.center.x, pl.level * LEVEL, pl.center.z]}>
      <Box p={[0, 0.08, 0]} s={[2.7, 0.16, 2.5]} c={palette.stone} />
      <Box p={[0, 0.9, 0]} s={[2.4, 1.5, 2.2]} c={palette.stone} />
      <Box p={[0, 0.2, 1.12]} s={[2.42, 0.22, 0.04]} c={palette.wood} shadow={false} />
      <Roof p={[0, 1.62, 0]} w={3.1} h={1.35} d={2.6} c={palette.orange} />
      <Box p={[0.75, 2.55, -0.3]} s={[0.36, 0.7, 0.36]} c={palette.earth} />
      <Box p={[0.75, 2.93, -0.3]} s={[0.46, 0.12, 0.46]} c={palette.woodDeep} />
      <group position={[0, 0, 1.11]}>
        <Box p={[0, 0.62, 0]} s={[0.64, 1.0, 0.08]} c={palette.woodDeep} shadow={false} />
        <mesh position={[0, 1.12, 0]} rotation={[Math.PI / 2, 0, 0]} material={toon(palette.woodDeep)}>
          <cylinderGeometry args={[0.32, 0.32, 0.08, 16, 1, false, 0, Math.PI]} />
        </mesh>
        <mesh position={[0.2, 0.62, 0.06]} material={toon(palette.sun)}>
          <sphereGeometry args={[0.04, 8, 8]} />
        </mesh>
      </group>
      <Window p={[-0.78, 0.98, 1.12]} />
      <Window p={[0.78, 0.98, 1.12]} />
      <Window p={[1.21, 0.95, 0]} rotY={Math.PI / 2} />
      <Box p={[0, 0.02, 1.6]} s={[0.9, 0.04, 0.5]} c={palette.coral} shadow={false} />
      <mesh position={[0, 1.55, 1.34]} material={toon(palette.orange)} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
      </mesh>
      <mesh position={[0, 1.55, 1.4]} material={toon("#E4DDFF", { emissive: "#E4DDFF" })} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.04, 16]} />
      </mesh>
      {/* Flower boxes */}
      <Box p={[-0.78, 0.66, 1.2]} s={[0.56, 0.12, 0.14]} c={palette.wood} />
      <Box p={[0.78, 0.66, 1.2]} s={[0.56, 0.12, 0.14]} c={palette.wood} />
      {[-0.95, -0.78, -0.61, 0.61, 0.78, 0.95].map((x, k) => (
        <mesh key={k} position={[x, 0.76, 1.22]} material={toon(k % 2 ? palette.blossom : palette.sun)}>
          <sphereGeometry args={[0.06, 8, 8]} />
        </mesh>
      ))}
      {/* Mailbox with a little flag */}
      <group position={[mail.x - pl.center.x, 0, mail.z - pl.center.z]}>
        <Cyl p={[0, 0.35, 0]} r={0.05} h={0.7} c={palette.woodDeep} />
        <Box p={[0, 0.78, 0]} s={[0.3, 0.26, 0.42]} c={palette.coral} />
        <Box p={[0.17, 0.9, -0.05]} s={[0.03, 0.22, 0.03]} c={palette.woodDeep} shadow={false} />
        <Box p={[0.17, 0.98, 0.03]} s={[0.03, 0.1, 0.14]} c={palette.coral} shadow={false} />
      </group>
      <Fence from={[a.x - pl.center.x - 0.2, b.z - pl.center.z + 1.15]} to={[b.x - pl.center.x + 1.4, b.z - pl.center.z + 1.15]} y={y} />
      <Fence from={[a.x - pl.center.x - 0.2, a.z - pl.center.z - 0.2]} to={[a.x - pl.center.x - 0.2, b.z - pl.center.z + 1.15]} y={y} />
    </group>
  );
}

function Flag({ p, color }: { p: V3; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ref.current && !reducedMotion.value) ref.current.rotation.y = Math.sin(s.clock.elapsedTime * 2.2) * 0.25;
  });
  return (
    <group position={p}>
      <Cyl p={[0, 0.6, 0]} r={0.035} h={1.2} c={palette.cream} />
      <mesh ref={ref} position={[0, 1.02, 0]}>
        <mesh position={[0.28, 0, 0]} material={toon(color)} castShadow>
          <boxGeometry args={[0.56, 0.34, 0.03]} />
        </mesh>
      </mesh>
    </group>
  );
}

function TownHall() {
  const pl = getPlacement("townhall");
  const board = tileCenter(boardTile.i, boardTile.j);
  return (
    <group position={[pl.center.x, pl.level * LEVEL, pl.center.z]}>
      <Box p={[0, 0.1, 0.1]} s={[4.2, 0.2, 3.2]} c={palette.stone} />
      <Box p={[0, 1.1, 0]} s={[3.6, 1.85, 2.6]} c={palette.stone} />
      <Roof p={[0, 2.0, 0]} w={3.4} h={1.25} d={4.2} c={"#9B6AD4"} rotY={Math.PI / 2} />
      <Box p={[0, 2.08, 0]} s={[4.2, 0.14, 3.2]} c={"#7A4CB8"} />
      {/* Portico */}
      <Box p={[0, 2.2, 1.7]} s={[1.8, 0.18, 0.8]} c={palette.stone} />
      <Roof p={[0, 2.28, 1.7]} w={2.0} h={0.55} d={0.9} c={"#9B6AD4"} />
      {[-0.8, 0.8].map((x) => (
        <Cyl key={x} p={[x, 1.22, 2.25]} r={0.12} h={2.1} c={palette.cream} seg={10} />
      ))}
      <Box p={[0, 0.9, 1.52]} s={[0.9, 1.4, 0.08]} c={palette.woodDeep} shadow={false} />
      <Box p={[0, 0.05, 2.1]} s={[1.4, 0.1, 0.5]} c={palette.dirt} />
      <Window p={[-1.45, 1.35, 1.52]} s={0.55} />
      <Window p={[1.45, 1.35, 1.52]} s={0.55} />
      <Window p={[2.11, 1.35, 0]} rotY={Math.PI / 2} s={0.55} />
      <Window p={[-2.11, 1.35, 0]} rotY={-Math.PI / 2} s={0.55} />
      {/* Clock */}
      <mesh position={[0, 2.72, 2.42]} rotation={[Math.PI / 2, 0, 0]} material={toon(palette.sun)}>
        <cylinderGeometry args={[0.24, 0.24, 0.08, 20]} />
      </mesh>
      <Box p={[0, 2.78, 2.47]} s={[0.03, 0.14, 0.02]} c={palette.ink} shadow={false} />
      <Flag p={[0, 3.4, -0.2]} color={palette.indigo} />
      {/* Notice board */}
      <group position={[board.x - pl.center.x, 0, board.z - pl.center.z]} rotation={[0, -0.2, 0]}>
        <Cyl p={[-0.38, 0.5, 0]} r={0.05} h={1.0} c={palette.woodDeep} />
        <Cyl p={[0.38, 0.5, 0]} r={0.05} h={1.0} c={palette.woodDeep} />
        <Box p={[0, 0.85, 0.02]} s={[0.95, 0.62, 0.08]} c={palette.wood} />
        <Box p={[-0.2, 0.9, 0.07]} s={[0.26, 0.3, 0.01]} c={palette.cream} shadow={false} />
        <Box p={[0.16, 0.95, 0.07]} s={[0.22, 0.2, 0.01]} c={palette.sun} shadow={false} />
        <Box p={[0.2, 0.7, 0.07]} s={[0.26, 0.16, 0.01]} c={palette.blossom} shadow={false} />
      </group>
    </group>
  );
}

function Museum() {
  const pl = getPlacement("museum");
  return (
    <group position={[pl.center.x, pl.level * LEVEL, pl.center.z]}>
      <Box p={[0, 0.12, 0.1]} s={[4.1, 0.24, 3.2]} c={palette.earth} />
      <Box p={[0, 0.3, 1.45]} s={[3.2, 0.12, 0.5]} c={palette.cream} />
      <Box p={[0, 1.3, -0.2]} s={[3.7, 2.1, 2.3]} c={palette.earth} />
      {[-1.35, -0.45, 0.45, 1.35].map((x) => (
        <group key={x}>
          <Cyl p={[x, 1.28, 1.15]} r={0.16} h={1.95} c={palette.cream} seg={12} />
          <Box p={[x, 2.28, 1.15]} s={[0.42, 0.12, 0.42]} c={palette.cream} />
          <Box p={[x, 0.33, 1.15]} s={[0.42, 0.1, 0.42]} c={palette.cream} />
        </group>
      ))}
      <Box p={[0, 2.44, 0.35]} s={[4.0, 0.22, 3.2]} c={palette.cream} />
      <Roof p={[0, 2.55, 0.35]} w={3.3} h={1.15} d={4.1} c={palette.violet} rotY={Math.PI / 2} />
      <Box p={[0, 2.56, 0.35]} s={[4.3, 0.1, 3.5]} c={"#6456E0"} />
      {/* Pediment and dome */}
      <mesh position={[0, 3.05, 2.05]} rotation={[Math.PI / 2, 0, 0]} material={toon(palette.sun, { emissive: palette.sun })}>
        <cylinderGeometry args={[0.2, 0.2, 0.06, 5]} />
      </mesh>
      <mesh position={[0, 3.55, -0.3]} material={toon(palette.violet)} castShadow>
        <sphereGeometry args={[0.7, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <Cyl p={[0, 3.52, -0.3]} r={0.72} h={0.12} c={palette.cream} seg={20} />
      <Cyl p={[0, 4.3, -0.3]} r={0.05} h={0.3} c={palette.sun} />
      <Box p={[0, 0.98, 0.93]} s={[0.8, 1.3, 0.06]} c={palette.woodDeep} shadow={false} />
    </group>
  );
}

function Star({ p, s = 1 }: { p: V3; s?: number }) {
  const geo = useMemo(() => {
    const shape = new THREE.Shape();
    for (let k = 0; k < 10; k++) {
      const r = k % 2 ? 0.08 : 0.19;
      const a = (k / 10) * Math.PI * 2 + Math.PI / 2;
      if (k === 0) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    const g = new THREE.ExtrudeGeometry(shape, { depth: 0.06, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 1 });
    g.center();
    return g;
  }, []);
  const ref = useRef<THREE.Mesh>(null);
  useFrame((st) => {
    if (ref.current && !reducedMotion.value) ref.current.rotation.y = st.clock.elapsedTime * 1.5;
  });
  return <mesh ref={ref} geometry={geo} position={p} scale={s} material={toon(palette.sun, { emissive: "#FFB800" })} castShadow />;
}

function ExhibitObject({ slug }: { slug: string }) {
  switch (slug) {
    case "nyc-taxi-ddc":
      return (
        <group>
          <Box p={[0, 0.14, 0]} s={[0.42, 0.18, 0.24]} c={palette.sun} />
          <Box p={[0, 0.28, 0]} s={[0.24, 0.12, 0.22]} c={palette.sun} />
          <Box p={[0, 0.37, 0]} s={[0.1, 0.05, 0.08]} c={palette.ink} />
          {[-0.13, 0.13].map((x) => [-0.12, 0.12].map((z) => <Cyl key={`${x}${z}`} p={[x, 0.05, z]} r={0.05} h={0.04} c={palette.ink} rot={[Math.PI / 2, 0, 0]} />))}
        </group>
      );
    case "pjm-ai-electricity":
      return (
        <group rotation={[0, 0, 0.1]}>
          <Box p={[0.04, 0.34, 0]} s={[0.1, 0.3, 0.1]} c={palette.glow} r={[0, 0, -0.5]} glow />
          <Box p={[-0.03, 0.17, 0]} s={[0.1, 0.28, 0.1]} c={palette.glow} r={[0, 0, 0.5]} glow />
        </group>
      );
    case "startup-failure":
      return (
        <group>
          <Cyl p={[0, 0.25, 0]} r={0.1} h={0.34} c={palette.cream} />
          <mesh position={[0, 0.5, 0]} material={toon(palette.coral)}>
            <coneGeometry args={[0.1, 0.18, 12]} />
          </mesh>
          <Box p={[0, 0.12, 0]} s={[0.3, 0.08, 0.04]} c={palette.coral} />
          <mesh position={[0, 0.04, 0]} material={toon(palette.orange, { emissive: palette.orange })}>
            <coneGeometry args={[0.06, 0.12, 8]} />
          </mesh>
        </group>
      );
    case "home-robot-vlm":
      return (
        <group>
          <Box p={[0, 0.16, 0]} s={[0.28, 0.24, 0.22]} c={palette.cream} />
          <Box p={[0, 0.38, 0]} s={[0.22, 0.16, 0.18]} c={palette.ink} />
          <Box p={[-0.05, 0.39, 0.095]} s={[0.04, 0.04, 0.01]} c={palette.water} glow />
          <Box p={[0.05, 0.39, 0.095]} s={[0.04, 0.04, 0.01]} c={palette.water} glow />
          <Cyl p={[0, 0.5, 0]} r={0.012} h={0.1} c={palette.ink} />
          <mesh position={[0, 0.56, 0]} material={toon(palette.coral)}>
            <sphereGeometry args={[0.03, 8, 8]} />
          </mesh>
        </group>
      );
    case "pokemon-red-agent":
      return (
        <group rotation={[-0.2, 0, 0]}>
          <Box p={[0, 0.25, 0]} s={[0.28, 0.42, 0.08]} c="#D8D2E8" />
          <Box p={[0, 0.33, 0.045]} s={[0.2, 0.15, 0.01]} c={palette.foliage} glow />
          <Box p={[-0.07, 0.15, 0.045]} s={[0.07, 0.02, 0.01]} c={palette.ink} />
          <Box p={[-0.07, 0.15, 0.045]} s={[0.02, 0.07, 0.01]} c={palette.ink} />
          <Cyl p={[0.07, 0.16, 0.045]} r={0.022} h={0.02} c={palette.coral} rot={[Math.PI / 2, 0, 0]} />
        </group>
      );
    default:
      return (
        <group>
          {[0, 1, 2].map((k) => (
            <Box key={k} p={[0, 0.08 + k * 0.05, 0]} s={[0.26, 0.04, 0.34]} r={[0, k * 0.3, 0]} c={[palette.orange, palette.violet, palette.water][k]} />
          ))}
        </group>
      );
  }
}

function Pedestals() {
  const donated = useGame((s) => s.donated);
  return (
    <group>
      {pedestals.map((p) => (
        <group key={p.slug} position={[p.x, p.level * LEVEL, p.z]}>
          <Cyl p={[0, 0.35, 0]} r={0.3} rt={0.26} h={0.7} c={palette.cream} seg={14} />
          <Cyl p={[0, 0.72, 0]} r={0.36} h={0.08} c={palette.earth} seg={14} />
          <group position={[0, 0.76, 0]}>
            <ExhibitObject slug={p.slug} />
          </group>
          {donated[p.slug] && <Star p={[0, 1.55, 0]} s={1.1} />}
        </group>
      ))}
    </group>
  );
}

function MarketStall() {
  const pl = getPlacement("market");
  const stripes = 7;
  return (
    <group position={[pl.center.x, pl.level * LEVEL, pl.center.z]}>
      <Box p={[0, 0.45, 0.35]} s={[2.6, 0.9, 0.7]} c={palette.wood} />
      <Box p={[0, 0.93, 0.38]} s={[2.75, 0.08, 0.85]} c={palette.woodDeep} />
      {[-1.25, 1.25].map((x) => [-0.55, 0.75].map((z) => <Cyl key={`${x}${z}`} p={[x, 1.1, z]} r={0.06} h={2.2} c={palette.woodDeep} seg={8} />))}
      <group position={[0, 2.12, 0.15]} rotation={[0.32, 0, 0]}>
        {Array.from({ length: stripes }).map((_, k) => (
          <Box key={k} p={[-1.35 + (k + 0.5) * (2.7 / stripes), 0, 0]} s={[2.7 / stripes + 0.005, 0.08, 1.75]} c={k % 2 ? palette.cream : palette.sun} />
        ))}
        {Array.from({ length: stripes }).map((_, k) => (
          <mesh key={`s${k}`} position={[-1.35 + (k + 0.5) * (2.7 / stripes), -0.06, 0.88]} rotation={[Math.PI / 2, 0, 0]} material={toon(k % 2 ? palette.cream : palette.sun)}>
            <cylinderGeometry args={[2.7 / stripes / 2, 2.7 / stripes / 2, 0.06, 12, 1, false, 0, Math.PI]} />
          </mesh>
        ))}
      </group>
      {[
        [-0.8, palette.orange],
        [0, palette.blossom],
        [0.8, palette.sun],
      ].map(([x, c]) => (
        <group key={String(x)} position={[x as number, 0.97, 0.4]}>
          <Box p={[0, 0.1, 0]} s={[0.6, 0.2, 0.46]} c={palette.woodDeep} />
          {[-0.14, 0.02, 0.16].map((dx, k) => (
            <mesh key={k} position={[dx, 0.26, (k - 1) * 0.1]} material={toon(c as string)} castShadow>
              <sphereGeometry args={[0.1, 10, 8]} />
            </mesh>
          ))}
          <Box p={[0.2, 0.34, 0.24]} s={[0.18, 0.12, 0.02]} c={palette.cream} shadow={false} />
        </group>
      ))}
      <Box p={[-1.6, 0.25, 0.9]} s={[0.5, 0.5, 0.5]} c={palette.wood} r={[0, 0.3, 0]} />
      <Box p={[-1.55, 0.7, 0.85]} s={[0.4, 0.4, 0.4]} c={"#C4976B"} r={[0, -0.2, 0]} />
    </group>
  );
}

function ArcadeShack() {
  const pl = getPlacement("arcade");
  const sign = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (!sign.current || reducedMotion.value) return;
    const t = s.clock.elapsedTime;
    sign.current.children.forEach((c, k) => {
      c.visible = Math.sin(t * 3 + k * 0.9) > -0.6;
    });
  });
  const pixels = useMemo(() => {
    const pattern = ["1101011", "1011101", "1101011"];
    const out: { x: number; y: number; c: string }[] = [];
    const colors = [palette.orange, palette.sun, palette.blossom, palette.glow];
    pattern.forEach((row, y) =>
      row.split("").forEach((v, x) => {
        if (v === "1") out.push({ x: (x - 3) * 0.2, y: (1 - y) * 0.2, c: colors[(x + y) % colors.length] });
      }),
    );
    return out;
  }, []);
  return (
    <group position={[pl.center.x, pl.level * LEVEL, pl.center.z]}>
      <Box p={[0, 0.08, 0]} s={[3.0, 0.16, 2.1]} c={palette.woodDeep} />
      <Box p={[0, 0.95, -0.1]} s={[2.6, 1.7, 1.7]} c={palette.indigo} />
      <Box p={[0, 1.88, -0.05]} s={[3.1, 0.2, 2.2]} c={palette.sun} />
      <Box p={[0, 2.02, -0.05]} s={[2.7, 0.1, 1.9]} c={"#F2B53C"} />
      <Box p={[0, 0.75, 0.76]} s={[0.7, 1.2, 0.06]} c={palette.violet} glow />
      <group position={[0, 2.5, 0.35]}>
        <Box p={[0, 0, -0.05]} s={[1.7, 0.8, 0.12]} c={palette.ink} />
        <group ref={sign}>
          {pixels.map((px, k) => (
            <mesh key={k} position={[px.x, px.y, 0.04]} material={toon(px.c, { emissive: px.c })}>
              <boxGeometry args={[0.16, 0.16, 0.05]} />
            </mesh>
          ))}
        </group>
        <Cyl p={[-0.6, -0.5, -0.05]} r={0.03} h={0.3} c={palette.ink} />
        <Cyl p={[0.6, -0.5, -0.05]} r={0.03} h={0.3} c={palette.ink} />
      </group>
      {/* Cabinet out front */}
      <group position={[1.15, 0, 1.25]} rotation={[0, -0.5, 0]}>
        <Box p={[0, 0.6, 0]} s={[0.55, 1.2, 0.5]} c={palette.coral} />
        <Box p={[0, 0.95, 0.24]} s={[0.4, 0.32, 0.04]} c={palette.water} glow />
        <Box p={[0, 0.66, 0.3]} s={[0.5, 0.06, 0.2]} c={palette.ink} />
        <Cyl p={[-0.1, 0.74, 0.32]} r={0.02} h={0.1} c={palette.ink} />
        <mesh position={[-0.1, 0.8, 0.32]} material={toon(palette.sun)}>
          <sphereGeometry args={[0.04, 8, 8]} />
        </mesh>
        <mesh position={[0.1, 0.7, 0.34]} material={toon(palette.blossom)}>
          <sphereGeometry args={[0.03, 8, 8]} />
        </mesh>
      </group>
    </group>
  );
}

function Crop({ kind, grow }: { kind: string; grow: number }) {
  const s = 0.35 + grow;
  switch (kind) {
    case "sunflower":
      return (
        <group scale={s}>
          <Cyl p={[0, 0.5, 0]} r={0.03} h={1.0} c={palette.foliageDeep} seg={5} />
          <mesh position={[0, 1.02, 0.04]} rotation={[Math.PI / 2 - 0.3, 0, 0]} material={toon(palette.sun)}>
            <cylinderGeometry args={[0.2, 0.2, 0.05, 10]} />
          </mesh>
          <mesh position={[0, 1.02, 0.07]} rotation={[Math.PI / 2 - 0.3, 0, 0]} material={toon(palette.woodDeep)}>
            <cylinderGeometry args={[0.09, 0.09, 0.05, 10]} />
          </mesh>
        </group>
      );
    case "wheat":
      return (
        <group scale={s}>
          {[-0.08, 0.08, 0].map((x, k) => (
            <group key={k} position={[x, 0, (k - 1) * 0.06]}>
              <Cyl p={[0, 0.35, 0]} r={0.015} h={0.7} c={palette.sun} seg={4} />
              <mesh position={[0, 0.78, 0]} material={toon(palette.sun)}>
                <capsuleGeometry args={[0.04, 0.16, 2, 6]} />
              </mesh>
            </group>
          ))}
        </group>
      );
    case "carrot":
      return (
        <group scale={s}>
          <mesh position={[0, 0.08, 0]} rotation={[Math.PI, 0, 0]} material={toon(palette.orange)}>
            <coneGeometry args={[0.09, 0.22, 8]} />
          </mesh>
          {[-0.4, 0, 0.4].map((r) => (
            <mesh key={r} position={[0, 0.34, 0]} rotation={[0, 0, r]} material={toon(palette.foliage)}>
              <coneGeometry args={[0.04, 0.36, 4]} />
            </mesh>
          ))}
        </group>
      );
    case "berry":
      return (
        <group scale={s}>
          <mesh position={[0, 0.3, 0]} material={toon(palette.foliage, { flatShading: true })} castShadow>
            <icosahedronGeometry args={[0.28, 1]} />
          </mesh>
          {[[0.18, 0.4, 0.14], [-0.16, 0.3, 0.18], [0.02, 0.5, 0.2], [0.2, 0.22, -0.1]].map((p, k) => (
            <mesh key={k} position={p as V3} material={toon(palette.violet)}>
              <sphereGeometry args={[0.05, 8, 6]} />
            </mesh>
          ))}
        </group>
      );
    case "tulip":
      return (
        <group scale={s}>
          <Cyl p={[0, 0.3, 0]} r={0.02} h={0.6} c={palette.foliageDeep} seg={5} />
          <mesh position={[0, 0.66, 0]} material={toon(palette.blossom)}>
            <cylinderGeometry args={[0.1, 0.06, 0.18, 6]} />
          </mesh>
          <mesh position={[0.07, 0.2, 0]} rotation={[0, 0, -0.6]} material={toon(palette.foliage)}>
            <coneGeometry args={[0.05, 0.3, 4]} />
          </mesh>
        </group>
      );
    default:
      return (
        <group scale={s}>
          {[-0.5, 0.5, 1.6].map((r, k) => (
            <mesh key={k} position={[0, 0.2, 0]} rotation={[0.6, r, 0]} material={toon(palette.foliage)}>
              <sphereGeometry args={[0.12, 8, 6, 0, Math.PI]} />
            </mesh>
          ))}
          <Cyl p={[0, 0.1, 0]} r={0.02} h={0.2} c={palette.foliageDeep} seg={5} />
        </group>
      );
  }
}

function GardenRow({ index }: { index: number }) {
  const row = gardenRows[index];
  const skill = skills.find((s) => s.id === row.skillId)!;
  const watered = useGame((s) => !!s.watered[row.skillId]);
  const waterAt = useGame((s) => (s.waterAt?.id === row.skillId ? s.waterAt.at : 0));
  const group = useRef<THREE.Group>(null);
  const growth = useRef(watered ? 1 : 0);
  const target = watered ? skill.level * 0.13 : 0.05;

  useFrame(() => {
    if (!group.current) return;
    const delay = waterAt ? (performance.now() - waterAt) / 1000 : 10;
    const goal = delay > 0.35 ? target : 0.05;
    growth.current += (goal - growth.current) * (reducedMotion.value ? 1 : 0.06);
    group.current.children.forEach((c) => {
      c.scale.setScalar((0.35 + growth.current) / 0.4);
    });
  });

  const n = 4;
  const len = row.z1 - row.z0;
  return (
    <group position={[row.x, row.level * LEVEL, 0]}>
      <Box p={[0, 0.06, (row.z0 + row.z1) / 2]} s={[0.72, 0.12, len + 0.4]} c="#8E6443" />
      <group ref={group}>
        {Array.from({ length: n }).map((_, k) => (
          <group key={k} position={[0, 0.1, row.z0 + 0.2 + (k / (n - 1)) * (len - 0.4)]}>
            <Crop kind={skill.crop} grow={0.05} />
          </group>
        ))}
      </group>
    </group>
  );
}

function Fence({ from, to, y }: { from: [number, number]; to: [number, number]; y: number }) {
  const len = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const angle = Math.atan2(to[1] - from[1], to[0] - from[0]);
  const posts = Math.max(2, Math.round(len / 0.9) + 1);
  return (
    <group position={[from[0], y, from[1]]} rotation={[0, -angle, 0]}>
      {Array.from({ length: posts }).map((_, k) => (
        <Box key={k} p={[(k / (posts - 1)) * len, 0.3, 0]} s={[0.14, 0.6, 0.14]} c={palette.wood} />
      ))}
      <Box p={[len / 2, 0.42, 0]} s={[len, 0.08, 0.06]} c={"#C4976B"} />
      <Box p={[len / 2, 0.22, 0]} s={[len, 0.08, 0.06]} c={"#C4976B"} />
    </group>
  );
}

function Garden() {
  const pl = getPlacement("garden");
  const [i0, j0, i1, j1] = pl.rect;
  const a = tileCenter(i0, j0);
  const b = tileCenter(i1, j1);
  const y = pl.level * LEVEL;
  const x0 = a.x - 0.4;
  const x1 = b.x + 0.4;
  const z0 = a.z - 0.4;
  const z1 = b.z + 0.4;
  const gate = tileCenter(25, 19);
  const hasCan = useGame((s) => s.hasCan);
  return (
    <group>
      <Fence from={[x0, z0]} to={[x1, z0]} y={y} />
      <Fence from={[x0, z0]} to={[x0, z1]} y={y} />
      <Fence from={[x1, z0]} to={[x1, z1]} y={y} />
      <Fence from={[x0, z1]} to={[gate.x - 0.45, z1]} y={y} />
      <Fence from={[gate.x + 0.45, z1]} to={[x1, z1]} y={y} />
      {gardenRows.map((_, k) => (
        <GardenRow key={k} index={k} />
      ))}
      {/* Water channel and sign */}
      <Box p={[a.x + 0.05, y + 0.03, (z0 + z1) / 2]} s={[0.35, 0.06, z1 - z0 - 0.4]} c={palette.water} shadow={false} />
      <group position={[gate.x - 0.25, y, z1 + 0.35]}>
        <Cyl p={[0, 0.4, 0]} r={0.05} h={0.8} c={palette.woodDeep} />
        <Box p={[0, 0.8, 0.02]} s={[0.7, 0.4, 0.08]} c={palette.wood} />
        <mesh position={[-0.15, 0.82, 0.07]} material={toon(palette.foliage)}>
          <sphereGeometry args={[0.07, 8, 6]} />
        </mesh>
        <mesh position={[0.12, 0.82, 0.07]} material={toon(palette.orange)}>
          <sphereGeometry args={[0.07, 8, 6]} />
        </mesh>
      </group>
      {!hasCan && (
        <group position={[gate.x + 0.35, y, z1 + 0.5]} rotation={[0, -0.6, 0]}>
          <Cyl p={[0, 0.14, 0]} r={0.13} h={0.26} c={palette.water} />
          <Cyl p={[0.2, 0.2, 0]} r={0.025} h={0.3} c={palette.water} rot={[0, 0, -1]} />
          <mesh position={[0, 0.3, 0]} rotation={[0, 0, Math.PI / 2]} material={toon(palette.water)}>
            <torusGeometry args={[0.1, 0.02, 6, 12, Math.PI]} />
          </mesh>
        </group>
      )}
    </group>
  );
}

function Dock() {
  const pl = getPlacement("dock");
  const bottle = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (!bottle.current || reducedMotion.value) return;
    const t = s.clock.elapsedTime;
    bottle.current.position.y = pl.level * LEVEL + 0.05 + Math.sin(t * 2) * 0.03;
    bottle.current.rotation.z = Math.PI / 2 + Math.sin(t * 1.6) * 0.08;
  });
  const y = pl.level * LEVEL;
  return (
    <group>
      <group ref={bottle} position={[pl.interact.x + 0.2, y + 0.05, pl.interact.z - 0.35]} rotation={[0, 0.5, Math.PI / 2]}>
        <mesh material={toon("#B8E6F2", { transparent: true, opacity: 0.7 })} castShadow>
          <capsuleGeometry args={[0.1, 0.22, 4, 10]} />
        </mesh>
        <Cyl p={[0, 0.24, 0]} r={0.045} h={0.12} c="#B8E6F2" />
        <Cyl p={[0, 0.31, 0]} r={0.04} h={0.06} c={palette.wood} />
        <mesh material={toon(palette.cream)} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.18, 8]} />
        </mesh>
      </group>
      <group position={[pl.interact.x - 0.55, y, pl.interact.z - 0.15]}>
        <Cyl p={[0, 0.35, 0]} r={0.04} h={0.7} c={palette.woodDeep} />
        <Box p={[0, 0.78, 0]} s={[0.18, 0.22, 0.18]} c={palette.sun} glow />
        <Box p={[0, 0.92, 0]} s={[0.24, 0.06, 0.24]} c={palette.woodDeep} />
      </group>
    </group>
  );
}

export function Landmarks() {
  return (
    <group>
      <House />
      <TownHall />
      <Museum />
      <Pedestals />
      <MarketStall />
      <ArcadeShack />
      <Garden />
      <Dock />
    </group>
  );
}
