import type { Brew } from "./types";

/**
 * Shown only while Firestore has zero published brews, so the site never
 * looks broken before the first real batch is logged.
 */
export const sampleBrews: Brew[] = [
  {
    id: "sample-1",
    slug: "porter-ahumada-tercer-intento",
    batchNumber: 14,
    title: "Porter Ahumada, Tercer Intento",
    style: "Porter Ahumada",
    status: "published",
    brewedOn: "2026-09-06",
    summary: "Malta ahumada con madera de cerezo, notas de cacao y fogata.",
    description:
      "Tercer intento con una porter, esta vez con malta ahumada con madera de cerezo reducida al 12% de la molienda y un enfriado rápido antes de embarrilar — mucho más limpia en el humo, menos a cenicero.",
    abv: 6.4,
    ibu: 28,
    og: 1.062,
    fg: 1.014,
    mashTempC: 67,
    fermentationDays: 12,
    maltBill: [
      { amount: "4.1", unit: "kg", ingredient: "Maris Otter" },
      { amount: "0.7", unit: "kg", ingredient: "Malta ahumada con cerezo" },
      { amount: "0.34", unit: "kg", ingredient: "Malta chocolate" },
      { amount: "0.23", unit: "kg", ingredient: "Crystal 60L" },
    ],
    hopSchedule: [
      { amount: "28", unit: "g", hop: "Fuggle", timing: "60 min" },
      { amount: "14", unit: "g", hop: "East Kent Goldings", timing: "5 min" },
    ],
    processSteps: [
      { order: 1, text: "Maceración de la molienda a 152°F durante 60 min, infusión simple." },
      { order: 2, text: "Lavado del grano para juntar 7 gal de mosto, hervido 60 min." },
      { order: 3, text: "Agregado de lúpulo a los 60 y 5 min." },
      { order: 4, text: "Enfriado a 66°F, inoculado con Wyeast 1056, fermentado 12 días." },
      { order: 5, text: "Enfriado en frío 48 hs, embarrilado y carbonatado forzado a 12 psi." },
    ],
    photoUrls: [],
    createdBy: "sample",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    recipeGroupId: "sample-1",
    previousBatchId: "",
  },
];
