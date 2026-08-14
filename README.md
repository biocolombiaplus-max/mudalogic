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

Copia `.env.local` (ya incluido para desarrollo) y define:

- `ADMIN_SESSION_SECRET`: valor propio y secreto antes de desplegar a
  producción — firma la sesión del panel administrativo.
- `POSTGRES_URL` (o `DATABASE_URL`): cadena de conexión a una base de datos
  Postgres. En local puede apuntar a un Postgres propio; en Vercel se llena
  automáticamente al agregar el storage "Postgres" del proyecto.
- `BLOB_READ_WRITE_TOKEN` (opcional en local, recomendado en producción): se
  llena automáticamente al agregar el storage "Blob" en Vercel. Sin este
  token las imágenes se guardan en disco local (`public/uploads/`), lo cual
  solo sirve para desarrollo.

## Datos y almacenamiento

Este proyecto usa **Postgres** para todos los datos (cotizaciones, contratos,
inventario, rastreo, contenido del sitio) y **Vercel Blob** para las imágenes
subidas desde el panel. Esto es necesario porque en hosting serverless (como
Vercel) cada solicitud puede atenderla una instancia distinta sin disco
compartido — guardar datos en un archivo local (SQLite) o en `public/uploads/`
se pierde o directamente falla entre una petición y otra.

Para que el proyecto funcione en Vercel solo hace falta agregar, desde el
dashboard del proyecto → **Storage**, un almacenamiento **Postgres** y uno
**Blob** (ambos con capa gratuita) — las variables de entorno quedan
configuradas automáticamente, sin tocar código.

## Stack

Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + Postgres (`pg`) +
Vercel Blob + JWT (jose) para sesión de administrador + Lucide para iconos.
