"use client";

import { useEffect, useState } from "react";
import { addGravityReading, deleteGravityReading, watchGravityReadings } from "@/lib/brews";
import type { GravityReading } from "@/lib/types";

interface GravityLogProps {
  brewId: string;
}

export function GravityLog({ brewId }: GravityLogProps) {
  const [readings, setReadings] = useState<GravityReading[]>([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [gravity, setGravity] = useState("1.010");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => watchGravityReadings(brewId, setReadings), [brewId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const gravityValue = Number(gravity);
    if (!date || Number.isNaN(gravityValue)) return;
    setSaving(true);
    try {
      await addGravityReading(brewId, date, gravityValue, note.trim());
      setNote("");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta lectura?")) return;
    await deleteGravityReading(id);
  }

  return (
    <div className="field" style={{ marginTop: 30 }}>
      <label>Registro de fermentación (densidades)</label>

      {readings.length === 0 ? (
        <p style={{ color: "var(--ink-dim)", margin: "6px 0 12px" }}>
          Todavía no cargaste lecturas de densidad para este batch.
        </p>
      ) : (
        <table className="admin-table" style={{ marginBottom: 14 }}>
          <tbody>
            <tr>
              <th>Fecha</th>
              <th>Densidad</th>
              <th>Nota</th>
              <th></th>
            </tr>
            {readings.map((reading) => (
              <tr key={reading.id}>
                <td>{reading.date}</td>
                <td>{reading.gravity.toFixed(3)}</td>
                <td>{reading.note}</td>
                <td>
                  <button type="button" className="icon-btn" onClick={() => handleDelete(reading.id)}>
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <form onSubmit={handleAdd} className="repeat-row" style={{ gridTemplateColumns: "auto auto 1fr auto" }}>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        <input
          type="number"
          step="0.001"
          placeholder="Densidad"
          value={gravity}
          onChange={(e) => setGravity(e.target.value)}
          required
        />
        <input placeholder="Nota (opcional)" value={note} onChange={(e) => setNote(e.target.value)} />
        <button type="submit" className="btn" disabled={saving}>
          {saving ? "Guardando…" : "+ Agregar lectura"}
        </button>
      </form>
    </div>
  );
}
