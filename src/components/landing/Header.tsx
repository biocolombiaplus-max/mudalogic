"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Menu, X, Phone, MapPin } from "lucide-react";

type Props = {
  logo: string;
  phoneDisplay: string;
  onOpenQuote: () => void;
};

const links = [
  { href: "#servicios", label: "Servicios" },
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#galeria", label: "Galería" },
  { href: "#testimonios", label: "Testimonios" },
  { href: "#rastreo", label: "Rastrear mudanza" },
  { href: "#contacto", label: "Contacto" },
];

export default function Header({ logo, phoneDisplay, onOpenQuote }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-navy/95 backdrop-blur shadow-lg shadow-black/20" : "bg-transparent"
      }`}
    >
      <div className="container-page flex items-center justify-between py-3">
        <a href="#inicio" className="flex items-center gap-2 shrink-0">
          {logo ? (
            <Image
              src={logo}
              alt="MudaLogic"
              width={160}
              height={44}
              className="h-9 w-auto object-contain"
              unoptimized
            />
          ) : (
            <span className="text-2xl font-extrabold tracking-tight text-white">
              MUDA<span className="text-brand-light">LOGIC</span>
            </span>
          )}
        </a>

        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-white/90">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-brand-light transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
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
          className="lg:hidden text-white p-2"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menú"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden bg-navy border-t border-white/10">
          <div className="container-page py-4 flex flex-col gap-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-white/90 font-medium py-1"
              >
                {l.label}
              </a>
            ))}
            <a
              href={`tel:+57${phoneDisplay.replace(/\s|-/g, "")}`}
              className="flex items-center gap-2 text-white/90 font-semibold"
            >
              <Phone size={16} /> {phoneDisplay}
            </a>
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <MapPin size={16} /> Cúcuta y Medellín, para toda Colombia
            </div>
            <button
              onClick={() => {
                setOpen(false);
                onOpenQuote();
              }}
              className="btn-primary w-full"
            >
              Cotizar ahora
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
