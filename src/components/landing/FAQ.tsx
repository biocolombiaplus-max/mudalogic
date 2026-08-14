"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { SectionHeading } from "./Services";

type Item = { question: string; answer: string };

export default function FAQ({ items }: { items: Item[] }) {
  const [open, setOpen] = useState<number | null>(0);

  if (!items || items.length === 0) return null;

  return (
    <section id="preguntas" className="py-14 sm:py-20 lg:py-24 bg-neutral-50">
      <div className="container-page max-w-3xl">
        <SectionHeading eyebrow="Preguntas frecuentes" title="Todo lo que quieres saber antes de contratar" />

        <div className="mt-12 space-y-3">
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className={`rounded-2xl border transition-colors ${
                  isOpen ? "border-brand/30 bg-brand/[0.03]" : "border-black/5 bg-white"
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 text-left px-6 py-5"
                >
                  <span className="flex items-center gap-3 font-bold text-navy text-sm sm:text-base">
                    <HelpCircle size={18} className="text-brand shrink-0" />
                    {item.question}
                  </span>
                  <ChevronDown
                    size={20}
                    className={`text-neutral-400 shrink-0 transition-transform ${isOpen ? "rotate-180 text-brand" : ""}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pl-[3.25rem] text-sm text-neutral-600 leading-relaxed">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
