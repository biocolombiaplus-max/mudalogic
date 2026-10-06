import { Star, Quote } from "lucide-react";
import { SectionHeading } from "./Services";
import HalloweenDecor from "./HalloweenDecor";

type T = { name: string; city: string; text: string; rating: number };

export default function Testimonials({ testimonials }: { testimonials: T[] }) {
  return (
    <section id="testimonios" className="relative py-14 sm:py-20 lg:py-24 bg-white overflow-hidden">
      <HalloweenDecor
        items={[
          { emoji: "🦇", className: "top-[6%] right-2 sm:right-20 text-3xl opacity-50 animate-spooky-sway", style: { animationDuration: "3.8s" } },
          { emoji: "🕸️", className: "top-[32%] -left-8 text-7xl opacity-15 rotate-[10deg]" },
          { emoji: "🕷️", className: "top-[60%] right-1 sm:right-10 text-2xl sm:text-3xl opacity-50 animate-spooky-bob", style: { animationDuration: "4.4s", animationDelay: "0.9s" } },
          { emoji: "🎃", className: "top-[88%] left-2 sm:left-14 text-3xl sm:text-4xl opacity-45 animate-spooky-bob", style: { animationDuration: "5.6s", animationDelay: "0.5s" } },
        ]}
      />
      <div className="container-page relative z-10">
        <SectionHeading
          eyebrow="Testimonios"
          title="Familias y empresas que confiaron en nosotros"
        />

        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white border border-black/5 p-7 shadow-[0_2px_20px_rgba(10,17,40,0.05)] flex flex-col"
            >
              <Quote className="text-brand/30" size={32} />
              <div className="flex text-amber-400 mt-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={15} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <p className="mt-3 text-neutral-700 leading-relaxed flex-1">&ldquo;{t.text}&rdquo;</p>
              <div className="mt-5 pt-4 border-t border-black/5">
                <p className="font-bold text-navy text-sm">{t.name}</p>
                <p className="text-xs text-neutral-500">{t.city}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
