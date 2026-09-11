import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Brew, Comment, GravityReading } from "./types";

const brewsCol = collection(db, "brews");
const gravityReadingsCol = collection(db, "gravityReadings");

type NewBrewDraft = Omit<Brew, "id" | "createdAt" | "updatedAt">;

export function watchPublishedBrews(cb: (brews: Brew[]) => void) {
  const q = query(brewsCol, where("status", "==", "published"), orderBy("batchNumber", "desc"));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Brew)),
    (error) => console.error("watchPublishedBrews failed:", error),
  );
}

export function watchAllBrews(cb: (brews: Brew[]) => void) {
  const q = query(brewsCol, orderBy("batchNumber", "desc"));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Brew)),
    (error) => console.error("watchAllBrews failed:", error),
  );
}

// Public detail page only ever looks up published brews — a query without
// this filter gets rejected outright by firestore.rules for anyone who
// isn't admin, since rules can't verify a query's results per-document,
// only that the query itself is constrained to what the rule allows.
export async function getBrewBySlug(slug: string): Promise<Brew | null> {
  const q = query(brewsCol, where("slug", "==", slug), where("status", "==", "published"));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Brew;
}

export async function getBrewById(id: string): Promise<Brew | null> {
  const snap = await getDoc(doc(db, "brews", id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Brew) : null;
}

export async function createBrew(data: NewBrewDraft) {
  const ref = await addDoc(brewsCol, {
    ...data,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  // First batch of a recipe: it groups itself. A "new batch" draft already
  // carries the group id forward from the batch it was cloned from.
  if (!data.recipeGroupId) {
    await updateDoc(ref, { recipeGroupId: ref.id });
  }
  return ref;
}

// Builds the draft for a new batch of the same recipe, prefilled from a
// previous one: same ingredients/process, own identity (dates, status,
// photos) reset so the brewer starts a fresh log for this batch.
export function buildNextBatchDraft(source: Brew): NewBrewDraft {
  return {
    slug: "",
    batchNumber: source.batchNumber + 1,
    title: source.title,
    style: source.style,
    status: "draft",
    brewedOn: new Date().toISOString().slice(0, 10),
    summary: source.summary,
    description: source.description,
    abv: source.abv,
    ibu: source.ibu,
    og: source.og,
    fg: source.fg,
    mashTempC: source.mashTempC,
    fermentationDays: source.fermentationDays,
    maltBill: source.maltBill.map((item) => ({ ...item })),
    hopSchedule: source.hopSchedule.map((item) => ({ ...item })),
    processSteps: source.processSteps.map((step) => ({ ...step })),
    youtubeUrl: "",
    heroImageUrl: "",
    photoUrls: [],
    createdBy: source.createdBy,
    recipeGroupId: source.recipeGroupId || source.id,
    previousBatchId: source.id,
  };
}

export async function updateBrew(id: string, data: Partial<Brew>) {
  return updateDoc(doc(db, "brews", id), { ...data, updatedAt: Date.now() });
}

export async function getBrewsByRecipeGroup(recipeGroupId: string): Promise<Brew[]> {
  const q = query(brewsCol, where("recipeGroupId", "==", recipeGroupId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Brew);
}

// Title/style/summary/description describe the recipe, not a single batch,
// so editing them applies to every batch that shares this recipeGroupId.
export async function updateRecipeFields(
  recipeGroupId: string,
  fields: { title: string; style: string; summary: string; description: string },
): Promise<void> {
  const brews = await getBrewsByRecipeGroup(recipeGroupId);
  const batch = writeBatch(db);
  const now = Date.now();
  for (const brew of brews) {
    batch.update(doc(db, "brews", brew.id), { ...fields, updatedAt: now });
  }
  await batch.commit();
}

export async function deleteBrew(id: string) {
  return deleteDoc(doc(db, "brews", id));
}

export function watchComments(brewId: string, cb: (comments: Comment[]) => void) {
  const q = query(collection(db, "comments"), where("brewId", "==", brewId), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Comment)),
    (error) => console.error("watchComments failed:", error),
  );
}

export async function addComment(brewId: string, name: string, text: string) {
  return addDoc(collection(db, "comments"), {
    brewId,
    name,
    text,
    createdAt: Date.now(),
    serverTimestamp: serverTimestamp(),
  });
}

export function watchGravityReadings(brewId: string, cb: (readings: GravityReading[]) => void) {
  const q = query(gravityReadingsCol, where("brewId", "==", brewId), orderBy("date", "asc"));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as GravityReading)),
    (error) => console.error("watchGravityReadings failed:", error),
  );
}

export async function addGravityReading(brewId: string, date: string, gravity: number, note: string) {
  return addDoc(gravityReadingsCol, {
    brewId,
    date,
    gravity,
    note,
    createdAt: Date.now(),
  });
}

export async function deleteGravityReading(id: string) {
  return deleteDoc(doc(db, "gravityReadings", id));
}
