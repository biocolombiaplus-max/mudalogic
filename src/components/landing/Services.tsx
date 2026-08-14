import { Box, Truck, Tag, FileSignature, MapPinned, Users, LucideIcon } from "lucide-react";

type Service = { title: string; desc: string; icon: string };

const ICONS: Record<string, LucideIcon> = {
  box: Box,
  truck: Truck,
  price: Tag,
  doc: FileSignature,
  map: MapPinned,
  team: Users,
};

export default function Services({ services }: { services: Service[] }) {
  return (
    <section id="servicios" className="py-24 bg-white">
      <div className="container-page">
        <SectionHeading
          eyebrow="Nuestros servicios"
          title="Todo lo que necesitas para tu mudanza, en un solo lugar"
          subtitle="Desde el primer embalaje hasta el último mueble en su sitio: nos encargamos de cada detalle."
        />

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => {
            const Icon = ICONS[s.icon] ?? Box;
            return (
              <div
                key={i}
                className="group rounded-2xl border border-black/5 bg-white p-7 shadow-[0_2px_20px_rgba(10,17,40,0.06)] hover:shadow-[0_15px_40px_rgba(17,87,224,0.15)] hover:-translate-y-1.5 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-brand/10 flex items-center justify-center text-brand group-hover:bg-brand group-hover:text-white transition-colors">
                  <Icon size={26} />
                </div>
                <h3 className="mt-5 text-lg font-bold text-navy">{s.title}</h3>
                <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  light,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  light?: boolean;
}) {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <span className="inline-block text-xs font-bold tracking-widest uppercase text-brand bg-brand/10 rounded-full px-4 py-1.5">
        {eyebrow}
      </span>
      <h2
        className={`mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight ${
          light ? "text-white" : "text-navy"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-4 text-base ${light ? "text-white/70" : "text-neutral-600"}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
