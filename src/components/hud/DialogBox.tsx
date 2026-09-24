"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { isPlaceholderText, residents } from "@/content/landmarks";
import { sfx } from "@/game/audio";
import { useGame } from "@/game/store";
import { cn } from "@/lib/utils";

export const dialogControl = { advance: () => {} };

export function DialogBox() {
  const dialog = useGame((s) => s.dialog);
  const set = useGame((s) => s.set);
  const speaker = dialog ? residents.find((r) => r.id === dialog.speaker)! : null;
  const line = dialog ? dialog.lines[dialog.index] : "";
  const lineKey = dialog ? `${dialog.speaker}:${dialog.index}:${line}` : "";
  const [typed, setTyped] = useState({ key: "", n: 0 });
  const timer = useRef<number | null>(null);
  // Reset the typewriter whenever the line changes (derived-state reset during render).
  if (typed.key !== lineKey) setTyped({ key: lineKey, n: 0 });
  const shown = typed.key === lineKey ? typed.n : 0;
  const done = shown >= line.length;
  const last = dialog ? dialog.index === dialog.lines.length - 1 : false;

  useEffect(() => {
    if (!lineKey || !speaker) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let i = reduce ? line.length - 1 : 0;
    timer.current = window.setInterval(() => {
      i++;
      setTyped({ key: lineKey, n: i });
      if (!reduce && i % 2 === 0) sfx.babble(line[i - 1] ?? "", speaker.voice);
      if (i >= line.length && timer.current) window.clearInterval(timer.current);
    }, 26);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [lineKey, line, speaker]);

  const advance = () => {
    const d = useGame.getState().dialog;
    if (!d) return;
    if (!done) {
      if (timer.current) window.clearInterval(timer.current);
      setTyped({ key: lineKey, n: line.length });
      return;
    }
    if (d.index < d.lines.length - 1) {
      sfx.click();
      set({ dialog: { ...d, index: d.index + 1 } });
    } else {
      set({ dialog: null });
    }
  };
  useEffect(() => {
    dialogControl.advance = advance;
  });

  const openMuseum = () => {
    set({ dialog: null, card: { type: "landmark", id: "museum" } });
    sfx.open();
  };

  return (
    <AnimatePresence>
      {dialog && speaker && (
        <motion.div
          key="dialog"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 30, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-8"
        >
          <div
            role="dialog"
            aria-label={`${speaker.name} says`}
            onClick={advance}
            className="relative w-full max-w-[720px] cursor-pointer select-none rounded-[32px] border border-white bg-cream px-7 pb-7 pt-8 text-ink shadow-[0_24px_60px_rgba(123,108,246,0.3)] sm:px-9"
          >
            <span
              className="absolute -top-4 left-7 rounded-full px-4 py-1.5 text-[14px] font-bold text-ink shadow-[0_8px_18px_rgba(30,27,58,0.15)]"
              style={{ background: speaker.tagColor }}
            >
              {speaker.name}
              <span className="ml-1.5 text-[12px] font-medium opacity-70">{speaker.role}</span>
            </span>
            <p aria-live="polite" className={cn("min-h-[3.4em] text-[18px] leading-[1.6] sm:text-[19px]", isPlaceholderText(line) && "text-ink-soft")}>
              {line.slice(0, shown)}
              <span className="invisible">{line.slice(shown)}</span>
            </p>
            {isPlaceholderText(line) && done && (
              <span className="mt-1 inline-block rounded-full bg-sun/40 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider">Placeholder</span>
            )}
            {done && last && dialog.action === "museum" ? (
              <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
                <button type="button" onClick={openMuseum} className="lift rounded-2xl bg-coral px-4 py-2.5 text-[15px] font-bold text-white">
                  Show me the collection
                </button>
                <button type="button" onClick={() => set({ dialog: null })} className="rounded-2xl bg-white px-4 py-2.5 text-[15px] font-bold text-ink">
                  Maybe later
                </button>
              </div>
            ) : (
              done && (
                <span className="nudge absolute bottom-4 right-7 text-[18px] text-indigo" aria-hidden>
                  ▼
                </span>
              )
            )}
            <span className="sr-only">Press E, Space or click to continue.</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
