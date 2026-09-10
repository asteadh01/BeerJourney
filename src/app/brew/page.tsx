"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SiteNav } from "@/components/SiteNav";
import { addComment, getBrewBySlug, watchComments } from "@/lib/brews";
import { sampleBrews } from "@/lib/sampleBrews";
import type { Brew, Comment } from "@/lib/types";
import { youtubeEmbedUrl } from "@/lib/youtube";

function BrewDetail() {
  const params = useSearchParams();
  const slug = params.get("slug") ?? "";

  const [brew, setBrew] = useState<Brew | null | undefined>(undefined);
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const sample = sampleBrews.find((b) => b.slug === slug);
    if (sample) {
      setBrew(sample);
      return;
    }
    getBrewBySlug(slug).then(setBrew);
  }, [slug]);

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
        <div className="page">
          <p style={{ padding: "40px 0", color: "var(--ink-dim)" }}>Loading…</p>
        </div>
      </>
    );
  }

  if (brew === null) {
    return (
      <>
        <SiteNav />
        <div className="page">
          <div className="empty-state">Couldn&apos;t find that brew.</div>
        </div>
      </>
    );
  }

  const embedUrl = brew.youtubeUrl ? youtubeEmbedUrl(brew.youtubeUrl) : null;

  return (
    <>
      <SiteNav />
      <div className="page">
        <section className="detail-hero">
          <div
            className="detail-img"
            style={brew.heroImageUrl ? { backgroundImage: `url(${brew.heroImageUrl})` } : undefined}
          >
            <span className="badge">Batch №{String(brew.batchNumber).padStart(3, "0")}</span>
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
                <div className="l">OG</div>
              </div>
              <div className="spec">
                <div className="v">{brew.fg}</div>
                <div className="l">FG</div>
              </div>
            </div>
          </div>
        </section>

        <section className="detail-body">
          <div className="detail-col">
            <h3>Brew-day process</h3>
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
                <iframe src={embedUrl} title={`${brew.title} brew day video`} allowFullScreen />
              </div>
            )}
          </div>
          <div className="detail-col">
            <h3>Malt &amp; hop bill</h3>
            <table className="malt-bill">
              <tbody>
                <tr>
                  <th>Ingredient</th>
                  <th>Amount</th>
                </tr>
                {brew.maltBill.map((item) => (
                  <tr key={item.ingredient}>
                    <td>{item.ingredient}</td>
                    <td className="num">{item.amount}</td>
                  </tr>
                ))}
                {brew.hopSchedule.map((hop) => (
                  <tr key={hop.hop + hop.timing}>
                    <td>{hop.hop}</td>
                    <td className="num">{hop.timing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="comments-block">
          <h3 style={{ fontSize: "1rem", marginBottom: 6 }}>Taster notes</h3>
          {comments.length === 0 && <p style={{ color: "var(--ink-dim)", fontSize: ".85rem" }}>No notes yet — be the first to try it.</p>}
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
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ maxWidth: 160 }}
              maxLength={40}
              required
            />
            <input
              placeholder="Leave a note on this batch…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={500}
              required
            />
            <button className="btn primary" style={{ borderRadius: 100 }} type="submit" disabled={posting}>
              {posting ? "Posting…" : "Post"}
            </button>
          </form>
        </section>
      </div>
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
