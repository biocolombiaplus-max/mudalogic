import { ShieldCheck } from "lucide-react";
import { ICON_MAP } from "@/lib/icon-map";
import HalloweenDecor from "./HalloweenDecor";

type Badge = { icon: string; title: string; desc: string };

export default function TrustBadges({ badges }: { badges: Badge[] }) {
  if (!badges || badges.length === 0) return null;

  return (
    <section className="relative py-14 bg-white border-b border-black/5 overflow-hidden">
      <HalloweenDecor
        items={[
          { emoji: "🦇", className: "top-[4%] right-2 sm:right-10 text-3xl opacity-55 animate-spooky-sway", style: { animationDuration: "4s" } },
          { emoji: "🎃", className: "top-[32%] left-1 sm:left-[6%] text-3xl opacity-45 animate-spooky-bob", style: { animationDuration: "5s", animationDelay: "0.6s" } },
          { emoji: "🕷️", className: "top-[60%] right-1 sm:right-[8%] text-2xl sm:text-3xl opacity-50 animate-spooky-sway", style: { animationDuration: "3.6s", animationDelay: "1.1s" } },
          { emoji: "👻", className: "top-[85%] left-2 sm:left-16 text-3xl opacity-45 animate-spooky-bob", style: { animationDuration: "4.6s", animationDelay: "0.3s" } },
        ]}
      />
      <div className="container-page relative z-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {badges.map((b, i) => {
            const Icon = ICON_MAP[b.icon] ?? ShieldCheck;
            return (
              <div key={i} className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                  <Icon size={20} />
                </div>
                <div>
                  <p className="font-bold text-navy text-sm leading-snug">{b.title}</p>
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
