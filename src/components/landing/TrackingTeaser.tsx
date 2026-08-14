"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, PackageSearch } from "lucide-react";

export default function TrackingTeaser() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (!clean) {
      setError("Ingresa tu código de rastreo");
      return;
    }
    router.push(`/rastreo/${clean}`);
  }

  return (
    <section id="rastreo" className="py-14 sm:py-20 lg:py-24 bg-navy relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(77,141,255,0.18),transparent_45%)]" />
      <div className="container-page relative">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-white/10 to-white/[0.03] border border-white/10 backdrop-blur p-10 sm:p-14 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-brand/20 flex items-center justify-center text-brand-light">
            <PackageSearch size={30} />
          </div>
          <h2 className="mt-6 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            ¿Ya tienes una mudanza en curso?
          </h2>
          <p className="mt-3 text-white/70 max-w-xl mx-auto">
            Ingresa el código de rastreo que te enviamos por WhatsApp para ver en tiempo real dónde va tu mudanza.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <div className="relative flex-1">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
              <input
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError("");
                }}
                placeholder="Ej: ML-24A8"
                className="w-full pl-11 pr-4 py-3.5 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-brand-light"
              />
            </div>
            <button type="submit" className="btn-primary shrink-0">
              <Search size={18} /> Rastrear
            </button>
          </form>
          {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
        </div>
      </div>
    </section>
  );
}
