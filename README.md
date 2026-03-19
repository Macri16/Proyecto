# marketcorp.org — Landing + Área de clientes

Este repo contiene:
- **Frontend estático** (GitHub Pages): `index.html`, `login.html`, `client.html`, `admin.html`
- **Backend serverless** (Vercel recomendado): `backend/api/*` (Stripe + Supabase)

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

## 3) Backend (Vercel)

### Deploy

1. Sube la carpeta `backend/` a un repo (puede ser repo separado).
2. En Vercel, “Import Project” apuntando a `backend/`.
3. Variables de entorno (ver `backend/.env.example`):
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `FRONTEND_BASE_URL` (tu GitHub Pages)
   - `ALLOWED_ORIGIN` (opcional)

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

