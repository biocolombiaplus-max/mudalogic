import { MapPin, ArrowRight, Truck } from "lucide-react";

const ROUTES: { from: string; to: string }[] = [
  { from: "Cúcuta", to: "Bogotá" },
  { from: "Cúcuta", to: "Medellín" },
  { from: "Cúcuta", to: "Bucaramanga" },
  { from: "Medellín", to: "Bogotá" },
  { from: "Medellín", to: "Cali" },
  { from: "Medellín", to: "Barranquilla" },
  { from: "Cúcuta", to: "Cartagena" },
  { from: "Medellín", to: "Pereira" },
  { from: "Cúcuta", to: "Santa Marta" },
  { from: "Medellín", to: "Bucaramanga" },
  { from: "Cúcuta", to: "Cali" },
  { from: "Medellín", to: "Cartagena" },
];

function RouteChip({ from, to }: { from: string; to: string }) {
  return (
    <div className="flex items-center gap-2.5 shrink-0 px-5 py-2.5 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-sm">
      <MapPin size={14} className="text-brand-light shrink-0" />
      <span className="text-sm font-semibold text-white whitespace-nowrap">{from}</span>
      <ArrowRight size={13} className="text-white/40 shrink-0" />
      <span className="text-sm font-semibold text-white whitespace-nowrap">{to}</span>
    </div>
  );
}

function Track({ reverse }: { reverse?: boolean }) {
  return (
    <div className={`flex items-center gap-3 shrink-0 ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}>
      {[0, 1].map((rep) => (
        <div key={rep} className="flex items-center gap-3 shrink-0" aria-hidden={rep === 1}>
          {ROUTES.map((r, i) => (
            <RouteChip key={`${rep}-${i}`} from={r.from} to={r.to} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function RoutesBanner() {
  return (
    <section className="relative bg-navy py-7 overflow-hidden border-y border-white/5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_50%,rgba(77,141,255,0.18),transparent_50%),radial-gradient(circle_at_90%_50%,rgba(17,87,224,0.22),transparent_50%)]" />

      <div className="relative container-page flex items-center gap-3 mb-5">
        <div className="flex items-center gap-2 text-brand-light shrink-0">
          <Truck size={18} />
          <span className="text-xs font-bold uppercase tracking-wide">Cobertura nacional</span>
        </div>
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs text-white/50 shrink-0 hidden sm:inline">🎃 Rutas frecuentes, toda Colombia</span>
      </div>

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-navy to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-navy to-transparent z-10" />
        <Track />
      </div>
    </section>
  );
}
