"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { watchPublishedBrews } from "@/lib/brews";
import { sampleBrews } from "@/lib/sampleBrews";
import type { Brew } from "@/lib/types";

export default function HomePage() {
  const [brews, setBrews] = useState<Brew[] | null>(null);

  useEffect(() => {
    const unsub = watchPublishedBrews(setBrews);
    return unsub;
  }, []);

  const loaded = brews ?? [];
  const showingSample = brews !== null && brews.length === 0;
  const list = showingSample ? sampleBrews : loaded;
  const latest = list[0];

  const avgAbv = list.length ? (list.reduce((sum, b) => sum + b.abv, 0) / list.length).toFixed(1) : "—";
  const totalComments = list.length; // placeholder aggregate until comment counts are denormalized

  return (
    <>
      <SiteNav active="brews" />
      <div className="page">
        {latest && (
          <section className="hero">
            <div>
              <span className="eyebrow">
                Latest batch · Batch №{String(latest.batchNumber).padStart(3, "0")}
              </span>
              <h1>{latest.title}</h1>
              <p>{latest.summary}</p>
              <div className="hero-actions">
                <Link className="btn primary" href={`/brew?slug=${latest.slug}`}>
                  Read the recipe
                </Link>
                {latest.youtubeUrl && (
                  <a className="btn" href={latest.youtubeUrl} target="_blank" rel="noopener noreferrer">
                    Watch brew day
                  </a>
                )}
              </div>
            </div>
            <div
              className="hero-visual"
              style={latest.heroImageUrl ? { backgroundImage: `url(${latest.heroImageUrl})` } : undefined}
            />
          </section>
        )}

        <section className="stats-strip">
          <div className="stat">
            <div className="n">{list.length}</div>
            <div className="l">Batches logged</div>
          </div>
          <div className="stat">
            <div className="n">{avgAbv}%</div>
            <div className="l">Avg. ABV</div>
          </div>
          <div className="stat">
            <div className="n">{totalComments}</div>
            <div className="l">Batches with notes</div>
          </div>
          <div className="stat">
            <div className="n">2</div>
            <div className="l">Brewers</div>
          </div>
        </section>

        <div className="section-head">
          <h3>{showingSample ? "Example brew (add your first batch in the admin panel)" : "Recent brews"}</h3>
        </div>

        {list.length === 0 && brews !== null ? (
          <div className="empty-state">No brews published yet.</div>
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
                  <span className="chip">{brew.status === "published" ? "Published" : "Draft"}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
