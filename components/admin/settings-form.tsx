"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "./image-upload";

type SocialLink = { platform: string; url: string };

interface SettingsInput {
  logoUrl: string | null;
  siteTitle: string;
  tagline: string | null;
  whatsappNumber: string;
  whatsappMessageTemplate: string;
  footerText: string | null;
  socialLinks: SocialLink[] | null;
  metaPixelId: string | null;
  metaCapiToken: string | null;
  metaCapiTestCode: string | null;
  ga4MeasurementId: string | null;
}

export function SettingsForm({ initial }: { initial: SettingsInput }) {
  const [s, setS] = useState<SettingsInput>({
    ...initial,
    socialLinks: Array.isArray(initial.socialLinks) ? initial.socialLinks : [],
  });
  const [busy, setBusy] = useState(false);

  function set<K extends keyof SettingsInput>(k: K, v: SettingsInput[K]) {
    setS((o) => ({ ...o, [k]: v }));
  }

  async function save() {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Save failed");
        return;
      }
      toast.success("Saved");
    } finally {
      setBusy(false);
    }
  }

  function addSocial() {
    set("socialLinks", [...(s.socialLinks ?? []), { platform: "facebook", url: "" }]);
  }
  function updateSocial(i: number, patch: Partial<SocialLink>) {
    const arr = [...(s.socialLinks ?? [])];
    arr[i] = { ...arr[i], ...patch };
    set("socialLinks", arr);
  }
  function removeSocial(i: number) {
    set("socialLinks", (s.socialLinks ?? []).filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 grid gap-4 md:grid-cols-2">
          <div>
            <Label>Logo</Label>
            <ImageUpload value={s.logoUrl} onChange={(url) => set("logoUrl", url)} folder="logo" label="Logo" />
          </div>
          <div className="space-y-2">
            <Label>Site title</Label>
            <Input value={s.siteTitle} onChange={(e) => set("siteTitle", e.target.value)} />
            <Label>Tagline</Label>
            <Input value={s.tagline ?? ""} onChange={(e) => set("tagline", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Default WhatsApp number</Label>
            <Input value={s.whatsappNumber} onChange={(e) => set("whatsappNumber", e.target.value)} placeholder="92300xxxxxxx" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Default WhatsApp message template</Label>
            <Textarea
              rows={3}
              value={s.whatsappMessageTemplate}
              onChange={(e) => set("whatsappMessageTemplate", e.target.value)}
            />
            <p className="text-xs text-slate-500">
              Placeholders: <code>{"{course_name}"}</code>, <code>{"{tracking_id}"}</code>
            </p>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Footer text</Label>
            <Input value={s.footerText ?? ""} onChange={(e) => set("footerText", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Label className="block mb-3">Social links</Label>
          <div className="space-y-2">
            {(s.socialLinks ?? []).map((l, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  className="w-40"
                  placeholder="platform"
                  value={l.platform}
                  onChange={(e) => updateSocial(i, { platform: e.target.value })}
                />
                <Input placeholder="https://..." value={l.url} onChange={(e) => updateSocial(i, { url: e.target.value })} />
                <Button variant="ghost" size="sm" onClick={() => removeSocial(i)}>✕</Button>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={addSocial} className="mt-3">+ Add social link</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 grid gap-4 md:grid-cols-2">
          <h3 className="md:col-span-2 font-semibold">Meta Pixel & Conversions API</h3>
          <div>
            <Label>Meta Pixel ID</Label>
            <Input value={s.metaPixelId ?? ""} onChange={(e) => set("metaPixelId", e.target.value)} placeholder="15-16 digit ID" />
          </div>
          <div>
            <Label>CAPI access token</Label>
            <Input
              value={s.metaCapiToken ?? ""}
              onChange={(e) => set("metaCapiToken", e.target.value)}
              placeholder="EAA..."
              type="password"
            />
          </div>
          <div>
            <Label>CAPI test event code (optional)</Label>
            <Input value={s.metaCapiTestCode ?? ""} onChange={(e) => set("metaCapiTestCode", e.target.value)} placeholder="TEST12345" />
          </div>
          <div>
            <Label>Google Analytics 4 ID</Label>
            <Input value={s.ga4MeasurementId ?? ""} onChange={(e) => set("ga4MeasurementId", e.target.value)} placeholder="G-XXXXXXX" />
          </div>
        </CardContent>
      </Card>

      <div>
        <Button onClick={save} disabled={busy}>{busy ? "Saving..." : "Save settings"}</Button>
      </div>
    </div>
  );
}
