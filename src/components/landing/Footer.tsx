import Image from "next/image";
import { Phone, Mail, MapPin, MessageCircle, Lock } from "lucide-react";

type Props = {
  logo: string;
  phoneDisplay: string;
  email: string;
  addressCucuta: string;
  addressMedellin: string;
  whatsappHref: string;
};

export default function Footer({
  logo,
  phoneDisplay,
  email,
  addressCucuta,
  addressMedellin,
  whatsappHref,
}: Props) {
  return (
    <footer id="contacto" className="bg-navy text-white pt-20 pb-8">
      <div className="container-page grid md:grid-cols-4 gap-10">
        <div>
          {logo ? (
            <Image src={logo} alt="MudaLogic" width={150} height={42} unoptimized className="h-9 w-auto object-contain" />
          ) : (
            <span className="text-2xl font-extrabold">
              MUDA<span className="text-brand-light">LOGIC</span>
            </span>
          )}
          <p className="mt-4 text-sm text-white/60 leading-relaxed">
            Especialistas en mudanzas y trasteos nacionales en Colombia. Empacamos,
            transportamos y desempacamos con seriedad, calidad y oportunidad.
          </p>
        </div>

        <div>
          <h4 className="font-bold mb-4 text-sm uppercase tracking-wide text-white/70">
            Contacto
          </h4>
          <ul className="space-y-3 text-sm text-white/70">
            <li className="flex items-start gap-2">
              <Phone size={16} className="mt-0.5 text-brand-light shrink-0" />
              <a href={`tel:+57${phoneDisplay.replace(/\s|-/g, "")}`}>{phoneDisplay}</a>
            </li>
            <li className="flex items-start gap-2">
              <Mail size={16} className="mt-0.5 text-brand-light shrink-0" />
              <a href={`mailto:${email}`}>{email}</a>
            </li>
            <li className="flex items-start gap-2">
              <MessageCircle size={16} className="mt-0.5 text-brand-light shrink-0" />
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                Escríbenos por WhatsApp
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4 text-sm uppercase tracking-wide text-white/70">
            Nuestras sedes
          </h4>
          <ul className="space-y-3 text-sm text-white/70">
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 text-brand-light shrink-0" />
              <span>
                <strong className="text-white">Cúcuta:</strong> {addressCucuta}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 text-brand-light shrink-0" />
              <span>
                <strong className="text-white">Medellín:</strong> {addressMedellin}
              </span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4 text-sm uppercase tracking-wide text-white/70">
            Cobertura nacional
          </h4>
          <p className="text-sm text-white/70 leading-relaxed">
            Realizamos mudanzas desde Cúcuta y Medellín hacia todas las ciudades y
            municipios de Colombia.
          </p>
        </div>
      </div>

      <div className="container-page mt-14 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
        <p>© {new Date().getFullYear()} MudaLogic. Todos los derechos reservados.</p>
        <a href="/admin/login" className="flex items-center gap-1.5 hover:text-white/80">
          <Lock size={12} /> Acceso administrativo
        </a>
      </div>
    </footer>
  );
}
