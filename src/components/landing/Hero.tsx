"use client";

import Image from "next/image";
import { ShieldCheck, Star, ArrowRight, MessageCircle } from "lucide-react";

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
      className="relative min-h-[100svh] sm:min-h-[92vh] flex items-center overflow-hidden bg-navy"
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

      <div className="absolute inset-0 z-[6] overflow-hidden pointer-events-none select-none" aria-hidden>
        <span className="absolute -top-8 -left-10 text-9xl sm:text-[12rem] opacity-80 rotate-[-12deg] drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]">
          🕸️
        </span>
        <span className="absolute -top-10 -right-8 text-8xl sm:text-9xl opacity-70 rotate-[18deg] drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]">
          🕸️
        </span>
        <span className="absolute top-[58%] -left-6 text-7xl opacity-50 rotate-[6deg] drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]">
          🕸️
        </span>

        <span
          className="absolute top-20 right-6 sm:top-16 sm:right-20 text-5xl sm:text-6xl opacity-90 animate-spooky-drift drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
          style={{ animationDelay: "0.2s" }}
        >
          🦇
        </span>
        <span
          className="absolute top-36 right-36 sm:top-32 sm:right-56 text-3xl sm:text-4xl opacity-70 animate-spooky-drift drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
          style={{ animationDelay: "1.4s", animationDuration: "5.5s" }}
        >
          🦇
        </span>
        <span
          className="absolute top-6 left-4 sm:top-10 sm:left-16 text-3xl sm:text-5xl opacity-80 animate-spooky-sway drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
          style={{ animationDelay: "0.6s" }}
        >
          🦇
        </span>

        <span
          className="absolute bottom-24 left-2 sm:bottom-28 sm:left-10 text-6xl sm:text-7xl opacity-90 animate-spooky-bob drop-shadow-[0_6px_14px_rgba(0,0,0,0.5)]"
          style={{ animationDelay: "0s" }}
        >
          🎃
        </span>
        <span
          className="absolute bottom-10 right-4 sm:bottom-16 sm:right-16 text-5xl sm:text-6xl opacity-85 animate-spooky-bob drop-shadow-[0_6px_14px_rgba(0,0,0,0.5)]"
          style={{ animationDelay: "1.2s", animationDuration: "4.6s" }}
        >
          👻
        </span>
        <span
          className="absolute top-[42%] right-3 sm:right-6 text-3xl sm:text-4xl opacity-65 animate-spooky-bob"
          style={{ animationDelay: "2s", animationDuration: "5.2s" }}
        >
          🕷️
        </span>
      </div>

      <div className="container-page relative z-10 py-28 sm:py-32 lg:py-40">
        <div className="max-w-3xl mx-auto sm:mx-0 flex flex-col items-center sm:items-start text-center sm:text-left animate-fade-in-up">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/15 border-2 border-orange-400/60 text-white text-xs font-bold px-4 py-2 mb-6 backdrop-blur shadow-[0_0_20px_rgba(251,146,60,0.35)]">
            <span className="text-base leading-none animate-spooky-sway inline-block" style={{ animationDuration: "2.4s" }}>
              🎃
            </span>
            Modo Halloween · Mudanzas sin sustos, toda Colombia
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] text-white tracking-tight">
            <TitleWithAccent title={title || "Mudanzas sin estrés, solo sonrisas"} />
          </h1>

          <p className="mt-6 text-lg text-white/80 max-w-xl leading-relaxed">
            {subtitle}
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center sm:justify-start gap-4">
            <button onClick={onOpenQuote} className="btn-primary text-base">
              Cotiza tu mudanza gratis <ArrowRight size={18} />
            </button>
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-whatsapp text-base">
              <MessageCircle size={18} /> Escríbenos ya
            </a>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-6 justify-items-center text-center sm:flex sm:flex-wrap sm:justify-start sm:text-left sm:gap-x-10 sm:gap-y-5 w-full sm:w-auto">
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

          <div className="mt-8 flex items-center justify-center sm:justify-start gap-2 text-white/70 text-sm">
            <ShieldCheck size={18} className="text-brand-light shrink-0" />
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
