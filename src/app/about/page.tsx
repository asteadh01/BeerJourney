import { SiteNav } from "@/components/SiteNav";

export default function AboutPage() {
  return (
    <>
      <SiteNav active="about" />
      <div className="page">
        <div className="section-head">
          <h3>About Batch Log</h3>
        </div>
        <p style={{ color: "var(--ink-dim)", maxWidth: "60ch", lineHeight: 1.7, marginTop: 8 }}>
          Two friends, one garage, and a running log of every beer we&apos;ve brewed — the recipes, the mistakes,
          and the ones worth doing again. Edit this page&apos;s copy in{" "}
          <code className="mono">src/app/about/page.tsx</code>.
        </p>
      </div>
    </>
  );
}
