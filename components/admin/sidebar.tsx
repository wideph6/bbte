"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/courses", label: "Courses" },
  { href: "/admin/instructors", label: "Instructors" },
  { href: "/admin/leads", label: "Leads / Clicks" },
  { href: "/admin/settings", label: "Global Settings" },
  { href: "/admin/account", label: "Account" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-60 bg-slate-900 text-slate-100 flex-shrink-0 hidden md:flex flex-col">
      <div className="p-5 border-b border-slate-800">
        <div className="text-lg font-bold">BBTE Admin</div>
        <div className="text-xs text-slate-400">Course CMS</div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block px-3 py-2 rounded-md text-sm transition-colors",
                active ? "bg-brand text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
