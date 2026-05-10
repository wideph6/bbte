"use client";
import { useEffect } from "react";

/**
 * PageEnhancer — mounts once on the course detail page.
 *
 * Pure CSS + JS micro-interactions. No data or HTML source changes.
 * Enhancements:
 *  1. Scroll-reveal (original IntersectionObserver, improved spring easing)
 *  2. Reading progress bar pinned at top
 *  3. Hero image gentle float animation
 *  4. WhatsApp CTA aura pulse rings
 *  5. 3D card tilt on mouse (desktop only)
 *  6. Card shimmer on first reveal
 *  7. CTA button attention shake after user idle
 *  8. Badge glow pulse on CTA urgency badge
 *  9. Stagger grid children that haven't been staggered yet
 */
export function ScrollReveal() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const cleanups: (() => void)[] = [];

    /* ── 1. Scroll reveal ─────────────────────────────────────────── */
    const revealEls = Array.from(
      document.querySelectorAll<HTMLElement>('[data-reveal="out"]')
    );

    if (typeof IntersectionObserver !== "undefined") {
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              const el = entry.target as HTMLElement;
              el.setAttribute("data-reveal", "in");
              // One-shot shimmer on cards when they first reveal
              if (el.classList.contains("rounded-3xl") || el.classList.contains("rounded-2xl")) {
                el.style.position = el.style.position || "relative";
                el.style.overflow = "hidden";
                el.classList.add("card-shimmer-once");
              }
              io.unobserve(el);
            }
          }
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.04 }
      );
      revealEls.forEach((el) => io.observe(el));
      cleanups.push(() => io.disconnect());
    } else {
      revealEls.forEach((el) => el.setAttribute("data-reveal", "in"));
    }

    /* ── 2. Reading progress bar ──────────────────────────────────── */
    const bar = document.createElement("div");
    bar.className = "reading-progress-bar";
    document.body.appendChild(bar);

    const updateBar = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${total > 0 ? scrolled / total : 0})`;
    };
    window.addEventListener("scroll", updateBar, { passive: true });
    cleanups.push(() => {
      window.removeEventListener("scroll", updateBar);
      bar.remove();
    });

    /* ── 3. Hero image float ──────────────────────────────────────── */
    // The scroll-hint chevron sits inside the image wrapper — use it to
    // navigate up to the outermost relative div of the image block.
    const hint = document.querySelector<HTMLElement>(".animate-scroll-hint");
    if (hint?.parentElement) {
      hint.parentElement.classList.add("animate-float-gentle");
    }

    /* ── 4. WhatsApp hero button aura rings ───────────────────────── */
    const heroBtn = document.querySelector<HTMLElement>('[data-placement="hero"]');
    if (heroBtn) {
      // Wrap the button in a span that carries the WA aura CSS class
      const wrap = document.createElement("span");
      wrap.className = "wa-aura-wrap";
      heroBtn.parentNode?.insertBefore(wrap, heroBtn);
      wrap.appendChild(heroBtn);
    }

    /* ── 5. 3D card tilt (desktop / pointer device only) ─────────── */
    const supportsHover = window.matchMedia("(hover: hover)").matches;
    if (supportsHover) {
      const cards = Array.from(
        document.querySelectorAll<HTMLElement>(".rounded-3xl, .rounded-\\[2rem\\]")
      );

      const onMove = (e: MouseEvent) => {
        const card = e.currentTarget as HTMLElement;
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        const rx = (y - 0.5) * -9;
        const ry = (x - 0.5) * 9;
        card.style.transition = "transform 0.08s linear";
        card.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-5px) scale(1.01)`;
      };

      const onLeave = (e: MouseEvent) => {
        const card = e.currentTarget as HTMLElement;
        card.style.transition = "transform 0.45s cubic-bezier(0.16,1,0.3,1)";
        card.style.transform = "";
        setTimeout(() => {
          card.style.transition = "";
          card.style.transform = "";
        }, 460);
      };

      cards.forEach((c) => {
        c.addEventListener("mousemove", onMove as EventListener);
        c.addEventListener("mouseleave", onLeave as EventListener);
      });

      cleanups.push(() => {
        cards.forEach((c) => {
          c.removeEventListener("mousemove", onMove as EventListener);
          c.removeEventListener("mouseleave", onLeave as EventListener);
        });
      });
    }

    /* ── 6. CTA urgency badge glow pulse ─────────────────────────── */
    // The badge is the first `.rounded-full.border.border-gold\/50` inside the
    // final CTA section (last <section> on page).
    const ctaSection = document.querySelector<HTMLElement>(
      'section:last-of-type .rounded-full'
    );
    if (ctaSection) ctaSection.classList.add("animate-badge-glow");

    /* ── 7. CTA attention shake after user goes idle ──────────────── */
    const ctaBtn = document.querySelector<HTMLElement>('[data-placement="final"]');
    let idleTimer: ReturnType<typeof setTimeout> | null = null;

    const scheduleShake = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        if (!ctaBtn) return;
        ctaBtn.style.animation = "attention-shake 0.85s ease-in-out";
        setTimeout(() => {
          if (ctaBtn) ctaBtn.style.animation = "";
        }, 900);
        scheduleShake(); // reschedule indefinitely
      }, 9000);
    };

    if (ctaBtn) {
      scheduleShake();
      const resetIdle = () => scheduleShake();
      ["mousemove", "scroll", "touchstart", "keydown"].forEach((ev) =>
        window.addEventListener(ev, resetIdle, { passive: true })
      );
      cleanups.push(() => {
        if (idleTimer) clearTimeout(idleTimer);
        ["mousemove", "scroll", "touchstart", "keydown"].forEach((ev) =>
          window.removeEventListener(ev, resetIdle)
        );
      });
    }

    /* ── 8. Stagger grid children that lack a transitionDelay ──────── */
    const grids = Array.from(
      document.querySelectorAll<HTMLElement>("ul.grid, .grid.gap-5, .grid.gap-6")
    );
    grids.forEach((grid) => {
      Array.from(grid.children).forEach((child, i) => {
        const el = child as HTMLElement;
        if (!el.style.transitionDelay && !el.getAttribute("style")?.includes("transitionDelay")) {
          el.style.transitionDelay = `${Math.min(i * 75, 450)}ms`;
        }
      });
    });

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return null;
}
