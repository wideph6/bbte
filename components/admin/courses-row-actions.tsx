"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CoursesRowActions({
  id,
  status,
  slug,
}: {
  id: string;
  status: string;
  slug: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function api(action: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/courses/${id}/${action}`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || `Failed: ${action}`);
        return;
      }
      toast.success(`${action} done`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function del() {
    if (!confirm("Delete this course and all its content? This cannot be undone.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/courses/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Delete failed");
        return;
      }
      toast.success("Course deleted");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2 justify-end">
      <Link href={`/course/${slug}`} target="_blank">
        <Button variant="ghost" size="sm">View</Button>
      </Link>
      <Link href={`/admin/courses/${id}`}>
        <Button variant="outline" size="sm">Edit</Button>
      </Link>
      <Button variant="outline" size="sm" disabled={busy} onClick={() => api("toggle")}>
        {status === "active" ? "Set Draft" : "Activate"}
      </Button>
      <Button variant="outline" size="sm" disabled={busy} onClick={() => api("duplicate")}>
        Duplicate
      </Button>
      <Button variant="destructive" size="sm" disabled={busy} onClick={del}>
        Delete
      </Button>
    </div>
  );
}
