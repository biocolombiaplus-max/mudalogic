"use client";

import { use } from "react";
import TrackingView from "@/components/public/TrackingView";

export default function TrackingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  return <TrackingView token={token.toUpperCase()} />;
}
