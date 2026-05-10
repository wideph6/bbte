import Link from "next/link";
import { SparkleIcon } from "./icons";

interface Settings {
  footerText?: string | null;
  socialLinks?: unknown;
  siteTitle?: string | null;
  tagline?: string | null;
}

// Renders a small inline icon for each known social platform. Falls back to
// a generic dot if the platform name is unfamiliar — no external icon dep.
function PlatformIcon({ platform, className }: { platform: string; className?: string }) {
  const p = platform.toLowerCase();
  const cls = className ?? "h-4 w-4";
  if (p.includes("facebook")) {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z" />
      </svg>
    );
  }
  if (p.includes("instagram")) {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
      </svg>
    );
  }
  if (p.includes("youtube")) {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M23 7s-.2-1.6-.9-2.3c-.8-.9-1.7-.9-2.2-1C16.7 3.5 12 3.5 12 3.5h0s-4.7 0-7.9.2c-.5.1-1.4.1-2.2 1C1.2 5.4 1 7 1 7s-.2 1.9-.2 3.8v1.7c0 1.9.2 3.8.2 3.8s.2 1.6.9 2.3c.8.9 1.9.9 2.5 1 1.8.2 7.6.2 7.6.2s4.7 0 7.9-.2c.5-.1 1.4-.1 2.2-1 .7-.7.9-2.3.9-2.3s.2-1.9.2-3.8v-1.7C23.2 8.9 23 7 23 7zM9.7 14.6V8.5l6.1 3.1-6.1 3z" />
      </svg>
    );
  }
  if (p.includes("twitter") || p === "x") {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  if (p.includes("tiktok")) {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19.6 6.7a4.8 4.8 0 0 1-3.5-1.5A4.8 4.8 0 0 1 14.7 2h-3.2v13.5a2.5 2.5 0 1 1-2.5-2.5c.3 0 .5 0 .8.1V9.8c-.3 0-.5-.1-.8-.1A5.7 5.7 0 1 0 14.7 15.5V8.7c1.4 1 3.1 1.5 4.9 1.5z" />
      </svg>
    );
  }
  if (p.includes("whatsapp")) {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.464 3.488" />
      </svg>
    );
  }
  return <span className={`${cls} inline-block rounded-full bg-current opacity-50`} />;
}

export function SiteFooter({ settings }: { settings: Settings | null }) {
  const links = Array.isArray(settings?.socialLinks)
    ? (settings!.socialLinks as Array<{ platform?: string; url?: string }>)
    : [];
  const initial = (settings?.siteTitle ?? "U").charAt(0).toUpperCase();
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-16 overflow-hidden border-t border-brand/10 bg-emerald-rich text-emerald-50">
      <div className="absolute inset-0 bg-pattern-arabesque opacity-20" aria-hidden="true" />
      <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gold/10 blur-3xl" aria-hidden="true" />

      <div className="relative container-wide py-12 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand column */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/10 ring-1 ring-white/20 text-xl font-bold text-white">
                {initial}
              </div>
              <div>
                <div className="text-xl font-semibold text-white">
                  {settings?.siteTitle ?? "Courses"}
                </div>
                {settings?.tagline ? (
                  <div className="text-sm text-emerald-100/70">{settings.tagline}</div>
                ) : null}
              </div>
            </Link>
          </div>

          {/* Links column */}
          <div>
            <div className="ornament justify-start mb-4">
              <SparkleIcon className="h-3.5 w-3.5 text-gold" />
            </div>
            <h3 className="text-base font-semibold text-white mb-3">روابط</h3>
            <ul className="space-y-2 text-sm text-emerald-100/80">
              <li>
                <Link href="/" className="hover:text-gold-soft transition-colors">
                  ہوم
                </Link>
              </li>
            </ul>
          </div>

          {/* Social column */}
          <div>
            <div className="ornament justify-start mb-4">
              <SparkleIcon className="h-3.5 w-3.5 text-gold" />
            </div>
            <h3 className="text-base font-semibold text-white mb-3">سوشل میڈیا</h3>
            {links.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {links.map((l, i) =>
                  l.url ? (
                    <a
                      key={i}
                      href={l.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={l.platform ?? "social link"}
                      className="grid h-10 w-10 place-items-center rounded-xl bg-white/8 ring-1 ring-white/15 text-emerald-50 transition-all hover:bg-gold/15 hover:text-gold-soft hover:ring-gold/40"
                    >
                      <PlatformIcon platform={l.platform ?? ""} />
                    </a>
                  ) : null
                )}
              </div>
            ) : (
              <div className="text-sm text-emerald-100/60">جلد ہی شامل کیا جائے گا</div>
            )}
          </div>
        </div>

        {/* Bottom rule */}
        <div className="mt-12 border-t border-white/10 pt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="text-sm text-emerald-100/60">
            {settings?.footerText ?? `© ${year} ${settings?.siteTitle ?? ""}`}
          </div>
          <div className="text-xs text-emerald-100/50 ltr">
            All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
