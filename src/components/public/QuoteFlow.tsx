"use client";

import { useEffect, useState } from "react";
import {
  Truck,
  Loader2,
  AlertTriangle,
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  CalendarDays,
  ArrowRight,
  ArrowLeft,
  Package,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  MessageCircle,
} from "lucide-react";
import type { Quote, QuoteItem } from "@/lib/types";
import { COLOMBIA_DEPARTMENTS } from "@/lib/colombia-geo";

function parseAddress(saved: string): { department: string; city: string; detail: string } {
  const parts = saved.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 3) {
    const department = parts[parts.length - 1];
    const city = parts[parts.length - 2];
    const dept = COLOMBIA_DEPARTMENTS.find((d) => d.departamento === department);
    if (dept && dept.municipios.includes(city)) {
      return { department, city, detail: parts.slice(0, -2).join(", ") };
    }
  }
  return { department: "", city: "", detail: saved };
}

function buildAddress(detail: string, city: string, department: string): string {
  return [detail, city, department].filter(Boolean).join(", ");
}

type Step = "datos" | "inventario" | "enviado";

export default function QuoteFlow({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [companyWhatsapp, setCompanyWhatsapp] = useState("");
  const [step, setStep] = useState<Step>("datos");

  const load = async () => {
    setLoading(true);
    const res = await fetch(`/api/public/quotes/${token}`);
    if (!res.ok) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setQuote(data.quote);
    setItems(data.items || []);
    setCompanyWhatsapp(data.companyWhatsapp || "");
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (loading) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-neutral-400">
          <Loader2 className="animate-spin" size={32} />
          <p className="text-sm">Cargando...</p>
        </div>
      </Shell>
    );
  }

  if (notFound || !quote) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center px-6">
          <AlertTriangle className="text-amber-500" size={40} />
          <h1 className="text-lg font-bold text-navy">No encontramos esta cotización</h1>
          <p className="text-sm text-neutral-500 max-w-sm">
            El link puede haber expirado. Vuelve a cotizar desde la página principal.
          </p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      {step !== "enviado" && <Stepper current={step} />}

      {step === "datos" && (
        <StepDatos
          token={token}
          quote={quote}
          onSaved={(q) => {
            setQuote(q);
            setStep("inventario");
          }}
        />
      )}

      {step === "inventario" && (
        <StepInventario
          token={token}
          items={items}
          setItems={setItems}
          onBack={() => setStep("datos")}
          onNext={() => setStep("enviado")}
        />
      )}

      {step === "enviado" && <StepEnviado quote={quote} items={items} companyWhatsapp={companyWhatsapp} />}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-navy py-5">
        <div className="container-page flex items-center gap-2">
          <Truck className="text-brand-light" size={22} />
          <span className="text-white font-extrabold text-lg">
            MUDA<span className="text-brand-light">LOGIC</span>
          </span>
          <span className="text-white/50 text-xs ml-2 hidden sm:inline">· Cotiza tu mudanza</span>
        </div>
      </div>
      <div className="container-page py-8 max-w-2xl">{children}</div>
    </div>
  );
}

function Stepper({ current }: { current: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: "datos", label: "Datos" },
    { id: "inventario", label: "Inventario" },
  ];
  const idx = steps.findIndex((s) => s.id === current);

  return (
    <div className="flex items-center mb-8">
      {steps.map((s, i) => (
        <div key={s.id} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                i <= idx ? "bg-brand text-white" : "bg-neutral-200 text-neutral-500"
              }`}
            >
              {i + 1}
            </div>
            <span className={`text-[10px] font-semibold text-center ${i <= idx ? "text-brand" : "text-neutral-400"}`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-0.5 flex-1 mx-1 mb-4 ${i < idx ? "bg-brand" : "bg-neutral-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6">{children}</div>;
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide flex items-center gap-1.5">
        {icon} {label}
      </span>
      <div className="mt-1.5">{children}</div>
      <style jsx global>{`
        .pinput {
          width: 100%;
          border: 1.5px solid #e5e7eb;
          border-radius: 0.8rem;
          padding: 0.65rem 0.9rem;
          font-size: 0.9rem;
          color: #0a1128;
          outline: none;
        }
        .pinput:focus {
          border-color: var(--brand);
        }
      `}</style>
    </label>
  );
}

/* ---------------- Step 1: datos ---------------- */

function StepDatos({ token, quote, onSaved }: { token: string; quote: Quote; onSaved: (q: Quote) => void }) {
  const originParsed = parseAddress(quote.origin_address || "");
  const destParsed = parseAddress(quote.destination_address || "");

  const [form, setForm] = useState({
    client_name: quote.client_name || "",
    client_phone: quote.client_phone || "",
    client_email: quote.client_email || "",
    origin_floor: quote.origin_floor || "",
    destination_floor: quote.destination_floor || "",
    moving_date: quote.moving_date || "",
    notes: quote.notes || "",
  });
  const [originDept, setOriginDept] = useState(originParsed.department);
  const [originCity, setOriginCity] = useState(originParsed.city);
  const [originDetail, setOriginDetail] = useState(originParsed.detail);
  const [destDept, setDestDept] = useState(destParsed.department);
  const [destCity, setDestCity] = useState(destParsed.city);
  const [destDetail, setDestDetail] = useState(destParsed.detail);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const originMunicipios = COLOMBIA_DEPARTMENTS.find((d) => d.departamento === originDept)?.municipios ?? [];
  const destMunicipios = COLOMBIA_DEPARTMENTS.find((d) => d.departamento === destDept)?.municipios ?? [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.client_name || !form.client_phone || !originDept || !originCity || !destDept || !destCity) {
      setError("Completa tu nombre, teléfono, y el departamento y municipio de origen y destino.");
      return;
    }
    const payload = {
      ...form,
      origin_address: buildAddress(originDetail, originCity, originDept),
      destination_address: buildAddress(destDetail, destCity, destDept),
    };
    setSaving(true);
    const res = await fetch(`/api/public/quotes/${token}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "No se pudo guardar. Intenta de nuevo.");
      return;
    }
    onSaved({ ...quote, ...payload });
  }

  return (
    <Card>
      <h1 className="text-xl font-extrabold text-navy">Cotiza tu mudanza</h1>
      <p className="text-sm text-neutral-500 mt-1">
        Cuéntanos los detalles y el inventario — te devolvemos una cotización formal por WhatsApp.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nombre completo" icon={<User size={14} />}>
            <input className="pinput" value={form.client_name} onChange={(e) => update("client_name", e.target.value)} />
          </Field>
          <Field label="Teléfono / WhatsApp" icon={<Phone size={14} />}>
            <input className="pinput" value={form.client_phone} onChange={(e) => update("client_phone", e.target.value)} />
          </Field>
        </div>
        <Field label="Correo electrónico (opcional)" icon={<Mail size={14} />}>
          <input className="pinput" value={form.client_email} onChange={(e) => update("client_email", e.target.value)} />
        </Field>

        <div className="rounded-xl border border-neutral-100 p-4 space-y-3">
          <p className="text-xs font-bold text-brand uppercase tracking-wide flex items-center gap-1.5">
            <MapPin size={14} /> Origen
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Departamento">
              <select
                className="pinput"
                value={originDept}
                onChange={(e) => {
                  setOriginDept(e.target.value);
                  setOriginCity("");
                }}
              >
                <option value="">Selecciona...</option>
                {COLOMBIA_DEPARTMENTS.map((d) => (
                  <option key={d.departamento} value={d.departamento}>
                    {d.departamento}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Municipio">
              <select
                className="pinput disabled:opacity-50"
                value={originCity}
                onChange={(e) => setOriginCity(e.target.value)}
                disabled={!originDept}
              >
                <option value="">{originDept ? "Selecciona..." : "Elige el departamento primero"}</option>
                {originMunicipios.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid sm:grid-cols-[1fr_auto] gap-4">
            <Field label="Dirección exacta (opcional)">
              <input
                className="pinput"
                value={originDetail}
                onChange={(e) => setOriginDetail(e.target.value)}
                placeholder="Calle, carrera, barrio..."
              />
            </Field>
            <Field label="Piso (si aplica)" icon={<Building2 size={14} />}>
              <input className="pinput !w-24" value={form.origin_floor} onChange={(e) => update("origin_floor", e.target.value)} placeholder="Ej: 4" />
            </Field>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-100 p-4 space-y-3">
          <p className="text-xs font-bold text-brand uppercase tracking-wide flex items-center gap-1.5">
            <MapPin size={14} /> Destino
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Departamento">
              <select
                className="pinput"
                value={destDept}
                onChange={(e) => {
                  setDestDept(e.target.value);
                  setDestCity("");
                }}
              >
                <option value="">Selecciona...</option>
                {COLOMBIA_DEPARTMENTS.map((d) => (
                  <option key={d.departamento} value={d.departamento}>
                    {d.departamento}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Municipio">
              <select
                className="pinput disabled:opacity-50"
                value={destCity}
                onChange={(e) => setDestCity(e.target.value)}
                disabled={!destDept}
              >
                <option value="">{destDept ? "Selecciona..." : "Elige el departamento primero"}</option>
                {destMunicipios.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid sm:grid-cols-[1fr_auto] gap-4">
            <Field label="Dirección exacta (opcional)">
              <input
                className="pinput"
                value={destDetail}
                onChange={(e) => setDestDetail(e.target.value)}
                placeholder="Calle, carrera, barrio..."
              />
            </Field>
            <Field label="Piso (si aplica)" icon={<Building2 size={14} />}>
              <input className="pinput !w-24" value={form.destination_floor} onChange={(e) => update("destination_floor", e.target.value)} placeholder="Ej: 2" />
            </Field>
          </div>
        </div>

        <Field label="Fecha estimada (opcional)" icon={<CalendarDays size={14} />}>
          <input type="date" className="pinput" value={form.moving_date} onChange={(e) => update("moving_date", e.target.value)} />
        </Field>
        <Field label="Detalles adicionales (opcional)">
          <textarea className="pinput resize-none" rows={2} value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Ej: tengo un piano, necesito bodegaje temporal..." />
        </Field>

        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

        <button type="submit" disabled={saving} className="btn-primary w-full disabled:opacity-60">
          {saving ? "Guardando..." : "Continuar al inventario"} <ArrowRight size={18} />
        </button>
      </form>
    </Card>
  );
}

/* ---------------- Step 2: inventario ---------------- */

function StepInventario({
  token,
  items,
  setItems,
  onBack,
  onNext,
}: {
  token: string;
  items: QuoteItem[];
  setItems: (items: QuoteItem[]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  async function addItem() {
    setError("");
    if (!name.trim()) {
      setError("Escribe el nombre del artículo");
      return;
    }
    setAdding(true);
    const res = await fetch(`/api/public/quotes/${token}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, category: "", quantity }),
    });
    const data = await res.json();
    setAdding(false);
    if (!res.ok) {
      setError(data.error || "No se pudo agregar el artículo");
      return;
    }
    setItems([...items, { id: data.id, quote_id: "", name, category: "", quantity, created_at: new Date().toISOString() }]);
    setName("");
    setQuantity(1);
  }

  async function removeItem(id: string) {
    setItems(items.filter((i) => i.id !== id));
    await fetch(`/api/public/quotes/${token}/items/${id}`, { method: "DELETE" });
  }

  return (
    <Card>
      <h1 className="text-xl font-extrabold text-navy flex items-center gap-2">
        <Package size={20} className="text-brand" /> Inventario detallado
      </h1>
      <p className="text-sm text-neutral-500 mt-1">
        Agrega los objetos y muebles que vas a mudar — entre más detallado, más precisa la cotización.
      </p>

      <div className="mt-6 grid sm:grid-cols-[1fr_auto] gap-4">
        <Field label="Artículo">
          <input
            className="pinput"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addItem();
              }
            }}
            placeholder="Ej: Nevera, sofá, caja de cocina..."
          />
        </Field>
        <Field label="Cant.">
          <div className="flex items-center gap-1 border-1.5 border-neutral-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3 py-2.5 text-neutral-500 hover:bg-neutral-100 active:bg-neutral-200"
              aria-label="Restar"
            >
              <Minus size={16} />
            </button>
            <span className="w-8 text-center text-sm font-bold text-navy select-none">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(999, q + 1))}
              className="px-3 py-2.5 text-neutral-500 hover:bg-neutral-100 active:bg-neutral-200"
              aria-label="Sumar"
            >
              <Plus size={16} />
            </button>
          </div>
        </Field>
      </div>

      {error && <p className="mt-3 text-sm text-red-600 font-medium">{error}</p>}

      <button
        onClick={addItem}
        disabled={adding}
        className="mt-4 flex items-center gap-1.5 text-sm font-bold text-white bg-navy rounded-xl px-4 py-2.5 hover:bg-navy-soft disabled:opacity-60"
      >
        <Plus size={16} /> Agregar al inventario
      </button>

      {items.length > 0 && (
        <div className="mt-6 border-t border-neutral-100 pt-5">
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-3">
            {items.length} artículo{items.length !== 1 && "s"} agregado{items.length !== 1 && "s"}
          </p>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 bg-neutral-50 rounded-xl px-3 py-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-navy truncate">{item.name}</p>
                  <p className="text-xs text-neutral-500">
                    x{item.quantity}
                  </p>
                </div>
                <button onClick={() => removeItem(item.id)} className="text-neutral-300 hover:text-red-500 shrink-0">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <button onClick={onBack} className="btn-outline !text-navy !border-neutral-300 flex-1">
          <ArrowLeft size={18} /> Atrás
        </button>
        <button onClick={onNext} className="btn-primary flex-1">
          Enviar cotización <ArrowRight size={18} />
        </button>
      </div>
    </Card>
  );
}

/* ---------------- Step 3: enviado ---------------- */

function StepEnviado({ quote, items, companyWhatsapp }: { quote: Quote; items: QuoteItem[]; companyWhatsapp: string }) {
  const [sent, setSent] = useState(false);

  function sendToCompany() {
    const lines = [
      `Hola MudaLogic, quiero cotizar mi mudanza (código ${quote.token}):`,
      `*Nombre:* ${quote.client_name}`,
      `*Teléfono:* ${quote.client_phone}`,
      `*Origen:* ${quote.origin_address}${quote.origin_floor ? ` (piso ${quote.origin_floor})` : ""}`,
      `*Destino:* ${quote.destination_address}${quote.destination_floor ? ` (piso ${quote.destination_floor})` : ""}`,
      quote.moving_date ? `*Fecha estimada:* ${quote.moving_date}` : "",
      `*Inventario:* ${items.length} artículo${items.length !== 1 ? "s" : ""} — ${items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}`,
      quote.notes ? `*Detalles:* ${quote.notes}` : "",
    ].filter(Boolean);
    const phone = (companyWhatsapp || "").replace(/\D/g, "");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank");
    setSent(true);
  }

  return (
    <Card>
      <div className="text-center py-6">
        <CheckCircle2 className="mx-auto text-emerald-500" size={52} />
        <h1 className="mt-4 text-xl font-extrabold text-navy">¡Tu inventario quedó listo!</h1>
        <p className="mt-2 text-sm text-neutral-500 max-w-sm mx-auto">
          Registramos {items.length} artículo{items.length !== 1 && "s"}. Envíalo por WhatsApp y te devolvemos una
          cotización formal con el valor de tu mudanza.
        </p>
        <div className="mt-5">
          <button onClick={sendToCompany} className="btn-whatsapp">
            <MessageCircle size={18} /> {sent ? "Enviar de nuevo por WhatsApp" : "Enviar cotización por WhatsApp"}
          </button>
        </div>
        {sent && <p className="mt-3 text-xs text-neutral-400">Te contactaremos pronto con el valor de tu mudanza.</p>}
      </div>
    </Card>
  );
}
