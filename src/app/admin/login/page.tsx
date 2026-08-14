"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Truck, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo iniciar sesión");
        setLoading(false);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(77,141,255,0.25),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(17,87,224,0.25),transparent_45%)]" />
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
          <Truck size={28} />
        </div>
        <h1 className="mt-5 text-xl font-extrabold text-navy text-center">
          Panel administrativo MudaLogic
        </h1>
        <p className="mt-1 text-sm text-neutral-500 text-center">
          Ingresa tu contraseña para continuar
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <label className="block relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              autoFocus
              className="w-full pl-10 pr-10 py-3 rounded-xl border-1.5 border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand text-sm"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </label>

          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        <a href="/" className="block text-center mt-6 text-xs text-neutral-400 hover:text-brand">
          ← Volver a la página principal
        </a>
      </div>
    </div>
  );
}
