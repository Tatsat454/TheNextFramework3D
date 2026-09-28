"use client";

import Link from "next/link";
import { Backpack, Map as MapIcon, Smile, Volume2, VolumeX } from "lucide-react";
import { copy, landmarks, profile } from "@/content/landmarks";
import { getInterior } from "@/game/interiors";
import { setAmbient, sfx } from "@/game/audio";
import { useGame } from "@/game/store";
import { cn } from "@/lib/utils";

function IconButton({ label, onClick, children, pressed }: { label: string; onClick: () => void; children: React.ReactNode; pressed?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      className="glass-soft lift grid size-11 place-items-center rounded-full text-ink"
    >
      {children}
    </button>
  );
}

export function Hud() {
  const sound = useGame((s) => s.sound);
  const visited = useGame((s) => s.visited);
  const touch = useGame((s) => s.touch);
  const set = useGame((s) => s.set);
  const busy = useGame((s) => !!s.dialog || !!s.card);
  const interiorId = useGame((s) => s.interior);
  const found = Object.keys(visited).length;
  const inside = interiorId ? getInterior(interiorId) : null;

  const toggleSound = () => {
    const next = !sound;
    set({ sound: next });
    setAmbient(next);
    if (next) sfx.click();
  };

  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-3 p-4 pt-[max(1rem,env(safe-area-inset-top))] sm:p-6">
        <Link
          href="/story/about"
          aria-label={`${profile.name}: about me`}
          className="glass lift pointer-events-auto grid size-12 place-items-center rounded-full font-serif text-[20px] tracking-tight text-ink"
        >
          {profile.initials}
        </Link>
        <div className="pointer-events-auto flex items-center gap-2">
          <IconButton label={sound ? "Turn sound off" : "Turn sound on"} onClick={toggleSound} pressed={sound}>
            {sound ? <Volume2 className="size-[18px]" /> : <VolumeX className="size-[18px]" />}
          </IconButton>
          <Link
            href="/work"
            className="lift flex h-11 items-center gap-1.5 rounded-full bg-ink px-4 text-[14px] font-bold text-white shadow-[0_12px_32px_rgba(30,27,58,0.35)] sm:px-5 sm:text-[15px]"
          >
            <span className="hidden min-[400px]:inline">{copy.fastModeCta}</span>
            <span className="min-[400px]:hidden">The work</span>
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>

      <div className={cn("pointer-events-none absolute inset-x-0 bottom-0 z-30 flex items-end justify-center gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] transition-all duration-300 sm:p-6", busy && "translate-y-4 opacity-0")}>
        <div className="glass pointer-events-none flex max-w-full items-center gap-3 rounded-full px-4 py-2.5 text-[13px] sm:text-[14px]">
          <span className="hidden font-medium text-ink-soft sm:inline">{touch ? copy.hudHint.mobile : copy.hudHint.desktop}</span>
          <span className="hidden text-ink-soft/50 sm:inline" aria-hidden>·</span>
          {inside ? (
            <span className="font-bold text-ink">
              {copy.insidePrefix}: {inside.name}
            </span>
          ) : (
            <>
              <span className="font-bold text-ink">
                {found} of {landmarks.length} landmarks found
              </span>
              <span className="flex items-center gap-1" aria-hidden>
                {landmarks.map((l) => (
                  <span
                    key={l.id}
                    title={l.name}
                    className={cn("size-2 rounded-full transition-all duration-300", visited[l.id] ? "scale-110 bg-violet" : "bg-ink/15")}
                  />
                ))}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-20 right-4 z-30 flex flex-col gap-2 pb-[env(safe-area-inset-bottom)] sm:bottom-6 sm:right-6">
        <div className="pointer-events-auto flex flex-col gap-2">
          <IconButton label="Emotes (Q)" onClick={() => set({ emoteOpen: !useGame.getState().emoteOpen })}>
            <Smile className="size-[18px]" />
          </IconButton>
          <IconButton label="Pockets (I)" onClick={() => set({ pocketsOpen: true })}>
            <Backpack className="size-[18px]" />
          </IconButton>
          <IconButton label="Island map (M)" onClick={() => set({ mapOpen: true })}>
            <MapIcon className="size-[18px]" />
          </IconButton>
        </div>
      </div>
    </>
  );
}
