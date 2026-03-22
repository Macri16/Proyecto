const { withCors, json, stripeClient, supabaseAdmin, getEnv } = require("../lib/api-utils");

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

module.exports = async (req, res) => {
  if (withCors(req, res)) return;
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  try {
    const raw = await readRawBody(req);
    const sig = req.headers["stripe-signature"];
    const secret = getEnv("STRIPE_WEBHOOK_SECRET");

    const stripe = stripeClient();
    let event;
    try {
      event = stripe.webhooks.constructEvent(raw, sig, secret);
    } catch (e) {
      return json(res, 400, { error: `Webhook signature verification failed: ${e.message}` });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session?.metadata?.supabase_user_id;
      const amount = session?.amount_total ?? null;
      const currency = session?.currency ?? null;
      const email = session?.customer_details?.email || session?.customer_email || null;

      if (userId) {
        const sb = supabaseAdmin();

        const { error: payErr } = await sb.from("payments").insert({
          user_id: userId,
          stripe_session_id: session.id,
          amount_cents: amount,
          currency,
          email
        });
        if (payErr) {
          if (!String(payErr.message || "").toLowerCase().includes("duplicate")) throw payErr;
        }

        const { error: profErr } = await sb
          .from("profiles")
          .update({ access_status: "active" })
          .eq("id", userId);
        if (profErr) throw profErr;
      }
    }

    return json(res, 200, { received: true });
  } catch (e) {
    return json(res, 500, { error: e?.message || "Server error" });
  }
};
