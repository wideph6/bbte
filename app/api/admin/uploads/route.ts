import { NextRequest, NextResponse } from "next/server";
import { uploadPublicFile } from "@/lib/supabase";

export const runtime = "nodejs";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX = 2 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Bad form data" }, { status: 400 });
  const file = form.get("file");
  const folder = (form.get("folder") as string) || "misc";
  if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Only JPG, PNG, or WEBP allowed." }, { status: 400 });
  }
  if (file.size > MAX) {
    return NextResponse.json({ error: "Max 2 MB." }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  try {
    const url = await uploadPublicFile(buf, file.name, file.type, folder);
    return NextResponse.json({ url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
