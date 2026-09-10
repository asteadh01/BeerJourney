"use client";

import { useEffect, useState } from "react";
import { SiteNav } from "@/components/SiteNav";
import { watchPublishedBrews } from "@/lib/brews";
import { youtubeEmbedUrl } from "@/lib/youtube";
import type { Brew } from "@/lib/types";

export default function VideosPage() {
  const [brews, setBrews] = useState<Brew[]>([]);

  useEffect(() => watchPublishedBrews(setBrews), []);

  const withVideo = brews.filter((b) => b.youtubeUrl);

  return (
    <>
      <SiteNav active="videos" />
      <div className="page">
        <div className="section-head">
          <h3>Videos del día de cocción</h3>
        </div>
        {withVideo.length === 0 ? (
          <div className="empty-state">
            Todavía no hay videos vinculados — agregá una URL de YouTube a una cocción en el panel de administración.
          </div>
        ) : (
          <div className="batch-grid">
            {withVideo.map((brew) => {
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
      </div>
    </>
  );
}
