"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { MotionConfig } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { setAmbient } from "@/game/audio";
import { input } from "@/game/input";
import { requestEnter, requestExit, talkTo } from "@/game/interact";
import { heightAt, isWalkable } from "@/game/island";
import { debugCam, player, reducedMotion } from "@/game/player-state";
import { hydrate, readPosition, savePosition, useGame } from "@/game/store";
import { cn } from "@/lib/utils";
import { DialogBox, dialogControl } from "./hud/DialogBox";
import { CircleWipe } from "./hud/CircleWipe";
import { Hud } from "./hud/Hud";
import { LandmarkCard } from "./hud/LandmarkCard";
import { LoadingScreen } from "./hud/LoadingScreen";
import { Confetti, EmoteBubble, EmoteMenu, IslandMap, playEmote, Pockets, Toasts } from "./hud/Overlays";
import { triggerInteract } from "./world/Player";

const IslandCanvas = dynamic(() => import("./world/IslandCanvas"), { ssr: false });

const EMOTE_KEYS = ["wave", "cheer", "thinking", "clap"] as const;

export default function IslandApp() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const card = useGame((s) => s.card);
  const dialog = useGame((s) => s.dialog);
  const loaded = useGame((s) => s.loaded);
  const set = useGame((s) => s.set);

  useEffect(() => {
    hydrate();
    if (process.env.NODE_ENV !== "production") Object.assign(window, { __pocket: { player, useGame, requestEnter, requestExit, debugCam, input, isWalkable } });
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
    const keep = setInterval(() => {
      if (!useGame.getState().interior) savePosition(player);
    }, 1000);
    return () => {
      mq.removeEventListener("change", onMq);
      clearInterval(keep);
      savePosition(player);
      setAmbient(false);
    };
  }, []);

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
      // E always talks/opens, even if the floating prompt button stole focus.
      if (e.code === "KeyE") {
        e.preventDefault();
        triggerInteract();
        return;
      }
      if (e.code === "Space" && !focusedControl) {
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
  const noWebGL = useCallback(() => router.replace("/work"), [router]);
  const onLoaded = useCallback(() => {
    set({ loaded: true });
    const s = useGame.getState();
    let greeted = false;
    try {
      greeted = window.sessionStorage.getItem("pocket-island:greeted") === "1";
      window.sessionStorage.setItem("pocket-island:greeted", "1");
    } catch {
      /* ignore */
    }
    if (!greeted && Object.keys(s.visited).length === 0) {
      setTimeout(() => {
        if (!useGame.getState().card && !useGame.getState().interior) talkTo("bramble", player);
      }, 900);
    }
  }, [set]);
  const blurred = !!card;

  return (
    <MotionConfig reducedMotion="user">
      <main className="sky fixed inset-0 overflow-hidden" aria-label="Pocket Island, an explorable portfolio">
        <h1 className="sr-only">Tatsat Upadhyay&apos;s portfolio: Pocket Island</h1>
        <div
          className={cn("absolute inset-0 transition-[filter,transform] duration-300 ease-out", blurred && "scale-[1.01] blur-[6px]")}
          aria-hidden={blurred || !!dialog}
        >
          <IslandCanvas onReady={onReady} onNoWebGL={noWebGL} />
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
            <CircleWipe />
          </>
        )}
        <LoadingScreen ready={ready} onDone={onLoaded} />
      </main>
    </MotionConfig>
  );
}
