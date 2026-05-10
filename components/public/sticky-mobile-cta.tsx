"use client";
import { useEffect, useState } from "react";
import { WhatsAppButton, type WhatsAppButtonProps } from "./whatsapp-button";

/**
 * Sticky bottom CTA for mobile only. Hides itself when any inline WhatsApp
 * button is in viewport so it doesn't double-up with the hero/details/final
 * CTAs already on screen.
 */
export function StickyMobileCTA(props: WhatsAppButtonProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const targets = Array.from(document.querySelectorAll("[data-placement]")) as HTMLElement[];
    if (targets.length === 0) {
      setShow(true);
      return;
    }
    let visibleCount = 0;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visibleCount++;
          else visibleCount = Math.max(0, visibleCount - 1);
        }
        setShow(visibleCount === 0);
      },
      { rootMargin: "-40px" }
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  return (
    <div
      className={`sm:hidden fixed inset-x-0 bottom-0 z-40 transition-transform duration-200 ${show ? "translate-y-0" : "translate-y-full"}`}
    >
      <div className="bg-white/95 backdrop-blur border-t border-slate-200 p-3 shadow-2xl">
        <WhatsAppButton {...props} placement="sticky" size="md" className="w-full" />
      </div>
    </div>
  );
}
