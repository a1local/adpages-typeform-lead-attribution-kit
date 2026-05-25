export const TYPEFORM_HIDDEN_FIELD_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "landing_page_url",
  "referrer_url",
  "gclid",
  "msclkid",
  "fbclid",
  "first_touch_source",
  "first_touch_medium",
  "first_touch_campaign",
  "first_touch_url",
  "first_touch_at",
  "last_touch_source",
  "last_touch_medium",
  "last_touch_campaign",
  "last_touch_url",
  "last_touch_at",
  "consent_status",
  "consent_source",
  "source_context"
];

export function buildTypeformHiddenFieldUrl(baseTypeformUrl, attribution = {}) {
  const url = new URL(baseTypeformUrl);
  const params = url.searchParams;
  const values = flattenAttribution(attribution);

  for (const key of TYPEFORM_HIDDEN_FIELD_KEYS) {
    const value = clean(values[key]);
    if (value) params.set(key, value);
  }

  return url.toString();
}

function flattenAttribution(attribution) {
  return {
    ...attribution,
    first_touch_source: attribution.firstTouch?.source ?? attribution.first_touch_source,
    first_touch_medium: attribution.firstTouch?.medium ?? attribution.first_touch_medium,
    first_touch_campaign: attribution.firstTouch?.campaign ?? attribution.first_touch_campaign,
    first_touch_url: attribution.firstTouch?.url ?? attribution.first_touch_url,
    first_touch_at: attribution.firstTouch?.timestamp ?? attribution.first_touch_at,
    last_touch_source: attribution.lastTouch?.source ?? attribution.last_touch_source,
    last_touch_medium: attribution.lastTouch?.medium ?? attribution.last_touch_medium,
    last_touch_campaign: attribution.lastTouch?.campaign ?? attribution.last_touch_campaign,
    last_touch_url: attribution.lastTouch?.url ?? attribution.last_touch_url,
    last_touch_at: attribution.lastTouch?.timestamp ?? attribution.last_touch_at
  };
}

function clean(value) {
  return String(value ?? "").trim();
}
