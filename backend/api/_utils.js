const { createClient } = require("@supabase/supabase-js");
const Stripe = require("stripe");

function getEnv(name, { required = true } = {}) {
  const v = process.env[name];
  if (!v && required) throw new Error(`Missing env: ${name}`);
  return v;
}

function getAllowedOrigin(req) {
  const explicit = process.env.ALLOWED_ORIGIN;
  if (explicit) return explicit;
  return process.env.FRONTEND_BASE_URL || req.headers.origin || "*";
}

function withCors(req, res) {
  const origin = getAllowedOrigin(req);
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Stripe-Signature");
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return true;
  }
  return false;
}

function json(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function getBearerToken(req) {
  const h = req.headers.authorization || "";
  const m = /^Bearer\s+(.+)$/.exec(h);
  return m?.[1] || null;
}

function supabaseAdmin() {
  const url = getEnv("SUPABASE_URL");
  const key = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

function stripeClient() {
  const key = getEnv("STRIPE_SECRET_KEY");
  return new Stripe(key, { apiVersion: "2024-06-20" });
}

async function requireUser(req) {
  const token = getBearerToken(req);
  if (!token) {
    const err = new Error("Missing Authorization Bearer token.");
    err.status = 401;
    throw err;
  }
  const sb = supabaseAdmin();
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data?.user) {
    const err = new Error("Invalid session.");
    err.status = 401;
    throw err;
  }
  return { sb, user: data.user, token };
}

module.exports = {
  getEnv,
  withCors,
  json,
  supabaseAdmin,
  stripeClient,
  requireUser
};

