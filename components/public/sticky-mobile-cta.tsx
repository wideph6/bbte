"use client";
import { useEffect, useState } from "react";
import { WhatsAppButton, type WhatsAppButtonProps } from "./whatsapp-button";

/**
 * Sticky bottom CTA for mobile only. Hides itself when any inline WhatsApp
 * button is in the viewport so it doesn't double-up with hero / details /
 * final CTAs already on screen.
 *
 * Why a Set + selector exclusion?
 *   The earlier counter-based version flickered on mobile because the sticky
 *   button itself carries `data-placement="sticky"` — observing it caused a
 *   feedback loop (sticky shows → counts itself → hides → counts drops →
 *   shows again). We now (a) exclude the sticky placement from the selector,
 *   and (b) track each target's intersecting state in a Set so the final
 *   show/hide decision is deterministic regardless of event order.
 */
export function StickyMobileCTA(props: WhatsAppButtonProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>(
        '[data-placement]:not([data-placement="sticky"])'
      )
    );
    if (targets.length === 0) {
      setShow(true);
      return;
    }

    const visible = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target);
          else visible.delete(e.target);
        }
        setShow(visible.size === 0);
      },
      { rootMargin: "-40px" }
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  return (
    <div
      className={`sm:hidden fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 ease-out ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
      aria-hidden={!show}
    >
      <div
        className="pointer-events-none h-6 bg-gradient-to-t from-cream/95 to-transparent"
        aria-hidden="true"
      />
      <div className="border-t border-brand/10 bg-cream/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-md shadow-[0_-12px_32px_rgba(2,44,34,0.12)]">
        <WhatsAppButton {...props} placement="sticky" size="md" className="w-full" />
      </div>
    </div>
  );
}
