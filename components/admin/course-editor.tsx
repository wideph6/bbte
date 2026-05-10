"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "./image-upload";
import { SortableList } from "./sortable-list";
import { cn, slugify } from "@/lib/utils";

type Anything = Record<string, unknown>;
type AnyCourse = Anything;
type AnyInstructor = Anything;

const TABS = [
  { id: "basic", label: "Basic Info" },
  { id: "labels", label: "Section Labels" },
  { id: "for-you", label: "For You If" },
  { id: "not-for-you", label: "Not For You If" },
  { id: "learn", label: "What You'll Learn" },
  { id: "details", label: "Course Details" },
  { id: "instructor", label: "Instructor" },
  { id: "testimonials", label: "Testimonials" },
  { id: "faqs", label: "FAQs" },
  { id: "cta", label: "CTA" },
  { id: "whatsapp", label: "WhatsApp" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function CourseEditor({
  course,
  instructors,
}: {
  course: AnyCourse;
  instructors: AnyInstructor[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("basic");

  function refresh() {
    router.refresh();
  }

  async function patchCourse(patch: Anything, successMsg = "Saved") {
    const res = await fetch(`/api/admin/courses/${(course as any).id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "Save failed");
      return false;
    }
    toast.success(successMsg);
    refresh();
    return true;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold">{(course as any).title}</h1>
            <Badge variant={(course as any).status === "active" ? "success" : "muted"}>
              {(course as any).status}
            </Badge>
          </div>
          <a
            href={`/course/${(course as any).slug}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-brand hover:underline"
          >
            /course/{(course as any).slug} ↗
          </a>
        </div>
      </div>

      <div className="border-b border-slate-200 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 -mb-px",
                tab === t.id ? "border-brand text-brand" : "border-transparent text-slate-500 hover:text-slate-800"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {tab === "basic" && <BasicTab course={course} onPatch={patchCourse} />}
          {tab === "labels" && <LabelsTab course={course} onPatch={patchCourse} />}
          {tab === "for-you" && <PointsTab kind="forYouPoints" courseId={(course as any).id} initial={(course as any).forYouPoints} onChange={refresh} />}
          {tab === "not-for-you" && <PointsTab kind="notForYouPoints" courseId={(course as any).id} initial={(course as any).notForYouPoints} onChange={refresh} />}
          {tab === "learn" && <PointsTab kind="learningPoints" courseId={(course as any).id} initial={(course as any).learningPoints} onChange={refresh} />}
          {tab === "details" && <DetailsTab courseId={(course as any).id} initial={(course as any).detailFields} onChange={refresh} />}
          {tab === "instructor" && <InstructorTab course={course} instructors={instructors} onPatch={patchCourse} onChange={refresh} />}
          {tab === "testimonials" && <TestimonialsTab courseId={(course as any).id} initial={(course as any).testimonials} onChange={refresh} />}
          {tab === "faqs" && <FaqsTab courseId={(course as any).id} initial={(course as any).faqs} onChange={refresh} />}
          {tab === "cta" && <CtaTab course={course} onPatch={patchCourse} />}
          {tab === "whatsapp" && <WhatsAppTab course={course} onPatch={patchCourse} />}
        </CardContent>
      </Card>
    </div>
  );
}

/* -------- Basic Info -------- */

function BasicTab({ course, onPatch }: { course: AnyCourse; onPatch: (p: Anything) => Promise<boolean> }) {
  const c = course as any;
  const [title, setTitle] = useState(c.title);
  const [slug, setSlug] = useState(c.slug);
  const [subHeadline, setSubHeadline] = useState(c.subHeadline ?? "");
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(c.heroImageUrl ?? null);
  const [status, setStatus] = useState(c.status);
  const [seoTitle, setSeoTitle] = useState(c.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(c.seoDescription ?? "");
  const [ogImageUrl, setOgImageUrl] = useState<string | null>(c.ogImageUrl ?? null);
  const [busy, setBusy] = useTransitionFlag();

  async function save() {
    setBusy(async () => {
      await onPatch({ title, slug, subHeadline, heroImageUrl, status, seoTitle, seoDescription, ogImageUrl });
    });
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="Title">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <Field label="Slug">
        <Input value={slug} onChange={(e) => setSlug(slugify(e.target.value))} />
      </Field>
      <Field label="Sub-headline" full>
        <Input value={subHeadline} onChange={(e) => setSubHeadline(e.target.value)} />
      </Field>
      <Field label="Status">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
        >
          <option value="draft">Draft</option>
          <option value="active">Active</option>
        </select>
      </Field>
      <Field label="Hero image">
        <ImageUpload value={heroImageUrl} onChange={setHeroImageUrl} folder="courses" label="Hero image" />
      </Field>
      <Field label="OG image (social sharing)">
        <ImageUpload value={ogImageUrl} onChange={setOgImageUrl} folder="og" label="OG image" />
      </Field>
      <Field label="SEO Title" full>
        <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
      </Field>
      <Field label="SEO Description" full>
        <Textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} rows={3} />
      </Field>
      <div className="md:col-span-2">
        <Button onClick={save} disabled={busy}>{busy ? "Saving..." : "Save Basic Info"}</Button>
      </div>
    </div>
  );
}

/* -------- Section Labels -------- */

function LabelsTab({ course, onPatch }: { course: AnyCourse; onPatch: (p: Anything) => Promise<boolean> }) {
  const c = course as any;
  const initial = {
    labelForYou: c.labelForYou,
    labelNotForYou: c.labelNotForYou,
    labelLearn: c.labelLearn,
    labelDetails: c.labelDetails,
    labelInstructor: c.labelInstructor,
    labelTestimonials: c.labelTestimonials,
    labelFaqs: c.labelFaqs,
    labelFinalCta: c.labelFinalCta,
    showForYou: c.showForYou,
    showNotForYou: c.showNotForYou,
    showLearn: c.showLearn,
    showDetails: c.showDetails,
    showInstructor: c.showInstructor,
    showTestimonials: c.showTestimonials,
    showFaqs: c.showFaqs,
  };
  const [state, setState] = useState(initial);
  const [busy, setBusy] = useTransitionFlag();

  const rows: Array<{ key: keyof typeof initial; toggle: keyof typeof initial; title: string }> = [
    { key: "labelForYou", toggle: "showForYou", title: "For You section" },
    { key: "labelNotForYou", toggle: "showNotForYou", title: "Not For You section" },
    { key: "labelLearn", toggle: "showLearn", title: "What You'll Learn section" },
    { key: "labelDetails", toggle: "showDetails", title: "Details section" },
    { key: "labelInstructor", toggle: "showInstructor", title: "Instructor section" },
    { key: "labelTestimonials", toggle: "showTestimonials", title: "Testimonials section" },
    { key: "labelFaqs", toggle: "showFaqs", title: "FAQs section" },
    { key: "labelFinalCta", toggle: "showForYou" /* CTA always visible */, title: "Final CTA heading" },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">Labels are rendered on the public course page. Toggle visibility per section.</p>
      <div className="space-y-3">
        {rows.map(({ key, toggle, title }) => (
          <div key={key} className="grid sm:grid-cols-[1fr_auto] gap-3 items-end border-b border-slate-100 pb-3">
            <div>
              <Label className="block mb-1 text-xs text-slate-500">{title}</Label>
              <Input
                value={state[key] as string}
                onChange={(e) => setState((s) => ({ ...s, [key]: e.target.value }))}
              />
            </div>
            {key !== "labelFinalCta" ? (
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={state[toggle] as boolean}
                  onChange={(e) => setState((s) => ({ ...s, [toggle]: e.target.checked }))}
                />
                Visible
              </label>
            ) : null}
          </div>
        ))}
      </div>
      <Button onClick={() => setBusy(() => onPatch(state))} disabled={busy}>
        {busy ? "Saving..." : "Save Labels"}
      </Button>
    </div>
  );
}

/* -------- Generic point list (For You / Not For You / Learn) -------- */

function PointsTab({
  kind,
  courseId,
  initial,
  onChange,
}: {
  kind: "forYouPoints" | "notForYouPoints" | "learningPoints";
  courseId: string;
  initial: Array<{ id: string; text: string }>;
  onChange: () => void;
}) {
  const [items, setItems] = useState(initial);
  const [draft, setDraft] = useState("");

  async function add() {
    if (!draft.trim()) return;
    const res = await fetch(`/api/admin/courses/${courseId}/${kind}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: draft.trim() }),
    });
    if (!res.ok) return toast.error("Add failed");
    setDraft("");
    onChange();
    const data = await res.json();
    setItems((arr) => [...arr, data]);
  }

  async function update(id: string, text: string) {
    const res = await fetch(`/api/admin/courses/${courseId}/${kind}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) toast.error("Save failed");
    else onChange();
  }

  async function remove(id: string) {
    setItems((arr) => arr.filter((i) => i.id !== id));
    const res = await fetch(`/api/admin/courses/${courseId}/${kind}/${id}`, { method: "DELETE" });
    if (!res.ok) toast.error("Delete failed");
    else onChange();
  }

  async function reorder(ids: string[]) {
    setItems((arr) => ids.map((id) => arr.find((i) => i.id === id)!).filter(Boolean));
    const res = await fetch(`/api/admin/courses/${courseId}/${kind}/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) toast.error("Reorder failed");
    else onChange();
  }

  return (
    <div className="space-y-4">
      <SortableList
        items={items}
        onReorder={reorder}
        onDelete={remove}
        renderItem={(it) => (
          <Input
            defaultValue={it.text}
            onBlur={(e) => update(it.id, e.target.value)}
            placeholder="Type a bullet point in Urdu / Roman Urdu"
          />
        )}
      />
      <div className="flex gap-2">
        <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add a new point" />
        <Button type="button" onClick={add}>Add</Button>
      </div>
    </div>
  );
}

/* -------- Details (label/value pairs) -------- */

function DetailsTab({
  courseId,
  initial,
  onChange,
}: {
  courseId: string;
  initial: Array<{ id: string; label: string; value: string; isPrice: boolean }>;
  onChange: () => void;
}) {
  const [items, setItems] = useState(initial);

  async function add() {
    const res = await fetch(`/api/admin/courses/${courseId}/detailFields`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: "Label", value: "Value" }),
    });
    if (!res.ok) return toast.error("Add failed");
    const data = await res.json();
    setItems((a) => [...a, data]);
    onChange();
  }

  async function update(id: string, patch: Anything) {
    const res = await fetch(`/api/admin/courses/${courseId}/detailFields/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) toast.error("Save failed");
    else onChange();
  }

  async function remove(id: string) {
    setItems((a) => a.filter((i) => i.id !== id));
    await fetch(`/api/admin/courses/${courseId}/detailFields/${id}`, { method: "DELETE" });
    onChange();
  }

  async function reorder(ids: string[]) {
    setItems((arr) => ids.map((id) => arr.find((i) => i.id === id)!).filter(Boolean));
    await fetch(`/api/admin/courses/${courseId}/detailFields/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    onChange();
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">
        Mark exactly one row as "Is price" — it will be shown larger and used for revenue calculation.
      </p>
      <SortableList
        items={items}
        onReorder={reorder}
        onDelete={remove}
        renderItem={(it) => (
          <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <Input
              defaultValue={it.label}
              onBlur={(e) => update(it.id, { label: e.target.value })}
              placeholder="Label (e.g., Qeemat)"
            />
            <Input
              defaultValue={it.value}
              onBlur={(e) => update(it.id, { value: e.target.value })}
              placeholder="Value (e.g., PKR 4,999)"
            />
            <label className="inline-flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                defaultChecked={it.isPrice}
                onChange={(e) => update(it.id, { isPrice: e.target.checked })}
              />
              Is price
            </label>
          </div>
        )}
      />
      <Button type="button" onClick={add}>+ Add field</Button>
    </div>
  );
}

/* -------- Instructor -------- */

function InstructorTab({
  course,
  instructors,
  onPatch,
  onChange,
}: {
  course: AnyCourse;
  instructors: AnyInstructor[];
  onPatch: (p: Anything) => Promise<boolean>;
  onChange: () => void;
}) {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [busy, setBusy] = useTransitionFlag();

  async function createInline() {
    if (!name.trim()) return;
    const res = await fetch("/api/admin/instructors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), bio: bio.trim() }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return toast.error(data.error || "Create failed");
    await onPatch({ instructorId: data.id });
    onChange();
  }

  return (
    <div className="space-y-6">
      <div>
        <Label className="block mb-1 text-xs text-slate-500">Existing instructor</Label>
        <select
          value={(course as any).instructorId ?? ""}
          onChange={(e) =>
            setBusy(() =>
              onPatch({ instructorId: e.target.value === "" ? null : e.target.value })
            )
          }
          className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
          disabled={busy}
        >
          <option value="">— None —</option>
          {(instructors as any[]).map((i) => (
            <option key={i.id} value={i.id}>{i.name}</option>
          ))}
        </select>
        <p className="text-xs text-slate-500 mt-1">
          Manage the global instructor library at <a className="text-brand hover:underline" href="/admin/instructors">Instructors</a>.
        </p>
      </div>
      <div className="border-t border-slate-200 pt-6">
        <p className="text-sm font-medium mb-2">Or create a new instructor inline</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Button onClick={createInline}>Create + assign</Button>
          <Textarea
            className="sm:col-span-2"
            placeholder="Short bio"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

/* -------- Testimonials -------- */

function TestimonialsTab({
  courseId,
  initial,
  onChange,
}: {
  courseId: string;
  initial: Array<{ id: string; name: string; text: string; rating: number | null; photoUrl: string | null }>;
  onChange: () => void;
}) {
  const [items, setItems] = useState(initial);

  async function add() {
    const res = await fetch(`/api/admin/courses/${courseId}/testimonials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Name", text: "Testimonial text", rating: 5 }),
    });
    if (!res.ok) return toast.error("Add failed");
    const data = await res.json();
    setItems((a) => [...a, data]);
    onChange();
  }
  async function update(id: string, patch: Anything) {
    await fetch(`/api/admin/courses/${courseId}/testimonials/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    onChange();
  }
  async function remove(id: string) {
    setItems((a) => a.filter((i) => i.id !== id));
    await fetch(`/api/admin/courses/${courseId}/testimonials/${id}`, { method: "DELETE" });
    onChange();
  }
  async function reorder(ids: string[]) {
    setItems((arr) => ids.map((id) => arr.find((i) => i.id === id)!).filter(Boolean));
    await fetch(`/api/admin/courses/${courseId}/testimonials/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    onChange();
  }

  return (
    <div className="space-y-4">
      <SortableList
        items={items}
        onReorder={reorder}
        onDelete={remove}
        renderItem={(it) => (
          <div className="grid gap-2 sm:grid-cols-2">
            <Input defaultValue={it.name} onBlur={(e) => update(it.id, { name: e.target.value })} placeholder="Name" />
            <Input
              type="number"
              min={0}
              max={5}
              defaultValue={it.rating ?? ""}
              onBlur={(e) => update(it.id, { rating: e.target.value === "" ? null : Number(e.target.value) })}
              placeholder="Rating (0-5)"
            />
            <Textarea
              className="sm:col-span-2"
              defaultValue={it.text}
              onBlur={(e) => update(it.id, { text: e.target.value })}
              placeholder="Testimonial text"
              rows={3}
            />
            <div className="sm:col-span-2">
              <ImageUpload
                value={it.photoUrl}
                onChange={(url) => update(it.id, { photoUrl: url })}
                folder="testimonials"
                label="Photo (optional)"
              />
            </div>
          </div>
        )}
      />
      <Button type="button" onClick={add}>+ Add testimonial</Button>
    </div>
  );
}

/* -------- FAQs -------- */

function FaqsTab({
  courseId,
  initial,
  onChange,
}: {
  courseId: string;
  initial: Array<{ id: string; question: string; answer: string }>;
  onChange: () => void;
}) {
  const [items, setItems] = useState(initial);

  async function add() {
    const res = await fetch(`/api/admin/courses/${courseId}/faqs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "Question?", answer: "Answer" }),
    });
    if (!res.ok) return toast.error("Add failed");
    const data = await res.json();
    setItems((a) => [...a, data]);
    onChange();
  }
  async function update(id: string, patch: Anything) {
    await fetch(`/api/admin/courses/${courseId}/faqs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    onChange();
  }
  async function remove(id: string) {
    setItems((a) => a.filter((i) => i.id !== id));
    await fetch(`/api/admin/courses/${courseId}/faqs/${id}`, { method: "DELETE" });
    onChange();
  }
  async function reorder(ids: string[]) {
    setItems((arr) => ids.map((id) => arr.find((i) => i.id === id)!).filter(Boolean));
    await fetch(`/api/admin/courses/${courseId}/faqs/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    onChange();
  }

  return (
    <div className="space-y-4">
      <SortableList
        items={items}
        onReorder={reorder}
        onDelete={remove}
        renderItem={(it) => (
          <div className="space-y-2">
            <Input defaultValue={it.question} onBlur={(e) => update(it.id, { question: e.target.value })} placeholder="Question" />
            <Textarea defaultValue={it.answer} onBlur={(e) => update(it.id, { answer: e.target.value })} placeholder="Answer" rows={3} />
          </div>
        )}
      />
      <Button type="button" onClick={add}>+ Add FAQ</Button>
    </div>
  );
}

/* -------- CTA -------- */

function CtaTab({ course, onPatch }: { course: AnyCourse; onPatch: (p: Anything) => Promise<boolean> }) {
  const c = course as any;
  const [ctaHeading, setCtaHeading] = useState(c.ctaHeading ?? "");
  const [ctaSubtext, setCtaSubtext] = useState(c.ctaSubtext ?? "");
  const [ctaButtonLabel, setCtaButtonLabel] = useState(c.ctaButtonLabel ?? "WhatsApp Par Rabta Karein");
  const [busy, setBusy] = useTransitionFlag();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="Final CTA heading" full>
        <Input value={ctaHeading} onChange={(e) => setCtaHeading(e.target.value)} />
      </Field>
      <Field label="Final CTA sub-text" full>
        <Textarea value={ctaSubtext} onChange={(e) => setCtaSubtext(e.target.value)} rows={2} />
      </Field>
      <Field label="Button label">
        <Input value={ctaButtonLabel} onChange={(e) => setCtaButtonLabel(e.target.value)} />
      </Field>
      <div className="md:col-span-2">
        <Button onClick={() => setBusy(() => onPatch({ ctaHeading, ctaSubtext, ctaButtonLabel }))} disabled={busy}>
          {busy ? "Saving..." : "Save CTA"}
        </Button>
      </div>
    </div>
  );
}

/* -------- WhatsApp overrides -------- */

function WhatsAppTab({ course, onPatch }: { course: AnyCourse; onPatch: (p: Anything) => Promise<boolean> }) {
  const c = course as any;
  const [whatsappNumber, setWhatsappNumber] = useState(c.whatsappNumber ?? "");
  const [whatsappTemplate, setWhatsappTemplate] = useState(c.whatsappTemplate ?? "");
  const [busy, setBusy] = useTransitionFlag();

  return (
    <div className="grid gap-4">
      <Field label="WhatsApp number override (leave blank to use global)" full>
        <Input value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="92300xxxxxxx" />
      </Field>
      <Field label="Message template override (leave blank to use global)" full>
        <Textarea
          value={whatsappTemplate}
          onChange={(e) => setWhatsappTemplate(e.target.value)}
          placeholder='Salam, mujhe "{course_name}" course ke baare mein maloomat chahiye. Ref: {tracking_id}'
          rows={3}
        />
        <p className="text-xs text-slate-500 mt-1">
          Available placeholders: <code>{"{course_name}"}</code>, <code>{"{tracking_id}"}</code>
        </p>
      </Field>
      <div>
        <Button
          onClick={() =>
            setBusy(() =>
              onPatch({
                whatsappNumber: whatsappNumber.trim() || null,
                whatsappTemplate: whatsappTemplate.trim() || null,
              })
            )
          }
          disabled={busy}
        >
          {busy ? "Saving..." : "Save WhatsApp Override"}
        </Button>
      </div>
    </div>
  );
}

/* -------- Helpers -------- */

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={cn("space-y-2", full ? "md:col-span-2" : "")}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function useTransitionFlag(): [boolean, (cb: () => void | Promise<unknown>) => void] {
  const [busy, setBusy] = useState(false);
  return [
    busy,
    async (cb) => {
      setBusy(true);
      try {
        await cb();
      } finally {
        setBusy(false);
      }
    },
  ];
}
