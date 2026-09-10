import Link from "next/link";

interface SiteNavProps {
  active?: "home" | "brews" | "experiments" | "process" | "videos" | "about";
}

export function SiteNav({ active }: SiteNavProps) {
  return (
    <nav className="nav">
      <Link className="brand" href="/">
        <span className="mark" />
        Bitácora Cervecera
      </Link>
      <Link className={`navlink ${active === "home" ? "active" : ""}`} href="/">
        Inicio
      </Link>
      <Link className={`navlink ${active === "brews" ? "active" : ""}`} href="/brews">
        Cervezas
      </Link>
      <Link className={`navlink ${active === "experiments" ? "active" : ""}`} href="/experiments">
        Experimentos
      </Link>
      <Link className={`navlink ${active === "process" ? "active" : ""}`} href="/process">
        Proceso
      </Link>
      <Link className={`navlink ${active === "videos" ? "active" : ""}`} href="/videos">
        Videos
      </Link>
      <Link className={`navlink ${active === "about" ? "active" : ""}`} href="/about">
        Nosotros
      </Link>
      <div className="spacer" />
    </nav>
  );
}
