/**
 * Meta Conversions API (CAPI) helper.
 *
 * Sends server-side `Lead` and `Purchase` events that mirror the browser-side
 * Pixel events. Each call uses the same `event_id` (= our trackingId) so Meta
 * deduplicates the pair.
 *
 * PII (phone) is SHA-256 hashed before sending, per Meta requirements.
 */
import crypto from "crypto";

const GRAPH_API_VERSION = "v19.0";

export interface CapiEventInput {
  pixelId: string;
  accessToken: string;
  testCode?: string | null;
  eventName: "Lead" | "Purchase" | "ViewContent" | "PageView";
  eventId: string;
  eventTime?: number;
  eventSourceUrl?: string;
  userAgent?: string;
  ipAddress?: string;
  phone?: string | null;
  value?: number;
  currency?: string;
  contentName?: string;
  contentIds?: string[];
}

function sha256(input: string): string {
  return crypto.createHash("sha256").update(input.trim().toLowerCase()).digest("hex");
}

function normalizePhone(raw: string): string {
  return raw.replace(/[^0-9]/g, "");
}

export async function sendCapiEvent(input: CapiEventInput): Promise<{ ok: boolean; error?: string }> {
  if (!input.pixelId || !input.accessToken) {
    return { ok: false, error: "Missing pixelId/accessToken" };
  }

  const userData: Record<string, unknown> = {};
  if (input.userAgent) userData.client_user_agent = input.userAgent;
  if (input.ipAddress) userData.client_ip_address = input.ipAddress;
  if (input.phone) {
    const normalized = normalizePhone(input.phone);
    if (normalized) userData.ph = [sha256(normalized)];
  }

  const event: Record<string, unknown> = {
    event_name: input.eventName,
    event_time: input.eventTime ?? Math.floor(Date.now() / 1000),
    event_id: input.eventId,
    action_source: "website",
    user_data: userData,
  };
  if (input.eventSourceUrl) event.event_source_url = input.eventSourceUrl;

  const customData: Record<string, unknown> = {};
  if (input.value !== undefined) customData.value = input.value;
  if (input.currency) customData.currency = input.currency;
  if (input.contentName) customData.content_name = input.contentName;
  if (input.contentIds) customData.content_ids = input.contentIds;
  if (Object.keys(customData).length > 0) event.custom_data = customData;

  const body: Record<string, unknown> = { data: [event] };
  if (input.testCode) body.test_event_code = input.testCode;

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${input.pixelId}/events?access_token=${encodeURIComponent(input.accessToken)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("[capi] non-OK response", res.status, text);
      return { ok: false, error: `${res.status}: ${text.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[capi] request failed", msg);
    return { ok: false, error: msg };
  }
}
