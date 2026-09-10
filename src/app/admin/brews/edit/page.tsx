"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BrewForm } from "@/components/admin/BrewForm";
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

  if (brew === undefined) return <p style={{ color: "var(--ink-dim)" }}>Loading…</p>;
  if (brew === null) return <div className="empty-state">Batch not found.</div>;

  return (
    <>
      <div className="admin-head">
        <h2>Edit batch</h2>
      </div>
      <BrewForm brewId={id} initial={brew} />
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
