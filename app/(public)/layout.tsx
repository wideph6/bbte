import type { Metadata } from "next";
import { Noto_Nastaliq_Urdu, Inter } from "next/font/google";
import { prisma } from "@/lib/prisma";
import { PixelScript } from "@/components/public/pixel-script";
import { GA4Script } from "@/components/public/ga4-script";
import "../globals.css";

const noto = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-urdu",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.globalSettings.findUnique({ where: { id: 1 } }).catch(() => null);
  return {
    title: settings?.siteTitle ?? "Urdu Courses",
    description: settings?.tagline ?? "Online Urdu Courses",
    icons: settings?.logoUrl ? { icon: settings.logoUrl } : undefined,
  };
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await prisma.globalSettings.findUnique({ where: { id: 1 } }).catch(() => null);
  return (
    <html lang="ur" dir="rtl" className={`${noto.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-slate-50 font-urdu">
        {settings?.metaPixelId ? <PixelScript pixelId={settings.metaPixelId} /> : null}
        {settings?.ga4MeasurementId ? <GA4Script measurementId={settings.ga4MeasurementId} /> : null}
        {children}
      </body>
    </html>
  );
}
