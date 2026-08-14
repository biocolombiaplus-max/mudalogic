import Link from "next/link";
import db from "@/lib/db";
import { Users, FileSignature, Truck, PackageCheck, Plus, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const [totalLeadsRow, newLeadsRow, totalContractsRow, activeContractsRow, recentLeads] = await Promise.all([
    db.prepare("SELECT COUNT(*)::int c FROM leads").get<{ c: number }>(),
    db.prepare("SELECT COUNT(*)::int c FROM leads WHERE status = 'nuevo' OR status IS NULL").get<{ c: number }>(),
    db.prepare("SELECT COUNT(*)::int c FROM contracts").get<{ c: number }>(),
    db
      .prepare("SELECT COUNT(*)::int c FROM contracts WHERE status IN ('en_transito','recogido','en_ruta')")
      .get<{ c: number }>(),
    db.prepare("SELECT * FROM leads ORDER BY created_at DESC LIMIT 5").all<Record<string, string>>(),
  ]);

  const totalLeads = totalLeadsRow?.c ?? 0;
  const newLeads = newLeadsRow?.c ?? 0;
  const totalContracts = totalContractsRow?.c ?? 0;
  const activeContracts = activeContractsRow?.c ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Panel administrativo</h1>
          <p className="text-sm text-neutral-500 mt-1">Resumen general de MudaLogic</p>
        </div>
        <Link href="/admin/contracts/new" className="btn-primary !py-2.5 !px-5 text-sm">
          <Plus size={16} /> Nuevo contrato
        </Link>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Cotizaciones totales" value={totalLeads} color="bg-blue-500" />
        <StatCard icon={Users} label="Cotizaciones nuevas" value={newLeads} color="bg-amber-500" />
        <StatCard icon={FileSignature} label="Contratos generados" value={totalContracts} color="bg-purple-500" />
        <StatCard icon={Truck} label="Mudanzas en curso" value={activeContracts} color="bg-emerald-500" />
      </div>

      <div className="mt-8 bg-white rounded-2xl border border-black/5 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5">
          <h2 className="font-bold text-navy">Últimas cotizaciones</h2>
          <Link href="/admin/leads" className="text-sm text-brand font-semibold flex items-center gap-1">
            Ver todas <ArrowRight size={14} />
          </Link>
        </div>
        {recentLeads.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-neutral-400">
            Aún no hay cotizaciones registradas.
          </p>
        ) : (
          <div className="divide-y divide-black/5">
            {recentLeads.map((l) => (
              <div key={l.id} className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-semibold text-navy text-sm">{l.name || "Sin nombre"}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {l.origin} → {l.destination} · {l.phone}
                  </p>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-brand/10 text-brand">
                  {l.moving_size}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 grid sm:grid-cols-2 gap-4">
        <Link
          href="/admin/contracts/new"
          className="rounded-2xl border border-black/5 bg-white p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
            <FileSignature size={22} />
          </div>
          <div>
            <p className="font-bold text-navy">Generar contrato de servicio</p>
            <p className="text-xs text-neutral-500 mt-0.5">
              Crea el contrato y envía el link al cliente por WhatsApp o correo.
            </p>
          </div>
        </Link>
        <Link
          href="/admin/content"
          className="rounded-2xl border border-black/5 bg-white p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
            <PackageCheck size={22} />
          </div>
          <div>
            <p className="font-bold text-navy">Actualizar imágenes del sitio</p>
            <p className="text-xs text-neutral-500 mt-0.5">
              Cambia fotos, logo, testimonios y textos de la landing en segundos.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-2xl bg-white border border-black/5 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl ${color} text-white flex items-center justify-center shrink-0`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-navy leading-none">{value}</p>
        <p className="text-xs text-neutral-500 mt-1">{label}</p>
      </div>
    </div>
  );
}
