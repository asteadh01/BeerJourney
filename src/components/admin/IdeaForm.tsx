"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { createIdea, convertIdeaToExperiment, updateIdea } from "@/lib/ideas";
import { BEER_STYLE_GROUPS, BEER_STYLES, OTHER_STYLE } from "@/lib/beerStyles";
import type { Idea, WeightUnit } from "@/lib/types";

type Draft = Omit<Idea, "id" | "createdAt" | "updatedAt">;

function emptyDraft(): Draft {
  return {
    title: "",
    style: "",
    targetAbv: undefined,
    why: "",
    maltBill: [{ amount: "", unit: "kg", ingredient: "" }],
    hopSchedule: [{ amount: "", unit: "g", hop: "" }],
    otherIngredients: [""],
    notes: "",
    status: "activa",
    createdBy: "",
  };
}

interface IdeaFormProps {
  ideaId?: string;
  initial?: Idea;
}

export function IdeaForm({ ideaId, initial }: IdeaFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [draft, setDraft] = useState<Draft>(initial ?? emptyDraft());
  const [saving, setSaving] = useState(false);
  const [converting, setConverting] = useState(false);
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

  function updateOther(i: number, value: string) {
    setDraft((d) => ({
      ...d,
      otherIngredients: d.otherIngredients.map((item, idx) => (idx === i ? value : item)),
    }));
  }

  function cleanDraft(): Draft {
    // Firestore rejects an explicit `undefined` field value (unlike a
    // missing key), so an unset optional number can't just be spread in.
    const { targetAbv, ...rest } = draft;
    return {
      ...rest,
      ...(targetAbv !== undefined ? { targetAbv } : {}),
      maltBill: draft.maltBill.filter((m) => m.ingredient.trim()),
      hopSchedule: draft.hopSchedule.filter((h) => h.hop.trim()),
      otherIngredients: draft.otherIngredients.filter((o) => o.trim()),
      createdBy: draft.createdBy || user?.uid || "",
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const cleaned = cleanDraft();
    try {
      if (ideaId) {
        await updateIdea(ideaId, cleaned);
      } else {
        await createIdea(cleaned);
      }
      router.push("/admin/ideas");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la idea.");
    } finally {
      setSaving(false);
    }
  }

  async function handleConvert() {
    if (!ideaId) return;
    if (!confirm(`¿Convertir "${draft.title}" en un experimento? Se va a crear una cocción nueva en borrador.`)) return;
    setConverting(true);
    setError("");
    try {
      const cleaned = cleanDraft();
      await updateIdea(ideaId, cleaned);
      const ref = await convertIdeaToExperiment({ id: ideaId, ...cleaned });
      router.push(`/admin/brews/edit?id=${ref.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo convertir la idea.");
      setConverting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
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
          >
            <option value="">Sin definir todavía</option>
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
            />
          )}
        </div>
      </div>

      <div className="field">
        <label htmlFor="targetAbv">ABV objetivo % (opcional)</label>
        <input
          id="targetAbv"
          type="number"
          step="0.1"
          value={draft.targetAbv ?? ""}
          onChange={(e) => set("targetAbv", e.target.value === "" ? undefined : Number(e.target.value))}
          placeholder="Sin definir"
        />
        <p className="field-hint">Es solo una referencia — nada de esto está confirmado hasta que se cocine de verdad.</p>
      </div>

      <div className="field">
        <label htmlFor="why">¿Por qué quiero probarla?</label>
        <textarea id="why" value={draft.why} onChange={(e) => set("why", e.target.value)} required />
      </div>

      <div className="field">
        <label>Maltas tentativas</label>
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
          + Agregar malta
        </button>
      </div>

      <div className="field">
        <label>Lúpulos tentativos</label>
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
        <label>Otros ingredientes</label>
        <p className="field-hint">Especias, fruta, aromas, levaduras especiales — cualquier otra cosa que no sea malta ni lúpulo.</p>
        {draft.otherIngredients.map((item, i) => (
          <div className="repeat-row" style={{ gridTemplateColumns: "1fr auto" }} key={i}>
            <input placeholder="Ej: cáscara de mandarina seca, en el secundario" value={item} onChange={(e) => updateOther(i, e.target.value)} />
            <button
              type="button"
              className="icon-btn"
              onClick={() => set("otherIngredients", draft.otherIngredients.filter((_, idx) => idx !== i))}
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn"
          style={{ marginTop: 8 }}
          onClick={() => set("otherIngredients", [...draft.otherIngredients, ""])}
        >
          + Agregar ingrediente
        </button>
      </div>

      <div className="field">
        <label htmlFor="notes">Notas sueltas</label>
        <textarea id="notes" value={draft.notes} onChange={(e) => set("notes", e.target.value)} />
      </div>

      <div className="field">
        <label htmlFor="status">Estado</label>
        <select
          id="status"
          value={draft.status}
          onChange={(e) => set("status", e.target.value as Draft["status"])}
          disabled={draft.status === "convertida"}
        >
          <option value="activa">Activa</option>
          <option value="descartada">Descartada</option>
          {draft.status === "convertida" && <option value="convertida">Convertida</option>}
        </select>
      </div>

      {error && <p style={{ color: "var(--danger)", marginTop: 16 }}>{error}</p>}

      <div style={{ display: "flex", gap: 10, marginTop: 26, flexWrap: "wrap" }}>
        <button className="btn primary" type="submit" disabled={saving || converting}>
          {saving ? "Guardando…" : ideaId ? "Guardar cambios" : "Guardar idea"}
        </button>
        {ideaId && draft.status === "activa" && (
          <button type="button" className="btn" disabled={saving || converting} onClick={handleConvert}>
            {converting ? "Convirtiendo…" : "Convertir en experimento →"}
          </button>
        )}
      </div>
    </form>
  );
}
