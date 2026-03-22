// IMPORTANT: Solo la clave ANON (JWT eyJ...) va aquí. NUNCA pegues sb_secret_ ni service_role.
// Si alguna vez pegaste la secret en el repo o en GitHub, rótala en Supabase: Settings → API Keys.

window.__APP_CONFIG__ = {
  // Supabase → Settings → Data API → API URL
  SUPABASE_URL: "https://msgreflsxyroqecdtuqz.supabase.co",
  // Supabase → Settings → API Keys → pestaña «Legacy anon, service_role» → anon public (JWT eyJ...)
  SUPABASE_ANON_KEY: "PEGAR_AQUI_TU_ANON_JWT",
  // Base del backend (sin rutas: sin /login.html)
  API_BASE_URL: "https://proyecto-peach-six.vercel.app",
  STRIPE_MIN_AMOUNT_CENTS: 500,
  STRIPE_CURRENCY: "usd"
};
