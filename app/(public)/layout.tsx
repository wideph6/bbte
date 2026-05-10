import type { Metadata } from "next";
import { Gulzar, Noto_Nastaliq_Urdu, Inter } from "next/font/google";
import { prisma } from "@/lib/prisma";
import { PixelScript } from "@/components/public/pixel-script";
import { GA4Script } from "@/components/public/ga4-script";
import "../globals.css";

// Primary Urdu font: Gulzar — a modern, beloved Pakistani Nastaliq face on
// Google Fonts. Visually closer to the Jameel Noori Nastaleeq audiences are
// used to than Noto, and rendered crisply at large display sizes.
const gulzar = Gulzar({
  subsets: ["arabic"],
  weight: "400",
  variable: "--font-urdu",
  display: "swap",
});

// Fallback that covers heavier weights / complex glyph fallbacks.
const noto = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-urdu-fallback",
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
    <html
      lang="ur"
      dir="rtl"
      className={`${gulzar.variable} ${noto.variable} ${inter.variable}`}
    >
      <body className="min-h-screen bg-cream font-urdu text-slate-900 antialiased selection:bg-brand/15 selection:text-brand-dark">
        {settings?.metaPixelId ? <PixelScript pixelId={settings.metaPixelId} /> : null}
        {settings?.ga4MeasurementId ? <GA4Script measurementId={settings.ga4MeasurementId} /> : null}
        {children}
      </body>
    </html>
  );
}
