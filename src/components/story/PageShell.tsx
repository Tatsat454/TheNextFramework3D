import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { copy, profile } from "@/content/landmarks";

export function PageShell({ children, back = "island" }: { children: React.ReactNode; back?: "island" | "work" }) {
  return (
    <div className="min-h-dvh bg-cream">
      <div className="sky pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-70 [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden />
      <header className="relative z-10 mx-auto flex max-w-[1080px] items-center justify-between gap-3 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-8">
        <Link
          href="/"
          className="glass lift flex h-11 items-center gap-2 rounded-full px-4 text-[14px] font-bold text-ink"
          style={{ borderRadius: 999 }}
        >
          <ArrowLeft className="size-4" />
          {copy.backToIsland}
        </Link>
        {back === "island" ? (
          <Link href="/work" className="lift flex h-11 items-center rounded-full bg-ink px-4 text-[14px] font-bold text-white">
            All the work →
          </Link>
        ) : null}
      </header>
      <div className="relative z-10">{children}</div>
      <footer className="relative z-10 mx-auto max-w-[1080px] px-5 pb-12 pt-20 text-[14px] text-ink-soft sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-6">
          <span className="font-serif text-[18px] italic text-ink">{profile.motto}</span>
          <span className="flex flex-wrap gap-4">
            {profile.links.map((l) => (
              <a key={l.label} href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noopener" className="font-medium hover:text-indigo">
                {l.label}
              </a>
            ))}
          </span>
        </div>
      </footer>
    </div>
  );
}

export function Chip({ kind }: { kind: "draft" | "placeholder" }) {
  return (
    <span
      className={
        kind === "placeholder"
          ? "ml-2 inline-block rounded-full bg-sun/45 px-2 py-0.5 align-middle text-[11px] font-bold uppercase tracking-wider text-ink"
          : "ml-2 inline-block rounded-full bg-lavender/60 px-2 py-0.5 align-middle text-[11px] font-bold uppercase tracking-wider text-ink"
      }
      title={kind === "placeholder" ? "Placeholder: replace with real content" : "Draft: written from the resume, needs review"}
    >
      {kind}
    </span>
  );
}
