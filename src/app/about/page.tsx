import { SiteNav } from "@/components/SiteNav";

export default function AboutPage() {
  return (
    <>
      <SiteNav active="about" />
      <div className="page">
        <div className="section-head">
          <h3>Sobre Bitácora Cervecera</h3>
        </div>
        <p style={{ color: "var(--ink-dim)", maxWidth: "60ch", lineHeight: 1.7, marginTop: 8 }}>
          Dos amigos, un garaje, y un registro constante de cada cerveza que hicimos — las recetas, los errores, y
          las que vale la pena repetir. Editá el texto de esta página en{" "}
          <code className="mono">src/app/about/page.tsx</code>.
        </p>
      </div>
    </>
  );
}
