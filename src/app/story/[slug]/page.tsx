import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { copy, galleryExhibits, getStory, isPlaceholderText, museumExhibits, skills, stories } from "@/content/landmarks";
import { DonateOnRead } from "@/components/story/DonateOnRead";
import { Chip, PageShell } from "@/components/story/PageShell";

export function generateStaticParams() {
  return stories.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/story/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) return {};
  return { title: story.title, description: story.summary, openGraph: { title: story.title, description: story.summary } };
}

export default async function StoryPage({ params }: PageProps<"/story/[slug]">) {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) notFound();
  const exhibitIndex = museumExhibits.indexOf(slug as (typeof museumExhibits)[number]);
  const next = exhibitIndex >= 0 ? getStory(museumExhibits[(exhibitIndex + 1) % museumExhibits.length]) : null;

  return (
    <PageShell>
      <article className="mx-auto max-w-[680px] px-5 pt-16 sm:px-0 sm:pt-24">
        <p className="eyebrow">
          {story.eyebrow}
          {story.placeholder && <Chip kind="placeholder" />}
        </p>
        <h1 className="mt-3 font-serif text-[46px] leading-[1.02] tracking-[-0.02em] text-ink sm:text-[64px]">{story.title}</h1>
        <p className="mt-5 text-[19px] leading-[1.55] text-ink-soft sm:text-[21px]">{story.summary}</p>
        {(story.meta || story.tags) && (
          <div className="mt-6 flex flex-wrap items-center gap-2 text-[14px]">
            {story.meta && <span className="font-medium text-ink">{story.meta}</span>}
            {story.tags?.map((t) => (
              <span key={t} className="rounded-full border border-white bg-white/70 px-3 py-1 font-medium text-indigo">
                {t}
              </span>
            ))}
          </div>
        )}

        {slug === "skills" && (
          <ul className="mt-12 space-y-4">
            {skills.map((s) => (
              <li key={s.id} className="rounded-[24px] border border-white bg-white/70 p-6 shadow-[0_18px_40px_rgba(123,108,246,0.12)]">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="font-serif text-[28px] leading-tight">{s.name}</h2>
                  <span className="flex w-28 gap-1" aria-label={`Strength ${s.level} of 5`}>
                    {Array.from({ length: 5 }).map((_, k) => (
                      <span key={k} className={`h-2 flex-1 rounded-full ${k < s.level ? "bg-leaf" : "bg-ink/10"}`} />
                    ))}
                  </span>
                </div>
                <p className="mt-2 text-[17px] leading-[1.6] text-ink">{s.example}</p>
              </li>
            ))}
            <li className="px-2 text-[14px] text-ink-soft">
              Strength levels are self-assessed <Chip kind="draft" />
            </li>
          </ul>
        )}

        <div className="mt-12 space-y-12">
          {story.sections.map((sec, k) => (
            <section key={k}>
              <h2 className="font-serif text-[30px] leading-tight tracking-[-0.02em] text-ink sm:text-[34px]">
                {sec.heading}
                {sec.placeholder ? <Chip kind="placeholder" /> : sec.draft ? <Chip kind="draft" /> : null}
              </h2>
              {sec.body.map((p, i) => (
                <p key={i} className={`mt-3 text-[18px] leading-[1.6] ${isPlaceholderText(p) ? "rounded-2xl border border-dashed border-ink/20 bg-sun/10 p-4 text-ink-soft" : "text-ink"}`}>
                  {p}
                </p>
              ))}
              {sec.bullets && (
                <ul className="mt-4 space-y-2.5">
                  {sec.bullets.map((b, i) => (
                    <li key={i} className="flex gap-3 text-[17px] leading-[1.6] text-ink">
                      <span className="mt-[0.62em] size-1.5 shrink-0 rounded-full bg-violet" aria-hidden />
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        {story.links && (
          <div className="mt-12 flex flex-wrap gap-3">
            {story.links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener"
                className="lift inline-flex h-12 items-center gap-2 rounded-2xl bg-coral px-5 text-[15px] font-bold text-white shadow-[0_14px_30px_rgba(200,55,60,0.3)]"
              >
                {l.label}
                <ArrowUpRight className="size-4" />
              </a>
            ))}
          </div>
        )}

        {(story.kind === "case-study" || galleryExhibits.includes(slug as (typeof galleryExhibits)[number])) && (
          <DonateOnRead slug={slug} />
        )}

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link href="/" className="lift inline-flex h-12 items-center rounded-2xl bg-ink px-5 text-[15px] font-bold text-white">
            {copy.backToIsland}
          </Link>
          {next && (
            <Link href={`/story/${next.slug}`} className="lift inline-flex h-12 items-center rounded-2xl border border-white bg-white/80 px-5 text-[15px] font-bold text-ink">
              Next exhibit: {next.title} →
            </Link>
          )}
        </div>
      </article>
    </PageShell>
  );
}
