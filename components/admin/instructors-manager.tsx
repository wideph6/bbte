"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "./image-upload";

type Instructor = {
  id: string;
  name: string;
  photoUrl: string | null;
  bio: string;
  credibilityPoints: string[] | null;
};

export function InstructorsManager({ initial }: { initial: Instructor[] }) {
  const router = useRouter();
  const [items, setItems] = useState<Instructor[]>(initial);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function add() {
    if (!name.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/instructors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Create failed");
        return;
      }
      setItems((arr) => [data, ...arr]);
      setName("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function update(id: string, patch: Partial<Instructor>) {
    setItems((arr) => arr.map((i) => (i.id === id ? { ...i, ...patch } as Instructor : i)));
    const res = await fetch(`/api/admin/instructors/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) toast.error("Save failed");
  }

  async function remove(id: string) {
    if (!confirm("Delete this instructor? They will be unlinked from any courses.")) return;
    setItems((arr) => arr.filter((i) => i.id !== id));
    const res = await fetch(`/api/admin/instructors/${id}`, { method: "DELETE" });
    if (!res.ok) toast.error("Delete failed");
    else router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 flex gap-2 items-end">
          <div className="flex-1">
            <Label>Add new instructor</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ustad Muhammad Ali" />
          </div>
          <Button onClick={add} disabled={busy || !name.trim()}>{busy ? "Creating..." : "Create"}</Button>
        </CardContent>
      </Card>

      {items.length === 0 ? (
        <p className="text-slate-500 text-sm">No instructors yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((it) => (
            <Card key={it.id}>
              <CardContent className="pt-6 space-y-3">
                <Label>Name</Label>
                <Input defaultValue={it.name} onBlur={(e) => update(it.id, { name: e.target.value })} />
                <Label>Photo</Label>
                <ImageUpload
                  value={it.photoUrl}
                  onChange={(url) => update(it.id, { photoUrl: url })}
                  folder="instructors"
                  label="Photo"
                />
                <Label>Bio</Label>
                <Textarea
                  defaultValue={it.bio}
                  onBlur={(e) => update(it.id, { bio: e.target.value })}
                  rows={5}
                  placeholder="Multi-paragraph bio (use blank lines between paragraphs)"
                />
                <Label>Credibility points (one per line)</Label>
                <Textarea
                  defaultValue={Array.isArray(it.credibilityPoints) ? it.credibilityPoints.join("\n") : ""}
                  onBlur={(e) =>
                    update(it.id, {
                      credibilityPoints: e.target.value
                        .split("\n")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  rows={4}
                />
                <div className="flex justify-end">
                  <Button variant="destructive" size="sm" onClick={() => remove(it.id)}>Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
