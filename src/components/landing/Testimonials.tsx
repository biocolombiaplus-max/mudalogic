import { Star, Quote } from "lucide-react";
import { SectionHeading } from "./Services";

type T = { name: string; city: string; text: string; rating: number };

export default function Testimonials({ testimonials }: { testimonials: T[] }) {
  return (
    <section id="testimonios" className="py-24 bg-neutral-50">
      <div className="container-page">
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
