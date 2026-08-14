import { notFound } from "next/navigation";
import db from "@/lib/db";
import type { Contract, InventoryItem, TrackingEvent } from "@/lib/types";
import ContractDetail from "@/components/admin/ContractDetail";

export const dynamic = "force-dynamic";

export default async function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contract = db.prepare("SELECT * FROM contracts WHERE id = ?").get(id) as Contract | undefined;
  if (!contract) notFound();

  const inventory = db
    .prepare("SELECT * FROM inventory_items WHERE contract_id = ? ORDER BY created_at ASC")
    .all(id) as InventoryItem[];
  const tracking = db
    .prepare("SELECT * FROM tracking_events WHERE contract_id = ? ORDER BY created_at DESC")
    .all(id) as TrackingEvent[];

  return <ContractDetail contract={contract} inventory={inventory} tracking={tracking} />;
}
