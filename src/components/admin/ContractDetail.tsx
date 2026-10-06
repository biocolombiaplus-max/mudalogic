"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Copy,
  MessageCircle,
  Mail,
  Check,
  Save,
  MapPin,
  PenLine,
  Package,
  Truck,
  Plus,
  Trash2,
  FileDown,
  Star,
  Camera,
  BadgeCheck,
  ClipboardCheck,
  Receipt,
} from "lucide-react";
import type { Contract, ContractAddendum, ContractPhoto, InventoryItem, TrackingEvent } from "@/lib/types";
import { CONTRACT_STATUSES, TRACKING_STATUSES, LEGAL_REPRESENTATIVE } from "@/lib/types";
import { splitAdvanceBalance } from "@/lib/money";
import SignaturePad from "@/components/SignaturePad";

function statusMeta(status: string) {
  return CONTRACT_STATUSES.find((s) => s.value === status) ?? CONTRACT_STATUSES[0];
}

export default function ContractDetail({
  contract,
  inventory,
  tracking,
  photos,
  addenda,
}: {
  contract: Contract;
  inventory: InventoryItem[];
  tracking: TrackingEvent[];
  photos: ContractPhoto[];
  addenda: ContractAddendum[];
}) {
  const [form, setForm] = useState({
    client_name: contract.client_name || "",
    client_doc: contract.client_doc || "",
    client_phone: contract.client_phone || "",
    client_email: contract.client_email || "",
    origin_address: contract.origin_address || "",
    destination_address: contract.destination_address || "",
    moving_date: contract.moving_date || "",
    service_type: contract.service_type || "",
    price: contract.price || "",
    notes: contract.notes || "",
    status: contract.status,
    driver_name: contract.driver_name || "",
    driver_doc: contract.driver_doc || "",
    driver_phone: contract.driver_phone || "",
    vehicle_plate: contract.vehicle_plate || "",
    freight_value: contract.freight_value || "",
    advance_value: contract.advance_value || "",
    balance_due: contract.balance_due || "",
    policy_number: contract.policy_number || "",
    insurance_company: contract.insurance_company || "",
    insured_amount: contract.insured_amount || "",
    insurance_value: contract.insurance_value || "",
    advance_received: contract.advance_received || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [signing, setSigning] = useState(false);
  const [showSignPad, setShowSignPad] = useState(false);
  const [repSignature, setRepSignature] = useState<string | null>(null);
  const [signError, setSignError] = useState("");
  const [staffSignature, setStaffSignature] = useState(contract.staff_signature);
  const [staffSignedAt, setStaffSignedAt] = useState(contract.staff_signed_at);
  const [addendaList, setAddendaList] = useState(addenda);
  const [newAddendum, setNewAddendum] = useState({ description: "", amount: "" });
  const [addingAddendum, setAddingAddendum] = useState(false);
  const [events, setEvents] = useState(tracking);
  const [newEvent, setNewEvent] = useState<{ status: string; note: string; location: string }>({
    status: TRACKING_STATUSES[1].value,
    note: "",
    location: "",
  });
  const [addingEvent, setAddingEvent] = useState(false);

  const [reviewLink, setReviewLink] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => setReviewLink(data.settings?.["reviews.instagram_link"] || ""));
  }, []);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const contractUrl = `${origin}/contrato/${contract.token}`;
  const trackUrl = `${origin}/rastreo/${contract.token}`;
  const pdfUrl = `${origin}/api/public/contracts/${contract.token}/pdf`;

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function updateFreight(value: string) {
    const { advance, balance } = splitAdvanceBalance(value);
    setForm((f) => ({ ...f, freight_value: value, advance_value: advance, balance_due: balance }));
  }

  async function handleSignRepresentative() {
    setSignError("");
    if (!repSignature) {
      setSignError("Firma en el recuadro antes de continuar");
      return;
    }
    setSigning(true);
    const res = await fetch(`/api/admin/contracts/${contract.id}/sign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signature: repSignature }),
    });
    setSigning(false);
    if (!res.ok) {
      setSignError("No se pudo registrar la firma");
      return;
    }
    setStaffSignature(repSignature);
    setStaffSignedAt(new Date().toISOString());
    setShowSignPad(false);
    update("status", "firmado");
  }

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/admin/contracts/${contract.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(contractUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function whatsappShare() {
    const msg = `Hola ${contract.client_name || ""}, este es el link de tu contrato de mudanza con MudaLogic. Complétalo y fírmalo desde tu celular: ${contractUrl}\n\nCon este código puedes rastrear tu mudanza cuando quieras: ${contract.token}\n${trackUrl}`;
    const phone = (contract.client_phone || "").replace(/\D/g, "");
    window.open(`https://wa.me/${phone.startsWith("57") ? phone : "57" + phone}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  function emailShare() {
    const subject = "Tu contrato de mudanza MudaLogic";
    const body = `Hola ${contract.client_name || ""},\n\nEste es el link para completar y firmar tu contrato de mudanza:\n${contractUrl}\n\nCódigo de rastreo: ${contract.token}\n${trackUrl}\n\nGracias por confiar en MudaLogic.`;
    window.open(`mailto:${contract.client_email || ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_blank");
  }

  function sendChecklistToDriver() {
    const checklistUrl = `${origin}/carga/${contract.token}`;
    const msg = `Hola ${contract.driver_name || ""}, aquí está el checklist de cargue de la mudanza de ${contract.client_name || "el cliente"} (código ${contract.token}). Revisa el inventario, marca lo que vas cargando y firma al terminar: ${checklistUrl}`;
    const phone = (contract.driver_phone || "").replace(/\D/g, "");
    window.open(`https://wa.me/${phone.startsWith("57") ? phone : "57" + phone}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  function reviewShare() {
    const link = reviewLink || "https://instagram.com/mudalogic.co";
    const msg = `¡Hola ${contract.client_name || ""}! 🙌 Gracias por confiar en MudaLogic para tu mudanza. Si quedaste contento con el servicio, nos ayudarías muchísimo dejando una reseña aquí: ${link}`;
    const phone = (contract.client_phone || "").replace(/\D/g, "");
    window.open(`https://wa.me/${phone.startsWith("57") ? phone : "57" + phone}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  async function addEvent() {
    setAddingEvent(true);
    const res = await fetch(`/api/admin/contracts/${contract.id}/tracking`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEvent),
    });
    const data = await res.json();
    setAddingEvent(false);
    if (res.ok) {
      setEvents([
        {
          id: data.id,
          contract_id: contract.id,
          status: newEvent.status,
          note: newEvent.note,
          location: newEvent.location,
          created_at: new Date().toISOString(),
        },
        ...events,
      ]);
      setNewEvent({ status: TRACKING_STATUSES[1].value, note: "", location: "" });
    }
  }

  async function removeEvent(eventId: string) {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    await fetch(`/api/admin/contracts/${contract.id}/tracking?eventId=${eventId}`, { method: "DELETE" });
  }

  async function addAddendum() {
    if (!newAddendum.description.trim()) return;
    setAddingAddendum(true);
    const res = await fetch(`/api/admin/contracts/${contract.id}/addenda`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAddendum),
    });
    const data = await res.json();
    setAddingAddendum(false);
    if (res.ok) {
      setAddendaList([
        ...addendaList,
        { id: data.id, contract_id: contract.id, description: newAddendum.description, amount: newAddendum.amount, created_at: new Date().toISOString() },
      ]);
      setNewAddendum({ description: "", amount: "" });
    }
  }

  async function removeAddendum(addendumId: string) {
    setAddendaList((prev) => prev.filter((a) => a.id !== addendumId));
    await fetch(`/api/admin/contracts/${contract.id}/addenda/${addendumId}`, { method: "DELETE" });
  }

  const meta = statusMeta(form.status);
  const additionalItems = inventory.filter((i) => i.is_additional);

  return (
    <div className="max-w-4xl">
      <Link href="/admin/contracts" className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-brand mb-4">
        <ArrowLeft size={16} /> Volver a contratos
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-extrabold text-navy">{contract.client_name || "Cliente sin nombre"}</h1>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${meta.color}`}>{meta.label}</span>
          </div>
          <p className="text-sm text-neutral-500 mt-1 flex items-center gap-1.5">
            Código: <code className="font-bold bg-neutral-100 px-2 py-0.5 rounded">{contract.token}</code>
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={copyLink} className="p-2.5 rounded-xl bg-neutral-100 text-neutral-600 hover:bg-neutral-200" title="Copiar link">
            {copied ? <Check size={18} className="text-emerald-600" /> : <Copy size={18} />}
          </button>
          <button onClick={whatsappShare} className="p-2.5 rounded-xl bg-green-50 text-green-600 hover:bg-green-100" title="Enviar por WhatsApp">
            <MessageCircle size={18} />
          </button>
          <button onClick={emailShare} className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100" title="Enviar por correo">
            <Mail size={18} />
          </button>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-navy/5 text-navy hover:bg-navy/10"
            title="Descargar orden de servicio en PDF"
          >
            <FileDown size={18} />
          </a>
          <button
            onClick={reviewShare}
            className="p-2.5 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100"
            title="Pedir reseña en Instagram por WhatsApp"
          >
            <Star size={18} />
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Datos del contrato">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Nombre del cliente">
              <input value={form.client_name} onChange={(e) => update("client_name", e.target.value)} className="input" />
            </Field>
            <Field label="Documento">
              <input value={form.client_doc} onChange={(e) => update("client_doc", e.target.value)} className="input" />
            </Field>
            <Field label="Teléfono">
              <input value={form.client_phone} onChange={(e) => update("client_phone", e.target.value)} className="input" />
            </Field>
            <Field label="Correo">
              <input value={form.client_email} onChange={(e) => update("client_email", e.target.value)} className="input" />
            </Field>
            <Field label="Origen">
              <input value={form.origin_address} onChange={(e) => update("origin_address", e.target.value)} className="input" />
            </Field>
            <Field label="Destino">
              <input value={form.destination_address} onChange={(e) => update("destination_address", e.target.value)} className="input" />
            </Field>
            <Field label="Fecha mudanza">
              <input type="date" value={form.moving_date} onChange={(e) => update("moving_date", e.target.value)} className="input" />
            </Field>
            <Field label="Precio (COP)">
              <input value={form.price} onChange={(e) => update("price", e.target.value)} className="input" />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Tipo de servicio">
              <input value={form.service_type} onChange={(e) => update("service_type", e.target.value)} className="input" />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Notas">
              <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={2} className="input resize-none" />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Estado del contrato">
              <select value={form.status} onChange={(e) => update("status", e.target.value)} className="input">
                {CONTRACT_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary !py-2.5 text-sm mt-5 disabled:opacity-60">
            {saved ? <Check size={16} /> : <Save size={16} />}
            {saving ? "Guardando..." : saved ? "Guardado" : "Guardar cambios"}
          </button>
        </Card>

        <Card title="Datos del conductor">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Nombre del conductor">
              <input value={form.driver_name} onChange={(e) => update("driver_name", e.target.value)} className="input" />
            </Field>
            <Field label="Cédula del conductor">
              <input value={form.driver_doc} onChange={(e) => update("driver_doc", e.target.value)} className="input" />
            </Field>
            <Field label="Teléfono del conductor">
              <input value={form.driver_phone} onChange={(e) => update("driver_phone", e.target.value)} className="input" />
            </Field>
            <Field label="Placa del vehículo">
              <input value={form.vehicle_plate} onChange={(e) => update("vehicle_plate", e.target.value)} className="input" />
            </Field>
          </div>
          {contract.driver_phone && (
            <button
              onClick={sendChecklistToDriver}
              className="mt-4 flex items-center gap-1.5 text-sm font-bold text-emerald-700 bg-emerald-50 rounded-xl px-4 py-2.5 hover:bg-emerald-100"
            >
              <ClipboardCheck size={16} /> Enviar checklist de cargue al conductor
            </button>
          )}
          <p className="text-[11px] text-neutral-400 mt-3">
            El conductor verá estos datos (sin poder editarlos) cuando entre a firmar desde el link del contrato.
          </p>
          <button onClick={handleSave} disabled={saving} className="btn-primary !py-2.5 text-sm mt-4 disabled:opacity-60">
            {saved ? <Check size={16} /> : <Save size={16} />}
            {saving ? "Guardando..." : saved ? "Guardado" : "Guardar cambios"}
          </button>
        </Card>

        <Card title="Valores del servicio y póliza">
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Valor del flete">
              <input value={form.freight_value} onChange={(e) => updateFreight(e.target.value)} className="input" />
            </Field>
            <Field label="Anticipo (70%, automático)">
              <input value={form.advance_value} onChange={(e) => update("advance_value", e.target.value)} className="input" />
            </Field>
            <Field label="Saldo (30%, automático)">
              <input value={form.balance_due} onChange={(e) => update("balance_due", e.target.value)} className="input" />
            </Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <Field label="Número de póliza">
              <input value={form.policy_number} onChange={(e) => update("policy_number", e.target.value)} className="input" />
            </Field>
            <Field label="Aseguradora">
              <input value={form.insurance_company} onChange={(e) => update("insurance_company", e.target.value)} className="input" />
            </Field>
            <Field label="Monto asegurado">
              <input value={form.insured_amount} onChange={(e) => update("insured_amount", e.target.value)} className="input" />
            </Field>
            <Field label="Valor del seguro">
              <input value={form.insurance_value} onChange={(e) => update("insurance_value", e.target.value)} className="input" />
            </Field>
          </div>
          <p className="text-[11px] text-neutral-400 mt-3">
            {contract.has_insurance
              ? "El cliente indicó que SÍ quiere contratar seguro para esta mudanza."
              : "El cliente aún no ha indicado si contrata seguro (lo decide al firmar)."}{" "}
            Valor declarado de los bienes: <b>{contract.declared_value || "sin registrar"}</b>.
          </p>
          <button onClick={handleSave} disabled={saving} className="btn-primary !py-2.5 text-sm mt-4 disabled:opacity-60">
            {saved ? <Check size={16} /> : <Save size={16} />}
            {saving ? "Guardando..." : saved ? "Guardado" : "Guardar cambios"}
          </button>
        </Card>

        <Card title="Anticipo y firma del representante legal" icon={BadgeCheck}>
          {!contract.client_signature ? (
            <p className="text-sm text-neutral-400">El cliente todavía no ha firmado su contrato.</p>
          ) : (
            <>
              <Field label="Anticipo recibido (valor confirmado)">
                <input
                  value={form.advance_received}
                  onChange={(e) => update("advance_received", e.target.value)}
                  placeholder="Ej: 980.000"
                  className="input"
                />
              </Field>
              <button onClick={handleSave} disabled={saving} className="btn-outline !text-navy !border-neutral-300 !py-2 text-xs mt-2.5">
                {saved ? <Check size={14} /> : <Save size={14} />} Guardar anticipo
              </button>

              <div className="mt-4 pt-4 border-t border-neutral-100">
                <p className="text-xs text-neutral-500 mb-2">
                  El contrato se firma siempre como <b>{LEGAL_REPRESENTATIVE.name}</b>, NIT{" "}
                  {LEGAL_REPRESENTATIVE.nit}.
                </p>
                {staffSignature ? (
                  <p className="text-sm text-emerald-600 font-semibold flex items-center gap-1.5">
                    <Check size={16} /> Firmado
                    {staffSignedAt && ` · ${new Date(staffSignedAt).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" })}`}
                  </p>
                ) : !form.advance_received ? (
                  <p className="text-xs text-amber-600 font-medium">
                    Registra el anticipo recibido antes de firmar, para que el contrato quede con validez.
                  </p>
                ) : !showSignPad ? (
                  <button onClick={() => setShowSignPad(true)} className="btn-primary !py-2.5 text-sm w-full">
                    <PenLine size={16} /> Firmar como representante legal
                  </button>
                ) : (
                  <div>
                    <SignaturePad onChange={setRepSignature} height={160} />
                    {signError && <p className="text-xs text-red-600 font-medium mt-2">{signError}</p>}
                    <button
                      onClick={handleSignRepresentative}
                      disabled={signing}
                      className="btn-primary !py-2.5 text-sm w-full mt-2 disabled:opacity-60"
                    >
                      {signing ? "Guardando..." : "Confirmar firma"}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </Card>

        <div className="space-y-6">
          <Card title="Firmas">
            <div className="grid grid-cols-2 gap-4">
              <SignatureBox label="Firma del cliente" signature={contract.client_signature} name={contract.client_signed_name} date={contract.client_signed_at} />
              <SignatureBox label="Representante legal" signature={staffSignature} name={staffSignature ? LEGAL_REPRESENTATIVE.name : null} date={staffSignedAt} />
            </div>
            {(contract.driver_signature || contract.driver_name) && (
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <SignatureBox
                  label="Firma del conductor (al cargue)"
                  signature={contract.driver_signature}
                  name={contract.driver_signed_name}
                  date={contract.driver_signed_at}
                />
              </div>
            )}
          </Card>

          <Card title={`Inventario (${inventory.length} artículos)`} icon={Package}>
            {inventory.length === 0 ? (
              <p className="text-sm text-neutral-400">El cliente aún no ha registrado el inventario.</p>
            ) : (
              <div className="grid grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
                {inventory.map((item) => (
                  <div key={item.id} className="rounded-lg border border-neutral-200 overflow-hidden relative">
                    {item.is_additional && (
                      <span className="absolute top-1 left-1 z-10 bg-amber-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                        ADICIONAL
                      </span>
                    )}
                    {item.loaded && (
                      <span className="absolute top-1 right-1 z-10 bg-emerald-500 text-white rounded-full p-0.5">
                        <Check size={10} />
                      </span>
                    )}
                    <div className="relative aspect-square bg-neutral-100">
                      {item.photo ? (
                        <Image src={item.photo} alt={item.name} fill unoptimized className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-neutral-300">
                          <Package size={20} />
                        </div>
                      )}
                    </div>
                    <div className="p-1.5">
                      <p className="text-[11px] font-semibold text-navy truncate">{item.name}</p>
                      <p className="text-[10px] text-neutral-500">
                        {item.category} · x{item.quantity}
                      </p>
                      {item.driver_note && <p className="text-[10px] text-amber-600 mt-0.5">{item.driver_note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title={`Fotos de la carga (${photos.length})`} icon={Camera}>
            {photos.length === 0 ? (
              <p className="text-sm text-neutral-400">El conductor aún no ha subido fotos de la carga.</p>
            ) : (
              <div className="grid grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
                {photos.map((p) => (
                  <div key={p.id} className="relative aspect-square rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100">
                    <Image src={p.url} alt="Foto de carga" fill unoptimized className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="Ajustes adicionales (cobros extra)" icon={Receipt}>
            {additionalItems.length > 0 && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
                El conductor marcó {additionalItems.length} artículo{additionalItems.length !== 1 && "s"} adicional
                {additionalItems.length !== 1 && "es"} que no estaba{additionalItems.length === 1 ? "" : "n"} en el
                inventario original: {additionalItems.map((i) => i.name).join(", ")}. Agrega aquí el cobro
                correspondiente.
              </p>
            )}
            {addendaList.length > 0 && (
              <div className="space-y-2 mb-3">
                {addendaList.map((a) => (
                  <div key={a.id} className="flex items-center justify-between gap-2 bg-neutral-50 rounded-lg px-3 py-2">
                    <div>
                      <p className="text-sm font-semibold text-navy">{a.description}</p>
                      {a.amount && <p className="text-xs text-neutral-500">{a.amount}</p>}
                    </div>
                    <button onClick={() => removeAddendum(a.id)} className="text-neutral-300 hover:text-red-500 shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="grid grid-cols-[1fr_auto_auto] gap-2">
              <input
                value={newAddendum.description}
                onChange={(e) => setNewAddendum((v) => ({ ...v, description: e.target.value }))}
                placeholder="Ej: Lavadora adicional no incluida en el contrato"
                className="input"
              />
              <input
                value={newAddendum.amount}
                onChange={(e) => setNewAddendum((v) => ({ ...v, amount: e.target.value }))}
                placeholder="Valor"
                className="input !w-28"
              />
              <button onClick={addAddendum} disabled={addingAddendum} className="btn-primary !py-2 text-xs disabled:opacity-60">
                <Plus size={14} />
              </button>
            </div>
            <p className="text-[11px] text-neutral-400 mt-2">
              Cada ajuste se agrega al PDF del contrato como un otrosí. Avísale al cliente el valor por WhatsApp antes
              de sumarlo.
            </p>
          </Card>
        </div>
      </div>

      <Card title="Rastreo de la mudanza" icon={Truck} className="mt-6">
        <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end mb-5">
          <Field label="Nuevo estado">
            <select value={newEvent.status} onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value })} className="input">
              {TRACKING_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Ubicación / nota">
            <input
              value={newEvent.location}
              onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              placeholder="Ej: Terminal de Bucaramanga"
              className="input"
            />
          </Field>
          <button onClick={addEvent} disabled={addingEvent} className="btn-primary !py-2.5 text-sm disabled:opacity-60">
            <Plus size={16} /> Agregar
          </button>
        </div>

        <div className="space-y-3">
          {events.length === 0 && <p className="text-sm text-neutral-400">Sin eventos de rastreo aún.</p>}
          {events.map((ev) => {
            const st = TRACKING_STATUSES.find((s) => s.value === ev.status);
            return (
              <div key={ev.id} className="flex items-start justify-between gap-3 rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin size={15} />
                  </div>
                  <div>
                    <p className="font-semibold text-navy text-sm">{st?.label ?? ev.status}</p>
                    {ev.location && <p className="text-xs text-neutral-600">{ev.location}</p>}
                    {ev.note && <p className="text-xs text-neutral-500">{ev.note}</p>}
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {new Date(ev.created_at).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>
                </div>
                <button onClick={() => removeEvent(ev.id)} className="text-neutral-300 hover:text-red-500 shrink-0">
                  <Trash2 size={15} />
                </button>
              </div>
            );
          })}
        </div>
      </Card>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1.5px solid #e5e7eb;
          border-radius: 0.7rem;
          padding: 0.55rem 0.8rem;
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

function Card({
  title,
  icon: Icon = PenLine,
  children,
  className = "",
}: {
  title: string;
  icon?: typeof PenLine;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-2xl border border-black/5 shadow-sm p-6 ${className}`}>
      <h2 className="font-bold text-navy mb-4 flex items-center gap-2">
        <Icon size={18} className="text-brand" /> {title}
      </h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function SignatureBox({
  label,
  signature,
  name,
  date,
}: {
  label: string;
  signature: string | null;
  name: string | null;
  date: string | null;
}) {
  return (
    <div>
      <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-1.5">{label}</p>
      <div className="relative aspect-[3/2] rounded-lg border border-neutral-200 bg-neutral-50 overflow-hidden">
        {signature ? (
          <Image src={signature} alt={label} fill unoptimized className="object-contain p-2" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-neutral-300 text-xs">Pendiente</div>
        )}
      </div>
      {signature && (
        <p className="text-[11px] text-neutral-500 mt-1">
          {name} · {date && new Date(date).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" })}
        </p>
      )}
    </div>
  );
}
