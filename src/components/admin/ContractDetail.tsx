"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Copy,
  MessageCircle,
  Mail,
  Check,
  Save,
  MapPin,
  PenLine,
  Package,
  Truck,
  Plus,
  Trash2,
} from "lucide-react";
import type { Contract, InventoryItem, TrackingEvent } from "@/lib/types";
import { CONTRACT_STATUSES, TRACKING_STATUSES } from "@/lib/types";

function statusMeta(status: string) {
  return CONTRACT_STATUSES.find((s) => s.value === status) ?? CONTRACT_STATUSES[0];
}

export default function ContractDetail({
  contract,
  inventory,
  tracking,
}: {
  contract: Contract;
  inventory: InventoryItem[];
  tracking: TrackingEvent[];
}) {
  const [form, setForm] = useState({
    client_name: contract.client_name || "",
    client_doc: contract.client_doc || "",
    client_phone: contract.client_phone || "",
    client_email: contract.client_email || "",
    origin_address: contract.origin_address || "",
    destination_address: contract.destination_address || "",
    moving_date: contract.moving_date || "",
    service_type: contract.service_type || "",
    price: contract.price || "",
    notes: contract.notes || "",
    status: contract.status,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [events, setEvents] = useState(tracking);
  const [newEvent, setNewEvent] = useState<{ status: string; note: string; location: string }>({
    status: TRACKING_STATUSES[1].value,
    note: "",
    location: "",
  });
  const [addingEvent, setAddingEvent] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const contractUrl = `${origin}/contrato/${contract.token}`;
  const trackUrl = `${origin}/rastreo/${contract.token}`;

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/admin/contracts/${contract.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(contractUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function whatsappShare() {
    const msg = `Hola ${contract.client_name || ""}, este es el link de tu contrato de mudanza con MudaLogic. Complétalo y fírmalo desde tu celular: ${contractUrl}\n\nCon este código puedes rastrear tu mudanza cuando quieras: ${contract.token}\n${trackUrl}`;
    const phone = (contract.client_phone || "").replace(/\D/g, "");
    window.open(`https://wa.me/${phone.startsWith("57") ? phone : "57" + phone}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  function emailShare() {
    const subject = "Tu contrato de mudanza MudaLogic";
    const body = `Hola ${contract.client_name || ""},\n\nEste es el link para completar y firmar tu contrato de mudanza:\n${contractUrl}\n\nCódigo de rastreo: ${contract.token}\n${trackUrl}\n\nGracias por confiar en MudaLogic.`;
    window.open(`mailto:${contract.client_email || ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_blank");
  }

  async function addEvent() {
    setAddingEvent(true);
    const res = await fetch(`/api/admin/contracts/${contract.id}/tracking`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEvent),
    });
    const data = await res.json();
    setAddingEvent(false);
    if (res.ok) {
      setEvents([
        {
          id: data.id,
          contract_id: contract.id,
          status: newEvent.status,
          note: newEvent.note,
          location: newEvent.location,
          created_at: new Date().toISOString(),
        },
        ...events,
      ]);
      setNewEvent({ status: TRACKING_STATUSES[1].value, note: "", location: "" });
    }
  }

  async function removeEvent(eventId: string) {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    await fetch(`/api/admin/contracts/${contract.id}/tracking?eventId=${eventId}`, { method: "DELETE" });
  }

  const meta = statusMeta(form.status);

  return (
    <div className="max-w-4xl">
      <Link href="/admin/contracts" className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-brand mb-4">
        <ArrowLeft size={16} /> Volver a contratos
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-extrabold text-navy">{contract.client_name || "Cliente sin nombre"}</h1>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${meta.color}`}>{meta.label}</span>
          </div>
          <p className="text-sm text-neutral-500 mt-1 flex items-center gap-1.5">
            Código: <code className="font-bold bg-neutral-100 px-2 py-0.5 rounded">{contract.token}</code>
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={copyLink} className="p-2.5 rounded-xl bg-neutral-100 text-neutral-600 hover:bg-neutral-200" title="Copiar link">
            {copied ? <Check size={18} className="text-emerald-600" /> : <Copy size={18} />}
          </button>
          <button onClick={whatsappShare} className="p-2.5 rounded-xl bg-green-50 text-green-600 hover:bg-green-100" title="Enviar por WhatsApp">
            <MessageCircle size={18} />
          </button>
          <button onClick={emailShare} className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100" title="Enviar por correo">
            <Mail size={18} />
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Datos del contrato">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Nombre del cliente">
              <input value={form.client_name} onChange={(e) => update("client_name", e.target.value)} className="input" />
            </Field>
            <Field label="Documento">
              <input value={form.client_doc} onChange={(e) => update("client_doc", e.target.value)} className="input" />
            </Field>
            <Field label="Teléfono">
              <input value={form.client_phone} onChange={(e) => update("client_phone", e.target.value)} className="input" />
            </Field>
            <Field label="Correo">
              <input value={form.client_email} onChange={(e) => update("client_email", e.target.value)} className="input" />
            </Field>
            <Field label="Origen">
              <input value={form.origin_address} onChange={(e) => update("origin_address", e.target.value)} className="input" />
            </Field>
            <Field label="Destino">
              <input value={form.destination_address} onChange={(e) => update("destination_address", e.target.value)} className="input" />
            </Field>
            <Field label="Fecha mudanza">
              <input type="date" value={form.moving_date} onChange={(e) => update("moving_date", e.target.value)} className="input" />
            </Field>
            <Field label="Precio (COP)">
              <input value={form.price} onChange={(e) => update("price", e.target.value)} className="input" />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Tipo de servicio">
              <input value={form.service_type} onChange={(e) => update("service_type", e.target.value)} className="input" />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Notas">
              <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={2} className="input resize-none" />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Estado del contrato">
              <select value={form.status} onChange={(e) => update("status", e.target.value)} className="input">
                {CONTRACT_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary !py-2.5 text-sm mt-5 disabled:opacity-60">
            {saved ? <Check size={16} /> : <Save size={16} />}
            {saving ? "Guardando..." : saved ? "Guardado" : "Guardar cambios"}
          </button>
        </Card>

        <div className="space-y-6">
          <Card title="Firmas">
            <div className="grid grid-cols-2 gap-4">
              <SignatureBox label="Firma del cliente" signature={contract.client_signature} name={contract.client_signed_name} date={contract.client_signed_at} />
              <SignatureBox label="Firma de quien recoge" signature={contract.staff_signature} name={contract.staff_signed_name} date={contract.staff_signed_at} />
            </div>
          </Card>

          <Card title={`Inventario (${inventory.length} artículos)`} icon={Package}>
            {inventory.length === 0 ? (
              <p className="text-sm text-neutral-400">El cliente aún no ha registrado el inventario.</p>
            ) : (
              <div className="grid grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
                {inventory.map((item) => (
                  <div key={item.id} className="rounded-lg border border-neutral-200 overflow-hidden">
                    <div className="relative aspect-square bg-neutral-100">
                      {item.photo ? (
                        <Image src={item.photo} alt={item.name} fill unoptimized className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-neutral-300">
                          <Package size={20} />
                        </div>
                      )}
                    </div>
                    <div className="p-1.5">
                      <p className="text-[11px] font-semibold text-navy truncate">{item.name}</p>
                      <p className="text-[10px] text-neutral-500">
                        {item.category} · x{item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <Card title="Rastreo de la mudanza" icon={Truck} className="mt-6">
        <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end mb-5">
          <Field label="Nuevo estado">
            <select value={newEvent.status} onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value })} className="input">
              {TRACKING_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Ubicación / nota">
            <input
              value={newEvent.location}
              onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              placeholder="Ej: Terminal de Bucaramanga"
              className="input"
            />
          </Field>
          <button onClick={addEvent} disabled={addingEvent} className="btn-primary !py-2.5 text-sm disabled:opacity-60">
            <Plus size={16} /> Agregar
          </button>
        </div>

        <div className="space-y-3">
          {events.length === 0 && <p className="text-sm text-neutral-400">Sin eventos de rastreo aún.</p>}
          {events.map((ev) => {
            const st = TRACKING_STATUSES.find((s) => s.value === ev.status);
            return (
              <div key={ev.id} className="flex items-start justify-between gap-3 rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin size={15} />
                  </div>
                  <div>
                    <p className="font-semibold text-navy text-sm">{st?.label ?? ev.status}</p>
                    {ev.location && <p className="text-xs text-neutral-600">{ev.location}</p>}
                    {ev.note && <p className="text-xs text-neutral-500">{ev.note}</p>}
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {new Date(ev.created_at).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>
                </div>
                <button onClick={() => removeEvent(ev.id)} className="text-neutral-300 hover:text-red-500 shrink-0">
                  <Trash2 size={15} />
                </button>
              </div>
            );
          })}
        </div>
      </Card>

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

function Card({
  title,
  icon: Icon = PenLine,
  children,
  className = "",
}: {
  title: string;
  icon?: typeof PenLine;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-2xl border border-black/5 shadow-sm p-6 ${className}`}>
      <h2 className="font-bold text-navy mb-4 flex items-center gap-2">
        <Icon size={18} className="text-brand" /> {title}
      </h2>
      {children}
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

function SignatureBox({
  label,
  signature,
  name,
  date,
}: {
  label: string;
  signature: string | null;
  name: string | null;
  date: string | null;
}) {
  return (
    <div>
      <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-1.5">{label}</p>
      <div className="relative aspect-[3/2] rounded-lg border border-neutral-200 bg-neutral-50 overflow-hidden">
        {signature ? (
          <Image src={signature} alt={label} fill unoptimized className="object-contain p-2" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-neutral-300 text-xs">Pendiente</div>
        )}
      </div>
      {signature && (
        <p className="text-[11px] text-neutral-500 mt-1">
          {name} · {date && new Date(date).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" })}
        </p>
      )}
    </div>
  );
}
