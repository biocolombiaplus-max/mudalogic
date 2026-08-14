"use client";

import Image from "next/image";
import { ShieldCheck, Star, Truck, ArrowRight, MessageCircle } from "lucide-react";

type Props = {
  title: string;
  subtitle: string;
  image: string;
  whatsappHref: string;
  stats: { years: string; moves: string; cities: string; rating: string };
  onOpenQuote: () => void;
};

export default function Hero({ title, subtitle, image, whatsappHref, stats, onOpenQuote }: Props) {
  return (
    <section
      id="inicio"
      className="relative min-h-[92vh] flex items-center overflow-hidden bg-navy"
    >
      <div className="absolute inset-0">
        {image ? (
          <Image
            src={image}
            alt="MudaLogic mudanzas"
            fill
            priority
            unoptimized
            className="object-cover opacity-45"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(77,141,255,0.35),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(17,87,224,0.35),transparent_45%)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-navy/70 via-navy/80 to-navy" />
      </div>

      <div className="container-page relative z-10 py-32 lg:py-40">
        <div className="max-w-3xl animate-fade-in-up">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 text-white/90 text-xs font-semibold px-4 py-2 mb-6 backdrop-blur">
            <Truck size={14} className="text-brand-light" />
            Mudanzas nacionales · Cúcuta &amp; Medellín para toda Colombia
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] text-white tracking-tight">
            <TitleWithAccent title={title || "Mudanzas sin estrés, solo sonrisas"} />
          </h1>

          <p className="mt-6 text-lg text-white/80 max-w-xl leading-relaxed">
            {subtitle}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <button onClick={onOpenQuote} className="btn-primary text-base">
              Cotiza tu mudanza gratis <ArrowRight size={18} />
            </button>
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-whatsapp text-base">
              <MessageCircle size={18} /> Escríbenos ya
            </a>
          </div>

          <div className="mt-12 flex flex-wrap gap-x-10 gap-y-5">
            <Stat value={`${stats.years}+`} label="años de experiencia" />
            <Stat value={`${Number(stats.moves).toLocaleString("es-CO")}+`} label="mudanzas realizadas" />
            <Stat value={stats.cities} label="ciudades cubiertas" />
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <span className="text-white font-bold">{stats.rating}</span>
              <span className="text-white/60 text-sm">calificación clientes</span>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2 text-white/70 text-sm">
            <ShieldCheck size={18} className="text-brand-light" />
            Empaque y desempaque incluido · Contrato digital · Rastreo en tiempo real
          </div>
        </div>
      </div>

      <div className="hidden xl:block absolute -bottom-10 right-10 w-72 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md p-5 animate-float">
        <p className="text-white font-semibold text-sm">💯 Seriedad, calidad y oportunidad</p>
        <p className="text-white/70 text-xs mt-1">
          Los mejores precios del mercado, sin sorpresas.
        </p>
      </div>
    </section>
  );
}

function TitleWithAccent({ title }: { title: string }) {
  const lastComma = title.lastIndexOf(",");
  if (lastComma === -1) return <>{title}</>;
  const before = title.slice(0, lastComma + 1);
  const after = title.slice(lastComma + 1).trim();
  return (
    <>
      {before} <span className="text-gradient">{after}</span>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-3xl font-extrabold text-white">{value}</div>
      <div className="text-white/60 text-xs mt-0.5">{label}</div>
    </div>
  );
}
