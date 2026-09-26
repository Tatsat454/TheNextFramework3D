"use client";

import { palette, toon } from "@/game/materials";

type V3 = [number, number, number];

function Box({ p, s, c, r, glow, shadow = true }: { p: V3; s: V3; c: string; r?: V3; glow?: boolean; shadow?: boolean }) {
  return (
    <mesh position={p} rotation={r} material={toon(c, glow ? { emissive: c, noOcclude: true } : { noOcclude: true })} castShadow={shadow} receiveShadow>
      <boxGeometry args={s} />
    </mesh>
  );
}

function Cyl({ p, r, h, c, seg = 12, rot, rt }: { p: V3; r: number; h: number; c: string; seg?: number; rot?: V3; rt?: number }) {
  return (
    <mesh position={p} rotation={rot} material={toon(c, { noOcclude: true })} castShadow receiveShadow>
      <cylinderGeometry args={[rt ?? r, r, h, seg]} />
    </mesh>
  );
}

/** Tiny toon models for the indoor gallery pedestals. */
export function ExhibitObject({ slug }: { slug: string }) {
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
          <mesh position={[0, 0.5, 0]} material={toon(palette.coral, { noOcclude: true })}>
            <coneGeometry args={[0.1, 0.18, 12]} />
          </mesh>
          <Box p={[0, 0.12, 0]} s={[0.3, 0.08, 0.04]} c={palette.coral} />
          <mesh position={[0, 0.04, 0]} material={toon(palette.orange, { emissive: palette.orange, noOcclude: true })}>
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
          <mesh position={[0, 0.56, 0]} material={toon(palette.coral, { noOcclude: true })}>
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
            <Box key={k} p={[0, 0.08 + k * 0.05, 0]} s={[0.26, 0.04, 0.34]} r={[0, k * 0.3, 0]} c={[palette.orange, palette.violet, palette.water][k]!} />
          ))}
        </group>
      );
  }
}
