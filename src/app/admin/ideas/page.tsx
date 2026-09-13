"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { deleteIdea, watchIdeas } from "@/lib/ideas";
import { getProfile } from "@/lib/profiles";
import type { Idea, IdeaStatus } from "@/lib/types";

const FILTERS: { key: "todas" | IdeaStatus; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "activa", label: "Activas" },
  { key: "convertida", label: "Convertidas" },
  { key: "descartada", label: "Descartadas" },
];

const STATUS_LABEL: Record<IdeaStatus, string> = {
  activa: "Activa",
  convertida: "Convertida",
  descartada: "Descartada",
};

function initials(name: string): string {
  return name.trim().slice(0, 2).toUpperCase() || "?";
}

export default function AdminIdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [authors, setAuthors] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<"todas" | IdeaStatus>("todas");

  useEffect(() => watchIdeas(setIdeas), []);

  useEffect(() => {
    const uids = Array.from(new Set(ideas.map((i) => i.createdBy).filter(Boolean)));
    const missing = uids.filter((uid) => !(uid in authors));
    if (missing.length === 0) return;
    Promise.all(
      missing.map(async (uid) => {
        const profile = await getProfile(uid);
        return [uid, profile?.displayName || "?"] as const;
      }),
    ).then((entries) => setAuthors((prev) => ({ ...prev, ...Object.fromEntries(entries) })));
  }, [ideas, authors]);

  const filtered = useMemo(
    () => (filter === "todas" ? ideas : ideas.filter((i) => i.status === filter)),
    [ideas, filter],
  );

  async function remove(idea: Idea) {
    if (!confirm(`¿Eliminar la idea "${idea.title}"? Esta acción no se puede deshacer.`)) return;
    await deleteIdea(idea.id);
  }

  return (
    <>
      <div className="admin-head">
        <h2>Ideas</h2>
        <Link className="btn primary" href="/admin/ideas/new">
          + Nueva idea
        </Link>
      </div>

      <div className="filter-chips">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`filter-chip ${filter === f.key ? "on" : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          {ideas.length === 0 ? "Todavía no hay ideas anotadas." : "No hay ideas con este estado."}
        </div>
      ) : (
        <div className="idea-board">
          {filtered.map((idea) => (
            <div className="idea-card" key={idea.id}>
              <div className="idea-card-head">
                <div className="idea-card-title">
                  <span className="avatar-chip" title={authors[idea.createdBy]}>
                    {initials(authors[idea.createdBy] ?? "")}
                  </span>
                  <h3>{idea.title}</h3>
                </div>
                <span className={`status-pill ${idea.status}`}>{STATUS_LABEL[idea.status]}</span>
              </div>
              <p className="idea-card-style">
                {idea.style || "Estilo sin definir"}
                {idea.targetAbv ? ` · ABV objetivo ~${idea.targetAbv}% (sin confirmar)` : ""}
              </p>
              {idea.why && <p className="idea-card-why">{idea.why}</p>}
              {(idea.maltBill.length > 0 || idea.hopSchedule.length > 0 || idea.otherIngredients.length > 0) && (
                <div className="idea-tags">
                  {idea.maltBill.map((m, i) => (
                    <span key={`m${i}`}>{m.ingredient}</span>
                  ))}
                  {idea.hopSchedule.map((h, i) => (
                    <span key={`h${i}`}>{h.hop}</span>
                  ))}
                  {idea.otherIngredients.map((o, i) => (
                    <span key={`o${i}`}>{o}</span>
                  ))}
                </div>
              )}
              <div className="idea-card-actions">
                {idea.status === "convertida" && idea.experimentGroupId ? (
                  <Link className="btn" style={{ flex: 1, justifyContent: "center" }} href={`/admin/brews/edit?id=${idea.experimentGroupId}`}>
                    Ver experimento →
                  </Link>
                ) : (
                  <Link className="btn" style={{ flex: 1, justifyContent: "center" }} href={`/admin/ideas/edit?id=${idea.id}`}>
                    Editar
                  </Link>
                )}
                <button className="btn danger" onClick={() => remove(idea)}>
                  Eliminar
                </button>
              </div>
              <div className="idea-card-foot">
                <span>{authors[idea.createdBy] ?? "…"}</span>
                <span>{new Date(idea.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
