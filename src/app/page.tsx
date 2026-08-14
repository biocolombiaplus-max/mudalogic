import { getSiteContent } from "@/lib/settings";
import LandingClient from "@/components/landing/LandingClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await getSiteContent();
  return <LandingClient content={content} />;
}
