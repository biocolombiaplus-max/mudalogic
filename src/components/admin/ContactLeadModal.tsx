"use client";

import { useState } from "react";
import { X, MessageCircle, Send } from "lucide-react";
import type { Lead } from "@/lib/types";

type FollowupType = "manual" | "reminder_8" | "reminder_15";

type Props = {
  lead: Lead;
  type: FollowupType;
  initialMessage: string;
  onClose: () => void;
  onSent: (type: FollowupType) => void;
};

const TYPE_LABEL: Record<FollowupType, string> = {
  manual: "Contacto",
  reminder_8: "Recordatorio de 8 días",
  reminder_15: "Recordatorio de 15 días",
};

export default function ContactLeadModal({ lead, type, initialMessage, onClose, onSent }: Props) {
  const [message, setMessage] = useState(initialMessage);
  const [sending, setSending] = useState(false);

  async function handleSend() {
    setSending(true);
    const phone = (lead.phone || "").replace(/\D/g, "");
    const waPhone = phone.startsWith("57") ? phone : `57${phone}`;
    const url = `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");

    await fetch(`/api/admin/leads/${lead.id}/followups`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, note: message }),
    });
    setSending(false);
    onSent(type);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-black/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <MessageCircle size={18} />
            </div>
            <div>
              <h3 className="font-bold text-navy">{TYPE_LABEL[type]}</h3>
              <p className="text-xs text-neutral-500">
                {lead.name || "Cliente"} · {lead.phone}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-100 text-neutral-500">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
            Mensaje (puedes editarlo)
          </span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            className="mt-1.5 w-full border-1.5 border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand resize-none"
          />
          <p className="mt-2 text-[11px] text-neutral-400">
            Se abrirá WhatsApp con este mensaje listo — solo debes darle enviar allá.
          </p>

          <button onClick={handleSend} disabled={sending} className="btn-whatsapp w-full mt-4 disabled:opacity-60">
            <Send size={16} /> {sending ? "Abriendo WhatsApp..." : "Abrir en WhatsApp"}
          </button>
        </div>
      </div>
    </div>
  );
}
