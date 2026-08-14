import { ShieldCheck } from "lucide-react";
import { ICON_MAP } from "@/lib/icon-map";

type Badge = { icon: string; title: string; desc: string };

export default function TrustBadges({ badges }: { badges: Badge[] }) {
  if (!badges || badges.length === 0) return null;

  return (
    <section className="py-14 bg-white border-b border-black/5">
      <div className="container-page">
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
