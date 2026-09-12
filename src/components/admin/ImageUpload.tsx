"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const FULL_RECT: CropRect = { x: 0, y: 0, w: 1, h: 1 };
const MIN_SELECTION = 0.03;

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [rect, setRect] = useState<CropRect>(FULL_RECT);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
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
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setStagedFile(null);
    setDragStart(null);
    setError("");
  }

  function selectFile(file: File) {
    setStagedFile(file);
    setRect(FULL_RECT);
    setDragStart(null);
  }

  function pointFromEvent(e: React.PointerEvent) {
    const frame = frameRef.current;
    if (!frame) return null;
    const box = frame.getBoundingClientRect();
    const x = Math.min(Math.max((e.clientX - box.left) / box.width, 0), 1);
    const y = Math.min(Math.max((e.clientY - box.top) / box.height, 0), 1);
    return { x, y };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const point = pointFromEvent(e);
    if (!point) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragStart(point);
    setRect({ x: point.x, y: point.y, w: 0, h: 0 });
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragStart) return;
    const point = pointFromEvent(e);
    if (!point) return;
    setRect({
      x: Math.min(dragStart.x, point.x),
      y: Math.min(dragStart.y, point.y),
      w: Math.abs(point.x - dragStart.x),
      h: Math.abs(point.y - dragStart.y),
    });
  }

  function handlePointerUp() {
    setDragStart(null);
    setRect((r) => (r.w < MIN_SELECTION || r.h < MIN_SELECTION ? FULL_RECT : r));
  }

  async function handleSave() {
    const img = imgRef.current;
    if (!img) return;
    setError("");
    setUploading(true);
    try {
      const sx = rect.x * img.naturalWidth;
      const sy = rect.y * img.naturalHeight;
      const sw = rect.w * img.naturalWidth;
      const sh = rect.h * img.naturalHeight;
      const canvas = document.createElement("canvas");
      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no-canvas-context");
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
      if (!blob) throw new Error("no-blob");

      const name = stagedFile?.name ?? "recorte.jpg";
      const path = `brews/${Date.now()}-${name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
      const fileRef = ref(storage, path);
      await uploadBytes(fileRef, blob);
      const url = await getDownloadURL(fileRef);
      onChange(url);
      closeModal();
    } catch {
      setError("No se pudo subir la imagen. Probá de nuevo.");
    } finally {
      setUploading(false);
    }
  }

  function handleRemove() {
    onChange("");
    closeModal();
  }

  return (
    <div className="image-upload">
      {value ? (
        <button
          type="button"
          className="image-upload-preview"
          style={{ backgroundImage: `url(${value})` }}
          onClick={openModal}
          aria-label="Cambiar imagen principal"
        />
      ) : (
        <button type="button" className="image-upload-dropzone" onClick={openModal}>
          + Subir imagen
        </button>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <h3>Imagen principal</h3>

            {!stagedSrc ? (
              <>
                {value && <div className="image-upload-preview" style={{ backgroundImage: `url(${value})` }} />}
                <div className="modal-actions">
                  <button type="button" className="btn primary" onClick={() => inputRef.current?.click()}>
                    {value ? "Reemplazar imagen" : "Elegir imagen"}
                  </button>
                  {value && (
                    <button type="button" className="btn danger" onClick={handleRemove}>
                      Quitar imagen
                    </button>
                  )}
                  <button type="button" className="btn" onClick={closeModal}>
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="field-hint">Arrastrá sobre la imagen para elegir qué parte se va a mostrar.</p>
                <div
                  ref={frameRef}
                  className="crop-frame"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- canvas crop source needs a real <img>, not next/image */}
                  <img ref={imgRef} src={stagedSrc} alt="" className="crop-image" draggable={false} />
                  <div
                    className="crop-selection"
                    style={{
                      left: `${rect.x * 100}%`,
                      top: `${rect.y * 100}%`,
                      width: `${rect.w * 100}%`,
                      height: `${rect.h * 100}%`,
                    }}
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn primary" onClick={handleSave} disabled={uploading}>
                    {uploading ? "Guardando…" : "Guardar cambios"}
                  </button>
                  <button type="button" className="btn" onClick={() => inputRef.current?.click()} disabled={uploading}>
                    Elegir otra imagen
                  </button>
                  <button type="button" className="btn" onClick={closeModal} disabled={uploading}>
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
