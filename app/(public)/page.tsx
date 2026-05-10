import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { ArrowLeftIcon, SparkleIcon } from "@/components/public/icons";

export const revalidate = 60;

export default async function HomePage() {
  const [settings, courses] = await Promise.all([
    prisma.globalSettings.findUnique({ where: { id: 1 } }).catch(() => null),
    prisma.course.findMany({
      where: { status: "active" },
      orderBy: { createdAt: "desc" },
      include: { detailFields: { where: { isPrice: true }, take: 1 } },
    }).catch(() => []),
  ]);

  return (
    <>
      <ScrollReveal />
      <SiteHeader settings={settings} />

      <main className="pb-20">
        {/* ── HERO ───────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          {/* Layered backgrounds: pattern + radial wash. */}
          <div className="absolute inset-0 bg-pattern-arabesque opacity-60" aria-hidden="true" />
          <div className="absolute inset-0 bg-hero-radial" aria-hidden="true" />
          <div className="absolute -top-32 -left-32 h-72 w-72 rounded-full bg-brand/10 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-gold/10 blur-3xl" aria-hidden="true" />

          <div className="relative container-wide pt-12 pb-14 sm:pt-20 sm:pb-20 text-center">
            <div data-reveal="out" className="mx-auto inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white/70 backdrop-blur-sm px-4 py-1.5 text-sm text-gold-deep shadow-soft mb-6">
              <SparkleIcon className="h-4 w-4 text-gold" />
              <span>معیاری اسلامی و علمی کورسز</span>
            </div>

            <h1
              data-reveal="out"
              className="display text-4xl sm:text-6xl lg:text-7xl font-normal text-brand-darker mb-5"
            >
              {settings?.siteTitle ?? "ہمارے کورسز"}
            </h1>
            {settings?.tagline ? (
              <p
                data-reveal="out"
                className="mx-auto max-w-2xl text-lg sm:text-xl text-slate-600 mb-2"
              >
                {settings.tagline}
              </p>
            ) : null}

            <div className="ornament mt-8" aria-hidden="true">
              <SparkleIcon className="h-3.5 w-3.5 text-gold" />
            </div>
          </div>
        </section>

        {/* ── COURSES GRID ───────────────────────────────────────────────────── */}
        <section className="container-wide py-10 sm:py-14">
          {courses.length === 0 ? (
            <div
              data-reveal="out"
              className="rounded-3xl border border-dashed border-brand/30 bg-white/60 p-12 text-center backdrop-blur-sm"
            >
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-brand/10 text-brand">
                <SparkleIcon className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-brand-dark mb-2">جلد آرہا ہے</h2>
              <p className="text-slate-600 text-lg">
                ابھی کوئی کورس موجود نہیں۔ جلد ہی نئے کورسز شامل کیے جائیں گے۔
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((c, i) => (
                <Link
                  key={c.id}
                  href={`/course/${c.slug}`}
                  data-reveal="out"
                  style={{ transitionDelay: `${Math.min(i * 80, 400)}ms` }}
                  className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-slate-200/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift hover:ring-brand/20"
                >
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-emerald-rich">
                    {c.heroImageUrl ? (
                      <Image
                        src={c.heroImageUrl}
                        alt={c.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-white/70 bg-pattern-arabesque text-lg">
                        تصویر دستیاب نہیں
                      </div>
                    )}
                    {/* Bottom gradient over image for text contrast on hover. */}
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
                    {c.detailFields[0] ? (
                      <div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-sm font-bold text-brand-dark shadow-soft backdrop-blur-sm">
                        {c.detailFields[0].value}
                      </div>
                    ) : null}
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 group-hover:text-brand-dark transition-colors mb-2 leading-snug">
                      {c.title}
                    </h2>
                    {c.subHeadline ? (
                      <p className="text-slate-600 mb-5 line-clamp-2 leading-relaxed">
                        {c.subHeadline}
                      </p>
                    ) : null}
                    <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="inline-flex items-center gap-2 font-semibold text-brand transition-colors group-hover:text-brand-dark">
                        <span>تفصیل دیکھیں</span>
                        <ArrowLeftIcon className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <SiteFooter settings={settings} />
    </>
  );
}
