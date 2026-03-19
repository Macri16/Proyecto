const { withCors, json, requireUser, supabaseAdmin } = require("../_utils");

module.exports = async (req, res) => {
  if (withCors(req, res)) return;
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

  try {
    const { user } = await requireUser(req);
    const sb = supabaseAdmin();

    const { data: me, error: meErr } = await sb
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (meErr) throw meErr;
    if (me?.role !== "admin") return json(res, 403, { error: "Forbidden" });

    const { count: usersCount, error: uErr } = await sb
      .from("profiles")
      .select("*", { count: "exact", head: true });
    if (uErr) throw uErr;

    const { count: paymentsCount, error: pErr } = await sb
      .from("payments")
      .select("*", { count: "exact", head: true });
    if (pErr) throw pErr;

    const { data: latestPayments, error: lpErr } = await sb
      .from("payments")
      .select("created_at,email,amount_cents,currency")
      .order("created_at", { ascending: false })
      .limit(10);
    if (lpErr) throw lpErr;

    return json(res, 200, { usersCount, paymentsCount, latestPayments: latestPayments || [] });
  } catch (e) {
    const status = e?.status || 500;
    return json(res, status, { error: e?.message || "Server error" });
  }
};

