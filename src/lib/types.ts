export type Lead = {
  id: string;
  name: string;
  phone: string;
  origin: string;
  destination: string;
  moving_size: string;
  items: string;
  moving_date: string;
  message: string;
  status: string;
  created_at: string;
};

export type Contract = {
  id: string;
  token: string;
  status: string;
  client_name: string;
  client_doc: string;
  client_phone: string;
  client_email: string;
  origin_address: string;
  destination_address: string;
  moving_date: string;
  service_type: string;
  price: string;
  notes: string;
  client_signature: string | null;
  client_signed_at: string | null;
  client_signed_name: string | null;
  staff_signature: string | null;
  staff_signed_at: string | null;
  staff_signed_name: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type InventoryItem = {
  id: string;
  contract_id: string;
  name: string;
  category: string;
  quantity: number;
  condition: string;
  photo: string | null;
  created_at: string;
};

export type TrackingEvent = {
  id: string;
  contract_id: string;
  status: string;
  note: string;
  location: string;
  created_at: string;
};

export const TRACKING_STATUSES = [
  { value: "contrato_generado", label: "Contrato generado" },
  { value: "recogido", label: "Mudanza recogida" },
  { value: "en_bodega", label: "En bodega / centro de acopio" },
  { value: "en_ruta", label: "En ruta hacia destino" },
  { value: "en_ciudad_destino", label: "Llegó a la ciudad destino" },
  { value: "en_reparto", label: "En reparto final" },
  { value: "entregado", label: "Entregado" },
] as const;

export const CONTRACT_STATUSES = [
  { value: "borrador", label: "Borrador", color: "bg-neutral-100 text-neutral-600" },
  { value: "enviado", label: "Enviado al cliente", color: "bg-blue-100 text-blue-700" },
  { value: "firmado", label: "Firmado", color: "bg-purple-100 text-purple-700" },
  { value: "recogido", label: "Recogido", color: "bg-amber-100 text-amber-700" },
  { value: "en_transito", label: "En tránsito", color: "bg-cyan-100 text-cyan-700" },
  { value: "entregado", label: "Entregado", color: "bg-emerald-100 text-emerald-700" },
] as const;
