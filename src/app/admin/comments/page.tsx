"use client";

import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Comment } from "@/lib/types";

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    const q = query(collection(db, "comments"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Comment));
    });
  }, []);

  async function remove(id: string) {
    if (!confirm("Delete this comment?")) return;
    await deleteDoc(doc(db, "comments", id));
  }

  return (
    <>
      <div className="admin-head">
        <h2>Comments</h2>
      </div>
      {comments.length === 0 ? (
        <div className="empty-state">No taster notes yet.</div>
      ) : (
        <table className="admin-table">
          <tbody>
            <tr>
              <th>Name</th>
              <th>Note</th>
              <th>Posted</th>
              <th></th>
            </tr>
            {comments.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.text}</td>
                <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                <td>
                  <button className="btn danger" onClick={() => remove(c.id)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
