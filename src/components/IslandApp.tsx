"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { MotionConfig } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { setAmbient } from "@/game/audio";
import { input } from "@/game/input";
import { heightAt, isWalkable } from "@/game/island";
import { player, reducedMotion } from "@/game/player-state";
import { hydrate, readPosition, savePosition, useGame } from "@/game/store";
import { presetForHour, type TimePreset } from "@/game/time-of-day";
import { cn } from "@/lib/utils";
import { DialogBox, dialogControl } from "./hud/DialogBox";
import { Hud } from "./hud/Hud";
import { LandmarkCard } from "./hud/LandmarkCard";
import { LoadingScreen } from "./hud/LoadingScreen";
import { Confetti, EmoteBubble, EmoteMenu, IslandMap, playEmote, Pockets, Toasts } from "./hud/Overlays";
import { triggerInteract } from "./world/Player";

const IslandCanvas = dynamic(() => import("./world/IslandCanvas"), { ssr: false });

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

const EMOTE_KEYS = ["wave", "cheer", "thinking", "clap"] as const;

export default function IslandApp() {
  const router = useRouter();
  const [preset, setPreset] = useState<TimePreset | null>(null);
  const [ready, setReady] = useState(false);
  const [lowPower, setLowPower] = useState(false);
  const card = useGame((s) => s.card);
  const dialog = useGame((s) => s.dialog);
  const loaded = useGame((s) => s.loaded);
  const set = useGame((s) => s.set);

  useEffect(() => {
    if (!hasWebGL()) {
      router.replace("/work");
      return;
    }
    hydrate();
    if (process.env.NODE_ENV !== "production") Object.assign(window, { __pocket: { player, useGame } });
    const pos = readPosition();
    if (pos && isWalkable(pos.x, pos.z)) {
      player.x = pos.x;
      player.z = pos.z;
      player.y = heightAt(pos.x, pos.z);
      player.facing = pos.facing;
    }
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotion.value = mq.matches;
    const onMq = () => (reducedMotion.value = mq.matches);
    mq.addEventListener("change", onMq);
    const cores = navigator.hardwareConcurrency ?? 8;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const forceHq = new URLSearchParams(window.location.search).has("hq");
    setLowPower(!forceHq && (cores <= 4 || (coarse && cores <= 6)));
    const apply = () => {
      const p = presetForHour(new Date().getHours());
      setPreset(p);
      const root = document.documentElement.style;
      root.setProperty("--sky-top", p.sky[0]);
      root.setProperty("--sky-mid", p.sky[1]);
      root.setProperty("--sky-bottom", p.sky[2]);
    };
    apply();
    const clock = setInterval(apply, 60_000);
    const keep = setInterval(() => savePosition(player), 1000);
    return () => {
      mq.removeEventListener("change", onMq);
      clearInterval(clock);
      clearInterval(keep);
      savePosition(player);
      setAmbient(false);
    };
  }, [router]);

  useEffect(() => {
    const typing = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
    };
    const down = (e: KeyboardEvent) => {
      if (typing(e)) return;
      const s = useGame.getState();
      const focusedControl = document.activeElement && document.activeElement !== document.body;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code) && !focusedControl) e.preventDefault();

      if (e.code === "Escape") {
        if (s.card) set({ card: null });
        else if (s.dialog) set({ dialog: null });
        else set({ mapOpen: false, pocketsOpen: false, emoteOpen: false });
        return;
      }
      if (s.dialog && (e.code === "KeyE" || e.code === "Space" || e.code === "Enter")) {
        e.preventDefault();
        dialogControl.advance();
        return;
      }
      if (s.card) return;
      if (e.code === "KeyM") {
        set({ mapOpen: !s.mapOpen, pocketsOpen: false });
        return;
      }
      if (e.code === "KeyI" || (e.code === "Tab" && !e.shiftKey && !focusedControl && !s.mapOpen)) {
        e.preventDefault();
        set({ pocketsOpen: !s.pocketsOpen, mapOpen: false });
        return;
      }
      if (s.mapOpen || s.pocketsOpen) return;
      if (e.code === "KeyQ") {
        set({ emoteOpen: !s.emoteOpen });
        return;
      }
      if (s.emoteOpen && /^Digit[1-4]$/.test(e.code)) {
        playEmote(EMOTE_KEYS[Number(e.code.slice(5)) - 1]);
        return;
      }
      if ((e.code === "KeyE" || e.code === "Space") && !focusedControl) {
        e.preventDefault();
        triggerInteract();
        return;
      }
      input.keys.add(e.code);
    };
    const up = (e: KeyboardEvent) => input.keys.delete(e.code);
    const blur = () => input.keys.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, [set]);

  const onReady = useCallback(() => setReady(true), []);
  const onLoaded = useCallback(() => set({ loaded: true }), [set]);
  const blurred = !!card;

  return (
    <MotionConfig reducedMotion="user">
      <main className="sky fixed inset-0 overflow-hidden" aria-label="Pocket Island, an explorable portfolio">
        <h1 className="sr-only">Tatsat Upadhyay&apos;s portfolio: Pocket Island</h1>
        <div
          className={cn("absolute inset-0 transition-[filter,transform] duration-300 ease-out", blurred && "scale-[1.01] blur-[6px]")}
          aria-hidden={blurred || !!dialog}
        >
          {preset && <IslandCanvas preset={preset} onReady={onReady} lowPower={lowPower} />}
        </div>
        {loaded && (
          <>
            <Hud />
            <EmoteBubble />
            <EmoteMenu />
            <Toasts />
            <LandmarkCard />
            <DialogBox />
            <Pockets />
            <IslandMap />
            <Confetti />
          </>
        )}
        <LoadingScreen ready={ready} onDone={onLoaded} />
      </main>
    </MotionConfig>
  );
}
