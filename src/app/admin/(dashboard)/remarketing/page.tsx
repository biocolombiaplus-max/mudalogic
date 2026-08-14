import RemarketingView from "@/components/admin/RemarketingView";

export const dynamic = "force-dynamic";

export default function RemarketingPage() {
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-navy">Remarketing</h1>
      <p className="text-sm text-neutral-500 mt-1">
        Cotizaciones que aún no se han cerrado. El sistema marca cuáles ya llevan 8 o 15 días sin
        respuesta para que las retomes por WhatsApp — el mensaje queda listo, tú solo confirmas el envío.
      </p>
      <div className="mt-6">
        <RemarketingView />
      </div>
    </div>
  );
}
