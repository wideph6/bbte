import { revalidatePath } from "next/cache";

/**
 * Centralised cache busters for admin mutations.
 *
 * Public pages (`/` and `/course/[slug]`) declare `revalidate = 60`. Without
 * an explicit invalidation, an admin save can take up to a minute to surface
 * on the public site. These helpers flip the ISR cache the moment the admin
 * mutation succeeds, so changes appear on the next public request.
 */

/** Revalidate the public home page (course list). */
export function bustHome() {
  try {
    revalidatePath("/");
  } catch {
    /* never fail a mutation just because cache busting hiccupped */
  }
}

/** Revalidate the home page + a specific course landing page. */
export function bustCourse(slug?: string | null) {
  try {
    revalidatePath("/");
    if (slug) revalidatePath(`/course/${slug}`);
  } catch {
    /* swallow */
  }
}

/**
 * Revalidate everything under the public layout — used when site-wide
 * settings (logo, tagline, pixel id, footer text…) change so every page
 * picks up the new shell.
 */
export function bustEverything() {
  try {
    revalidatePath("/", "layout");
  } catch {
    /* swallow */
  }
}
