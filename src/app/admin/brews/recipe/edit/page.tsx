"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getBrewsByRecipeGroup, updateRecipeFields } from "@/lib/brews";
import { BEER_STYLE_GROUPS, BEER_STYLES, OTHER_STYLE } from "@/lib/beerStyles";
import type { Brew } from "@/lib/types";

interface RecipeFields {
  title: string;
  style: string;
  summary: string;
  description: string;
}

function RecipeEditForm() {
  const router = useRouter();
  const params = useSearchParams();
  const groupId = params.get("groupId") ?? "";

  const [batches, setBatches] = useState<Brew[] | null>(null);
  const [fields, setFields] = useState<RecipeFields | null>(null);
  const [useCustomStyle, setUseCustomStyle] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!groupId) return;
    getBrewsByRecipeGroup(groupId).then((brews) => {
      setBatches(brews);
      const latest = [...brews].sort((a, b) => b.batchNumber - a.batchNumber)[0];
      if (latest) {
        setFields({ title: latest.title, style: latest.style, summary: latest.summary, description: latest.description });
        setUseCustomStyle(!BEER_STYLES.includes(latest.style));
      }
    });
  }, [groupId]);

  function set<K extends keyof RecipeFields>(key: K, value: RecipeFields[K]) {
    setFields((f) => (f ? { ...f, [key]: value } : f));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fields) return;
    setSaving(true);
    setError("");
    try {
      await updateRecipeFields(groupId, fields);
      router.push("/admin/brews");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudieron guardar los cambios.");
    } finally {
      setSaving(false);
    }
  }

  if (!groupId) return <div className="empty-state">Falta el identificador de la receta.</div>;
  if (batches === null || fields === null) return <p style={{ color: "var(--ink-dim)" }}>Cargando…</p>;
  if (batches.length === 0) return <div className="empty-state">No encontramos batches para esta receta.</div>;

  return (
    <>
      <div className="admin-head">
        <h2>Editar receta</h2>
      </div>
      <p style={{ color: "var(--ink-dim)", marginTop: 0 }}>
        Estos cambios se aplican a los {batches.length} batch{batches.length === 1 ? "" : "es"} de esta receta. El resto de
        los datos (densidades, ingredientes, proceso, imagen, etc.) se edita por batch desde el listado.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="title">Título</label>
          <input id="title" value={fields.title} onChange={(e) => set("title", e.target.value)} required />
        </div>

        <div className="field">
          <label htmlFor="style">Estilo</label>
          <select
            id="style"
            value={useCustomStyle ? OTHER_STYLE : fields.style}
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
              value={fields.style}
              onChange={(e) => set("style", e.target.value)}
              required
            />
          )}
        </div>

        <div className="field">
          <label htmlFor="summary">Resumen breve (se muestra en las tarjetas)</label>
          <input id="summary" value={fields.summary} onChange={(e) => set("summary", e.target.value)} maxLength={140} required />
        </div>

        <div className="field">
          <label htmlFor="description">Descripción completa</label>
          <textarea id="description" value={fields.description} onChange={(e) => set("description", e.target.value)} required />
        </div>

        {error && <p style={{ color: "var(--danger)", marginTop: 16 }}>{error}</p>}

        <div style={{ display: "flex", gap: 10, marginTop: 26 }}>
          <button className="btn primary" type="submit" disabled={saving}>
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
          <Link className="btn" href="/admin/brews">
            Cancelar
          </Link>
        </div>
      </form>
    </>
  );
}

export default function RecipeEditPage() {
  return (
    <Suspense fallback={null}>
      <RecipeEditForm />
    </Suspense>
  );
}
