"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Menu, X, Phone, MapPin, ChevronRight } from "lucide-react";
import { resolveLogoSizePx } from "@/lib/logo-size";

type Props = {
  logo: string;
  logoSize?: string;
  logoPosition?: string;
  phoneDisplay: string;
  onOpenQuote: () => void;
};

const links = [
  { href: "#servicios", label: "Servicios" },
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#ubicacion", label: "Ubicación" },
  { href: "#preguntas", label: "Preguntas" },
  { href: "#rastreo", label: "Rastrear mudanza" },
  { href: "#contacto", label: "Contacto" },
];

export default function Header({ logo, logoSize = "56", logoPosition = "left", phoneDisplay, onOpenQuote }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const heightPx = resolveLogoSizePx(logoSize);
  const isCenter = logoPosition === "center";
  const isRight = logoPosition === "right";
  const brandOrderClass = isRight ? "order-3" : "order-1";
  const navOrderClass = isRight || isCenter ? "lg:order-1" : "lg:order-2";
  const actionsOrderClass = isRight ? "lg:order-2" : "lg:order-3";
  const mobileButtonClass = isRight ? "order-1" : "order-3 ml-auto lg:ml-0";

  const brandInner = logo ? (
    <Image
      src={logo}
      alt="MudaLogic"
      width={220}
      height={heightPx}
      style={{ height: heightPx, width: "auto" }}
      className="object-contain"
      unoptimized
      priority
    />
  ) : (
    <span className="text-2xl font-extrabold tracking-tight text-white">
      MUDA<span className="text-brand-light">LOGIC</span>
    </span>
  );

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? "bg-navy/95 backdrop-blur shadow-lg shadow-black/20"
          : "bg-gradient-to-b from-navy/80 via-navy/40 to-transparent"
      }`}
    >
      <div className="relative z-40 container-page flex items-center justify-between py-3">
        {!isCenter && (
          <a href="#inicio" className={`flex items-center gap-2 shrink-0 ${brandOrderClass}`}>
            {brandInner}
          </a>
        )}

        <nav className={`hidden lg:flex items-center gap-7 text-sm font-medium text-white/90 ${navOrderClass}`}>
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-brand-light transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        <div className={`hidden lg:flex items-center gap-4 ${actionsOrderClass}`}>
          <a
            href={`tel:+57${phoneDisplay.replace(/\s|-/g, "")}`}
            className="flex items-center gap-2 text-white/90 text-sm font-semibold hover:text-brand-light"
          >
            <Phone size={16} /> {phoneDisplay}
          </a>
          <button onClick={onOpenQuote} className="btn-primary !py-2.5 !px-5 text-sm">
            Cotizar ahora
          </button>
        </div>

        <button
          className={`lg:hidden text-white p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 ${mobileButtonClass}`}
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menú"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>

        {isCenter && (
          <a
            href="#inicio"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 shrink-0"
          >
            {brandInner}
          </a>
        )}
      </div>

      {open && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-navy/60 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        />
      )}

      {open && (
        <div className="lg:hidden absolute top-full left-0 right-0 z-50 bg-navy border-t border-white/10 rounded-b-2xl shadow-2xl shadow-black/40 overflow-hidden">
          <nav className="container-page py-3 flex flex-col">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between gap-2 text-white/90 font-medium py-3.5 border-b border-white/[0.06] last:border-0 active:bg-white/5 rounded-lg px-2 -mx-2 transition-colors"
              >
                {l.label}
                <ChevronRight size={16} className="text-white/30" />
              </a>
            ))}
          </nav>

          <div className="container-page pb-5">
            <div className="rounded-xl bg-white/5 p-4 space-y-2.5">
              <a
                href={`tel:+57${phoneDisplay.replace(/\s|-/g, "")}`}
                className="flex items-center gap-2.5 text-white font-semibold text-sm"
              >
                <Phone size={16} className="text-brand-light" /> {phoneDisplay}
              </a>
              <div className="flex items-center gap-2.5 text-white/70 text-sm">
                <MapPin size={16} className="text-brand-light shrink-0" /> Cúcuta y Medellín, para toda Colombia
              </div>
            </div>
            <button
              onClick={() => {
                setOpen(false);
                onOpenQuote();
              }}
              className="btn-primary w-full mt-4"
            >
              Cotizar ahora
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
