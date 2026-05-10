import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { bustHome } from "@/lib/revalidate";

const schema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  let slug = slugify(parsed.data.slug || parsed.data.title);
  if (!slug) return NextResponse.json({ error: "Bad slug" }, { status: 400 });

  // Ensure slug uniqueness.
  let unique = slug;
  let i = 2;
  while (await prisma.course.findUnique({ where: { slug: unique } })) {
    unique = `${slug}-${i++}`;
  }

  const course = await prisma.course.create({
    data: {
      title: parsed.data.title,
      slug: unique,
      detailFields: {
        create: [
          { order: 0, label: "Qeemat", value: "PKR 0", isPrice: true },
          { order: 1, label: "Muddat", value: "—" },
        ],
      },
    },
  });
  bustHome();
  return NextResponse.json(course);
}
