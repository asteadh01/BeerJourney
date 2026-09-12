"use client";

import { useEffect, useState } from "react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { watchPublishedBrews } from "@/lib/brews";
import { youtubeEmbedUrl } from "@/lib/youtube";
import type { Brew } from "@/lib/types";

export default function VideosPage() {
  const [brews, setBrews] = useState<Brew[] | null>(null);

  useEffect(() => watchPublishedBrews(setBrews), []);

  return (
    <>
      <SiteNav active="videos" />
      <main className="page">
        <div className="section-head">
          <h3>Videos del día de cocción</h3>
        </div>
        {brews === null ? (
          <div className="batch-grid">
            {[0, 1, 2].map((i) => (
              <div key={i} className="batch-skeleton" />
            ))}
          </div>
        ) : brews.filter((b) => b.youtubeUrl).length === 0 ? (
          <div className="empty-state">
            Todavía no hay videos vinculados — agregá una URL de YouTube a una cocción en el panel de administración.
          </div>
        ) : (
          <div className="batch-grid">
            {brews
              .filter((b) => b.youtubeUrl)
              .map((brew) => {
                const embed = youtubeEmbedUrl(brew.youtubeUrl!);
                return (
                  <div className="batch-card" key={brew.id}>
                    {embed ? (
                      <div className="yt-embed">
                        <iframe src={embed} title={brew.title} allowFullScreen />
                      </div>
                    ) : (
                      <div className="batch-thumb" />
                    )}
                    <h4>{brew.title}</h4>
                    <p className="batch-desc">{brew.summary}</p>
                  </div>
                );
              })}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
