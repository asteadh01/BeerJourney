import { doc, getDoc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "./firebase";
import type { Profile } from "./types";

export async function getProfile(uid: string): Promise<Profile | null> {
  const snap = await getDoc(doc(db, "profiles", uid));
  return snap.exists() ? (snap.data() as Profile) : null;
}

export async function saveProfile(uid: string, data: Omit<Profile, "updatedAt">): Promise<void> {
  await setDoc(doc(db, "profiles", uid), { ...data, updatedAt: Date.now() });
}

export async function uploadAvatar(uid: string, file: File): Promise<string> {
  const path = `profiles/${uid}/avatar-${Date.now()}`;
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}
