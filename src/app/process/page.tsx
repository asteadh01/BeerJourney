import { SiteNav } from "@/components/SiteNav";

export default function ProcessPage() {
  return (
    <>
      <SiteNav active="process" />
      <div className="page">
        <div className="section-head">
          <h3>Nuestro proceso</h3>
        </div>
        <p style={{ color: "var(--ink-dim)", maxWidth: "60ch", lineHeight: 1.7, marginTop: 8 }}>
          Una descripción general de cómo cocinamos — equipo, tratamiento del agua, sanitización, montaje de la
          fermentación — separado de la receta de cualquier cocción en particular. La página de cada cerveza sigue
          teniendo sus propios pasos del día de cocción.
        </p>
      </div>
    </>
  );
}
