"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Save, MessageCircle, FileSignature, Package, MapPin } from "lucide-react";
import type { Quote, QuoteItem } from "@/lib/types";
import { QUOTE_STATUSES } from "@/lib/types";

const SIZES = [
  "Habitación / estudio",
  "Apartamento 1-2 habitaciones",
  "Apartamento 3+ habitaciones",
  "Casa completa",
  "Oficina / local comercial",
  "Solo algunos muebles / cajas",
];

function statusMeta(status: string) {
  return QUOTE_STATUSES.find((s) => s.value === status) ?? QUOTE_STATUSES[0];
}

export default function QuoteDetail({ quote, items }: { quote: Quote; items: QuoteItem[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    client_name: quote.client_name || "",
    client_phone: quote.client_phone || "",
    client_email: quote.client_email || "",
    origin_address: quote.origin_address || "",
    destination_address: quote.destination_address || "",
    origin_floor: quote.origin_floor || "",
    destination_floor: quote.destination_floor || "",
    moving_date: quote.moving_date || "",
    moving_size: quote.moving_size || SIZES[1],
    price: quote.price || "",
    admin_notes: quote.admin_notes || "",
    status: quote.status,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [converting, setConverting] = useState(false);

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave(nextStatus?: string) {
    setSaving(true);
    const body = nextStatus ? { ...form, status: nextStatus } : form;
    await fetch(`/api/admin/quotes/${quote.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    setSaved(true);
    if (nextStatus) update("status", nextStatus);
    setTimeout(() => setSaved(false), 2000);
  }

  async function sendFormalQuote() {
    await handleSave("enviado");
    const lines = [
      `¡Hola ${form.client_name || ""}! Aquí está tu cotización de MudaLogic (código ${quote.token}):`,
      `*Tamaño de la mudanza:* ${form.moving_size}`,
      `*Ruta:* ${form.origin_address}${form.origin_floor ? ` (piso ${form.origin_floor})` : ""} → ${form.destination_address}${form.destination_floor ? ` (piso ${form.destination_floor})` : ""}`,
      items.length > 0 ? `*Inventario:* ${items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}` : "",
      `*Valor de la mudanza:* ${form.price || "a confirmar"}`,
      "",
      "¿Confirmamos tu mudanza? Responde este mensaje y coordinamos todo 🚚",
    ].filter(Boolean);
    const phone = (form.client_phone || "").replace(/\D/g, "");
    window.open(`https://wa.me/${phone.startsWith("57") ? phone : "57" + phone}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank");
  }

  async function convertToContract() {
    setConverting(true);
    const res = await fetch(`/api/admin/quotes/${quote.id}/convert`, { method: "POST" });
    const data = await res.json();
    setConverting(false);
    if (res.ok) router.push(`/admin/contracts/${data.contractId}`);
  }

  const meta = statusMeta(form.status);

  return (
    <div className="max-w-3xl">
      <Link href="/admin/quotes" className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-brand mb-4">
        <ArrowLeft size={16} /> Volver a cotizaciones
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-extrabold text-navy">{quote.client_name || "Cotización sin diligenciar"}</h1>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${meta.color}`}>{meta.label}</span>
          </div>
          <p className="text-sm text-neutral-500 mt-1 flex items-center gap-1.5">
            Código: <code className="font-bold bg-neutral-100 px-2 py-0.5 rounded">{quote.token}</code>
          </p>
        </div>
        {quote.contract_id && (
          <Link href={`/admin/contracts/${quote.contract_id}`} className="btn-outline !text-navy !border-neutral-300 !py-2 text-xs">
            <FileSignature size={14} /> Ver contrato generado
          </Link>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 space-y-4">
        <h2 className="font-bold text-navy flex items-center gap-2">
          <MapPin size={18} className="text-brand" /> Datos del cliente
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nombre">
            <input value={form.client_name} onChange={(e) => update("client_name", e.target.value)} className="input" />
          </Field>
          <Field label="Teléfono">
            <input value={form.client_phone} onChange={(e) => update("client_phone", e.target.value)} className="input" />
          </Field>
          <Field label="Correo">
            <input value={form.client_email} onChange={(e) => update("client_email", e.target.value)} className="input" />
          </Field>
          <Field label="Fecha estimada">
            <input type="date" value={form.moving_date} onChange={(e) => update("moving_date", e.target.value)} className="input" />
          </Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Field label="Origen">
              <input value={form.origin_address} onChange={(e) => update("origin_address", e.target.value)} className="input" />
            </Field>
            <Field label="Piso">
              <input value={form.origin_floor} onChange={(e) => update("origin_floor", e.target.value)} className="input !w-16" />
            </Field>
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Field label="Destino">
              <input value={form.destination_address} onChange={(e) => update("destination_address", e.target.value)} className="input" />
            </Field>
            <Field label="Piso">
              <input value={form.destination_floor} onChange={(e) => update("destination_floor", e.target.value)} className="input !w-16" />
            </Field>
          </div>
        </div>
        {quote.notes && (
          <p className="text-xs text-neutral-500 bg-neutral-50 rounded-lg px-3 py-2">
            <b>Notas del cliente:</b> {quote.notes}
          </p>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 mt-6">
        <h2 className="font-bold text-navy mb-4 flex items-center gap-2">
          <Package size={18} className="text-brand" /> Inventario ({items.length} artículos)
        </h2>
        {items.length === 0 ? (
          <p className="text-sm text-neutral-400">El cliente aún no ha diligenciado el inventario.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-neutral-50 rounded-lg px-3 py-2 text-sm">
                <span className="font-semibold text-navy">{item.name}</span>
                <span className="text-neutral-500 text-xs">
                  {item.category ? `${item.category} · ` : ""}x{item.quantity}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 mt-6 space-y-4">
        <h2 className="font-bold text-navy">Precio y envío</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Tamaño de la mudanza">
            <select value={form.moving_size} onChange={(e) => update("moving_size", e.target.value)} className="input">
              {SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Valor de la mudanza (COP)">
            <input value={form.price} onChange={(e) => update("price", e.target.value)} placeholder="Ej: 850.000" className="input" />
          </Field>
        </div>
        <Field label="Notas internas (no las ve el cliente)">
          <textarea value={form.admin_notes} onChange={(e) => update("admin_notes", e.target.value)} rows={2} className="input resize-none" />
        </Field>
        <Field label="Estado">
          <select value={form.status} onChange={(e) => update("status", e.target.value)} className="input">
            {QUOTE_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>

        <div className="flex flex-wrap gap-3 pt-2">
          <button onClick={() => handleSave()} disabled={saving} className="btn-outline !text-navy !border-neutral-300 !py-2.5 text-sm disabled:opacity-60">
            {saved ? <Check size={16} /> : <Save size={16} />} {saving ? "Guardando..." : saved ? "Guardado" : "Guardar"}
          </button>
          <button onClick={sendFormalQuote} disabled={!form.price} className="btn-whatsapp !py-2.5 text-sm disabled:opacity-40" title={!form.price ? "Pon un precio primero" : ""}>
            <MessageCircle size={16} /> Enviar cotización formal por WhatsApp
          </button>
          {!quote.contract_id && (
            <button onClick={convertToContract} disabled={converting} className="btn-primary !py-2.5 text-sm disabled:opacity-60">
              <FileSignature size={16} /> {converting ? "Creando..." : "Convertir en contrato"}
            </button>
          )}
        </div>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1.5px solid #e5e7eb;
          border-radius: 0.7rem;
          padding: 0.55rem 0.8rem;
          font-size: 0.85rem;
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
