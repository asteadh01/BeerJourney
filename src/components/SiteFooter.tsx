import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <Link className="footer-brand" href="/">
          <span className="mark" />
          Bitácora Cervecera
        </Link>
        <span className="footer-tagline">Cocina casera, registro serio.</span>
      </div>
    </footer>
  );
}
