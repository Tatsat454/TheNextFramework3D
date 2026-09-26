"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { townHallPal } from "@/content/landmarks";
import { sfx } from "@/game/audio";
import { TOWN_COLORS, TOWN_FRAMES_X } from "@/game/interiors";
import { flat, palette, toon } from "@/game/materials";
import { player, reducedMotion } from "@/game/player-state";
import { useGame } from "@/game/store";
import { ClearColor } from "./Interior";

type V3 = [number, number, number];

function Box({ p, s, c, r, glow, shadow = true }: { p: V3; s: V3; c: string; r?: V3; glow?: boolean; shadow?: boolean }) {
  return (
    <mesh position={p} rotation={r} material={toon(c, { emissive: glow ? c : undefined, noOcclude: true })} castShadow={shadow} receiveShadow={shadow}>
      <boxGeometry args={s} />
    </mesh>
  );
}

function Plant({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <Box p={[0, 0.16, 0]} s={[0.38, 0.32, 0.38]} c="#C48A55" />
      <mesh position={[0, 0.62, 0]} material={toon(palette.foliage)} castShadow>
        <sphereGeometry args={[0.32, 12, 10]} />
      </mesh>
      <mesh position={[0.14, 0.78, 0.08]} material={toon(palette.foliageDeep)} castShadow>
        <sphereGeometry args={[0.18, 10, 8]} />
      </mesh>
    </group>
  );
}

const FRAME_ART: { paper: string; a: string; b: string }[] = [
  { paper: "#F4E4C4", a: "#C8373C", b: "#FFC857" },
  { paper: "#E8EEF6", a: "#4B3FB5", b: "#8FD3E8" },
  { paper: "#F6EDE0", a: "#2F7A4B", b: "#FFC857" },
  { paper: "#F3E8F6", a: "#7B6CF6", b: "#FF8A65" },
  { paper: "#E8F4EA", a: "#4B3FB5", b: "#7EDC7A" },
  { paper: "#FFF0D8", a: "#C8373C", b: "#4B3FB5" },
];

function HistoryFrame({ x, i }: { x: number; i: number }) {
  const art = FRAME_ART[i]!;
  return (
    <group position={[x, 2.05, -4.88]}>
      <Box p={[0, 0, 0]} s={[1.72, 1.85, 0.12]} c="#8B5A32" shadow={false} />
      <Box p={[0, 0.06, 0.05]} s={[1.46, 1.42, 0.08]} c={art.paper} shadow={false} />
      <mesh position={[-0.22, 0.18, 0.12]} material={toon(art.a)} castShadow>
        <sphereGeometry args={[0.22, 10, 8]} />
      </mesh>
      <Box p={[0.28, -0.12, 0.12]} s={[0.42, 0.55, 0.06]} c={art.b} shadow={false} />
      <Box p={[0, -0.82, 0.06]} s={[0.72, 0.22, 0.08]} c="#D4A017" shadow={false} />
      <Box p={[0, -0.82, 0.11]} s={[0.58, 0.12, 0.02]} c="#FFF6E6" shadow={false} />
      {/* Year pip on the timeline */}
      <mesh position={[0, -1.42, 0.16]} material={toon("#D4A017", { emissive: "#D4A017" })}>
        <sphereGeometry args={[0.08, 10, 8]} />
      </mesh>
    </group>
  );
}

function Timeline() {
  const x0 = TOWN_FRAMES_X[0];
  const x1 = TOWN_FRAMES_X[TOWN_FRAMES_X.length - 1]!;
  const w = x1 - x0;
  return <Box p={[(x0 + x1) / 2, 0.63, -4.72]} s={[w + 0.4, 0.045, 0.045]} c="#D4A017" glow shadow={false} />;
}

function FrontDesk() {
  return (
    <group position={[0, 0, 1.18]}>
      <Box p={[0, 0.48, 0]} s={[3.15, 0.96, 1.05]} c="#8B5A32" />
      <Box p={[0, 0.98, 0.08]} s={[3.28, 0.1, 1.18]} c="#C48A55" />
      <Box p={[0, 0.55, 0.54]} s={[3.05, 0.16, 0.08]} c="#4B3FB5" shadow={false} />
      {/* Papers */}
      <Box p={[-0.55, 1.08, 0.12]} s={[0.55, 0.04, 0.42]} c="#FFF6E6" r={[0, 0.12, 0]} shadow={false} />
      <Box p={[-0.52, 1.12, 0.1]} s={[0.52, 0.03, 0.4]} c="#F4E4C4" r={[0, -0.08, 0]} shadow={false} />
      <Box p={[-0.5, 1.16, 0.08]} s={[0.5, 0.03, 0.38]} c="#FFF6E6" r={[0, 0.2, 0]} shadow={false} />
      {/* Bell */}
      <mesh position={[-1.15, 1.16, 0.18]} material={toon("#D4A017")} castShadow>
        <sphereGeometry args={[0.1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <Box p={[-1.15, 1.08, 0.18]} s={[0.22, 0.04, 0.22]} c="#8B5A32" shadow={false} />
      <mesh position={[-1.15, 1.22, 0.18]} material={toon("#FFF6E6")}>
        <sphereGeometry args={[0.035, 8, 8]} />
      </mesh>
      {/* Stamp */}
      <Box p={[0.55, 1.12, 0.22]} s={[0.28, 0.16, 0.22]} c="#4B3FB5" />
      <Box p={[0.55, 1.22, 0.22]} s={[0.18, 0.08, 0.14]} c="#1E1B3A" />
      <Box p={[0.55, 1.05, 0.22]} s={[0.32, 0.04, 0.26]} c="#C8373C" shadow={false} />
    </group>
  );
}

function MayorDesk() {
  return (
    <group position={[5.35, 0, -3.45]}>
      <Box p={[0, 0.42, 0]} s={[1.85, 0.12, 1.15]} c="#C48A55" />
      <Box p={[-0.72, 0.2, -0.42]} s={[0.12, 0.4, 0.12]} c="#8B5A32" />
      <Box p={[0.72, 0.2, -0.42]} s={[0.12, 0.4, 0.12]} c="#8B5A32" />
      <Box p={[-0.72, 0.2, 0.42]} s={[0.12, 0.4, 0.12]} c="#8B5A32" />
      <Box p={[0.72, 0.2, 0.42]} s={[0.12, 0.4, 0.12]} c="#8B5A32" />
      <Box p={[-0.35, 0.52, 0.1]} s={[0.55, 0.05, 0.4]} c="#FFF6E6" r={[0, 0.2, 0]} shadow={false} />
      <mesh position={[0.55, 0.62, -0.15]} material={toon("#4B3FB5")} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.22, 10]} />
      </mesh>
      <mesh position={[0.55, 0.78, -0.15]} material={toon("#FFC857", { emissive: "#FFC857" })}>
        <sphereGeometry args={[0.07, 10, 8]} />
      </mesh>
      <Box p={[0.15, 0.22, 0.72]} s={[0.55, 0.44, 0.5]} c="#4B3FB5" />
      <Box p={[0.15, 0.48, 0.72]} s={[0.5, 0.1, 0.48]} c="#FFF6E6" />
    </group>
  );
}

function Certificate() {
  return (
    <group position={[5.35, 2.15, -4.88]}>
      <Box p={[0, 0, 0]} s={[1.15, 1.35, 0.1]} c="#D4A017" shadow={false} />
      <Box p={[0, 0, 0.05]} s={[0.95, 1.12, 0.06]} c="#FFF6E6" shadow={false} />
      <Box p={[0, 0.28, 0.09]} s={[0.55, 0.08, 0.02]} c="#4B3FB5" shadow={false} />
      <Box p={[0, 0.08, 0.09]} s={[0.7, 0.05, 0.02]} c="#C48A55" shadow={false} />
      <Box p={[0, -0.12, 0.09]} s={[0.62, 0.05, 0.02]} c="#C48A55" shadow={false} />
      <mesh position={[0, -0.38, 0.1]} rotation={[Math.PI / 2, 0, 0]} material={toon("#D4A017")}>
        <cylinderGeometry args={[0.12, 0.12, 0.04, 16]} />
      </mesh>
    </group>
  );
}

function NoticeBoard() {
  return (
    <group position={[-5.45, 1.55, 3.55]} rotation={[0, 0.55, 0]}>
      <Box p={[0, 0, 0]} s={[1.55, 1.55, 0.1]} c="#8B5A32" />
      <Box p={[0, 0, 0.04]} s={[1.38, 1.38, 0.06]} c="#C48A55" />
      <Box p={[-0.28, 0.28, 0.1]} s={[0.42, 0.48, 0.02]} c="#FFF6E6" r={[0, 0, 0.08]} shadow={false} />
      <Box p={[0.32, 0.18, 0.1]} s={[0.38, 0.32, 0.02]} c="#FFC857" r={[0, 0, -0.12]} shadow={false} />
      <Box p={[-0.12, -0.32, 0.1]} s={[0.5, 0.36, 0.02]} c="#C7B9FF" r={[0, 0, 0.05]} shadow={false} />
      <Box p={[0.35, -0.22, 0.1]} s={[0.34, 0.28, 0.02]} c="#FFB7C8" r={[0, 0, -0.06]} shadow={false} />
    </group>
  );
}

function Bench({ p, rotY = 0 }: { p: V3; rotY?: number }) {
  return (
    <group position={p} rotation={[0, rotY, 0]}>
      <Box p={[0, 0.32, 0]} s={[1.45, 0.12, 0.48]} c="#C48A55" />
      <Box p={[-0.6, 0.16, 0]} s={[0.1, 0.32, 0.42]} c="#8B5A32" />
      <Box p={[0.6, 0.16, 0]} s={[0.1, 0.32, 0.42]} c="#8B5A32" />
      <Box p={[0, 0.52, -0.18]} s={[1.45, 0.36, 0.1]} c="#8B5A32" />
    </group>
  );
}

function WallClock() {
  return (
    <group position={[-6.85, 2.45, 0.2]}>
      <mesh rotation={[0, Math.PI / 2, 0]} material={toon("#FFF6E6")} castShadow>
        <cylinderGeometry args={[0.32, 0.32, 0.08, 20]} />
      </mesh>
      <mesh position={[0.05, 0, 0]} rotation={[0, Math.PI / 2, 0]} material={toon("#4B3FB5")}>
        <cylinderGeometry args={[0.34, 0.34, 0.04, 20]} />
      </mesh>
      <Box p={[0.08, 0.12, 0]} s={[0.04, 0.18, 0.03]} c="#1E1B3A" r={[0, 0, -0.2]} shadow={false} />
      <Box p={[0.08, -0.02, 0.08]} s={[0.04, 0.03, 0.14]} c="#1E1B3A" shadow={false} />
    </group>
  );
}

function Rug() {
  const stripes = useMemo(() => Array.from({ length: 11 }, (_, k) => k), []);
  return (
    <group position={[0, 0.03, 0.15]}>
      {stripes.map((k) => (
        <mesh key={k} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -3.6 + k * 0.72]} material={toon(k % 2 ? TOWN_COLORS.rugA : TOWN_COLORS.rugB, { noOcclude: true })}>
          <planeGeometry args={[2.35, 0.72]} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1.22, 0.005, 0.2]} material={toon("#D4A017", { noOcclude: true })}>
        <planeGeometry args={[0.08, 7.95]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.22, 0.005, 0.2]} material={toon("#D4A017", { noOcclude: true })}>
        <planeGeometry args={[0.08, 7.95]} />
      </mesh>
    </group>
  );
}

function SouthWindow({ x }: { x: number }) {
  return (
    <group position={[x, 1.85, 5]}>
      <Box p={[0, 0, 0]} s={[1.35, 1.35, 0.12]} c="#C48A55" shadow={false} />
      <Box p={[0, 0, 0]} s={[1.12, 1.12, 0.28]} c="#FFE7A8" glow shadow={false} />
      <Box p={[0, 0, 0.15]} s={[0.06, 1.12, 0.02]} c="#C48A55" shadow={false} />
      <Box p={[0, 0, 0.15]} s={[1.12, 0.06, 0.02]} c="#C48A55" shadow={false} />
    </group>
  );
}

function SouthWallSegment({ cx, span, winX }: { cx: number; span: number; winX: number }) {
  const t = 0.22;
  const z = 5;
  const h = 3.15;
  const winW = 1.42;
  const winH = 1.42;
  const winY = 1.85;
  const sill = winY - winH / 2;
  const headerH = h - (winY + winH / 2);
  const headerY = winY + winH / 2 + headerH / 2;
  const x0 = cx - span / 2;
  const x1 = cx + span / 2;
  const leftW = winX - winW / 2 - x0;
  const rightW = x1 - (winX + winW / 2);
  return (
    <group>
      <Box p={[cx, sill / 2, z]} s={[span, sill, t]} c={TOWN_COLORS.wall} />
      <Box p={[x0 + leftW / 2, winY, z]} s={[leftW, winH, t]} c={TOWN_COLORS.wall} />
      <Box p={[x1 - rightW / 2, winY, z]} s={[rightW, winH, t]} c={TOWN_COLORS.wall} />
      <Box p={[cx, headerY, z]} s={[span, headerH, t]} c={TOWN_COLORS.wall} />
      <Box p={[cx, 0.92, 4.88]} s={[span, 0.18, 0.06]} c={TOWN_COLORS.wainscot} shadow={false} />
    </group>
  );
}

function Walls() {
  const h = 3.15;
  const y = h / 2;
  const t = 0.22;
  const stripe = 0.92;
  return (
    <group>
      <Box p={[0, y, -5]} s={[14.2, h, t]} c={TOWN_COLORS.wall} shadow={false} />
      <Box p={[0, stripe, -4.88]} s={[14, 0.18, 0.06]} c={TOWN_COLORS.wainscot} shadow={false} />
      <SouthWallSegment cx={-3.95} span={6.2} winX={-4.05} />
      <SouthWallSegment cx={3.95} span={6.2} winX={4.05} />
      <Box p={[-0.85, 1.15, 5]} s={[0.18, 2.3, 0.28]} c="#8B5A32" />
      <Box p={[0.85, 1.15, 5]} s={[0.18, 2.3, 0.28]} c="#8B5A32" />
      <Box p={[0, 2.32, 5]} s={[1.88, 0.16, 0.28]} c="#8B5A32" />
      <Box p={[7, y, 0]} s={[t, h, 10.22]} c={TOWN_COLORS.wall} />
      <Box p={[-7, y, 0]} s={[t, h, 10.22]} c={TOWN_COLORS.wall} />
      <Box p={[6.88, stripe, 0]} s={[0.06, 0.18, 10]} c={TOWN_COLORS.wainscot} shadow={false} />
      <Box p={[-6.88, stripe, 0]} s={[0.06, 0.18, 10]} c={TOWN_COLORS.wainscot} shadow={false} />
      <SouthWindow x={-4.05} />
      <SouthWindow x={4.05} />
    </group>
  );
}

function TownLights() {
  return (
    <>
      <hemisphereLight args={["#FFF6E6", "#C48A55", 0.72]} />
      <ambientLight intensity={0.44} />
      <directionalLight
        color="#FFE7A8"
        intensity={1.12}
        position={[4, 9, -8]}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0008}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight color="#FFF0D0" intensity={0.5} distance={14} position={[0, 2.7, 0]} />
    </>
  );
}

function QuillOwl() {
  return (
    <group>
      <mesh position={[-0.1, 0.08, 0.04]} rotation={[Math.PI / 2, 0, 0]} material={toon("#C48A55")} castShadow>
        <sphereGeometry args={[0.08, 8, 8]} />
      </mesh>
      <mesh position={[0.1, 0.08, 0.04]} rotation={[Math.PI / 2, 0, 0]} material={toon("#C48A55")} castShadow>
        <sphereGeometry args={[0.08, 8, 8]} />
      </mesh>
      <mesh position={[0, 0.38, 0]} scale={[1, 1.05, 0.9]} material={toon("#E8D5B0")} castShadow>
        <sphereGeometry args={[0.28, 16, 14]} />
      </mesh>
      <mesh position={[0, 0.34, 0.08]} scale={[0.72, 0.7, 0.45]} material={toon("#FFF6E6")}>
        <sphereGeometry args={[0.22, 12, 10]} />
      </mesh>
      <mesh position={[-0.26, 0.42, 0]} rotation={[0, 0, 0.5]} material={toon("#C48A55")} castShadow>
        <sphereGeometry args={[0.1, 10, 8]} />
      </mesh>
      <mesh position={[0.26, 0.42, 0]} rotation={[0, 0, -0.5]} material={toon("#C48A55")} castShadow>
        <sphereGeometry args={[0.1, 10, 8]} />
      </mesh>
      <mesh position={[0, 0.68, 0]} material={toon("#E8D5B0")} castShadow>
        <sphereGeometry args={[0.22, 16, 14]} />
      </mesh>
      <mesh position={[-0.1, 0.86, -0.02]} rotation={[0, 0, -0.35]} material={toon("#8B5A32")}>
        <coneGeometry args={[0.05, 0.14, 6]} />
      </mesh>
      <mesh position={[0.1, 0.86, -0.02]} rotation={[0, 0, 0.35]} material={toon("#8B5A32")}>
        <coneGeometry args={[0.05, 0.14, 6]} />
      </mesh>
      <mesh position={[0, 0.62, 0.2]} rotation={[Math.PI / 2, 0, 0]} material={toon("#FF8A65")}>
        <coneGeometry args={[0.05, 0.1, 6]} />
      </mesh>
      <mesh position={[-0.08, 0.72, 0.18]} material={toon("#1E1B3A")}>
        <sphereGeometry args={[0.035, 8, 8]} />
      </mesh>
      <mesh position={[0.08, 0.72, 0.18]} material={toon("#1E1B3A")}>
        <sphereGeometry args={[0.035, 8, 8]} />
      </mesh>
      <mesh position={[-0.08, 0.72, 0.2]} rotation={[0, 0, 0]} material={toon("#1E1B3A", { noOcclude: true })}>
        <torusGeometry args={[0.055, 0.012, 6, 12]} />
      </mesh>
      <mesh position={[0.08, 0.72, 0.2]} material={toon("#1E1B3A", { noOcclude: true })}>
        <torusGeometry args={[0.055, 0.012, 6, 12]} />
      </mesh>
      <Box p={[0, 0.72, 0.2]} s={[0.06, 0.015, 0.015]} c="#1E1B3A" shadow={false} />
      <Box p={[0, 0.48, 0.22]} s={[0.16, 0.1, 0.06]} c="#4B3FB5" />
      <Box p={[-0.07, 0.52, 0.22]} s={[0.08, 0.08, 0.05]} c="#C8373C" />
      <Box p={[0.07, 0.52, 0.22]} s={[0.08, 0.08, 0.05]} c="#C8373C" />
    </group>
  );
}

function QuillClerk() {
  const group = useRef<THREE.Group>(null);
  const st = useRef({ greetAt: performance.now(), greeted: false, facing: 0 });

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const s = st.current;
    const game = useGame.getState();
    const now = performance.now();
    const elapsed = now - s.greetAt;
    const rm = reducedMotion.value;

    if (!s.greeted && !game.transitioning && elapsed > 720) {
      s.greeted = true;
      useGame.setState({
        dialog: {
          speaker: townHallPal.id,
          name: townHallPal.name,
          role: townHallPal.role,
          tagColor: townHallPal.tagColor,
          voice: townHallPal.voice,
          lines: townHallPal.welcome,
          index: 0,
        },
      });
      sfx.open();
    }

    const face = Math.atan2(player.x - -1.85, player.z - 1.42);
    s.facing += (((face - s.facing + Math.PI * 3) % (Math.PI * 2)) - Math.PI) * 0.16;
    const hop = !rm && elapsed < 1600 ? Math.abs(Math.sin((elapsed / 1000) * 9)) * 0.16 : 0;
    g.position.set(-1.85, hop, 1.42);
    g.rotation.y = s.facing;
  });

  return (
    <group ref={group} scale={1.35}>
      <QuillOwl />
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]} material={flat("#1E1B3A", 0.22)}>
        <circleGeometry args={[0.22, 14]} />
      </mesh>
    </group>
  );
}

export function TownHallWorld() {
  return (
    <group>
      <ClearColor color="#141022" />
      <TownLights />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} material={toon(TOWN_COLORS.floor, { noOcclude: true })} receiveShadow>
        <planeGeometry args={[14, 10]} />
      </mesh>
      <Rug />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, 4.42]} material={toon("#4B3FB5", { noOcclude: true })}>
        <planeGeometry args={[1.55, 0.72]} />
      </mesh>
      <Walls />
      <Timeline />
      {TOWN_FRAMES_X.map((x, i) => (
        <HistoryFrame key={x} x={x} i={i} />
      ))}
      <FrontDesk />
      <QuillClerk />
      <MayorDesk />
      <Certificate />
      <NoticeBoard />
      <WallClock />
      <Bench p={[-5.85, 0, 0.15]} rotY={Math.PI / 2} />
      <Bench p={[5.85, 0, 0.15]} rotY={-Math.PI / 2} />
      <Plant p={[-6.35, 0, -4.35]} />
      <Plant p={[6.35, 0, 4.25]} />
      <Plant p={[-6.35, 0, 4.25]} />
    </group>
  );
}
