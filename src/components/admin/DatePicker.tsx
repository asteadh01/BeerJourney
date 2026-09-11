"use client";

import { useEffect, useRef, useState } from "react";

interface DatePickerProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
}

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];
const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

function toIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseIso(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function formatDisplay(value: string): string {
  const d = parseIso(value);
  if (!d) return "";
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function DatePicker({ id, value, onChange }: DatePickerProps) {
  const selected = parseIso(value);
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(selected ?? new Date());
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function openPicker() {
    setViewDate(selected ?? new Date());
    setOpen(true);
  }

  function changeMonth(delta: number) {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1));
  }

  function pick(day: Date) {
    onChange(toIso(day));
    setOpen(false);
  }

  const firstOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const today = new Date();

  const cells: (Date | null)[] = [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(viewDate.getFullYear(), viewDate.getMonth(), i + 1)),
  ];

  return (
    <div className="date-picker" ref={rootRef}>
      <button id={id} type="button" className="date-picker-trigger" onClick={openPicker}>
        <span>{formatDisplay(value) || "Elegir fecha"}</span>
        <span aria-hidden="true">📅</span>
      </button>

      {open && (
        <div className="date-picker-panel">
          <div className="date-picker-header">
            <button type="button" className="icon-btn" onClick={() => changeMonth(-1)} aria-label="Mes anterior">
              ‹
            </button>
            <span>
              {MONTHS[viewDate.getMonth()]} de {viewDate.getFullYear()}
            </span>
            <button type="button" className="icon-btn" onClick={() => changeMonth(1)} aria-label="Mes siguiente">
              ›
            </button>
          </div>

          <div className="date-picker-grid date-picker-weekdays">
            {WEEKDAYS.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>

          <div className="date-picker-grid">
            {cells.map((day, i) =>
              day ? (
                <button
                  key={i}
                  type="button"
                  className={[
                    "date-picker-day",
                    selected && isSameDay(day, selected) ? "is-selected" : "",
                    isSameDay(day, today) ? "is-today" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => pick(day)}
                >
                  {day.getDate()}
                </button>
              ) : (
                <span key={i} />
              ),
            )}
          </div>

          <div className="date-picker-footer">
            <button type="button" className="date-picker-link" onClick={() => onChange("")}>
              Borrar
            </button>
            <button type="button" className="date-picker-link" onClick={() => pick(new Date())}>
              Hoy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
