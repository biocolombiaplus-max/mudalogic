import { MessageCircle, ClipboardList, PackageOpen, Truck, Home } from "lucide-react";
import { SectionHeading } from "./Services";

const steps = [
  {
    icon: MessageCircle,
    title: "Cotiza en minutos",
    desc: "Cuéntanos desde dónde y hacia dónde te mudas. Te respondemos por WhatsApp con tu cotización.",
  },
  {
    icon: ClipboardList,
    title: "Agendamos y firmamos",
    desc: "Coordinamos la fecha y firmamos tu contrato digital con inventario fotográfico, todo desde el celular.",
  },
  {
    icon: PackageOpen,
    title: "Empacamos desde cero",
    desc: "Llevamos el material de embalaje y empacamos cada objeto con cuidado, ese es nuestro plus.",
  },
  {
    icon: Truck,
    title: "Transportamos y rastreas",
    desc: "Tu mudanza viaja segura y puedes seguir el estado del envío en tiempo real desde la web.",
  },
  {
    icon: Home,
    title: "Entregamos y desempacamos",
    desc: "Llegamos a tu nuevo hogar u oficina y dejamos todo desempacado y en su lugar.",
  },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="py-14 sm:py-20 lg:py-24 bg-neutral-50">
      <div className="container-page">
        <SectionHeading
          eyebrow="Cómo funciona"
          title="Tu mudanza, en 5 pasos simples"
          subtitle="Un proceso claro y transparente de principio a fin."
        />

        <div className="mt-16 grid md:grid-cols-5 gap-6 relative">
          <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-brand/10 via-brand/40 to-brand/10" />
          {steps.map((s, i) => (
            <div key={i} className="relative flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-navy text-white flex items-center justify-center shadow-lg shadow-brand/20 relative z-10">
                <s.icon size={26} />
              </div>
              <span className="mt-4 text-xs font-bold text-brand">PASO {i + 1}</span>
              <h3 className="mt-1 font-bold text-navy">{s.title}</h3>
              <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
