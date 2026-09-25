"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { currentInteractables } from "@/game/interact";
import { input } from "@/game/input";
import { bend } from "@/game/materials";
import { isPaused, useGame } from "@/game/store";

/** Floating "Press E / Tap" bubble over whatever the player can interact with. */
export function Prompt() {
  const nearby = useGame((s) => s.nearby);
  const paused = useGame(isPaused);
  const touch = useGame((s) => s.touch);
  const group = useRef<THREE.Group>(null);
  const it = nearby ? currentInteractables().find((i) => i.id === nearby) : null;

  useFrame(() => {
    if (!group.current || !it) return;
    const live = currentInteractables().find((i) => i.id === it.id) ?? it;
    const dz = live.z - bend.uBendCenter.value.z;
    const dx = live.x - bend.uBendCenter.value.x;
    const drop = dz * dz * bend.uBend.value + dx * dx * bend.uBend.value * 0.25;
    group.current.position.set(live.x, live.y - drop, live.z);
  });

  if (!it || paused) return null;
  return (
    <group ref={group} position={[it.x, it.y, it.z]}>
      <Html center zIndexRange={[20, 10]} style={{ pointerEvents: "none" }}>
        <button
          key={it.id}
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            input.interactQueued = true;
          }}
          onMouseDown={(e) => e.preventDefault()}
          tabIndex={-1}
          className="prompt-pop glass-soft pointer-events-auto flex items-center gap-2 whitespace-nowrap rounded-full py-1.5 pl-3.5 pr-1.5 text-[14px] font-medium text-ink"
          aria-label={`${it.verb} ${it.label}`}
        >
          <span className="font-bold">{it.label}</span>
          <span className="flex items-center gap-1 rounded-full bg-ink px-2.5 py-1 text-[12px] font-bold text-white">
            {touch ? "Tap" : (
              <>
                <kbd className="font-sans">E</kbd>
                <span className="font-medium opacity-80">{it.verb}</span>
              </>
            )}
          </span>
        </button>
      </Html>
    </group>
  );
}
