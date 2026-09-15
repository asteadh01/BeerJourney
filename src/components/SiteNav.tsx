import Link from "next/link";

interface SiteNavProps {
  active?: "home" | "brews" | "experimentos" | "videos" | "about";
}

export function SiteNav({ active }: SiteNavProps) {
  return (
    <div className="nav-bar">
      <nav className="nav">
        <Link className="brand" href="/">
          <span className="mark" />
          Bitácora Cervecera
        </Link>
        <input type="checkbox" id="nav-toggle" className="nav-toggle" />
        <label htmlFor="nav-toggle" className="nav-toggle-btn" aria-label="Abrir menú">
          <span />
          <span />
          <span />
        </label>
        <div className="nav-links">
          <Link className={`navlink ${active === "home" ? "active" : ""}`} href="/">
            Inicio
          </Link>
          <Link className={`navlink ${active === "brews" ? "active" : ""}`} href="/brews">
            Cervezas
          </Link>
          <Link className={`navlink ${active === "experimentos" ? "active" : ""}`} href="/experimentos">
            Experimentos
          </Link>
          <Link className={`navlink ${active === "videos" ? "active" : ""}`} href="/videos">
            Videos
          </Link>
        </div>
      </nav>
    </div>
  );
}
