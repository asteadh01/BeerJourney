import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { createBrew } from "./brews";
import type { Idea } from "./types";

const ideasCol = collection(db, "ideas");

type NewIdeaDraft = Omit<Idea, "id" | "createdAt" | "updatedAt">;

export function watchIdeas(cb: (ideas: Idea[]) => void) {
  const q = query(ideasCol, orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Idea)),
    (error) => console.error("watchIdeas failed:", error),
  );
}

export async function getIdeaById(id: string): Promise<Idea | null> {
  const snap = await getDoc(doc(db, "ideas", id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Idea) : null;
}

export async function createIdea(data: NewIdeaDraft) {
  return addDoc(ideasCol, {
    ...data,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
}

export async function updateIdea(id: string, data: Partial<Idea>) {
  return updateDoc(doc(db, "ideas", id), { ...data, updatedAt: Date.now() });
}

export async function deleteIdea(id: string) {
  return deleteDoc(doc(db, "ideas", id));
}

// First real batch of an idea: starts the recipe with what's known so far
// (ingredients, target ABV as a starting og/fg guess) and links back to the
// idea it came from. The idea itself is marked "convertida" — it doesn't
// keep evolving once brewing starts for real.
type ConvertibleIdea = Pick<Idea, "id" | "title" | "style" | "targetAbv" | "why" | "maltBill" | "hopSchedule" | "createdBy">;

export async function convertIdeaToExperiment(idea: ConvertibleIdea) {
  const ref = await createBrew({
    slug: "",
    batchNumber: 1,
    title: idea.title,
    style: idea.style,
    status: "draft",
    brewedOn: new Date().toISOString().slice(0, 10),
    summary: "",
    description: idea.why,
    abv: idea.targetAbv ?? 5,
    ibu: 20,
    og: 1.05,
    fg: 1.01,
    maltBill: idea.maltBill.map((item) => ({ ...item })),
    hopSchedule: idea.hopSchedule.map((item) => ({ ...item })),
    processSteps: [{ order: 1, text: "" }],
    heroImageUrl: "",
    photoUrls: [],
    createdBy: idea.createdBy,
    recipeGroupId: "",
    previousBatchId: "",
    ideaId: idea.id,
    changeNote: "Primer intento a partir de la idea.",
  });
  await updateIdea(idea.id, { status: "convertida", experimentGroupId: ref.id });
  return ref;
}
