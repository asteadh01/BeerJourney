export type BrewStatus = "draft" | "published";

export interface MaltBillItem {
  ingredient: string;
  amount: string;
}

export interface HopAddition {
  hop: string;
  timing: string;
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
  mashTempF?: number;
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
