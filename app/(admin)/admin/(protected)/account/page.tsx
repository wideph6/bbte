"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AccountPage() {
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNew] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Failed");
        return;
      }
      toast.success("Password updated");
      setCurrent(""); setNew("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 max-w-md">
      <h1 className="text-2xl font-bold">Account</h1>
      <Card>
        <CardContent className="pt-6">
          <form className="space-y-4" onSubmit={submit}>
            <div className="space-y-2">
              <Label>Current password</Label>
              <Input type="password" required value={currentPassword} onChange={(e) => setCurrent(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>New password (min 8 chars)</Label>
              <Input type="password" required minLength={8} value={newPassword} onChange={(e) => setNew(e.target.value)} />
            </div>
            <Button type="submit" disabled={busy}>{busy ? "Updating..." : "Update password"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
