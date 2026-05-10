interface Settings {
  footerText?: string | null;
  socialLinks?: unknown;
  siteTitle?: string | null;
}

export function SiteFooter({ settings }: { settings: Settings | null }) {
  const links = Array.isArray(settings?.socialLinks)
    ? (settings!.socialLinks as Array<{ platform?: string; url?: string }>)
    : [];
  return (
    <footer className="bg-white border-t border-slate-200 mt-12">
      <div className="container-wide py-8 text-center sm:text-right">
        {links.length > 0 ? (
          <div className="flex flex-wrap justify-center sm:justify-start gap-4 mb-4">
            {links.map((l, i) =>
              l.url ? (
                <a key={i} href={l.url} target="_blank" rel="noreferrer noopener"
                  className="text-brand hover:underline capitalize">
                  {l.platform ?? "link"}
                </a>
              ) : null
            )}
          </div>
        ) : null}
        <div className="text-slate-500 text-sm">
          {settings?.footerText ?? `© ${new Date().getFullYear()} ${settings?.siteTitle ?? ""}`}
        </div>
      </div>
    </footer>
  );
}
