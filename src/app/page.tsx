import { getSiteContent } from "@/lib/settings";
import LandingClient from "@/components/landing/LandingClient";

export const dynamic = "force-dynamic";

export default function Home() {
  const content = getSiteContent();
  return <LandingClient content={content} />;
}
