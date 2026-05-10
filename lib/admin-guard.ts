import { NextResponse } from "next/server";
import { getAdminFromCookie } from "./auth";

export async function requireAdmin() {
  const admin = await getAdminFromCookie();
  if (!admin) {
    return {
      admin: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    } as const;
  }
  return { admin, response: null } as const;
}
