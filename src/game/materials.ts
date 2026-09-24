import * as THREE from "three";

/**
 * Rolling-horizon bend shared by every world material. The world drops away quadratically with
 * distance (along the camera's depth axis) from `uBendCenter`, like a log rolling under the player.
 * Shadows are computed from the unbent world position on both caster and receiver, so they stay aligned.
 */
export const bend = {
  uBend: { value: 0.0115 },
  uBendCenter: { value: new THREE.Vector3() },
  uTime: { value: 0 },
};

const BEND_VERTEX = /* glsl */ `
vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
  mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
  mvPosition = instanceMatrix * mvPosition;
#endif
vec4 bendWorld = modelMatrix * mvPosition;
#ifdef SWAY
  float swayAmt = max(0.0, transformed.y) * 0.035;
  bendWorld.x += sin(uTime * 1.3 + bendWorld.x * 0.7 + bendWorld.z * 0.4) * swayAmt;
  bendWorld.z += cos(uTime * 1.1 + bendWorld.x * 0.5) * swayAmt * 0.6;
#endif
#ifdef WATER
  bendWorld.y += sin(uTime * 1.4 + bendWorld.x * 0.9) * 0.025 + cos(uTime * 1.1 + bendWorld.z * 1.3) * 0.02;
#endif
float bendDz = bendWorld.z - uBendCenter.z;
float bendDx = bendWorld.x - uBendCenter.x;
bendWorld.y -= bendDz * bendDz * uBend + bendDx * bendDx * uBend * 0.25;
mvPosition = viewMatrix * bendWorld;
gl_Position = projectionMatrix * mvPosition;
`;

function patch(material: THREE.Material, defines: string[] = []) {
  const key = ["bend", ...defines].join("-");
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uBend = bend.uBend;
    shader.uniforms.uBendCenter = bend.uBendCenter;
    shader.uniforms.uTime = bend.uTime;
    shader.vertexShader =
      defines.map((d) => `#define ${d}`).join("\n") +
      "\nuniform float uBend;\nuniform vec3 uBendCenter;\nuniform float uTime;\n" +
      shader.vertexShader.replace("#include <project_vertex>", BEND_VERTEX);
  };
  material.customProgramCacheKey = () => key;
  return material;
}

let gradient: THREE.DataTexture | null = null;
export function toonGradient() {
  if (gradient) return gradient;
  const data = new Uint8Array([118, 118, 118, 255, 196, 196, 196, 255, 255, 255, 255, 255]);
  gradient = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
  gradient.minFilter = THREE.NearestFilter;
  gradient.magFilter = THREE.NearestFilter;
  gradient.generateMipmaps = false;
  gradient.needsUpdate = true;
  return gradient;
}

type ToonOpts = { flatShading?: boolean; sway?: boolean; water?: boolean; transparent?: boolean; opacity?: number; emissive?: string; vertexColors?: boolean; side?: THREE.Side };

const cache = new Map<string, THREE.MeshToonMaterial>();

/** One material style everywhere: MeshToonMaterial with a 3-step gradient, bent into the rolling horizon. */
export function toon(color: string, opts: ToonOpts = {}) {
  const key = `${color}|${JSON.stringify(opts)}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const m = new THREE.MeshToonMaterial({
    color,
    gradientMap: toonGradient(),
    transparent: opts.transparent ?? false,
    opacity: opts.opacity ?? 1,
    emissive: opts.emissive ? new THREE.Color(opts.emissive) : new THREE.Color(0, 0, 0),
    emissiveIntensity: opts.emissive ? (opts.water ? 0.45 : 0.9) : 0,
    vertexColors: opts.vertexColors ?? false,
    side: opts.side ?? THREE.FrontSide,
  });
  if (opts.flatShading) Object.assign(m, { flatShading: true });
  if (opts.transparent) m.depthWrite = false;
  const defines: string[] = [];
  if (opts.sway) defines.push("SWAY");
  if (opts.water) defines.push("WATER");
  patch(m, defines);
  cache.set(key, m);
  return m;
}

/** Unlit, bent material for glows, shadows and effects. */
export function flat(color: string, opacity = 1, additive = false) {
  const key = `flat|${color}|${opacity}|${additive}`;
  const hit = cache.get(key) as unknown as THREE.MeshBasicMaterial | undefined;
  if (hit) return hit;
  const m = new THREE.MeshBasicMaterial({
    color,
    transparent: opacity < 1 || additive,
    opacity,
    depthWrite: !(opacity < 1 || additive),
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
  });
  patch(m);
  cache.set(key, m as unknown as THREE.MeshToonMaterial);
  return m;
}

export const palette = {
  grass: "#9ADBB0",
  grassShade: "#88CFA0",
  dirt: "#D9C2A5",
  sand: "#EFD9B4",
  earth: "#F2E6D8",
  water: "#8FD3E8",
  shallow: "#B8E6F2",
  foliage: "#7CC49A",
  foliageDeep: "#5FAE82",
  pine: "#4F9C78",
  blossom: "#FFC4D6",
  blossomDeep: "#F5A9C1",
  wood: "#B98A5E",
  woodDeep: "#9C7049",
  orange: "#FF8A65",
  sun: "#FFC857",
  violet: "#7B6CF6",
  indigo: "#4B3FB5",
  ink: "#1E1B3A",
  coral: "#C8373C",
  cream: "#FFF8EC",
  rock: "#C9C3DA",
  white: "#FFFFFF",
  glow: "#FFF3A3",
  lavender: "#C7B9FF",
  peach: "#FFD9CC",
};
