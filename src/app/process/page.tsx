import { SiteNav } from "@/components/SiteNav";

export default function ProcessPage() {
  return (
    <>
      <SiteNav active="process" />
      <div className="page">
        <div className="section-head">
          <h3>Our process</h3>
        </div>
        <p style={{ color: "var(--ink-dim)", maxWidth: "60ch", lineHeight: 1.7, marginTop: 8 }}>
          A general write-up of how we brew — equipment, water treatment, sanitation, fermentation setup — separate
          from any one batch&apos;s recipe. Each brew&apos;s own page still carries its specific brew-day steps.
        </p>
      </div>
    </>
  );
}
