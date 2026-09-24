"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { copy } from "@/content/landmarks";

/** A seed sprouts while the world builds, then the greeting, then a fade into the island. */
export function LoadingScreen({ ready, onDone }: { ready: boolean; onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [greet, setGreet] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setProgress((p) => Math.min(ready ? 1 : 0.86, p + (ready ? 0.12 : 0.035))), 60);
    return () => clearInterval(id);
  }, [ready]);

  useEffect(() => {
    if (progress < 1) return;
    const a = setTimeout(() => setGreet(true), 150);
    const b = setTimeout(() => setGone(true), 1500);
    const c = setTimeout(onDone, 2100);
    return () => [a, b, c].forEach(clearTimeout);
  }, [progress, onDone]);

  const stem = Math.min(1, progress * 1.4);
  const leafL = Math.max(0, Math.min(1, (progress - 0.35) * 3));
  const leafR = Math.max(0, Math.min(1, (progress - 0.6) * 3));

  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[100] grid place-items-center sky"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          role="status"
          aria-live="polite"
          aria-label={greet ? copy.loadingLine : "Loading the island"}
        >
          <div className="flex flex-col items-center">
            <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden>
              <ellipse cx="60" cy="98" rx="30" ry="7" fill="#D9C2A5" />
              <ellipse cx="60" cy="94" rx="10" ry="6" fill="#B98A5E" />
              <g style={{ transformOrigin: "60px 92px", transform: `scaleY(${stem})`, transition: "transform 300ms cubic-bezier(0.34,1.56,0.64,1)" }}>
                <path d="M60 92 C60 78 59 66 60 52" stroke="#5FAE82" strokeWidth="4" strokeLinecap="round" fill="none" />
              </g>
              <g style={{ transformOrigin: "60px 62px", transform: `scale(${leafL}) rotate(${(1 - leafL) * -20}deg)`, transition: "transform 400ms cubic-bezier(0.34,1.56,0.64,1)" }}>
                <path d="M60 62 C48 60 40 52 38 44 C50 44 58 50 60 62 Z" fill="#9ADBB0" />
              </g>
              <g style={{ transformOrigin: "60px 56px", transform: `scale(${leafR}) rotate(${(1 - leafR) * 20}deg)`, transition: "transform 400ms cubic-bezier(0.34,1.56,0.64,1)" }}>
                <path d="M60 56 C72 54 80 46 82 36 C70 36 62 44 60 56 Z" fill="#7CC49A" />
              </g>
              {progress >= 1 && <circle cx="60" cy="50" r="6" fill="#FFC4D6" style={{ animation: "prompt-pop 500ms var(--spring) both" }} />}
            </svg>
            <div className="h-12">
              <AnimatePresence>
                {greet && (
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="font-serif text-[34px] italic tracking-tight text-ink"
                  >
                    {copy.loadingLine}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
