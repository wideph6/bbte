import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { WhatsAppButton } from "@/components/public/whatsapp-button";
import { StickyMobileCTA } from "@/components/public/sticky-mobile-cta";
import { CoursePageTracker } from "@/components/public/course-page-tracker";
import {
  CheckIcon,
  XIcon,
  StarIcon,
  QuoteIcon,
  SparkleIcon,
  ShieldCheckIcon,
  UsersIcon,
  PlayIcon,
} from "@/components/public/icons";
import { FaqAccordion } from "@/components/public/faq-accordion";
import { ScrollReveal } from "@/components/public/scroll-reveal";

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  try {
    const courses = await prisma.course.findMany({
      where: { status: "active" },
      select: { slug: true },
    });
    return courses.map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

export const revalidate = 60;

async function loadCourse(slug: string) {
  return prisma.course.findUnique({
    where: { slug },
    include: {
      instructor: true,
      forYouPoints: { orderBy: { order: "asc" } },
      notForYouPoints: { orderBy: { order: "asc" } },
      learningPoints: { orderBy: { order: "asc" } },
      detailFields: { orderBy: { order: "asc" } },
      testimonials: { orderBy: { order: "asc" } },
      faqs: { orderBy: { order: "asc" } },
    },
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const course = await loadCourse(params.slug).catch(() => null);
  if (!course) return { title: "Course not found" };
  return {
    title: course.seoTitle ?? course.title,
    description: course.seoDescription ?? course.subHeadline ?? undefined,
    openGraph: {
      title: course.seoTitle ?? course.title,
      description: course.seoDescription ?? course.subHeadline ?? undefined,
      images: course.ogImageUrl ? [course.ogImageUrl] : course.heroImageUrl ? [course.heroImageUrl] : undefined,
    },
  };
}

/**
 * Pulls sensible default values from the price/duration/format detail fields
 * to render hero "trust chips" without the admin having to repeat them.
 */
function pickHeroChips(fields: Array<{ label: string; value: string; isPrice: boolean }>) {
  const chips: { label: string; value: string }[] = [];
  for (const f of fields) {
    if (f.isPrice) continue;
    if (chips.length >= 3) break;
    chips.push({ label: f.label, value: f.value });
  }
  return chips;
}

export default async function CourseLandingPage({ params }: PageProps) {
  const [course, settings] = await Promise.all([
    loadCourse(params.slug),
    prisma.globalSettings.findUnique({ where: { id: 1 } }).catch(() => null),
  ]);

  if (!course || course.status !== "active") notFound();

  const whatsappNumber = course.whatsappNumber || settings?.whatsappNumber || "";
  const whatsappTemplate =
    course.whatsappTemplate ||
    settings?.whatsappMessageTemplate ||
    'Salam, mujhe "{course_name}" course ke baare mein maloomat chahiye. Ref: {tracking_id}';
  const buttonLabel = course.ctaButtonLabel || "WhatsApp Par Rabta Karein";

  const ctaProps = {
    courseId: course.id,
    courseName: course.title,
    whatsappNumber,
    whatsappTemplate,
    buttonLabel,
    pixelId: settings?.metaPixelId ?? null,
  };

  const heroChips = pickHeroChips(course.detailFields);
  const priceField = course.detailFields.find((f) => f.isPrice);

  return (
    <>
      <CoursePageTracker courseId={course.id} courseName={course.title} pixelId={settings?.metaPixelId ?? null} />
      <ScrollReveal />
      <SiteHeader settings={settings} />

      <main className="pb-24 sm:pb-12">
        {/* ── HERO ───────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern-arabesque opacity-50" aria-hidden="true" />
          <div className="absolute inset-0 bg-hero-radial" aria-hidden="true" />
          <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-brand/10 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-gold/10 blur-3xl" aria-hidden="true" />

          <div className="relative container-wide pt-10 pb-16 sm:pt-16 sm:pb-20">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-14 items-center">
              {/* Text column */}
              <div>
                <div
                  data-reveal="out"
                  className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white/70 backdrop-blur-sm px-4 py-1.5 text-sm text-gold-deep shadow-soft mb-6"
                >
                  <SparkleIcon className="h-4 w-4 text-gold" />
                  <span>آن لائن لائیو کورس</span>
                </div>

                <h1
                  data-reveal="out"
                  className="display text-3xl sm:text-5xl lg:text-6xl font-normal text-brand-darker mb-5"
                >
                  {course.title}
                </h1>

                {course.subHeadline ? (
                  <p
                    data-reveal="out"
                    className="text-lg sm:text-xl text-slate-700 mb-7 leading-relaxed"
                  >
                    {course.subHeadline}
                  </p>
                ) : null}

                {/* Trust chips: surface duration / format / level inline. */}
                {heroChips.length > 0 ? (
                  <ul data-reveal="out" className="flex flex-wrap gap-2.5 mb-8">
                    {heroChips.map((chip, i) => (
                      <li
                        key={i}
                        className="inline-flex items-center gap-2 rounded-full border border-brand/15 bg-white/80 backdrop-blur-sm px-3.5 py-1.5 text-sm text-slate-700 shadow-soft"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
                        <span className="text-slate-500">{chip.label}:</span>
                        <span className="font-semibold text-brand-darker">{chip.value}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}

                <div data-reveal="out" className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <WhatsAppButton {...ctaProps} placement="hero" size="lg" />
                  {priceField ? (
                    <div className="inline-flex flex-col items-start">
                      <span className="text-xs text-slate-500">{priceField.label}</span>
                      <span className="text-2xl font-bold text-brand-darker leading-tight">
                        {priceField.value}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Image column */}
              <div data-reveal="out" className="relative">
                {/* Decorative gold ring + soft glow behind image */}
                <div
                  className="absolute -inset-3 sm:-inset-5 rounded-[2rem] bg-gradient-to-br from-gold/30 via-transparent to-brand/20 blur-2xl opacity-60"
                  aria-hidden="true"
                />
                <div className="relative aspect-[4/3] sm:aspect-[16/11] rounded-[1.75rem] overflow-hidden bg-emerald-rich shadow-lift ring-1 ring-brand-dark/15">
                  {course.heroImageUrl ? (
                    <>
                      <Image
                        src={course.heroImageUrl}
                        alt={course.title}
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" aria-hidden="true" />
                      {/* Decorative play icon overlay — pure visual, not interactive. */}
                      <div className="absolute right-4 bottom-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-sm font-medium text-brand-dark shadow-lift backdrop-blur-sm">
                        <PlayIcon className="h-3.5 w-3.5" />
                        <span>لائیو کلاسز</span>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-pattern-arabesque text-white/70 text-lg">
                      تصویر دستیاب نہیں
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Decorative ornament between hero and next section */}
          <div className="ornament pb-8" aria-hidden="true">
            <SparkleIcon className="h-3.5 w-3.5 text-gold" />
          </div>
        </section>

        {/* ── FOR YOU ────────────────────────────────────────────────────────── */}
        {course.showForYou && course.forYouPoints.length > 0 ? (
          <section className="container-tight py-10 sm:py-14">
            <h2
              data-reveal="out"
              className="heading-accent text-2xl sm:text-3xl lg:text-4xl font-semibold text-brand-darker mb-8"
            >
              {course.labelForYou}
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2">
              {course.forYouPoints.map((p, i) => (
                <li
                  key={p.id}
                  data-reveal="out"
                  style={{ transitionDelay: `${Math.min(i * 60, 360)}ms` }}
                  className="group flex items-start gap-3.5 rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-200/60 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift hover:ring-brand/20"
                >
                  <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                    <CheckIcon className="h-5 w-5" />
                  </span>
                  <span className="text-base sm:text-lg leading-relaxed text-slate-800">{p.text}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* ── NOT FOR YOU ────────────────────────────────────────────────────── */}
        {course.showNotForYou && course.notForYouPoints.length > 0 ? (
          <section className="container-tight py-6 sm:py-10">
            <h2
              data-reveal="out"
              className="heading-accent text-2xl sm:text-3xl lg:text-4xl font-semibold text-brand-darker mb-8"
            >
              {course.labelNotForYou}
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2">
              {course.notForYouPoints.map((p, i) => (
                <li
                  key={p.id}
                  data-reveal="out"
                  style={{ transitionDelay: `${Math.min(i * 60, 360)}ms` }}
                  className="flex items-start gap-3.5 rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-200/60"
                >
                  <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-rose-200">
                    <XIcon className="h-5 w-5" />
                  </span>
                  <span className="text-base sm:text-lg leading-relaxed text-slate-700">{p.text}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* ── LEARN ─────────────────────────────────────────────────────────── */}
        {course.showLearn && course.learningPoints.length > 0 ? (
          <section className="relative py-12 sm:py-16">
            <div className="absolute inset-0 bg-pattern-dots opacity-50" aria-hidden="true" />
            <div className="relative container-tight">
              <h2
                data-reveal="out"
                className="heading-accent text-2xl sm:text-3xl lg:text-4xl font-semibold text-brand-darker mb-8"
              >
                {course.labelLearn}
              </h2>
              <ul className="grid gap-4 sm:grid-cols-2">
                {course.learningPoints.map((p, i) => (
                  <li
                    key={p.id}
                    data-reveal="out"
                    style={{ transitionDelay: `${Math.min(i * 60, 360)}ms` }}
                    className="group relative flex items-start gap-3.5 rounded-2xl bg-gradient-to-br from-brand/5 to-cream p-5 ring-1 ring-brand/15 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow"
                  >
                    <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl bg-brand text-white shadow-glow">
                      <CheckIcon className="h-5 w-5" />
                    </span>
                    <span className="text-base sm:text-lg leading-relaxed text-slate-800">{p.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        {/* ── DETAILS CARD ──────────────────────────────────────────────────── */}
        {course.showDetails && course.detailFields.length > 0 ? (
          <section className="container-tight py-10 sm:py-14">
            <div
              data-reveal="out"
              className="relative overflow-hidden rounded-[2rem] bg-emerald-rich text-white p-7 sm:p-10 shadow-lift ring-1 ring-brand-darker/20"
            >
              {/* Pattern overlay */}
              <div className="absolute inset-0 bg-pattern-arabesque opacity-30" aria-hidden="true" />
              <div
                className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gold/15 blur-3xl"
                aria-hidden="true"
              />
              <div
                className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-300/10 blur-3xl"
                aria-hidden="true"
              />

              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3.5 py-1 text-xs sm:text-sm text-gold-soft mb-4">
                  <ShieldCheckIcon className="h-4 w-4" />
                  <span>تصدیق شدہ</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-semibold mb-7">{course.labelDetails}</h2>

                <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                  {course.detailFields.map((f) => (
                    <div
                      key={f.id}
                      className={`${f.isPrice ? "sm:col-span-2 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15" : "border-b border-white/10 pb-4"}`}
                    >
                      <dt className="text-white/70 text-xs sm:text-sm uppercase tracking-wide mb-1">
                        {f.label}
                      </dt>
                      <dd
                        className={
                          f.isPrice
                            ? "text-3xl sm:text-5xl font-bold text-shimmer"
                            : "text-lg sm:text-xl font-semibold"
                        }
                      >
                        {f.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            <div className="mt-7 flex justify-center">
              <WhatsAppButton {...ctaProps} placement="after-details" size="lg" />
            </div>
          </section>
        ) : null}

        {/* ── INSTRUCTOR ────────────────────────────────────────────────────── */}
        {course.showInstructor && course.instructor ? (
          <section className="container-tight py-10 sm:py-14">
            <h2
              data-reveal="out"
              className="heading-accent text-2xl sm:text-3xl lg:text-4xl font-semibold text-brand-darker mb-8"
            >
              {course.labelInstructor}
            </h2>
            <div
              data-reveal="out"
              className="relative overflow-hidden rounded-3xl bg-white p-6 sm:p-8 shadow-lift ring-1 ring-slate-200/60"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-gold via-gold-light to-gold" aria-hidden="true" />
              <div className="flex flex-col sm:flex-row gap-7 items-start">
                <div className="relative flex-shrink-0">
                  <div
                    className="absolute -inset-2 rounded-full bg-gradient-to-br from-gold/40 to-brand/30 blur-md opacity-70"
                    aria-hidden="true"
                  />
                  {course.instructor.photoUrl ? (
                    <div className="relative h-32 w-32 sm:h-36 sm:w-36 overflow-hidden rounded-full ring-4 ring-white shadow-lift bg-slate-100">
                      <Image
                        src={course.instructor.photoUrl}
                        alt={course.instructor.name}
                        fill
                        sizes="144px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="relative grid h-32 w-32 sm:h-36 sm:w-36 place-items-center rounded-full bg-emerald-rich text-white text-4xl font-bold ring-4 ring-white shadow-lift">
                      {course.instructor.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-2xl sm:text-3xl font-semibold text-brand-darker mb-3">
                    {course.instructor.name}
                  </h3>
                  <div className="space-y-3 text-slate-700 leading-loose mb-5">
                    {course.instructor.bio.split("\n").filter(Boolean).map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                  {Array.isArray(course.instructor.credibilityPoints) &&
                  course.instructor.credibilityPoints.length > 0 ? (
                    <ul className="grid gap-2.5 sm:grid-cols-2">
                      {(course.instructor.credibilityPoints as string[]).map((cp, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-slate-700">
                          <span className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-md bg-brand/10 text-brand mt-0.5">
                            <CheckIcon className="h-3.5 w-3.5" />
                          </span>
                          <span>{cp}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
        {course.showTestimonials && course.testimonials.length > 0 ? (
          <section className="relative py-12 sm:py-16">
            <div className="absolute inset-0 bg-pattern-dots opacity-40" aria-hidden="true" />
            <div className="relative container-wide">
              <div className="mb-10 text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white/70 backdrop-blur-sm px-3.5 py-1 text-xs text-gold-deep shadow-soft mb-3">
                  <UsersIcon className="h-3.5 w-3.5" />
                  <span>طلباء کی آراء</span>
                </div>
                <h2
                  data-reveal="out"
                  className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-brand-darker"
                >
                  {course.labelTestimonials}
                </h2>
              </div>
              <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {course.testimonials.map((t, i) => (
                  <figure
                    key={t.id}
                    data-reveal="out"
                    style={{ transitionDelay: `${Math.min(i * 80, 480)}ms` }}
                    className="group relative flex flex-col rounded-3xl bg-white p-6 sm:p-7 shadow-soft ring-1 ring-slate-200/60 transition-all duration-200 hover:-translate-y-1 hover:shadow-lift hover:ring-brand/15"
                  >
                    <QuoteIcon className="absolute right-5 top-5 h-9 w-9 text-gold/25" />
                    {t.rating ? (
                      <div className="mb-3 flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <StarIcon
                            key={idx}
                            className={`h-4 w-4 ${idx < (t.rating ?? 0) ? "text-gold" : "text-slate-300"}`}
                          />
                        ))}
                      </div>
                    ) : null}
                    <blockquote className="flex-1 text-slate-700 leading-loose mb-5">
                      {t.text}
                    </blockquote>
                    <figcaption className="flex items-center gap-3 border-t border-slate-100 pt-4">
                      {t.photoUrl ? (
                        <div className="relative h-11 w-11 overflow-hidden rounded-full ring-2 ring-cream-dark bg-slate-100">
                          <Image src={t.photoUrl} alt={t.name} fill sizes="44px" className="object-cover" />
                        </div>
                      ) : (
                        <div className="grid h-11 w-11 place-items-center rounded-full bg-emerald-rich text-white font-bold ring-2 ring-cream-dark">
                          {t.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-brand-darker truncate">{t.name}</div>
                      </div>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* ── FAQS ──────────────────────────────────────────────────────────── */}
        {course.showFaqs && course.faqs.length > 0 ? (
          <section className="container-tight py-10 sm:py-14">
            <div className="mb-8 text-center sm:text-right">
              <h2
                data-reveal="out"
                className="heading-accent text-2xl sm:text-3xl lg:text-4xl font-semibold text-brand-darker"
              >
                {course.labelFaqs}
              </h2>
            </div>
            <div data-reveal="out">
              <FaqAccordion items={course.faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer }))} />
            </div>
          </section>
        ) : null}

        {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
        <section className="container-tight py-12 sm:py-16">
          <div
            data-reveal="out"
            className="relative overflow-hidden rounded-[2rem] bg-cta-rich text-white p-9 sm:p-14 text-center shadow-lift ring-1 ring-brand-darker/30"
          >
            <div className="absolute inset-0 bg-pattern-arabesque opacity-25" aria-hidden="true" />
            <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gold/10 blur-3xl" aria-hidden="true" />
            <div className="absolute -bottom-32 -right-20 h-72 w-72 rounded-full bg-emerald-300/10 blur-3xl" aria-hidden="true" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/5 px-4 py-1.5 text-xs sm:text-sm text-gold-soft mb-5">
                <SparkleIcon className="h-4 w-4" />
                <span>محدود نشستیں</span>
              </div>
              <h2 className="display text-3xl sm:text-5xl font-normal mb-4 leading-tight">
                {course.ctaHeading || course.labelFinalCta}
              </h2>
              {course.ctaSubtext ? (
                <p className="mx-auto max-w-2xl text-lg sm:text-xl text-emerald-50/90 mb-8 leading-relaxed">
                  {course.ctaSubtext}
                </p>
              ) : null}
              <div className="flex justify-center">
                <WhatsAppButton {...ctaProps} placement="final" size="lg" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter settings={settings} />
      <StickyMobileCTA {...ctaProps} />
    </>
  );
}
