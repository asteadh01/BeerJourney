"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { deleteBrew, groupBrewsByRecipe, updateBrew, updateRecipeHeroImage, watchAllBrews } from "@/lib/brews";
import type { Brew } from "@/lib/types";

interface BrewGroup {
  key: string;
  official: Brew;
  tryCount: number;
}

// Cervezas shows one card per recipe — whichever batch is currently
// published, not every batch in the recipe's history (that's Experimentos).
function officialGroups(brews: Brew[]): BrewGroup[] {
  const groups = groupBrewsByRecipe(brews)
    .map(({ key, batches }) => {
      const published = batches.filter((b) => b.status === "published");
      const official = published[published.length - 1];
      return official ? { key, official, tryCount: batches.length } : null;
    })
    .filter((g): g is BrewGroup => g !== null);

  return groups.sort((a, b) => b.official.batchNumber - a.official.batchNumber);
}

export default function AdminBrewsPage() {
  const [brews, setBrews] = useState<Brew[]>([]);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState<string | null>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const pendingGroupKey = useRef<string | null>(null);

  useEffect(() => watchAllBrews(setBrews), []);

  const groups = useMemo(() => officialGroups(brews), [brews]);
  const preview = groups.find((g) => g.key === previewKey)?.official ?? null;

  function openThumbUpload(groupKey: string) {
    pendingGroupKey.current = groupKey;
    thumbInputRef.current?.click();
  }

  async function handleThumbFile(file: File) {
    const groupKey = pendingGroupKey.current;
    if (!groupKey) return;
    setUploadingKey(groupKey);
    try {
      const path = `brews/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
      const fileRef = ref(storage, path);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      await updateRecipeHeroImage(groupKey, url);
    } catch {
      alert("No se pudo subir la imagen. Probá de nuevo.");
    } finally {
      setUploadingKey(null);
    }
  }

  async function unpublish(brew: Brew) {
    await updateBrew(brew.id, { status: "draft" });
  }

  async function remove(brew: Brew) {
    if (!confirm(`¿Eliminar "${brew.title}" (batch №${brew.batchNumber})? Esta acción no se puede deshacer.`)) return;
    await deleteBrew(brew.id);
  }

  return (
    <>
      <div className="admin-head">
        <h2>Cervezas</h2>
      </div>
      <p style={{ color: "var(--ink-dim)", fontSize: "0.85rem", marginTop: -8, marginBottom: 20 }}>
        Una tarjeta por receta — la que está marcada como oficial. Las cocciones nuevas y los demás intentos se
        arrancan y se manejan desde <Link href="/admin/experiments">Experimentos</Link>.
      </p>
      <input
        ref={thumbInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleThumbFile(file);
          e.target.value = "";
        }}
      />
      {groups.length === 0 ? (
        <div className="empty-state">
          Todavía no hay cervezas oficiales — marcá un intento como oficial desde{" "}
          <Link href="/admin/experiments">Experimentos</Link>.
        </div>
      ) : (
        groups.map((group) => (
          <section
            className="brew-group"
            key={group.key}
            onClick={() => setPreviewKey(group.key)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setPreviewKey(group.key);
              }
            }}
          >
            <header className="brew-group-header">
              <button
                type="button"
                className="row-thumb row-thumb-upload"
                style={group.official.heroImageUrl ? { backgroundImage: `url(${group.official.heroImageUrl})` } : undefined}
                onClick={(e) => {
                  e.stopPropagation();
                  openThumbUpload(group.key);
                }}
                disabled={uploadingKey === group.key}
                title="Cambiar imagen principal"
                aria-label="Cambiar imagen principal"
              >
                {uploadingKey === group.key ? "…" : !group.official.heroImageUrl && "+"}
              </button>
              <div className="brew-group-title-wrap">
                <h3 className="brew-group-title">{group.official.title}</h3>
                <span className="brew-group-meta">
                  {group.official.style} · Batch {group.official.batchNumber} oficial · {group.tryCount}{" "}
                  {group.tryCount === 1 ? "intento en total" : "intentos en total"}
                </span>
              </div>
              <div className="brew-group-actions" onClick={(e) => e.stopPropagation()}>
                <Link className="btn" href={`/admin/brews/recipe/edit?groupId=${group.key}`}>
                  Editar descripción
                </Link>
                <Link className="btn" href="/admin/experiments">
                  Ver experimentos
                </Link>
                <button type="button" className="btn" onClick={() => unpublish(group.official)}>
                  Despublicar
                </button>
                <button type="button" className="btn danger" onClick={() => remove(group.official)}>
                  Eliminar
                </button>
              </div>
            </header>
          </section>
        ))
      )}

      {preview && (
        <div className="modal-overlay" onClick={() => setPreviewKey(null)}>
          <div className="modal-panel xwide" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div>
                <h3 style={{ marginBottom: 2 }}>Vista previa pública</h3>
                <span style={{ color: "var(--ink-dim)", fontSize: "0.78rem" }}>Así la ve cualquiera en el sitio</span>
              </div>
              <button className="modal-close" onClick={() => setPreviewKey(null)} aria-label="Cerrar">
                ×
              </button>
            </div>

            <section className="detail-hero" style={{ marginTop: 18 }}>
              <div
                className="detail-img"
                style={preview.heroImageUrl ? { backgroundImage: `url(${preview.heroImageUrl})` } : undefined}
              >
                <span className="badge">Cocción №{String(preview.batchNumber).padStart(3, "0")}</span>
              </div>
              <div className="detail-copy">
                <span className="style">{preview.style}</span>
                <h1 style={{ fontSize: "1.6rem" }}>{preview.title}</h1>
                <p>{preview.description}</p>
                <div className="spec-grid">
                  <div className="spec">
                    <div className="v">{preview.abv}%</div>
                    <div className="l">ABV</div>
                  </div>
                  <div className="spec">
                    <div className="v">{preview.ibu}</div>
                    <div className="l">IBU</div>
                  </div>
                  <div className="spec">
                    <div className="v">{preview.og}</div>
                    <div className="l">OG</div>
                  </div>
                  <div className="spec">
                    <div className="v">{preview.fg}</div>
                    <div className="l">FG</div>
                  </div>
                </div>
              </div>
            </section>

            <section className="detail-body">
              <div className="detail-col">
                <h3>Proceso</h3>
                <ol className="process-steps">
                  {preview.processSteps.map((step) => (
                    <li key={step.order}>
                      <span className="step-n">{String(step.order).padStart(2, "0")}</span>
                      {step.text}
                    </li>
                  ))}
                </ol>
              </div>
              <div className="detail-col">
                <h3>Maltas</h3>
                <table className="malt-bill">
                  <tbody>
                    {preview.maltBill.map((m, i) => (
                      <tr key={i}>
                        <td>{m.ingredient}</td>
                        <td className="num">
                          {m.amount} {m.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <h3>Lúpulos</h3>
                <table className="malt-bill">
                  <tbody>
                    {preview.hopSchedule.map((h, i) => (
                      <tr key={i}>
                        <td>{h.hop}</td>
                        <td className="num">
                          {h.amount} {h.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="modal-actions">
              <Link className="btn primary" href={`/brew?slug=${preview.slug}`} target="_blank" rel="noopener noreferrer">
                Ver página completa →
              </Link>
              <button className="btn" onClick={() => setPreviewKey(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
