import { notFound } from "next/navigation";
import db from "@/lib/db";
import type { Quote, QuoteItem } from "@/lib/types";
import QuoteDetail from "@/components/admin/QuoteDetail";

export const dynamic = "force-dynamic";

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quote = await db.prepare("SELECT * FROM quotes WHERE id = ?").get<Quote>(id);
  if (!quote) notFound();

  const items = await db.prepare("SELECT * FROM quote_items WHERE quote_id = ? ORDER BY created_at ASC").all<QuoteItem>(id);

  return <QuoteDetail quote={quote} items={items} />;
}
