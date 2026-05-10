import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { WhatsAppButton } from "@/components/public/whatsapp-button";
import { StickyMobileCTA } from "@/components/public/sticky-mobile-cta";
import { CoursePageTracker } from "@/components/public/course-page-tracker";
import { CheckIcon, XIcon, StarIcon } from "@/components/public/icons";
import { FaqAccordion } from "@/components/public/faq-accordion";

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

  return (
    <>
      <CoursePageTracker courseId={course.id} courseName={course.title} pixelId={settings?.metaPixelId ?? null} />
      <SiteHeader settings={settings} />
      <main className="pb-24 sm:pb-10">
        {/* HERO */}
        <section className="container-wide pt-8 sm:pt-12">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div>
              <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-4">{course.title}</h1>
              {course.subHeadline ? (
                <p className="text-lg sm:text-xl text-slate-700 mb-6">{course.subHeadline}</p>
              ) : null}
              <WhatsAppButton {...ctaProps} placement="hero" size="lg" />
            </div>
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 shadow-lg">
              {course.heroImageUrl ? (
                <Image
                  src={course.heroImageUrl}
                  alt={course.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-lg">
                  تصویر دستیاب نہیں
                </div>
              )}
            </div>
          </div>
        </section>

        {/* FOR YOU */}
        {course.showForYou && course.forYouPoints.length > 0 ? (
          <section className="container-narrow py-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">{course.labelForYou}</h2>
            <ul className="space-y-3">
              {course.forYouPoints.map((p) => (
                <li key={p.id} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-slate-200">
                  <CheckIcon className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                  <span className="text-lg">{p.text}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* NOT FOR YOU */}
        {course.showNotForYou && course.notForYouPoints.length > 0 ? (
          <section className="container-narrow py-6">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">{course.labelNotForYou}</h2>
            <ul className="space-y-3">
              {course.notForYouPoints.map((p) => (
                <li key={p.id} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-slate-200">
                  <XIcon className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                  <span className="text-lg">{p.text}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* LEARN */}
        {course.showLearn && course.learningPoints.length > 0 ? (
          <section className="container-narrow py-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">{course.labelLearn}</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {course.learningPoints.map((p) => (
                <li key={p.id} className="flex items-start gap-3 bg-brand/5 rounded-xl p-4">
                  <CheckIcon className="w-5 h-5 text-brand flex-shrink-0 mt-1.5" />
                  <span>{p.text}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* DETAILS */}
        {course.showDetails && course.detailFields.length > 0 ? (
          <section className="container-narrow py-6">
            <div className="rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-white p-6 sm:p-8 shadow-xl">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6">{course.labelDetails}</h2>
              <dl className="grid gap-4 sm:grid-cols-2">
                {course.detailFields.map((f) => (
                  <div key={f.id} className={f.isPrice ? "sm:col-span-2" : ""}>
                    <dt className="text-white/70 text-sm mb-1">{f.label}</dt>
                    <dd className={f.isPrice ? "text-3xl sm:text-4xl font-bold" : "text-lg font-medium"}>
                      {f.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="mt-6 flex justify-center">
              <WhatsAppButton {...ctaProps} placement="after-details" size="lg" />
            </div>
          </section>
        ) : null}

        {/* INSTRUCTOR */}
        {course.showInstructor && course.instructor ? (
          <section className="container-narrow py-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">{course.labelInstructor}</h2>
            <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                {course.instructor.photoUrl ? (
                  <div className="relative w-32 h-32 rounded-full overflow-hidden flex-shrink-0 bg-slate-100">
                    <Image
                      src={course.instructor.photoUrl}
                      alt={course.instructor.name}
                      fill
                      sizes="128px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-brand/10 flex items-center justify-center text-3xl font-bold text-brand flex-shrink-0">
                    {course.instructor.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">{course.instructor.name}</h3>
                  <div className="prose-urdu space-y-3 text-slate-700 mb-4">
                    {course.instructor.bio.split("\n").filter(Boolean).map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                  {Array.isArray(course.instructor.credibilityPoints) &&
                    course.instructor.credibilityPoints.length > 0 ? (
                    <ul className="space-y-2">
                      {(course.instructor.credibilityPoints as string[]).map((cp, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckIcon className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-1" />
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

        {/* TESTIMONIALS */}
        {course.showTestimonials && course.testimonials.length > 0 ? (
          <section className="container-wide py-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">{course.labelTestimonials}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {course.testimonials.map((t) => (
                <div key={t.id} className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    {t.photoUrl ? (
                      <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-100">
                        <Image src={t.photoUrl} alt={t.name} fill sizes="48px" className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center font-bold text-brand">
                        {t.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold">{t.name}</div>
                      {t.rating ? (
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`w-4 h-4 ${i < (t.rating ?? 0) ? "text-amber-400" : "text-slate-300"}`}
                            />
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <p className="text-slate-700">{t.text}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* FAQS */}
        {course.showFaqs && course.faqs.length > 0 ? (
          <section className="container-narrow py-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">{course.labelFaqs}</h2>
            <FaqAccordion items={course.faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer }))} />
          </section>
        ) : null}

        {/* FINAL CTA */}
        <section className="container-narrow py-16">
          <div className="rounded-2xl bg-slate-900 text-white p-8 sm:p-12 text-center shadow-xl">
            <h2 className="text-2xl sm:text-4xl font-bold mb-3">
              {course.ctaHeading || course.labelFinalCta}
            </h2>
            {course.ctaSubtext ? <p className="text-slate-300 text-lg mb-6">{course.ctaSubtext}</p> : null}
            <div className="flex justify-center">
              <WhatsAppButton {...ctaProps} placement="final" size="lg" />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter settings={settings} />
      <StickyMobileCTA {...ctaProps} />
    </>
  );
}
