"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { watchPublishedBrews } from "@/lib/brews";
import { sampleBrews } from "@/lib/sampleBrews";
import type { Brew } from "@/lib/types";

export default function BrewsPage() {
  const [brews, setBrews] = useState<Brew[] | null>(null);

  useEffect(() => {
    const unsub = watchPublishedBrews(setBrews);
    return unsub;
  }, []);

  if (brews === null) {
    return (
      <>
        <SiteNav active="brews" />
        <main className="page">
          <div className="section-head">
            <h3>Cervezas</h3>
          </div>
          <div className="batch-grid">
            {[0, 1, 2].map((i) => (
              <div key={i} className="batch-skeleton" />
            ))}
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  const showingSample = brews.length === 0;
  const list = showingSample ? sampleBrews : brews;

  return (
    <>
      <SiteNav active="brews" />
      <main className="page">
        <div className="section-head">
          <h3>{showingSample ? "Cerveza de ejemplo (agregá tu primera cocción en el panel de administración)" : "Cervezas"}</h3>
        </div>

        {list.length === 0 ? (
          <div className="empty-state">Todavía no hay cervezas publicadas.</div>
        ) : (
          <div className="batch-grid">
            {list.map((brew) => (
              <Link key={brew.id} className="batch-card" href={`/brew?slug=${brew.slug}`}>
                <div
                  className="batch-thumb"
                  style={brew.heroImageUrl ? { backgroundImage: `url(${brew.heroImageUrl})` } : undefined}
                >
                  <span className="tag">
                    №{String(brew.batchNumber).padStart(3, "0")} · {brew.style}
                  </span>
                </div>
                <h4>{brew.title}</h4>
                <div className="batch-meta">
                  <span>
                    <b>{brew.abv}%</b> ABV
                  </span>
                  <span>
                    <b>{brew.ibu}</b> IBU
                  </span>
                  <span>{brew.brewedOn}</span>
                </div>
                <p className="batch-desc">{brew.summary}</p>
                <div className="batch-footer">
                  <span className="chip">{brew.status === "published" ? "Publicada" : "Borrador"}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
