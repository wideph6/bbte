import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { ArrowLeftIcon, SparkleIcon, PlayIcon } from "@/components/public/icons";

export const revalidate = 60;

export default async function HomePage() {
  const [settings, courses] = await Promise.all([
    prisma.globalSettings.findUnique({ where: { id: 1 } }).catch(() => null),
    prisma.course.findMany({
      where: { status: "active" },
      orderBy: { createdAt: "desc" },
      include: {
        detailFields: { where: { isPrice: true }, take: 1 },
      },
    }).catch(() => []),
  ]);

  return (
    <>
      <ScrollReveal />
      <SiteHeader settings={settings} />

      <main className="pb-20">
        {/* ── COURSES GRID ───────────────────────────────────────────────────
            Hero ko remove kar diya gaya — page ab seedha courses par focus
            karta hai. Top par bas thodi si breathing space + section ribbon. */}
        <section className="relative">
          {/* Soft pattern wash for premium feel without a full hero. */}
          <div className="absolute inset-x-0 top-0 h-72 bg-pattern-arabesque opacity-50" aria-hidden="true" />
          <div className="absolute inset-x-0 top-0 h-72 bg-hero-radial" aria-hidden="true" />

          <div className="relative container-wide pt-10 pb-12 sm:pt-14 sm:pb-16">
            {courses.length === 0 ? (
              <div
                data-reveal="out"
                className="rounded-3xl border border-dashed border-brand/30 bg-white/60 p-12 text-center backdrop-blur-sm"
              >
                <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-brand/10 text-brand">
                  <SparkleIcon className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-semibold text-brand-dark mb-2">جلد آرہا ہے</h2>
                <p className="text-slate-600 text-lg">
                  ابھی کوئی کورس موجود نہیں۔ جلد ہی نئے کورسز شامل کیے جائیں گے۔
                </p>
              </div>
            ) : (
              <div className="grid gap-7 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((c, i) => (
                  <CourseCard
                    key={c.id}
                    href={`/course/${c.slug}`}
                    title={c.title}
                    subHeadline={c.subHeadline}
                    heroImageUrl={c.heroImageUrl}
                    price={c.detailFields[0]?.value ?? null}
                    priceLabel={c.detailFields[0]?.label ?? "قیمت"}
                    delay={i}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <SiteFooter settings={settings} />
    </>
  );
}

/**
 * Premium Urdu-fit course card.
 *
 * Design notes (why this layout works for Urdu):
 *  - Title is `text-2xl` with `leading-snug` + extra `pb-1` so Nastaliq
 *    descenders (ی، ب، ج) don't crash into the next line.
 *  - Subhead uses `line-clamp-2` with comfortable `leading-loose` so a single
 *    Urdu sentence stays readable; we also keep a fixed min-height so cards
 *    align in a row even when one course has no subhead.
 *  - The price chip lives on the image at the *top-right* (RTL natural
 *    "primary" corner) instead of bottom-left to mirror the visual weight
 *    Urdu readers expect. Numerals stay in Inter (.ltr) for legibility.
 *  - The CTA strip sits at the bottom with an emerald gradient + animated
 *    shine sweep, matching the WhatsApp button language elsewhere on the
 *    site so the visual vocabulary stays consistent.
 *  - Decorative gold corner ornament (top-right corner) signals "premium"
 *    and ties into the broader gold/emerald palette without being loud.
 */
function CourseCard({
  href,
  title,
  subHeadline,
  heroImageUrl,
  price,
  priceLabel,
  delay,
}: {
  href: string;
  title: string;
  subHeadline: string | null;
  heroImageUrl: string | null;
  price: string | null;
  priceLabel: string;
  delay: number;
}) {
  return (
    <Link
      href={href}
      data-reveal="out"
      style={{ transitionDelay: `${Math.min(delay * 80, 400)}ms` }}
      className="group relative flex flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-soft ring-1 ring-slate-200/70 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift hover:ring-brand/25"
    >
      {/* Top gold hairline — subtle premium signal */}
      <span
        className="absolute inset-x-0 top-0 z-10 h-[3px] bg-gradient-to-l from-gold/0 via-gold to-gold/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden="true"
      />

      {/* ── Image ─────────────────────────────────────────────────────── */}
      <div className="relative aspect-[16/10] overflow-hidden bg-emerald-rich">
        {heroImageUrl ? (
          <Image
            src={heroImageUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-pattern-arabesque text-white/70 text-lg">
            تصویر دستیاب نہیں
          </div>
        )}

        {/* Bottom gradient — smooth handoff into the card body */}
        <div
          className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/60 via-black/15 to-transparent"
          aria-hidden="true"
        />

        {/* Decorative gold corner ornament (RTL primary corner = top-right) */}
        <div
          className="pointer-events-none absolute -right-px -top-px h-16 w-16 overflow-hidden"
          aria-hidden="true"
        >
          <span className="absolute right-0 top-0 h-full w-full bg-gradient-to-bl from-gold/80 via-gold/40 to-transparent" />
          <span className="absolute right-2 top-2 h-px w-7 rotate-[225deg] origin-right bg-white/70" />
        </div>

        {/* Live badge — left side */}
        <div
          className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-brand-dark shadow-soft backdrop-blur-sm"
        >
          <span className="relative grid h-2 w-2 place-items-center">
            <span className="absolute inset-0 rounded-full bg-emerald-500/60 animate-pulse-ring" />
            <span className="relative h-2 w-2 rounded-full bg-emerald-600" />
          </span>
          <span>لائیو کلاسز</span>
        </div>

        {/* Price chip — bottom on image, properly contrasted */}
        {price ? (
          <div className="absolute bottom-3 right-3 inline-flex items-stretch overflow-hidden rounded-2xl bg-white/95 shadow-lift ring-1 ring-white/70 backdrop-blur-sm">
            <span className="flex items-center bg-gold/20 px-2.5 text-[11px] font-medium text-gold-deep border-l border-gold/30">
              {priceLabel}
            </span>
            <span className="ltr px-3.5 py-1.5 text-base font-bold text-brand-darker">
              {price}
            </span>
          </div>
        ) : null}
      </div>

      {/* ── Body ──────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        {/* Title — generous leading for Nastaliq */}
        <h2 className="text-2xl sm:text-[1.7rem] font-semibold text-slate-900 leading-snug pb-1 mb-3 group-hover:text-brand-dark transition-colors">
          {title}
        </h2>

        {/* Subhead — fixed min-height keeps cards aligned in the row */}
        <p
          className={`text-slate-600 leading-loose mb-6 line-clamp-2 min-h-[3.5rem] ${
            subHeadline ? "" : "opacity-0 select-none"
          }`}
        >
          {subHeadline ?? "—"}
        </p>

        {/* CTA strip */}
        <div className="mt-auto">
          <div
            className="relative inline-flex w-full items-center justify-between gap-3 overflow-hidden rounded-2xl bg-emerald-rich px-5 py-3.5 text-white shadow-glow ring-1 ring-brand-darker/20 transition-transform duration-300 group-hover:translate-y-[1px]"
          >
            {/* shine sweep */}
            <span
              className="pointer-events-none absolute -inset-1 bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.18)_50%,transparent_70%)] bg-[length:200%_100%] animate-shine"
              aria-hidden="true"
            />
            <span className="relative inline-flex items-center gap-2 text-base font-semibold">
              <PlayIcon className="h-3.5 w-3.5 text-gold-soft" />
              <span>تفصیل دیکھیں</span>
            </span>
            <span className="relative grid h-8 w-8 place-items-center rounded-full bg-white/15 ring-1 ring-white/20 transition-transform duration-300 group-hover:-translate-x-1">
              <ArrowLeftIcon className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
