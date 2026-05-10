import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { bustEverything } from "@/lib/revalidate";

const schema = z.object({
  logoUrl: z.string().url().nullable().optional(),
  siteTitle: z.string().min(1).optional(),
  tagline: z.string().nullable().optional(),
  whatsappNumber: z.string().min(1).optional(),
  whatsappMessageTemplate: z.string().min(1).optional(),
  footerText: z.string().nullable().optional(),
  socialLinks: z
    .array(z.object({ platform: z.string(), url: z.string() }))
    .nullable()
    .optional(),
  metaPixelId: z.string().nullable().optional(),
  metaCapiToken: z.string().nullable().optional(),
  metaCapiTestCode: z.string().nullable().optional(),
  ga4MeasurementId: z.string().nullable().optional(),
});

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid" }, { status: 400 });
  }

  // Build inputs, mapping null on JSON column to Prisma.JsonNull.
  const { socialLinks, ...rest } = parsed.data;
  const update: Prisma.GlobalSettingsUpdateInput = { ...rest };
  if (socialLinks !== undefined) {
    update.socialLinks = socialLinks === null ? Prisma.JsonNull : (socialLinks as Prisma.InputJsonValue);
  }
  const create: Prisma.GlobalSettingsCreateInput = {
    id: 1,
    siteTitle: parsed.data.siteTitle ?? "Urdu Courses",
    ...rest,
  };
  if (socialLinks !== undefined && socialLinks !== null) {
    create.socialLinks = socialLinks as Prisma.InputJsonValue;
  }

  const updated = await prisma.globalSettings.upsert({
    where: { id: 1 },
    update,
    create,
  });
  bustEverything();
  return NextResponse.json(updated);
}
