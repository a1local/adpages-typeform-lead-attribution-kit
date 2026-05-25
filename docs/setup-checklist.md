# Typeform Lead Attribution Setup Checklist

Use this checklist before connecting a Typeform lead form to a CRM, spreadsheet, email notification, or automation tool.

## 1. Confirm Form Refs

- Open the Typeform form and confirm the answer refs used for name, email, phone, service, area, urgency, message, and consent.
- Match those refs to `config/field-map.json`.
- Keep answer refs stable before launching paid traffic.

## 2. Hidden fields

Add these hidden fields to the Typeform form:

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_term`
- `utm_content`
- `landing_page_url`
- `referrer_url`
- `gclid`
- `msclkid`
- `fbclid`
- `first_touch_source`
- `first_touch_medium`
- `first_touch_campaign`
- `first_touch_url`
- `first_touch_at`
- `last_touch_source`
- `last_touch_medium`
- `last_touch_campaign`
- `last_touch_url`
- `last_touch_at`
- `consent_status`
- `consent_source`
- `source_context`

## 3. Build A Test URL

- Use `snippets/hidden-field-url-builder.js` or an equivalent page script to append hidden fields to the Typeform URL.
- Confirm the URL includes UTM values, landing page, referrer, and any click IDs available at the time of submission.
- Keep source values readable enough for a human to review.

## 4. Submit A Test Response

- Submit one response from a paid-search-style URL.
- Submit one response with no click ID to confirm the review state is clear.
- Submit one response with missing consent context to confirm the checklist catches it.

## 5. Compare Output

- Copy a scrubbed response payload into `examples/sample-response.json`.
- Run `npm --prefix integrations/typeform/adpages-lead-attribution-kit run check`.
- Confirm `fieldValues`, `humanSummary`, `qualityChecklist`, and `missingRequired` match the intended handoff.

## 6. Do Not Automate Until Reviewed

- Do not connect CRM sync, spreadsheet writes, email notifications, ad-platform uploads, or reporting dashboards until a real Typeform test response has been reviewed.
- Do not claim API, OAuth, webhook, or partner-app support from this kit.
