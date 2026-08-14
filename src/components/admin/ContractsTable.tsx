"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, MessageCircle, Mail, Trash2, Check, MapPin } from "lucide-react";
import type { Contract } from "@/lib/types";
import { CONTRACT_STATUSES } from "@/lib/types";

function statusMeta(status: string) {
  return CONTRACT_STATUSES.find((s) => s.value === status) ?? CONTRACT_STATUSES[0];
}

export default function ContractsTable({ initialContracts }: { initialContracts: Contract[] }) {
  const [contracts, setContracts] = useState(initialContracts);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function contractUrl(token: string) {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/contrato/${token}`;
  }

  async function copyLink(c: Contract) {
    await navigator.clipboard.writeText(contractUrl(c.token));
    setCopiedId(c.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function whatsappShare(c: Contract) {
    const msg = `Hola ${c.client_name || ""}, este es el link de tu contrato de mudanza con MudaLogic. Complétalo y fírmalo desde tu celular: ${contractUrl(
      c.token
    )}\n\nCon este mismo código podrás rastrear tu mudanza: ${c.token}`;
    const phone = (c.client_phone || "").replace(/\D/g, "");
    window.open(`https://wa.me/${phone.startsWith("57") ? phone : "57" + phone}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  function emailShare(c: Contract) {
    const subject = "Tu contrato de mudanza MudaLogic";
    const body = `Hola ${c.client_name || ""},\n\nEste es el link para completar y firmar tu contrato de mudanza:\n${contractUrl(
      c.token
    )}\n\nCódigo de rastreo: ${c.token}\n\nGracias por confiar en MudaLogic.`;
    window.open(
      `mailto:${c.client_email || ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      "_blank"
    );
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar este contrato? Esta acción no se puede deshacer.")) return;
    setContracts((prev) => prev.filter((c) => c.id !== id));
    await fetch(`/api/admin/contracts/${id}`, { method: "DELETE" });
  }

  if (contracts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm px-6 py-16 text-center">
        <p className="text-neutral-400 text-sm">Aún no has generado ningún contrato.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-neutral-500 uppercase tracking-wide border-b border-black/5">
              <th className="px-5 py-3 font-semibold">Cliente</th>
              <th className="px-5 py-3 font-semibold">Ruta</th>
              <th className="px-5 py-3 font-semibold">Código</th>
              <th className="px-5 py-3 font-semibold">Estado</th>
              <th className="px-5 py-3 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {contracts.map((c) => {
              const meta = statusMeta(c.status);
              return (
                <tr key={c.id} className="hover:bg-neutral-50">
                  <td className="px-5 py-4">
                    <Link href={`/admin/contracts/${c.id}`} className="font-semibold text-navy hover:text-brand">
                      {c.client_name || "Sin nombre"}
                    </Link>
                    <p className="text-xs text-neutral-500">{c.client_phone}</p>
                  </td>
                  <td className="px-5 py-4 text-neutral-600 text-xs">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {c.origin_address || "—"} → {c.destination_address || "—"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <code className="text-xs font-bold bg-neutral-100 px-2 py-1 rounded">{c.token}</code>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${meta.color}`}>{meta.label}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => copyLink(c)}
                        className="p-2 rounded-lg bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                        title="Copiar link del contrato"
                      >
                        {copiedId === c.id ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                      </button>
                      <button
                        onClick={() => whatsappShare(c)}
                        className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"
                        title="Enviar por WhatsApp"
                      >
                        <MessageCircle size={16} />
                      </button>
                      <button
                        onClick={() => emailShare(c)}
                        className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                        title="Enviar por correo"
                      >
                        <Mail size={16} />
                      </button>
                      <button
                        onClick={() => remove(c.id)}
                        className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
