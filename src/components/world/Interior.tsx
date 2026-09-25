"use client";

import { useLayoutEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { HOUSE_COLORS } from "@/game/interiors";
import { flat, palette, toon, toonGradient } from "@/game/materials";

type V3 = [number, number, number];

function Box({ p, s, c, r, glow, shadow = true, opacity }: { p: V3; s: V3; c: string; r?: V3; glow?: boolean; shadow?: boolean; opacity?: number }) {
  return (
    <mesh position={p} rotation={r} material={toon(c, { emissive: glow ? c : undefined, transparent: opacity !== undefined, opacity, noOcclude: true })} castShadow={shadow} receiveShadow={shadow}>
      <boxGeometry args={s} />
    </mesh>
  );
}

function titleTex(title: string, detail: string, bg: string) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 384;
  const g = c.getContext("2d")!;
  g.fillStyle = bg;
  g.fillRect(0, 0, 256, 384);
  g.fillStyle = "rgba(255,255,255,0.12)";
  g.fillRect(18, 18, 220, 348);
  g.fillStyle = "#FFF6E6";
  g.font = "bold 28px ui-sans-serif, system-ui, sans-serif";
  const words = title.split(" ");
  let y = 160;
  for (const w of words) {
    g.fillText(w, 32, y);
    y += 36;
  }
  g.font = "16px ui-sans-serif, system-ui, sans-serif";
  g.fillStyle = "rgba(255,246,230,0.8)";
  g.fillText(detail, 32, 330);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function Poster({ p, title, detail, color, rotY = 0 }: { p: V3; title: string; detail: string; color: string; rotY?: number }) {
  const tex = useMemo(() => titleTex(title, detail, color), [title, detail, color]);
  const mat = useMemo(() => new THREE.MeshToonMaterial({ map: tex, gradientMap: toonGradient() }), [tex]);
  return (
    <mesh position={p} rotation={[0, rotY, 0]} material={mat} castShadow>
      <boxGeometry args={[0.52, 0.78, 0.06]} />
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
  for (let i = 0; i < 5; i++)
    for (let j = 0; j < 4; j++) patches.push([(i - 2) * 0.38, (j - 1.5) * 0.32, cols[(i + j) % cols.length]!]);
  return (
    <group position={[-3.1, 0, -1.35]}>
      <Box p={[0, 0.18, 0]} s={[2.35, 0.36, 1.55]} c="#8B5A32" />
      <Box p={[0, 0.42, 0.02]} s={[2.18, 0.16, 1.38]} c="#FFF6E6" />
      <group position={[0, 0.52, 0.02]}>
        {patches.map(([x, z, c], k) => (
          <Box key={k} p={[x, 0, z]} s={[0.36, 0.05, 0.3]} c={c} shadow={false} />
        ))}
      </group>
      <Box p={[0, 0.58, -0.62]} s={[2.05, 0.28, 0.42]} c="#FFF6E6" />
      <Box p={[-1.12, 0.22, 0.78]} s={[0.16, 0.44, 0.16]} c="#6E4526" />
      <Box p={[1.12, 0.22, 0.78]} s={[0.16, 0.44, 0.16]} c="#6E4526" />
      <Box p={[-1.12, 0.22, -0.78]} s={[0.16, 0.44, 0.16]} c="#6E4526" />
      <Box p={[1.12, 0.22, -0.78]} s={[0.16, 0.44, 0.16]} c="#6E4526" />
    </group>
  );
}

function Bookshelf() {
  const books = [
    [-0.55, "#C8373C"],
    [-0.38, "#4B3FB5"],
    [-0.22, "#FFC857"],
    [-0.06, "#2F7A4B"],
    [0.12, "#E8513F"],
    [0.28, "#7B6CF6"],
    [0.46, "#FF8A65"],
  ] as const;
  return (
    <group position={[-0.95, 0, -3.55]}>
      <Box p={[0, 1.15, 0]} s={[1.7, 2.3, 0.48]} c="#8B5A32" />
      <Box p={[0, 1.15, 0.08]} s={[1.5, 2.08, 0.36]} c="#5C3A22" />
      {[0.35, 0.95, 1.55, 2.15].map((y) => (
        <Box key={y} p={[0, y, 0.02]} s={[1.52, 0.08, 0.42]} c="#A56B3C" shadow={false} />
      ))}
      {books.map(([x, c], k) => (
        <Box key={k} p={[x, 0.68, 0.06]} s={[0.14, 0.52, 0.28]} c={c} />
      ))}
      {books.map(([x, c], k) => (
        <Box key={`b${k}`} p={[x, 1.28, 0.06]} s={[0.14, 0.48, 0.28]} c={k % 2 ? "#FFF6E6" : c} />
      ))}
      {books.slice(0, 5).map(([x, c], k) => (
        <Box key={`c${k}`} p={[x + 0.08, 1.88, 0.06]} s={[0.14, 0.44, 0.28]} c={c} />
      ))}
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
    <group position={[3.5, 0, 1.55]}>
      <Box p={[0, 0.22, 0]} s={[1.55, 0.44, 0.7]} c="#6E4526" />
      <Box p={[0, 0.78, -0.02]} s={[1.05, 0.72, 0.55]} c="#3B3470" />
      <Box p={[0, 0.8, 0.22]} s={[0.82, 0.5, 0.08]} c="#1A1730" glow />
      <Box p={[0.48, 0.78, 0.12]} s={[0.06, 0.18, 0.06]} c="#C8B79A" shadow={false} />
      {/* Console */}
      <Box p={[-0.15, 0.5, 0.38]} s={[0.7, 0.14, 0.38]} c="#7B6CF6" />
      <Box p={[-0.15, 0.5, 0.55]} s={[0.18, 0.04, 0.08]} c="#FFC857" shadow={false} />
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

function WindowAndBeam() {
  return (
    <group>
      <RoomWindow p={[2.55, 1.85, -3.86]} />
      {/* South wall: same window, twice, flanking the door, panes facing the camera. */}
      <RoomWindow p={[-2.45, 1.85, 3.78]} />
      <RoomWindow p={[2.45, 1.85, 3.78]} />
      <mesh rotation={[-Math.PI / 2, 0, 0.55]} position={[1.25, 0.04, -0.85]} scale={[1.9, 1, 0.85]} material={flat("#F7D98A", 0.38, true)}>
        <circleGeometry args={[1.15, 28]} />
      </mesh>
      <mesh position={[1.7, 1.55, -2.4]} rotation={[0.72, 0, -0.32]} material={flat("#FFE7A8", 0.18, true)}>
        <planeGeometry args={[1.6, 2.4]} />
      </mesh>
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
      {/* South, with a door gap */}
      <Box p={[-2.85, y, 4]} s={[4.3, h, t]} c={HOUSE_COLORS.wall} />
      <Box p={[2.85, y, 4]} s={[4.3, h, t]} c={HOUSE_COLORS.wall} />
      <Box p={[-2.85, stripe, 3.88]} s={[4.3, 0.18, 0.06]} c={HOUSE_COLORS.wainscot} shadow={false} />
      <Box p={[2.85, stripe, 3.88]} s={[4.3, 0.18, 0.06]} c={HOUSE_COLORS.wainscot} shadow={false} />
      {/* Door frame */}
      <Box p={[-0.78, 1.15, 4]} s={[0.16, 2.3, 0.28]} c="#8B5A32" />
      <Box p={[0.78, 1.15, 4]} s={[0.16, 2.3, 0.28]} c="#8B5A32" />
      <Box p={[0, 2.32, 4]} s={[1.72, 0.16, 0.28]} c="#8B5A32" />
      {/* East / west */}
      <Box p={[-5, y, 0]} s={[t, h, 8.22]} c={HOUSE_COLORS.wall} />
      <Box p={[5, y, 0]} s={[t, h, 8.22]} c={HOUSE_COLORS.wall} />
      <Box p={[-4.88, stripe, 0]} s={[0.06, 0.18, 8]} c={HOUSE_COLORS.wainscot} shadow={false} />
      <Box p={[4.88, stripe, 0]} s={[0.06, 0.18, 8]} c={HOUSE_COLORS.wainscot} shadow={false} />
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
      <Bed />
      <Bookshelf />
      <Desk />
      <Television />
      <Picture />
      <WindowAndBeam />
      <Plant p={[-4.45, 0, -3.55]} />
      <Plant p={[4.45, 0, -3.55]} />
      <Plant p={[-4.45, 0, 3.4]} />
      <Plant p={[4.45, 0, 3.4]} />
      <Poster p={[2.85, 0.72, 2.05]} title="Lanterns" detail="HBO Max" color="#1F6B4A" rotY={0.35} />
      <Poster p={[3.35, 0.72, 2.22]} title="Jane the Virgin" detail="Rewatch" color="#E8513F" rotY={0.12} />
      <Poster p={[3.85, 0.72, 2.12]} title="Suits" detail="Legal popcorn" color="#2C3A6B" rotY={-0.2} />
    </group>
  );
}
