import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { archive, copy, getStory, museumExhibits, profile, skills, stories } from "@/content/landmarks";
import { Chip } from "@/components/story/PageShell";

export const metadata: Metadata = {
  title: "The work",
  description: `${profile.name}: case studies, experience and skills. ${profile.headline}`,
};

const tile = "rounded-[28px] border border-white bg-white/75 p-6 shadow-[0_18px_44px_rgba(123,108,246,0.14)] sm:p-7";
const accents = ["#FFD9CC", "#EBD0EE", "#C7B9FF", "#9ADBB0", "#FFC857", "#B8E6F2"];

export default function WorkPage() {
  const experience = getStory("experience")!;
  return (
    <div className="min-h-dvh bg-cream">
      <div className="sky pointer-events-none absolute inset-x-0 top-0 h-[520px] opacity-80 [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden />
      <main className="relative mx-auto max-w-[1120px] px-4 pb-16 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-8">
        <nav className="flex items-center justify-between gap-3" aria-label="Site">
          <span className="grid size-11 place-items-center rounded-full border border-white bg-white/70 font-serif text-[19px]">{profile.initials}</span>
          <Link href="/" className="lift flex h-11 items-center rounded-full bg-ink px-5 text-[14px] font-bold text-white shadow-[0_12px_32px_rgba(30,27,58,0.3)]">
            {copy.enterIsland} →
          </Link>
        </nav>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-6">
          {/* Intro */}
          <section className={`${tile} md:col-span-4`} aria-labelledby="intro">
            <p className="eyebrow">Portfolio</p>
            <h1 id="intro" className="mt-2 font-serif text-[48px] leading-[0.98] tracking-[-0.02em] sm:text-[68px]">
              {profile.name}
            </h1>
            <p className="mt-4 max-w-[560px] text-[18px] leading-[1.6] text-ink-soft">{profile.headline}</p>
            <p className="mt-4 font-serif text-[22px] italic text-indigo">&ldquo;{profile.motto}&rdquo;</p>
          </section>
          <section className={`${tile} flex flex-col justify-between bg-ink text-white md:col-span-2`} style={{ background: "#1E1B3A" }} aria-label="Highlights">
            {profile.stats.map((s) => (
              <div key={s.label} className="border-b border-white/10 py-3 first:pt-0 last:border-0 last:pb-0">
                <span className="block font-serif text-[40px] leading-none text-sun">{s.value}</span>
                <span className="mt-1 block text-[14px] text-white/75">{s.label}</span>
              </div>
            ))}
          </section>

          {/* Case studies */}
          <section className="md:col-span-6" aria-labelledby="cases">
            <div className="flex items-end justify-between px-1 pb-3 pt-6">
              <h2 id="cases" className="font-serif text-[34px] leading-none tracking-[-0.02em]">
                Case studies
              </h2>
              <span className="text-[14px] text-ink-soft">The museum&apos;s collection</span>
            </div>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {museumExhibits.map((slug, k) => {
                const st = getStory(slug)!;
                return (
                  <li key={slug}>
                    <Link href={`/story/${slug}`} className={`${tile} lift group flex h-full flex-col`}>
                      <span className="mb-4 grid size-10 place-items-center rounded-2xl font-serif text-[18px] text-ink" style={{ background: accents[k % accents.length] }}>
                        {k + 1}
                      </span>
                      <span className="eyebrow">{st.eyebrow.replace("Exhibit · ", "")}</span>
                      <span className="mt-1.5 font-serif text-[26px] leading-[1.08] tracking-[-0.02em] text-ink">{st.title}</span>
                      <span className="mt-2 flex-1 text-[15px] leading-[1.55] text-ink-soft">{st.summary}</span>
                      <span className="mt-4 inline-flex items-center gap-1 text-[14px] font-bold text-coral">
                        Read the case study <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Experience */}
          <section className={`${tile} md:col-span-4`} aria-labelledby="exp">
            <div className="flex items-baseline justify-between gap-3">
              <h2 id="exp" className="font-serif text-[30px] leading-none tracking-[-0.02em]">
                Experience
              </h2>
              <Link href="/story/experience" className="text-[14px] font-bold text-indigo hover:underline">
                Full record →
              </Link>
            </div>
            <ul className="mt-5 divide-y divide-ink/10">
              {experience.sections.slice(0, 4).map((sec) => (
                <li key={sec.heading} className="py-3.5 first:pt-0 last:pb-0">
                  <p className="text-[16px] font-bold text-ink">{sec.heading}</p>
                  <p className="text-[14px] text-ink-soft">{sec.body[0]}</p>
                  {sec.bullets?.[0] && <p className="mt-1 text-[15px] leading-[1.55] text-ink">{sec.bullets[0]}</p>}
                </li>
              ))}
            </ul>
          </section>

          {/* Currently playing */}
          <section className={`${tile} md:col-span-2`} aria-labelledby="playing" style={{ background: "rgba(235,208,238,0.55)" }}>
            <h2 id="playing" className="font-serif text-[28px] leading-none tracking-[-0.02em]">
              Currently playing
              {copy.currentlyPlaying.placeholder && <Chip kind="placeholder" />}
            </h2>
            <ul className="mt-4 space-y-2">
              {copy.currentlyPlaying.games.map((g, k) => (
                <li key={k} className="rounded-2xl bg-white/70 px-4 py-3 text-[15px] font-medium text-ink-soft">
                  {g}
                </li>
              ))}
            </ul>
            <Link href="/story/arcade" className="mt-4 inline-block text-[14px] font-bold text-indigo hover:underline">
              Game teardowns →
            </Link>
          </section>

          {/* Toolkit */}
          <section className={`${tile} md:col-span-3`} aria-labelledby="toolkit">
            <h2 id="toolkit" className="font-serif text-[30px] leading-none tracking-[-0.02em]">
              Toolkit
            </h2>
            <ul className="mt-5 space-y-3">
              {skills.map((s) => (
                <li key={s.id}>
                  <div className="flex items-center justify-between text-[15px]">
                    <span className="font-bold text-ink">{s.name}</span>
                    <span className="flex w-24 gap-1" aria-label={`Strength ${s.level} of 5`}>
                      {Array.from({ length: 5 }).map((_, k) => (
                        <span key={k} className={`h-1.5 flex-1 rounded-full ${k < s.level ? "bg-leaf" : "bg-ink/10"}`} />
                      ))}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[14px] leading-[1.5] text-ink-soft">{s.example}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* More */}
          <section className={`${tile} md:col-span-3`} aria-labelledby="more">
            <h2 id="more" className="font-serif text-[30px] leading-none tracking-[-0.02em]">
              More from the island
            </h2>
            <ul className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {stories
                .filter((s) => s.kind === "page" && !["experience", "skills"].includes(s.slug))
                .map((s) => (
                  <li key={s.slug}>
                    <Link href={`/story/${s.slug}`} className="block rounded-2xl bg-white/70 px-4 py-3 transition-colors hover:bg-white">
                      <span className="block text-[12px] font-bold uppercase tracking-[0.12em] text-indigo">{s.eyebrow.split(" · ")[0]}</span>
                      <span className="block text-[15px] font-bold text-ink">
                        {s.title}
                        {s.placeholder && <Chip kind="placeholder" />}
                      </span>
                    </Link>
                  </li>
                ))}
              {archive.map((a) => (
                <li key={a.title}>
                  <a href={a.href} target="_blank" rel="noopener" className="block rounded-2xl bg-white/70 px-4 py-3 transition-colors hover:bg-white">
                    <span className="block text-[12px] font-bold uppercase tracking-[0.12em] text-indigo">GitHub</span>
                    <span className="block text-[15px] font-bold text-ink">{a.title}</span>
                    <span className="block text-[13px] text-ink-soft">{a.blurb}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          {/* Contact */}
          <section className={`${tile} md:col-span-6`} aria-labelledby="contact" style={{ background: "rgba(255,217,204,0.6)" }}>
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 id="contact" className="font-serif text-[36px] leading-none tracking-[-0.02em]">
                  Let&apos;s talk
                </h2>
                <p className="mt-2 max-w-[520px] text-[16px] text-ink-soft">Product, growth or partnerships in games and entertainment. I usually reply within a day.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a href={`mailto:${profile.email}`} className="lift inline-flex h-12 items-center rounded-2xl bg-coral px-5 text-[15px] font-bold text-white shadow-[0_14px_30px_rgba(200,55,60,0.3)]">
                  Email me
                </a>
                {profile.links.slice(1).map((l) => (
                  <a key={l.label} href={l.href} target="_blank" rel="noopener" className="lift inline-flex h-12 items-center rounded-2xl border border-white bg-white/80 px-5 text-[15px] font-bold text-ink">
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
