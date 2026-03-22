const { withCors, json, requireUser, supabaseAdmin } = require("../lib/api-utils");

module.exports = async (req, res) => {
  if (withCors(req, res)) return;
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

  try {
    const { user } = await requireUser(req);
    const sb = supabaseAdmin();

    const bucket = "client-files";
    const prefixes = [`global`, `users/${user.id}`];

    const items = [];
    for (const prefix of prefixes) {
      const { data: list, error: listErr } = await sb.storage.from(bucket).list(prefix, {
        limit: 50,
        sortBy: { column: "name", order: "asc" }
      });
      if (listErr) continue;

      for (const obj of list || []) {
        if (!obj?.name || obj.name.endsWith("/")) continue;
        const path = `${prefix}/${obj.name}`;
        const { data: signed } = await sb.storage.from(bucket).createSignedUrl(path, 60 * 15);
        if (signed?.signedUrl) {
          items.push({ name: obj.name, url: signed.signedUrl });
        }
      }
    }

    return json(res, 200, { items });
  } catch (e) {
    const status = e?.status || 500;
    return json(res, status, { error: e?.message || "Server error" });
  }
};
