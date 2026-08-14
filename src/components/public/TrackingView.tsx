"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Truck,
  Loader2,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  Circle,
  MessageCircle,
  RefreshCcw,
} from "lucide-react";
import type { Contract, TrackingEvent } from "@/lib/types";
import { TRACKING_STATUSES } from "@/lib/types";

export default function TrackingView({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [contract, setContract] = useState<Contract | null>(null);
  const [events, setEvents] = useState<TrackingEvent[]>([]);

  const load = useCallback(async () => {
    const res = await fetch(`/api/public/contracts/${token}`, { cache: "no-store" });
    if (!res.ok) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setContract(data.contract);
    setEvents(data.tracking);
    setLoading(false);
  }, [token]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-neutral-400">
          <Loader2 className="animate-spin" size={32} />
          <p className="text-sm">Buscando tu mudanza...</p>
        </div>
      </Shell>
    );
  }

  if (notFound || !contract) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center px-6">
          <AlertTriangle className="text-amber-500" size={40} />
          <h1 className="text-lg font-bold text-navy">No encontramos ese código de rastreo</h1>
          <p className="text-sm text-neutral-500 max-w-sm">
            Verifica el código que te compartimos por WhatsApp. Si el problema persiste, escríbenos.
          </p>
        </div>
      </Shell>
    );
  }

  const lastEventStatus = events[events.length - 1]?.status ?? "contrato_generado";
  const currentIdx = TRACKING_STATUSES.findIndex((s) => s.value === lastEventStatus);

  return (
    <Shell>
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs font-bold text-brand uppercase tracking-wide">Código de rastreo</p>
            <p className="text-2xl font-extrabold text-navy">{contract.token}</p>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 border border-neutral-200 rounded-full px-3.5 py-2 hover:bg-neutral-50"
          >
            <RefreshCcw size={13} /> Actualizar
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-neutral-600">
          <MapPin size={15} className="text-brand shrink-0" />
          {contract.origin_address || "Origen"} <span className="text-neutral-300">→</span>{" "}
          {contract.destination_address || "Destino"}
        </div>
        {contract.moving_date && (
          <p className="mt-1 text-xs text-neutral-400">Fecha estimada: {contract.moving_date}</p>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 mt-5">
        <h2 className="font-bold text-navy mb-6">Estado de tu mudanza</h2>
        <div className="relative pl-2">
          {TRACKING_STATUSES.map((s, i) => {
            const done = i <= currentIdx;
            const isCurrent = i === currentIdx;
            const eventsForStep = events.filter((e) => e.status === s.value);
            return (
              <div key={s.value} className="relative flex gap-4 pb-8 last:pb-0">
                {i < TRACKING_STATUSES.length - 1 && (
                  <div
                    className={`absolute left-[15px] top-8 bottom-0 w-0.5 ${done ? "bg-brand" : "bg-neutral-200"}`}
                  />
                )}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
                    done ? "bg-brand text-white" : "bg-neutral-100 text-neutral-400"
                  } ${isCurrent ? "ring-4 ring-brand/20" : ""}`}
                >
                  {done ? <CheckCircle2 size={18} /> : <Circle size={16} />}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${done ? "text-navy" : "text-neutral-400"}`}>{s.label}</p>
                  {eventsForStep.map((e) => (
                    <div key={e.id} className="mt-1">
                      {e.location && <p className="text-xs text-neutral-600">{e.location}</p>}
                      {e.note && <p className="text-xs text-neutral-500">{e.note}</p>}
                      <p className="text-[11px] text-neutral-400">
                        {new Date(e.created_at).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <a
        href="https://wa.me/573138470094"
        target="_blank"
        rel="noopener noreferrer"
        className="btn-whatsapp w-full mt-5"
      >
        <MessageCircle size={18} /> ¿Dudas? Escríbenos por WhatsApp
      </a>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-navy py-5">
        <div className="container-page flex items-center gap-2">
          <Truck className="text-brand-light" size={22} />
          <span className="text-white font-extrabold text-lg">
            MUDA<span className="text-brand-light">LOGIC</span>
          </span>
          <span className="text-white/50 text-xs ml-2 hidden sm:inline">· Rastreo de mudanza</span>
        </div>
      </div>
      <div className="container-page py-8 max-w-xl">{children}</div>
    </div>
  );
}
