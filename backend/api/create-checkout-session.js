const { withCors, json, requireUser, stripeClient, getEnv } = require("./_utils");

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
  });
}

module.exports = async (req, res) => {
  if (withCors(req, res)) return;
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  try {
    const { user } = await requireUser(req);
    const body = await readJson(req);

    const amountCents = Number(body.amountCents);
    const currency = String(body.currency || "usd").toLowerCase();

    if (!Number.isFinite(amountCents) || amountCents < 50) {
      return json(res, 400, { error: "Invalid amountCents" });
    }

    const frontendBase = getEnv("FRONTEND_BASE_URL");
    const successPath = String(body.successPath || "/client.html");
    const cancelPath = String(body.cancelPath || "/client.html");

    const stripe = stripeClient();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email || undefined,
      line_items: [
        {
          price_data: {
            currency,
            product_data: { name: "Acceso área de clientes" },
            unit_amount: amountCents
          },
          quantity: 1
        }
      ],
      success_url: `${frontendBase}${successPath}?paid=1`,
      cancel_url: `${frontendBase}${cancelPath}?canceled=1`,
      metadata: {
        supabase_user_id: user.id
      }
    });

    return json(res, 200, { url: session.url });
  } catch (e) {
    const status = e?.status || 500;
    return json(res, status, { error: e?.message || "Server error" });
  }
};

