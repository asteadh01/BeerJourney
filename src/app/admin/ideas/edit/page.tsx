"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { IdeaForm } from "@/components/admin/IdeaForm";
import { getIdeaById } from "@/lib/ideas";
import type { Idea } from "@/lib/types";

function EditIdeaForm() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const [idea, setIdea] = useState<Idea | null | undefined>(undefined);

  useEffect(() => {
    if (!id) return;
    getIdeaById(id).then(setIdea);
  }, [id]);

  if (idea === undefined) return <p style={{ color: "var(--ink-dim)" }}>Cargando…</p>;
  if (idea === null) return <div className="empty-state">Idea no encontrada.</div>;

  return (
    <>
      <div className="admin-head">
        <h2>Editar idea</h2>
      </div>
      <IdeaForm ideaId={id} initial={idea} />
    </>
  );
}

export default function EditIdeaPage() {
  return (
    <Suspense fallback={null}>
      <EditIdeaForm />
    </Suspense>
  );
}
