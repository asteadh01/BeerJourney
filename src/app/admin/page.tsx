"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { watchAllBrews } from "@/lib/brews";
import type { Brew } from "@/lib/types";

export default function AdminDashboard() {
  const [brews, setBrews] = useState<Brew[]>([]);

  useEffect(() => watchAllBrews(setBrews), []);

  const published = brews.filter((b) => b.status === "published").length;
  const drafts = brews.filter((b) => b.status === "draft").length;

  return (
    <>
      <div className="admin-head">
        <h2>Dashboard</h2>
        <Link className="btn primary" href="/admin/brews/new">
          + New batch
        </Link>
      </div>
      <div className="stats-strip" style={{ border: "1px solid var(--line)", borderRadius: 10, marginBottom: 24 }}>
        <div className="stat">
          <div className="n">{brews.length}</div>
          <div className="l">Total batches</div>
        </div>
        <div className="stat">
          <div className="n">{published}</div>
          <div className="l">Published</div>
        </div>
        <div className="stat">
          <div className="n">{drafts}</div>
          <div className="l">Drafts</div>
        </div>
      </div>
      <p style={{ color: "var(--ink-dim)", fontSize: ".88rem" }}>
        Manage recipes, photos and video links under <b>Brews</b>. Moderate public tasting notes under <b>Comments</b>.
      </p>
    </>
  );
}
