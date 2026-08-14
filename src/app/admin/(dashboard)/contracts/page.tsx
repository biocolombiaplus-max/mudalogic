import Link from "next/link";
import db from "@/lib/db";
import type { Contract } from "@/lib/types";
import ContractsTable from "@/components/admin/ContractsTable";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default function ContractsPage() {
  const contracts = db.prepare("SELECT * FROM contracts ORDER BY created_at DESC").all() as Contract[];

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Contratos y mudanzas</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Genera contratos, comparte el link con el cliente y sigue el estado de cada mudanza.
          </p>
        </div>
        <Link href="/admin/contracts/new" className="btn-primary !py-2.5 !px-5 text-sm">
          <Plus size={16} /> Nuevo contrato
        </Link>
      </div>

      <div className="mt-6">
        <ContractsTable initialContracts={contracts} />
      </div>
    </div>
  );
}
