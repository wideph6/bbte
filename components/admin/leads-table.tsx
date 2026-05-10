"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";

type Click = {
  id: string;
  trackingId: string;
  status: string;
  phone: string | null;
  notes: string | null;
  amountPaid: string | number | null;
  createdAt: string;
  course: { id: string; title: string };
};

type Course = { id: string; title: string };

const STATUSES = ["new", "contacted", "purchased", "lost"] as const;

export function LeadsTable({
  initial,
  courses,
  initialFilters,
}: {
  initial: Click[];
  courses: Course[];
  initialFilters: { course?: string; status?: string; from?: string; to?: string };
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [items, setItems] = useState<Click[]>(initial);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function applyFilter(patch: Record<string, string | undefined>) {
    const q = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (!v) q.delete(k);
      else q.set(k, v);
    }
    router.push(`/admin/leads?${q.toString()}`);
  }

  async function setStatus(id: string, status: string, amountPaid?: string) {
    const body: Record<string, unknown> = { status };
    if (amountPaid !== undefined) body.amountPaid = amountPaid;
    const res = await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      toast.error("Update failed");
      return;
    }
    toast.success(`Marked ${status}`);
    setItems((arr) => arr.map((c) => (c.id === id ? { ...c, status } : c)));
    router.refresh();
  }

  async function markPurchased(c: Click) {
    const amount = window.prompt(
      `Amount paid for "${c.course.title}" (PKR)? Leave blank to use the course price.`,
      ""
    );
    if (amount === null) return;
    await setStatus(c.id, "purchased", amount);
  }

  async function setNotes(id: string, notes: string) {
    await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
  }

  async function removeOne(id: string) {
    if (!confirm("Delete this click record?")) return;
    setItems((arr) => arr.filter((c) => c.id !== id));
    await fetch(`/api/admin/leads/${id}`, { method: "DELETE" });
  }

  async function bulkDelete() {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} record(s)?`)) return;
    const ids = Array.from(selected);
    setItems((arr) => arr.filter((c) => !selected.has(c.id)));
    setSelected(new Set());
    await fetch("/api/admin/leads/bulk-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
  }

  function toggleSelect(id: string) {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function toggleSelectAll() {
    if (selected.size === items.length) setSelected(new Set());
    else setSelected(new Set(items.map((i) => i.id)));
  }

  function exportCsv() {
    const header = ["Date", "Course", "TrackingID", "Phone", "Status", "AmountPaid", "Notes"];
    const rows = items.map((c) => [
      new Date(c.createdAt).toISOString(),
      c.course.title.replace(/"/g, '""'),
      c.trackingId,
      c.phone ?? "",
      c.status,
      c.amountPaid?.toString() ?? "",
      (c.notes ?? "").replace(/"/g, '""'),
    ]);
    const csv = [header, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6 grid gap-3 sm:grid-cols-5">
          <select
            value={initialFilters.course ?? ""}
            onChange={(e) => applyFilter({ course: e.target.value || undefined })}
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
          >
            <option value="">All courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
          <select
            value={initialFilters.status ?? ""}
            onChange={(e) => applyFilter({ status: e.target.value || undefined })}
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <Input
            type="date"
            value={initialFilters.from ?? ""}
            onChange={(e) => applyFilter({ from: e.target.value || undefined })}
          />
          <Input
            type="date"
            value={initialFilters.to ?? ""}
            onChange={(e) => applyFilter({ to: e.target.value || undefined })}
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/admin/leads")}>Reset</Button>
            <Button variant="outline" onClick={exportCsv}>Export CSV</Button>
          </div>
        </CardContent>
      </Card>

      {selected.size > 0 ? (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 px-4 py-2 rounded-md">
          <span className="text-sm">{selected.size} selected</span>
          <Button variant="destructive" size="sm" onClick={bulkDelete}>Delete selected</Button>
        </div>
      ) : null}

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {items.length === 0 ? (
            <div className="p-10 text-center text-slate-500">No clicks match the filters.</div>
          ) : (
            <table className="w-full text-sm min-w-[900px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-3">
                    <input
                      type="checkbox"
                      checked={selected.size === items.length && items.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="text-left p-3 font-medium">Date</th>
                  <th className="text-left p-3 font-medium">Course</th>
                  <th className="text-left p-3 font-medium">Tracking ID</th>
                  <th className="text-left p-3 font-medium">Phone</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Notes</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selected.has(c.id)}
                        onChange={() => toggleSelect(c.id)}
                      />
                    </td>
                    <td className="p-3 whitespace-nowrap text-xs text-slate-500">{formatDateTime(c.createdAt)}</td>
                    <td className="p-3">{c.course.title}</td>
                    <td className="p-3 font-mono text-xs">{c.trackingId.slice(0, 12)}…</td>
                    <td className="p-3">
                      <Input
                        defaultValue={c.phone ?? ""}
                        placeholder="—"
                        onBlur={(e) =>
                          fetch(`/api/admin/leads/${c.id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ phone: e.target.value || null }),
                          })
                        }
                      />
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={
                          c.status === "purchased"
                            ? "success"
                            : c.status === "lost"
                              ? "danger"
                              : c.status === "contacted"
                                ? "warning"
                                : "muted"
                        }
                      >
                        {c.status}
                      </Badge>
                    </td>
                    <td className="p-3 max-w-xs">
                      <Input
                        defaultValue={c.notes ?? ""}
                        placeholder="Add a note"
                        onBlur={(e) => setNotes(c.id, e.target.value)}
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1 justify-end flex-wrap">
                        {c.status !== "contacted" ? (
                          <Button size="sm" variant="outline" onClick={() => setStatus(c.id, "contacted")}>Contacted</Button>
                        ) : null}
                        {c.status !== "purchased" ? (
                          <Button size="sm" onClick={() => markPurchased(c)}>Purchased</Button>
                        ) : null}
                        {c.status !== "lost" ? (
                          <Button size="sm" variant="outline" onClick={() => setStatus(c.id, "lost")}>Lost</Button>
                        ) : null}
                        <Button size="sm" variant="destructive" onClick={() => removeOne(c.id)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
