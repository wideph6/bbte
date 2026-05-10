/**
 * Supabase Storage helpers. We never expose the service role key to the
 * browser — uploads always go through admin-protected API routes.
 *
 * Convention: a single public bucket named `uploads` holds logos, course
 * heroes, instructor and testimonial photos. Public URLs are saved in the DB.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "uploads";

let serviceClient: SupabaseClient | null = null;

export function getServiceSupabase(): SupabaseClient {
  if (serviceClient) return serviceClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Supabase env vars missing (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).");
  }
  serviceClient = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return serviceClient;
}

export async function uploadPublicFile(
  file: Buffer | Uint8Array | Blob,
  filename: string,
  contentType: string,
  folder: string = "misc"
): Promise<string> {
  const supa = getServiceSupabase();
  const ext = filename.split(".").pop() || "bin";
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}`;

  const { error } = await supa.storage.from(BUCKET).upload(key, file, {
    contentType,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supa.storage.from(BUCKET).getPublicUrl(key);
  return data.publicUrl;
}

export const SUPABASE_BUCKET = BUCKET;
