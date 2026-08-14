"use client";

import { useState } from "react";
import { KeyRound, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
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
    <div>
      <h1 className="text-2xl font-extrabold text-navy">Configuración</h1>
      <p className="text-sm text-neutral-500 mt-1">Cambia la contraseña de acceso al panel administrativo.</p>

      <div className="mt-6 bg-white rounded-2xl border border-black/5 shadow-sm p-6 max-w-md">
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
    </div>
  );
}
