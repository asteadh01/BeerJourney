export type BrewStatus = "draft" | "published";

export type WeightUnit = "kg" | "g";

export interface MaltBillItem {
  amount: string;
  unit: WeightUnit;
  ingredient: string;
}

export interface HopAddition {
  amount: string;
  unit: WeightUnit;
  hop: string;
}

export interface ProcessStep {
  order: number;
  text: string;
}

export interface Brew {
  id: string;
  slug: string;
  batchNumber: number;
  title: string;
  style: string;
  status: BrewStatus;
  brewedOn: string;
  summary: string;
  description: string;
  abv: number;
  ibu: number;
  og: number;
  fg: number;
  mashTempC?: number;
  fermentationDays?: number;
  maltBill: MaltBillItem[];
  hopSchedule: HopAddition[];
  processSteps: ProcessStep[];
  youtubeUrl?: string;
  heroImageUrl?: string;
  photoUrls: string[];
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  // Groups every batch brewed from the same recipe. Set to the first
  // batch's own id once it's created (see createBrew in lib/brews.ts).
  recipeGroupId: string;
  // Id of the batch this one was created "as a new batch of", if any.
  previousBatchId: string;
  // Idea this recipe started from, if any (see lib/ideas.ts).
  ideaId?: string;
  // What changed in this attempt vs. the previous batch — the note that
  // separates one try from the next while a recipe is still being dialed in.
  changeNote?: string;
}

export type IdeaStatus = "activa" | "convertida" | "descartada";

export interface Idea {
  id: string;
  title: string;
  style: string;
  // Aspirational, unconfirmed — nothing has actually been brewed yet.
  targetAbv?: number;
  why: string;
  maltBill: MaltBillItem[];
  hopSchedule: HopAddition[];
  // Anything that isn't malt or hops: spices, fruit, wild yeast, scents, etc.
  otherIngredients: string[];
  notes: string;
  status: IdeaStatus;
  // Set once "Convertir en experimento" creates the first Brew — points at
  // that Brew's recipeGroupId so the idea can link back to its timeline.
  experimentGroupId?: string;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

// One gravity measurement taken during fermentation of a batch (e.g. "day 7:
// 1.020"). Stored as its own collection so a batch can have as many as needed.
export interface GravityReading {
  id: string;
  brewId: string;
  date: string;
  gravity: number;
  note?: string;
  createdAt: number;
}

export interface Comment {
  id: string;
  brewId: string;
  name: string;
  text: string;
  createdAt: number;
}

export interface Profile {
  displayName: string;
  bio: string;
  photoURL?: string;
  updatedAt: number;
}
