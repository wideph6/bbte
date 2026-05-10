"use client";
import { useState, useTransition } from "react";
import { v4 as uuidv4 } from "uuid";
import { WhatsAppIcon } from "./icons";
import { buildWhatsAppUrl, renderTemplate } from "@/lib/utils";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

export interface WhatsAppButtonProps {
  courseId: string;
  courseName: string;
  whatsappNumber: string;
  whatsappTemplate: string;
  buttonLabel: string;
  pixelId: string | null;
  placement?: string;
  size?: "md" | "lg";
  className?: string;
}

export function WhatsAppButton({
  courseId,
  courseName,
  whatsappNumber,
  whatsappTemplate,
  buttonLabel,
  pixelId,
  placement,
  size = "md",
  className,
}: WhatsAppButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  const handle = async () => {
    if (busy) return;
    setBusy(true);
    const trackingId = uuidv4();
    const message = renderTemplate(whatsappTemplate, {
      course_name: courseName,
      tracking_id: trackingId,
    });
    const url = buildWhatsAppUrl(whatsappNumber || "", message);

    // Fire pixel + GA4 (best-effort, don't block click)
    try {
      if (pixelId && typeof window.fbq === "function") {
        window.fbq("track", "Lead", {
          content_name: courseName,
          content_ids: [courseId],
        }, { eventID: trackingId });
      }
      if (typeof window.gtag === "function") {
        window.gtag("event", "generate_lead", {
          item_id: courseId,
          item_name: courseName,
          tracking_id: trackingId,
        });
      }
    } catch {
      /* swallow */
    }

    // Record click + fire CAPI Lead server-side. We use sendBeacon when
    // available so the request survives the navigation to wa.me.
    const payload = JSON.stringify({
      courseId,
      trackingId,
      placement: placement ?? null,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      referrer: typeof document !== "undefined" ? document.referrer : null,
    });

    let beaconSent = false;
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      try {
        beaconSent = navigator.sendBeacon("/api/clicks", new Blob([payload], { type: "application/json" }));
      } catch {
        beaconSent = false;
      }
    }
    if (!beaconSent) {
      // fire-and-forget POST; we don't await before opening WhatsApp
      try {
        fetch("/api/clicks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => undefined);
      } catch {
        /* ignore */
      }
    }

    startTransition(() => {
      window.location.href = url;
    });
  };

  const sizeClasses =
    size === "lg" ? "h-14 px-7 text-lg rounded-xl" : "h-11 px-5 text-base rounded-lg";

  return (
    <button
      type="button"
      onClick={handle}
      disabled={busy || isPending}
      data-placement={placement}
      className={`inline-flex items-center justify-center gap-3 bg-whatsapp text-white font-semibold shadow-lg hover:opacity-90 disabled:opacity-60 transition-opacity ${sizeClasses} ${className ?? ""}`}
    >
      <WhatsAppIcon className="w-6 h-6" />
      <span>{buttonLabel}</span>
    </button>
  );
}
