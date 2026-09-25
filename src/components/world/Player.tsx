"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { profile } from "@/content/landmarks";
import { sfx } from "@/game/audio";
import { findNearby, interact, requestEnter, requestExit, type Interactable } from "@/game/interact";
import { canStepInterior, doorZoneAt } from "@/game/interiors";
import { canStep, heightAt, tileAt, worldToTile } from "@/game/island";
import { input, moveAxes } from "@/game/input";
import { flat, palette, toon } from "@/game/materials";
import { player, reducedMotion } from "@/game/player-state";
import { isPaused, useGame } from "@/game/store";

const RADIUS = 0.26;
const WALK = 4;
const RUN = 6.6;

export let nearbyInteractable: Interactable | null = null;

export function triggerInteract() {
  const s = useGame.getState();
  if (isPaused(s)) return;
  const it = findNearby(player.x, player.z) ?? nearbyInteractable;
  if (!it) return;
  nearbyInteractable = it;
  interact(it, player);
  if (it.kind !== "door") {
    useGame.setState({ hopAt: performance.now() });
    sfx.hop();
  }
}

function tryStep(x: number, z: number, dx: number, dz: number) {
  const interior = useGame.getState().interior;
  const ok = (px: number, pz: number) => (interior ? canStepInterior(interior, px, pz) : canStep(x, z, px, pz));
  const blocked = (nx: number, nz: number) => {
    if (interior) return !ok(nx, nz);
    const sx = nx !== x ? Math.sign(nx - x) : 0;
    const sz = nz !== z ? Math.sign(nz - z) : 0;
    return !ok(nx, nz) || !ok(nx + sx * RADIUS, nz + sz * RADIUS);
  };
  if (!blocked(x + dx, z + dz)) return { nx: x + dx, nz: z + dz };
  if (dx !== 0 && !blocked(x + dx, z)) return { nx: x + dx, nz: z };
  if (dz !== 0 && !blocked(x, z + dz)) return { nx: x, nz: z + dz };
  return { nx: x, nz: z };
}

const angleLerp = (a: number, b: number, t: number) => {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
};

function Chibi({ parts }: { parts: React.RefObject<Record<string, THREE.Object3D | null>> }) {
  const look = profile.look;
  const set = (k: string) => (o: THREE.Object3D | null) => {
    parts.current[k] = o;
  };
  const skin = toon(look.skin);
  const hair = toon(look.hair);
  const outfit = toon(look.outfit);
  const pants = toon(look.pants);
  const shoes = toon(look.shoes);
  const eye = toon(palette.ink);
  return (
    <group ref={set("body")}>
      {[-1, 1].map((side) => (
        <group key={side} ref={set(side < 0 ? "legL" : "legR")} position={[side * 0.09, 0.2, 0]}>
          <mesh position={[0, -0.09, 0]} material={pants} castShadow>
            <capsuleGeometry args={[0.058, 0.08, 4, 8]} />
          </mesh>
          <mesh position={[0, -0.17, 0.03]} material={shoes} castShadow>
            <sphereGeometry args={[0.068, 10, 8]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.33, 0]} material={outfit} castShadow>
        <capsuleGeometry args={[0.15, 0.1, 6, 12]} />
      </mesh>
      <mesh position={[0, 0.44, -0.1]} material={outfit}>
        <sphereGeometry args={[0.1, 10, 8]} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} ref={set(side < 0 ? "armL" : "armR")} position={[side * 0.18, 0.42, 0]}>
          <mesh position={[side * 0.02, -0.08, 0]} rotation={[0, 0, side * 0.25]} material={outfit} castShadow>
            <capsuleGeometry args={[0.045, 0.1, 4, 8]} />
          </mesh>
          <mesh position={[side * 0.04, -0.17, 0]} material={skin}>
            <sphereGeometry args={[0.048, 8, 8]} />
          </mesh>
        </group>
      ))}
      <group ref={set("head")} position={[0, 0.72, 0]}>
        <mesh material={skin} castShadow>
          <sphereGeometry args={[0.27, 24, 18]} />
        </mesh>
        <mesh position={[0, 0.06, -0.02]} scale={[1.06, 0.92, 1.06]} material={hair} castShadow>
          <sphereGeometry args={[0.28, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.44]} />
        </mesh>
        <mesh position={[0, 0.03, -0.06]} scale={[1.02, 1.05, 0.95]} material={hair}>
          <sphereGeometry args={[0.28, 20, 14, Math.PI * 0.95, Math.PI * 1.1, 0, Math.PI * 0.72]} />
        </mesh>
        <mesh position={[-0.07, 0.16, 0.2]} rotation={[0.5, 0, 0.5]} scale={[1.4, 0.55, 0.8]} material={hair}>
          <sphereGeometry args={[0.1, 10, 8]} />
        </mesh>
        <mesh position={[0.1, 0.17, 0.19]} rotation={[0.5, 0, -0.4]} scale={[1.2, 0.5, 0.8]} material={hair}>
          <sphereGeometry args={[0.09, 10, 8]} />
        </mesh>
        <group ref={set("eyes")} position={[0, -0.01, 0.235]}>
          {[-1, 1].map((side) => (
            <group key={side} position={[side * 0.095, 0, 0]}>
              <mesh scale={[0.8, 1.2, 0.5]} material={eye}>
                <sphereGeometry args={[0.042, 12, 10]} />
              </mesh>
              <mesh position={[0.012, 0.018, 0.02]} material={flat("#FFFFFF")}>
                <sphereGeometry args={[0.013, 8, 6]} />
              </mesh>
            </group>
          ))}
        </group>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.16, -0.08, 0.2]} scale={[1, 0.6, 0.4]} material={flat("#FF9E9E", 0.55)}>
            <sphereGeometry args={[0.04, 10, 8]} />
          </mesh>
        ))}
        {look.accessory === "headphones" && (
          <group>
            <mesh position={[0, 0.02, -0.01]} rotation={[0, Math.PI / 2, 0]} material={toon(palette.ink)}>
              <torusGeometry args={[0.3, 0.022, 8, 24, Math.PI]} />
            </mesh>
            {[-1, 1].map((side) => (
              <mesh key={side} position={[side * 0.28, -0.02, 0]} rotation={[0, 0, Math.PI / 2]} material={toon(look.accessoryColor)}>
                <cylinderGeometry args={[0.075, 0.075, 0.07, 14]} />
              </mesh>
            ))}
          </group>
        )}
      </group>
      <group ref={set("can")} position={[0.24, 0.3, 0.08]} visible={false}>
        <mesh material={toon(palette.water)}>
          <cylinderGeometry args={[0.07, 0.07, 0.13, 10]} />
        </mesh>
        <mesh position={[0.08, 0.04, 0.04]} rotation={[0.4, 0, -1.1]} material={toon(palette.water)}>
          <cylinderGeometry args={[0.012, 0.016, 0.16, 6]} />
        </mesh>
      </group>
    </group>
  );
}

type Puff = { mesh: THREE.Mesh; life: number };

export function Player() {
  const root = useRef<THREE.Group>(null);
  const parts = useRef<Record<string, THREE.Object3D | null>>({});
  const puffGroup = useRef<THREE.Group>(null);
  const printGroup = useRef<THREE.Group>(null);
  const shadow = useRef<THREE.Mesh>(null);
  const anim = useRef({ phase: 0, wasMoving: false, stopAt: -10, blinkAt: 2, puffT: 0, printT: 0, printSide: 1, nearbyT: 0, tiltAt: 5, lastNearby: "" });
  const puffs = useRef<Puff[]>([]);
  const prints = useRef<Puff[]>([]);
  const puffGeo = useMemo(() => new THREE.IcosahedronGeometry(0.07, 1), []);
  const printGeo = useMemo(() => new THREE.CircleGeometry(0.06, 10).rotateX(-Math.PI / 2).scale(0.8, 1, 1.3), []);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20);
    const g = root.current;
    const p = parts.current;
    if (!g || !p.body) return;
    const s = useGame.getState();
    const now = performance.now();
    const t = state.clock.elapsedTime;
    const a = anim.current;
    const paused = isPaused(s) || !s.loaded;

    let dx = 0;
    let dz = 0;
    const { x: ax, z: az, running } = moveAxes();
    if (!paused) {
      if (ax || az) {
        input.tapTarget = null;
        const len = Math.hypot(ax, az);
        dx = ax / len;
        dz = az / len;
      } else if (input.tapTarget) {
        const tx = input.tapTarget.x - player.x;
        const tz = input.tapTarget.z - player.z;
        const d = Math.hypot(tx, tz);
        if (d < 0.12) input.tapTarget = null;
        else {
          dx = tx / d;
          dz = tz / d;
        }
      }
    } else input.tapTarget = null;

    const speed = running ? RUN : WALK;
    const moving = dx !== 0 || dz !== 0;
    if (moving) {
      const step = speed * dt;
      const { nx, nz } = tryStep(player.x, player.z, dx * step, dz * step);
      const moved = Math.hypot(nx - player.x, nz - player.z);
      if (moved < step * 0.05 && input.tapTarget) input.tapTarget = null;
      player.x = nx;
      player.z = nz;
      player.facing = angleLerp(player.facing, Math.atan2(dx, dz), 1 - Math.pow(0.001, dt));
    }
    player.moving = moving;
    player.running = moving && running;
    const ground = s.interior ? 0 : heightAt(player.x, player.z);
    player.y += (ground - player.y) * (1 - Math.pow(0.0001, dt));
    if (s.interior) player.onSand = false;
    else {
      const tile = tileAt(worldToTile(player.x, player.z).i, worldToTile(player.x, player.z).j);
      player.onSand = !!tile && tile.kind === "sand";
    }

    if (!paused) {
      const zone = doorZoneAt(player.x, player.z);
      if (zone?.kind === "enter") requestEnter(zone.id);
      else if (zone?.kind === "exit") requestExit();
    }

    if (a.wasMoving && !moving) a.stopAt = t;
    a.wasMoving = moving;

    // Hop (interact / pickup)
    const hopT = (now - s.hopAt) / 1000;
    const hop = hopT < 0.36 ? Math.sin((hopT / 0.36) * Math.PI) * 0.22 : 0;

    g.position.set(player.x, player.y + hop, player.z);
    g.rotation.y = player.facing;

    const rm = reducedMotion.value;
    // Walk cycle
    if (moving) a.phase += dt * 10 * (speed / WALK);
    const swing = moving ? Math.sin(a.phase) * (running ? 0.9 : 0.65) : 0;
    const body = p.body;
    const bob = moving && !rm ? Math.abs(Math.sin(a.phase)) * 0.045 : 0;
    body.position.y = bob;
    const lerpRot = (o: THREE.Object3D | null | undefined, x: number, z = 0) => {
      if (!o) return;
      o.rotation.x += (x - o.rotation.x) * 0.3;
      o.rotation.z += (z - o.rotation.z) * 0.3;
    };

    // Emotes
    const emote = s.emote && now - s.emote.at < 1800 ? s.emote.type : null;
    const et = s.emote ? (now - s.emote.at) / 1000 : 0;
    let armL = -swing;
    let armR = swing;
    let armLz = 0;
    let armRz = 0;
    let headTilt = 0;
    let emoteHop = 0;
    if (emote === "wave") {
      armR = -2.6;
      armRz = Math.sin(et * 14) * 0.5;
    } else if (emote === "cheer") {
      armL = -2.8;
      armR = -2.8;
      armLz = -0.3;
      armRz = 0.3;
      emoteHop = Math.abs(Math.sin(et * 7)) * 0.14;
    } else if (emote === "thinking") {
      armR = -2.1;
      armRz = 0.9;
      headTilt = 0.25;
    } else if (emote === "clap") {
      armL = -1.3;
      armR = -1.3;
      const c = Math.sin(et * 22) * 0.35;
      armLz = -0.5 + c;
      armRz = 0.5 - c;
    } else if (emote === "stretch") {
      armL = -2.65;
      armR = -2.85;
      armLz = -0.45;
      armRz = 0.55;
      headTilt = -0.18;
    }
    if (emoteHop && !rm) g.position.y += emoteHop;
    lerpRot(p.armL, armL, armLz);
    lerpRot(p.armR, armR, armRz);
    lerpRot(p.legL, swing);
    lerpRot(p.legR, -swing);

    // Idle breathing, stop squash
    const since = t - a.stopAt;
    let sy = 1;
    let sxz = 1;
    if (since < 0.35 && !rm) {
      const k = Math.sin((since / 0.35) * Math.PI) * (1 - since / 0.35);
      sy = 1 - 0.06 * k * 1.6;
      sxz = 1 + 0.04 * k * 1.6;
    } else if (!moving && !rm) {
      sy = 1 + Math.sin(t * 2.2) * 0.02;
    }
    body.scale.set(sxz, sy, sxz);

    // Head tilt now and then
    if (p.head) {
      if (!moving && t > a.tiltAt && !rm) {
        headTilt = Math.sin((t - a.tiltAt) * 2) * 0.18;
        if (t - a.tiltAt > Math.PI / 2) a.tiltAt = t + 4 + Math.random() * 5;
      }
      p.head.rotation.z += (headTilt - p.head.rotation.z) * 0.15;
    }

    // Blink every 3–5 seconds
    if (p.eyes) {
      if (t > a.blinkAt) {
        p.eyes.scale.y = 0.1;
        if (t > a.blinkAt + 0.12) {
          p.eyes.scale.y = 1;
          a.blinkAt = t + 3 + Math.random() * 2;
        }
      }
    }

    if (p.can) p.can.visible = s.hasCan && !!s.nearby?.startsWith("row:");

    if (shadow.current) {
      shadow.current.position.set(player.x, ground + 0.015, player.z);
      const sc = 1 - hop * 1.5;
      shadow.current.scale.set(sc, sc, sc);
    }

    // Dust puffs
    a.puffT -= dt;
    if (moving && a.puffT <= 0 && puffGroup.current) {
      a.puffT = running ? 0.07 : 0.13;
      let puff = puffs.current.find((pf) => pf.life <= 0);
      if (!puff && puffs.current.length < 24) {
        const m = new THREE.Mesh(puffGeo, flat("#FFFFFF", 0.8));
        puffGroup.current.add(m);
        puff = { mesh: m, life: 0 };
        puffs.current.push(puff);
      }
      if (puff) {
        puff.life = 1;
        puff.mesh.position.set(player.x - dx * 0.2 + (Math.random() - 0.5) * 0.15, ground + 0.05, player.z - dz * 0.2 + (Math.random() - 0.5) * 0.15);
        puff.mesh.userData.big = running ? 1.6 : 1;
      }
    }
    for (const pf of puffs.current) {
      if (pf.life <= 0) {
        pf.mesh.visible = false;
        continue;
      }
      pf.life -= dt * 2.2;
      pf.mesh.visible = true;
      const k = 1 - pf.life;
      pf.mesh.position.y += dt * 0.4;
      pf.mesh.scale.setScalar((0.6 + k * 1.2) * pf.mesh.userData.big * Math.max(pf.life, 0.01));
    }

    // Footprints on sand
    a.printT -= dt;
    if (moving && player.onSand && a.printT <= 0 && printGroup.current) {
      a.printT = running ? 0.16 : 0.24;
      a.printSide *= -1;
      let pr = prints.current.find((x) => x.life <= 0);
      if (!pr && prints.current.length < 40) {
        const m = new THREE.Mesh(printGeo, flat("#D9C2A5", 0.6));
        printGroup.current.add(m);
        pr = { mesh: m, life: 0 };
        prints.current.push(pr);
      }
      if (pr) {
        pr.life = 1;
        const side = a.printSide * 0.08;
        pr.mesh.position.set(player.x + Math.cos(player.facing) * side, ground + 0.012, player.z - Math.sin(player.facing) * side);
        pr.mesh.rotation.y = player.facing;
      }
    }
    for (const pr of prints.current) {
      if (pr.life <= 0) {
        pr.mesh.visible = false;
        continue;
      }
      pr.life -= dt / 3;
      pr.mesh.visible = true;
      pr.mesh.scale.setScalar(Math.min(1, pr.life * 3));
    }

    // Nearby interactable (throttled)
    a.nearbyT -= dt;
    if (a.nearbyT <= 0) {
      a.nearbyT = 0.1;
      nearbyInteractable = paused && !s.card ? nearbyInteractable : findNearby(player.x, player.z);
      const id = nearbyInteractable?.id ?? "";
      if (id !== a.lastNearby) {
        a.lastNearby = id;
        useGame.setState({ nearby: id || null });
      }
    }
    if (input.interactQueued) {
      input.interactQueued = false;
      triggerInteract();
    }
  });

  return (
    <group>
      <group ref={root} scale={1.28}>
        <Chibi parts={parts} />
      </group>
      <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]} material={flat("#3B3470", 0.26)}>
        <circleGeometry args={[0.36, 20]} />
      </mesh>
      <group ref={puffGroup} />
      <group ref={printGroup} />
    </group>
  );
}
