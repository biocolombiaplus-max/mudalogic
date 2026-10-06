"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Truck,
  Loader2,
  AlertTriangle,
  User,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  ArrowRight,
  ArrowLeft,
  Package,
  Camera,
  Trash2,
  Plus,
  PenLine,
  CheckCircle2,
  ClipboardList,
  MapPinned,
  ShieldCheck,
  FileDown,
  MessageCircle,
} from "lucide-react";
import SignaturePad from "@/components/SignaturePad";
import type { Contract, ContractPhoto, InventoryItem } from "@/lib/types";

const CATEGORIES = ["Sala", "Habitación", "Cocina", "Electrodomésticos", "Oficina", "Cajas", "Frágil / especial", "Otro"];
const CONDITIONS = ["Excelente", "Bueno", "Con detalles previos", "Frágil - requiere cuidado especial"];
const ROOM_AREAS = ["Sala", "Comedor", "Cocina", "Habitación 1", "Habitación 2", "Habitación 3", "Baño", "Otro espacio"];

const CLAUSES: { title: string; body: string }[] = [
  {
    title: "1. Recepción y estado de los bienes",
    body: "Declaras que los bienes del inventario se entregan en condiciones normales de uso, salvo lo que anotes en observaciones. Autorizas el registro fotográfico y/o en video como constancia del estado de los mismos al momento del cargue y descargue, para efectos probatorios.",
  },
  {
    title: "2. Inventario declarado",
    body: "El servicio comprende exclusivamente los bienes relacionados en el inventario que diligenciaste. Incluir elementos adicionales después generará costos extra que deberás asumir.",
  },
  {
    title: "3. Dirección de entrega obligatoria",
    body: "Te obligas a suministrar una dirección exacta, clara y completa del lugar de entrega. Si no lo haces oportunamente, autorizas a MudaLogic a custodiar temporalmente los bienes, generándose un cobro mensual por bodegaje hasta su retiro o entrega final.",
  },
  {
    title: "4. Seguro de transporte de mercancía",
    body: "Puedes contratar una póliza de seguro sobre los bienes transportados, cuyo valor asumirías directamente. Si no la contratas, aceptas que la responsabilidad de MudaLogic se limita al valor del servicio contratado, conforme a los artículos 981, 982 y concordantes del Código de Comercio.",
  },
  {
    title: "5. Elementos frágiles o especiales",
    body: "Electrodomésticos, televisores, pantallas, objetos en vidrio o similares sin su empaque original o protección especializada viajan bajo tu responsabilidad, salvo que contrates empaque técnico adicional o seguro todo riesgo.",
  },
  {
    title: "6. Derecho de retención y mora",
    body: "MudaLogic podrá retener los bienes transportados hasta el pago total del servicio. El incumplimiento en el pago genera mora automática sin necesidad de requerimiento previo (artículo 1608 del Código Civil).",
  },
  {
    title: "7. Abandono de bienes",
    body: "Si pasan sesenta (60) días calendario desde el requerimiento de retiro o entrega sin que canceles los valores pendientes ni dispongas destino de los bienes, se entenderá abandono, autorizando a MudaLogic a iniciar el trámite legal correspondiente.",
  },
  {
    title: "8. Notificación electrónica",
    body: "Autorizas que cualquier comunicación sobre este servicio se haga por llamada, SMS, WhatsApp o correo electrónico, conforme a la Ley 527 de 1999.",
  },
  {
    title: "9. Validez del contrato y domicilio contractual",
    body: "Este contrato solo tiene validez una vez se haya girado el anticipo pactado. Las partes fijan como domicilio contractual la ciudad de Cúcuta, Norte de Santander. Al firmar, declaras haber leído, entendido y aceptado íntegramente estas condiciones, con mérito probatorio conforme a los artículos 1602 del Código Civil y 822 del Código de Comercio.",
  },
];

type Step = "datos" | "inventario" | "firma_cliente" | "completado";

export default function ContractFlow({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [contract, setContract] = useState<Contract | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [photos, setPhotos] = useState<ContractPhoto[]>([]);
  const [companyWhatsapp, setCompanyWhatsapp] = useState("");
  const [step, setStep] = useState<Step>("datos");

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/public/contracts/${token}`);
    if (!res.ok) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setContract(data.contract);
    setInventory(data.inventory);
    setPhotos(data.photos || []);
    setCompanyWhatsapp(data.companyWhatsapp || "");
    if (data.contract.client_signature) {
      setStep("completado");
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-neutral-400">
          <Loader2 className="animate-spin" size={32} />
          <p className="text-sm">Cargando tu contrato...</p>
        </div>
      </Shell>
    );
  }

  if (notFound || !contract) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center px-6">
          <AlertTriangle className="text-amber-500" size={40} />
          <h1 className="text-lg font-bold text-navy">No encontramos este contrato</h1>
          <p className="text-sm text-neutral-500 max-w-sm">
            Verifica el link que te compartimos por WhatsApp o correo, o contáctanos si crees que esto es un error.
          </p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      {step !== "completado" && <Stepper current={step} />}

      {step === "datos" && (
        <StepDatos
          token={token}
          contract={contract}
          onSaved={(c) => {
            setContract(c);
            setStep("inventario");
          }}
        />
      )}

      {step === "inventario" && (
        <StepInventario
          token={token}
          items={inventory}
          setItems={setInventory}
          photos={photos}
          setPhotos={setPhotos}
          onBack={() => setStep("datos")}
          onNext={() => setStep("firma_cliente")}
        />
      )}

      {step === "firma_cliente" && (
        <StepFirmaCliente
          token={token}
          contract={contract}
          inventory={inventory}
          onBack={() => setStep("inventario")}
          onSigned={(c) => {
            setContract(c);
            setStep("completado");
          }}
        />
      )}

      {step === "completado" && (
        <StepCompletado
          token={token}
          contract={contract}
          inventory={inventory}
          photos={photos}
          companyWhatsapp={companyWhatsapp}
        />
      )}
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
          <span className="text-white/50 text-xs ml-2 hidden sm:inline">· Contrato de servicio digital</span>
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
    { id: "firma_cliente", label: "Tu firma" },
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

function StepDatos({
  token,
  contract,
  onSaved,
}: {
  token: string;
  contract: Contract;
  onSaved: (c: Contract) => void;
}) {
  const [form, setForm] = useState({
    client_name: contract.client_name || "",
    client_doc: contract.client_doc || "",
    client_phone: contract.client_phone || "",
    client_email: contract.client_email || "",
    origin_address: contract.origin_address || "",
    destination_address: contract.destination_address || "",
    moving_date: contract.moving_date || "",
    pickup_datetime: contract.pickup_datetime || "",
    completion_datetime: contract.completion_datetime || "",
    notes: contract.notes || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.client_name || !form.client_phone || !form.origin_address || !form.destination_address) {
      setError("Completa al menos tu nombre, teléfono, origen y destino.");
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/public/contracts/${token}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "No se pudo guardar. Intenta de nuevo.");
      return;
    }
    onSaved({ ...contract, ...form });
  }

  return (
    <Card>
      <h1 className="text-xl font-extrabold text-navy">Confirma tus datos</h1>
      <p className="text-sm text-neutral-500 mt-1">Revisa y completa la información de tu mudanza.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nombre completo" icon={<User size={14} />}>
            <input className="pinput" value={form.client_name} onChange={(e) => update("client_name", e.target.value)} />
          </Field>
          <Field label="Documento de identidad">
            <input className="pinput" value={form.client_doc} onChange={(e) => update("client_doc", e.target.value)} />
          </Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Teléfono" icon={<Phone size={14} />}>
            <input className="pinput" value={form.client_phone} onChange={(e) => update("client_phone", e.target.value)} />
          </Field>
          <Field label="Correo electrónico" icon={<Mail size={14} />}>
            <input className="pinput" value={form.client_email} onChange={(e) => update("client_email", e.target.value)} />
          </Field>
        </div>
        <Field label="Dirección de origen" icon={<MapPin size={14} />}>
          <input className="pinput" value={form.origin_address} onChange={(e) => update("origin_address", e.target.value)} />
        </Field>
        <Field label="Dirección de destino" icon={<MapPin size={14} />}>
          <input className="pinput" value={form.destination_address} onChange={(e) => update("destination_address", e.target.value)} />
        </Field>
        <Field label="Fecha de la mudanza" icon={<CalendarDays size={14} />}>
          <input type="date" className="pinput" value={form.moving_date} onChange={(e) => update("moving_date", e.target.value)} />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Hora y fecha de recogida" icon={<CalendarDays size={14} />}>
            <input
              type="datetime-local"
              className="pinput"
              value={form.pickup_datetime}
              onChange={(e) => update("pickup_datetime", e.target.value)}
            />
          </Field>
          <Field label="Hora y fecha estimada de terminación" icon={<CalendarDays size={14} />}>
            <input
              type="datetime-local"
              className="pinput"
              value={form.completion_datetime}
              onChange={(e) => update("completion_datetime", e.target.value)}
            />
          </Field>
        </div>
        <Field label="Notas adicionales">
          <textarea className="pinput resize-none" rows={2} value={form.notes} onChange={(e) => update("notes", e.target.value)} />
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
  photos,
  setPhotos,
  onBack,
  onNext,
}: {
  token: string;
  items: InventoryItem[];
  setItems: (items: InventoryItem[]) => void;
  photos: ContractPhoto[];
  setPhotos: (photos: ContractPhoto[]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [quantity, setQuantity] = useState(1);
  const [condition, setCondition] = useState(CONDITIONS[0]);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [uploadingArea, setUploadingArea] = useState<string | null>(null);

  async function addItem() {
    setError("");
    if (!name.trim()) {
      setError("Escribe el nombre del artículo");
      return;
    }
    setAdding(true);
    const res = await fetch(`/api/public/contracts/${token}/inventory`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, category, quantity, condition }),
    });
    const data = await res.json();
    setAdding(false);
    if (!res.ok) {
      setError(data.error || "No se pudo agregar el artículo");
      return;
    }
    setItems([
      ...items,
      { id: data.id, contract_id: "", name, category, quantity, condition, photo: null, loaded: false, is_additional: false, driver_note: null, created_at: new Date().toISOString() },
    ]);
    setName("");
    setQuantity(1);
  }

  async function removeItem(id: string) {
    setItems(items.filter((i) => i.id !== id));
    await fetch(`/api/public/contracts/${token}/inventory/${id}`, { method: "DELETE" });
  }

  async function handleAreaPhoto(area: string, file: File) {
    setUploadingArea(area);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("caption", area);
    const res = await fetch(`/api/public/contracts/${token}/photos`, { method: "POST", body: fd });
    const data = await res.json();
    setUploadingArea(null);
    if (res.ok) {
      setPhotos([...photos, { id: data.id, contract_id: "", url: data.url, caption: area, created_at: new Date().toISOString() }]);
    }
  }

  async function removePhoto(id: string) {
    setPhotos(photos.filter((p) => p.id !== id));
    await fetch(`/api/public/contracts/${token}/photos/${id}`, { method: "DELETE" });
  }

  return (
    <Card>
      <h1 className="text-xl font-extrabold text-navy flex items-center gap-2">
        <Package size={20} className="text-brand" /> Inventario de la mudanza
      </h1>
      <p className="text-sm text-neutral-500 mt-1">
        Agrega rápido los objetos que vamos a transportar — al final tomas unas pocas fotos por espacio, no una por
        artículo.
      </p>

      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        <Field label="Artículo">
          <input className="pinput" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Nevera, sofá, caja de cocina..." />
        </Field>
        <Field label="Categoría">
          <select className="pinput" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Cantidad">
          <input
            type="number"
            min={1}
            className="pinput"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
          />
        </Field>
        <Field label="Estado">
          <select className="pinput" value={condition} onChange={(e) => setCondition(e.target.value)}>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
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
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 bg-neutral-50 rounded-xl px-3 py-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-md bg-neutral-200 shrink-0 text-neutral-400">
                  <Package size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-navy truncate">{item.name}</p>
                  <p className="text-xs text-neutral-500">
                    {item.category} · x{item.quantity} · {item.condition}
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

      <div className="mt-6 border-t border-neutral-100 pt-5">
        <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-1 flex items-center gap-1.5">
          <Camera size={14} /> Fotos por espacio ({photos.length})
        </p>
        <p className="text-xs text-neutral-400 mb-3">
          Toma una foto de cada espacio (sala, comedor, habitaciones, baños) donde se vean los objetos — mucho más
          rápido que una foto por artículo, y queda igual de claro en el contrato.
        </p>
        <div className="flex flex-wrap gap-2">
          {ROOM_AREAS.map((area) => {
            const done = photos.some((p) => p.caption === area);
            return (
              <label
                key={area}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full border cursor-pointer ${
                  done ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-white text-brand border-brand/30 hover:bg-brand/5"
                }`}
              >
                {uploadingArea === area ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : done ? (
                  <CheckCircle2 size={13} />
                ) : (
                  <Camera size={13} />
                )}
                {area}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleAreaPhoto(area, f);
                    e.target.value = "";
                  }}
                />
              </label>
            );
          })}
        </div>
        {photos.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mt-3">
            {photos.map((p) => (
              <div key={p.id} className="relative aspect-square rounded-lg overflow-hidden border border-neutral-200 group">
                <Image src={p.url} alt={p.caption || "Foto"} fill unoptimized className="object-cover" />
                <span className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[9px] text-center py-0.5 truncate px-1">
                  {p.caption}
                </span>
                <button
                  onClick={() => removePhoto(p.id)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        <button onClick={onBack} className="btn-outline !text-navy !border-neutral-300 flex-1">
          <ArrowLeft size={18} /> Atrás
        </button>
        <button onClick={onNext} className="btn-primary flex-1">
          Continuar a la firma <ArrowRight size={18} />
        </button>
      </div>
    </Card>
  );
}

/* ---------------- Step 3: firma cliente ---------------- */

function StepFirmaCliente({
  token,
  contract,
  inventory,
  onBack,
  onSigned,
}: {
  token: string;
  contract: Contract;
  inventory: InventoryItem[];
  onBack: () => void;
  onSigned: (c: Contract) => void;
}) {
  const [fullName, setFullName] = useState(contract.client_name || "");
  const [hasInsurance, setHasInsurance] = useState(contract.has_insurance ?? false);
  const [declaredValue, setDeclaredValue] = useState(contract.declared_value || "");
  const [accepted, setAccepted] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSign() {
    setError("");
    if (!fullName.trim()) {
      setError("Escribe tu nombre completo para firmar");
      return;
    }
    if (!accepted) {
      setError("Debes aceptar las condiciones contractuales del servicio");
      return;
    }
    if (!signature) {
      setError("Por favor firma en el recuadro antes de continuar");
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/public/contracts/${token}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_signature: signature,
        client_signed_name: fullName,
        has_insurance: hasInsurance,
        declared_value: declaredValue,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "No se pudo registrar la firma");
      return;
    }
    onSigned({
      ...contract,
      client_signature: signature,
      client_signed_name: fullName,
      has_insurance: hasInsurance,
      declared_value: declaredValue,
      status: "pendiente_anticipo",
    });
  }

  return (
    <Card>
      <h1 className="text-xl font-extrabold text-navy flex items-center gap-2">
        <ClipboardList size={20} className="text-brand" /> Contrato de servicio
      </h1>

      <div className="mt-4 rounded-xl bg-neutral-50 border border-neutral-100 p-4 text-sm text-neutral-600 leading-relaxed">
        <p>
          Por medio del presente documento, <strong>{fullName || "el cliente"}</strong>, identificado con documento{" "}
          {contract.client_doc || "___________"}, contrata a <strong>MudaLogic</strong> (representada legalmente por
          Manuel Alejandro Barbosa Pérez, NIT 80089450-5) para la prestación del servicio de mudanza/trasteo nacional
          desde <strong>{contract.origin_address || "el origen indicado"}</strong> hacia{" "}
          <strong>{contract.destination_address || "el destino indicado"}</strong>
          {contract.moving_date ? `, con fecha estimada del ${contract.moving_date}` : ""}.
        </p>
        <p className="mt-2">
          El servicio incluye empaque, cargue, transporte, descargue y desempaque de los bienes relacionados en el
          inventario adjunto ({inventory.length} artículo{inventory.length !== 1 && "s"}), con su respectiva
          condición y evidencia fotográfica. Valor acordado del servicio: <strong>{contract.freight_value || contract.price || "a confirmar"}</strong>.
        </p>
        {contract.notes && (
          <p className="mt-2">
            <strong>Notas adicionales:</strong> {contract.notes}
          </p>
        )}
      </div>

      <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 font-medium">
        ⚠️ Este contrato solo tiene validez una vez realices el pago del anticipo acordado. Al firmar, tu contrato
        queda enviado a MudaLogic para su revisión y confirmación.
      </div>

      <div className="mt-4 rounded-xl border border-neutral-200 p-4 max-h-56 overflow-y-auto">
        <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-2">
          Condiciones contractuales del servicio
        </p>
        {CLAUSES.map((c) => (
          <div key={c.title} className="mb-3 last:mb-0">
            <p className="text-xs font-bold text-navy">{c.title}</p>
            <p className="text-xs text-neutral-500 leading-relaxed mt-0.5">{c.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <Field label="Firma como (nombre completo)" icon={<User size={14} />}>
          <input className="pinput" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </Field>
      </div>

      <div className="mt-4 rounded-xl bg-brand/5 border border-brand/15 p-4">
        <p className="text-xs font-bold text-navy uppercase tracking-wide flex items-center gap-1.5 mb-2">
          <ShieldCheck size={14} className="text-brand" /> Seguro de transporte
        </p>
        <div className="flex gap-4 text-sm text-neutral-700">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="radio" checked={hasInsurance} onChange={() => setHasInsurance(true)} /> Sí quiero contratar seguro
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="radio" checked={!hasInsurance} onChange={() => setHasInsurance(false)} /> No contrato seguro
          </label>
        </div>
        <div className="mt-3">
          <Field label="Valor declarado de los bienes (opcional)">
            <input
              className="pinput"
              value={declaredValue}
              onChange={(e) => setDeclaredValue(e.target.value)}
              placeholder="Ej: $5.000.000"
            />
          </Field>
        </div>
        {!hasInsurance && (
          <p className="text-[11px] text-neutral-500 mt-2">
            Al no contratar seguro, aceptas que la responsabilidad de MudaLogic se limita al valor del servicio
            contratado (cláusula 4).
          </p>
        )}
      </div>

      <label className="mt-4 flex items-start gap-2 text-sm text-neutral-600 cursor-pointer">
        <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-1" />
        He leído y acepto el inventario y las condiciones contractuales de este servicio con MudaLogic.
      </label>

      <div className="mt-4">
        <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide flex items-center gap-1.5">
          <PenLine size={14} /> Firma del cliente
        </span>
        <div className="mt-1.5">
          <SignaturePad onChange={setSignature} />
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-600 font-medium">{error}</p>}

      <div className="mt-6 flex gap-3">
        <button onClick={onBack} className="btn-outline !text-navy !border-neutral-300 flex-1">
          <ArrowLeft size={18} /> Atrás
        </button>
        <button onClick={handleSign} disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
          {saving ? "Guardando firma..." : "Firmar contrato"} <PenLine size={18} />
        </button>
      </div>
    </Card>
  );
}

/* ---------------- Step 4: completado ---------------- */

function StepCompletado({
  token,
  contract,
  inventory,
  photos,
  companyWhatsapp,
}: {
  token: string;
  contract: Contract;
  inventory: InventoryItem[];
  photos: ContractPhoto[];
  companyWhatsapp: string;
}) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const contractUrl = `${origin}/contrato/${token}`;
  const pdfUrl = `${origin}/api/public/contracts/${token}/pdf`;
  const representativeSigned = Boolean(contract.staff_signature);

  function sendToCompany() {
    const msg = `Hola MudaLogic, soy ${contract.client_signed_name || contract.client_name} y acabo de firmar mi contrato de mudanza (código ${token}).\n\nPDF del contrato: ${pdfUrl}\nLink: ${contractUrl}\n\nQuedo atento(a) a la confirmación una vez realice el anticipo.`;
    const phone = (companyWhatsapp || "").replace(/\D/g, "");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  return (
    <Card>
      <div className="text-center py-4">
        <CheckCircle2 className="mx-auto text-emerald-500" size={52} />
        <h1 className="mt-4 text-xl font-extrabold text-navy">¡Contrato firmado con éxito!</h1>
        <p className="mt-2 text-sm text-neutral-500 max-w-sm mx-auto">
          Tu mudanza quedó registrada con {inventory.length} artículo{inventory.length !== 1 && "s"}
          {photos.length > 0 && ` y ${photos.length} foto${photos.length !== 1 ? "s" : ""} de los espacios`}.
        </p>

        <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 font-medium max-w-sm mx-auto">
          ⚠️ Tu contrato queda <strong>pendiente de validez</strong> hasta que realices el anticipo y MudaLogic lo
          confirme. Envíalo ahora por WhatsApp para agilizar la confirmación.
        </div>

        <div className="mt-5">
          <button onClick={sendToCompany} className="btn-whatsapp">
            <MessageCircle size={18} /> Enviar contrato firmado por WhatsApp
          </button>
        </div>

        <div className="mt-5 inline-flex items-center gap-2 bg-neutral-100 rounded-full px-5 py-2.5">
          <MapPinned size={16} className="text-brand" />
          <code className="font-bold text-navy">{token}</code>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link href={`/rastreo/${token}`} className="btn-primary">
            Rastrear mi mudanza <ArrowRight size={18} />
          </Link>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline !text-navy !border-neutral-300"
          >
            Descargar orden de servicio (PDF) <FileDown size={18} />
          </a>
        </div>
      </div>

      <div className="mt-6 border-t border-neutral-100 pt-5 grid grid-cols-2 gap-4">
        <SignaturePreview label="Firma del cliente" src={contract.client_signature} name={contract.client_signed_name} />
        <div>
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-1.5">Firma del representante legal</p>
          <div className="relative aspect-[3/2] rounded-lg border border-neutral-200 bg-neutral-50 flex items-center justify-center">
            {representativeSigned ? (
              <Image src={contract.staff_signature!} alt="Firma del representante" fill unoptimized className="object-contain p-2" />
            ) : (
              <span className="text-xs text-neutral-400 text-center px-3">Pendiente — MudaLogic firma al confirmar el anticipo</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function SignaturePreview({ label, src, name }: { label: string; src: string | null; name: string | null }) {
  return (
    <div>
      <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-1.5">{label}</p>
      <div className="relative aspect-[3/2] rounded-lg border border-neutral-200 bg-neutral-50">
        {src && <Image src={src} alt={label} fill unoptimized className="object-contain p-2" />}
      </div>
      {name && <p className="text-xs text-neutral-500 mt-1">{name}</p>}
    </div>
  );
}
