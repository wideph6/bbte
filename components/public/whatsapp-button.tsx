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
  variant?: "solid" | "outline";
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
  variant = "solid",
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
    size === "lg"
      ? "h-[58px] px-8 text-lg rounded-2xl"
      : "h-12 px-6 text-base rounded-xl";

  const baseClasses =
    variant === "outline"
      ? "bg-white text-whatsappDark ring-2 ring-whatsapp hover:bg-whatsapp/5"
      : "bg-gradient-to-l from-whatsapp via-[#22c55e] to-[#16a34a] text-white shadow-wa hover:shadow-[0_12px_32px_rgba(37,211,102,0.45)] active:translate-y-[1px]";

  return (
    <button
      type="button"
      onClick={handle}
      disabled={busy || isPending}
      data-placement={placement}
      aria-label={buttonLabel}
      className={`group relative inline-flex items-center justify-center gap-3 font-semibold transition-all duration-200 disabled:opacity-60 ${sizeClasses} ${baseClasses} ${className ?? ""}`}
    >
      {variant === "solid" ? (
        <span className="pointer-events-none absolute inset-0 -z-0 overflow-hidden rounded-[inherit]">
          {/* Animated subtle shine sweep across the button. */}
          <span className="absolute -inset-1 bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.25)_50%,transparent_70%)] bg-[length:200%_100%] animate-shine" />
        </span>
      ) : null}
      <span className="relative z-10 grid place-items-center rounded-full bg-white/20 p-1.5">
        <WhatsAppIcon className={size === "lg" ? "w-6 h-6" : "w-5 h-5"} />
      </span>
      <span className="relative z-10">{buttonLabel}</span>
    </button>
  );
}
