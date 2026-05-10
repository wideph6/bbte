"use client";
import { useEffect } from "react";

/**
 * Mounts a single IntersectionObserver that promotes every `[data-reveal="out"]`
 * element to `[data-reveal="in"]` once it enters the viewport. CSS in
 * globals.css does the actual fade/translate transition, keeping the runtime
 * cost trivial (no per-element React state, no framer-motion).
 */
export function ScrollReveal() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal="out"]'));
    if (elements.length === 0) return;

    if (typeof IntersectionObserver === "undefined") {
      // Fallback: just show everything.
      elements.forEach((el) => el.setAttribute("data-reveal", "in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-reveal", "in");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
    );

    elements.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
