"use client";

import { use } from "react";
import LoadingChecklist from "@/components/public/LoadingChecklist";

export default function LoadingChecklistPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  return <LoadingChecklist token={token.toUpperCase()} />;
}
