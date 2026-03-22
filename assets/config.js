// IMPORTANT: Solo la clave ANON (JWT eyJ...) va aquí. NUNCA pegues sb_secret_ ni service_role.
// Si alguna vez pegaste la secret en el repo o en GitHub, rótala en Supabase: Settings → API Keys.

window.__APP_CONFIG__ = {
  // Supabase → Settings → Data API → API URL
  SUPABASE_URL: "https://msgreflsxyroqecdtuqz.supabase.co",
  // Supabase → Settings → API Keys → pestaña «Legacy anon, service_role» → anon public (JWT eyJ...)
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zZ3JlZmxzeHlyb3FlY2R0dXF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MDc1MzQsImV4cCI6MjA4OTQ4MzUzNH0.yDUBVQ0Pq2xaeXHlqKvD0c34fCZz-e7BnmW6loe4MdU",
  // Base del backend (sin rutas: sin /login.html)
  API_BASE_URL: "https://proyecto-peach-six.vercel.app",
  STRIPE_MIN_AMOUNT_CENTS: 500,
  STRIPE_CURRENCY: "usd"
};
