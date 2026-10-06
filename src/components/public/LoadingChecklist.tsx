"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Truck,
  Loader2,
  AlertTriangle,
  Lock,
  IdCard,
  Plus,
  PenLine,
  CheckCircle2,
  ClipboardCheck,
  Camera,
} from "lucide-react";
import SignaturePad from "@/components/SignaturePad";
import type { Contract, ContractPhoto, InventoryItem } from "@/lib/types";

const CATEGORIES = ["Sala", "Habitación", "Cocina", "Electrodomésticos", "Oficina", "Cajas", "Frágil / especial", "Otro"];

export default function LoadingChecklist({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [contract, setContract] = useState<Contract | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [photos, setPhotos] = useState<ContractPhoto[]>([]);

  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [checking, setChecking] = useState(false);
  const [authError, setAuthError] = useState("");

  const load = async () => {
    setLoading(true);
    const res = await fetch(`/api/public/contracts/${token}`);
    if (!res.ok) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setContract(data.contract);
    setItems(data.inventory || []);
    setPhotos(data.photos || []);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount, matches ContractFlow's pattern
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function verify() {
    setAuthError("");
    setChecking(true);
    const res = await fetch(`/api/public/contracts/${token}/verify-staff`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setChecking(false);
    if (!res.ok) {
      setAuthError("Clave incorrecta. Pide la clave de acceso al equipo de MudaLogic.");
      return;
    }
    setUnlocked(true);
  }

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

  if (notFound || !contract) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center px-6">
          <AlertTriangle className="text-amber-500" size={40} />
          <h1 className="text-lg font-bold text-navy">No encontramos esta orden de cargue</h1>
          <p className="text-sm text-neutral-500 max-w-sm">Verifica el link que te compartió MudaLogic.</p>
        </div>
      </Shell>
    );
  }

  if (contract.driver_signature) {
    return (
      <Shell>
        <Card>
          <div className="text-center py-6">
            <CheckCircle2 className="mx-auto text-emerald-500" size={48} />
            <h1 className="mt-4 text-xl font-extrabold text-navy">Cargue ya confirmado</h1>
            <p className="mt-2 text-sm text-neutral-500">
              {contract.driver_signed_name} ya firmó la constancia de cargue de esta mudanza.
            </p>
          </div>
        </Card>
      </Shell>
    );
  }

  if (!unlocked) {
    return (
      <Shell>
        <Card>
          <h1 className="text-xl font-extrabold text-navy flex items-center gap-2">
            <ClipboardCheck size={20} className="text-brand" /> Checklist de cargue
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Mudanza de {contract.client_name} · Código {contract.token}
          </p>
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
            {authError && <p className="mt-2 text-sm text-red-600 font-medium">{authError}</p>}
            <button onClick={verify} disabled={checking} className="btn-primary mt-4 w-full disabled:opacity-60">
              {checking ? "Verificando..." : "Desbloquear checklist"}
            </button>
          </div>
        </Card>
      </Shell>
    );
  }

  return (
    <Shell>
      <ChecklistBody token={token} contract={contract} items={items} setItems={setItems} photos={photos} />
    </Shell>
  );
}

function ChecklistBody({
  token,
  contract,
  items,
  setItems,
  photos,
}: {
  token: string;
  contract: Contract;
  items: InventoryItem[];
  setItems: (items: InventoryItem[]) => void;
  photos: ContractPhoto[];
}) {
  const [driverName, setDriverName] = useState(contract.driver_name || "");
  const [signature, setSignature] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [error, setError] = useState("");

  const [newItem, setNewItem] = useState({ name: "", category: CATEGORIES[0], quantity: 1 });
  const [addingExtra, setAddingExtra] = useState(false);

  const original = items.filter((i) => !i.is_additional);
  const extras = items.filter((i) => i.is_additional);
  const loadedCount = items.filter((i) => i.loaded).length;

  async function toggleLoaded(item: InventoryItem) {
    const next = !item.loaded;
    setItems(items.map((i) => (i.id === item.id ? { ...i, loaded: next } : i)));
    await fetch(`/api/public/contracts/${token}/inventory/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loaded: next }),
    });
  }

  async function saveNote(item: InventoryItem, note: string) {
    setItems(items.map((i) => (i.id === item.id ? { ...i, driver_note: note } : i)));
    await fetch(`/api/public/contracts/${token}/inventory/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ driver_note: note }),
    });
  }

  async function addExtraItem() {
    if (!newItem.name.trim()) return;
    setAddingExtra(true);
    const res = await fetch(`/api/public/contracts/${token}/inventory`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newItem, is_additional: true }),
    });
    const data = await res.json();
    setAddingExtra(false);
    if (res.ok) {
      setItems([
        ...items,
        {
          id: data.id,
          contract_id: contract.id,
          name: newItem.name,
          category: newItem.category,
          quantity: newItem.quantity,
          condition: "",
          photo: null,
          loaded: true,
          is_additional: true,
          driver_note: null,
          created_at: new Date().toISOString(),
        },
      ]);
      setNewItem({ name: "", category: CATEGORIES[0], quantity: 1 });
    }
  }

  async function handleSign() {
    setError("");
    if (!driverName.trim()) {
      setError("Escribe tu nombre completo");
      return;
    }
    if (!signature) {
      setError("Firma en el recuadro antes de continuar");
      return;
    }
    setSigning(true);
    const res = await fetch(`/api/public/contracts/${token}/driver-sign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signature, name: driverName }),
    });
    setSigning(false);
    if (!res.ok) {
      setError("No se pudo registrar la firma");
      return;
    }
    setSigned(true);
  }

  if (signed) {
    return (
      <Card>
        <div className="text-center py-6">
          <CheckCircle2 className="mx-auto text-emerald-500" size={48} />
          <h1 className="mt-4 text-xl font-extrabold text-navy">¡Cargue confirmado!</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Quedó registrado {loadedCount} de {original.length} artículos del inventario original
            {extras.length > 0 && ` y ${extras.length} adicional${extras.length !== 1 ? "es" : ""}`}. Buen viaje.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h1 className="text-xl font-extrabold text-navy flex items-center gap-2">
        <ClipboardCheck size={20} className="text-brand" /> Checklist de cargue
      </h1>
      <p className="text-sm text-neutral-500 mt-1">
        {contract.client_name} · {contract.origin_address || "origen"} → {contract.destination_address || "destino"}
      </p>

      <div className="mt-5 rounded-xl bg-neutral-50 border border-neutral-100 p-4">
        <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide flex items-center gap-1.5 mb-2">
          <IdCard size={14} /> Tus datos registrados por MudaLogic
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-neutral-700">
          <p><span className="text-neutral-400">Conductor:</span> {contract.driver_name || "—"}</p>
          <p><span className="text-neutral-400">Placa:</span> {contract.vehicle_plate || "—"}</p>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-2">
          Inventario del contrato — marca lo que vas cargando ({loadedCount}/{original.length})
        </p>
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {original.map((item) => (
            <div key={item.id} className="rounded-xl border border-neutral-200 px-3 py-2.5">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={!!item.loaded} onChange={() => toggleLoaded(item)} className="w-4 h-4 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${item.loaded ? "text-emerald-600" : "text-navy"}`}>
                    {item.name} <span className="text-neutral-400 font-normal">x{item.quantity}</span>
                  </p>
                  <p className="text-xs text-neutral-500">{item.category}</p>
                </div>
              </label>
              <input
                defaultValue={item.driver_note || ""}
                onBlur={(e) => {
                  if (e.target.value !== (item.driver_note || "")) saveNote(item, e.target.value);
                }}
                placeholder="Nota (ej: no estaba / dañado / no cabe)"
                className="mt-2 w-full text-xs border border-neutral-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-brand"
              />
            </div>
          ))}
          {original.length === 0 && <p className="text-sm text-neutral-400">Este contrato no tiene inventario registrado.</p>}
        </div>
      </div>

      {extras.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-2">Artículos adicionales agregados</p>
          <div className="space-y-1.5">
            {extras.map((item) => (
              <div key={item.id} className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <span className="text-[9px] font-bold text-white bg-amber-500 px-1.5 py-0.5 rounded-full shrink-0">ADICIONAL</span>
                <p className="text-sm font-semibold text-navy truncate">
                  {item.name} <span className="text-neutral-400 font-normal">x{item.quantity}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 rounded-xl border-2 border-dashed border-amber-300 p-4">
        <p className="text-xs font-bold text-navy uppercase tracking-wide mb-2">
          ¿Encontraste algo que no estaba en el inventario?
        </p>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <input
            value={newItem.name}
            onChange={(e) => setNewItem((v) => ({ ...v, name: e.target.value }))}
            placeholder="Ej: Lavadora, mesa extra..."
            className="pinput"
          />
          <input
            type="number"
            min={1}
            value={newItem.quantity}
            onChange={(e) => setNewItem((v) => ({ ...v, quantity: Math.max(1, Number(e.target.value) || 1) }))}
            className="pinput !w-16"
          />
        </div>
        <button
          onClick={addExtraItem}
          disabled={addingExtra}
          className="mt-2 flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100 rounded-lg px-3 py-2 hover:bg-amber-200 disabled:opacity-60"
        >
          <Plus size={14} /> Marcar como adicional (genera cobro extra)
        </button>
      </div>

      {photos.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Camera size={14} /> Fotos de los espacios ya tomadas por el cliente
          </p>
          <div className="grid grid-cols-4 gap-2">
            {photos.map((p) => (
              <div key={p.id} className="relative aspect-square rounded-lg overflow-hidden border border-neutral-200">
                <Image src={p.url} alt={p.caption || "foto"} fill unoptimized className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 pt-5 border-t border-neutral-100">
        <Field label="Confirma tu nombre">
          <input className="pinput" value={driverName} onChange={(e) => setDriverName(e.target.value)} />
        </Field>
        <div className="mt-4">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide flex items-center gap-1.5">
            <PenLine size={14} /> Firma del conductor
          </span>
          <div className="mt-1.5">
            <SignaturePad onChange={setSignature} />
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-red-600 font-medium">{error}</p>}
        <button onClick={handleSign} disabled={signing} className="btn-primary mt-4 w-full disabled:opacity-60">
          {signing ? "Guardando..." : "Confirmar cargue y firmar"}
        </button>
      </div>
    </Card>
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
          <span className="text-white/50 text-xs ml-2 hidden sm:inline">· Checklist de cargue</span>
        </div>
      </div>
      <div className="container-page py-8 max-w-2xl">{children}</div>
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
