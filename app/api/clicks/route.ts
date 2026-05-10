import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendCapiEvent } from "@/lib/capi";

export const runtime = "nodejs";

const schema = z.object({
  courseId: z.string().min(1),
  trackingId: z.string().min(8),
  placement: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
  referrer: z.string().nullable().optional(),
});

function getIp(req: NextRequest): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() ?? null;
  const real = req.headers.get("x-real-ip");
  return real ?? null;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { courseId, trackingId, userAgent, referrer } = parsed.data;
  const ip = getIp(req);

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true },
  });
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  // Idempotent insert: if the client retries with the same trackingId we
  // ignore the duplicate but still attempt the CAPI fire.
  let click = await prisma.click.findUnique({ where: { trackingId } });
  if (!click) {
    click = await prisma.click.create({
      data: {
        trackingId,
        courseId,
        userAgent: userAgent ?? null,
        referrer: referrer ?? null,
        ipAddress: ip,
        pixelEventSent: true,
      },
    });
  }

  // Fire CAPI Lead (server-side mirror of the browser Pixel event).
  const settings = await prisma.globalSettings.findUnique({ where: { id: 1 } });
  if (settings?.metaPixelId && settings?.metaCapiToken && !click.capiLeadSent) {
    const eventSourceUrl = (referrer || `${req.nextUrl.origin}`) ?? undefined;
    const result = await sendCapiEvent({
      pixelId: settings.metaPixelId,
      accessToken: settings.metaCapiToken,
      testCode: settings.metaCapiTestCode ?? null,
      eventName: "Lead",
      eventId: trackingId,
      eventSourceUrl,
      userAgent: userAgent ?? undefined,
      ipAddress: ip ?? undefined,
      contentName: course.title,
      contentIds: [course.id],
    });
    if (result.ok) {
      await prisma.click.update({ where: { id: click.id }, data: { capiLeadSent: true } });
    }
  }

  return NextResponse.json({ ok: true, id: click.id });
}
