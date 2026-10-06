"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Trash2 } from "lucide-react";
import type { Quote } from "@/lib/types";
import { QUOTE_STATUSES } from "@/lib/types";

function statusMeta(status: string) {
  return QUOTE_STATUSES.find((s) => s.value === status) ?? QUOTE_STATUSES[0];
}

export default function QuotesTable({ initialQuotes }: { initialQuotes: Quote[] }) {
  const [quotes, setQuotes] = useState(initialQuotes);

  async function remove(id: string) {
    if (!confirm("¿Eliminar esta cotización?")) return;
    setQuotes((prev) => prev.filter((q) => q.id !== id));
    await fetch(`/api/admin/quotes/${id}`, { method: "DELETE" });
  }

  if (quotes.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm px-6 py-16 text-center">
        <p className="text-neutral-400 text-sm">Aún no hay cotizaciones. Se crean solas cuando alguien usa el botón &quot;Cotiza tu mudanza&quot; del sitio.</p>
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
            {quotes.map((q) => {
              const meta = statusMeta(q.status);
              return (
                <tr key={q.id} className="hover:bg-neutral-50">
                  <td className="px-5 py-4">
                    <Link href={`/admin/quotes/${q.id}`} className="font-semibold text-navy hover:text-brand">
                      {q.client_name || "Sin diligenciar"}
                    </Link>
                    <p className="text-xs text-neutral-500">{q.client_phone}</p>
                  </td>
                  <td className="px-5 py-4 text-neutral-600 text-xs">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {q.origin_address || "—"} → {q.destination_address || "—"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <code className="text-xs font-bold bg-neutral-100 px-2 py-1 rounded">{q.token}</code>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${meta.color}`}>{meta.label}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => remove(q.id)}
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
