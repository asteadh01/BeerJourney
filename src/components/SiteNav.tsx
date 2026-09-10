import Link from "next/link";

interface SiteNavProps {
  active?: "brews" | "process" | "videos" | "about";
}

export function SiteNav({ active }: SiteNavProps) {
  return (
    <nav className="nav">
      <Link className="brand" href="/">
        <span className="mark" />
        Batch Log
      </Link>
      <Link className={`navlink ${active === "brews" ? "active" : ""}`} href="/">
        Brews
      </Link>
      <Link className={`navlink ${active === "process" ? "active" : ""}`} href="/process">
        Process
      </Link>
      <Link className={`navlink ${active === "videos" ? "active" : ""}`} href="/videos">
        Videos
      </Link>
      <Link className={`navlink ${active === "about" ? "active" : ""}`} href="/about">
        About
      </Link>
      <div className="spacer" />
    </nav>
  );
}
