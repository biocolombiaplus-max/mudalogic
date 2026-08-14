"use client";

import { useState } from "react";
import { MessageCircle, Trash2, Search } from "lucide-react";
import type { Lead } from "@/lib/types";

const STATUSES = [
  { value: "nuevo", label: "Nuevo", color: "bg-amber-100 text-amber-700" },
  { value: "contactado", label: "Contactado", color: "bg-blue-100 text-blue-700" },
  { value: "cerrado", label: "Cerrado / ganado", color: "bg-emerald-100 text-emerald-700" },
  { value: "perdido", label: "Perdido", color: "bg-red-100 text-red-700" },
];

function statusMeta(status: string) {
  return STATUSES.find((s) => s.value === status) ?? STATUSES[0];
}

export default function LeadsTable({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("todos");

  async function updateStatus(id: string, status: string) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar esta cotización?")) return;
    setLeads((prev) => prev.filter((l) => l.id !== id));
    await fetch(`/api/leads/${id}`, { method: "DELETE" });
  }

  const filtered = leads.filter((l) => {
    if (filter !== "todos" && (l.status || "nuevo") !== filter) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      l.name?.toLowerCase().includes(q) ||
      l.phone?.toLowerCase().includes(q) ||
      l.origin?.toLowerCase().includes(q) ||
      l.destination?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, teléfono o ciudad..."
            className="pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm w-72 max-w-full focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <FilterChip active={filter === "todos"} onClick={() => setFilter("todos")}>
            Todos ({leads.length})
          </FilterChip>
          {STATUSES.map((s) => (
            <FilterChip key={s.value} active={filter === s.value} onClick={() => setFilter(s.value)}>
              {s.label}
            </FilterChip>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-neutral-500 uppercase tracking-wide border-b border-black/5">
                <th className="px-5 py-3 font-semibold">Cliente</th>
                <th className="px-5 py-3 font-semibold">Ruta</th>
                <th className="px-5 py-3 font-semibold">Tamaño</th>
                <th className="px-5 py-3 font-semibold">Fecha</th>
                <th className="px-5 py-3 font-semibold">Estado</th>
                <th className="px-5 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filtered.map((l) => {
                const meta = statusMeta(l.status || "nuevo");
                const waHref = `https://wa.me/57${(l.phone || "").replace(/\D/g, "").replace(/^57/, "")}`;
                return (
                  <tr key={l.id} className="hover:bg-neutral-50">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-navy">{l.name || "Sin nombre"}</p>
                      <p className="text-xs text-neutral-500">{l.phone}</p>
                    </td>
                    <td className="px-5 py-4 text-neutral-600">
                      {l.origin} → {l.destination}
                    </td>
                    <td className="px-5 py-4 text-neutral-600">{l.moving_size}</td>
                    <td className="px-5 py-4 text-neutral-500 text-xs">
                      {new Date(l.created_at).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={l.status || "nuevo"}
                        onChange={(e) => updateStatus(l.id, e.target.value)}
                        className={`text-xs font-semibold rounded-full px-3 py-1.5 border-0 ${meta.color}`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={waHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"
                          title="Escribir por WhatsApp"
                        >
                          <MessageCircle size={16} />
                        </a>
                        <button
                          onClick={() => remove(l.id)}
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
        {filtered.length === 0 && (
          <p className="px-6 py-12 text-center text-sm text-neutral-400">
            No se encontraron cotizaciones con ese filtro.
          </p>
        )}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-xs font-semibold px-3.5 py-2 rounded-full border transition-colors ${
        active ? "bg-navy text-white border-navy" : "bg-white text-neutral-600 border-neutral-200"
      }`}
    >
      {children}
    </button>
  );
}
