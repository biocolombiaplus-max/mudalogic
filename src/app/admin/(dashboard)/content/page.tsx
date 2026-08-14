import { getSiteContent } from "@/lib/settings";
import ContentEditor from "@/components/admin/ContentEditor";

export const dynamic = "force-dynamic";

export default function ContentPage() {
  const content = getSiteContent();
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-navy">Contenido del sitio</h1>
      <p className="text-sm text-neutral-500 mt-1">
        Edita textos, imágenes, logo, servicios y testimonios de la landing page. Los cambios
        se publican de inmediato.
      </p>
      <div className="mt-6">
        <ContentEditor initial={content} />
      </div>
    </div>
  );
}
