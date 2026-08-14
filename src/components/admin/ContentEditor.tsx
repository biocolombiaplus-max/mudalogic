"use client";

import { useState } from "react";
import {
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  Star,
  Building2,
  Image as ImageIcon,
  MessageSquareQuote,
  BarChart3,
  Sparkles,
  MapPin,
  ShieldCheck,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";
import type { SiteContent } from "@/lib/settings";
import { ICON_OPTIONS } from "@/lib/icon-map";
import ImageUploader from "./ImageUploader";

const TABS = [
  { id: "general", label: "General", icon: Building2 },
  { id: "hero", label: "Portada", icon: Sparkles },
  { id: "servicios", label: "Servicios", icon: BarChart3 },
  { id: "confianza", label: "Confianza", icon: ShieldCheck },
  { id: "ubicacion", label: "Ubicación", icon: MapPin },
  { id: "galeria", label: "Galería", icon: ImageIcon },
  { id: "testimonios", label: "Testimonios", icon: MessageSquareQuote },
  { id: "preguntas", label: "Preguntas", icon: HelpCircle },
];

export default function ContentEditor({ initial }: { initial: SiteContent }) {
  const [tab, setTab] = useState("general");
  const [logo, setLogo] = useState(initial.logo);
  const [phone, setPhone] = useState(initial.phone_display);
  const [whatsapp, setWhatsapp] = useState(initial.whatsapp);
  const [email, setEmail] = useState(initial.email);
  const [addrCucuta, setAddrCucuta] = useState(initial.address_cucuta);
  const [addrMedellin, setAddrMedellin] = useState(initial.address_medellin);
  const [cucutaImage, setCucutaImage] = useState(initial.locationCucutaImage);
  const [medellinImage, setMedellinImage] = useState(initial.locationMedellinImage);

  const [heroTitle, setHeroTitle] = useState(initial.heroTitle);
  const [heroSubtitle, setHeroSubtitle] = useState(initial.heroSubtitle);
  const [heroImage, setHeroImage] = useState(initial.heroImage);
  const [stats, setStats] = useState(initial.stats);

  const [services, setServices] = useState(initial.services);
  const [trustBadges, setTrustBadges] = useState(initial.trustBadges);
  const [gallery, setGallery] = useState(initial.gallery);
  const [testimonials, setTestimonials] = useState(initial.testimonials);
  const [faq, setFaq] = useState(initial.faq);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError("");
    const payload = {
      "site.logo": logo,
      "site.phone_display": phone,
      "site.whatsapp": whatsapp,
      "site.email": email,
      "site.address_cucuta": addrCucuta,
      "site.address_medellin": addrMedellin,
      "location.cucuta_image": cucutaImage,
      "location.medellin_image": medellinImage,
      "hero.title": heroTitle,
      "hero.subtitle": heroSubtitle,
      "hero.image": heroImage,
      "stats.years": stats.years,
      "stats.moves": stats.moves,
      "stats.cities": stats.cities,
      "stats.rating": stats.rating,
      services: JSON.stringify(services),
      trust_badges: JSON.stringify(trustBadges),
      "gallery.images": JSON.stringify(gallery),
      testimonials: JSON.stringify(testimonials),
      faq: JSON.stringify(faq),
    };
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Error del servidor (${res.status})`);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(
        e instanceof Error
          ? `No se pudo guardar: ${e.message}`
          : "No se pudo guardar. Revisa tu conexión e intenta de nuevo."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="sticky top-0 lg:top-0 z-10 bg-neutral-50/95 backdrop-blur pb-4 -mt-1 pt-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2 flex-wrap">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full border transition-colors ${
                  tab === t.id ? "bg-navy text-white border-navy" : "bg-white text-neutral-600 border-neutral-200"
                }`}
              >
                <t.icon size={14} /> {t.label}
              </button>
            ))}
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary !py-2.5 !px-5 text-sm disabled:opacity-60">
            {saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
            {saving ? "Guardando..." : saved ? "Guardado" : "Guardar cambios"}
          </button>
        </div>
        {error && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-red-600 font-medium">
            <AlertTriangle size={15} /> {error}
          </p>
        )}
      </div>

      {tab === "general" && (
        <Card>
          <div className="grid md:grid-cols-2 gap-6">
            <ImageUploader value={logo} onChange={setLogo} label="Logo (fondo transparente recomendado)" aspect="aspect-[3/1]" />
            <div className="space-y-4">
              <TextField label="Teléfono para mostrar" value={phone} onChange={setPhone} placeholder="313 847 0094" />
              <TextField
                label="WhatsApp (solo números, con indicativo 57)"
                value={whatsapp}
                onChange={setWhatsapp}
                placeholder="573138470094"
              />
              <TextField label="Correo electrónico" value={email} onChange={setEmail} placeholder="mudalogic.adm@gmail.com" />
            </div>
          </div>
        </Card>
      )}

      {tab === "hero" && (
        <Card>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <TextField label="Título principal" value={heroTitle} onChange={setHeroTitle} />
              <TextAreaField label="Subtítulo" value={heroSubtitle} onChange={setHeroSubtitle} rows={4} />
            </div>
            <ImageUploader value={heroImage} onChange={setHeroImage} label="Imagen de portada" aspect="aspect-video" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <TextField label="Años de experiencia" value={stats.years} onChange={(v) => setStats({ ...stats, years: v })} />
            <TextField label="Mudanzas realizadas" value={stats.moves} onChange={(v) => setStats({ ...stats, moves: v })} />
            <TextField label="Ciudades cubiertas" value={stats.cities} onChange={(v) => setStats({ ...stats, cities: v })} />
            <TextField label="Calificación (ej: 4.9)" value={stats.rating} onChange={(v) => setStats({ ...stats, rating: v })} />
          </div>
        </Card>
      )}

      {tab === "servicios" && (
        <Card>
          <p className="text-xs text-neutral-500 mb-4">
            Sube una foto real de cada servicio (equipo empacando, camión, etc.) para que se vea más confiable. Si
            dejas la imagen vacía se muestra solo el ícono.
          </p>
          <div className="space-y-4">
            {services.map((s, i) => (
              <div key={i} className="rounded-xl border border-neutral-200 p-4 relative">
                <button
                  onClick={() => setServices(services.filter((_, j) => j !== i))}
                  className="absolute top-3 right-3 text-red-400 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
                <div className="grid md:grid-cols-[160px_140px_1fr] gap-4">
                  <ImageUploader
                    label="Foto"
                    value={s.image ?? ""}
                    onChange={(url) => {
                      const next = [...services];
                      next[i] = { ...s, image: url };
                      setServices(next);
                    }}
                    aspect="aspect-square"
                  />
                  <label className="block">
                    <span className="text-xs font-bold text-neutral-500 uppercase">Icono</span>
                    <select
                      value={s.icon}
                      onChange={(e) => {
                        const next = [...services];
                        next[i] = { ...s, icon: e.target.value };
                        setServices(next);
                      }}
                      className="input mt-1.5"
                    >
                      {ICON_OPTIONS.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="space-y-2">
                    <TextField
                      label="Título"
                      value={s.title}
                      onChange={(v) => {
                        const next = [...services];
                        next[i] = { ...s, title: v };
                        setServices(next);
                      }}
                    />
                    <TextAreaField
                      label="Descripción"
                      rows={3}
                      value={s.desc}
                      onChange={(v) => {
                        const next = [...services];
                        next[i] = { ...s, desc: v };
                        setServices(next);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setServices([...services, { title: "Nuevo servicio", desc: "", icon: "box", image: "" }])}
            className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-brand"
          >
            <Plus size={16} /> Agregar servicio
          </button>
        </Card>
      )}

      {tab === "confianza" && (
        <Card>
          <p className="text-xs text-neutral-500 mb-4">
            Estos son los sellos de confianza que aparecen justo debajo de la portada (ej: seguro incluido, personal
            verificado, contrato digital, rastreo en tiempo real).
          </p>
          <div className="space-y-4">
            {trustBadges.map((b, i) => (
              <div key={i} className="rounded-xl border border-neutral-200 p-4 relative">
                <button
                  onClick={() => setTrustBadges(trustBadges.filter((_, j) => j !== i))}
                  className="absolute top-3 right-3 text-red-400 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
                <div className="grid md:grid-cols-[140px_1fr] gap-4">
                  <label className="block">
                    <span className="text-xs font-bold text-neutral-500 uppercase">Icono</span>
                    <select
                      value={b.icon}
                      onChange={(e) => {
                        const next = [...trustBadges];
                        next[i] = { ...b, icon: e.target.value };
                        setTrustBadges(next);
                      }}
                      className="input mt-1.5"
                    >
                      {ICON_OPTIONS.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="space-y-2">
                    <TextField
                      label="Título"
                      value={b.title}
                      onChange={(v) => {
                        const next = [...trustBadges];
                        next[i] = { ...b, title: v };
                        setTrustBadges(next);
                      }}
                    />
                    <TextAreaField
                      label="Descripción"
                      rows={2}
                      value={b.desc}
                      onChange={(v) => {
                        const next = [...trustBadges];
                        next[i] = { ...b, desc: v };
                        setTrustBadges(next);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setTrustBadges([...trustBadges, { icon: "shield", title: "Nuevo sello de confianza", desc: "" }])}
            className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-brand"
          >
            <Plus size={16} /> Agregar sello
          </button>
        </Card>
      )}

      {tab === "ubicacion" && (
        <Card>
          <p className="text-xs text-neutral-500 mb-4">
            El mapa se genera automáticamente a partir de la dirección — no necesitas configurar nada más. Sube una
            foto de cada sede (bodega, oficina, camión) para que se vea más real.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-navy text-sm mb-3">Sede Cúcuta</h3>
              <TextField label="Dirección" value={addrCucuta} onChange={setAddrCucuta} />
              <div className="mt-3">
                <ImageUploader label="Foto de la sede" value={cucutaImage} onChange={setCucutaImage} aspect="aspect-video" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-navy text-sm mb-3">Sede Medellín</h3>
              <TextField label="Dirección" value={addrMedellin} onChange={setAddrMedellin} />
              <div className="mt-3">
                <ImageUploader label="Foto de la sede" value={medellinImage} onChange={setMedellinImage} aspect="aspect-video" />
              </div>
            </div>
          </div>
        </Card>
      )}

      {tab === "galeria" && (
        <Card>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {gallery.map((g, i) => (
              <div key={i} className="rounded-xl border border-neutral-200 p-3 relative">
                <button
                  onClick={() => setGallery(gallery.filter((_, j) => j !== i))}
                  className="absolute top-2 right-2 z-10 bg-white text-red-500 p-1.5 rounded-full shadow hover:bg-red-50"
                >
                  <Trash2 size={14} />
                </button>
                <ImageUploader
                  value={g.src}
                  onChange={(url) => {
                    const next = [...gallery];
                    next[i] = { ...g, src: url };
                    setGallery(next);
                  }}
                  aspect="aspect-square"
                />
                <input
                  value={g.caption}
                  onChange={(e) => {
                    const next = [...gallery];
                    next[i] = { ...g, caption: e.target.value };
                    setGallery(next);
                  }}
                  placeholder="Descripción de la foto"
                  className="input mt-2 text-xs"
                />
              </div>
            ))}
          </div>
          <button
            onClick={() => setGallery([...gallery, { src: "", caption: "" }])}
            className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-brand"
          >
            <Plus size={16} /> Agregar imagen
          </button>
        </Card>
      )}

      {tab === "testimonios" && (
        <Card>
          <div className="space-y-4">
            {testimonials.map((t, i) => (
              <div key={i} className="rounded-xl border border-neutral-200 p-4 relative">
                <button
                  onClick={() => setTestimonials(testimonials.filter((_, j) => j !== i))}
                  className="absolute top-3 right-3 text-red-400 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
                <div className="grid md:grid-cols-2 gap-3">
                  <TextField
                    label="Nombre"
                    value={t.name}
                    onChange={(v) => {
                      const next = [...testimonials];
                      next[i] = { ...t, name: v };
                      setTestimonials(next);
                    }}
                  />
                  <TextField
                    label="Ciudad / ruta"
                    value={t.city}
                    onChange={(v) => {
                      const next = [...testimonials];
                      next[i] = { ...t, city: v };
                      setTestimonials(next);
                    }}
                  />
                </div>
                <div className="mt-3">
                  <TextAreaField
                    label="Testimonio"
                    rows={2}
                    value={t.text}
                    onChange={(v) => {
                      const next = [...testimonials];
                      next[i] = { ...t, text: v };
                      setTestimonials(next);
                    }}
                  />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs font-bold text-neutral-500 uppercase">Calificación</span>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => {
                        const next = [...testimonials];
                        next[i] = { ...t, rating: n };
                        setTestimonials(next);
                      }}
                    >
                      <Star
                        size={18}
                        className={n <= t.rating ? "text-amber-400" : "text-neutral-300"}
                        fill="currentColor"
                        strokeWidth={0}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() =>
              setTestimonials([...testimonials, { name: "Cliente", city: "", text: "", rating: 5 }])
            }
            className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-brand"
          >
            <Plus size={16} /> Agregar testimonio
          </button>
        </Card>
      )}

      {tab === "preguntas" && (
        <Card>
          <p className="text-xs text-neutral-500 mb-4">
            Preguntas frecuentes que generan confianza antes de contratar (garantías, cobertura, precios, daños, etc.)
          </p>
          <div className="space-y-4">
            {faq.map((f, i) => (
              <div key={i} className="rounded-xl border border-neutral-200 p-4 relative">
                <button
                  onClick={() => setFaq(faq.filter((_, j) => j !== i))}
                  className="absolute top-3 right-3 text-red-400 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
                <TextField
                  label="Pregunta"
                  value={f.question}
                  onChange={(v) => {
                    const next = [...faq];
                    next[i] = { ...f, question: v };
                    setFaq(next);
                  }}
                />
                <div className="mt-3">
                  <TextAreaField
                    label="Respuesta"
                    rows={3}
                    value={f.answer}
                    onChange={(v) => {
                      const next = [...faq];
                      next[i] = { ...f, answer: v };
                      setFaq(next);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setFaq([...faq, { question: "Nueva pregunta", answer: "" }])}
            className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-brand"
          >
            <Plus size={16} /> Agregar pregunta
          </button>
        </Card>
      )}

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1.5px solid #e5e7eb;
          border-radius: 0.75rem;
          padding: 0.6rem 0.8rem;
          font-size: 0.85rem;
          color: #0a1128;
          outline: none;
        }
        .input:focus {
          border-color: var(--brand);
        }
      `}</style>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6">{children}</div>;
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input mt-1.5"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="input mt-1.5 resize-none"
      />
    </label>
  );
}
