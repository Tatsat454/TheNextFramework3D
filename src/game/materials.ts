import * as THREE from "three";

/**
 * Rolling-horizon bend shared by every world material. The world drops away quadratically with
 * distance (along the camera's depth axis) from `uBendCenter`, like a log rolling under the player.
 * Shadows are computed from the unbent world position on both caster and receiver, so they stay aligned.
 */
export const bend = {
  uBend: { value: 0.0016 },
  uBendCenter: { value: new THREE.Vector3() },
  uTime: { value: 0 },
  uPlayer: { value: new THREE.Vector3() },
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
#ifdef RIPPLE
  float rippleR = length(transformed.xz);
  bendWorld.y += sin(uTime * 3.6 - rippleR * 12.0) * 0.016 + cos(uTime * 2.8 + rippleR * 9.0) * 0.01;
#endif
float bendDz = bendWorld.z - uBendCenter.z;
float bendDx = bendWorld.x - uBendCenter.x;
bendWorld.y -= bendDz * bendDz * uBend + bendDx * bendDx * uBend * 0.25;
vOccWorld = bendWorld.xyz;
mvPosition = viewMatrix * bendWorld;
gl_Position = projectionMatrix * mvPosition;
`;

/** Dithers away anything standing between the camera and the player so they're never hidden. */
const OCCLUDE_FRAGMENT = /* glsl */ `
#ifndef NO_OCCLUDE
{
  vec3 camToPlayer = uPlayer - cameraPosition;
  float camLen = length(camToPlayer);
  vec3 camDir = camToPlayer / camLen;
  vec3 camToFrag = vOccWorld - cameraPosition;
  float along = dot(camToFrag, camDir);
  if (along > 0.0 && along < camLen - 0.9 && vOccWorld.y > uPlayer.y - 0.35) {
    float off = length(camToFrag - camDir * along);
    float radius = 1.05 * smoothstep(0.0, 5.0, camLen - along);
    if (off < radius && mod(floor(gl_FragCoord.x) + floor(gl_FragCoord.y), 2.0) < 1.0) discard;
  }
}
#endif
`;

function patch(material: THREE.Material, defines: string[] = []) {
  const key = ["bend", ...defines].join("-");
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uBend = bend.uBend;
    shader.uniforms.uBendCenter = bend.uBendCenter;
    shader.uniforms.uTime = bend.uTime;
    shader.uniforms.uPlayer = bend.uPlayer;
    const head = defines.map((d) => `#define ${d}`).join("\n");
    shader.vertexShader =
      head +
      "\nuniform float uBend;\nuniform vec3 uBendCenter;\nuniform float uTime;\nvarying vec3 vOccWorld;\n" +
      shader.vertexShader.replace("#include <project_vertex>", BEND_VERTEX);
    shader.fragmentShader =
      head +
      "\nuniform vec3 uPlayer;\nvarying vec3 vOccWorld;\n" +
      shader.fragmentShader.replace("void main() {", "void main() {\n" + OCCLUDE_FRAGMENT);
  };
  material.customProgramCacheKey = () => key;
  return material;
}

let gradient: THREE.DataTexture | null = null;
export function toonGradient() {
  if (gradient) return gradient;
  const data = new Uint8Array([158, 158, 158, 255, 214, 214, 214, 255, 255, 255, 255, 255]);
  gradient = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
  gradient.minFilter = THREE.NearestFilter;
  gradient.magFilter = THREE.NearestFilter;
  gradient.generateMipmaps = false;
  gradient.needsUpdate = true;
  return gradient;
}

type ToonOpts = { noOcclude?: boolean; flatShading?: boolean; sway?: boolean; water?: boolean; ripple?: boolean; transparent?: boolean; opacity?: number; emissive?: string; vertexColors?: boolean; side?: THREE.Side };

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
  if (opts.noOcclude) defines.push("NO_OCCLUDE");
  if (opts.water) defines.push("WATER");
  if (opts.ripple) defines.push("RIPPLE");
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
  grass: "#8BE07A",
  grassShade: "#72CC68",
  dirt: "#C4A06A",
  sand: "#E8D4A0",
  earth: "#E8D5A8",
  water: "#7ED4EA",
  shallow: "#A8E8F4",
  foliage: "#62C45A",
  foliageDeep: "#4EAE4C",
  pine: "#3A9A4A",
  blossom: "#FFB7C8",
  blossomDeep: "#F59AB0",
  wood: "#D2B07A",
  woodDeep: "#B08A52",
  stone: "#C8B79A",
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
