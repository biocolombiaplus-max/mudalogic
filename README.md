# MudaLogic — Landing page + panel administrativo

Landing page y sistema de gestión para MudaLogic, empresa de mudanzas y trasteos
nacionales con sede en Cúcuta y Medellín.

## Qué incluye

- **Landing page** moderna y responsiva con cotizador que arma un mensaje de
  WhatsApp automáticamente (nombre, teléfono, origen, destino, tamaño de la
  mudanza, qué se va a transportar, fecha). Cada cotización también se guarda
  en la base de datos para remarketing, aunque el cliente no complete el envío
  por WhatsApp.
- **Panel administrativo** (`/admin`) protegido con contraseña:
  - Cotizaciones/leads con filtros y estado (nuevo, contactado, cerrado, perdido).
  - Editor de contenido: logo, imágenes, textos de portada, servicios, galería,
    testimonios y datos de contacto — todo editable sin tocar código.
  - Generador de contratos de servicio: crea el contrato, comparte el link por
    WhatsApp o correo.
  - Rastreo de mudanzas: el admin va marcando el estado (recogido, en bodega,
    en ruta, entregado, etc.) y el cliente lo ve en tiempo real.
- **Contrato digital para el cliente** (`/contrato/[codigo]`): el cliente
  confirma sus datos, arma el inventario de la mudanza (con fotos tomadas
  desde el celular) y firma con el dedo. Luego, quien recoge la mudanza firma
  en el mismo dispositivo usando la contraseña del equipo MudaLogic.
- **Rastreo público** (`/rastreo/[codigo]`): línea de tiempo del estado de la
  mudanza, visible para el cliente con el código que se le comparte.

## Primeros pasos

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### Contraseña del panel administrativo

La contraseña por defecto es **`Mudalogic2026`** (se puede cambiar desde
`/admin/settings` una vez dentro del panel). Se guarda con hash en la base de
datos, nunca en texto plano.

### Variables de entorno

Copia `.env.local` (ya incluido para desarrollo) y define `ADMIN_SESSION_SECRET`
con un valor propio y secreto antes de desplegar a producción — se usa para
firmar la sesión del panel administrativo.

## Datos y almacenamiento

Este proyecto usa **SQLite** (`better-sqlite3`) con el archivo de base de
datos en `data/mudalogic.db` (se crea automáticamente y no se versiona en
git). Las imágenes subidas desde el panel se guardan en `public/uploads/`.

Esto significa que el hosting debe tener **disco persistente** (por ejemplo un
VPS, Railway, Render, un contenedor con volumen, etc.). Si se despliega en una
plataforma serverless típica (como Vercel en su modo por defecto), el disco no
persiste entre despliegues y se perderían los datos — en ese caso habría que
migrar a una base de datos gestionada (Postgres/Turso/etc.) y a
almacenamiento de imágenes en la nube (S3, Cloudinary, etc.).

## Stack

Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + SQLite + JWT (jose)
para sesión de administrador + Lucide para iconos.
