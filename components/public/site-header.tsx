import Link from "next/link";
import Image from "next/image";

interface Settings {
  logoUrl?: string | null;
  siteTitle?: string | null;
  tagline?: string | null;
}

export function SiteHeader({ settings }: { settings: Settings | null }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 backdrop-blur bg-white/90">
      <div className="container-wide flex items-center justify-between py-3">
        <Link href="/" className="flex items-center gap-3">
          {settings?.logoUrl ? (
            <Image src={settings.logoUrl} alt="logo" width={40} height={40} className="rounded-md object-contain" />
          ) : (
            <div className="w-10 h-10 rounded-md bg-brand text-white flex items-center justify-center font-bold">
              {(settings?.siteTitle ?? "U").charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="font-bold text-base sm:text-lg">{settings?.siteTitle ?? "Courses"}</div>
            {settings?.tagline ? (
              <div className="text-xs sm:text-sm text-slate-500 hidden sm:block">{settings.tagline}</div>
            ) : null}
          </div>
        </Link>
      </div>
    </header>
  );
}
