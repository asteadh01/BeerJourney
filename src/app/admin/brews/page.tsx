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
    if (!confirm(`¿Eliminar "${brew.title}"? Esta acción no se puede deshacer.`)) return;
    await deleteBrew(brew.id);
  }

  return (
    <>
      <div className="admin-head">
        <h2>Cervezas</h2>
        <Link className="btn primary" href="/admin/brews/new">
          + Nueva cocción
        </Link>
      </div>
      {brews.length === 0 ? (
        <div className="empty-state">Todavía no hay cocciones. Registrá tu primera cerveza.</div>
      ) : (
        <table className="admin-table">
          <tbody>
            <tr>
              <th>Cocción</th>
              <th>Estilo</th>
              <th>ABV</th>
              <th>Estado</th>
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
                    {brew.status === "published" ? "Publicada" : "Borrador"}
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <Link className="btn" href={`/admin/brews/edit?id=${brew.id}`}>
                      Editar
                    </Link>
                    <button className="btn" onClick={() => togglePublish(brew)}>
                      {brew.status === "published" ? "Despublicar" : "Publicar"}
                    </button>
                    <button className="btn danger" onClick={() => remove(brew)}>
                      Eliminar
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
