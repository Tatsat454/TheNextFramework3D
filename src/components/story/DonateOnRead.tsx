"use client";

import { useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";
import { patchSaved, readSaved } from "@/game/store";

/** Reading an exhibit to the end donates it to the Museum (gold star on its pedestal). */
export function DonateOnRead({ slug }: { slug: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [donated, setDonated] = useState(false);
  useEffect(() => {
    setDonated(!!readSaved().donated[slug]);
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        patchSaved((s) => ({ ...s, donated: { ...s.donated, [slug]: true } }));
        setDonated(true);
        io.disconnect();
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [slug]);
  return (
    <div ref={ref} className="mt-14 flex items-center gap-3 rounded-[24px] border border-white bg-white/70 p-5 shadow-[0_18px_40px_rgba(123,108,246,0.18)]">
      <span className={`grid size-11 shrink-0 place-items-center rounded-full transition-colors duration-500 ${donated ? "bg-sun" : "bg-ink/5"}`}>
        <Star className={`size-5 transition-all duration-500 ${donated ? "scale-110 fill-white text-white" : "text-ink/30"}`} />
      </span>
      <p className="text-[15px] leading-snug text-ink">
        {donated ? (
          <>
            <strong>Donated to the museum.</strong> A gold star now shines on this exhibit&apos;s pedestal.
          </>
        ) : (
          "Read to the end to donate this exhibit to the museum."
        )}
      </p>
    </div>
  );
}
