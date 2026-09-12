"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { deleteBrew, updateBrew, updateRecipeHeroImage, watchAllBrews } from "@/lib/brews";
import type { Brew } from "@/lib/types";

interface BrewGroup {
  key: string;
  title: string;
  style: string;
  heroImageUrl?: string;
  latestBatchId: string;
  batches: Brew[];
}

function groupByRecipe(brews: Brew[]): BrewGroup[] {
  const byKey = new Map<string, Brew[]>();
  for (const brew of brews) {
    const key = brew.recipeGroupId || brew.id;
    byKey.set(key, [...(byKey.get(key) ?? []), brew]);
  }

  const groups = Array.from(byKey.entries()).map(([key, batches]) => {
    const sorted = [...batches].sort((a, b) => a.batchNumber - b.batchNumber);
    const latest = sorted[sorted.length - 1];
    return {
      key,
      title: latest.title,
      style: latest.style,
      heroImageUrl: latest.heroImageUrl,
      latestBatchId: latest.id,
      batches: sorted,
    };
  });

  return groups.sort((a, b) => {
    const aLatest = a.batches[a.batches.length - 1];
    const bLatest = b.batches[b.batches.length - 1];
    return bLatest.batchNumber - aLatest.batchNumber;
  });
}

export default function AdminBrewsPage() {
  const [brews, setBrews] = useState<Brew[]>([]);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const pendingGroupKey = useRef<string | null>(null);

  useEffect(() => watchAllBrews(setBrews), []);

  const groups = useMemo(() => groupByRecipe(brews), [brews]);

  function toggleCollapsed(key: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

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

  async function togglePublish(brew: Brew) {
    await updateBrew(brew.id, { status: brew.status === "published" ? "draft" : "published" });
  }

  async function remove(brew: Brew) {
    if (!confirm(`¿Eliminar "${brew.title}" (batch №${brew.batchNumber})? Esta acción no se puede deshacer.`)) return;
    await deleteBrew(brew.id);
  }

  return (
    <>
      <div className="admin-head">
        <h2>Cervezas</h2>
        <Link className="btn primary" href="/admin/brews/new">
          + Nueva cocción
        </Link>
      </div>
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
        <div className="empty-state">Todavía no hay cocciones. Registrá tu primera cerveza.</div>
      ) : (
        groups.map((group) => {
          const isCollapsed = collapsed.has(group.key);
          return (
            <section className="brew-group" key={group.key}>
              <header className="brew-group-header">
                <button
                  type="button"
                  className="row-thumb row-thumb-upload"
                  style={group.heroImageUrl ? { backgroundImage: `url(${group.heroImageUrl})` } : undefined}
                  onClick={() => openThumbUpload(group.key)}
                  disabled={uploadingKey === group.key}
                  title="Cambiar imagen principal"
                  aria-label="Cambiar imagen principal"
                >
                  {uploadingKey === group.key ? "…" : !group.heroImageUrl && "+"}
                </button>
                <div style={{ flex: 1 }}>
                  <h3 className="brew-group-title">{group.title}</h3>
                  <span className="brew-group-meta">
                    {group.style} · {group.batches.length} {group.batches.length === 1 ? "batch" : "batches"}
                  </span>
                </div>
                <Link className="btn" href={`/admin/brews/recipe/edit?groupId=${group.key}`}>
                  Editar
                </Link>
                <Link className="btn" href={`/admin/brews/new?fromId=${group.latestBatchId}`}>
                  + Nuevo batch
                </Link>
                <button
                  type="button"
                  className="brew-group-toggle"
                  onClick={() => toggleCollapsed(group.key)}
                  aria-expanded={!isCollapsed}
                >
                  {isCollapsed ? "Mostrar batches ▾" : "Ocultar batches ▴"}
                </button>
              </header>
              {!isCollapsed && (
                <div className="brew-group-batches">
                  {group.batches.map((brew) => (
                    <div className="brew-batch-row" key={brew.id}>
                      <span className="brew-batch-label">Batch {brew.batchNumber}</span>
                      <span className="brew-batch-abv">{brew.abv}% ABV</span>
                      <span className={`status-pill ${brew.status}`}>
                        {brew.status === "published" ? "Publicada" : "Borrador"}
                      </span>
                      <div className="row-actions">
                        <Link className="btn" href={`/admin/brews/edit?id=${brew.id}`}>
                          Editar
                        </Link>
                        <button className="btn" onClick={() => togglePublish(brew)}>
                          {brew.status === "published" ? "Despublicar" : "Publicar"}
                        </button>
                        <button className="btn danger" onClick={() => remove(brew)}>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })
      )}
    </>
  );
}
