const { withCors, json, requireUser } = require("../lib/api-utils");

module.exports = async (req, res) => {
  if (withCors(req, res)) return;
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

  try {
    const { sb, user } = await requireUser(req);

    const { data: existing, error: selErr } = await sb
      .from("profiles")
      .select("id,email,role,access_status")
      .eq("id", user.id)
      .maybeSingle();
    if (selErr) throw selErr;

    let profile = existing;
    if (!profile) {
      const { data: created, error: insErr } = await sb
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email,
          role: "client",
          access_status: "free"
        })
        .select("id,email,role,access_status")
        .single();
      if (insErr) throw insErr;
      profile = created;
    }

    return json(res, 200, { user: profile });
  } catch (e) {
    const status = e?.status || 500;
    return json(res, status, { error: e?.message || "Server error" });
  }
};
