import Link from "next/link";
import Image from "next/image";

interface Settings {
  logoUrl?: string | null;
  siteTitle?: string | null;
  tagline?: string | null;
}

export function SiteHeader({ settings }: { settings: Settings | null }) {
  const initial = (settings?.siteTitle ?? "U").charAt(0).toUpperCase();
  return (
    <header
      className="sticky top-0 z-30 border-b border-brand/10 bg-cream/80 backdrop-blur-md supports-[backdrop-filter]:bg-cream/70"
      role="banner"
    >
      {/* Hairline gold rule on top — premium feel without being loud. */}
      <div className="h-[2px] bg-gradient-to-l from-gold/30 via-gold/60 to-gold/30" aria-hidden="true" />
      <div className="container-wide flex items-center justify-between py-3 sm:py-4">
        <Link
          href="/"
          className="group flex items-center gap-3 sm:gap-4 transition-opacity hover:opacity-90"
          aria-label={settings?.siteTitle ?? "Home"}
        >
          {settings?.logoUrl ? (
            <div className="relative h-11 w-11 sm:h-12 sm:w-12 overflow-hidden rounded-xl ring-1 ring-brand/15 bg-white shadow-soft">
              <Image
                src={settings.logoUrl}
                alt="logo"
                fill
                sizes="48px"
                className="object-contain p-1"
              />
            </div>
          ) : (
            <div
              className="grid h-11 w-11 sm:h-12 sm:w-12 place-items-center rounded-xl bg-emerald-rich text-white text-xl font-bold shadow-glow ring-1 ring-brand-dark/30"
              aria-hidden="true"
            >
              {initial}
            </div>
          )}
          <div className="flex flex-col">
            <div className="font-bold text-lg sm:text-xl leading-tight text-brand-darker">
              {settings?.siteTitle ?? "Courses"}
            </div>
            {settings?.tagline ? (
              <div className="hidden sm:block text-xs text-slate-500 leading-tight mt-0.5">
                {settings.tagline}
              </div>
            ) : null}
          </div>
        </Link>
      </div>
    </header>
  );
}
