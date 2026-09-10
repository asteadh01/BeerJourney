"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { deleteBrew, updateBrew, watchAllBrews } from "@/lib/brews";
import type { Brew } from "@/lib/types";

export default function AdminBrewsPage() {
  const [brews, setBrews] = useState<Brew[]>([]);

  useEffect(() => watchAllBrews(setBrews), []);

  async function togglePublish(brew: Brew) {
    await updateBrew(brew.id, { status: brew.status === "published" ? "draft" : "published" });
  }

  async function remove(brew: Brew) {
    if (!confirm(`Delete "${brew.title}"? This can't be undone.`)) return;
    await deleteBrew(brew.id);
  }

  return (
    <>
      <div className="admin-head">
        <h2>Brews</h2>
        <Link className="btn primary" href="/admin/brews/new">
          + New batch
        </Link>
      </div>
      {brews.length === 0 ? (
        <div className="empty-state">No batches yet. Log your first brew.</div>
      ) : (
        <table className="admin-table">
          <tbody>
            <tr>
              <th>Batch</th>
              <th>Style</th>
              <th>ABV</th>
              <th>Status</th>
              <th></th>
            </tr>
            {brews.map((brew) => (
              <tr key={brew.id}>
                <td>
                  <span
                    className="row-thumb"
                    style={brew.heroImageUrl ? { backgroundImage: `url(${brew.heroImageUrl})` } : undefined}
                  />
                  №{String(brew.batchNumber).padStart(3, "0")} {brew.title}
                </td>
                <td>{brew.style}</td>
                <td>{brew.abv}%</td>
                <td>
                  <span className={`status-pill ${brew.status}`}>
                    {brew.status === "published" ? "Published" : "Draft"}
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <Link className="btn" href={`/admin/brews/edit?id=${brew.id}`}>
                      Edit
                    </Link>
                    <button className="btn" onClick={() => togglePublish(brew)}>
                      {brew.status === "published" ? "Unpublish" : "Publish"}
                    </button>
                    <button className="btn danger" onClick={() => remove(brew)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
