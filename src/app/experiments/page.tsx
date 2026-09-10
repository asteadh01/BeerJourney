import { SiteNav } from "@/components/SiteNav";

export default function ExperimentsPage() {
  return (
    <>
      <SiteNav active="experiments" />
      <div className="page">
        <div className="section-head">
          <h3>Experimentos</h3>
        </div>
        <p style={{ color: "var(--ink-dim)", maxWidth: "60ch", lineHeight: 1.7, marginTop: 8 }}>
          Texto de relleno por ahora — acá va a vivir lo divertido y fuera de lo habitual: cocciones paralelas,
          ingredientes raros, experimentos con madera o barrica, cualquier cosa que no entre en el registro
          principal.
        </p>
        <div className="empty-state">Todavía no hay experimentos registrados.</div>
      </div>
    </>
  );
}
