"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { groupBrewsByRecipe, updateBrew, watchAllBrews } from "@/lib/brews";
import type { RecipeGroup } from "@/lib/brews";
import type { Brew } from "@/lib/types";

export default function AdminExperimentsPage() {
  const [brews, setBrews] = useState<Brew[]>([]);
  const [working, setWorking] = useState<string | null>(null);

  useEffect(() => watchAllBrews(setBrews), []);

  // Every recipe's full try history — including ones already promoted to
  // Cervezas, so the R&D story behind an official beer stays browsable.
  const groups = useMemo<RecipeGroup[]>(
    () => groupBrewsByRecipe(brews).sort((a, b) => b.batches[b.batches.length - 1].batchNumber - a.batches[a.batches.length - 1].batchNumber),
    [brews],
  );

  async function markOfficial(brew: Brew) {
    if (!confirm(`¿Marcar "${brew.title}" (cocción №${brew.batchNumber}) como cerveza oficial? Va a aparecer en Cervezas.`)) return;
    setWorking(brew.id);
    try {
      await updateBrew(brew.id, { status: "published" });
    } finally {
      setWorking(null);
    }
  }

  async function unpublish(brew: Brew) {
    setWorking(brew.id);
    try {
      await updateBrew(brew.id, { status: "draft" });
    } finally {
      setWorking(null);
    }
  }

  return (
    <>
      <div className="admin-head">
        <h2>Experimentos</h2>
        <Link className="btn primary" href="/admin/brews/new">
          + Nueva cocción
        </Link>
      </div>
      <p style={{ color: "var(--ink-dim)", fontSize: "0.85rem", marginTop: -8, marginBottom: 20 }}>
        Todas las recetas y todos sus intentos — incluidas las que ya llegaron a oficial.
      </p>

      {groups.length === 0 ? (
        <div className="empty-state">Todavía no hay cocciones registradas. Registrá tu primera cocción.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {groups.map((group) => {
            const latest = group.batches[group.batches.length - 1];
            const ideaId = group.batches[0]?.ideaId;
            return (
              <section className="experiment-group" key={group.key}>
                <header className="experiment-group-head">
                  <div>
                    <h3>{latest.title}</h3>
                    <span className="experiment-group-meta">
                      {latest.style || "Estilo sin definir"} · {group.batches.length}{" "}
                      {group.batches.length === 1 ? "intento" : "intentos"}
                      {ideaId && (
                        <>
                          {" · "}
                          <Link href={`/admin/ideas/edit?id=${ideaId}`}>↳ ver idea de origen</Link>
                        </>
                      )}
                    </span>
                  </div>
                  <Link className="btn" href={`/admin/brews/new?fromId=${latest.id}`}>
                    + Nuevo intento
                  </Link>
                </header>
                <div className="try-timeline">
                  {group.batches.map((brew, i) => (
                    <div className={`try-item ${i === group.batches.length - 1 ? "latest" : ""}`} key={brew.id}>
                      <span className="try-dot">{brew.status === "published" ? "★" : i + 1}</span>
                      <div className="try-body">
                        <div className="try-head">
                          <strong>Cocción №{brew.batchNumber}</strong>
                          <span>{brew.brewedOn}</span>
                          <span className={`status-pill ${brew.status}`}>
                            {brew.status === "published" ? "Oficial" : "Borrador"}
                          </span>
                          <Link className="btn" style={{ padding: "4px 12px", fontSize: "0.75rem" }} href={`/admin/brews/edit?id=${brew.id}`}>
                            Editar
                          </Link>
                          {brew.status === "published" ? (
                            <button
                              type="button"
                              className="btn"
                              style={{ padding: "4px 12px", fontSize: "0.75rem" }}
                              disabled={working === brew.id}
                              onClick={() => unpublish(brew)}
                            >
                              Despublicar
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn primary"
                              style={{ padding: "4px 12px", fontSize: "0.75rem" }}
                              disabled={working === brew.id}
                              onClick={() => markOfficial(brew)}
                            >
                              Marcar como oficial →
                            </button>
                          )}
                        </div>
                        <div className="try-metrics">
                          <span>
                            OG <b>{brew.og}</b>
                          </span>
                          <span>
                            FG <b>{brew.fg}</b>
                          </span>
                          {brew.fermentationDays && (
                            <span>
                              Fermentación <b>{brew.fermentationDays}d</b>
                            </span>
                          )}
                        </div>
                        {brew.changeNote && <p className="try-note">{brew.changeNote}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
