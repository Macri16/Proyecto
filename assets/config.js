// Local/dev placeholder.
// IMPORTANT: For real deployment, replace values with your real Supabase + backend URLs.
// If you commit this file, it will expose your anon key (which is OK) but DO NOT put service role keys here.

window.__APP_CONFIG__ = {
  // Supabase → Settings → Data API (API URL)
  SUPABASE_URL: "https://msgreflsxyroqecdtuqz.supabase.co",
  // Supabase → Settings → API Keys → pestaña «Legacy anon, service_role» → anon (JWT eyJ...)
  // Si solo ves Publishable/Secret nuevas, abre la pestaña legacy y copia «anon public».
  SUPABASE_ANON_KEY: "PEGAR_AQUI_TU_ANON_JWT",
  // Misma URL donde ya te funciona GET /api/me (401 JSON)
  API_BASE_URL: "https://proyecto-peach-six.vercel.app",
  STRIPE_MIN_AMOUNT_CENTS: 500,
  STRIPE_CURRENCY: "usd"
};

