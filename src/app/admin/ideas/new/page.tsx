"use client";

import { IdeaForm } from "@/components/admin/IdeaForm";

export default function NewIdeaPage() {
  return (
    <>
      <div className="admin-head">
        <h2>Nueva idea</h2>
      </div>
      <IdeaForm />
    </>
  );
}
