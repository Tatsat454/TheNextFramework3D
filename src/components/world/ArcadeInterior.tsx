"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { arcadePal } from "@/content/landmarks";
import { sfx } from "@/game/audio";
import { ARCADE_COLORS, canStepInterior } from "@/game/interiors";
import { flat, toon } from "@/game/materials";
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

const CABINETS = [
  { x: -4.5, body: "#4A2458", marquee: "#6B2430", deck: "#5A2450", neonL: "#FF5ADF", neonR: "#C8373C", stick: "#FF5F83", title: "GOW" },
  { x: -1.5, body: "#243A52", marquee: "#1F4A3A", deck: "#2A4058", neonL: "#3DDC82", neonR: "#5AE8FF", stick: "#54CFFF", title: "VII" },
  { x: 1.5, body: "#2A4A62", marquee: "#3A5A78", deck: "#34556E", neonL: "#A8E8F4", neonR: "#FFFFFF", stick: "#8FD3E8", title: "XY" },
  { x: 4.5, body: "#4A2E1C", marquee: "#6B3A20", deck: "#5A3820", neonL: "#FF8A4A", neonR: "#2EC4B6", stick: "#FFC857", title: "HZD" },
] as const;

const artCache = new Map<string, THREE.CanvasTexture>();

function cabArt(mood: number, kind: "side" | "screen" | "kick") {
  const key = `${mood}-${kind}`;
  const hit = artCache.get(key);
  if (hit) return hit;
  const w = kind === "side" ? 256 : 512;
  const h = kind === "side" ? 512 : kind === "screen" ? 320 : 220;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  const rng = (() => {
    let seed = (mood + 1) * 9973 + (kind === "side" ? 3 : kind === "screen" ? 7 : 11);
    return () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
  })();
  const palettes = [
    ["#2A1520", "#8B1E2D", "#8A8A8A", "#C8373C", "#FF6B6B"],
    ["#152030", "#1F4A3A", "#4A6A8A", "#3DDC82", "#5AE8FF"],
    ["#1A2A40", "#4A6A8A", "#A8E8F4", "#FFFFFF", "#8FD3E8"],
    ["#2A1810", "#FF8A4A", "#E8513F", "#2EC4B6", "#FFC857"],
  ] as const;
  const pal = palettes[mood]!;
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, pal[0]);
  g.addColorStop(1, pal[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 28; i++) {
    ctx.fillStyle = i % 2 ? pal[3] : pal[4];
    ctx.globalAlpha = 0.35 + rng() * 0.4;
    ctx.beginPath();
    ctx.arc(rng() * w, rng() * h, 2 + rng() * 5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  if (mood === 0) {
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i % 2 ? pal[2] : pal[3];
      ctx.beginPath();
      const x = rng() * w;
      const y = rng() * h;
      ctx.moveTo(x, y);
      ctx.lineTo(x + 20 + rng() * 40, y + 50 + rng() * 80);
      ctx.lineTo(x - 10 - rng() * 30, y + 40 + rng() * 70);
      ctx.closePath();
      ctx.fill();
    }
  } else if (mood === 1) {
    const base = kind === "screen" ? h * 0.62 : h * 0.55;
    for (let i = 0; i < 9; i++) {
      const bw = w / 9;
      const bh = 30 + rng() * (kind === "screen" ? 70 : 140);
      ctx.fillStyle = i % 2 ? pal[2] : pal[1];
      ctx.fillRect(i * bw + 4, base - bh, bw - 8, bh);
      ctx.fillStyle = pal[3];
      for (let wy = 0; wy < 4; wy++) ctx.fillRect(i * bw + 10, base - bh + 8 + wy * 14, 6, 6);
    }
  } else if (mood === 2) {
    for (let i = 0; i < 7; i++) {
      const cx = 30 + rng() * (w - 60);
      const cy = 30 + rng() * (h - 60);
      const rad = 12 + rng() * 28;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rng() * Math.PI);
      ctx.fillStyle = i % 2 ? pal[2] : pal[3];
      ctx.beginPath();
      ctx.moveTo(0, -rad);
      ctx.lineTo(rad * 0.6, 0);
      ctx.lineTo(0, rad);
      ctx.lineTo(-rad * 0.6, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  } else {
    ctx.fillStyle = pal[1];
    ctx.beginPath();
    ctx.ellipse(w * 0.35, h * 0.78, w * 0.4, h * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = pal[2];
    ctx.beginPath();
    ctx.ellipse(w * 0.7, h * 0.82, w * 0.32, h * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = pal[4];
    ctx.beginPath();
    ctx.arc(w * 0.78, h * 0.22, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = pal[3];
    for (let i = 0; i < 12; i++) ctx.fillRect(20 + i * (w / 14), h * 0.55 - rng() * 40, 5, 28 + rng() * 36);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  artCache.set(key, tex);
  return tex;
}

function NeonStrip({ p, s, c }: { p: V3; s: V3; c: string }) {
  return <Box p={p} s={s} c={c} glow shadow={false} />;
}

function CabButton({ x, y, z, color }: { x: number; y: number; z: number; color: string }) {
  return (
    <mesh position={[x, y, z]} rotation={[-Math.PI / 2, 0, 0]} material={toon(color, { emissive: color, noOcclude: true })} castShadow>
      <cylinderGeometry args={[0.12, 0.12, 0.06, 12]} />
    </mesh>
  );
}

const GLYPH: Record<string, string[]> = {
  A: ["01110", "10001", "11111", "10001", "10001"],
  C: ["01110", "10001", "10000", "10001", "01110"],
  D: ["11110", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "11110", "10000", "11111"],
  I: ["11111", "00100", "00100", "00100", "11111"],
  N: ["10001", "11001", "10101", "10011", "10001"],
  O: ["01110", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "11110", "10000", "10000"],
  R: ["11110", "10001", "11110", "10100", "10010"],
  S: ["01111", "10000", "01110", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100"],
  H: ["10001", "10001", "11111", "10001", "10001"],
  U: ["10001", "10001", "10001", "10001", "01110"],
  G: ["01110", "10000", "10111", "10001", "01110"],
  W: ["10001", "10001", "10101", "10101", "01010"],
  V: ["10001", "10001", "10001", "01010", "00100"],
  X: ["10001", "01010", "00100", "01010", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100"],
  Z: ["11111", "00010", "00100", "01000", "11111"],
};

function NeonLine({ text, color, p, cells = 0.12 }: { text: string; color: string; p: V3; cells?: number }) {
  const gap = cells * 0.9;
  const letterW = 5 * cells + gap;
  const width = text.length * letterW - gap;
  return (
    <group position={[p[0] - width / 2 + letterW / 2, p[1], p[2]]}>
      {text.split("").map((ch, i) => {
        const rows = GLYPH[ch];
        if (!rows) return <group key={i} />;
        return (
          <group key={i} position={[i * letterW, 0, 0]}>
            {rows.flatMap((row, y) =>
              row.split("").map((bit, x) =>
                bit === "1" ? (
                  <Box
                    key={`${x}:${y}`}
                    p={[(x - 2) * cells, (2 - y) * cells, 0]}
                    s={[cells * 0.82, cells * 0.82, 0.07]}
                    c={color}
                    glow
                    shadow={false}
                  />
                ) : null,
              ),
            )}
          </group>
        );
      })}
    </group>
  );
}

function Cabinet({ i }: { i: number }) {
  const spec = CABINETS[i]!;
  const side = useMemo(() => cabArt(i, "side"), [i]);
  const screen = useMemo(() => cabArt(i, "screen"), [i]);
  const kick = useMemo(() => cabArt(i, "kick"), [i]);
  const bodyMat = toon(spec.body, { noOcclude: true });
  const marqueeMat = toon(spec.marquee, { noOcclude: true });
  const deckMat = toon(spec.deck, { noOcclude: true });
  const frameMat = toon("#151632", { noOcclude: true });
  const coinMat = toon("#171522", { noOcclude: true });
  return (
    <group position={[spec.x, 0, -3.55]} scale={0.42}>
      <RoundedBox args={[2.45, 2.75, 1.9]} radius={0.12} smoothness={4} position={[0, 1.37, 0]} castShadow receiveShadow material={bodyMat} />
      <RoundedBox args={[2.35, 2.05, 1.48]} radius={0.13} smoothness={4} position={[0, 3.45, -0.15]} castShadow material={bodyMat} />
      <RoundedBox args={[2.55, 0.75, 1.56]} radius={0.18} smoothness={4} position={[0, 4.83, -0.12]} castShadow material={marqueeMat} />
      <NeonLine text={spec.title} color="#FFF9DD" p={[0, 4.86, 0.7]} cells={0.22} />
      <RoundedBox args={[1.95, 1.28, 0.13]} radius={0.08} smoothness={4} position={[0, 3.5, 0.66]} castShadow material={frameMat} />
      <mesh position={[0, 3.5, 0.74]}>
        <planeGeometry args={[1.72, 1.04]} />
        <meshBasicMaterial map={screen} toneMapped={false} />
      </mesh>
      <mesh position={[0, 2.42, 0.68]} rotation={[-0.28, 0, 0]} material={deckMat} castShadow>
        <boxGeometry args={[2.35, 0.28, 1.16]} />
      </mesh>
      <mesh position={[-0.58, 2.62, 0.72]} material={toon("#161522", { noOcclude: true })} castShadow>
        <cylinderGeometry args={[0.055, 0.055, 0.42, 12]} />
      </mesh>
      <mesh position={[-0.58, 2.88, 0.72]} material={toon(spec.stick, { emissive: spec.stick, noOcclude: true })} castShadow>
        <sphereGeometry args={[0.16, 14, 12]} />
      </mesh>
      <CabButton x={0.28} y={2.58} z={0.86} color="#FF5CB9" />
      <CabButton x={0.58} y={2.58} z={0.86} color="#FFC64D" />
      <CabButton x={0.88} y={2.58} z={0.86} color="#54CFFF" />
      <CabButton x={0.4} y={2.56} z={0.52} color="#FF7C45" />
      <CabButton x={0.7} y={2.56} z={0.52} color="#FFE46F" />
      <CabButton x={1.0} y={2.56} z={0.52} color="#67E0FF" />
      <RoundedBox args={[0.42, 0.7, 0.08]} radius={0.05} smoothness={4} position={[-0.28, 1.18, 0.985]} castShadow material={coinMat} />
      <RoundedBox args={[0.42, 0.7, 0.08]} radius={0.05} smoothness={4} position={[0.28, 1.18, 0.985]} castShadow material={coinMat} />
      <mesh position={[0, 0.55, 0.96]}>
        <planeGeometry args={[2.08, 0.85]} />
        <meshBasicMaterial map={kick} toneMapped={false} />
      </mesh>
      <mesh position={[-1.236, 2.18, -0.08]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.62, 4.2]} />
        <meshBasicMaterial map={side} toneMapped={false} />
      </mesh>
      <mesh position={[1.236, 2.18, -0.08]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.62, 4.2]} />
        <meshBasicMaterial map={side} toneMapped={false} />
      </mesh>
      <NeonStrip p={[-1.24, 2.2, 0.92]} s={[0.045, 4.4, 0.045]} c={spec.neonL} />
      <NeonStrip p={[1.24, 2.2, 0.92]} s={[0.045, 4.4, 0.045]} c={spec.neonR} />
      <NeonStrip p={[0, 0.03, 0.95]} s={[2.42, 0.05, 0.05]} c={spec.neonL} />
      <NeonStrip p={[0, 5.22, 0.55]} s={[2.35, 0.05, 0.05]} c={spec.neonR} />
    </group>
  );
}

function NeonSign() {
  return (
    <group position={[0, 2.78, -4.32]}>
      <Box p={[0, -0.06, -0.06]} s={[9.2, 1.35, 0.1]} c="#12101C" shadow={false} />
      <NeonLine text="INSPIRATION" color="#FF5AD9" p={[0, 0.32, 0]} cells={0.11} />
      <NeonLine text="ARCADE" color="#5AE8FF" p={[0, -0.38, 0]} cells={0.16} />
    </group>
  );
}

function StringLights() {
  const bulbs = useMemo(() => {
    const out: V3[] = [];
    for (let x = -5.4; x <= 5.4; x += 0.72) out.push([x, 3.02, -4.32]);
    for (let z = -4.0; z <= 3.9; z += 0.78) {
      out.push([5.86, 3.02, z]);
      out.push([-5.86, 3.02, z]);
    }
    return out;
  }, []);
  return (
    <group>
      {bulbs.map((p, k) => (
        <group key={k} position={p}>
          <mesh position={[0, 0.12, 0]} material={toon("#2A2548")}>
            <cylinderGeometry args={[0.008, 0.008, 0.2, 6]} />
          </mesh>
          <mesh position={[0, 0, 0]} material={toon("#FFE7A8", { emissive: "#FFE7A8", noOcclude: true })}>
            <sphereGeometry args={[0.07, 8, 8]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function CheckerFloor() {
  const tiles = useMemo(() => {
    const out: V3[] = [];
    for (let x = -5.5; x <= 5.5; x += 1) {
      for (let z = -4; z <= 4; z += 1) {
        if ((Math.round(x + 5.5) + Math.round(z + 4)) % 2 === 0) out.push([x, 0.02, z]);
      }
    }
    return out;
  }, []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} material={toon(ARCADE_COLORS.floor, { noOcclude: true })} receiveShadow>
        <planeGeometry args={[12, 9]} />
      </mesh>
      {tiles.map((p, k) => (
        <Box key={k} p={p} s={[0.96, 0.03, 0.96]} c={ARCADE_COLORS.floorAlt} shadow={false} />
      ))}
    </group>
  );
}

function Walls() {
  const h = 3.15;
  const y = h / 2;
  const t = 0.22;
  const southH = 1.68;
  return (
    <group>
      <Box p={[0, y, -4.5]} s={[12, h, t]} c={ARCADE_COLORS.wall} shadow={false} />
      <Box p={[6, y, 0]} s={[t, h, 9.22]} c={ARCADE_COLORS.wall} />
      <Box p={[-6, y, 0]} s={[t, h, 9.22]} c={ARCADE_COLORS.wall} />
      <Box p={[-3.85, southH / 2, 4.5]} s={[4.3, southH, t]} c={ARCADE_COLORS.wall} />
      <Box p={[3.85, southH / 2, 4.5]} s={[4.3, southH, t]} c={ARCADE_COLORS.wall} />
      <Box p={[-0.88, 0.95, 4.5]} s={[0.14, 1.9, 0.28]} c="#FF5AD9" glow />
      <Box p={[0.88, 0.95, 4.5]} s={[0.14, 1.9, 0.28]} c="#5AE8FF" glow />
      <Box p={[0, 1.92, 4.5]} s={[1.9, 0.12, 0.28]} c="#FF5AD9" glow />
    </group>
  );
}

function BeanbagCorner() {
  return (
    <group position={[-4.45, 0, 2.75]}>
      <mesh position={[0, 0.28, 0]} scale={[1.15, 0.72, 1.05]} material={toon("#C8373C")} castShadow>
        <sphereGeometry args={[0.55, 16, 12]} />
      </mesh>
      <mesh position={[0.12, 0.52, 0.18]} scale={[0.7, 0.35, 0.7]} material={toon("#E8513F")} castShadow>
        <sphereGeometry args={[0.42, 12, 10]} />
      </mesh>
      <group position={[0.35, 0.62, 0.22]} rotation={[-0.5, 0.4, 0.2]}>
        <Box p={[0, 0, 0]} s={[0.38, 0.06, 0.58]} c="#C8B79A" />
        <Box p={[0, 0.04, 0.04]} s={[0.26, 0.03, 0.38]} c="#1E1B3A" />
        <Box p={[0, 0.055, 0.04]} s={[0.2, 0.02, 0.3]} c="#7EDC7A" glow shadow={false} />
        <Box p={[0.08, -0.02, -0.18]} s={[0.06, 0.04, 0.1]} c="#4B3FB5" />
      </group>
    </group>
  );
}

function ArcadeLights() {
  return (
    <>
      <hemisphereLight args={["#FFE6F8", "#2B2350", 0.55]} />
      <ambientLight intensity={0.38} />
      <directionalLight
        color="#FFE7A8"
        intensity={0.85}
        position={[4, 9, -6]}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0008}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />
      <pointLight color="#FF5AD9" intensity={0.7} distance={14} position={[0, 2.8, -3.2]} />
      <pointLight color="#5AE8FF" intensity={0.35} distance={10} position={[0, 2.2, 2]} />
    </>
  );
}

function PalFace() {
  return (
    <group>
      <Box p={[0, 0.12, 0.165]} s={[0.28, 0.22, 0.04]} c="#141022" shadow={false} />
      <group name="face-idle" visible={false}>
        <Box p={[-0.06, 0.16, 0.19]} s={[0.045, 0.05, 0.02]} c="#5AE8FF" glow shadow={false} />
        <Box p={[0.06, 0.16, 0.19]} s={[0.045, 0.05, 0.02]} c="#5AE8FF" glow shadow={false} />
        <Box p={[0, 0.07, 0.19]} s={[0.1, 0.025, 0.02]} c="#FFC857" glow shadow={false} />
      </group>
      <group name="face-wave">
        <Box p={[-0.06, 0.16, 0.19]} s={[0.045, 0.06, 0.02]} c="#5AE8FF" glow shadow={false} />
        <Box p={[0.06, 0.16, 0.19]} s={[0.045, 0.06, 0.02]} c="#5AE8FF" glow shadow={false} />
        <Box p={[0, 0.06, 0.19]} s={[0.14, 0.03, 0.02]} c="#FFC857" glow shadow={false} />
        <Box p={[0.11, 0.1, 0.19]} s={[0.04, 0.04, 0.02]} c="#FF8AE2" glow shadow={false} />
      </group>
      <group name="face-wow" visible={false}>
        <Box p={[-0.06, 0.16, 0.19]} s={[0.05, 0.07, 0.02]} c="#5AE8FF" glow shadow={false} />
        <Box p={[0.06, 0.16, 0.19]} s={[0.05, 0.07, 0.02]} c="#5AE8FF" glow shadow={false} />
        <Box p={[0, 0.06, 0.19]} s={[0.08, 0.05, 0.02]} c="#FFC857" glow shadow={false} />
      </group>
    </group>
  );
}

function BlinkPal() {
  const group = useRef<THREE.Group>(null);
  const arm = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const st = useRef({
    x: 1.4,
    z: 3.15,
    facing: Math.PI,
    phase: 0,
    greetAt: performance.now(),
    greeted: false,
    mood: "wave" as "idle" | "wave" | "wow",
  });

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20);
    const g = group.current;
    if (!g) return;
    const s = st.current;
    const game = useGame.getState();
    const now = performance.now();
    const elapsed = now - s.greetAt;
    const rm = reducedMotion.value;
    const atCabinet = !!game.nearby?.startsWith("prop:cabinet");

    if (!s.greeted && !game.transitioning && elapsed > 720) {
      s.greeted = true;
      useGame.setState({
        dialog: {
          speaker: arcadePal.id,
          name: arcadePal.name,
          role: arcadePal.role,
          tagColor: arcadePal.tagColor,
          voice: arcadePal.voice,
          lines: arcadePal.welcome,
          index: 0,
        },
      });
      sfx.open();
    }

    s.mood = elapsed < 1800 ? "wave" : atCabinet ? "wow" : "idle";
    if (inner.current) {
      const idle = inner.current.getObjectByName("face-idle");
      const wave = inner.current.getObjectByName("face-wave");
      const wow = inner.current.getObjectByName("face-wow");
      if (idle) idle.visible = s.mood === "idle";
      if (wave) wave.visible = s.mood === "wave";
      if (wow) wow.visible = s.mood === "wow";
    }

    const follow = s.greeted && !game.dialog;
    if (follow) {
      const tx = player.x - Math.sin(player.facing) * 1.38;
      const tz = player.z - Math.cos(player.facing) * 1.38;
      const dx = tx - s.x;
      const dz = tz - s.z;
      const d = Math.hypot(dx, dz);
      if (d > 0.18) {
        const step = Math.min(d, 2.6 * dt);
        const nx = s.x + (dx / d) * step;
        const nz = s.z + (dz / d) * step;
        if (canStepInterior("arcade", nx, nz) && Math.hypot(nx - player.x, nz - player.z) > 0.7) {
          s.x = nx;
          s.z = nz;
        } else if (canStepInterior("arcade", nx, s.z)) s.x = nx;
        else if (canStepInterior("arcade", s.x, nz)) s.z = nz;
        s.facing += (((Math.atan2(dx, dz) - s.facing + Math.PI * 3) % (Math.PI * 2)) - Math.PI) * 0.14;
        s.phase += dt * 10;
      }
    } else {
      const face = Math.atan2(player.x - s.x, player.z - s.z);
      s.facing += (((face - s.facing + Math.PI * 3) % (Math.PI * 2)) - Math.PI) * 0.16;
    }

    const greetHop = !rm && elapsed < 1600 ? Math.abs(Math.sin((elapsed / 1000) * 9)) * 0.18 : 0;
    const walkHop = !rm && follow ? Math.abs(Math.sin(s.phase)) * 0.07 : 0;
    const cabinetHop = !rm && atCabinet ? Math.abs(Math.sin(state.clock.elapsedTime * 8)) * 0.14 : 0;
    g.position.set(s.x, greetHop + walkHop + cabinetHop, s.z);
    g.rotation.y = s.facing;

    if (arm.current) {
      const wave = !rm && elapsed < 1800 ? -2.4 + Math.sin(elapsed / 1000 * 14) * 0.45 : -0.25;
      arm.current.rotation.x += (wave - arm.current.rotation.x) * 0.2;
    }
    if (inner.current && !rm) {
      const breathe = 1 + Math.sin(state.clock.elapsedTime * 2.6) * 0.03;
      inner.current.scale.set(breathe, 1 / breathe, breathe);
    }
  });

  return (
    <group ref={group} scale={1.18}>
      <group ref={inner}>
        <mesh position={[-0.08, 0.05, 0.04]} rotation={[Math.PI / 2, 0, 0]} material={toon("#4B3FB5")} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.08, 10]} />
        </mesh>
        <mesh position={[0.08, 0.05, 0.04]} rotation={[Math.PI / 2, 0, 0]} material={toon("#4B3FB5")} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.08, 10]} />
        </mesh>
        <mesh position={[0, 0.32, 0]} scale={[1, 0.88, 0.95]} material={toon("#F4E8D0")} castShadow>
          <sphereGeometry args={[0.28, 16, 14]} />
        </mesh>
        <mesh position={[0, 0.28, 0.06]} scale={[0.85, 0.7, 0.6]} material={toon("#E8D5FF")}>
          <sphereGeometry args={[0.2, 12, 10]} />
        </mesh>
        <group ref={arm} position={[0.24, 0.38, 0]}>
          <mesh position={[0.02, -0.08, 0]} rotation={[0, 0, 0.4]} material={toon("#C7B9FF")} castShadow>
            <capsuleGeometry args={[0.045, 0.1, 4, 8]} />
          </mesh>
        </group>
        <mesh position={[-0.24, 0.36, 0]} rotation={[0, 0, -0.4]} material={toon("#C7B9FF")} castShadow>
          <capsuleGeometry args={[0.045, 0.1, 4, 8]} />
        </mesh>
        <mesh position={[0, 0.62, 0]} material={toon("#F4E8D0")} castShadow>
          <sphereGeometry args={[0.2, 16, 14]} />
        </mesh>
        <Box p={[0, 0.72, 0.12]} s={[0.32, 0.06, 0.12]} c="#5AE8FF" glow shadow={false} />
        <mesh position={[0, 0.84, -0.02]} material={toon("#4B3FB5")}>
          <cylinderGeometry args={[0.015, 0.015, 0.14, 6]} />
        </mesh>
        <mesh position={[0, 0.94, -0.02]} material={toon("#FF5AD9", { emissive: "#FF5AD9", noOcclude: true })}>
          <sphereGeometry args={[0.04, 8, 8]} />
        </mesh>
        <group position={[0, 0.62, 0]}>
          <PalFace />
        </group>
      </group>
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]} material={flat("#1E1B3A", 0.28)}>
        <circleGeometry args={[0.24, 14]} />
      </mesh>
    </group>
  );
}

export function ArcadeWorld() {
  return (
    <group>
      <ClearColor color="#100818" />
      <ArcadeLights />
      <CheckerFloor />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 3.85]} material={toon("#E8513F", { noOcclude: true })}>
        <planeGeometry args={[1.5, 0.72]} />
      </mesh>
      <Walls />
      <StringLights />
      <NeonSign />
      {CABINETS.map((_, i) => (
        <Cabinet key={i} i={i} />
      ))}
      <BeanbagCorner />
      <BlinkPal />
    </group>
  );
}
