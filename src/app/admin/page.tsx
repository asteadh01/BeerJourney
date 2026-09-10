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
        <h2>Panel</h2>
        <Link className="btn primary" href="/admin/brews/new">
          + Nueva cocción
        </Link>
      </div>
      <div className="stats-strip" style={{ border: "1px solid var(--line)", borderRadius: 10, marginBottom: 24 }}>
        <div className="stat">
          <div className="n">{brews.length}</div>
          <div className="l">Total de cocciones</div>
        </div>
        <div className="stat">
          <div className="n">{published}</div>
          <div className="l">Publicadas</div>
        </div>
        <div className="stat">
          <div className="n">{drafts}</div>
          <div className="l">Borradores</div>
        </div>
      </div>
      <p style={{ color: "var(--ink-dim)", fontSize: ".88rem" }}>
        Administrá recetas, fotos y videos en <b>Cervezas</b>. Moderá las notas de cata públicas en{" "}
        <b>Comentarios</b>.
      </p>
    </>
  );
}
