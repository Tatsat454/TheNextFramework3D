"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Star, X } from "lucide-react";
import {
  archive,
  getLandmark,
  getStory,
  marketGoods,
  museumExhibits,
  profile,
  type Landmark,
} from "@/content/landmarks";
import { sfx } from "@/game/audio";
import { useGame, type Card } from "@/game/store";
import { cn } from "@/lib/utils";

const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

function PrimaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  const external = /^(https?:|mailto:)/.test(href);
  const cls =
    "lift mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-coral px-5 text-[15px] font-bold text-white shadow-[0_14px_30px_rgba(200,55,60,0.35)] hover:bg-coral-deep";
  return external ? (
    <a href={href} className={cls} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener">
      {children}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

function Museum() {
  const donated = useGame((s) => s.donated);
  const count = museumExhibits.filter((s) => donated[s]).length;
  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between text-[13px] font-bold text-ink-soft">
        <span>The collection</span>
        <span className="rounded-full bg-sun/30 px-2.5 py-0.5 text-ink">
          {count} of {museumExhibits.length} exhibits donated
        </span>
      </div>
      <ul className="-mx-1 max-h-[38vh] space-y-1 overflow-y-auto px-1">
        {museumExhibits.map((slug, k) => {
          const st = getStory(slug)!;
          return (
            <li key={slug}>
              <Link
                href={`/story/${slug}`}
                className="group flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-white/70"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-violet/12 font-serif text-[16px] text-indigo">{k + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-bold text-ink">{st.title}</span>
                  <span className="block truncate text-[13px] text-ink-soft">{st.eyebrow.replace("Exhibit · ", "")}</span>
                </span>
                {donated[slug] ? (
                  <Star className="size-4 shrink-0 fill-sun text-[#E0A21B]" aria-label="Donated" />
                ) : (
                  <ArrowUpRight className="size-4 shrink-0 text-ink-soft transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-[13px] text-ink-soft">
        In the archive:{" "}
        {archive.map((a, k) => (
          <span key={a.title}>
            <a className="font-medium text-indigo underline decoration-indigo/30 underline-offset-2 hover:decoration-indigo" href={a.href} target="_blank" rel="noopener">
              {a.title}
            </a>
            {k < archive.length - 1 ? ", " : ""}
          </span>
        ))}
      </p>
    </div>
  );
}

function Market() {
  const [t, setT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setT((x) => x + 1), 2200);
    return () => clearInterval(id);
  }, []);
  return (
    <ul className="mt-4 grid grid-cols-2 gap-2">
      {marketGoods.map((g, k) => {
        const drift = Math.sin(t * 0.7 + k * 1.9) * 0.06 + Math.sin(t * 0.23 + k) * 0.03;
        const price = Math.round(g.base * (1 + drift));
        const up = Math.cos(t * 0.7 + k * 1.9) >= 0;
        return (
          <li key={g.name} className="rounded-2xl bg-white/60 px-3 py-2.5">
            <span className="block text-[12px] font-medium text-ink-soft">{g.name}</span>
            <span className="flex items-baseline gap-1.5">
              <span className="font-serif text-[22px] leading-tight text-ink tabular-nums">{price}</span>
              <span className={cn("text-[11px] font-bold", up ? "text-[#2F7A4B]" : "text-coral")}>{up ? "▲" : "▼"}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function Dock() {
  return (
    <ul className="mt-4 space-y-1.5">
      {profile.links.map((l) => (
        <li key={l.label}>
          <a
            href={l.href}
            target={l.href.startsWith("http") ? "_blank" : undefined}
            rel="noopener"
            className="flex items-center justify-between gap-3 rounded-2xl bg-white/60 px-4 py-3 transition-colors hover:bg-white"
          >
            <span>
              <span className="block text-[12px] font-bold uppercase tracking-[0.12em] text-indigo">{l.label}</span>
              <span className="block text-[15px] font-medium text-ink">{l.value}</span>
            </span>
            <ArrowUpRight className="size-4 text-ink-soft" />
          </a>
        </li>
      ))}
    </ul>
  );
}

function LandmarkBody({ lm }: { lm: Landmark }) {
  return (
    <>
      <p className="eyebrow">{lm.eyebrow}</p>
      <h2 className="mt-1.5 font-serif text-[32px] leading-[1.05] text-ink">{lm.title}</h2>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{lm.blurb}</p>
      {lm.id === "museum" && <Museum />}
      {lm.id === "market" && <Market />}
      {lm.id === "dock" && <Dock />}
      {lm.cta && <PrimaryLink href={lm.cta.href}>{lm.cta.label}</PrimaryLink>}
    </>
  );
}

function CardBody({ card }: { card: Card }) {
  const donated = useGame((s) => s.donated);
  if (card.type === "landmark") return <LandmarkBody lm={getLandmark(card.id)} />;
  if (card.type === "exhibit") {
    const st = getStory(card.slug)!;
    const n = museumExhibits.indexOf(card.slug as (typeof museumExhibits)[number]) + 1;
    return (
      <>
        <p className="eyebrow">Exhibit {n} · Museum</p>
        <h2 className="mt-1.5 font-serif text-[32px] leading-[1.05] text-ink">{st.title}</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{st.summary}</p>
        {st.tags && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {st.tags.map((t) => (
              <li key={t} className="rounded-full bg-violet/10 px-2.5 py-1 text-[12px] font-medium text-indigo">
                {t}
              </li>
            ))}
          </ul>
        )}
        {donated[card.slug] && (
          <p className="mt-3 flex items-center gap-1.5 text-[13px] font-bold text-ink">
            <Star className="size-4 fill-sun text-[#E0A21B]" /> Donated to the museum
          </p>
        )}
        <PrimaryLink href={`/story/${card.slug}`}>Read the exhibit</PrimaryLink>
      </>
    );
  }
  return null;
}

export function LandmarkCard() {
  const card = useGame((s) => s.card);
  const set = useGame((s) => s.set);
  const panel = useRef<HTMLDivElement>(null);
  const close = () => {
    sfx.close();
    set({ card: null });
  };

  useEffect(() => {
    if (card) setTimeout(() => panel.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus(), 50);
  }, [card]);

  const key = card ? `${card.type}:${"id" in card ? card.id : card.slug}` : "none";
  return (
    <AnimatePresence>
      {card && (
        <motion.div key="backdrop" className="absolute inset-0 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(30,27,58,0.05),rgba(30,27,58,0.22))]" />
        </motion.div>
      )}
      {card && (
        <div key={`wrap-${key}`} className="pointer-events-none absolute inset-x-0 bottom-0 z-50 flex justify-center sm:bottom-24">
        <motion.div
          key={key}
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label="Landmark details"
          initial={{ y: 60, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0, scale: 0.98 }}
          transition={spring}
          className="glass pointer-events-auto relative max-h-[82vh] w-full overflow-y-auto rounded-b-none px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6 sm:w-[372px] sm:rounded-[24px] sm:pb-6"
          style={{ background: "rgba(255,255,255,0.72)" }}
        >
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-ink/15 sm:hidden" aria-hidden />
          <button
            type="button"
            data-autofocus
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-white/70 text-ink transition-colors hover:bg-white"
          >
            <X className="size-4" />
          </button>
          <div className="pr-8">
            <CardBody card={card} />
          </div>
        </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
