import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";

export const revalidate = 60;

export default async function HomePage() {
  const [settings, courses] = await Promise.all([
    prisma.globalSettings.findUnique({ where: { id: 1 } }).catch(() => null),
    prisma.course.findMany({
      where: { status: "active" },
      orderBy: { createdAt: "desc" },
      include: { detailFields: { where: { isPrice: true }, take: 1 } },
    }).catch(() => []),
  ]);

  return (
    <>
      <SiteHeader settings={settings} />
      <main className="container-wide py-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">{settings?.siteTitle ?? "Hamare Courses"}</h1>
        {settings?.tagline ? (
          <p className="text-slate-600 text-lg mb-8">{settings.tagline}</p>
        ) : null}

        {courses.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-slate-600 text-lg">
              Abhi koi course mojood nahi. Jald hi naye courses shamil kiye jayein gay.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <Link
                key={c.id}
                href={`/course/${c.slug}`}
                className="group rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-[16/9] bg-slate-100">
                  {c.heroImageUrl ? (
                    <Image
                      src={c.heroImageUrl}
                      alt={c.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                      تصویر دستیاب نہیں
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h2 className="text-xl font-semibold mb-2 group-hover:text-brand transition-colors">
                    {c.title}
                  </h2>
                  {c.subHeadline ? (
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">{c.subHeadline}</p>
                  ) : null}
                  <div className="flex items-center justify-between">
                    {c.detailFields[0] ? (
                      <span className="text-brand font-bold text-lg">{c.detailFields[0].value}</span>
                    ) : <span />}
                    <span className="inline-flex items-center gap-1 text-brand font-medium">
                      تفصیل دیکھیں ←
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
