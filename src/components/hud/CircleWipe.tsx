"use client";

import { useEffect, useRef, useState } from "react";
import { useGame, type Wipe } from "@/game/store";
import { reducedMotion } from "@/game/player-state";
import { WIPE_IN_MS, WIPE_IN_MS_REDUCED, WIPE_OUT_MS, WIPE_OUT_MS_REDUCED } from "@/game/interiors";

function hole(k: number) {
  return `${Math.max(0, k) * 145}vmax`;
}

export function CircleWipe() {
  const wipe = useGame((s) => s.wipe);
  const [shown, setShown] = useState<Wipe | null>(null);
  const [k, setK] = useState(1);
  const [fade, setFade] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    if (!wipe) {
      setShown(null);
      setK(1);
      setFade(0);
      return;
    }
    setShown(wipe);
    const rm = reducedMotion.value;
    const dur = wipe.phase === "out" ? (rm ? WIPE_OUT_MS_REDUCED : WIPE_OUT_MS) : rm ? WIPE_IN_MS_REDUCED : WIPE_IN_MS;
    const from = wipe.phase === "out" ? 1 : 0;
    const to = wipe.phase === "out" ? 0 : 1;
    const t0 = performance.now();
    if (rm) {
      setK(0);
      setFade(from === 1 ? 0 : 1);
    } else {
      setFade(1);
      setK(from);
    }
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / dur);
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const v = from + (to - from) * e;
      if (rm) setFade(wipe.phase === "out" ? e : 1 - e);
      else setK(v);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [wipe]);

  if (!shown) return null;
  const x = `${(shown.x * 100).toFixed(2)}%`;
  const y = `${(shown.y * 100).toFixed(2)}%`;
  const r = hole(k);
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[80]"
      style={
        reducedMotion.value
          ? { background: "#120e22", opacity: fade }
          : {
              background: "#120e22",
              WebkitMaskImage: `radial-gradient(circle at ${x} ${y}, transparent ${r}, #000 ${r})`,
              maskImage: `radial-gradient(circle at ${x} ${y}, transparent ${r}, #000 ${r})`,
            }
      }
      aria-hidden
    />
  );
}
