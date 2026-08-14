import db from "@/lib/db";
import LeadsTable from "@/components/admin/LeadsTable";
import type { Lead } from "@/lib/types";

export const dynamic = "force-dynamic";

export default function LeadsPage() {
  const leads = db.prepare("SELECT * FROM leads ORDER BY created_at DESC").all() as Lead[];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-navy">Cotizaciones y leads</h1>
      <p className="text-sm text-neutral-500 mt-1">
        Todos los datos que dejan los visitantes al cotizar, incluso si no completaron el
        contacto por WhatsApp — úsalos para hacer seguimiento y remarketing.
      </p>
      <div className="mt-6">
        <LeadsTable initialLeads={leads} />
      </div>
    </div>
  );
}
