import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { bustCourse, bustHome } from "@/lib/revalidate";

const schema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  subHeadline: z.string().nullable().optional(),
  heroImageUrl: z.string().url().nullable().optional(),
  status: z.enum(["draft", "active"]).optional(),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  ogImageUrl: z.string().url().nullable().optional(),
  labelForYou: z.string().optional(),
  labelNotForYou: z.string().optional(),
  labelLearn: z.string().optional(),
  labelDetails: z.string().optional(),
  labelInstructor: z.string().optional(),
  labelTestimonials: z.string().optional(),
  labelFaqs: z.string().optional(),
  labelFinalCta: z.string().optional(),
  showForYou: z.boolean().optional(),
  showNotForYou: z.boolean().optional(),
  showLearn: z.boolean().optional(),
  showDetails: z.boolean().optional(),
  showInstructor: z.boolean().optional(),
  showTestimonials: z.boolean().optional(),
  showFaqs: z.boolean().optional(),
  whatsappNumber: z.string().nullable().optional(),
  whatsappTemplate: z.string().nullable().optional(),
  ctaHeading: z.string().nullable().optional(),
  ctaSubtext: z.string().nullable().optional(),
  ctaButtonLabel: z.string().optional(),
  instructorId: z.string().nullable().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid" }, { status: 400 });
  }
  const data: Record<string, unknown> = { ...parsed.data };
  if (typeof data.slug === "string") {
    data.slug = slugify(data.slug as string);
    if (!data.slug) return NextResponse.json({ error: "Bad slug" }, { status: 400 });
    const existing = await prisma.course.findUnique({ where: { slug: data.slug as string } });
    if (existing && existing.id !== params.id) {
      return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
    }
  }
  const updated = await prisma.course.update({ where: { id: params.id }, data });
  bustCourse(updated.slug);
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const removed = await prisma.course.delete({ where: { id: params.id } });
  bustCourse(removed.slug);
  bustHome();
  return NextResponse.json({ ok: true });
}
