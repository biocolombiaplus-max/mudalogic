"use client";

import { use } from "react";
import ContractFlow from "@/components/public/ContractFlow";

export default function ContractPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  return <ContractFlow token={token.toUpperCase()} />;
}
