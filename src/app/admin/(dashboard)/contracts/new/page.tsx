"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileSignature } from "lucide-react";
import Link from "next/link";

export default function NewContractPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    client_name: "",
    client_doc: "",
    client_phone: "",
    client_email: "",
    origin_address: "",
    destination_address: "",
    moving_date: "",
    service_type: "Mudanza nacional puerta a puerta (empaque y desempaque incluido)",
    price: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.client_name || !form.client_phone) {
      setError("El nombre y teléfono del cliente son obligatorios");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/admin/contracts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "No se pudo crear el contrato");
      return;
    }
    router.push(`/admin/contracts/${data.id}`);
  }

  return (
    <div className="max-w-2xl">
      <Link href="/admin/contracts" className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-brand mb-4">
        <ArrowLeft size={16} /> Volver a contratos
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
          <FileSignature size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Nuevo contrato de servicio</h1>
          <p className="text-sm text-neutral-500">
            Completa los datos básicos; el cliente completará el resto y firmará desde su celular.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nombre completo del cliente *">
            <input value={form.client_name} onChange={(e) => update("client_name", e.target.value)} className="input" />
          </Field>
          <Field label="Documento de identidad">
            <input value={form.client_doc} onChange={(e) => update("client_doc", e.target.value)} className="input" />
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Teléfono / WhatsApp *">
            <input value={form.client_phone} onChange={(e) => update("client_phone", e.target.value)} className="input" />
          </Field>
          <Field label="Correo electrónico">
            <input value={form.client_email} onChange={(e) => update("client_email", e.target.value)} className="input" />
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Dirección de origen">
            <input value={form.origin_address} onChange={(e) => update("origin_address", e.target.value)} className="input" />
          </Field>
          <Field label="Dirección de destino">
            <input
              value={form.destination_address}
              onChange={(e) => update("destination_address", e.target.value)}
              className="input"
            />
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Fecha de la mudanza">
            <input type="date" value={form.moving_date} onChange={(e) => update("moving_date", e.target.value)} className="input" />
          </Field>
          <Field label="Precio acordado (COP)">
            <input value={form.price} onChange={(e) => update("price", e.target.value)} placeholder="Ej: $850.000" className="input" />
          </Field>
        </div>

        <Field label="Tipo de servicio">
          <input value={form.service_type} onChange={(e) => update("service_type", e.target.value)} className="input" />
        </Field>

        <Field label="Notas / condiciones adicionales">
          <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={3} className="input resize-none" />
        </Field>

        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
          {loading ? "Creando..." : "Crear contrato y generar link"}
        </button>
      </form>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1.5px solid #e5e7eb;
          border-radius: 0.75rem;
          padding: 0.65rem 0.9rem;
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
