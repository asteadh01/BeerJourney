"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { deleteBrew, updateBrew, watchAllBrews } from "@/lib/brews";
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
      {groups.length === 0 ? (
        <div className="empty-state">Todavía no hay cocciones. Registrá tu primera cerveza.</div>
      ) : (
        groups.map((group) => {
          const isCollapsed = collapsed.has(group.key);
          return (
            <section className="brew-group" key={group.key}>
              <header className="brew-group-header">
                <span
                  className="row-thumb"
                  style={group.heroImageUrl ? { backgroundImage: `url(${group.heroImageUrl})` } : undefined}
                />
                <div style={{ flex: 1 }}>
                  <h3 className="brew-group-title">{group.title}</h3>
                  <span className="brew-group-meta">
                    {group.style} · {group.batches.length} {group.batches.length === 1 ? "batch" : "batches"}
                  </span>
                </div>
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
