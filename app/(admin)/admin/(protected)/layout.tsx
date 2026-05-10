import { redirect } from "next/navigation";
import { getAdminFromCookie } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminFromCookie();
  if (!admin) redirect("/admin/login");

  return (
    <div className="min-h-screen flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar email={admin.email} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
