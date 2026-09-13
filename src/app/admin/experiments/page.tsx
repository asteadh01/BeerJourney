"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { updateBrew, watchAllBrews } from "@/lib/brews";
import type { Brew } from "@/lib/types";

interface ExperimentGroup {
  key: string;
  title: string;
  style: string;
  ideaId?: string;
  tries: Brew[];
}

// An "experimento" is a recipe that hasn't graduated to a published batch
// yet — every batch in the group is still a draft attempt.
function groupExperiments(brews: Brew[]): ExperimentGroup[] {
  const byKey = new Map<string, Brew[]>();
  for (const brew of brews) {
    const key = brew.recipeGroupId || brew.id;
    byKey.set(key, [...(byKey.get(key) ?? []), brew]);
  }

  const groups: ExperimentGroup[] = [];
  for (const [key, batches] of byKey.entries()) {
    if (batches.some((b) => b.status === "published")) continue;
    const tries = [...batches].sort((a, b) => a.batchNumber - b.batchNumber);
    const latest = tries[tries.length - 1];
    groups.push({ key, title: latest.title, style: latest.style, ideaId: tries[0].ideaId, tries });
  }
  return groups.sort((a, b) => b.tries[b.tries.length - 1].batchNumber - a.tries[a.tries.length - 1].batchNumber);
}

export default function AdminExperimentsPage() {
  const [brews, setBrews] = useState<Brew[]>([]);
  const [publishing, setPublishing] = useState<string | null>(null);

  useEffect(() => watchAllBrews(setBrews), []);

  const groups = useMemo(() => groupExperiments(brews), [brews]);

  async function markOfficial(group: ExperimentGroup) {
    const latest = group.tries[group.tries.length - 1];
    if (!confirm(`¿Marcar "${group.title}" (cocción №${latest.batchNumber}) como cerveza oficial? Va a aparecer en Cervezas.`)) return;
    setPublishing(group.key);
    try {
      await updateBrew(latest.id, { status: "published" });
    } finally {
      setPublishing(null);
    }
  }

  return (
    <>
      <div className="admin-head">
        <h2>Experimentos</h2>
      </div>

      {groups.length === 0 ? (
        <div className="empty-state">No hay recetas en ajuste — todo lo que se está cociendo ya es oficial.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {groups.map((group) => (
            <section className="experiment-group" key={group.key}>
              <header className="experiment-group-head">
                <div>
                  <h3>{group.title}</h3>
                  <span className="experiment-group-meta">
                    {group.style || "Estilo sin definir"} · {group.tries.length} {group.tries.length === 1 ? "intento" : "intentos"}
                    {group.ideaId && (
                      <>
                        {" · "}
                        <Link href={`/admin/ideas/edit?id=${group.ideaId}`}>↳ ver idea de origen</Link>
                      </>
                    )}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Link className="btn" href={`/admin/brews/new?fromId=${group.tries[group.tries.length - 1].id}`}>
                    + Nuevo intento
                  </Link>
                  <button className="btn primary" disabled={publishing === group.key} onClick={() => markOfficial(group)}>
                    {publishing === group.key ? "Publicando…" : "Marcar como oficial →"}
                  </button>
                </div>
              </header>
              <div className="try-timeline">
                {group.tries.map((brew, i) => (
                  <div className={`try-item ${i === group.tries.length - 1 ? "latest" : ""}`} key={brew.id}>
                    <span className="try-dot">{i + 1}</span>
                    <div className="try-body">
                      <div className="try-head">
                        <strong>Cocción №{brew.batchNumber}</strong>
                        <span>{brew.brewedOn}</span>
                        <Link className="btn" style={{ padding: "4px 12px", fontSize: "0.75rem" }} href={`/admin/brews/edit?id=${brew.id}`}>
                          Editar
                        </Link>
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
          ))}
        </div>
      )}
    </>
  );
}
