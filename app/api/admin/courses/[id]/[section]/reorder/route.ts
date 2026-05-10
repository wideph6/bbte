import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isSection } from "@/lib/course-sections";

const schema = z.object({ ids: z.array(z.string().min(1)) });

export async function POST(req: NextRequest, { params }: { params: { id: string; section: string } }) {
  const { section } = params;
  if (!isSection(section)) return NextResponse.json({ error: "Unknown section" }, { status: 404 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const delegateName = sectionToDelegate(section);
  const delegate = (prisma as any)[delegateName];

  // Update orders sequentially in a transaction.
  await prisma.$transaction(
    parsed.data.ids.map((id, idx) => delegate.update({ where: { id }, data: { order: idx } }))
  );
  return NextResponse.json({ ok: true });
}

function sectionToDelegate(name: string) {
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
