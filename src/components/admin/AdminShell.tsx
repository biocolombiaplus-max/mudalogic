"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Image as ImageIcon,
  FileSignature,
  Settings,
  LogOut,
  Menu,
  X,
  Truck,
  ExternalLink,
  Megaphone,
} from "lucide-react";

const nav = [
  { href: "/admin", label: "Panel", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Cotizaciones", icon: Users },
  { href: "/admin/remarketing", label: "Remarketing", icon: Megaphone },
  { href: "/admin/contracts", label: "Contratos y mudanzas", icon: FileSignature },
  { href: "/admin/content", label: "Contenido del sitio", icon: ImageIcon },
  { href: "/admin/settings", label: "Configuración", icon: Settings },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-neutral-50 lg:flex">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-navy text-white flex flex-col transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2 font-extrabold">
            <Truck size={20} className="text-brand-light" />
            MUDA<span className="text-brand-light">LOGIC</span>
          </div>
          <button className="lg:hidden text-white/70" onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {nav.map((item) => {
            const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active ? "bg-brand text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
          >
            <ExternalLink size={18} />
            Ver sitio
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-red-500/20 hover:text-red-300"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <div className="flex-1 lg:ml-64">
        <div className="sticky top-0 z-20 bg-white border-b border-black/5 px-4 py-3 flex items-center gap-3 lg:hidden">
          <button onClick={() => setOpen(true)} className="p-2 -ml-2">
            <Menu size={22} />
          </button>
          <span className="font-bold text-navy">Panel administrativo</span>
        </div>
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">{children}</div>
      </div>
    </div>
  );
}
