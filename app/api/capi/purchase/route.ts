/**
 * Direct CAPI Purchase trigger (used outside the leads PATCH flow if ever
 * needed). The leads PATCH endpoint already fires Purchase when status
 * transitions to "purchased" — this endpoint is here for completeness.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendCapiEvent } from "@/lib/capi";

const schema = z.object({
  clickId: z.string().min(1),
  value: z.number().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const [click, settings] = await Promise.all([
    prisma.click.findUnique({
      where: { id: parsed.data.clickId },
      include: { course: { include: { detailFields: { where: { isPrice: true }, take: 1 } } } },
    }),
    prisma.globalSettings.findUnique({ where: { id: 1 } }),
  ]);
  if (!click) return NextResponse.json({ error: "Click not found" }, { status: 404 });
  if (!settings?.metaPixelId || !settings.metaCapiToken) {
    return NextResponse.json({ error: "Pixel/CAPI not configured" }, { status: 400 });
  }

  let value = parsed.data.value;
  if (value === undefined && click.amountPaid) value = Number(click.amountPaid);
  if (value === undefined && click.course.detailFields[0]) {
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

  if (result.ok) {
    await prisma.click.update({ where: { id: click.id }, data: { capiPurchaseSent: true } });
  }
  return NextResponse.json(result);
}
