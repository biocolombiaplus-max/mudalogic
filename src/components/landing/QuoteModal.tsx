"use client";

import { useState } from "react";
import { X, MapPin, User, Phone, CalendarDays, Boxes, Send, CheckCircle2 } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  whatsapp: string;
};

const SIZES = [
  "Habitación / estudio",
  "Apartamento 1-2 habitaciones",
  "Apartamento 3+ habitaciones",
  "Casa completa",
  "Oficina / local comercial",
  "Solo algunos muebles / cajas",
];

const ITEM_TAGS = [
  "Muebles de sala",
  "Muebles de habitación",
  "Cocina y electrodomésticos",
  "Cajas y menaje",
  "Oficina",
  "Objetos frágiles / especiales",
  "Vehículo / moto",
  "Otro",
];

export default function QuoteModal({ open, onClose, whatsapp }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [size, setSize] = useState(SIZES[1]);
  const [tags, setTags] = useState<string[]>([]);
  const [date, setDate] = useState("");
  const [details, setDetails] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  function toggleTag(tag: string) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  function reset() {
    setName("");
    setPhone("");
    setOrigin("");
    setDestination("");
    setSize(SIZES[1]);
    setTags([]);
    setDate("");
    setDetails("");
    setSent(false);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !phone.trim() || !origin.trim() || !destination.trim()) {
      setError("Por favor completa tu nombre, teléfono, origen y destino.");
      return;
    }
    setSending(true);

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      origin: origin.trim(),
      destination: destination.trim(),
      moving_size: size,
      items: tags.join(", "),
      moving_date: date,
      message: details.trim(),
    };

    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      // still proceed to WhatsApp even if lead storage fails
    }

    const lines = [
      `Hola MudaLogic, quiero cotizar mi mudanza:`,
      `*Nombre:* ${payload.name}`,
      `*Teléfono:* ${payload.phone}`,
      `*Origen:* ${payload.origin}`,
      `*Destino:* ${payload.destination}`,
      `*Tamaño de la mudanza:* ${payload.moving_size}`,
      payload.items ? `*Qué voy a transportar:* ${payload.items}` : "",
      payload.moving_date ? `*Fecha estimada:* ${payload.moving_date}` : "",
      payload.message ? `*Detalles:* ${payload.message}` : "",
    ].filter(Boolean);

    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
    setSending(false);
    setSent(true);
    window.open(url, "_blank");
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-navy/70 backdrop-blur-sm animate-fade-in-up"
        onClick={onClose}
      />
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 sm:px-8 pt-6 pb-4 border-b border-black/5 z-10">
          <div>
            <h3 className="text-xl font-extrabold text-navy">Cotiza tu mudanza</h3>
            <p className="text-sm text-neutral-500 mt-0.5">
              Cuéntanos los detalles y te contactamos por WhatsApp en minutos.
            </p>
          </div>
          <button
            onClick={() => {
              onClose();
              if (sent) reset();
            }}
            className="p-2 rounded-full hover:bg-neutral-100 text-neutral-500"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {sent ? (
          <div className="px-6 sm:px-8 py-14 text-center">
            <CheckCircle2 className="mx-auto text-green-500" size={56} />
            <h4 className="mt-4 text-lg font-bold text-navy">¡Listo! Te esperamos en WhatsApp</h4>
            <p className="mt-2 text-sm text-neutral-500">
              Si no se abrió automáticamente, escríbenos al {whatsapp.replace("57", "+57 ")}.
            </p>
            <button
              onClick={() => {
                onClose();
                reset();
              }}
              className="btn-primary mt-6"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-6 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field icon={<User size={16} />} label="Nombre completo">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  className="input"
                />
              </Field>
              <Field icon={<Phone size={16} />} label="Teléfono / WhatsApp">
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="300 000 0000"
                  className="input"
                  inputMode="tel"
                />
              </Field>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field icon={<MapPin size={16} />} label="Ciudad de origen">
                <input
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="Ej: Cúcuta"
                  className="input"
                />
              </Field>
              <Field icon={<MapPin size={16} />} label="Ciudad de destino">
                <input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Ej: Bogotá"
                  className="input"
                />
              </Field>
            </div>

            <Field icon={<Boxes size={16} />} label="Tamaño de la mudanza">
              <select value={size} onChange={(e) => setSize(e.target.value)} className="input">
                {SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>

            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
                ¿Qué vas a transportar?
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {ITEM_TAGS.map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`text-xs font-semibold px-3.5 py-2 rounded-full border transition-colors ${
                      tags.includes(tag)
                        ? "bg-brand text-white border-brand"
                        : "bg-white text-neutral-600 border-neutral-200 hover:border-brand/50"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <Field icon={<CalendarDays size={16} />} label="Fecha estimada (opcional)">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input"
              />
            </Field>

            <Field label="Detalles adicionales (opcional)">
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                placeholder="Ej: tengo un piano, necesito bodegaje temporal, etc."
                className="input resize-none"
              />
            </Field>

            {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

            <button type="submit" disabled={sending} className="btn-whatsapp w-full text-base disabled:opacity-60">
              <Send size={18} /> {sending ? "Enviando..." : "Enviar cotización por WhatsApp"}
            </button>
            <p className="text-[11px] text-center text-neutral-400">
              Al enviar aceptas que te contactemos para brindarte tu cotización.
            </p>
          </form>
        )}
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1.5px solid #e5e7eb;
          border-radius: 0.9rem;
          padding: 0.7rem 0.9rem;
          font-size: 0.9rem;
          color: #0a1128;
          outline: none;
          transition: border-color 0.15s ease;
        }
        .input:focus {
          border-color: var(--brand);
        }
      `}</style>
    </div>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon?: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide flex items-center gap-1.5">
        {icon} {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
