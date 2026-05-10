import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast-provider";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "Admin — BBTE",
  robots: { index: false, follow: false },
};

// NOTE: This is a separate root layout for the /admin section. The public
// site has its own root layout in app/(public)/layout.tsx with RTL+Urdu.
// Next.js supports multiple root layouts when using route groups.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={inter.variable}>
      <body className="min-h-screen bg-slate-100 font-sans">
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
