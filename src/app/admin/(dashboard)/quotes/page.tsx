import db from "@/lib/db";
import type { Quote } from "@/lib/types";
import QuotesTable from "@/components/admin/QuotesTable";

export const dynamic = "force-dynamic";

export default async function QuotesPage() {
  const quotes = await db.prepare("SELECT * FROM quotes ORDER BY created_at DESC").all<Quote>();

  return (
    <div>
      <div>
        <h1 className="text-2xl font-extrabold text-navy">Cotizaciones</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Cotizaciones detalladas que los clientes diligencian ellos mismos, con inventario incluido. Ponles precio y
          envía la cotización formal por WhatsApp.
        </p>
      </div>

      <div className="mt-6">
        <QuotesTable initialQuotes={quotes} />
      </div>
    </div>
  );
}
