import Image from "next/image";
import { SectionHeading } from "./Services";
import { ImageIcon } from "lucide-react";

type Img = { src: string; caption: string };

export default function Gallery({ images }: { images: Img[] }) {
  const items = images.filter((i) => i.src);
  if (items.length === 0) return null;

  return (
    <section id="galeria" className="py-14 sm:py-20 lg:py-24 bg-white">
      <div className="container-page">
        <SectionHeading
          eyebrow="Galería"
          title="Así cuidamos cada mudanza"
          subtitle="Nuestro equipo en acción: empaque, cargue y entrega."
        />

        <div className="mt-14 grid grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((img, i) => (
            <div
              key={i}
              className={`relative rounded-2xl overflow-hidden group ${
                i === 0 ? "col-span-2 row-span-2 aspect-square md:aspect-auto" : "aspect-square"
              }`}
            >
              <Image
                src={img.src}
                alt={img.caption || "MudaLogic"}
                fill
                unoptimized
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              {img.caption && (
                <p className="absolute bottom-3 left-4 right-4 text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                  <ImageIcon size={14} /> {img.caption}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
