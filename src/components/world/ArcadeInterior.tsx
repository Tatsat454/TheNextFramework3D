"use client";

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

const CABINETS: { x: number; body: string; marquee: string; screen: string }[] = [
  { x: -4.5, body: "#6B2430", marquee: "#C8373C", screen: "#FF6B6B" },
  { x: -1.5, body: "#243A52", marquee: "#2F7A4B", screen: "#3DDC82" },
  { x: 1.5, body: "#2A4A62", marquee: "#8FD3E8", screen: "#A8E8F4" },
  { x: 4.5, body: "#4A2E1C", marquee: "#FF8A4A", screen: "#FFC857" },
];

function JaggedArt() {
  return (
    <group>
      <Box p={[0, 0.22, 0.08]} s={[0.04, 0.7, 0.28]} c="#8A8A8A" r={[0, 0, 0.45]} shadow={false} />
      <Box p={[0, -0.05, -0.12]} s={[0.04, 0.55, 0.22]} c="#8B1E2D" r={[0, 0, -0.55]} shadow={false} />
      <Box p={[0, 0.35, -0.18]} s={[0.04, 0.32, 0.18]} c="#C8373C" r={[0, 0, 0.2]} shadow={false} />
      <Box p={[0, -0.28, 0.16]} s={[0.04, 0.28, 0.16]} c="#5A5A5A" r={[0, 0, -0.3]} shadow={false} />
    </group>
  );
}

function SkylineArt() {
  const blocks = [
    [-0.22, -0.18, 0.28],
    [-0.08, -0.02, 0.55],
    [0.06, -0.12, 0.38],
    [0.2, -0.22, 0.22],
    [-0.16, -0.28, 0.16],
    [0.14, -0.3, 0.12],
  ] as const;
  return (
    <group>
      {blocks.map(([z, y, h], k) => (
        <Box key={k} p={[0, y + h / 2, z]} s={[0.04, h, 0.1]} c={k % 2 ? "#4A6A8A" : "#2F7A4B"} shadow={false} />
      ))}
      {[-0.1, 0.02, 0.12].map((z, k) => (
        <Box key={`w${k}`} p={[0.02, 0.12, z]} s={[0.02, 0.06, 0.04]} c="#3DDC82" glow shadow={false} />
      ))}
    </group>
  );
}

function CrystalArt() {
  return (
    <group>
      <mesh position={[0, 0.18, 0]} rotation={[0, 0, 0.2]} material={toon("#A8E8F4", { emissive: "#A8E8F4", noOcclude: true })}>
        <octahedronGeometry args={[0.22, 0]} />
      </mesh>
      <mesh position={[0, -0.12, 0.14]} rotation={[0.3, 0, -0.4]} material={toon("#FFFFFF", { noOcclude: true })}>
        <octahedronGeometry args={[0.12, 0]} />
      </mesh>
      <mesh position={[0, -0.18, -0.16]} rotation={[-0.2, 0, 0.5]} material={toon("#8FD3E8", { emissive: "#8FD3E8", noOcclude: true })}>
        <octahedronGeometry args={[0.1, 0]} />
      </mesh>
    </group>
  );
}

function HillsArt() {
  return (
    <group>
      <mesh position={[0, -0.22, 0.05]} scale={[0.2, 0.28, 0.7]} material={toon("#FF8A4A", { noOcclude: true })}>
        <sphereGeometry args={[0.35, 10, 8]} />
      </mesh>
      <mesh position={[0, -0.18, -0.16]} scale={[0.18, 0.22, 0.5]} material={toon("#E8513F", { noOcclude: true })}>
        <sphereGeometry args={[0.3, 10, 8]} />
      </mesh>
      {[-0.22, -0.08, 0.06, 0.18, 0.28].map((z, k) => (
        <Box key={k} p={[0, -0.02 + (k % 3) * 0.04, z]} s={[0.03, 0.22 + (k % 2) * 0.08, 0.03]} c="#2EC4B6" shadow={false} />
      ))}
    </group>
  );
}

const SIDE_ART = [JaggedArt, SkylineArt, CrystalArt, HillsArt];

function Cabinet({ i }: { i: number }) {
  const spec = CABINETS[i]!;
  const Art = SIDE_ART[i]!;
  return (
    <group position={[spec.x, 0, -3.52]}>
      <Box p={[0, 0.82, 0]} s={[1.08, 1.64, 0.92]} c={spec.body} />
      <Box p={[0, 1.78, 0.04]} s={[1.18, 0.38, 0.7]} c={spec.marquee} />
      <Box p={[0, 1.78, 0.4]} s={[0.92, 0.22, 0.06]} c="#1A1630" />
      <Box p={[0, 1.22, 0.44]} s={[0.78, 0.58, 0.08]} c="#12101C" />
      <Box p={[0, 1.22, 0.48]} s={[0.68, 0.48, 0.05]} c={spec.screen} glow />
      {i === 0 && (
        <>
          <Box p={[-0.12, 1.28, 0.52]} s={[0.22, 0.22, 0.02]} c="#8A8A8A" r={[0, 0, 0.5]} shadow={false} />
          <Box p={[0.14, 1.16, 0.52]} s={[0.18, 0.3, 0.02]} c="#C8373C" r={[0, 0, -0.35]} shadow={false} />
        </>
      )}
      {i === 1 &&
        [-0.18, -0.04, 0.08, 0.2].map((x, k) => (
          <Box key={k} p={[x, 1.08 + (k % 3) * 0.08, 0.52]} s={[0.08, 0.16 + (k % 2) * 0.1, 0.02]} c={k % 2 ? "#4A6A8A" : "#3DDC82"} glow={k % 2 === 0} shadow={false} />
        ))}
      {i === 2 && (
        <mesh position={[0, 1.24, 0.52]} material={toon("#FFFFFF", { emissive: "#A8E8F4", noOcclude: true })}>
          <octahedronGeometry args={[0.16, 0]} />
        </mesh>
      )}
      {i === 3 && (
        <>
          <Box p={[0, 1.08, 0.52]} s={[0.5, 0.1, 0.02]} c="#FF8A4A" shadow={false} />
          {[-0.16, -0.04, 0.08, 0.18].map((x, k) => (
            <Box key={k} p={[x, 1.18, 0.52]} s={[0.04, 0.16 + (k % 2) * 0.06, 0.02]} c="#2EC4B6" shadow={false} />
          ))}
        </>
      )}
      <Box p={[0, 0.78, 0.52]} s={[0.98, 0.12, 0.42]} c="#1A1630" />
      <mesh position={[-0.18, 0.92, 0.62]} material={toon("#2A2548")}>
        <cylinderGeometry args={[0.035, 0.04, 0.14, 8]} />
      </mesh>
      <mesh position={[-0.18, 1.0, 0.62]} material={toon("#FFC857")}>
        <sphereGeometry args={[0.045, 8, 8]} />
      </mesh>
      {[0.08, 0.22, 0.36].map((x, k) => (
        <mesh key={k} position={[x, 0.86, 0.66]} material={toon(["#E8513F", "#7EDC7A", "#5B8CFF"][k]!)}>
          <cylinderGeometry args={[0.035, 0.035, 0.04, 8]} />
        </mesh>
      ))}
      <group position={[-0.56, 0.95, 0]}>
        <Art />
      </group>
      <group position={[0.56, 0.95, 0]} rotation={[0, Math.PI, 0]}>
        <Art />
      </group>
      <Box p={[0, 0.08, 0.1]} s={[1.12, 0.16, 1.05]} c="#12101C" />
    </group>
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
