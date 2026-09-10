import type { Brew } from "./types";

/**
 * Shown only while Firestore has zero published brews, so the site never
 * looks broken before the first real batch is logged.
 */
export const sampleBrews: Brew[] = [
  {
    id: "sample-1",
    slug: "smoked-porter-take-three",
    batchNumber: 14,
    title: "Smoked Porter, Take Three",
    style: "Smoked Porter",
    status: "published",
    brewedOn: "2026-09-06",
    summary: "Cherrywood-smoked malt, notes of cocoa and campfire.",
    description:
      "Third crack at a porter, this time with cherrywood-smoked malt cut back to 12% of the grist and a cold crash before kegging — much cleaner campfire note, less ashtray.",
    abv: 6.4,
    ibu: 28,
    og: 1.062,
    fg: 1.014,
    mashTempF: 152,
    fermentationDays: 12,
    maltBill: [
      { ingredient: "Maris Otter", amount: "9 lb" },
      { ingredient: "Cherrywood smoked malt", amount: "1.5 lb" },
      { ingredient: "Chocolate malt", amount: "0.75 lb" },
      { ingredient: "Crystal 60L", amount: "0.5 lb" },
    ],
    hopSchedule: [
      { hop: "Fuggle", timing: "60 min" },
      { hop: "East Kent Goldings", timing: "5 min" },
    ],
    processSteps: [
      { order: 1, text: "Mashed grain bill at 152°F for 60 min, single infusion." },
      { order: 2, text: "Sparged to collect 7 gal of wort, boiled 60 min." },
      { order: 3, text: "Hop additions at 60 and 5 min." },
      { order: 4, text: "Chilled to 66°F, pitched Wyeast 1056, fermented 12 days." },
      { order: 5, text: "Cold-crashed 48 hrs, kegged and force-carbed at 12 psi." },
    ],
    photoUrls: [],
    createdBy: "sample",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];
