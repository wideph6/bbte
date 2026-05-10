import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SECTIONS, isSection } from "@/lib/course-sections";
import { bustCourse } from "@/lib/revalidate";

export async function POST(req: NextRequest, { params }: { params: { id: string; section: string } }) {
  const { id, section } = params;
  if (!isSection(section)) return NextResponse.json({ error: "Unknown section" }, { status: 404 });
  const def = SECTIONS[section];
  const body = await req.json().catch(() => null);
  const parsed = def.createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid" }, { status: 400 });
  }

  // Compute next order to append.
  const countQuery = (prisma as any)[delegateMethod(section)];
  const count = await countQuery.count({ where: { courseId: id } });

  const created = await def.delegate().create({
    data: { ...parsed.data, courseId: id, order: count },
  });
  const course = await prisma.course.findUnique({ where: { id }, select: { slug: true } });
  bustCourse(course?.slug);
  return NextResponse.json(created);
}

function delegateMethod(name: string) {
  // Map from our section name to the prisma client property name (camelCase model).
  switch (name) {
    case "forYouPoints":
      return "forYouPoint";
    case "notForYouPoints":
      return "notForYouPoint";
    case "learningPoints":
      return "learningPoint";
    case "detailFields":
      return "detailField";
    case "testimonials":
      return "testimonial";
    case "faqs":
      return "faq";
    default:
      return name;
  }
}
