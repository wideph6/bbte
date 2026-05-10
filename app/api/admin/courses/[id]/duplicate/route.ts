import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const c = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      forYouPoints: true,
      notForYouPoints: true,
      learningPoints: true,
      detailFields: true,
      testimonials: true,
      faqs: true,
    },
  });
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let baseSlug = `${c.slug}-copy`;
  let unique = baseSlug;
  let i = 2;
  while (await prisma.course.findUnique({ where: { slug: unique } })) {
    unique = `${baseSlug}-${i++}`;
  }

  const created = await prisma.course.create({
    data: {
      slug: unique,
      title: `${c.title} (copy)`,
      subHeadline: c.subHeadline,
      heroImageUrl: c.heroImageUrl,
      status: "draft",
      seoTitle: c.seoTitle,
      seoDescription: c.seoDescription,
      ogImageUrl: c.ogImageUrl,
      labelForYou: c.labelForYou,
      labelNotForYou: c.labelNotForYou,
      labelLearn: c.labelLearn,
      labelDetails: c.labelDetails,
      labelInstructor: c.labelInstructor,
      labelTestimonials: c.labelTestimonials,
      labelFaqs: c.labelFaqs,
      labelFinalCta: c.labelFinalCta,
      showForYou: c.showForYou,
      showNotForYou: c.showNotForYou,
      showLearn: c.showLearn,
      showDetails: c.showDetails,
      showInstructor: c.showInstructor,
      showTestimonials: c.showTestimonials,
      showFaqs: c.showFaqs,
      whatsappNumber: c.whatsappNumber,
      whatsappTemplate: c.whatsappTemplate,
      ctaHeading: c.ctaHeading,
      ctaSubtext: c.ctaSubtext,
      ctaButtonLabel: c.ctaButtonLabel,
      instructorId: c.instructorId,
      forYouPoints: { create: c.forYouPoints.map(({ id, courseId, ...rest }) => rest) },
      notForYouPoints: { create: c.notForYouPoints.map(({ id, courseId, ...rest }) => rest) },
      learningPoints: { create: c.learningPoints.map(({ id, courseId, ...rest }) => rest) },
      detailFields: { create: c.detailFields.map(({ id, courseId, ...rest }) => rest) },
      testimonials: { create: c.testimonials.map(({ id, courseId, ...rest }) => rest) },
      faqs: { create: c.faqs.map(({ id, courseId, ...rest }) => rest) },
    },
  });
  return NextResponse.json(created);
}
