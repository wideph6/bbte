import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bustCourse } from "@/lib/revalidate";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const c = await prisma.course.findUnique({ where: { id: params.id } });
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const updated = await prisma.course.update({
    where: { id: c.id },
    data: { status: c.status === "active" ? "draft" : "active" },
  });
  bustCourse(updated.slug);
  return NextResponse.json(updated);
}
