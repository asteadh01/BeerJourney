"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { createBrew, updateBrew } from "@/lib/brews";
import { ImageUpload } from "./ImageUpload";
import { MultiImageUpload } from "./MultiImageUpload";
import { BEER_STYLE_GROUPS, BEER_STYLES, OTHER_STYLE } from "@/lib/beerStyles";
import type { Brew, WeightUnit } from "@/lib/types";

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
    mashTempC: 67,
    fermentationDays: 14,
    maltBill: [{ amount: "", unit: "kg", ingredient: "" }],
    hopSchedule: [{ amount: "", unit: "g", hop: "" }],
    processSteps: [{ order: 1, text: "" }],
    youtubeUrl: "",
    heroImageUrl: "",
    photoUrls: [],
    createdBy: "",
    recipeGroupId: "",
    previousBatchId: "",
  };
}

// ABV ≈ (OG − FG) × 131.25 — the standard homebrewer approximation.
function estimateAbv(og: number, fg: number): number {
  return Math.round((og - fg) * 131.25 * 10) / 10;
}

interface BrewFormProps {
  brewId?: string;
  initial?: Draft;
}

export function BrewForm({ brewId, initial }: BrewFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [draft, setDraft] = useState<Draft>(initial ?? emptyDraft());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [useCustomStyle, setUseCustomStyle] = useState(() => Boolean(draft.style) && !BEER_STYLES.includes(draft.style));

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function updateMalt(i: number, field: "ingredient" | "amount", value: string) {
    setDraft((d) => ({
      ...d,
      maltBill: d.maltBill.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)),
    }));
  }

  function updateMaltUnit(i: number, unit: WeightUnit) {
    setDraft((d) => ({
      ...d,
      maltBill: d.maltBill.map((item, idx) => (idx === i ? { ...item, unit } : item)),
    }));
  }

  function updateHop(i: number, field: "hop" | "amount", value: string) {
    setDraft((d) => ({
      ...d,
      hopSchedule: d.hopSchedule.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)),
    }));
  }

  function updateHopUnit(i: number, unit: WeightUnit) {
    setDraft((d) => ({
      ...d,
      hopSchedule: d.hopSchedule.map((item, idx) => (idx === i ? { ...item, unit } : item)),
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
    setError("");
    const maltIncomplete = draft.maltBill.some((m) => String(m.amount).trim() !== "" && !m.ingredient.trim());
    const hopIncomplete = draft.hopSchedule.some((h) => String(h.amount).trim() !== "" && !h.hop.trim());
    if (maltIncomplete || hopIncomplete) {
      setError("Completá el nombre de todos los ingredientes o eliminá las filas vacías.");
      setSaving(false);
      return;
    }
    const cleaned: Draft = {
      ...draft,
      slug: slugify(draft.title),
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la cocción.");
    } finally {
      setSaving(false);
    }
  }

  const isNewRecipe = !brewId && !draft.previousBatchId;
  const recipeGroupId = draft.recipeGroupId || draft.previousBatchId || brewId;

  return (
    <form onSubmit={handleSubmit}>
      {draft.previousBatchId && !brewId && (
        <p style={{ color: "var(--ink-dim)", marginTop: 0 }}>
          Precargado desde la cocción №{String(draft.batchNumber - 1).padStart(3, "0")}. Ajustá lo que haya cambiado
          (proporciones de ingredientes, etc.) antes de guardar.
        </p>
      )}

      {isNewRecipe ? (
        <>
          <div className="field-row">
            <div className="field">
              <label htmlFor="title">Título</label>
              <input id="title" value={draft.title} onChange={(e) => set("title", e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="style">Estilo</label>
              <select
                id="style"
                value={useCustomStyle ? OTHER_STYLE : draft.style}
                onChange={(e) => {
                  if (e.target.value === OTHER_STYLE) {
                    setUseCustomStyle(true);
                  } else {
                    setUseCustomStyle(false);
                    set("style", e.target.value);
                  }
                }}
                required
              >
                <option value="" disabled>
                  Elegí un estilo…
                </option>
                {BEER_STYLE_GROUPS.map((g) => (
                  <optgroup key={g.group} label={g.group}>
                    {g.styles.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </optgroup>
                ))}
                <option value={OTHER_STYLE}>{OTHER_STYLE}</option>
              </select>
              {useCustomStyle && (
                <input
                  style={{ marginTop: 8 }}
                  placeholder="Nombre del estilo"
                  value={draft.style}
                  onChange={(e) => set("style", e.target.value)}
                  required
                />
              )}
            </div>
          </div>

          <div className="field">
            <label htmlFor="summary">Resumen breve (se muestra en las tarjetas)</label>
            <input id="summary" value={draft.summary} onChange={(e) => set("summary", e.target.value)} maxLength={140} required />
          </div>

          <div className="field">
            <label htmlFor="description">Descripción completa</label>
            <textarea id="description" value={draft.description} onChange={(e) => set("description", e.target.value)} required />
          </div>

          <div className="field">
            <label>Imagen principal</label>
            <p className="field-hint">Se muestra en todas las páginas de esta receta (listado, tarjetas y detalle).</p>
            <ImageUpload value={draft.heroImageUrl ?? ""} onChange={(url) => set("heroImageUrl", url)} />
          </div>
        </>
      ) : (
        <p style={{ color: "var(--ink-dim)", marginTop: 0 }}>
          <strong style={{ color: "var(--ink)" }}>{draft.title}</strong> · {draft.style}. El título, estilo, resumen y
          descripción son de la receta —{" "}
          <Link href={`/admin/brews/recipe/edit?groupId=${recipeGroupId}`}>editalos acá</Link>.
        </p>
      )}

      <div className="field-row">
        <div className="field">
          <label htmlFor="batchNumber">N.º de cocción</label>
          <input
            id="batchNumber"
            type="number"
            value={draft.batchNumber}
            onChange={(e) => set("batchNumber", Number(e.target.value))}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="brewedOn">Fecha de cocción</label>
          <input id="brewedOn" type="date" value={draft.brewedOn} onChange={(e) => set("brewedOn", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="status">Estado</label>
          <select id="status" value={draft.status} onChange={(e) => set("status", e.target.value as Draft["status"])}>
            <option value="draft">Borrador</option>
            <option value="published">Publicada</option>
          </select>
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="abv">ABV % (alcohol por volumen)</label>
          <div className="repeat-row" style={{ gridTemplateColumns: "1fr auto" }}>
            <input id="abv" type="number" step="0.1" value={draft.abv} onChange={(e) => set("abv", Number(e.target.value))} />
            <button type="button" className="btn" onClick={() => set("abv", estimateAbv(draft.og, draft.fg))}>
              Calcular
            </button>
          </div>
          <p className="field-hint">ABV ≈ (Densidad inicial − Densidad final) × 131,25</p>
        </div>
        <div className="field">
          <label htmlFor="ibu">IBU (amargor)</label>
          <input id="ibu" type="number" value={draft.ibu} onChange={(e) => set("ibu", Number(e.target.value))} />
          <p className="field-hint">
            Según fórmula de Tinseth: gramos de α-ácido de cada lúpulo × % de utilización según tiempo de hervor y
            densidad del mosto.
          </p>
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="og">Densidad inicial (OG)</label>
          <input id="og" type="number" step="0.001" value={draft.og} onChange={(e) => set("og", Number(e.target.value))} />
        </div>
        <div className="field">
          <label htmlFor="fg">Densidad final (FG)</label>
          <input id="fg" type="number" step="0.001" value={draft.fg} onChange={(e) => set("fg", Number(e.target.value))} />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="mashTempC">Temperatura de maceración (°C)</label>
          <input
            id="mashTempC"
            type="number"
            value={draft.mashTempC ?? ""}
            onChange={(e) => set("mashTempC", Number(e.target.value))}
          />
        </div>
        <div className="field">
          <label htmlFor="fermentationDays">Días de fermentación</label>
          <input
            id="fermentationDays"
            type="number"
            value={draft.fermentationDays ?? ""}
            onChange={(e) => set("fermentationDays", Number(e.target.value))}
          />
        </div>
      </div>

      <div className="field">
        <label>Fotos de este batch</label>
        <p className="field-hint">Imágenes propias de esta cocción (además de la imagen principal de la receta).</p>
        <MultiImageUpload value={draft.photoUrls} onChange={(urls) => set("photoUrls", urls)} />
      </div>

      <div className="field">
        <label htmlFor="youtubeUrl">URL de YouTube del día de cocción</label>
        <input id="youtubeUrl" value={draft.youtubeUrl ?? ""} onChange={(e) => set("youtubeUrl", e.target.value)} placeholder="https://youtu.be/…" />
      </div>

      <div className="field">
        <label>Maltas y granos</label>
        <p className="field-hint">Cantidad por defecto en kilogramos (kg). Cambiá la unidad a gramos (g) si hace falta.</p>
        {draft.maltBill.map((item, i) => (
          <div className="repeat-row" style={{ gridTemplateColumns: "90px 70px 1fr auto" }} key={i}>
            <input
              type="number"
              step="0.01"
              placeholder="Cantidad"
              value={item.amount}
              onChange={(e) => updateMalt(i, "amount", e.target.value)}
            />
            <select value={item.unit} onChange={(e) => updateMaltUnit(i, e.target.value as WeightUnit)}>
              <option value="kg">kg</option>
              <option value="g">g</option>
            </select>
            <input placeholder="Ingrediente" value={item.ingredient} onChange={(e) => updateMalt(i, "ingredient", e.target.value)} />
            <button type="button" className="icon-btn" onClick={() => set("maltBill", draft.maltBill.filter((_, idx) => idx !== i))}>
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn"
          style={{ marginTop: 8 }}
          onClick={() => set("maltBill", [...draft.maltBill, { amount: "", unit: "kg", ingredient: "" }])}
        >
          + Agregar ingrediente
        </button>
      </div>

      <div className="field">
        <label>Lúpulos</label>
        <p className="field-hint">Cantidad por defecto en gramos (g). Cambiá la unidad a kilogramos (kg) si hace falta.</p>
        {draft.hopSchedule.map((item, i) => (
          <div className="repeat-row" style={{ gridTemplateColumns: "90px 70px 1fr auto" }} key={i}>
            <input
              type="number"
              step="0.1"
              placeholder="Cantidad"
              value={item.amount}
              onChange={(e) => updateHop(i, "amount", e.target.value)}
            />
            <select value={item.unit} onChange={(e) => updateHopUnit(i, e.target.value as WeightUnit)}>
              <option value="g">g</option>
              <option value="kg">kg</option>
            </select>
            <input placeholder="Lúpulo" value={item.hop} onChange={(e) => updateHop(i, "hop", e.target.value)} />
            <button type="button" className="icon-btn" onClick={() => set("hopSchedule", draft.hopSchedule.filter((_, idx) => idx !== i))}>
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn"
          style={{ marginTop: 8 }}
          onClick={() => set("hopSchedule", [...draft.hopSchedule, { amount: "", unit: "g", hop: "" }])}
        >
          + Agregar lúpulo
        </button>
      </div>

      <div className="field">
        <label>Pasos del día de cocción</label>
        {draft.processSteps.map((step, i) => (
          <div className="repeat-row" style={{ gridTemplateColumns: "1fr auto" }} key={i}>
            <input placeholder={`Paso ${i + 1}`} value={step.text} onChange={(e) => updateStep(i, e.target.value)} />
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
          + Agregar paso
        </button>
      </div>

      {error && (
        <p style={{ color: "var(--danger)", marginTop: 16 }}>{error}</p>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 26 }}>
        <button className="btn primary" type="submit" disabled={saving}>
          {saving ? "Guardando…" : brewId ? "Guardar cambios" : "Crear cocción"}
        </button>
      </div>
    </form>
  );
}
