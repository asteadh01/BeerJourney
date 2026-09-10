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
} from "firebase/firestore";
import { db } from "./firebase";
import type { Brew, Comment } from "./types";

const brewsCol = collection(db, "brews");

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

export async function getBrewBySlug(slug: string): Promise<Brew | null> {
  const q = query(brewsCol, where("slug", "==", slug));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Brew;
}

export async function getBrewById(id: string): Promise<Brew | null> {
  const snap = await getDoc(doc(db, "brews", id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Brew) : null;
}

export async function createBrew(data: Omit<Brew, "id" | "createdAt" | "updatedAt">) {
  return addDoc(brewsCol, {
    ...data,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
}

export async function updateBrew(id: string, data: Partial<Brew>) {
  return updateDoc(doc(db, "brews", id), { ...data, updatedAt: Date.now() });
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
