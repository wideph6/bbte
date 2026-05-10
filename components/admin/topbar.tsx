"use client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function AdminTopbar({ email }: { email: string }) {
  const router = useRouter();
  async function logout() {
    const res = await fetch("/api/auth/logout", { method: "POST" });
    if (res.ok) {
      toast.success("Signed out");
      router.replace("/admin/login");
      router.refresh();
    } else {
      toast.error("Logout failed");
    }
  }
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
      <div className="text-sm text-slate-500">Signed in as {email}</div>
      <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
    </header>
  );
}
