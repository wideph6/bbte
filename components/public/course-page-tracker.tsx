"use client";
import { useEffect } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Fires Pixel ViewContent and GA4 page_view once per visit to a course page.
 */
export function CoursePageTracker({
  courseId,
  courseName,
  pixelId,
}: {
  courseId: string;
  courseName: string;
  pixelId: string | null;
}) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pixelId && typeof window.fbq === "function") {
      window.fbq("track", "ViewContent", {
        content_name: courseName,
        content_ids: [courseId],
        content_type: "product",
      });
    }
    if (typeof window.gtag === "function") {
      window.gtag("event", "view_item", { item_id: courseId, item_name: courseName });
    }
  }, [courseId, courseName, pixelId]);
  return null;
}
