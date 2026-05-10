import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { bustEverything } from "@/lib/revalidate";

const schema = z.object({
  name: z.string().min(1).optional(),
  photoUrl: z.string().url().nullable().optional(),
  bio: z.string().optional(),
  credibilityPoints: z.array(z.string()).nullable().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const data: Prisma.InstructorUpdateInput = {};
  if (parsed.data.name !== undefined) data.name = parsed.data.name;
  if (parsed.data.photoUrl !== undefined) data.photoUrl = parsed.data.photoUrl;
  if (parsed.data.bio !== undefined) data.bio = parsed.data.bio;
  if (parsed.data.credibilityPoints !== undefined) {
    data.credibilityPoints =
      parsed.data.credibilityPoints === null ? Prisma.JsonNull : parsed.data.credibilityPoints;
  }
  const updated = await prisma.instructor.update({ where: { id: params.id }, data });
  bustEverything();
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.instructor.delete({ where: { id: params.id } });
  bustEverything();
  return NextResponse.json({ ok: true });
}
