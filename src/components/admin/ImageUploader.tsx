"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, Loader2, ImageOff, Trash2 } from "lucide-react";

type Props = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  aspect?: string;
};

export default function ImageUploader({ value, onChange, label, aspect = "aspect-video" }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError("");
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al subir imagen");
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al subir imagen");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {label && (
        <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">{label}</span>
      )}
      <div
        className={`mt-1.5 relative ${aspect} w-full rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 overflow-hidden group cursor-pointer hover:border-brand/50 transition-colors`}
        onClick={() => inputRef.current?.click()}
      >
        {value ? (
          <Image src={value} alt={label ?? "imagen"} fill unoptimized className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400 gap-1.5">
            <ImageOff size={22} />
            <span className="text-xs">Sin imagen</span>
          </div>
        )}

        <div className="absolute inset-0 bg-navy/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          {uploading ? (
            <Loader2 className="animate-spin text-white" size={22} />
          ) : (
            <span className="text-white text-xs font-semibold flex items-center gap-1.5">
              <Upload size={16} /> Cambiar imagen
            </span>
          )}
        </div>

        {value && !uploading && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="absolute top-2 right-2 bg-white/90 text-red-500 p-1.5 rounded-full hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
