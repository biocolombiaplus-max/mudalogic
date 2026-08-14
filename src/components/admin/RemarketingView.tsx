"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MessageCircle,
  Search,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  UserPlus,
} from "lucide-react";
import type { Lead, LeadFollowup } from "@/lib/types";
import ContactLeadModal from "./ContactLeadModal";

type Stage = "due_15" | "due_8" | "ok";
type FollowupType = "manual" | "reminder_8" | "reminder_15";

const TEMPLATE_KEYS = {
  manual: "remarketing.msg_general",
  reminder_8: "remarketing.msg_8",
  reminder_15: "remarketing.msg_15",
} as const;

function daysSince(dateStr: string) {
  const then = new Date(dateStr).getTime();
  const now = Date.now();
  return Math.floor((now - then) / 86400000);
}

function fillTemplate(tpl: string, lead: Lead) {
  return tpl
    .replaceAll("{nombre}", lead.name || "el cliente")
    .replaceAll("{origen}", lead.origin || "tu origen")
    .replaceAll("{destino}", lead.destination || "tu destino");
}

const STAGE_META: Record<Stage, { label: string; color: string; icon: typeof Clock }> = {
  due_15: { label: "15 días vencidos", color: "bg-red-100 text-red-700", icon: AlertTriangle },
  due_8: { label: "8 días vencidos", color: "bg-amber-100 text-amber-700", icon: Clock },
  ok: { label: "Al día", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
};

export default function RemarketingView() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [followups, setFollowups] = useState<LeadFollowup[]>([]);
  const [templates, setTemplates] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"todos" | Stage>("todos");
  const [modal, setModal] = useState<{ lead: Lead; type: FollowupType } | null>(null);
  const [pendingMessage, setPendingMessage] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/remarketing").then((r) => r.json()),
      fetch("/api/admin/settings").then((r) => r.json()),
    ]).then(([rm, settings]) => {
      setLeads(rm.leads || []);
      setFollowups(rm.followups || []);
      setTemplates(settings.settings || {});
      setLoading(false);
    });
  }, []);

  const followupsByLead = useMemo(() => {
    const map = new Map<string, LeadFollowup[]>();
    for (const f of followups) {
      if (!map.has(f.lead_id)) map.set(f.lead_id, []);
      map.get(f.lead_id)!.push(f);
    }
    return map;
  }, [followups]);

  function hasType(leadId: string, type: FollowupType) {
    return (followupsByLead.get(leadId) || []).some((f) => f.type === type);
  }

  function lastContact(leadId: string) {
    const list = followupsByLead.get(leadId) || [];
    return list[0]?.created_at ?? null;
  }

  function stageFor(lead: Lead): Stage {
    const days = daysSince(lead.created_at);
    if (days >= 15 && !hasType(lead.id, "reminder_15")) return "due_15";
    if (days >= 8 && !hasType(lead.id, "reminder_8")) return "due_8";
    return "ok";
  }

  const rows = useMemo(() => {
    return leads
      .map((lead) => ({ lead, stage: stageFor(lead), days: daysSince(lead.created_at) }))
      .filter(({ lead, stage }) => {
        if (filter !== "todos" && stage !== filter) return false;
        if (!query) return true;
        const q = query.toLowerCase();
        return (
          lead.name?.toLowerCase().includes(q) ||
          lead.phone?.toLowerCase().includes(q) ||
          lead.origin?.toLowerCase().includes(q) ||
          lead.destination?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.days - a.days);
  }, [leads, followupsByLead, filter, query]); // eslint-disable-line react-hooks/exhaustive-deps

  const counts = useMemo(() => {
    const c = { due_15: 0, due_8: 0, ok: 0 };
    for (const lead of leads) c[stageFor(lead)]++;
    return c;
  }, [leads, followupsByLead]); // eslint-disable-line react-hooks/exhaustive-deps

  function openContact(lead: Lead, type: FollowupType) {
    const tplKey = TEMPLATE_KEYS[type];
    const tpl = templates[tplKey] || "";
    setModal({ lead, type });
    setPendingMessage(fillTemplate(tpl, lead));
  }

  function handleSent(leadId: string, type: FollowupType) {
    setFollowups((prev) => [
      { id: crypto.randomUUID(), lead_id: leadId, type, note: pendingMessage, created_at: new Date().toISOString() },
      ...prev,
    ]);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-neutral-400 gap-2">
        <Loader2 className="animate-spin" size={20} /> Cargando...
      </div>
    );
  }

  return (
    <div>
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="15 días vencidos"
          value={counts.due_15}
          color="bg-red-500"
          icon={AlertTriangle}
          active={filter === "due_15"}
          onClick={() => setFilter(filter === "due_15" ? "todos" : "due_15")}
        />
        <StatCard
          label="8 días vencidos"
          value={counts.due_8}
          color="bg-amber-500"
          icon={Clock}
          active={filter === "due_8"}
          onClick={() => setFilter(filter === "due_8" ? "todos" : "due_8")}
        />
        <StatCard
          label="Al día"
          value={counts.ok}
          color="bg-emerald-500"
          icon={CheckCircle2}
          active={filter === "ok"}
          onClick={() => setFilter(filter === "ok" ? "todos" : "ok")}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, teléfono o ciudad..."
            className="pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm w-72 max-w-full focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        {filter !== "todos" && (
          <button onClick={() => setFilter("todos")} className="text-xs font-semibold text-brand">
            Quitar filtro
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-neutral-500 uppercase tracking-wide border-b border-black/5">
                <th className="px-5 py-3 font-semibold">Cliente</th>
                <th className="px-5 py-3 font-semibold">Ruta</th>
                <th className="px-5 py-3 font-semibold">Días desde el contacto</th>
                <th className="px-5 py-3 font-semibold">Último seguimiento</th>
                <th className="px-5 py-3 font-semibold">Estado</th>
                <th className="px-5 py-3 font-semibold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {rows.map(({ lead, stage, days }) => {
                const meta = STAGE_META[stage];
                const Icon = meta.icon;
                const last = lastContact(lead.id);
                const suggestedType: FollowupType =
                  stage === "due_15" ? "reminder_15" : stage === "due_8" ? "reminder_8" : "manual";
                return (
                  <tr key={lead.id} className="hover:bg-neutral-50">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-navy flex items-center gap-1.5">
                        {lead.name || "Sin nombre"}
                        {lead.source === "manual" && (
                          <span title="Agregada manualmente">
                            <UserPlus size={12} className="text-neutral-300" />
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-neutral-500">{lead.phone}</p>
                    </td>
                    <td className="px-5 py-4 text-neutral-600">
                      {lead.origin} → {lead.destination}
                    </td>
                    <td className="px-5 py-4 text-neutral-600">
                      {days === 0 ? "Hoy" : days === 1 ? "Ayer" : `Hace ${days} días`}
                    </td>
                    <td className="px-5 py-4 text-neutral-500 text-xs">
                      {last
                        ? new Date(last).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" })
                        : "Sin contactar"}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${meta.color}`}>
                        <Icon size={12} /> {meta.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => openContact(lead, suggestedType)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-green-600 rounded-full px-3.5 py-2 hover:bg-green-700"
                      >
                        <MessageCircle size={14} /> Contactar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <p className="px-6 py-12 text-center text-sm text-neutral-400">
            No hay cotizaciones pendientes de seguimiento con ese filtro.
          </p>
        )}
      </div>

      {modal && (
        <ContactLeadModal
          lead={modal.lead}
          type={modal.type}
          initialMessage={pendingMessage}
          onClose={() => setModal(null)}
          onSent={(type) => handleSent(modal.lead.id, type)}
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  value: number;
  color: string;
  icon: typeof Clock;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border p-5 flex items-center gap-4 text-left transition-all ${
        active ? "border-brand bg-brand/5 shadow-md" : "border-black/5 bg-white shadow-sm hover:shadow-md"
      }`}
    >
      <div className={`w-11 h-11 rounded-xl ${color} text-white flex items-center justify-center shrink-0`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-navy leading-none">{value}</p>
        <p className="text-xs text-neutral-500 mt-1">{label}</p>
      </div>
    </button>
  );
}
