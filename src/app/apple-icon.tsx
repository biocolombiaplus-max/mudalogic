import { renderAppIcon } from "@/lib/app-icon";

export const runtime = "nodejs";
export const revalidate = 3600;
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  return renderAppIcon(180);
}
