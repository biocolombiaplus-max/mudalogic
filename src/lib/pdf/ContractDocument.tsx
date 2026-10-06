import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { LEGAL_REPRESENTATIVE } from "@/lib/types";
import type { Contract, ContractAddendum, ContractPhoto, InventoryItem } from "@/lib/types";

const BRAND = "#1157E0";
const NAVY = "#0A1128";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 9.5, color: NAVY, fontFamily: "Helvetica" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  logo: { width: 46, height: 46, marginRight: 12, objectFit: "contain" },
  companyName: { fontSize: 16, fontFamily: "Helvetica-Bold", color: NAVY },
  companyTagline: { fontSize: 9, color: "#55617A", marginTop: 2 },
  headerRight: { marginLeft: "auto", textAlign: "right" },
  headerRightText: { fontSize: 8, color: "#55617A" },
  titleBar: {
    backgroundColor: NAVY,
    color: "#FFFFFF",
    paddingVertical: 7,
    paddingHorizontal: 10,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleText: { fontSize: 11, fontFamily: "Helvetica-Bold", letterSpacing: 0.5 },
  orderNo: { fontSize: 9 },
  section: { marginBottom: 10 },
  sectionHeader: {
    backgroundColor: BRAND,
    color: "#FFFFFF",
    fontFamily: "Helvetica-Bold",
    fontSize: 9.5,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  table: { borderWidth: 1, borderColor: "#DCE2F0", borderTopWidth: 0 },
  row: { flexDirection: "row", borderTopWidth: 1, borderColor: "#DCE2F0" },
  rowLabel: {
    width: "32%",
    padding: 5,
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    backgroundColor: "#F3F5FB",
    borderRightWidth: 1,
    borderColor: "#DCE2F0",
  },
  rowValue: { width: "68%", padding: 5, fontSize: 8.5 },
  pageTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1.5,
    borderColor: BRAND,
  },
  invRow: { flexDirection: "row", borderTopWidth: 1, borderColor: "#DCE2F0" },
  invHeadRow: { flexDirection: "row", backgroundColor: NAVY },
  invCellNo: { width: "6%", padding: 4, fontSize: 8 },
  invCellName: { width: "32%", padding: 4, fontSize: 8 },
  invCellCat: { width: "18%", padding: 4, fontSize: 8 },
  invCellQty: { width: "8%", padding: 4, fontSize: 8 },
  invCellCond: { width: "18%", padding: 4, fontSize: 8 },
  invCellFlag: { width: "18%", padding: 4, fontSize: 7.5 },
  invHeadCell: { color: "#FFFFFF", fontFamily: "Helvetica-Bold", fontSize: 7.5 },
  flagAdditional: { color: "#B07A16", fontFamily: "Helvetica-Bold" },
  flagLoaded: { color: "#0F8A6E" },
  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  photoBox: { width: "31%", marginBottom: 8 },
  photoImg: { width: "100%", height: 100, objectFit: "cover", borderRadius: 3 },
  photoCaption: { fontSize: 7, color: "#55617A", marginTop: 2, textAlign: "center" },
  clause: { marginBottom: 6 },
  clauseTitle: { fontSize: 8.5, fontFamily: "Helvetica-Bold", marginBottom: 1.5 },
  clauseBody: { fontSize: 8, lineHeight: 1.35, color: "#2A3345" },
  sigRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 18 },
  sigBox: { width: "47%" },
  sigLine: { borderTopWidth: 1, borderColor: NAVY, marginTop: 36, paddingTop: 3 },
  sigImgBox: { height: 50, justifyContent: "flex-end" },
  sigImg: { height: 48, objectFit: "contain" },
  sigLabel: { fontSize: 8, fontFamily: "Helvetica-Bold" },
  sigMeta: { fontSize: 7, color: "#55617A", marginTop: 1 },
  footer: {
    position: "absolute",
    bottom: 18,
    left: 32,
    right: 32,
    fontSize: 7,
    color: "#8792AB",
    textAlign: "center",
    borderTopWidth: 0.5,
    borderColor: "#DCE2F0",
    paddingTop: 5,
  },
});

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value || "—"}</Text>
    </View>
  );
}

function Section({ title, rows }: { title: string; rows: { label: string; value: string }[] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>{title}</Text>
      <View style={styles.table}>
        {rows.map((r) => (
          <Row key={r.label} label={r.label} value={r.value} />
        ))}
      </View>
    </View>
  );
}

function fmt(v: string | null | undefined) {
  return v && v.trim() ? v : "";
}

function fmtDateTime(v: string | null | undefined) {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}

function Footer({ companyAddress, companyPhone, companyEmail }: { companyAddress: string; companyPhone: string; companyEmail: string }) {
  return (
    <Text style={styles.footer}>
      {companyAddress ? `${companyAddress} · ` : ""}
      {companyPhone} · {companyEmail}
    </Text>
  );
}

const CLAUSES: { title: string; body: string }[] = [
  {
    title: "1. Recepción y estado de los bienes",
    body: "El cliente declara que los bienes relacionados en el inventario son entregados en condiciones normales de uso, salvo lo consignado en observaciones. Autoriza el registro fotográfico y/o en video como constancia del estado de los mismos al momento del cargue y descargue, para efectos probatorios.",
  },
  {
    title: "2. Inventario declarado por el cliente",
    body: "El servicio contratado comprende exclusivamente los bienes relacionados en el inventario diligenciado por el cliente. La inclusión posterior de elementos no relacionados generará costos adicionales que deberán ser asumidos por el cliente, según se detalla en los ajustes adicionales de este documento, si los hay.",
  },
  {
    title: "3. Dirección de entrega obligatoria",
    body: "El cliente se obliga a suministrar dirección exacta, clara y completa del lugar de entrega de los bienes. En caso de no hacerlo oportunamente, autoriza expresamente a MudaLogic para custodiar temporalmente los bienes, generándose cobro mensual por concepto de bodegaje hasta su retiro definitivo o entrega final.",
  },
  {
    title: "4. Cobro por almacenamiento o bodegaje",
    body: "Cuando por causas atribuibles al cliente los bienes deban permanecer en custodia de MudaLogic, se causará un valor mensual por almacenamiento desde la fecha de ingreso hasta el retiro definitivo, conforme a lo pactado en la presente orden y según lo permitido por los artículos 1602 y 1603 del Código Civil.",
  },
  {
    title: "5. Seguro de transporte de mercancía",
    body: "El cliente podrá contratar póliza de seguro sobre los bienes transportados, cuyo valor será asumido directamente por éste. En caso de no contratarla, acepta expresamente que la responsabilidad de MudaLogic se limitará hasta el valor del servicio contratado, conforme a los artículos 981, 982 y concordantes del Código de Comercio.",
  },
  {
    title: "6. Elementos frágiles o especiales",
    body: "Electrodomésticos, televisores, pantallas, objetos en vidrio o similares que no cuenten con su empaque original o protección especializada serán transportados bajo responsabilidad del cliente, salvo contratación de empaque técnico adicional o seguro todo riesgo.",
  },
  {
    title: "7. Derecho de retención",
    body: "MudaLogic podrá ejercer derecho de retención sobre los bienes transportados hasta el pago total del servicio contratado, conforme al Código de Comercio y normas concordantes aplicables al contrato de transporte.",
  },
  {
    title: "8. Mora automática en el pago",
    body: "El incumplimiento en el pago del servicio contratado generará mora automática sin necesidad de requerimiento previo, conforme al artículo 1608 del Código Civil.",
  },
  {
    title: "9. Abandono de bienes",
    body: "Si transcurridos sesenta (60) días calendario desde el requerimiento de retiro o entrega el cliente no cancela los valores pendientes ni dispone destino de los bienes, se entenderá configurada situación de abandono, autorizando a MudaLogic a iniciar el trámite legal correspondiente para su disposición conforme a la normatividad vigente.",
  },
  {
    title: "10. Autorización de notificación electrónica",
    body: "El cliente autoriza expresamente que cualquier comunicación relacionada con la ejecución del presente servicio pueda realizarse mediante llamada telefónica, mensajes de texto, WhatsApp o correo electrónico suministrados en este documento, conforme a la Ley 527 de 1999 sobre comercio electrónico y mensajes de datos.",
  },
  {
    title: "11. Validez del contrato y domicilio contractual",
    body: "El presente contrato solo tiene validez una vez se haya girado el anticipo pactado. Para todos los efectos legales derivados de la presente orden de servicio, las partes fijan como domicilio contractual la ciudad de Cúcuta, Norte de Santander.",
  },
  {
    title: "12. Aceptación expresa del servicio",
    body: "El cliente declara haber leído, entendido y aceptado íntegramente las condiciones contenidas en la presente orden de servicio, la cual presta mérito probatorio conforme a los artículos 1602 del Código Civil y 822 del Código de Comercio.",
  },
];

export function ContractDocument({
  contract,
  inventory,
  photos,
  addenda,
  logoUrl,
  companyPhone,
  companyEmail,
  companyAddress,
}: {
  contract: Contract;
  inventory: InventoryItem[];
  photos: ContractPhoto[];
  addenda: ContractAddendum[];
  logoUrl: string;
  companyPhone: string;
  companyEmail: string;
  companyAddress: string;
}) {
  const insuranceLine = contract.has_insurance
    ? "El cliente SÍ contrata póliza de seguro para esta mudanza."
    : "El cliente declara que NO contrata póliza de seguro para esta mudanza.";

  return (
    <Document title={`Orden de servicio MudaLogic - ${contract.token}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {logoUrl ? <Image src={logoUrl} style={styles.logo} /> : null}
          <View>
            <Text style={styles.companyName}>MUDALOGIC</Text>
            <Text style={styles.companyTagline}>Mudanzas sin estrés, solo sonrisas</Text>
          </View>
          <View style={styles.headerRight}>
            {companyPhone ? <Text style={styles.headerRightText}>Tel/WhatsApp: {companyPhone}</Text> : null}
            {companyEmail ? <Text style={styles.headerRightText}>{companyEmail}</Text> : null}
          </View>
        </View>

        <View style={styles.titleBar}>
          <Text style={styles.titleText}>ORDEN DE SERVICIO DE CARGA — MUDANZA</Text>
          <Text style={styles.orderNo}>Orden No. {contract.token}</Text>
        </View>

        <Section
          title="DATOS DEL CLIENTE"
          rows={[
            { label: "Nombre del cliente", value: fmt(contract.client_name) },
            { label: "Documento de identidad", value: fmt(contract.client_doc) },
            { label: "Teléfono", value: fmt(contract.client_phone) },
            { label: "Correo", value: fmt(contract.client_email) },
            { label: "Dirección de cargue", value: fmt(contract.origin_address) },
            { label: "Dirección de descargue", value: fmt(contract.destination_address) },
            { label: "Hora y fecha de recogida", value: fmtDateTime(contract.pickup_datetime) },
            { label: "Hora y fecha de terminación", value: fmtDateTime(contract.completion_datetime) },
          ]}
        />

        <Section
          title="DATOS DEL CONDUCTOR"
          rows={[
            { label: "Nombre del conductor", value: fmt(contract.driver_name) },
            { label: "Cédula del conductor", value: fmt(contract.driver_doc) },
            { label: "Placa del vehículo", value: fmt(contract.vehicle_plate) },
            { label: "Teléfono del conductor", value: fmt(contract.driver_phone) },
          ]}
        />

        <Section
          title="REPRESENTANTE LEGAL — MUDALOGIC"
          rows={[
            { label: "Nombre", value: LEGAL_REPRESENTATIVE.name },
            { label: "NIT", value: LEGAL_REPRESENTATIVE.nit },
          ]}
        />

        <Section
          title="VALORES DEL SERVICIO"
          rows={[
            { label: "Valor del flete", value: fmt(contract.freight_value) || fmt(contract.price) },
            { label: "Valor del anticipo (70%)", value: fmt(contract.advance_value) },
            { label: "Anticipo recibido", value: fmt(contract.advance_received) },
            { label: "Saldo pendiente (30%)", value: fmt(contract.balance_due) },
          ]}
        />

        <Section
          title="VALORES DE LA PÓLIZA"
          rows={[
            { label: "¿Contrata seguro?", value: contract.has_insurance ? "Sí" : "No" },
            { label: "Número de póliza", value: fmt(contract.policy_number) },
            { label: "Aseguradora", value: fmt(contract.insurance_company) },
            { label: "Monto asegurado", value: fmt(contract.insured_amount) },
            { label: "Valor del seguro", value: fmt(contract.insurance_value) },
            { label: "Valor declarado de los bienes", value: fmt(contract.declared_value) },
          ]}
        />

        <Text style={{ fontSize: 7.5, color: "#55617A", marginTop: -4, marginBottom: 10 }}>{insuranceLine}</Text>

        <View style={styles.sigRow}>
          <View style={styles.sigBox}>
            <View style={styles.sigImgBox}>
              {contract.client_signature ? <Image src={contract.client_signature} style={styles.sigImg} /> : null}
            </View>
            <View style={styles.sigLine}>
              <Text style={styles.sigLabel}>Firma del cliente</Text>
              <Text style={styles.sigMeta}>
                {fmt(contract.client_signed_name)} {contract.client_signed_at ? `· ${fmtDateTime(contract.client_signed_at)}` : ""}
              </Text>
            </View>
          </View>
          <View style={styles.sigBox}>
            <View style={styles.sigImgBox}>
              {contract.staff_signature ? <Image src={contract.staff_signature} style={styles.sigImg} /> : null}
            </View>
            <View style={styles.sigLine}>
              <Text style={styles.sigLabel}>Representante legal MudaLogic</Text>
              <Text style={styles.sigMeta}>
                {contract.staff_signature ? LEGAL_REPRESENTATIVE.name : "Pendiente"}{" "}
                {contract.staff_signed_at ? `· ${fmtDateTime(contract.staff_signed_at)}` : ""}
              </Text>
            </View>
          </View>
        </View>

        <Footer companyAddress={companyAddress} companyPhone={companyPhone} companyEmail={companyEmail} />
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.pageTitle}>INVENTARIO DE MUEBLES / ENSERES DE HOGAR O MERCANCÍA</Text>
        <View style={styles.table}>
          <View style={styles.invHeadRow}>
            <Text style={[styles.invCellNo, styles.invHeadCell]}>#</Text>
            <Text style={[styles.invCellName, styles.invHeadCell]}>Artículo</Text>
            <Text style={[styles.invCellCat, styles.invHeadCell]}>Categoría</Text>
            <Text style={[styles.invCellQty, styles.invHeadCell]}>Cant.</Text>
            <Text style={[styles.invCellCond, styles.invHeadCell]}>Estado</Text>
            <Text style={[styles.invCellFlag, styles.invHeadCell]}>Cargue</Text>
          </View>
          {inventory.length === 0 ? (
            <View style={styles.invRow}>
              <Text style={{ padding: 6, fontSize: 8 }}>Sin artículos registrados.</Text>
            </View>
          ) : (
            inventory.map((item, i) => (
              <View style={styles.invRow} key={item.id} wrap={false}>
                <Text style={styles.invCellNo}>{i + 1}</Text>
                <Text style={styles.invCellName}>{item.name}</Text>
                <Text style={styles.invCellCat}>{item.category}</Text>
                <Text style={styles.invCellQty}>{item.quantity}</Text>
                <Text style={styles.invCellCond}>{item.condition}</Text>
                <Text style={[styles.invCellFlag, item.is_additional ? styles.flagAdditional : item.loaded ? styles.flagLoaded : undefined]}>
                  {item.is_additional ? "ADICIONAL" : item.loaded ? "Cargado ✓" : "—"}
                </Text>
              </View>
            ))
          )}
        </View>

        {photos.length > 0 && (
          <View style={{ marginTop: 18 }}>
            <Text style={styles.pageTitle}>EVIDENCIA FOTOGRÁFICA — ESPACIOS Y CARGA</Text>
            <View style={styles.photoGrid}>
              {photos.map((p) => (
                <View style={styles.photoBox} key={p.id}>
                  <Image src={p.url} style={styles.photoImg} />
                  {p.caption ? <Text style={styles.photoCaption}>{p.caption}</Text> : null}
                </View>
              ))}
            </View>
          </View>
        )}

        <Footer companyAddress={companyAddress} companyPhone={companyPhone} companyEmail={companyEmail} />
      </Page>

      {addenda.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.pageTitle}>AJUSTES ADICIONALES (OTROSÍ)</Text>
          <Text style={{ fontSize: 8, marginBottom: 8, color: "#2A3345" }}>
            Los siguientes valores corresponden a elementos o servicios adicionales no contemplados en el inventario
            original, identificados durante el cargue y acordados entre las partes conforme a la cláusula 2 de las
            condiciones contractuales.
          </Text>
          <View style={styles.table}>
            {addenda.map((a) => (
              <Row key={a.id} label={a.description} value={a.amount || "—"} />
            ))}
          </View>
          <Footer companyAddress={companyAddress} companyPhone={companyPhone} companyEmail={companyEmail} />
        </Page>
      )}

      <Page size="A4" style={styles.page}>
        <Text style={styles.pageTitle}>CONDICIONES CONTRACTUALES DEL SERVICIO</Text>
        <Text style={{ fontSize: 8, marginBottom: 8, color: "#2A3345" }}>
          El cliente declara que ha suministrado de manera libre y voluntaria la información contenida en el
          presente documento y acepta las siguientes condiciones contractuales:
        </Text>
        {CLAUSES.map((c) => (
          <View style={styles.clause} key={c.title} wrap={false}>
            <Text style={styles.clauseTitle}>{c.title}</Text>
            <Text style={styles.clauseBody}>{c.body}</Text>
          </View>
        ))}

        <View style={styles.sigRow}>
          <View style={styles.sigBox}>
            <View style={styles.sigLine}>
              <Text style={styles.sigLabel}>Firma del cliente</Text>
              <Text style={styles.sigMeta}>{fmt(contract.client_signed_name)}</Text>
            </View>
          </View>
          <View style={styles.sigBox}>
            <View style={styles.sigLine}>
              <Text style={styles.sigLabel}>Representante legal MudaLogic</Text>
              <Text style={styles.sigMeta}>{LEGAL_REPRESENTATIVE.name} — NIT {LEGAL_REPRESENTATIVE.nit}</Text>
            </View>
          </View>
        </View>

        {contract.driver_signature && (
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", marginBottom: 6 }}>
              Constancia de cargue
            </Text>
            <View style={styles.sigBox}>
              <View style={styles.sigImgBox}>
                <Image src={contract.driver_signature} style={styles.sigImg} />
              </View>
              <View style={styles.sigLine}>
                <Text style={styles.sigLabel}>Firma del conductor (al momento del cargue)</Text>
                <Text style={styles.sigMeta}>
                  {fmt(contract.driver_signed_name)} {contract.driver_signed_at ? `· ${fmtDateTime(contract.driver_signed_at)}` : ""}
                </Text>
              </View>
            </View>
          </View>
        )}

        <Footer companyAddress={companyAddress} companyPhone={companyPhone} companyEmail={companyEmail} />
      </Page>
    </Document>
  );
}
