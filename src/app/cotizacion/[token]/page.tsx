"use client";

import { use } from "react";
import QuoteFlow from "@/components/public/QuoteFlow";

export default function QuotePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  return <QuoteFlow token={token.toUpperCase()} />;
}
