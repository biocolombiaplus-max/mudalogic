"use client";

import { ArrowRight, MessageCircle } from "lucide-react";

export default function QuoteStickyBar({
  onOpenQuote,
  whatsappHref,
}: {
  onOpenQuote: () => void;
  whatsappHref: string;
}) {
  return (
    <div
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-black/5 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] px-4 pt-3 flex items-center gap-2.5"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <button onClick={onOpenQuote} className="btn-primary flex-1 !py-3 text-sm">
        Cotiza tu mudanza gratis <ArrowRight size={16} />
      </button>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escríbenos por WhatsApp"
        className="shrink-0 w-12 h-12 rounded-full bg-[#25d366] text-white flex items-center justify-center shadow-md active:scale-95 transition-transform"
      >
        <MessageCircle size={20} fill="white" strokeWidth={0} />
      </a>
    </div>
  );
}
