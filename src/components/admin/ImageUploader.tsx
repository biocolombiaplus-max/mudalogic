"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, Loader2, ImageOff, Trash2, Wand2 } from "lucide-react";
import { removeFlatBackground } from "@/lib/removeBackground";

type Props = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  aspect?: string;
  fit?: "cover" | "contain";
  /** Shows a "remove flat background" toggle — use for logos on a solid background. */
  allowBgRemoval?: boolean;
  /** Renders the preview on a checkerboard pattern so transparency is visible. */
  transparentPreview?: boolean;
};

export default function ImageUploader({
  value,
  onChange,
  label,
  aspect = "aspect-video",
  fit = "cover",
  allowBgRemoval = false,
  transparentPreview = false,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [removeBg, setRemoveBg] = useState(allowBgRemoval);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError("");
    setUploading(true);
    try {
      const processed = allowBgRemoval && removeBg ? await removeFlatBackground(file) : file;
      const fd = new FormData();
      fd.append("file", processed);
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
        className={`mt-1.5 relative ${aspect} w-full rounded-xl border-2 border-dashed border-neutral-200 overflow-hidden group cursor-pointer hover:border-brand/50 transition-colors ${
          transparentPreview && value ? "" : "bg-neutral-50"
        }`}
        style={
          transparentPreview && value
            ? {
                backgroundImage:
                  "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)",
                backgroundSize: "16px 16px",
                backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
                backgroundColor: "#0a1128",
              }
            : undefined
        }
        onClick={() => inputRef.current?.click()}
      >
        {value ? (
          <Image
            src={value}
            alt={label ?? "imagen"}
            fill
            unoptimized
            className={fit === "contain" ? "object-contain p-2" : "object-cover"}
          />
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
      {allowBgRemoval && (
        <label className="mt-2 flex items-center gap-1.5 text-xs text-neutral-500 cursor-pointer">
          <input
            type="checkbox"
            checked={removeBg}
            onChange={(e) => setRemoveBg(e.target.checked)}
            className="rounded"
          />
          <Wand2 size={13} className="text-brand" />
          Optimizar para fondo oscuro (quita el fondo y pone en blanco el texto negro/gris)
        </label>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
