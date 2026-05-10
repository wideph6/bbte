import { NextRequest, NextResponse } from "next/server";
import { SECTIONS, isSection } from "@/lib/course-sections";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; section: string; itemId: string } }
) {
  if (!isSection(params.section)) return NextResponse.json({ error: "Unknown section" }, { status: 404 });
  const def = SECTIONS[params.section];
  const body = await req.json().catch(() => null);
  const parsed = def.patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid" }, { status: 400 });
  }
  const updated = await def.delegate().update({ where: { id: params.itemId }, data: parsed.data });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; section: string; itemId: string } }
) {
  if (!isSection(params.section)) return NextResponse.json({ error: "Unknown section" }, { status: 404 });
  const def = SECTIONS[params.section];
  await def.delegate().delete({ where: { id: params.itemId } });
  return NextResponse.json({ ok: true });
}
