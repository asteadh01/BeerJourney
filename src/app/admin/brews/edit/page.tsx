"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BrewForm } from "@/components/admin/BrewForm";
import { GravityLog } from "@/components/admin/GravityLog";
import { getBrewById } from "@/lib/brews";
import type { Brew } from "@/lib/types";

function EditBrewForm() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const [brew, setBrew] = useState<Brew | null | undefined>(undefined);

  useEffect(() => {
    if (!id) return;
    getBrewById(id).then(setBrew);
  }, [id]);

  if (brew === undefined) return <p style={{ color: "var(--ink-dim)" }}>Cargando…</p>;
  if (brew === null) return <div className="empty-state">Cocción no encontrada.</div>;

  return (
    <>
      <div className="admin-head">
        <h2>Editar cocción</h2>
      </div>
      <BrewForm brewId={id} initial={brew} />
      <GravityLog brewId={id} />
    </>
  );
}

export default function EditBrewPage() {
  return (
    <Suspense fallback={null}>
      <EditBrewForm />
    </Suspense>
  );
}
