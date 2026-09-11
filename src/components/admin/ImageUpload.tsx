"use client";

import { useRef, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError("");
    setUploading(true);
    try {
      const path = `brews/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
      const fileRef = ref(storage, path);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      onChange(url);
    } catch {
      setError("No se pudo subir la imagen. Probá de nuevo.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="image-upload">
      {value ? (
        <div className="image-upload-preview" style={{ backgroundImage: `url(${value})` }}>
          <button type="button" className="btn danger" onClick={() => onChange("")}>
            Quitar imagen
          </button>
        </div>
      ) : (
        <button type="button" className="image-upload-dropzone" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? "Subiendo…" : "+ Subir imagen"}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      {error && <p style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: 6 }}>{error}</p>}
    </div>
  );
}
