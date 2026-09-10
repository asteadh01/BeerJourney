import { SiteNav } from "@/components/SiteNav";

export default function ExperimentsPage() {
  return (
    <>
      <SiteNav active="experiments" />
      <div className="page">
        <div className="section-head">
          <h3>Experiments</h3>
        </div>
        <p style={{ color: "var(--ink-dim)", maxWidth: "60ch", lineHeight: 1.7, marginTop: 8 }}>
          Placeholder for now — this is where the fun, off-menu stuff will live: side batches, weird ingredients,
          barrel or wood experiments, anything that doesn&apos;t belong in the main brew log.
        </p>
        <div className="empty-state">No experiments logged yet.</div>
      </div>
    </>
  );
}
