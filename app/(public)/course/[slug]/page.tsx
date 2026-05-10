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
} from "@/components/public/icons";
import { FaqAccordion } from "@/components/public/faq-accordion";
import { ScrollReveal } from "@/components/public/scroll-reveal";

interface PageProps {
  params: { slug: string };
}

/* ── Urdu label fallbacks ─────────────────────────────────────────────────
   DB defaults were created as Roman-Urdu transliterations. If a label still
   contains Latin characters it hasn't been translated in the admin panel;
   we fall back to proper Urdu script so the live page always reads correctly.
   ────────────────────────────────────────────────────────────────────── */
const URDU_LABEL_DEFAULTS: Record<string, string> = {
  labelForYou:       "یہ کورس آپ کے لیے ہے اگر...",
  labelNotForYou:    "یہ کورس آپ کے لیے نہیں ہے اگر...",
  labelLearn:        "آپ کیا سیکھیں گے",
  labelDetails:      "کورس کی تفصیلات",
  labelInstructor:   "آپ کے استاد",
  labelTestimonials: "طلباء کے تاثرات",
  labelFaqs:         "اکثر پوچھے جانے والے سوالات",
  labelFinalCta:     "ابھی اپنی جگہ محفوظ کریں",
};

function ensureUrdu(value: string, key: string): string {
  if (/[a-zA-Z]/.test(value)) return URDU_LABEL_DEFAULTS[key] ?? value;
  return value;
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
  if (!course) return { title: "کورس دستیاب نہیں" };
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
    'السلام علیکم، مجھے "{course_name}" کورس کے بارے میں مزید معلومات درکار ہیں۔ ریفرنس: {tracking_id}';
  const buttonLabel = course.ctaButtonLabel || "واٹس ایپ پر رابطہ کریں";

  const ctaProps = {
    courseId: course.id,
    courseName: course.title,
    whatsappNumber,
    whatsappTemplate,
    buttonLabel,
    pixelId: settings?.metaPixelId ?? null,
  };

  // Surface price + duration in the hero as big inline label/value pairs.
  // We keep order: price first (as the user requested), then any
  // "duration"-shaped detail field. Detection is heuristic so the admin
  // can keep the field labels in Urdu without us hardcoding them.
  const priceField = course.detailFields.find((f) => f.isPrice) ?? null;
  const durationField = course.detailFields.find((f) => {
    if (f.isPrice) return false;
    const label = f.label.toLowerCase();
    return /muddat|duration|مدت|مُدّت|مدّت|عرصہ|مدت /.test(f.label) || /muddat|duration/.test(label);
  });
  const heroHighlights = course.detailFields
    .filter((f) => !f.isPrice && f.id !== durationField?.id)
    .filter((f) => f.value?.trim?.() !== "")
    .slice(0, 3);

  return (
    <>
      <CoursePageTracker courseId={course.id} courseName={course.title} pixelId={settings?.metaPixelId ?? null} />
      <ScrollReveal />
      <SiteHeader settings={settings} />

      <main className="pb-24 sm:pb-12">
        {/* ── HERO ────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          {/* Layered backgrounds — pattern, radial wash, drifting orbs. */}
          <div className="absolute inset-0 bg-pattern-arabesque opacity-50" aria-hidden="true" />
          <div className="absolute inset-0 bg-hero-radial" aria-hidden="true" />
          <div className="absolute -top-40 -right-32 h-96 w-96 rounded-full bg-brand/15 blur-3xl animate-drift-a" aria-hidden="true" />
          <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-gold/15 blur-3xl animate-drift-b" aria-hidden="true" />

          <div className="relative container-wide pt-12 pb-14 sm:pt-20 sm:pb-20">
            <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
              <div className="space-y-6 sm:space-y-8">
                {/* Verified badge */}
                <div
                  data-reveal="out"
                  className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-white/80 px-4 py-1.5 text-xs sm:text-sm font-medium text-brand-dark shadow-soft backdrop-blur-sm"
                >
                  <ShieldCheckIcon className="h-4 w-4 text-gold flex-shrink-0" />
                  <span>{ensureUrdu(course.labelDetails, "labelDetails")}</span>
                </div>

                {/* Title — solid emerald colour (no background-clip:text on
                    Nastaliq; clip mask drops dots/diacritics in many renderers). */}
                <h1
                  data-reveal="out"
                  className="display text-4xl sm:text-5xl lg:text-6xl font-normal leading-tight text-brand-darker"
                >
                  {course.title}
                </h1>

                {/* Subhead */}
                {course.subHeadline ? (
                  <p
                    data-reveal="out"
                    className="max-w-2xl text-lg sm:text-xl text-slate-700 leading-loose"
                  >
                    {course.subHeadline}
                  </p>
                ) : null}

                {/* Price / duration highlights */}
                {(priceField || durationField) ? (
                  <div data-reveal="out" className="grid gap-3 sm:grid-cols-2">
                    {priceField ? (
                      <PriceLine label={priceField.label} value={priceField.value} accent="gold" />
                    ) : null}
                    {durationField ? (
                      <PriceLine label={durationField.label} value={durationField.value} accent="brand" />
                    ) : null}
                  </div>
                ) : null}

                {/* Extra detail highlights */}
                {heroHighlights.length > 0 ? (
                  <div data-reveal="out" className="grid gap-3 sm:grid-cols-2">
                    {heroHighlights.map((f, i) => (
                      <div
                        key={f.id}
                        style={{ transitionDelay: `${Math.min(i * 60, 240)}ms` }}
                        className="rounded-2xl bg-white/80 px-4 py-3.5 shadow-soft ring-1 ring-brand/10 backdrop-blur-sm"
                      >
                        <div className="text-sm text-slate-500">{f.label}</div>
                        <div className="text-lg sm:text-xl font-semibold text-brand-darker">{f.value}</div>
                      </div>
                    ))}
                  </div>
                ) : null}

                {/* Trust chips — recognition badges */}
                <div data-reveal="out" className="flex flex-wrap justify-end gap-2">
                  {[
                    "سعودی انجینئرنگ کونسل سے منظور",
                    "یو اے ای منسٹری آف ایجوکیشن سے تسلیم شدہ",
                    "آن لائن رزلٹ",
                  ].map((badge) => (
                    <span
                      key={badge}
                      className="inline-flex items-center gap-1.5 rounded-full bg-brand-tint px-3 py-1 text-xs font-medium text-brand-dark ring-1 ring-brand/20"
                    >
                      <CheckIcon className="h-3.5 w-3.5 flex-shrink-0" />
                      {badge}
                    </span>
                  ))}
                </div>

                {/* WhatsApp CTA */}
                <div data-reveal="out">
                  <WhatsAppButton {...ctaProps} placement="hero" size="lg" />
                </div>
              </div>

              {/* Image — fixed-aspect box, scrollable inside (image scrolls
                  vertically so the visitor can see it in full without the
                  outer card growing). */}
              <div data-reveal="out" className="w-full max-w-3xl justify-self-center lg:justify-self-start">
                <div className="relative">
                  {/* Glow halo behind the frame */}
                  <div
                    className="absolute -inset-4 sm:-inset-6 rounded-[2.5rem] bg-gradient-to-br from-gold/35 via-transparent to-brand/30 blur-2xl opacity-70"
                    aria-hidden="true"
                  />
                  {/* Frame */}
                  <div className="relative aspect-[4/3] sm:aspect-[16/11] overflow-y-auto scrollbar-hide rounded-[2rem] bg-emerald-rich shadow-lift ring-1 ring-brand-dark/15">
                    {course.heroImageUrl ? (
                      <>
                        {/* Plain <img> + h-auto so the image renders at its
                            natural aspect inside the fixed-height frame.
                            If the image is taller than the frame, the
                            container scrolls vertically. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={course.heroImageUrl}
                          alt={course.title}
                          className="block w-full h-auto"
                          loading="eager"
                        />
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-pattern-arabesque text-white/70 text-lg">
                        تصویر دستیاب نہیں
                      </div>
                    )}
                  </div>
                  {/* Scroll hint chevron + bottom fade — only meaningful
                      when the image is taller than the frame. We always
                      render it because there's no cheap way to detect
                      overflow at SSR time, and it's harmless either way. */}
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-12 rounded-b-[2rem] bg-gradient-to-t from-black/40 to-transparent"
                    aria-hidden="true"
                  />
                  <div
                    className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 grid h-8 w-8 place-items-center rounded-full bg-white/85 text-brand-dark shadow-lift backdrop-blur-sm animate-scroll-hint"
                    aria-hidden="true"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Divider />
        </section>

        {/* ── FOR YOU ─────────────────────────────────────────────────── */}
        {course.showForYou && course.forYouPoints.length > 0 ? (
          <BulletGroupSection
            heading={ensureUrdu(course.labelForYou, "labelForYou")}
            items={course.forYouPoints}
            tone="emerald"
            renderIcon={() => <CheckIcon className="h-6 w-6" />}
          />
        ) : null}

        {/* ── NOT FOR YOU ─────────────────────────────────────────────── */}
        {course.showNotForYou && course.notForYouPoints.length > 0 ? (
          <BulletGroupSection
            heading={ensureUrdu(course.labelNotForYou, "labelNotForYou")}
            items={course.notForYouPoints}
            tone="rose"
            renderIcon={() => <XIcon className="h-6 w-6" />}
          />
        ) : null}

        {/* ── LEARN ───────────────────────────────────────────────────── */}
        {course.showLearn && course.learningPoints.length > 0 ? (
          <section className="relative py-14 sm:py-20">
            <div className="absolute inset-0 bg-pattern-dots opacity-40" aria-hidden="true" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-gold/40 to-transparent" aria-hidden="true" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-l from-transparent via-gold/20 to-transparent" aria-hidden="true" />

            <div className="relative container-tight">
              <SectionHeading text={ensureUrdu(course.labelLearn, "labelLearn")} />
              <ul className="mt-10 grid gap-5 sm:gap-6 sm:grid-cols-2">
                {course.learningPoints.map((p, i) => (
                  <li
                    key={p.id}
                    data-reveal="out"
                    style={{ transitionDelay: `${Math.min(i * 60, 360)}ms` }}
                    className="group relative flex flex-col gap-5 overflow-hidden rounded-3xl bg-white p-7 text-right shadow-soft ring-1 ring-brand/12 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow hover:ring-brand/30"
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-dark via-brand to-brand-light" aria-hidden="true" />
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-rich text-white shadow-glow ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-110">
                      <CheckIcon className="h-7 w-7" />
                    </span>
                    <p className="w-full text-base sm:text-lg leading-loose text-slate-800">{p.text}</p>
                    <span className="pointer-events-none absolute left-3 bottom-2 text-6xl font-black opacity-[0.04] text-brand select-none" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        {/* ── DETAILS CARD ────────────────────────────────────────────── */}
        {course.showDetails && course.detailFields.length > 0 ? (
          <section className="container-tight py-12 sm:py-16">
            <div
              data-reveal="out"
              className="relative overflow-hidden rounded-[2rem] bg-emerald-rich p-8 sm:p-12 text-white shadow-lift ring-1 ring-brand-darker/20"
            >
              <div className="absolute inset-0 bg-pattern-arabesque opacity-30" aria-hidden="true" />
              <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gold/20 blur-3xl animate-drift-a" aria-hidden="true" />
              <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-300/15 blur-3xl animate-drift-b" aria-hidden="true" />
              {/* Gold top accent */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-gold/40 via-gold to-gold/40" aria-hidden="true" />

              <div className="relative flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/10 px-3.5 py-1 text-xs sm:text-sm font-medium text-gold-soft mb-5">
                  <ShieldCheckIcon className="h-4 w-4" />
                  <span>تصدیق شدہ</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-semibold mb-2">{ensureUrdu(course.labelDetails, "labelDetails")}</h2>
                <div className="ornament my-6 sm:my-8" aria-hidden="true">
                  <SparkleIcon className="h-3.5 w-3.5 text-gold-light" />
                </div>

                <dl className="grid w-full gap-y-5 sm:gap-y-6 sm:grid-cols-2 sm:gap-x-10">
                  {course.detailFields.map((f) => (
                    <div
                      key={f.id}
                      className={`flex flex-col items-center gap-2 ${
                        f.isPrice ? "sm:col-span-2 rounded-2xl bg-white/8 ring-1 ring-white/15 px-5 py-5 sm:py-6" : "rounded-xl bg-white/5 px-4 py-4"
                      }`}
                    >
                      <dt className="text-white/65 text-sm sm:text-base">
                        {f.label}
                      </dt>
                      <dd
                        className={
                          f.isPrice
                            ? "text-3xl sm:text-5xl font-bold text-gold-soft"
                            : "text-xl sm:text-2xl font-semibold text-white"
                        }
                      >
                        {f.value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-10">
                  <WhatsAppButton {...ctaProps} placement="after-details" size="lg" />
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {/* ── INSTRUCTOR ──────────────────────────────────────────────── */}
        {course.showInstructor && course.instructor ? (
          <section className="container-tight py-12 sm:py-16">
            <SectionHeading text={ensureUrdu(course.labelInstructor, "labelInstructor")} />

            <div
              data-reveal="out"
              className="relative mt-10 overflow-hidden rounded-3xl bg-white p-7 sm:p-10 shadow-lift ring-1 ring-slate-200/60"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-gold via-gold-light to-gold" aria-hidden="true" />
              <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-gold/10 blur-3xl" aria-hidden="true" />
              <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-brand/10 blur-3xl" aria-hidden="true" />

              <div className="relative flex flex-col items-center gap-6">
                {/* Photo */}
                <div className="relative">
                  <div
                    className="absolute -inset-2 rounded-full bg-gradient-to-br from-gold/40 to-brand/30 blur-md opacity-70"
                    aria-hidden="true"
                  />
                  {course.instructor.photoUrl ? (
                    <div className="relative h-36 w-36 sm:h-44 sm:w-44 overflow-hidden rounded-full ring-4 ring-white shadow-lift bg-slate-100">
                      <Image
                        src={course.instructor.photoUrl}
                        alt={course.instructor.name}
                        fill
                        sizes="176px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="relative grid h-36 w-36 sm:h-44 sm:w-44 place-items-center rounded-full bg-emerald-rich text-white text-5xl font-bold ring-4 ring-white shadow-lift">
                      {course.instructor.name.charAt(0)}
                    </div>
                  )}
                </div>

                <h3 className="text-2xl sm:text-3xl font-semibold text-brand-darker">
                  {course.instructor.name}
                </h3>

                {/* Bio */}
                <div className="mx-auto max-w-2xl space-y-3 text-slate-700 leading-loose">
                  {course.instructor.bio.split("\n").filter(Boolean).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>

                {/* Credibility points */}
                {Array.isArray(course.instructor.credibilityPoints) &&
                course.instructor.credibilityPoints.length > 0 ? (
                  <ul className="mx-auto grid max-w-2xl w-full gap-3 sm:grid-cols-2 mt-2">
                    {(course.instructor.credibilityPoints as string[]).map((cp, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-center gap-2.5 rounded-2xl bg-cream-dark/40 px-4 py-3 text-slate-700 ring-1 ring-brand/10"
                      >
                        <span className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-md bg-brand/15 text-brand">
                          <CheckIcon className="h-4 w-4" />
                        </span>
                        <span className="text-sm sm:text-base">{cp}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        {/* ── TESTIMONIALS ────────────────────────────────────────────── */}
        {course.showTestimonials && course.testimonials.length > 0 ? (
          <section className="relative py-14 sm:py-20">
            <div className="absolute inset-0 bg-pattern-dots opacity-40" aria-hidden="true" />

            <div className="relative container-wide">
              <SectionHeading text={ensureUrdu(course.labelTestimonials, "labelTestimonials")} />

              <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {course.testimonials.map((t, i) => (
                  <figure
                    key={t.id}
                    data-reveal="out"
                    style={{ transitionDelay: `${Math.min(i * 80, 480)}ms` }}
                    className="group relative flex flex-col items-center text-center rounded-3xl bg-white px-6 pt-10 pb-7 shadow-soft ring-1 ring-slate-200/60 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift hover:ring-brand/15"
                  >
                    {/* Quote mark on top, centered */}
                    <span
                      className="absolute -top-5 left-1/2 -translate-x-1/2 grid h-10 w-10 place-items-center rounded-full bg-emerald-rich text-gold-soft shadow-glow ring-4 ring-cream"
                    >
                      <QuoteIcon className="h-5 w-5" />
                    </span>

                    {t.rating ? (
                      <div className="mb-4 flex justify-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <StarIcon
                            key={idx}
                            className={`h-4 w-4 ${idx < (t.rating ?? 0) ? "text-gold" : "text-slate-300"}`}
                          />
                        ))}
                      </div>
                    ) : null}

                    <blockquote className="flex-1 text-slate-700 leading-loose mb-6">
                      {t.text}
                    </blockquote>

                    <figcaption className="flex flex-col items-center gap-2 border-t border-slate-100 pt-5 w-full">
                      {t.photoUrl ? (
                        <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-cream-dark bg-slate-100">
                          <Image src={t.photoUrl} alt={t.name} fill sizes="48px" className="object-cover" />
                        </div>
                      ) : (
                        <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-rich text-white font-bold ring-2 ring-cream-dark">
                          {t.name.charAt(0)}
                        </div>
                      )}
                      <div className="font-semibold text-brand-darker">{t.name}</div>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* ── FAQS ────────────────────────────────────────────────────── */}
        {course.showFaqs && course.faqs.length > 0 ? (
          <section className="container-tight py-12 sm:py-16">
            <SectionHeading text={ensureUrdu(course.labelFaqs, "labelFaqs")} />
            <div data-reveal="out" className="mt-10">
              <FaqAccordion items={course.faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer }))} />
            </div>
          </section>
        ) : null}

        {/* ── FINAL CTA ───────────────────────────────────────────────── */}
        <section className="container-tight py-14 sm:py-20">
          <div
            data-reveal="out"
            className="relative overflow-hidden rounded-[2rem] bg-cta-rich p-10 sm:p-16 text-center text-white shadow-lift ring-1 ring-brand-darker/30"
          >
            <div className="absolute inset-0 bg-pattern-arabesque opacity-25" aria-hidden="true" />
            <div className="absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-gold/15 blur-3xl animate-drift-a" aria-hidden="true" />
            <div className="absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-emerald-300/15 blur-3xl animate-drift-b" aria-hidden="true" />
            {/* Top gold accent line */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-gold/40 via-gold to-gold/40" aria-hidden="true" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/10 px-4 py-1.5 text-xs sm:text-sm font-medium text-gold-soft mb-6">
                <SparkleIcon className="h-4 w-4" />
                <span>محدود نشستیں — ابھی اپنی جگہ بک کریں</span>
              </div>
              <h2 className="display text-3xl sm:text-5xl font-normal mb-4 leading-tight">
                {course.ctaHeading || ensureUrdu(course.labelFinalCta, "labelFinalCta")}
              </h2>
              {course.ctaSubtext ? (
                <p className="mx-auto max-w-2xl text-lg sm:text-xl text-emerald-50/90 mb-8 leading-loose">
                  {course.ctaSubtext}
                </p>
              ) : null}
              <div className="ornament mb-8" aria-hidden="true">
                <SparkleIcon className="h-3.5 w-3.5 text-gold-light" />
              </div>
              <div className="flex flex-col items-center gap-4">
                <WhatsAppButton {...ctaProps} placement="final" size="lg" />
                <p className="text-xs text-white/50">درج سوالات بلکل مفت ہیں — کوئی لازمی نہیں</p>
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

/* ─────────────────────────────────────────────────────────────────────────
   Helper components — kept inline to keep the route file self-contained.
   ───────────────────────────────────────────────────────────────────── */

/** Hero stat card used for price / duration. */
function PriceLine({ label, value, accent }: { label: string; value: string; accent: "gold" | "brand" }) {
  const isGold = accent === "gold";
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-px shadow-soft ${
        isGold
          ? "bg-gradient-to-br from-gold to-gold/40"
          : "bg-gradient-to-br from-brand to-brand/40"
      }`}
    >
      <div className="rounded-[calc(1rem-1px)] bg-white/95 px-5 py-4 backdrop-blur-sm">
        <div className={`text-sm font-medium ${isGold ? "text-gold-deep" : "text-brand"}`}>{label}</div>
        <div className={`text-2xl sm:text-3xl font-bold ${isGold ? "text-brand-darker" : "text-brand-dark"}`}>{value}</div>
      </div>
    </div>
  );
}

/** Centered section heading with decorative gold ornament — world-class feel. */
function SectionHeading({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center text-center" data-reveal="out">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-brand-darker leading-snug">
        {text}
      </h2>
      <div className="mt-4 flex items-center gap-2" aria-hidden="true">
        <span className="h-px w-8 rounded-full bg-gold/40" />
        <span className="h-2 w-2 rounded-full bg-gold" />
        <span className="h-[3px] w-20 rounded-full bg-gradient-to-l from-gold/40 via-gold to-gold/40" />
        <span className="h-2 w-2 rounded-full bg-gold" />
        <span className="h-px w-8 rounded-full bg-gold/40" />
      </div>
    </div>
  );
}

/** Decorative divider used between hero and the first section. */
function Divider() {
  return (
    <div className="relative py-6">
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-l from-transparent via-gold/30 to-transparent" aria-hidden="true" />
      <div className="ornament" aria-hidden="true">
        <SparkleIcon className="h-4 w-4 text-gold" />
      </div>
    </div>
  );
}

/**
 * Generic right-aligned card section used for the For-You / Not-For-You
 * bullet lists. Cards have a coloured top-accent bar, a ghost number, and
 * the icon sits in its own coloured box. Full RTL-friendly layout.
 */
function BulletGroupSection({
  heading,
  items,
  tone,
  renderIcon,
}: {
  heading: string;
  items: { id: string; text: string }[];
  tone: "emerald" | "rose";
  renderIcon: () => React.ReactNode;
}) {
  const isEmerald = tone === "emerald";
  const sectionBg = isEmerald
    ? "bg-gradient-to-b from-brand-tint/70 to-transparent"
    : "bg-gradient-to-b from-rose-50/70 to-transparent";
  const iconBg = isEmerald
    ? "bg-emerald-rich text-white shadow-glow"
    : "bg-rose-600 text-white shadow-lift";
  const topBar = isEmerald
    ? "from-brand-dark via-brand to-brand-light"
    : "from-rose-700 via-rose-500 to-rose-400";
  const cardHover = isEmerald
    ? "hover:ring-brand/25 hover:shadow-glow"
    : "hover:ring-rose-300/60 hover:shadow-lift";
  const ghostColor = isEmerald ? "text-brand" : "text-rose-500";

  return (
    <section className={`relative py-14 sm:py-20 ${sectionBg}`}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-gold/25 to-transparent" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-l from-transparent via-gold/20 to-transparent" aria-hidden="true" />

      <div className="relative container-tight">
        <SectionHeading text={heading} />
        <ul className="mt-10 grid gap-5 sm:gap-6 sm:grid-cols-2">
          {items.map((p, i) => (
            <li
              key={p.id}
              data-reveal="out"
              style={{ transitionDelay: `${Math.min(i * 70, 420)}ms` }}
              className={`group relative flex flex-col gap-5 overflow-hidden rounded-3xl bg-white p-7 text-right shadow-soft ring-1 ring-slate-200/60 transition-all duration-300 hover:-translate-y-1.5 ${cardHover}`}
            >
              {/* Coloured accent bar at the top */}
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${topBar}`} aria-hidden="true" />

              {/* Icon box */}
              <span
                className={`grid h-14 w-14 flex-shrink-0 place-items-center rounded-2xl ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-110 ${iconBg}`}
              >
                {renderIcon()}
              </span>

              <p className="w-full text-base sm:text-lg leading-loose text-slate-800">{p.text}</p>

              {/* Ghost number — decorative */}
              <span
                className={`pointer-events-none absolute left-3 bottom-2 text-6xl font-black opacity-[0.05] select-none ${ghostColor}`}
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
