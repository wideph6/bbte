"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export function ImageUpload({
  value,
  onChange,
  folder = "misc",
  label = "Upload image",
}: {
  value?: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);

  async function upload(file: File) {
    if (!ALLOWED.includes(file.type)) {
      toast.error("Only JPG, PNG, or WEBP allowed.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Max 2 MB.");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      const res = await fetch("/api/admin/uploads", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        toast.error(data.error || "Upload failed");
        return;
      }
      onChange(data.url);
      toast.success("Uploaded");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-slate-700">{label}</div>
      {value ? (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="w-24 h-24 object-cover rounded-md border border-slate-200" />
          <Button variant="outline" size="sm" onClick={() => onChange(null)}>Remove</Button>
        </div>
      ) : null}
      <input
        type="file"
        accept={ALLOWED.join(",")}
        disabled={busy}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void upload(f);
          e.target.value = "";
        }}
        className="block text-sm"
      />
      {busy ? <p className="text-xs text-slate-500">Uploading…</p> : null}
    </div>
  );
}
