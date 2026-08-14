import { notFound } from "next/navigation";
import db from "@/lib/db";
import type { Contract, InventoryItem, TrackingEvent } from "@/lib/types";
import ContractDetail from "@/components/admin/ContractDetail";

export const dynamic = "force-dynamic";

export default async function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contract = await db.prepare("SELECT * FROM contracts WHERE id = ?").get<Contract>(id);
  if (!contract) notFound();

  const [inventory, tracking] = await Promise.all([
    db.prepare("SELECT * FROM inventory_items WHERE contract_id = ? ORDER BY created_at ASC").all<InventoryItem>(id),
    db.prepare("SELECT * FROM tracking_events WHERE contract_id = ? ORDER BY created_at DESC").all<TrackingEvent>(id),
  ]);

  return <ContractDetail contract={contract} inventory={inventory} tracking={tracking} />;
}
