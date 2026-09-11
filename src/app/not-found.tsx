import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

export default function NotFound() {
  return (
    <>
      <SiteNav />
      <main className="page" style={{ paddingTop: 64, textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(3rem, 10vw, 5rem)", marginBottom: 12 }}>404</h1>
        <p style={{ color: "var(--ink-dim)", marginBottom: 28 }}>No encontramos esta página.</p>
        <Link className="btn primary" href="/brews">Ver las cervezas</Link>
      </main>
      <SiteFooter />
    </>
  );
}
