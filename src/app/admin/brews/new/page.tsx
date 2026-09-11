"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BrewForm } from "@/components/admin/BrewForm";
import { buildNextBatchDraft, getBrewById } from "@/lib/brews";
import type { Brew } from "@/lib/types";

type Draft = Omit<Brew, "id" | "createdAt" | "updatedAt">;

function NewBrewForm() {
  const params = useSearchParams();
  const fromId = params.get("fromId") ?? "";
  const [draft, setDraft] = useState<Draft | null | undefined>(fromId ? undefined : null);

  useEffect(() => {
    if (!fromId) return;
    getBrewById(fromId).then((source) => setDraft(source ? buildNextBatchDraft(source) : null));
  }, [fromId]);

  if (draft === undefined) return <p style={{ color: "var(--ink-dim)" }}>Cargando…</p>;

  return (
    <>
      <div className="admin-head">
        <h2>{fromId ? "Nuevo batch" : "Nueva cocción"}</h2>
      </div>
      <BrewForm initial={draft ?? undefined} />
    </>
  );
}

export default function NewBrewPage() {
  return (
    <Suspense fallback={null}>
      <NewBrewForm />
    </Suspense>
  );
}
