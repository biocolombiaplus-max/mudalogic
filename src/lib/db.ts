import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, "mudalogic.db");

declare global {
  // eslint-disable-next-line no-var
  var __mudalogicDb: Database.Database | undefined;
}

function createConnection() {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  return db;
}

export const db = global.__mudalogicDb ?? createConnection();
if (process.env.NODE_ENV !== "production") global.__mudalogicDb = db;

db.exec(`
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  name TEXT,
  phone TEXT,
  origin TEXT,
  destination TEXT,
  moving_size TEXT,
  items TEXT,
  moving_date TEXT,
  message TEXT,
  status TEXT DEFAULT 'nuevo',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS contracts (
  id TEXT PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'borrador',
  client_name TEXT,
  client_doc TEXT,
  client_phone TEXT,
  client_email TEXT,
  origin_address TEXT,
  destination_address TEXT,
  moving_date TEXT,
  service_type TEXT,
  price TEXT,
  notes TEXT,
  client_signature TEXT,
  client_signed_at TEXT,
  client_signed_name TEXT,
  staff_signature TEXT,
  staff_signed_at TEXT,
  staff_signed_name TEXT,
  created_by TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS inventory_items (
  id TEXT PRIMARY KEY,
  contract_id TEXT NOT NULL,
  name TEXT,
  category TEXT,
  quantity INTEGER DEFAULT 1,
  condition TEXT,
  photo TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tracking_events (
  id TEXT PRIMARY KEY,
  contract_id TEXT NOT NULL,
  status TEXT NOT NULL,
  note TEXT,
  location TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE
);
`);

function seedDefault(key: string, value: string) {
  const exists = db.prepare("SELECT 1 FROM settings WHERE key = ?").get(key);
  if (!exists) {
    db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run(key, value);
  }
}

seedDefault("admin_password_hash", bcrypt.hashSync("Mudalogic2026", 10));
seedDefault("site.phone_display", "313 847 0094");
seedDefault("site.whatsapp", "573138470094");
seedDefault("site.email", "mudalogic.adm@gmail.com");
seedDefault("site.address_cucuta", "Calle 33 #11-5, Cúcuta, Norte de Santander");
seedDefault("site.address_medellin", "Medellín, Antioquia");
seedDefault("site.logo", "");
seedDefault("hero.title", "Mudanzas sin estrés, solo sonrisas");
seedDefault(
  "hero.subtitle",
  "Especialistas en mudanzas y trasteos nacionales. Empacamos, transportamos y desempacamos por ti — desde Cúcuta y Medellín hacia todo el país."
);
seedDefault("hero.image", "");
seedDefault(
  "gallery.images",
  JSON.stringify([
    { src: "", caption: "Empaque profesional" },
    { src: "", caption: "Cargue seguro" },
    { src: "", caption: "Entrega con una sonrisa" },
  ])
);
seedDefault(
  "services",
  JSON.stringify([
    {
      title: "Empaque y desempaque total",
      desc: "Llegamos con todo el material de embalaje, empacamos cada objeto desde cero y lo desempacamos en tu nuevo hogar u oficina.",
      icon: "box",
    },
    {
      title: "Mudanzas nacionales puerta a puerta",
      desc: "Desde Cúcuta y Medellín hacia cualquier ciudad de Colombia, con seguimiento en tiempo real de tu mudanza.",
      icon: "truck",
    },
    {
      title: "Mejores precios del mercado",
      desc: "Cotización clara y justa, sin sorpresas ni cobros ocultos. Seriedad, calidad y oportunidad.",
      icon: "price",
    },
    {
      title: "Inventario y contrato digital",
      desc: "Firmamos contigo un contrato de servicio con inventario fotográfico y firma digital, para tu tranquilidad.",
      icon: "doc",
    },
    {
      title: "Rastreo de tu mudanza",
      desc: "Sigue el estado de tu mudanza en tiempo real desde que sale hasta que llega a su destino.",
      icon: "map",
    },
    {
      title: "Personal capacitado",
      desc: "Equipo profesional, uniformado y con experiencia en manejo de carga, electrodomésticos y objetos frágiles.",
      icon: "team",
    },
  ])
);
seedDefault(
  "testimonials",
  JSON.stringify([
    {
      name: "Laura M.",
      city: "Cúcuta → Bogotá",
      text: "Empacaron todo desde cero, nada se dañó y llegó justo a tiempo. Excelente servicio.",
      rating: 5,
    },
    {
      name: "Carlos R.",
      city: "Medellín → Cali",
      text: "El mejor precio que encontré y pude ver en tiempo real dónde iba mi mudanza. Muy recomendados.",
      rating: 5,
    },
    {
      name: "Familia Pérez",
      city: "Cúcuta → Medellín",
      text: "Muy serios y puntuales. El contrato digital nos dio mucha confianza desde el primer momento.",
      rating: 5,
    },
  ])
);
seedDefault("stats.years", "10");
seedDefault("stats.moves", "3500");
seedDefault("stats.cities", "32");
seedDefault("stats.rating", "4.9");

export function generateTrackingCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  const full = `ML-${code}`;
  const exists = db.prepare("SELECT 1 FROM contracts WHERE token = ?").get(full);
  return exists ? generateTrackingCode() : full;
}

export default db;
