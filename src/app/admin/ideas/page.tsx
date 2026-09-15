"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { deleteIdea, watchIdeas } from "@/lib/ideas";
import { getProfile } from "@/lib/profiles";
import { useAuth } from "@/lib/useAuth";
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
  const { user } = useAuth();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [authors, setAuthors] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<"todas" | IdeaStatus>("todas");
  const [previewId, setPreviewId] = useState<string | null>(null);

  useEffect(() => watchIdeas(setIdeas), []);

  useEffect(() => {
    const uids = Array.from(new Set(ideas.map((i) => i.createdBy).filter(Boolean)));
    const missing = uids.filter((uid) => !(uid in authors));
    if (missing.length === 0) return;
    Promise.all(
      missing.map(async (uid) => {
        const profile = await getProfile(uid);
        if (profile?.displayName) return [uid, profile.displayName] as const;
        // No profile saved yet — fall back to the session's own email
        // (asteadh01@… → "asteadh01") rather than showing a bare "?".
        if (uid === user?.uid && user?.email) return [uid, user.email.split("@")[0]] as const;
        return [uid, "Cervecero"] as const;
      }),
    ).then((entries) => setAuthors((prev) => ({ ...prev, ...Object.fromEntries(entries) })));
  }, [ideas, authors, user]);

  const filtered = useMemo(
    () => (filter === "todas" ? ideas : ideas.filter((i) => i.status === filter)),
    [ideas, filter],
  );

  const preview = ideas.find((i) => i.id === previewId) ?? null;

  async function remove(idea: Idea) {
    if (!confirm(`¿Eliminar la idea "${idea.title}"? Esta acción no se puede deshacer.`)) return;
    await deleteIdea(idea.id);
    if (previewId === idea.id) setPreviewId(null);
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
            <div
              className="idea-card"
              key={idea.id}
              onClick={() => setPreviewId(idea.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setPreviewId(idea.id);
                }
              }}
              role="button"
              tabIndex={0}
            >
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
              {(idea.maltBill.length > 0 || idea.hopSchedule.length > 0) && (
                <div className="idea-tags">
                  {idea.maltBill.map((m, i) => (
                    <span key={`m${i}`}>{m.ingredient}</span>
                  ))}
                  {idea.hopSchedule.map((h, i) => (
                    <span key={`h${i}`}>{h.hop}</span>
                  ))}
                </div>
              )}
              {idea.otherIngredients.length > 0 && (
                <p className="idea-card-other">{idea.otherIngredients.join(", ")}</p>
              )}
              <div className="idea-card-actions" onClick={(e) => e.stopPropagation()}>
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

      {preview && (
        <div className="modal-overlay" onClick={() => setPreviewId(null)}>
          <div className="modal-panel wide" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div>
                <h3 style={{ marginBottom: 4 }}>{preview.title}</h3>
                <span className={`status-pill ${preview.status}`}>{STATUS_LABEL[preview.status]}</span>
              </div>
              <button className="modal-close" onClick={() => setPreviewId(null)} aria-label="Cerrar">
                ×
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-label">Estilo</p>
              <p>
                {preview.style || "Sin definir"}
                {preview.targetAbv ? ` · ABV objetivo ~${preview.targetAbv}% (sin confirmar)` : ""}
              </p>

              {preview.why && (
                <>
                  <p className="modal-label">¿Por qué probarla?</p>
                  <p className="multiline">{preview.why}</p>
                </>
              )}

              {preview.maltBill.length > 0 && (
                <>
                  <p className="modal-label">Maltas</p>
                  <table className="malt-bill">
                    <tbody>
                      {preview.maltBill.map((m, i) => (
                        <tr key={i}>
                          <td>{m.ingredient}</td>
                          <td className="num">
                            {m.amount} {m.unit}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {preview.hopSchedule.length > 0 && (
                <>
                  <p className="modal-label">Lúpulos</p>
                  <table className="malt-bill">
                    <tbody>
                      {preview.hopSchedule.map((h, i) => (
                        <tr key={i}>
                          <td>{h.hop}</td>
                          <td className="num">
                            {h.amount} {h.unit}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {preview.otherIngredients.length > 0 && (
                <>
                  <p className="modal-label">Otros ingredientes</p>
                  <ul className="other-list">
                    {preview.otherIngredients.map((o, i) => (
                      <li key={i}>{o}</li>
                    ))}
                  </ul>
                </>
              )}

              {preview.notes && (
                <>
                  <p className="modal-label">Notas sueltas</p>
                  <p className="multiline">{preview.notes}</p>
                </>
              )}

              <p className="modal-label">Anotada por</p>
              <p>
                {authors[preview.createdBy] ?? "…"} ·{" "}
                {new Date(preview.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>

            <div className="modal-actions">
              {preview.status === "convertida" && preview.experimentGroupId ? (
                <Link className="btn primary" href={`/admin/brews/edit?id=${preview.experimentGroupId}`}>
                  Ver experimento →
                </Link>
              ) : (
                <Link className="btn primary" href={`/admin/ideas/edit?id=${preview.id}`}>
                  Editar
                </Link>
              )}
              <button className="btn danger" onClick={() => remove(preview)}>
                Eliminar
              </button>
              <button className="btn" onClick={() => setPreviewId(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
