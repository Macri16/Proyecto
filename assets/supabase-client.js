// Supabase JS (UMD) is loaded via CDN in HTML.
// This helper expects `assets/config.js` (or `window.__APP_CONFIG__`) to exist.

function getAppConfig() {
  const cfg = window.__APP_CONFIG__;
  if (!cfg || !cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) {
    throw new Error(
      "Missing config. Create assets/config.js from assets/config.example.js and set SUPABASE_URL + SUPABASE_ANON_KEY."
    );
  }
  const key = String(cfg.SUPABASE_ANON_KEY);
  if (/PEGAR_AQUI|YOUR_SUPABASE|example\.com/i.test(key) || key.length < 20) {
    throw new Error(
      "SUPABASE_ANON_KEY no está configurada. En Supabase: Settings → API Keys. Usa la clave anon (JWT que empieza por eyJ…) pestaña «Legacy anon, service_role», o la Publishable si tu proyecto ya la soporta."
    );
  }
  return cfg;
}

function createSupabaseClient() {
  const cfg = getAppConfig();
  if (!window.supabase || !window.supabase.createClient) {
    throw new Error("Supabase library not loaded. Ensure the CDN script is included before this file.");
  }
  return window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
}

window.__getAppConfig = getAppConfig;
window.__createSupabaseClient = createSupabaseClient;

