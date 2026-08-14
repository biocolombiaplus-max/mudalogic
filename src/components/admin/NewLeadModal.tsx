"use client";

import { useState } from "react";
import { X, User, Phone, MapPin, Boxes, CalendarDays, UserPlus } from "lucide-react";
import type { Lead } from "@/lib/types";

const SIZES = [
  "Habitación / estudio",
  "Apartamento 1-2 habitaciones",
  "Apartamento 3+ habitaciones",
  "Casa completa",
  "Oficina / local comercial",
  "Solo algunos muebles / cajas",
];

const STATUSES = [
  { value: "nuevo", label: "Nuevo" },
  { value: "contactado", label: "Contactado" },
  { value: "cerrado", label: "Cerrado / ganado" },
  { value: "perdido", label: "Perdido" },
];

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (lead: Lead) => void;
};

export default function NewLeadModal({ open, onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [size, setSize] = useState(SIZES[1]);
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("contactado");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  function reset() {
    setName("");
    setPhone("");
    setOrigin("");
    setDestination("");
    setSize(SIZES[1]);
    setDate("");
    setStatus("contactado");
    setMessage("");
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !phone.trim()) {
      setError("El nombre y el teléfono son obligatorios.");
      return;
    }
    setSaving(true);
    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      origin: origin.trim(),
      destination: destination.trim(),
      moving_size: size,
      moving_date: date,
      message: message.trim(),
      status,
      source: "manual",
    };
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "No se pudo guardar la cotización.");
      return;
    }
    onCreated({
      id: data.id,
      ...payload,
      items: "",
      created_at: new Date().toISOString(),
    });
    reset();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 pt-6 pb-4 border-b border-black/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
              <UserPlus size={18} />
            </div>
            <div>
              <h3 className="font-bold text-navy">Nueva cotización manual</h3>
              <p className="text-xs text-neutral-500">Registra una solicitud que recibiste por llamada o en persona.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-100 text-neutral-500">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field icon={<User size={14} />} label="Nombre completo *">
              <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
            </Field>
            <Field icon={<Phone size={14} />} label="Teléfono *">
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input" />
            </Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field icon={<MapPin size={14} />} label="Origen">
              <input value={origin} onChange={(e) => setOrigin(e.target.value)} className="input" />
            </Field>
            <Field icon={<MapPin size={14} />} label="Destino">
              <input value={destination} onChange={(e) => setDestination(e.target.value)} className="input" />
            </Field>
          </div>
          <Field icon={<Boxes size={14} />} label="Tamaño de la mudanza">
            <select value={size} onChange={(e) => setSize(e.target.value)} className="input">
              {SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field icon={<CalendarDays size={14} />} label="Fecha estimada">
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" />
            </Field>
            <Field label="Estado">
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="input">
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Notas">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              className="input resize-none"
              placeholder="Detalles de la llamada, objetos especiales, etc."
            />
          </Field>

          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

          <button type="submit" disabled={saving} className="btn-primary w-full disabled:opacity-60">
            {saving ? "Guardando..." : "Guardar cotización"}
          </button>
        </form>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1.5px solid #e5e7eb;
          border-radius: 0.75rem;
          padding: 0.6rem 0.85rem;
          font-size: 0.875rem;
          color: #0a1128;
          outline: none;
        }
        .input:focus {
          border-color: var(--brand);
        }
      `}</style>
    </div>
  );
}

function Field({ icon, label, children }: { icon?: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide flex items-center gap-1.5">
        {icon} {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
