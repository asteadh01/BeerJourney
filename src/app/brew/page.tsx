"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { addComment, getBrewBySlug, watchComments } from "@/lib/brews";
import { sampleBrews } from "@/lib/sampleBrews";
import type { Brew, Comment } from "@/lib/types";
import { youtubeEmbedUrl } from "@/lib/youtube";

function BrewDetail() {
  const params = useSearchParams();
  const slug = params.get("slug") ?? "";

  const sample = useMemo(() => sampleBrews.find((b) => b.slug === slug), [slug]);
  const [fetchResult, setFetchResult] = useState<{ slug: string; brew: Brew | null } | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  const fetchedBrew = fetchResult?.slug === slug ? fetchResult.brew : undefined;
  const brew = sample ?? fetchedBrew;

  useEffect(() => {
    if (!slug || sample) return;
    let cancelled = false;
    getBrewBySlug(slug).then((result) => {
      if (!cancelled) setFetchResult({ slug, brew: result });
    });
    return () => {
      cancelled = true;
    };
  }, [slug, sample]);

  useEffect(() => {
    if (!brew || brew.id.startsWith("sample-")) return;
    return watchComments(brew.id, setComments);
  }, [brew]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!brew || brew.id.startsWith("sample-") || !name.trim() || !text.trim()) return;
    setPosting(true);
    try {
      await addComment(brew.id, name.trim(), text.trim());
      setText("");
    } finally {
      setPosting(false);
    }
  }

  if (brew === undefined) {
    return (
      <>
        <SiteNav />
        <main className="page">
          <p style={{ padding: "40px 0", color: "var(--ink-dim)" }}>Cargando…</p>
        </main>
      </>
    );
  }

  if (brew === null) {
    return (
      <>
        <SiteNav />
        <main className="page">
          <div className="empty-state">No encontramos esa cocción.</div>
        </main>
      </>
    );
  }

  const embedUrl = brew.youtubeUrl ? youtubeEmbedUrl(brew.youtubeUrl) : null;

  return (
    <>
      <SiteNav />
      <main className="page">
        <section className="detail-hero">
          <div
            className="detail-img"
            style={brew.heroImageUrl ? { backgroundImage: `url(${brew.heroImageUrl})` } : undefined}
          >
            <span className="badge">Cocción №{String(brew.batchNumber).padStart(3, "0")}</span>
          </div>
          <div className="detail-copy">
            <span className="style">{brew.style}</span>
            <h1>{brew.title}</h1>
            <p>{brew.description}</p>
            <div className="spec-grid">
              <div className="spec">
                <div className="v">{brew.abv}%</div>
                <div className="l">ABV</div>
              </div>
              <div className="spec">
                <div className="v">{brew.ibu}</div>
                <div className="l">IBU</div>
              </div>
              <div className="spec">
                <div className="v">{brew.og}</div>
                <div className="l"><abbr title="Original Gravity — densidad inicial del mosto">OG</abbr></div>
              </div>
              <div className="spec">
                <div className="v">{brew.fg}</div>
                <div className="l"><abbr title="Final Gravity — densidad final tras la fermentación">FG</abbr></div>
              </div>
            </div>
          </div>
        </section>

        <section className="detail-body">
          <div className="detail-col">
            <h3>Proceso del día de cocción</h3>
            <ol className="process-steps">
              {brew.processSteps.map((step) => (
                <li key={step.order}>
                  <span className="step-n">{String(step.order).padStart(2, "0")}</span>
                  {step.text}
                </li>
              ))}
            </ol>
            {embedUrl && (
              <div className="yt-embed">
                <iframe src={embedUrl} title={`Video del día de cocción — ${brew.title}`} allowFullScreen />
              </div>
            )}
          </div>
          <div className="detail-col">
            <h3>Maltas y lúpulos</h3>
            <table className="malt-bill">
              <thead>
                <tr>
                  <th>Ingrediente</th>
                  <th>Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {brew.maltBill.map((item, i) => (
                  <tr key={`malt-${i}`}>
                    <td>{item.ingredient}</td>
                    <td className="num">
                      {item.amount} {item.unit}
                    </td>
                  </tr>
                ))}
                {brew.hopSchedule.map((hop, i) => (
                  <tr key={`hop-${i}`}>
                    <td>{hop.hop}</td>
                    <td className="num">
                      {hop.amount} {hop.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="comments-block">
          <h3 style={{ fontSize: "1rem", marginBottom: 6 }}>Notas de cata</h3>
          {comments.length === 0 && (
            <p style={{ color: "var(--ink-dim)", fontSize: ".85rem" }}>Todavía no hay notas — sé el primero en probarla.</p>
          )}
          {comments.map((c) => (
            <div className="comment" key={c.id}>
              <div className="avatar">{c.name.slice(0, 1).toUpperCase()}</div>
              <div>
                <span className="who">
                  {c.name}
                  <span className="when">{new Date(c.createdAt).toLocaleDateString()}</span>
                </span>
                <p className="txt">{c.text}</p>
              </div>
            </div>
          ))}
          <form className="comment-form" onSubmit={handleSubmit}>
            <input
              aria-label="Tu nombre"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ maxWidth: 160 }}
              maxLength={40}
              required
            />
            <input
              aria-label="Nota sobre esta cocción"
              placeholder="Dejá una nota sobre esta cocción…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={500}
              required
            />
            <button className="btn primary" type="submit" disabled={posting}>
              {posting ? "Publicando…" : "Publicar"}
            </button>
          </form>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

export default function BrewPage() {
  return (
    <Suspense fallback={null}>
      <BrewDetail />
    </Suspense>
  );
}
