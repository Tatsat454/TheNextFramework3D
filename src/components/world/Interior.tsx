"use client";

import { useLayoutEffect } from "react";
import { useThree } from "@react-three/fiber";
import { HOUSE_COLORS } from "@/game/interiors";
import { flat, palette, toon } from "@/game/materials";

type V3 = [number, number, number];

function Box({ p, s, c, r, glow, shadow = true, opacity }: { p: V3; s: V3; c: string; r?: V3; glow?: boolean; shadow?: boolean; opacity?: number }) {
  return (
    <mesh position={p} rotation={r} material={toon(c, { emissive: glow ? c : undefined, transparent: opacity !== undefined, opacity, noOcclude: true })} castShadow={shadow} receiveShadow={shadow}>
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

function Bed() {
  const patches: [number, number, string][] = [];
  const cols = ["#E8513F", "#FFF6E6", "#FFC857", "#C7B9FF", "#E8513F"];
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 5; j++) patches.push([(i - 1.5) * 0.36, (j - 1.7) * 0.32, cols[(i + j) % cols.length]!]);
  return (
    <group position={[-3.15, 0, -1.7]}>
      <Box p={[0, 0.18, 0]} s={[1.85, 0.36, 2.55]} c="#8B5A32" />
      <Box p={[0, 0.42, 0.08]} s={[1.68, 0.16, 2.28]} c="#FFF6E6" />
      <group position={[0, 0.52, 0.12]}>
        {patches.map(([x, z, c], k) => (
          <Box key={k} p={[x, 0, z]} s={[0.38, 0.05, 0.32]} c={c} shadow={false} />
        ))}
      </group>
      <Box p={[0, 0.58, -1.05]} s={[1.58, 0.28, 0.42]} c="#FFF6E6" />
      <Box p={[-0.82, 0.22, 1.18]} s={[0.16, 0.44, 0.16]} c="#6E4526" />
      <Box p={[0.82, 0.22, 1.18]} s={[0.16, 0.44, 0.16]} c="#6E4526" />
      <Box p={[-0.82, 0.22, -1.18]} s={[0.16, 0.44, 0.16]} c="#6E4526" />
      <Box p={[0.82, 0.22, -1.18]} s={[0.16, 0.44, 0.16]} c="#6E4526" />
    </group>
  );
}

function Bookshelf() {
  const colors = ["#C8373C", "#4B3FB5", "#FFC857", "#2F7A4B", "#E8513F", "#7B6CF6", "#FF8A65", "#8FD3E8", "#C48A55", "#FFF6E6"];
  const shelves = [0.16, 0.68, 1.2, 1.72];
  return (
    <group position={[-0.95, 0, -3.52]}>
      <Box p={[0, 1.12, -0.16]} s={[1.62, 2.24, 0.08]} c="#6E4526" />
      <Box p={[-0.78, 1.12, 0.06]} s={[0.1, 2.24, 0.44]} c="#8B5A32" />
      <Box p={[0.78, 1.12, 0.06]} s={[0.1, 2.24, 0.44]} c="#8B5A32" />
      <Box p={[0, 0.06, 0.06]} s={[1.66, 0.12, 0.44]} c="#8B5A32" />
      <Box p={[0, 2.22, 0.06]} s={[1.66, 0.12, 0.44]} c="#A56B3C" />
      {shelves.map((y) => (
        <Box key={y} p={[0, y, 0.06]} s={[1.46, 0.07, 0.42]} c="#A56B3C" shadow={false} />
      ))}
      {shelves.map((shelfY, row) =>
        Array.from({ length: 6 }, (_, k) => {
          const h = 0.32 + ((k * 13 + row * 7) % 4) * 0.03;
          const w = 0.12 + (k % 3) * 0.02;
          const x = -0.58 + k * 0.2;
          return <Box key={`${row}-${k}`} p={[x, shelfY + 0.04 + h / 2, 0.1]} s={[w, h, 0.22]} c={colors[(k + row * 3) % colors.length]!} />;
        }),
      )}
    </group>
  );
}

function Kitchen() {
  return (
    <group position={[4.12, 0, -3.38]}>
      <Box p={[0, 0.4, 0]} s={[1.5, 0.8, 0.68]} c="#6E4526" />
      <Box p={[0, 0.82, 0]} s={[1.52, 0.06, 0.7]} c="#8B5A32" />
      <Box p={[-0.32, 0.94, 0.04]} s={[0.72, 0.14, 0.52]} c="#3B3470" />
      {[-0.5, -0.14].map((x) =>
        [-0.08, 0.14].map((z) => (
          <mesh key={`${x}:${z}`} position={[x, 1.03, z]} material={toon("#1E1B3A")}>
            <cylinderGeometry args={[0.08, 0.08, 0.04, 10]} />
          </mesh>
        )),
      )}
      <Box p={[0.42, 0.9, 0.18]} s={[0.08, 0.06, 0.08]} c="#C8B79A" shadow={false} />
      <Box p={[0.42, 0.9, 0.02]} s={[0.08, 0.06, 0.08]} c="#C8B79A" shadow={false} />
      <Box p={[0.1, 2.02, -0.04]} s={[1.25, 0.72, 0.4]} c="#6E4526" />
    </group>
  );
}

function Desk() {
  return (
    <group position={[3.5, 0, -1.65]}>
      <Box p={[0, 0.42, 0]} s={[1.7, 0.12, 0.95]} c="#C48A55" />
      <Box p={[-0.7, 0.2, -0.35]} s={[0.14, 0.4, 0.14]} c="#8B5A32" />
      <Box p={[0.7, 0.2, -0.35]} s={[0.14, 0.4, 0.14]} c="#8B5A32" />
      <Box p={[-0.7, 0.2, 0.35]} s={[0.14, 0.4, 0.14]} c="#8B5A32" />
      <Box p={[0.7, 0.2, 0.35]} s={[0.14, 0.4, 0.14]} c="#8B5A32" />
      {/* CRT */}
      <Box p={[-0.12, 0.92, -0.05]} s={[0.95, 0.82, 0.7]} c="#E6D3B0" />
      <Box p={[-0.12, 0.94, 0.28]} s={[0.72, 0.55, 0.08]} c="#1E1B3A" glow />
      <Box p={[-0.12, 1.18, 0.32]} s={[0.28, 0.08, 0.02]} c="#7EDC7A" glow shadow={false} />
      <Box p={[-0.12, 0.48, 0.22]} s={[0.72, 0.08, 0.42]} c="#D9C2A5" />
      <Box p={[0.55, 0.52, 0.12]} s={[0.42, 0.06, 0.55]} c="#4A4668" />
    </group>
  );
}

function Television() {
  return (
    <group position={[3.72, 0, 1.62]}>
      <Box p={[0, 0.2, 0]} s={[0.88, 0.4, 1.65]} c="#6E4526" />
      <Box p={[-0.02, 0.82, 0.08]} s={[0.32, 0.82, 1.12]} c="#2A2548" />
      <Box p={[-0.2, 0.84, 0.08]} s={[0.08, 0.64, 0.92]} c="#5B8CFF" glow />
      <Box p={[-0.34, 0.48, 0.2]} s={[0.4, 0.14, 0.72]} c="#7B6CF6" />
      <Box p={[-0.34, 0.5, 0.48]} s={[0.1, 0.04, 0.18]} c="#FFC857" shadow={false} />
      <Box p={[0.12, 0.52, -0.58]} s={[0.1, 0.28, 0.2]} c="#1F6B4A" />
      <Box p={[0.2, 0.54, -0.36]} s={[0.1, 0.32, 0.2]} c="#E8513F" />
      <Box p={[0.28, 0.52, -0.14]} s={[0.1, 0.28, 0.2]} c="#2C3A6B" />
    </group>
  );
}

function Couch() {
  return (
    <group position={[1.2, 0, 1.55]}>
      <Box p={[0.08, 0.28, 0]} s={[0.72, 0.28, 1.55]} c="#C48A55" />
      <Box p={[0.08, 0.42, 0]} s={[0.62, 0.16, 1.38]} c="#E8513F" />
      <Box p={[-0.28, 0.55, 0]} s={[0.22, 0.7, 1.55]} c="#C8373C" />
      <Box p={[0.08, 0.48, -0.72]} s={[0.7, 0.42, 0.22]} c="#C8373C" />
      <Box p={[0.08, 0.48, 0.72]} s={[0.7, 0.42, 0.22]} c="#C8373C" />
    </group>
  );
}

function Picture() {
  return (
    <group position={[0.62, 1.92, -3.82]}>
      <Box p={[0, 0, 0]} s={[1.05, 1.22, 0.1]} c="#C48A55" shadow={false} />
      <Box p={[0, 0, 0.05]} s={[0.86, 1.02, 0.06]} c="#7ED4EA" glow shadow={false} />
      <mesh position={[-0.14, 0.06, 0.1]} material={toon("#7B6CF6")} castShadow>
        <sphereGeometry args={[0.18, 10, 8]} />
      </mesh>
      <mesh position={[0.18, -0.14, 0.1]} material={toon("#FF8A65")} castShadow>
        <sphereGeometry args={[0.22, 10, 8]} />
      </mesh>
    </group>
  );
}

function RoomWindow({ p, rotY = 0 }: { p: V3; rotY?: number }) {
  return (
    <group position={p} rotation={[0, rotY, 0]}>
      <Box p={[0, 0, 0]} s={[1.35, 1.35, 0.1]} c="#C48A55" shadow={false} />
      <Box p={[0, 0, 0.04]} s={[1.12, 1.12, 0.06]} c="#FFE7A8" glow shadow={false} />
      <Box p={[0, 0, 0.08]} s={[0.06, 1.12, 0.02]} c="#C48A55" shadow={false} />
      <Box p={[0, 0, 0.08]} s={[1.12, 0.06, 0.02]} c="#C48A55" shadow={false} />
    </group>
  );
}

/** Upright in the south-wall cutouts. 1.35 tall at y=1.85 sits under the 3.15 wall. */
function SouthWindow({ x }: { x: number }) {
  return (
    <group position={[x, 1.85, 4]}>
      <Box p={[0, 0, 0]} s={[1.35, 1.35, 0.12]} c="#C48A55" shadow={false} />
      <Box p={[0, 0, 0]} s={[1.12, 1.12, 0.28]} c="#FFE7A8" glow shadow={false} />
      <Box p={[0, 0, 0.15]} s={[0.06, 1.12, 0.02]} c="#C48A55" shadow={false} />
      <Box p={[0, 0, 0.15]} s={[1.12, 0.06, 0.02]} c="#C48A55" shadow={false} />
      <Box p={[0, 0, -0.15]} s={[0.06, 1.12, 0.02]} c="#C48A55" shadow={false} />
      <Box p={[0, 0, -0.15]} s={[1.12, 0.06, 0.02]} c="#C48A55" shadow={false} />
    </group>
  );
}

function WindowAndBeam() {
  return (
    <group>
      <RoomWindow p={[2.55, 1.85, -3.86]} />
      <SouthWindow x={-2.45} />
      <SouthWindow x={2.45} />
      <mesh rotation={[-Math.PI / 2, 0, 0.55]} position={[1.25, 0.04, -0.85]} scale={[1.9, 1, 0.85]} material={flat("#F7D98A", 0.38, true)}>
        <circleGeometry args={[1.15, 28]} />
      </mesh>
    </group>
  );
}

function SouthWallSegment({ cx, span }: { cx: number; span: number }) {
  const t = 0.22;
  const z = 4;
  const h = 3.15;
  const wx = Math.sign(cx) * 2.45;
  const winW = 1.42;
  const winH = 1.42;
  const winY = 1.85;
  const sill = winY - winH / 2;
  const headerH = h - (winY + winH / 2);
  const headerY = winY + winH / 2 + headerH / 2;
  const x0 = cx - span / 2;
  const x1 = cx + span / 2;
  const leftW = wx - winW / 2 - x0;
  const rightW = x1 - (wx + winW / 2);
  return (
    <group>
      <Box p={[cx, sill / 2, z]} s={[span, sill, t]} c={HOUSE_COLORS.wall} />
      <Box p={[x0 + leftW / 2, winY, z]} s={[leftW, winH, t]} c={HOUSE_COLORS.wall} />
      <Box p={[x1 - rightW / 2, winY, z]} s={[rightW, winH, t]} c={HOUSE_COLORS.wall} />
      <Box p={[cx, headerY, z]} s={[span, headerH, t]} c={HOUSE_COLORS.wall} />
      <Box p={[cx, 0.92, 3.88]} s={[span, 0.18, 0.06]} c={HOUSE_COLORS.wainscot} shadow={false} />
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
      {/* North */}
      <Box p={[0, y, -4]} s={[10, h, t]} c={HOUSE_COLORS.wall} shadow={false} />
      <Box p={[0, stripe, -3.88]} s={[10, 0.18, 0.06]} c={HOUSE_COLORS.wainscot} shadow={false} />
      {/* South, door gap plus two upright window openings */}
      <SouthWallSegment cx={-2.85} span={4.3} />
      <SouthWallSegment cx={2.85} span={4.3} />
      {/* Door frame */}
      <Box p={[-0.78, 1.15, 4]} s={[0.16, 2.3, 0.28]} c="#8B5A32" />
      <Box p={[0.78, 1.15, 4]} s={[0.16, 2.3, 0.28]} c="#8B5A32" />
      <Box p={[0, 2.32, 4]} s={[1.72, 0.16, 0.28]} c="#8B5A32" />
      {/* East / west, with an open arch into the bath on the west. */}
      <Box p={[5, y, 0]} s={[t, h, 8.22]} c={HOUSE_COLORS.wall} />
      <Box p={[-5, y, -1.9]} s={[t, h, 4.4]} c={HOUSE_COLORS.wall} />
      <Box p={[-5, y, 3.1]} s={[t, h, 2.0]} c={HOUSE_COLORS.wall} />
      <Box p={[-4.88, stripe, -1.9]} s={[0.06, 0.18, 4.4]} c={HOUSE_COLORS.wainscot} shadow={false} />
      <Box p={[-4.88, stripe, 3.1]} s={[0.06, 0.18, 2.0]} c={HOUSE_COLORS.wainscot} shadow={false} />
      <Box p={[4.88, stripe, 0]} s={[0.06, 0.18, 8]} c={HOUSE_COLORS.wainscot} shadow={false} />
      {/* Arch into the bath */}
      <Box p={[-5, 1.15, 0.32]} s={[0.28, 2.3, 0.16]} c="#8B5A32" />
      <Box p={[-5, 1.15, 2.08]} s={[0.28, 2.3, 0.16]} c="#8B5A32" />
      <Box p={[-5, 2.32, 1.2]} s={[0.28, 0.16, 1.92]} c="#8B5A32" />
    </group>
  );
}

function Bathroom() {
  const h = 3.15;
  const y = h / 2;
  const t = 0.22;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-6.65, 0, 1.4]} material={toon("#E8D5C0", { noOcclude: true })} receiveShadow>
        <planeGeometry args={[3.4, 3.7]} />
      </mesh>
      <Box p={[-8.3, y, 1.4]} s={[t, h, 3.92]} c={HOUSE_COLORS.wall} />
      <Box p={[-6.65, y, -0.5]} s={[3.5, h, t]} c={HOUSE_COLORS.wall} />
      <Box p={[-6.65, y, 3.3]} s={[3.5, h, t]} c={HOUSE_COLORS.wall} />
      <Box p={[-8.18, 0.92, 1.4]} s={[0.06, 0.18, 3.7]} c={HOUSE_COLORS.wainscot} shadow={false} />
      <Box p={[-6.65, 0.92, -0.38]} s={[3.3, 0.18, 0.06]} c={HOUSE_COLORS.wainscot} shadow={false} />
      <Box p={[-6.65, 0.92, 3.18]} s={[3.3, 0.18, 0.06]} c={HOUSE_COLORS.wainscot} shadow={false} />
      {/* Tub */}
      <Box p={[-7.55, 0.28, 0.15]} s={[1.15, 0.55, 1.9]} c="#FFF6E6" />
      <Box p={[-7.55, 0.48, 0.15]} s={[0.88, 0.18, 1.62]} c="#A8E8F4" glow shadow={false} />
      <mesh position={[-7.35, 0.58, 0.55]} material={toon("#FF8A65")}>
        <sphereGeometry args={[0.1, 8, 8]} />
      </mesh>
      {/* Toilet */}
      <Box p={[-5.85, 0.22, -0.05]} s={[0.42, 0.44, 0.55]} c="#FFF6E6" />
      <Box p={[-5.85, 0.52, -0.18]} s={[0.38, 0.28, 0.22]} c="#FFF6E6" />
      {/* Sink + mirror */}
      <Box p={[-5.9, 0.55, 2.75]} s={[0.7, 0.12, 0.42]} c="#C48A55" />
      <mesh position={[-5.9, 0.7, 2.75]} material={toon("#FFF6E6")} castShadow>
        <cylinderGeometry args={[0.22, 0.18, 0.16, 12]} />
      </mesh>
      <Box p={[-5.9, 1.55, 3.16]} s={[0.55, 0.7, 0.06]} c="#C48A55" shadow={false} />
      <Box p={[-5.9, 1.55, 3.12]} s={[0.42, 0.55, 0.04]} c="#E4DDFF" glow shadow={false} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-6.5, 0.03, 1.5]} material={toon("#7ED4EA", { noOcclude: true })}>
        <circleGeometry args={[0.55, 16]} />
      </mesh>
    </group>
  );
}

function InteriorLights() {
  return (
    <>
      <hemisphereLight args={["#FFF6E6", "#C48A55", 0.7]} />
      <ambientLight intensity={0.42} />
      <directionalLight
        color="#FFE7A8"
        intensity={1.15}
        position={[5.5, 8.5, -7]}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0008}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />
      <pointLight color="#FFD9CC" intensity={0.55} distance={12} position={[0, 2.6, 0]} />
    </>
  );
}

export function ClearColor({ color }: { color: string }) {
  const { gl } = useThree();
  useLayoutEffect(() => {
    gl.setClearColor(color, 1);
  }, [gl, color]);
  return null;
}

export function InteriorWorld() {
  const { scene } = useThree();
  useLayoutEffect(() => {
    const prev = scene.fog;
    scene.fog = null;
    return () => {
      scene.fog = prev;
    };
  }, [scene]);
  return (
    <group>
      <ClearColor color="#141022" />
      <InteriorLights />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} material={toon(HOUSE_COLORS.floor, { noOcclude: true })} receiveShadow>
        <planeGeometry args={[10, 8]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.15, 0.025, 0.1]} material={toon(HOUSE_COLORS.rug, { noOcclude: true })}>
        <circleGeometry args={[1.85, 28]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 3.32]} material={toon("#E8513F", { noOcclude: true })}>
        <planeGeometry args={[1.45, 0.7]} />
      </mesh>
      <Walls />
      <Bathroom />
      <Bed />
      <Bookshelf />
      <Desk />
      <Kitchen />
      <Television />
      <Couch />
      <Picture />
      <WindowAndBeam />
      <Plant p={[-4.45, 0, -3.55]} />
      <Plant p={[-4.45, 0, 3.4]} />
      <Plant p={[4.45, 0, 3.4]} />
    </group>
  );
}
