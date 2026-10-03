"use client";

import { useEffect, useState } from "react";
import { KeyRound, CheckCircle2, MessageSquareText, Info, BarChart3, Star } from "lucide-react";

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-navy">Configuración</h1>
      <p className="text-sm text-neutral-500 mt-1">
        Contraseña de acceso, plantillas de mensajes de remarketing e integraciones.
      </p>

      <div className="mt-6 grid lg:grid-cols-2 gap-6 items-start">
        <PasswordCard />
        <TemplatesCard />
        <PixelCard />
        <ReviewLinkCard />
      </div>
    </div>
  );
}

function PasswordCard() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (next !== confirm) {
      setError("Las contraseñas nuevas no coinciden");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/admin/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current, next }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "No se pudo cambiar la contraseña");
      return;
    }
    setSuccess(true);
    setCurrent("");
    setNext("");
    setConfirm("");
  }

  return (
    <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6">
      <div className="flex items-center gap-2 text-brand mb-4">
        <KeyRound size={20} />
        <h2 className="font-bold text-navy">Cambiar contraseña</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Contraseña actual</span>
          <input
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className="mt-1.5 w-full border-1.5 border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Nueva contraseña</span>
          <input
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            className="mt-1.5 w-full border-1.5 border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Confirmar nueva contraseña</span>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-1.5 w-full border-1.5 border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </label>

        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
        {success && (
          <p className="text-sm text-emerald-600 font-medium flex items-center gap-1.5">
            <CheckCircle2 size={16} /> Contraseña actualizada correctamente
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-primary !py-2.5 text-sm w-full disabled:opacity-60">
          {loading ? "Guardando..." : "Guardar nueva contraseña"}
        </button>
      </form>
    </div>
  );
}

const TEMPLATE_FIELDS: { key: string; label: string; help: string }[] = [
  {
    key: "remarketing.msg_general",
    label: "Mensaje de contacto general",
    help: "Se usa cuando contactas una cotización manualmente, sin importar los días transcurridos.",
  },
  {
    key: "remarketing.msg_8",
    label: "Recordatorio de 8 días",
    help: "Sugerido cuando pasan 8 días desde que la persona dejó sus datos y no ha cerrado.",
  },
  {
    key: "remarketing.msg_15",
    label: "Recordatorio de 15 días",
    help: "Sugerido cuando pasan 15 días sin cerrar el negocio.",
  },
];

function TemplatesCard() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        const settings = data.settings || {};
        const next: Record<string, string> = {};
        for (const f of TEMPLATE_FIELDS) next[f.key] = settings[f.key] || "";
        setValues(next);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Error del servidor (${res.status})`);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6">
      <div className="flex items-center gap-2 text-brand mb-2">
        <MessageSquareText size={20} />
        <h2 className="font-bold text-navy">Plantillas de mensajes de WhatsApp</h2>
      </div>
      <p className="text-xs text-neutral-500 mb-4 flex items-start gap-1.5">
        <Info size={14} className="shrink-0 mt-0.5" />
        Usa <code className="bg-neutral-100 px-1 rounded">{"{nombre}"}</code>,{" "}
        <code className="bg-neutral-100 px-1 rounded">{"{origen}"}</code> y{" "}
        <code className="bg-neutral-100 px-1 rounded">{"{destino}"}</code> — se reemplazan automáticamente por
        los datos de cada cliente.
      </p>

      {loading ? (
        <p className="text-sm text-neutral-400">Cargando...</p>
      ) : (
        <div className="space-y-4">
          {TEMPLATE_FIELDS.map((f) => (
            <label key={f.key} className="block">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">{f.label}</span>
              <p className="text-[11px] text-neutral-400 mb-1.5">{f.help}</p>
              <textarea
                value={values[f.key] || ""}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                rows={3}
                className="w-full border-1.5 border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand resize-none"
              />
            </label>
          ))}

          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

          <button onClick={handleSave} disabled={saving} className="btn-primary !py-2.5 text-sm w-full disabled:opacity-60">
            {saved ? <CheckCircle2 size={16} /> : null}
            {saving ? "Guardando..." : saved ? "Guardado" : "Guardar plantillas"}
          </button>
        </div>
      )}
    </div>
  );
}

function PixelCard() {
  const [pixelId, setPixelId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => setPixelId(data.settings?.["pixel.meta_id"] || ""))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "pixel.meta_id": pixelId.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Error del servidor (${res.status})`);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6">
      <div className="flex items-center gap-2 text-brand mb-2">
        <BarChart3 size={20} />
        <h2 className="font-bold text-navy">Meta Pixel (Facebook / Instagram Ads)</h2>
      </div>
      <p className="text-xs text-neutral-500 mb-4 flex items-start gap-1.5">
        <Info size={14} className="shrink-0 mt-0.5" />
        Pega aquí el ID del pixel que crees en Meta Events Manager. Se activa solo en la página pública y
        registra automáticamente <code className="bg-neutral-100 px-1 rounded">PageView</code>, un{" "}
        <code className="bg-neutral-100 px-1 rounded">Contact</code> al tocar cualquier botón de WhatsApp, y un{" "}
        <code className="bg-neutral-100 px-1 rounded">Lead</code> al enviar el formulario de cotización.
      </p>

      {loading ? (
        <p className="text-sm text-neutral-400">Cargando...</p>
      ) : (
        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">ID del Pixel</span>
            <input
              value={pixelId}
              onChange={(e) => setPixelId(e.target.value)}
              placeholder="Ej: 1234567890123456"
              inputMode="numeric"
              className="mt-1.5 w-full border-1.5 border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </label>

          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

          <button onClick={handleSave} disabled={saving} className="btn-primary !py-2.5 text-sm w-full disabled:opacity-60">
            {saved ? <CheckCircle2 size={16} /> : null}
            {saving ? "Guardando..." : saved ? "Guardado" : "Guardar pixel"}
          </button>
        </div>
      )}
    </div>
  );
}

function ReviewLinkCard() {
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => setLink(data.settings?.["reviews.instagram_link"] || ""))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "reviews.instagram_link": link.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Error del servidor (${res.status})`);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6">
      <div className="flex items-center gap-2 text-brand mb-2">
        <Star size={20} />
        <h2 className="font-bold text-navy">Link de reseñas (Instagram)</h2>
      </div>
      <p className="text-xs text-neutral-500 mb-4 flex items-start gap-1.5">
        <Info size={14} className="shrink-0 mt-0.5" />
        El link de tu publicación de Instagram para pedir reseñas. Desde el detalle de cada contrato hay un botón
        que arma y envía por WhatsApp el mensaje con este link.
      </p>

      {loading ? (
        <p className="text-sm text-neutral-400">Cargando...</p>
      ) : (
        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">URL de la publicación</span>
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://www.instagram.com/p/..."
              className="mt-1.5 w-full border-1.5 border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </label>

          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

          <button onClick={handleSave} disabled={saving} className="btn-primary !py-2.5 text-sm w-full disabled:opacity-60">
            {saved ? <CheckCircle2 size={16} /> : null}
            {saving ? "Guardando..." : saved ? "Guardado" : "Guardar link"}
          </button>
        </div>
      )}
    </div>
  );
}
