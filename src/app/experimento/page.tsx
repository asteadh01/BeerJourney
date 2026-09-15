"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { getBrewsByRecipeGroup } from "@/lib/brews";
import { diffByName } from "@/lib/diff";
import type { Brew, HopAddition, MaltBillItem } from "@/lib/types";

function IngredientTable({ title, rows }: { title: string; rows: { ingredient: string; amount: string }[] }) {
  return (
    <>
      <h3>{title}</h3>
      <table className="malt-bill">
        <thead>
          <tr>
            <th>Ingrediente</th>
            <th>Cantidad</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{r.ingredient}</td>
              <td className="num">{r.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function IngredientDiff({
  title,
  current,
  previous,
  getName,
  getAmount,
}: {
  title: string;
  current: (MaltBillItem | HopAddition)[];
  previous: (MaltBillItem | HopAddition)[];
  getName: (i: MaltBillItem | HopAddition) => string;
  getAmount: (i: MaltBillItem | HopAddition) => string;
}) {
  const { entries, removed } = diffByName(current, previous, getName, getAmount);
  return (
    <>
      <h3>{title}</h3>
      <table className="malt-bill">
        <thead>
          <tr>
            <th>Ingrediente</th>
            <th>Cantidad</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(({ item, tag }, i) => (
            <tr key={i} className={tag === "new" ? "diff-row-added" : undefined}>
              <td>
                {getName(item)}
                {tag === "new" && <span className="diff-tag diff-tag-new">nuevo</span>}
                {tag === "changed" && <span className="diff-tag diff-tag-changed">cambió</span>}
              </td>
              <td className="num">{getAmount(item)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {removed.length > 0 && (
        <p className="diff-removed">Se sacó: {removed.map((r) => getName(r)).join(", ")}</p>
      )}
    </>
  );
}

function ExperimentoDetail() {
  const params = useSearchParams();
  const groupId = params.get("group") ?? "";
  const [tries, setTries] = useState<Brew[] | null | undefined>(undefined);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!groupId) return;
    getBrewsByRecipeGroup(groupId).then((batches) => {
      const sorted = [...batches].sort((a, b) => a.batchNumber - b.batchNumber);
      setTries(sorted.length > 0 ? sorted : null);
      setSelected(Math.max(0, sorted.length - 1));
    });
  }, [groupId]);

  const official = useMemo(() => tries?.find((b) => b.status === "published"), [tries]);

  if (tries === undefined) {
    return (
      <>
        <SiteNav active="experimentos" />
        <main className="page">
          <p style={{ padding: "40px 0", color: "var(--ink-dim)" }}>Cargando…</p>
        </main>
        <SiteFooter />
      </>
    );
  }

  if (tries === null) {
    return (
      <>
        <SiteNav active="experimentos" />
        <main className="page">
          <div className="empty-state">No encontramos ese experimento.</div>
        </main>
        <SiteFooter />
      </>
    );
  }

  const t = tries[selected];
  const prev = selected > 0 ? tries[selected - 1] : null;

  return (
    <>
      <SiteNav active="experimentos" />
      <main className="page">
        <Link href="/experimentos" className="crumb">
          ← Experimentos
        </Link>
        <div className="exp-head">
          <div>
            <h1 style={{ fontSize: "1.7rem" }}>{t.title}</h1>
            <p style={{ color: "var(--ink-dim)", fontSize: "0.85rem", marginTop: 4 }}>
              {t.style} · {tries.length} {tries.length === 1 ? "intento registrado" : "intentos registrados"}
            </p>
          </div>
          {official && (
            <Link className="btn" href={`/brew?slug=${official.slug}`}>
              Ver ficha oficial →
            </Link>
          )}
        </div>

        <div className="try-rail">
          {tries.map((b, i) => (
            <button key={b.id} className={`try-chip ${i === selected ? "sel" : ""}`} onClick={() => setSelected(i)}>
              {b.status === "published" && <span className="crown">★</span>}
              Intento {b.batchNumber} · {b.brewedOn}
            </button>
          ))}
        </div>

        {t.status === "published" && (
          <div className="official-note">
            ★ Este intento se convirtió en la receta oficial de <strong>{t.title}</strong>.
          </div>
        )}
        {t.changeNote && (
          <div className="change-note">
            <b>Qué cambió respecto al intento anterior</b>
            {t.changeNote}
          </div>
        )}
        {t.summary && <p style={{ color: "var(--ink-dim)", fontSize: "0.85rem", maxWidth: "70ch", marginBottom: 18 }}>{t.summary}</p>}

        <div className="spec-grid" style={{ marginBottom: 24 }}>
          <div className="spec">
            <div className="v">{t.abv}%</div>
            <div className="l">ABV</div>
          </div>
          <div className="spec">
            <div className="v">{t.ibu}</div>
            <div className="l">IBU</div>
          </div>
          <div className="spec">
            <div className="v">{t.og}</div>
            <div className="l">OG</div>
          </div>
          <div className="spec">
            <div className="v">{t.fg}</div>
            <div className="l">FG</div>
          </div>
        </div>

        <div className="detail-body">
          <div className="detail-col">
            <h3>Proceso — intento {t.batchNumber}</h3>
            <ol className="process-steps">
              {t.processSteps.map((step) => (
                <li key={step.order}>
                  <span className="step-n">{String(step.order).padStart(2, "0")}</span>
                  {step.text}
                </li>
              ))}
            </ol>
          </div>
          <div className="detail-col">
            {prev ? (
              <>
                <IngredientDiff
                  title="Maltas"
                  current={t.maltBill}
                  previous={prev.maltBill}
                  getName={(i) => (i as MaltBillItem).ingredient}
                  getAmount={(i) => `${i.amount} ${(i as MaltBillItem).unit}`}
                />
                <IngredientDiff
                  title="Lúpulos"
                  current={t.hopSchedule}
                  previous={prev.hopSchedule}
                  getName={(i) => (i as HopAddition).hop}
                  getAmount={(i) => `${i.amount} ${(i as HopAddition).unit}`}
                />
              </>
            ) : (
              <>
                <IngredientTable
                  title="Maltas"
                  rows={t.maltBill.map((m) => ({ ingredient: m.ingredient, amount: `${m.amount} ${m.unit}` }))}
                />
                <IngredientTable
                  title="Lúpulos"
                  rows={t.hopSchedule.map((h) => ({ ingredient: h.hop, amount: `${h.amount} ${h.unit}` }))}
                />
              </>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

export default function ExperimentoPage() {
  return (
    <Suspense fallback={null}>
      <ExperimentoDetail />
    </Suspense>
  );
}
