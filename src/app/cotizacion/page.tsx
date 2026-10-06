"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Truck, AlertTriangle } from "lucide-react";

export default function NewQuotePage() {
  const router = useRouter();
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/public/quotes", { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        if (data.token) router.replace(`/cotizacion/${data.token}`);
        else setError(true);
      })
      .catch(() => setError(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="bg-navy rounded-2xl p-4">
        <Truck className="text-brand-light" size={28} />
      </div>
      {error ? (
        <>
          <AlertTriangle className="text-amber-500 mt-2" size={32} />
          <p className="text-sm text-neutral-500">No pudimos iniciar tu cotización. Intenta de nuevo o escríbenos por WhatsApp.</p>
        </>
      ) : (
        <>
          <Loader2 className="animate-spin text-brand mt-2" size={28} />
          <p className="text-sm text-neutral-500">Preparando tu cotización...</p>
        </>
      )}
    </div>
  );
}
