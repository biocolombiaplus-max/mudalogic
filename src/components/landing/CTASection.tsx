import { MessageCircle, ArrowRight } from "lucide-react";

export default function CTASection({
  whatsappHref,
  onOpenQuote,
}: {
  whatsappHref: string;
  onOpenQuote: () => void;
}) {
  return (
    <section className="py-14 sm:py-16 lg:py-20 bg-gradient-to-br from-brand to-brand-dark relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_10%_10%,white,transparent_35%)]" />
      <div className="container-page relative text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight max-w-2xl mx-auto">
          Tu próxima mudanza empieza con un mensaje
        </h2>
        <p className="mt-4 text-white/85 max-w-xl mx-auto">
          Cotiza gratis ahora mismo y recibe atención inmediata de nuestro equipo. Sin compromiso.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            onClick={onOpenQuote}
            className="inline-flex items-center gap-2 rounded-full bg-white text-brand font-bold px-7 py-3.5 hover:-translate-y-1 transition-transform shadow-xl"
          >
            Cotizar mi mudanza <ArrowRight size={18} />
          </button>
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-outline">
            <MessageCircle size={18} /> Hablar por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
