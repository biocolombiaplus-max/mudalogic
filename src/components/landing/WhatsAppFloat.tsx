import { MessageCircle } from "lucide-react";

export default function WhatsAppFloat({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="fixed z-40 w-15 h-15 rounded-full bg-[#25d366] text-white flex items-center justify-center shadow-2xl shadow-black/30 hover:scale-110 active:scale-95 transition-transform animate-float"
      style={{
        width: 60,
        height: 60,
        right: "max(1.25rem, env(safe-area-inset-right))",
        bottom: "max(1.25rem, env(safe-area-inset-bottom))",
      }}
    >
      <MessageCircle size={28} fill="white" strokeWidth={0} />
      <span className="absolute inset-0 rounded-full animate-ping bg-[#25d366]/50 -z-10" />
    </a>
  );
}
