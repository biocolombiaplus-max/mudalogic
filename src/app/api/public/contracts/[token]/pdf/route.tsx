import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import db from "@/lib/db";
import { getSetting } from "@/lib/settings";
import { ContractDocument } from "@/lib/pdf/ContractDocument";
import type { Contract, ContractAddendum, ContractPhoto, InventoryItem } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const contract = await db.prepare("SELECT * FROM contracts WHERE token = ?").get<Contract>(token.toUpperCase());
  if (!contract) {
    return NextResponse.json({ error: "Contrato no encontrado" }, { status: 404 });
  }

  const [inventory, photos, addenda, logo, phone, email, addressCucuta] = await Promise.all([
    db.prepare("SELECT * FROM inventory_items WHERE contract_id = ? ORDER BY created_at ASC").all<InventoryItem>(contract.id),
    db.prepare("SELECT * FROM contract_photos WHERE contract_id = ? ORDER BY created_at ASC").all<ContractPhoto>(contract.id),
    db.prepare("SELECT * FROM contract_addenda WHERE contract_id = ? ORDER BY created_at ASC").all<ContractAddendum>(contract.id),
    getSetting("site.logo", ""),
    getSetting("site.phone_display", ""),
    getSetting("site.email", ""),
    getSetting("site.address_cucuta", ""),
  ]);

  const buffer = await renderToBuffer(
    <ContractDocument
      contract={contract}
      inventory={inventory}
      photos={photos}
      addenda={addenda}
      logoUrl={logo}
      companyPhone={phone}
      companyEmail={email}
      companyAddress={addressCucuta}
    />
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="orden-servicio-${contract.token}.pdf"`,
    },
  });
}
