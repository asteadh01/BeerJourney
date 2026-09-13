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
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const pendingGroupKey = useRef<string | null>(null);

  useEffect(() => watchAllBrews(setBrews), []);

  const groups = useMemo(() => officialGroups(brews), [brews]);

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
          <section className="brew-group" key={group.key}>
            <header className="brew-group-header">
              <button
                type="button"
                className="row-thumb row-thumb-upload"
                style={group.official.heroImageUrl ? { backgroundImage: `url(${group.official.heroImageUrl})` } : undefined}
                onClick={() => openThumbUpload(group.key)}
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
              <div className="brew-group-actions">
                <Link className="btn" href={`/admin/brews/recipe/edit?groupId=${group.key}`}>
                  Editar receta
                </Link>
                <Link className="btn" href={`/admin/brews/edit?id=${group.official.id}`}>
                  Editar batch
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
    </>
  );
}
