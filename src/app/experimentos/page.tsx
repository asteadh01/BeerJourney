"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { groupBrewsByRecipe, watchAllBrews } from "@/lib/brews";
import type { Brew } from "@/lib/types";

function statusLabel(batches: Brew[]): string {
  return batches.some((b) => b.status === "published") ? "Resuelta" : "En ajuste";
}

export default function ExperimentosPage() {
  const [brews, setBrews] = useState<Brew[] | null>(null);

  useEffect(() => watchAllBrews(setBrews), []);

  const groups = brews ? groupBrewsByRecipe(brews) : null;

  return (
    <>
      <SiteNav active="experimentos" />
      <main className="page">
        <div className="section-head">
          <h3>Experimentos</h3>
        </div>
        <p style={{ color: "var(--ink-dim)", maxWidth: "62ch", lineHeight: 1.7, marginTop: 8, marginBottom: 24 }}>
          Todo lo que probamos para llegar a cada receta — cada ajuste, cada intento descartado, y cómo se llegó a
          la versión que terminó (o no) en <Link href="/brews">Cervezas</Link>.
        </p>

        {groups === null ? (
          <div className="batch-grid">
            {[0, 1].map((i) => (
              <div key={i} className="batch-skeleton" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="empty-state">Todavía no hay experimentos registrados.</div>
        ) : (
          <div className="batch-grid">
            {groups.map((group) => {
              const latest = group.batches[group.batches.length - 1];
              const resolved = group.batches.some((b) => b.status === "published");
              return (
                <Link key={group.key} className="batch-card" href={`/experimento?group=${group.key}`}>
                  <div
                    className="batch-thumb"
                    style={latest.heroImageUrl ? { backgroundImage: `url(${latest.heroImageUrl})` } : undefined}
                  >
                    <span className="tag">
                      {group.batches.length} {group.batches.length === 1 ? "intento" : "intentos"}
                    </span>
                  </div>
                  <h4>{latest.title}</h4>
                  <div className="batch-meta">
                    <span>{latest.style}</span>
                    <span>{statusLabel(group.batches)}</span>
                  </div>
                  <div className="batch-footer">
                    <span className={`chip ${resolved ? "" : "outline"}`}>{resolved ? "✓ llegó a oficial" : "En curso"}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
