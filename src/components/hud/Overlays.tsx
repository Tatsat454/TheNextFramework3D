"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Hand, Lightbulb, PartyPopper, Sparkles, Star, X } from "lucide-react";
import { getItem, landmarks, profile } from "@/content/landmarks";
import { sfx } from "@/game/audio";
import { H, landmarkPlacements, tiles, W } from "@/game/island";
import { player } from "@/game/player-state";
import { useGame, type Emote } from "@/game/store";
import { cn } from "@/lib/utils";

const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

function Sheet({ open, onClose, label, children, wide }: { open: boolean; onClose: () => void; label: string; children: React.ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (open) setTimeout(() => ref.current?.querySelector<HTMLElement>("button")?.focus(), 50);
  }, [open]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div key="bg" className="absolute inset-0 z-40 bg-ink/15" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      )}
      {open && (
        <div key="wrap" className="pointer-events-none absolute inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            initial={{ y: 50, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={spring}
            className={cn(
              "glass pointer-events-auto relative max-h-[88vh] w-full overflow-y-auto rounded-b-none p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:rounded-[24px]",
              wide ? "sm:w-[640px]" : "sm:w-[440px]",
            )}
            style={{ background: "rgba(255,255,255,0.78)" }}
          >
            <button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-white/80 text-ink hover:bg-white">
              <X className="size-4" />
            </button>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function Pockets() {
  const open = useGame((s) => s.pocketsOpen);
  const pockets = useGame((s) => s.pockets);
  const set = useGame((s) => s.set);
  const [sel, setSel] = useState<number | null>(null);
  const item = sel !== null && pockets[sel] ? getItem(pockets[sel]) : null;
  return (
    <Sheet open={open} onClose={() => set({ pocketsOpen: false })} label="Pockets">
      <p className="eyebrow">Pockets</p>
      <h2 className="mt-1 font-serif text-[30px] leading-tight">What you&apos;ve found</h2>
      <ul className="mt-4 grid grid-cols-5 gap-2.5">
        {Array.from({ length: 10 }).map((_, k) => {
          const id = pockets[k];
          const it = id ? getItem(id) : null;
          return (
            <li key={k}>
              <button
                type="button"
                disabled={!it}
                onClick={() => setSel(k)}
                onMouseEnter={() => it && setSel(k)}
                aria-label={it ? it.name : "Empty slot"}
                className={cn(
                  "grid aspect-square w-full place-items-center rounded-[18px] border transition-all",
                  it ? "lift border-white bg-white/80" : "border-dashed border-ink/15 bg-white/30",
                  sel === k && it && "ring-2 ring-violet",
                )}
              >
                {it && (
                  <span
                    className="block size-6 rounded-full shadow-[inset_-3px_-4px_0_rgba(30,27,58,0.15)]"
                    style={{ background: it.color, borderRadius: it.kind === "hidden" ? "6px" : it.kind === "shell" ? "50% 50% 45% 45% / 60% 60% 40% 40%" : "999px", transform: it.kind === "hidden" ? "rotate(45deg) scale(0.85)" : undefined }}
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 min-h-[88px] rounded-2xl bg-white/60 p-4">
        {item ? (
          <>
            <p className="text-[15px] font-bold">{item.name}</p>
            <p className={cn("mt-1 text-[15px] leading-relaxed", item.placeholder ? "text-ink-soft" : "text-ink")}>{item.flavor}</p>
            <button
              type="button"
              onClick={() => {
                set({ pockets: pockets.filter((_, k) => k !== sel) });
                setSel(null);
              }}
              className="mt-2 text-[13px] font-bold text-indigo underline decoration-indigo/30 underline-offset-2"
            >
              Drop it
            </button>
          </>
        ) : (
          <p className="text-[15px] text-ink-soft">
            {pockets.length ? "Tap an item to read its note." : `Shells on the beach, fruit from shaken trees, and a few hidden things. Each one has a note about ${profile.firstName}.`}
          </p>
        )}
      </div>
    </Sheet>
  );
}

const landmarkGlyph: Record<string, string> = { house: "#FF8A65", townhall: "#C8373C", museum: "#7B6CF6", market: "#FFC857", arcade: "#4B3FB5", garden: "#7CC49A", dock: "#B98A5E" };

export function IslandMap() {
  const open = useGame((s) => s.mapOpen);
  const visited = useGame((s) => s.visited);
  const set = useGame((s) => s.set);
  // The player is paused while the map is open, so a render-time snapshot is accurate.
  const pos = { x: player.x, z: player.z };
  const toX = (x: number) => x + W / 2;
  const toY = (z: number) => z + H / 2;
  const fill = (t: (typeof tiles)[number]) => {
    if (t.kind === "void" || t.kind === "water") return null;
    if (t.kind === "dock") return "#B98A5E";
    if (t.kind === "sand" || t.kind === "path") return "#EFD9B4";
    if (t.kind === "ramp") return "#EED9A8";
    return t.h === 3 ? "#4EAE5C" : t.h === 2 ? "#6BC96C" : "#7EDC7A";
  };
  return (
    <Sheet open={open} onClose={() => set({ mapOpen: false })} label="Island map" wide>
      <p className="eyebrow">Island map</p>
      <h2 className="mt-1 font-serif text-[30px] leading-tight">Pocket Island</h2>
      <div className="mt-4 overflow-hidden rounded-[20px] border border-white bg-[#F6D5C8]">
        <svg viewBox={`2 3 ${W - 4} ${H - 2}`} className="block h-auto w-full" role="img" aria-label="Map of the island with landmarks">
          <defs>
            <filter id="hand" x="-5%" y="-5%" width="110%" height="110%">
              <feTurbulence type="fractalNoise" baseFrequency="0.35" numOctaves="2" seed="4" />
              <feDisplacementMap in="SourceGraphic" scale="0.6" />
            </filter>
          </defs>
          <g filter="url(#hand)">
            {tiles.map((t) => {
              const f = fill(t);
              return f ? <rect key={`${t.i}-${t.j}`} x={t.i} y={t.j} width={1.04} height={1.04} fill={f} /> : null;
            })}
          </g>
          {landmarkPlacements.map((p) => {
            const lm = landmarks.find((l) => l.id === p.id)!;
            const x = toX(p.center.x);
            const y = toY(p.center.z);
            return (
              <g key={p.id} transform={`translate(${x} ${y})`}>
                <circle r={1.25} fill={landmarkGlyph[p.id]} stroke="#FFF8EC" strokeWidth={0.35} />
                {visited[p.id] && <path d="M0 -0.7 L0.2 -0.2 L0.72 -0.2 L0.3 0.12 L0.45 0.65 L0 0.34 L-0.45 0.65 L-0.3 0.12 L-0.72 -0.2 L-0.2 -0.2 Z" fill="#FFC857" />}
                <text y={2.6} textAnchor="middle" fontSize={1.3} fontWeight={700} fill="#1E1B3A" style={{ fontFamily: "var(--font-dm-sans)" }}>
                  {lm.name}
                </text>
              </g>
            );
          })}
          <g transform={`translate(${toX(pos.x)} ${toY(pos.z)})`}>
            <circle r={1.1} fill="#7B6CF6" opacity={0.3} className="soft-pulse" />
            <circle r={0.55} fill="#7B6CF6" stroke="#fff" strokeWidth={0.25} />
          </g>
        </svg>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[13px] text-ink-soft">
        <Star className="size-3.5 fill-sun text-[#E0A21B]" /> Visited · <span className="inline-block size-2.5 rounded-full bg-violet" /> You are here
      </p>
    </Sheet>
  );
}

const emotes: { id: Emote; label: string; Icon: typeof Hand }[] = [
  { id: "wave", label: "Wave", Icon: Hand },
  { id: "cheer", label: "Cheer", Icon: PartyPopper },
  { id: "thinking", label: "Thinking", Icon: Lightbulb },
  { id: "clap", label: "Clap", Icon: Sparkles },
];

export function playEmote(id: Emote) {
  useGame.setState({ emote: { type: id, at: performance.now() }, emoteOpen: false });
  sfx.hop();
}

export function EmoteMenu() {
  const open = useGame((s) => s.emoteOpen);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8 }}
          transition={spring}
          className="glass absolute bottom-24 left-1/2 z-40 flex -translate-x-1/2 gap-1 rounded-full p-1.5"
          role="menu"
          aria-label="Emotes"
        >
          {emotes.map(({ id, label, Icon }, k) => (
            <button
              key={id}
              type="button"
              role="menuitem"
              onClick={() => playEmote(id)}
              className="flex flex-col items-center gap-0.5 rounded-full px-3.5 py-2 text-[12px] font-bold text-ink transition-colors hover:bg-white/80"
            >
              <Icon className="size-5 text-indigo" />
              {label}
              <span className="text-[10px] font-medium text-ink-soft">{k + 1}</span>
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Icon bubble that floats above the player while an emote plays. */
export function EmoteBubble() {
  const emote = useGame((s) => s.emote);
  const [doneAt, setDoneAt] = useState(0);
  useEffect(() => {
    if (!emote) return;
    const t = setTimeout(() => setDoneAt(emote.at), 1700);
    return () => clearTimeout(t);
  }, [emote]);
  const visible = !!emote && doneAt !== emote.at;
  const e = emotes.find((x) => x.id === emote?.type);
  return (
    <AnimatePresence>
      {visible && e && (
        <motion.div
          key={emote?.at}
          initial={{ opacity: 0, y: 10, scale: 0.6 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ type: "spring", stiffness: 420, damping: 22 }}
          className="pointer-events-none absolute left-1/2 top-[34%] z-30 -ml-6 grid size-12 place-items-center rounded-full border border-white bg-cream shadow-[0_12px_30px_rgba(123,108,246,0.3)]"
          aria-hidden
        >
          <e.Icon className="size-6 text-indigo" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Toasts() {
  const toasts = useGame((s) => s.toasts);
  return (
    <div className="pointer-events-none absolute inset-x-0 top-20 z-[60] flex flex-col items-center gap-2 px-4 sm:top-6" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: -24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16 }}
            transition={spring}
            className="glass flex items-center gap-2.5 rounded-full py-2 pl-2 pr-4 text-[14px] font-bold"
          >
            <span className="grid size-7 place-items-center rounded-full" style={{ background: t.color ?? "#EBD0EE" }}>
              {t.kind === "celebrate" ? <PartyPopper className="size-4 text-ink" /> : t.kind === "info" ? <Sparkles className="size-4 text-ink" /> : <Star className="size-4 text-ink" />}
            </span>
            {t.title}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function Confetti() {
  const at = useGame((s) => s.celebrateAt);
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!at || !canvas.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const c = canvas.current;
    const ctx = c.getContext("2d")!;
    const dpr = Math.min(2, window.devicePixelRatio);
    c.width = c.clientWidth * dpr;
    c.height = c.clientHeight * dpr;
    ctx.scale(dpr, dpr);
    const colors = ["#FF8A65", "#FFC857", "#7B6CF6", "#FFC4D6", "#9ADBB0", "#8FD3E8"];
    const bits = Array.from({ length: 140 }).map(() => ({
      x: c.clientWidth / 2 + (Math.random() - 0.5) * 120,
      y: c.clientHeight * 0.45,
      vx: (Math.random() - 0.5) * 11,
      vy: -Math.random() * 13 - 4,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      w: 6 + Math.random() * 6,
      h: 4 + Math.random() * 4,
      c: colors[Math.floor(Math.random() * colors.length)],
    }));
    let raf = 0;
    const start = performance.now();
    const tick = () => {
      const k = (performance.now() - start) / 1000;
      ctx.clearRect(0, 0, c.clientWidth, c.clientHeight);
      for (const b of bits) {
        b.vy += 0.35;
        b.vx *= 0.99;
        b.x += b.vx;
        b.y += b.vy;
        b.r += b.vr;
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - k / 2.6);
        ctx.translate(b.x, b.y);
        ctx.rotate(b.r);
        ctx.fillStyle = b.c;
        ctx.beginPath();
        ctx.roundRect(-b.w / 2, -b.h / 2, b.w, b.h, 2);
        ctx.fill();
        ctx.restore();
      }
      if (k < 2.8) raf = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, c.clientWidth, c.clientHeight);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [at]);
  return <canvas ref={canvas} className="pointer-events-none absolute inset-0 z-[55] h-full w-full" aria-hidden />;
}
