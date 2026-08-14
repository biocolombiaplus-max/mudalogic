import Image from "next/image";
import { MapPin, Navigation, Phone } from "lucide-react";
import { SectionHeading } from "./Services";

type Props = {
  addressCucuta: string;
  addressMedellin: string;
  cucutaImage: string;
  medellinImage: string;
  phoneDisplay: string;
};

function mapEmbedSrc(address: string) {
  return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
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
    <section id="ubicacion" className="py-24 bg-neutral-50">
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
    <div className="rounded-2xl bg-white border border-black/5 shadow-[0_2px_20px_rgba(10,17,40,0.06)] overflow-hidden">
      {image && (
        <div className="relative aspect-[16/7]">
          <Image src={image} alt={`Sede MudaLogic ${city}`} fill unoptimized className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
          <span className="absolute bottom-3 left-4 text-white font-bold text-lg flex items-center gap-1.5">
            <MapPin size={18} className="text-brand-light" /> Sede {city}
          </span>
        </div>
      )}

      <div className="relative aspect-[16/9]">
        <iframe
          src={mapEmbedSrc(address)}
          className="absolute inset-0 w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Mapa sede MudaLogic ${city}`}
        />
      </div>

      <div className="p-6">
        {!image && (
          <h3 className="font-bold text-navy text-lg flex items-center gap-1.5 mb-2">
            <MapPin size={18} className="text-brand" /> Sede {city}
          </h3>
        )}
        <p className="text-sm text-neutral-600">{address}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={directionsHref(address)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-brand rounded-full px-4 py-2.5 hover:bg-brand-dark transition-colors"
          >
            <Navigation size={15} /> Cómo llegar
          </a>
          <a
            href={`tel:+57${phoneDisplay.replace(/\s|-/g, "")}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy bg-neutral-100 rounded-full px-4 py-2.5 hover:bg-neutral-200 transition-colors"
          >
            <Phone size={15} /> Llamar
          </a>
        </div>
      </div>
    </div>
  );
}
