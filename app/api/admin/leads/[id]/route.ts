import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendCapiEvent } from "@/lib/capi";

const schema = z.object({
  status: z.enum(["new", "contacted", "purchased", "lost"]).optional(),
  phone: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  amountPaid: z.union([z.string(), z.number()]).nullable().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (parsed.data.status !== undefined) data.status = parsed.data.status;
  if (parsed.data.phone !== undefined) data.phone = parsed.data.phone;
  if (parsed.data.notes !== undefined) data.notes = parsed.data.notes;

  if (parsed.data.amountPaid !== undefined && parsed.data.amountPaid !== null && parsed.data.amountPaid !== "") {
    const num = typeof parsed.data.amountPaid === "string"
      ? parseFloat(parsed.data.amountPaid.replace(/[^0-9.]/g, ""))
      : parsed.data.amountPaid;
    if (!Number.isNaN(num)) data.amountPaid = num;
  }

  const click = await prisma.click.findUnique({
    where: { id: params.id },
    include: { course: { include: { detailFields: { where: { isPrice: true }, take: 1 } } } },
  });
  if (!click) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // If transitioning to purchased and not already CAPI-fired, send Purchase server-side.
  if (parsed.data.status === "purchased" && !click.capiPurchaseSent) {
    const settings = await prisma.globalSettings.findUnique({ where: { id: 1 } });
    if (settings?.metaPixelId && settings?.metaCapiToken) {
      let value: number | undefined;
      if (data.amountPaid !== undefined) value = Number(data.amountPaid);
      else if (click.amountPaid) value = Number(click.amountPaid);
      else if (click.course.detailFields[0]) {
        const v = parseFloat(click.course.detailFields[0].value.replace(/[^0-9.]/g, ""));
        if (!Number.isNaN(v)) value = v;
      }
      const result = await sendCapiEvent({
        pixelId: settings.metaPixelId,
        accessToken: settings.metaCapiToken,
        testCode: settings.metaCapiTestCode ?? null,
        eventName: "Purchase",
        eventId: click.trackingId,
        userAgent: click.userAgent ?? undefined,
        ipAddress: click.ipAddress ?? undefined,
        phone: click.phone ?? undefined,
        value,
        currency: "PKR",
        contentName: click.course.title,
        contentIds: [click.courseId],
      });
      if (result.ok) data.capiPurchaseSent = true;
    }
  }

  const updated = await prisma.click.update({ where: { id: params.id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.click.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
