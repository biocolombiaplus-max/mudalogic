import Image from "next/image";
import { MapPin, Navigation, Phone, Building2 } from "lucide-react";
import { SectionHeading } from "./Services";

type Props = {
  addressCucuta: string;
  addressMedellin: string;
  cucutaImage: string;
  medellinImage: string;
  phoneDisplay: string;
};

function mapEmbedSrc(address: string) {
  return `https://www.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed`;
}

function directionsHref(address: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

export default function Location({
  addressCucuta,
  addressMedellin,
  cucutaImage,
  medellinImage,
  phoneDisplay,
}: Props) {
  return (
    <section id="ubicacion" className="py-14 sm:py-20 lg:py-24 bg-neutral-50">
      <div className="container-page">
        <SectionHeading
          eyebrow="Nuestras sedes"
          title="Encuéntranos en Cúcuta y Medellín"
          subtitle="Visítanos o llega directo desde el mapa — atendemos en persona y coordinamos tu mudanza hacia todo el país."
        />

        <div className="mt-14 grid lg:grid-cols-2 gap-8">
          <LocationCard
            city="Cúcuta"
            address={addressCucuta}
            image={cucutaImage}
            phoneDisplay={phoneDisplay}
          />
          <LocationCard
            city="Medellín"
            address={addressMedellin}
            image={medellinImage}
            phoneDisplay={phoneDisplay}
          />
        </div>
      </div>
    </section>
  );
}

function LocationCard({
  city,
  address,
  image,
  phoneDisplay,
}: {
  city: string;
  address: string;
  image: string;
  phoneDisplay: string;
}) {
  return (
    <div className="rounded-2xl bg-white border border-black/5 shadow-[0_4px_28px_rgba(10,17,40,0.08)] overflow-hidden">
      <div className="relative aspect-[16/9]">
        {image ? (
          <Image src={image} alt={`Sede MudaLogic ${city}`} fill unoptimized className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-navy to-brand-dark flex items-center justify-center">
            <Building2 className="text-white/20" size={48} strokeWidth={1.3} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-3.5 py-1.5 text-white font-bold text-sm">
            <MapPin size={15} className="text-brand-light" /> Sede {city}
          </span>
        </div>
      </div>

      <div className="p-5 bg-neutral-50 border-y border-black/5">
        <div className="relative aspect-[16/10] rounded-xl overflow-hidden border border-black/10 shadow-inner">
          <iframe
            src={mapEmbedSrc(address)}
            className="absolute inset-0 w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Mapa sede MudaLogic ${city}`}
          />
        </div>
      </div>

      <div className="p-6">
        <p className="text-sm text-neutral-600 flex items-start gap-2">
          <MapPin size={16} className="text-brand shrink-0 mt-0.5" />
          {address}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={directionsHref(address)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-brand rounded-full px-4 py-2.5 hover:bg-brand-dark active:scale-95 transition-all"
          >
            <Navigation size={15} /> Cómo llegar
          </a>
          <a
            href={`tel:+57${phoneDisplay.replace(/\s|-/g, "")}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy bg-neutral-100 rounded-full px-4 py-2.5 hover:bg-neutral-200 active:scale-95 transition-all"
          >
            <Phone size={15} /> Llamar
          </a>
        </div>
      </div>
    </div>
  );
}
