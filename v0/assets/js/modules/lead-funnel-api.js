const LEAD_ENDPOINT = "https://n8n.amplifyugc.co/webhook/webinar-tiktok-shop-lead";
const INTENT_ENDPOINT = "https://n8n.amplifyugc.co/webhook/webinar-tiktok-shop-intencao";

const METADATA = Object.freeze({
  _source: "Novo Funil Marcas · Webinar · LP Victor",
  variante: "lp_victor_intent_validation",
  produto: "Webinar TikTok Shop para Marcas",
  oferta: "97 reais",
  funil: "webinar_tiktok_shop_7_perguntas",
});

const ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "fbclid",
];

function readAttribution() {
  const params = new URLSearchParams(window.location.search);
  return Object.fromEntries(ATTRIBUTION_KEYS.map((key) => [key, params.get(key) || ""]));
}

async function postJson(url, payload, signal) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

  let body = null;
  try {
    body = await response.json();
  } catch {
    throw new Error("invalid-response");
  }

  if (!response.ok || body?.ok !== true) throw new Error("request-failed");
  return body;
}

export async function createWebinarLead(answers, signal) {
  const body = await postJson(
    LEAD_ENDPOINT,
    { ...answers, ...readAttribution(), ...METADATA, _ts: new Date().toISOString() },
    signal,
  );

  if (typeof body.lead_id !== "string" || !body.lead_id.trim()) throw new Error("missing-lead-id");
  return { leadId: body.lead_id.trim() };
}

export async function registerWebinarIntent({ leadId, email }, signal) {
  const body = await postJson(
    INTENT_ENDPOINT,
    { lead_id: leadId, email, _ts: new Date().toISOString() },
    signal,
  );

  if (body.stage !== "purchase_intent") throw new Error("invalid-stage");
  return body;
}

export function trackWebinarEvent(event, detail = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, variante: METADATA.variante, ...detail });
}
