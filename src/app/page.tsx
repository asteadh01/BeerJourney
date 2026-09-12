import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

export default function HomePage() {
  return (
    <>
      <SiteNav active="home" />
      <main className="page">
        <section className="hero">
          <div>
            <span className="eyebrow">Nuestra historia</span>
            <h1>Dos amigos, dos cocinas, y una primera cocción muy cuestionable</h1>
            <p>
              Todo empezó con un kit barato, una hornalla y demasiada confianza. Queríamos saber qué hace falta de
              verdad para hacer cerveza desde cero — sin atajos, solo nosotros, nuestras casas y el equipo que
              pudiéramos conseguir. Esto es el registro de todo eso: qué cocinamos, qué salió mal, y qué volveríamos
              a hacer.
            </p>
            <div className="hero-actions">
              <Link className="btn primary" href="/brews">
                Ver las cervezas
              </Link>
            </div>
          </div>
          <div className="hero-visual" aria-hidden="true" />
        </section>

        <div className="section-head">
          <h3>De qué se trata esto</h3>
        </div>
        <p style={{ color: "var(--ink-dim)", maxWidth: "60ch", lineHeight: 1.7, marginTop: 8 }}>
          Dos cerveceros caseros, registrando cada cocción, cada receta y cada idea rara que valga la pena
          probar en el camino. Pasá por <Link href="/brews">Cervezas</Link> para ver el registro completo.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
