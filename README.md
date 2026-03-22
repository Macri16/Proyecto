# marketcorp.org — Landing + Área de clientes

Este repo contiene:
- **Frontend estático**: `index.html`, `login.html`, `client.html`, `admin.html`
- **API serverless en la raíz** (Vercel): `api/*` + `lib/api-utils.js` + `package.json` en la raíz del repo  
  Si despliegas **todo el repo** en Vercel (sin “Root Directory” en `backend/`), usa esta carpeta `api/` — así `/api/me` funciona en la misma URL que la landing.
- **Alternativa**: carpeta `backend/` (útil si quieres un proyecto Vercel separado con **Root Directory = `backend`**)

## 1) Configurar Supabase

1. Crea un proyecto en Supabase.
2. En **SQL editor**, ejecuta el esquema:
   - `supabase/schema.sql`
3. En **Auth → Providers**, habilita **Email** (password).
4. Crea un usuario admin:
   - Regístrate con `login.html`
   - Luego en la tabla `profiles`, cambia su `role` a `admin`

## 2) Configurar Stripe (modo test primero)

1. Crea una cuenta de Stripe.
2. Obtén:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET` (al crear el webhook)

Eventos necesarios:
- `checkout.session.completed`

## 3) Backend / API (Vercel)

### Opción A — Un solo proyecto (recomendado si ya tienes la landing en Vercel)

1. Conecta el **repo completo** a Vercel (raíz del proyecto, **sin** cambiar “Root Directory” a `backend`).
2. Vercel detectará `package.json` y la carpeta `api/`.
3. Variables de entorno (mismas que en `backend/.env.example`):
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `FRONTEND_BASE_URL` = la URL pública de **este** sitio (ej. `https://tu-proyecto.vercel.app`, sin barra final)
   - `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET` (cuando actives pagos)
   - `ALLOWED_ORIGIN` (opcional)
4. Tras el deploy, prueba: `https://TU_DOMINIO.vercel.app/api/me` → debe responder JSON (401 sin token), **no** 404.

### Opción B — Solo backend

1. En Vercel, importa el repo y pon **Root Directory = `backend`**.
2. Variables de entorno: ver `backend/.env.example`.

### Endpoints
- `GET /api/me`
- `POST /api/create-checkout-session`
- `POST /api/stripe-webhook`
- `GET /api/downloads`
- `GET /api/admin/overview`

## 4) Frontend (GitHub Pages)

### Configuración

1. Crea `assets/config.js` copiando `assets/config.example.js` y completando:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `API_BASE_URL` (URL del backend en Vercel)
2. Publica con GitHub Pages (Settings → Pages):
   - Branch: `main`
   - Folder: `/root`

### Rutas
- `/index.html` landing
- `/login.html` login/signup
- `/client.html` área de clientes (protegida)
- `/admin.html` admin (solo role `admin`)

## 5) Archivos/descargas

Ver `supabase/storage.md`.

