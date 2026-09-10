"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { createBrew, updateBrew } from "@/lib/brews";
import type { Brew, HopAddition, MaltBillItem, ProcessStep } from "@/lib/types";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type Draft = Omit<Brew, "id" | "createdAt" | "updatedAt">;

function emptyDraft(): Draft {
  return {
    slug: "",
    batchNumber: 1,
    title: "",
    style: "",
    status: "draft",
    brewedOn: new Date().toISOString().slice(0, 10),
    summary: "",
    description: "",
    abv: 5,
    ibu: 20,
    og: 1.05,
    fg: 1.01,
    mashTempF: 152,
    fermentationDays: 14,
    maltBill: [{ ingredient: "", amount: "" }],
    hopSchedule: [{ hop: "", timing: "" }],
    processSteps: [{ order: 1, text: "" }],
    youtubeUrl: "",
    heroImageUrl: "",
    photoUrls: [],
    createdBy: "",
  };
}

interface BrewFormProps {
  brewId?: string;
  initial?: Brew;
}

export function BrewForm({ brewId, initial }: BrewFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [draft, setDraft] = useState<Draft>(initial ?? emptyDraft());
  const [saving, setSaving] = useState(false);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function updateMalt(i: number, field: keyof MaltBillItem, value: string) {
    setDraft((d) => ({
      ...d,
      maltBill: d.maltBill.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)),
    }));
  }

  function updateHop(i: number, field: keyof HopAddition, value: string) {
    setDraft((d) => ({
      ...d,
      hopSchedule: d.hopSchedule.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)),
    }));
  }

  function updateStep(i: number, value: string) {
    setDraft((d) => ({
      ...d,
      processSteps: d.processSteps.map((step, idx) => (idx === i ? { ...step, text: value } : step)),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const slug = draft.slug.trim() || slugify(draft.title);
    const cleaned: Draft = {
      ...draft,
      slug,
      maltBill: draft.maltBill.filter((m) => m.ingredient.trim()),
      hopSchedule: draft.hopSchedule.filter((h) => h.hop.trim()),
      processSteps: draft.processSteps
        .filter((s) => s.text.trim())
        .map((s, idx) => ({ order: idx + 1, text: s.text })),
      createdBy: draft.createdBy || user?.uid || "",
    };
    try {
      if (brewId) {
        await updateBrew(brewId, cleaned);
      } else {
        await createBrew(cleaned);
      }
      router.push("/admin/brews");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field-row">
        <div className="field">
          <label htmlFor="title">Title</label>
          <input id="title" value={draft.title} onChange={(e) => set("title", e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="style">Style</label>
          <input id="style" value={draft.style} onChange={(e) => set("style", e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="batchNumber">Batch #</label>
          <input
            id="batchNumber"
            type="number"
            value={draft.batchNumber}
            onChange={(e) => set("batchNumber", Number(e.target.value))}
            required
          />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="brewedOn">Brewed on</label>
          <input
            id="brewedOn"
            type="date"
            value={draft.brewedOn}
            onChange={(e) => set("brewedOn", e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="status">Status</label>
          <select id="status" value={draft.status} onChange={(e) => set("status", e.target.value as Draft["status"])}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="slug">URL slug</label>
          <input id="slug" placeholder="auto from title" value={draft.slug} onChange={(e) => set("slug", e.target.value)} />
        </div>
      </div>

      <div className="field">
        <label htmlFor="summary">One-line summary (shown on cards)</label>
        <input id="summary" value={draft.summary} onChange={(e) => set("summary", e.target.value)} maxLength={140} required />
      </div>

      <div className="field">
        <label htmlFor="description">Full description</label>
        <textarea id="description" value={draft.description} onChange={(e) => set("description", e.target.value)} required />
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="abv">ABV %</label>
          <input id="abv" type="number" step="0.1" value={draft.abv} onChange={(e) => set("abv", Number(e.target.value))} />
        </div>
        <div className="field">
          <label htmlFor="ibu">IBU</label>
          <input id="ibu" type="number" value={draft.ibu} onChange={(e) => set("ibu", Number(e.target.value))} />
        </div>
        <div className="field">
          <label htmlFor="og">OG</label>
          <input id="og" type="number" step="0.001" value={draft.og} onChange={(e) => set("og", Number(e.target.value))} />
        </div>
        <div className="field">
          <label htmlFor="fg">FG</label>
          <input id="fg" type="number" step="0.001" value={draft.fg} onChange={(e) => set("fg", Number(e.target.value))} />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="mashTempF">Mash temp °F</label>
          <input
            id="mashTempF"
            type="number"
            value={draft.mashTempF ?? ""}
            onChange={(e) => set("mashTempF", Number(e.target.value))}
          />
        </div>
        <div className="field">
          <label htmlFor="fermentationDays">Fermentation days</label>
          <input
            id="fermentationDays"
            type="number"
            value={draft.fermentationDays ?? ""}
            onChange={(e) => set("fermentationDays", Number(e.target.value))}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="heroImageUrl">Hero image URL</label>
        <input id="heroImageUrl" value={draft.heroImageUrl ?? ""} onChange={(e) => set("heroImageUrl", e.target.value)} placeholder="https://…" />
      </div>

      <div className="field">
        <label htmlFor="youtubeUrl">Brew-day YouTube URL</label>
        <input id="youtubeUrl" value={draft.youtubeUrl ?? ""} onChange={(e) => set("youtubeUrl", e.target.value)} placeholder="https://youtu.be/…" />
      </div>

      <div className="field">
        <label>Malt &amp; grain bill</label>
        {draft.maltBill.map((item, i) => (
          <div className="repeat-row" key={i}>
            <input placeholder="Ingredient" value={item.ingredient} onChange={(e) => updateMalt(i, "ingredient", e.target.value)} />
            <input placeholder="Amount" value={item.amount} onChange={(e) => updateMalt(i, "amount", e.target.value)} />
            <button type="button" className="icon-btn" onClick={() => set("maltBill", draft.maltBill.filter((_, idx) => idx !== i))}>
              ×
            </button>
          </div>
        ))}
        <button type="button" className="btn" style={{ marginTop: 8 }} onClick={() => set("maltBill", [...draft.maltBill, { ingredient: "", amount: "" }])}>
          + Add ingredient
        </button>
      </div>

      <div className="field">
        <label>Hop schedule</label>
        {draft.hopSchedule.map((item, i) => (
          <div className="repeat-row" key={i}>
            <input placeholder="Hop" value={item.hop} onChange={(e) => updateHop(i, "hop", e.target.value)} />
            <input placeholder="Timing (e.g. 60 min)" value={item.timing} onChange={(e) => updateHop(i, "timing", e.target.value)} />
            <button type="button" className="icon-btn" onClick={() => set("hopSchedule", draft.hopSchedule.filter((_, idx) => idx !== i))}>
              ×
            </button>
          </div>
        ))}
        <button type="button" className="btn" style={{ marginTop: 8 }} onClick={() => set("hopSchedule", [...draft.hopSchedule, { hop: "", timing: "" }])}>
          + Add hop addition
        </button>
      </div>

      <div className="field">
        <label>Brew-day process steps</label>
        {draft.processSteps.map((step, i) => (
          <div className="repeat-row" style={{ gridTemplateColumns: "1fr auto" }} key={i}>
            <input placeholder={`Step ${i + 1}`} value={step.text} onChange={(e) => updateStep(i, e.target.value)} />
            <button type="button" className="icon-btn" onClick={() => set("processSteps", draft.processSteps.filter((_, idx) => idx !== i))}>
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn"
          style={{ marginTop: 8 }}
          onClick={() => set("processSteps", [...draft.processSteps, { order: draft.processSteps.length + 1, text: "" }])}
        >
          + Add step
        </button>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 26 }}>
        <button className="btn primary" type="submit" disabled={saving}>
          {saving ? "Saving…" : brewId ? "Save changes" : "Create batch"}
        </button>
      </div>
    </form>
  );
}
