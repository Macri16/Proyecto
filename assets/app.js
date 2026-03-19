function $(sel) {
  return document.querySelector(sel);
}

function setText(sel, value) {
  const el = $(sel);
  if (el) el.textContent = value ?? "";
}

function setHtml(sel, value) {
  const el = $(sel);
  if (el) el.innerHTML = value ?? "";
}

function show(sel, on = true) {
  const el = $(sel);
  if (!el) return;
  el.style.display = on ? "" : "none";
}

function getAccessTokenFromSession(session) {
  return session?.access_token || session?.accessToken || null;
}

async function apiFetch(path, { accessToken, ...init } = {}) {
  const cfg = window.__getAppConfig();
  const base = (cfg.API_BASE_URL || "").replace(/\/+$/, "");
  if (!base) throw new Error("Missing API_BASE_URL in assets/config.js");
  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  const res = await fetch(`${base}${path}`, { ...init, headers });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    const msg = data?.error || data?.message || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

async function requireAuth({ role } = {}) {
  const supabase = window.__createSupabaseClient();
  const { data } = await supabase.auth.getSession();
  const session = data?.session;
  if (!session) {
    location.href = "./login.html";
    return null;
  }

  const accessToken = getAccessTokenFromSession(session);
  if (!accessToken) {
    location.href = "./login.html";
    return null;
  }

  const me = await apiFetch("/api/me", { accessToken });
  if (!me?.user) {
    await supabase.auth.signOut();
    location.href = "./login.html";
    return null;
  }

  if (role && me.user.role !== role) {
    location.href = "./client.html";
    return null;
  }

  return { supabase, session, me };
}

async function initLoginPage() {
  const supabase = window.__createSupabaseClient();

  const { data } = await supabase.auth.getSession();
  if (data?.session) {
    location.href = "./client.html";
    return;
  }

  const form = $("#loginForm");
  const emailEl = $("#email");
  const passEl = $("#password");

  const setBusy = (busy) => {
    if (form) form.querySelectorAll("input,button").forEach((x) => (x.disabled = busy));
    show("#busy", busy);
  };

  async function signIn(email, password) {
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data?.session) throw new Error("No session returned.");
      location.href = "./client.html";
    } catch (e) {
      setText("#error", e?.message || String(e));
      show("#error", true);
    } finally {
      setBusy(false);
    }
  }

  async function signUp(email, password) {
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      // If email confirmations enabled, user may need to confirm.
      setHtml(
        "#ok",
        "Cuenta creada. Revisa tu email si te pide confirmación. Luego inicia sesión."
      );
      show("#ok", true);
    } catch (e) {
      setText("#error", e?.message || String(e));
      show("#error", true);
    } finally {
      setBusy(false);
    }
  }

  $("#btnSignIn")?.addEventListener("click", async (ev) => {
    ev.preventDefault();
    show("#error", false);
    show("#ok", false);
    await signIn(emailEl?.value?.trim(), passEl?.value || "");
  });

  $("#btnSignUp")?.addEventListener("click", async (ev) => {
    ev.preventDefault();
    show("#error", false);
    show("#ok", false);
    await signUp(emailEl?.value?.trim(), passEl?.value || "");
  });
}

async function initClientPage() {
  show("#page", false);
  show("#loading", true);

  const ctx = await requireAuth();
  if (!ctx) return;

  const { supabase, session, me } = ctx;
  const email = session?.user?.email || "";

  setText("#userEmail", email);
  setText("#accessStatus", me.user.access_status || "free");
  show("#adminLink", me.user.role === "admin");

  $("#btnLogout")?.addEventListener("click", async () => {
    await supabase.auth.signOut();
    location.href = "./login.html";
  });

  $("#payForm")?.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    show("#payError", false);

    try {
      const amount = Number($("#amount")?.value || 0);
      if (!Number.isFinite(amount) || amount <= 0) throw new Error("Ingresa un monto válido.");
      const cents = Math.round(amount * 100);
      const cfg = window.__getAppConfig();
      if (cents < (cfg.STRIPE_MIN_AMOUNT_CENTS || 0)) {
        throw new Error(`El monto mínimo es ${(cfg.STRIPE_MIN_AMOUNT_CENTS / 100).toFixed(2)} ${cfg.STRIPE_CURRENCY}.`);
      }

      const accessToken = getAccessTokenFromSession(session);
      const out = await apiFetch("/api/create-checkout-session", {
        accessToken,
        method: "POST",
        body: JSON.stringify({
          amountCents: cents,
          currency: cfg.STRIPE_CURRENCY || "usd",
          successPath: "/client.html",
          cancelPath: "/client.html"
        })
      });

      if (!out?.url) throw new Error("No se pudo iniciar el pago.");
      location.href = out.url;
    } catch (e) {
      setText("#payError", e?.message || String(e));
      show("#payError", true);
    }
  });

  // Downloads list (optional)
  try {
    const accessToken = getAccessTokenFromSession(session);
    const dl = await apiFetch("/api/downloads", { accessToken });
    if (Array.isArray(dl?.items)) {
      const html = dl.items
        .map((x) => `<li><a href="${x.url}" target="_blank" rel="noopener">${x.name}</a></li>`)
        .join("");
      setHtml("#downloads", html || "<li>No hay descargas aún.</li>");
    }
  } catch {
    // non-fatal
  }

  show("#loading", false);
  show("#page", true);
}

async function initAdminPage() {
  show("#page", false);
  show("#loading", true);

  const ctx = await requireAuth({ role: "admin" });
  if (!ctx) return;

  const { supabase, session } = ctx;
  $("#btnLogout")?.addEventListener("click", async () => {
    await supabase.auth.signOut();
    location.href = "./login.html";
  });

  try {
    const accessToken = getAccessTokenFromSession(session);
    const data = await apiFetch("/api/admin/overview", { accessToken });
    setText("#usersCount", String(data?.usersCount ?? "—"));
    setText("#paymentsCount", String(data?.paymentsCount ?? "—"));
    setHtml(
      "#latestPayments",
      (data?.latestPayments || [])
        .map(
          (p) =>
            `<tr><td>${p.created_at || ""}</td><td>${p.email || ""}</td><td>${p.amount_cents ?? ""}</td><td>${p.currency || ""}</td></tr>`
        )
        .join("") || `<tr><td colspan="4">Sin datos</td></tr>`
    );
  } catch (e) {
    setText("#error", e?.message || String(e));
    show("#error", true);
  } finally {
    show("#loading", false);
    show("#page", true);
  }
}

window.__initLoginPage = initLoginPage;
window.__initClientPage = initClientPage;
window.__initAdminPage = initAdminPage;

