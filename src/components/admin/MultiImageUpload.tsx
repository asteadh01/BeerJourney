"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase";

interface MultiImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
}

// All batch photos are cropped to the same square size before upload, so the
// gallery grid never mixes aspect ratios.
const EXPORT_SIZE = 1200;

interface PixelRect {
  x: number;
  y: number;
  side: number;
}

function centeredSquare(frameW: number, frameH: number): PixelRect {
  const side = Math.min(frameW, frameH);
  return { x: (frameW - side) / 2, y: (frameH - side) / 2, side };
}

interface DragState {
  pointerX: number;
  pointerY: number;
  rectX: number;
  rectY: number;
}

export function MultiImageUpload({ value, onChange }: MultiImageUploadProps) {
  const [open, setOpen] = useState(false);
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [frameSize, setFrameSize] = useState<{ w: number; h: number } | null>(null);
  const [rect, setRect] = useState<PixelRect | null>(null);
  const [dragStart, setDragStart] = useState<DragState | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const stagedSrc = useMemo(() => (stagedFile ? URL.createObjectURL(stagedFile) : ""), [stagedFile]);

  useEffect(() => {
    if (!stagedSrc) return;
    return () => URL.revokeObjectURL(stagedSrc);
  }, [stagedSrc]);

  function openModal() {
    setError("");
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    resetCropStage();
  }

  function resetCropStage() {
    setStagedFile(null);
    setFrameSize(null);
    setRect(null);
    setDragStart(null);
    setError("");
  }

  function selectFile(file: File) {
    setError("");
    setStagedFile(file);
    setFrameSize(null);
    setRect(null);
    setDragStart(null);
  }

  function handleImageLoad() {
    const frame = frameRef.current;
    if (!frame) return;
    const box = frame.getBoundingClientRect();
    setFrameSize({ w: box.width, h: box.height });
    setRect(centeredSquare(box.width, box.height));
  }

  function pointFromEvent(e: React.PointerEvent) {
    const frame = frameRef.current;
    if (!frame) return null;
    const box = frame.getBoundingClientRect();
    const x = Math.min(Math.max(e.clientX - box.left, 0), box.width);
    const y = Math.min(Math.max(e.clientY - box.top, 0), box.height);
    return { x, y };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const point = pointFromEvent(e);
    if (!point || !rect) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragStart({ pointerX: point.x, pointerY: point.y, rectX: rect.x, rectY: rect.y });
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragStart || !rect || !frameSize) return;
    const point = pointFromEvent(e);
    if (!point) return;
    const dx = point.x - dragStart.pointerX;
    const dy = point.y - dragStart.pointerY;
    const x = Math.min(Math.max(dragStart.rectX + dx, 0), frameSize.w - rect.side);
    const y = Math.min(Math.max(dragStart.rectY + dy, 0), frameSize.h - rect.side);
    setRect({ ...rect, x, y });
  }

  function handlePointerUp() {
    setDragStart(null);
  }

  async function handleSaveCrop() {
    const img = imgRef.current;
    const frame = frameRef.current;
    if (!img || !frame || !rect || !stagedFile) return;
    setError("");
    setUploading(true);
    try {
      const box = frame.getBoundingClientRect();
      const scale = img.naturalWidth / box.width;
      const sx = rect.x * scale;
      const sy = rect.y * scale;
      const s = rect.side * scale;

      const canvas = document.createElement("canvas");
      canvas.width = EXPORT_SIZE;
      canvas.height = EXPORT_SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no-canvas-context");
      ctx.drawImage(img, sx, sy, s, s, 0, 0, EXPORT_SIZE, EXPORT_SIZE);
      const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
      if (!blob) throw new Error("no-blob");

      const name = stagedFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const path = `brews/${Date.now()}-${name}`;
      const fileRef = ref(storage, path);
      await uploadBytes(fileRef, blob);
      const url = await getDownloadURL(fileRef);
      onChange([...value, url]);
      resetCropStage();
    } catch {
      setError("No se pudo subir la imagen. Probá de nuevo.");
    } finally {
      setUploading(false);
    }
  }

  function removeAt(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  return (
    <div className="multi-image-upload">
      <div className="multi-image-grid">
        {value.slice(0, 4).map((url) => (
          <div className="multi-image-item" style={{ backgroundImage: `url(${url})` }} key={url} />
        ))}
        <button type="button" className="multi-image-add" onClick={openModal}>
          {value.length > 0 ? "Gestionar fotos" : "+ Agregar fotos"}
        </button>
      </div>

      {open && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <h3>Fotos de este batch</h3>

            {!stagedSrc ? (
              <>
                <p className="field-hint">
                  Todas las fotos se recortan a un cuadrado del mismo tamaño para que la galería quede pareja.
                </p>
                <div className="multi-image-grid" style={{ marginTop: 10 }}>
                  {value.map((url, i) => (
                    <div className="multi-image-item" style={{ backgroundImage: `url(${url})` }} key={url}>
                      <button type="button" className="icon-btn" onClick={() => removeAt(i)} aria-label="Quitar imagen">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn primary" onClick={() => inputRef.current?.click()}>
                    + Agregar foto
                  </button>
                  <button type="button" className="btn" onClick={closeModal}>
                    Listo
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="field-hint">Arrastrá el recuadro para elegir qué parte de la imagen se va a mostrar.</p>
                <div
                  ref={frameRef}
                  className="crop-frame crop-frame-move"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- canvas crop source needs a real <img>, not next/image */}
                  <img
                    ref={imgRef}
                    src={stagedSrc}
                    alt=""
                    className="crop-image"
                    draggable={false}
                    onLoad={handleImageLoad}
                  />
                  {rect && (
                    <div
                      className="crop-selection"
                      style={{
                        left: `${rect.x}px`,
                        top: `${rect.y}px`,
                        width: `${rect.side}px`,
                        height: `${rect.side}px`,
                      }}
                    />
                  )}
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn primary" onClick={handleSaveCrop} disabled={uploading}>
                    {uploading ? "Guardando…" : "Guardar recorte"}
                  </button>
                  <button type="button" className="btn" onClick={() => inputRef.current?.click()} disabled={uploading}>
                    Elegir otra imagen
                  </button>
                  <button type="button" className="btn" onClick={resetCropStage} disabled={uploading}>
                    Cancelar
                  </button>
                </div>
              </>
            )}

            {error && <p style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: 10 }}>{error}</p>}
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) selectFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
