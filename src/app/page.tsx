import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";

export default function HomePage() {
  return (
    <>
      <SiteNav active="home" />
      <div className="page">
        <section className="hero">
          <div>
            <span className="eyebrow">Our story</span>
            <h1>Two friends, two kitchens, one questionable first batch</h1>
            <p>
              It started with a cheap starter kit, a stovetop, and way too much confidence. We wanted to know what it
              actually takes to make beer from scratch — no shortcuts, just us, our houses, and whatever equipment we
              could scrounge together. This is the record of that: what we brewed, what went wrong, what we&apos;d do
              again.
            </p>
            <div className="hero-actions">
              <Link className="btn primary" href="/brews">
                See the brews
              </Link>
              <Link className="btn" href="/experiments">
                Check the experiments
              </Link>
            </div>
          </div>
          <div className="hero-visual" />
        </section>

        <div className="section-head">
          <h3>What this place is</h3>
        </div>
        <p style={{ color: "var(--ink-dim)", maxWidth: "60ch", lineHeight: 1.7, marginTop: 8 }}>
          This is placeholder copy for now — the real story goes here once we&apos;ve written it. The short version:
          two homebrewers, tracking every batch, every recipe, and every weird idea worth trying along the way. Head
          over to <Link href="/brews">Brews</Link> for the full log, or <Link href="/experiments">Experiments</Link>{" "}
          for the stuff that doesn&apos;t fit anywhere else.
        </p>
      </div>
    </>
  );
}
