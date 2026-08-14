import Image from "next/image";
import { Box } from "lucide-react";
import { ICON_MAP } from "@/lib/icon-map";

type Service = { title: string; desc: string; icon: string; image?: string };

export default function Services({ services }: { services: Service[] }) {
  return (
    <section id="servicios" className="py-24 bg-white">
      <div className="container-page">
        <SectionHeading
          eyebrow="Nuestros servicios"
          title="Todo lo que necesitas para tu mudanza, en un solo lugar"
          subtitle="Desde el primer embalaje hasta el último mueble en su sitio: nos encargamos de cada detalle."
        />

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {services.map((s, i) => {
            const Icon = ICON_MAP[s.icon] ?? Box;
            return (
              <div
                key={i}
                className="group rounded-2xl border border-black/5 bg-white overflow-hidden shadow-[0_2px_20px_rgba(10,17,40,0.06)] hover:shadow-[0_20px_45px_rgba(17,87,224,0.18)] hover:-translate-y-1.5 transition-all duration-300"
              >
                <div className="relative aspect-[4/3] bg-gradient-to-br from-navy to-brand-dark overflow-hidden">
                  {s.image ? (
                    <Image
                      src={s.image}
                      alt={s.title}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white/25">
                      <Icon size={56} strokeWidth={1.3} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-navy/10 to-transparent" />
                  <div className="absolute bottom-3 left-3 w-11 h-11 rounded-xl bg-white shadow-lg flex items-center justify-center text-brand">
                    <Icon size={20} />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-navy">{s.title}</h3>
                  <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{s.desc}</p>
                </div>
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
