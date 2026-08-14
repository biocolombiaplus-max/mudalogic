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
  Lock,
  CheckCircle2,
  ClipboardList,
  MapPinned,
} from "lucide-react";
import SignaturePad from "@/components/SignaturePad";
import type { Contract, InventoryItem } from "@/lib/types";

const CATEGORIES = ["Sala", "Habitación", "Cocina", "Electrodomésticos", "Oficina", "Cajas", "Frágil / especial", "Otro"];
const CONDITIONS = ["Excelente", "Bueno", "Con detalles previos", "Frágil - requiere cuidado especial"];

type Step = "datos" | "inventario" | "firma_cliente" | "firma_staff" | "completado";

export default function ContractFlow({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [contract, setContract] = useState<Contract | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
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
    if (data.contract.client_signature && data.contract.staff_signature) {
      setStep("completado");
    } else if (data.contract.client_signature) {
      setStep("firma_staff");
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
            setStep("firma_staff");
          }}
        />
      )}

      {step === "firma_staff" && (
        <StepFirmaStaff
          token={token}
          contract={contract}
          onSigned={(c) => {
            setContract(c);
            setStep("completado");
          }}
        />
      )}

      {step === "completado" && <StepCompletado token={token} contract={contract} inventory={inventory} />}
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
    { id: "firma_staff", label: "Firma transportista" },
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
  onBack,
  onNext,
}: {
  token: string;
  items: InventoryItem[];
  setItems: (items: InventoryItem[]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [quantity, setQuantity] = useState(1);
  const [condition, setCondition] = useState(CONDITIONS[0]);
  const [photo, setPhoto] = useState("");
  const [uploading, setUploading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  async function handlePhoto(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/api/public/contracts/${token}/upload`, { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (res.ok) setPhoto(data.url);
  }

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
      body: JSON.stringify({ name, category, quantity, condition, photo }),
    });
    const data = await res.json();
    setAdding(false);
    if (!res.ok) {
      setError(data.error || "No se pudo agregar el artículo");
      return;
    }
    setItems([
      ...items,
      { id: data.id, contract_id: "", name, category, quantity, condition, photo, created_at: new Date().toISOString() },
    ]);
    setName("");
    setQuantity(1);
    setPhoto("");
  }

  async function removeItem(id: string) {
    setItems(items.filter((i) => i.id !== id));
    await fetch(`/api/public/contracts/${token}/inventory/${id}`, { method: "DELETE" });
  }

  return (
    <Card>
      <h1 className="text-xl font-extrabold text-navy flex items-center gap-2">
        <Package size={20} className="text-brand" /> Inventario de la mudanza
      </h1>
      <p className="text-sm text-neutral-500 mt-1">
        Agrega los objetos que vamos a transportar. Puedes tomar una foto de cada uno para que quede registrada en el contrato.
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

      <div className="mt-4">
        <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Foto (opcional)</span>
        <div className="mt-1.5 flex items-center gap-3">
          {photo && (
            <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-neutral-200">
              <Image src={photo} alt="foto" fill unoptimized className="object-cover" />
            </div>
          )}
          <label className="flex items-center gap-2 text-sm font-semibold text-brand cursor-pointer border border-brand/30 rounded-xl px-4 py-2.5 hover:bg-brand/5">
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
            {uploading ? "Subiendo..." : "Tomar / subir foto"}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handlePhoto(f);
                e.target.value = "";
              }}
            />
          </label>
        </div>
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
                <div className="relative w-10 h-10 rounded-md overflow-hidden bg-neutral-200 shrink-0">
                  {item.photo ? (
                    <Image src={item.photo} alt={item.name} fill unoptimized className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-neutral-400">
                      <Package size={14} />
                    </div>
                  )}
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
      setError("Debes aceptar los términos del servicio");
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
      body: JSON.stringify({ client_signature: signature, client_signed_name: fullName }),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "No se pudo registrar la firma");
      return;
    }
    onSigned({ ...contract, client_signature: signature, client_signed_name: fullName });
  }

  return (
    <Card>
      <h1 className="text-xl font-extrabold text-navy flex items-center gap-2">
        <ClipboardList size={20} className="text-brand" /> Contrato de servicio
      </h1>

      <div className="mt-4 rounded-xl bg-neutral-50 border border-neutral-100 p-4 text-sm text-neutral-600 leading-relaxed max-h-56 overflow-y-auto">
        <p>
          Por medio del presente documento, <strong>{fullName || "el cliente"}</strong>, identificado con documento{" "}
          {contract.client_doc || "___________"}, contrata a <strong>MudaLogic</strong> para la prestación del
          servicio de mudanza/trasteo nacional desde <strong>{contract.origin_address || "el origen indicado"}</strong>{" "}
          hacia <strong>{contract.destination_address || "el destino indicado"}</strong>
          {contract.moving_date ? `, con fecha estimada del ${contract.moving_date}` : ""}.
        </p>
        <p className="mt-2">
          El servicio incluye empaque, cargue, transporte, descargue y desempaque de los bienes relacionados en el
          inventario adjunto ({inventory.length} artículo{inventory.length !== 1 && "s"}), los cuales han sido
          registrados con su respectiva condición y evidencia fotográfica.
        </p>
        <p className="mt-2">
          Valor acordado del servicio: <strong>{contract.price || "a confirmar"}</strong>. MudaLogic se compromete a
          transportar los bienes con la debida diligencia y cuidado. El cliente declara que la información del
          inventario es correcta al momento de la firma.
        </p>
        {contract.notes && (
          <p className="mt-2">
            <strong>Notas adicionales:</strong> {contract.notes}
          </p>
        )}
      </div>

      <div className="mt-5">
        <Field label="Firma como (nombre completo)" icon={<User size={14} />}>
          <input className="pinput" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </Field>
      </div>

      <label className="mt-4 flex items-start gap-2 text-sm text-neutral-600 cursor-pointer">
        <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-1" />
        He revisado el inventario y acepto los términos de este contrato de servicio con MudaLogic.
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

/* ---------------- Step 4: firma staff ---------------- */

function StepFirmaStaff({
  token,
  contract,
  onSigned,
}: {
  token: string;
  contract: Contract;
  onSigned: (c: Contract) => void;
}) {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [staffName, setStaffName] = useState("");
  const [signature, setSignature] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);

  async function verify() {
    setError("");
    setChecking(true);
    const res = await fetch(`/api/public/contracts/${token}/verify-staff`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setChecking(false);
    if (!res.ok) {
      setError("Clave incorrecta. Pide la clave de acceso al equipo de MudaLogic.");
      return;
    }
    setUnlocked(true);
  }

  async function handleSign() {
    setError("");
    if (!staffName.trim()) {
      setError("Escribe el nombre de quien recoge la mudanza");
      return;
    }
    if (!signature) {
      setError("Firma en el recuadro antes de continuar");
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/public/contracts/${token}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ staff_signature: signature, staff_signed_name: staffName }),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "No se pudo registrar la firma");
      return;
    }
    onSigned({ ...contract, staff_signature: signature, staff_signed_name: staffName });
  }

  return (
    <Card>
      <h1 className="text-xl font-extrabold text-navy flex items-center gap-2">
        <Truck size={20} className="text-brand" /> Firma de quien recoge la mudanza
      </h1>
      <p className="text-sm text-neutral-500 mt-1">
        ¡Gracias {contract.client_signed_name || contract.client_name}! Tu firma quedó registrada. Este paso lo
        completa el transportista de MudaLogic al momento de recoger la mudanza.
      </p>

      {!unlocked ? (
        <div className="mt-6">
          <Field label="Clave de acceso del equipo MudaLogic" icon={<Lock size={14} />}>
            <input
              type="password"
              className="pinput"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Solo para personal de MudaLogic"
            />
          </Field>
          {error && <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>}
          <button onClick={verify} disabled={checking} className="btn-primary mt-4 w-full disabled:opacity-60">
            {checking ? "Verificando..." : "Desbloquear firma"}
          </button>
        </div>
      ) : (
        <div className="mt-6">
          <Field label="Nombre de quien recoge" icon={<User size={14} />}>
            <input className="pinput" value={staffName} onChange={(e) => setStaffName(e.target.value)} />
          </Field>
          <div className="mt-4">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide flex items-center gap-1.5">
              <PenLine size={14} /> Firma del transportista
            </span>
            <div className="mt-1.5">
              <SignaturePad onChange={setSignature} />
            </div>
          </div>
          {error && <p className="mt-3 text-sm text-red-600 font-medium">{error}</p>}
          <button onClick={handleSign} disabled={saving} className="btn-primary mt-5 w-full disabled:opacity-60">
            {saving ? "Guardando..." : "Confirmar recogida y firmar"}
          </button>
        </div>
      )}
    </Card>
  );
}

/* ---------------- Step 5: completado ---------------- */

function StepCompletado({
  token,
  contract,
  inventory,
}: {
  token: string;
  contract: Contract;
  inventory: InventoryItem[];
}) {
  return (
    <Card>
      <div className="text-center py-4">
        <CheckCircle2 className="mx-auto text-emerald-500" size={52} />
        <h1 className="mt-4 text-xl font-extrabold text-navy">¡Contrato firmado con éxito!</h1>
        <p className="mt-2 text-sm text-neutral-500 max-w-sm mx-auto">
          Tu mudanza quedó registrada con {inventory.length} artículo{inventory.length !== 1 && "s"} en el
          inventario. Guarda tu código de rastreo para seguir el estado de tu mudanza.
        </p>
        <div className="mt-5 inline-flex items-center gap-2 bg-neutral-100 rounded-full px-5 py-2.5">
          <MapPinned size={16} className="text-brand" />
          <code className="font-bold text-navy">{token}</code>
        </div>
        <div className="mt-6">
          <Link href={`/rastreo/${token}`} className="btn-primary">
            Rastrear mi mudanza <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      <div className="mt-6 border-t border-neutral-100 pt-5 grid grid-cols-2 gap-4">
        <SignaturePreview label="Firma del cliente" src={contract.client_signature} name={contract.client_signed_name} />
        <SignaturePreview label="Firma del transportista" src={contract.staff_signature} name={contract.staff_signed_name} />
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
