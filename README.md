# AdPages Lead Attribution Kit for Typeform

Local-only resource kit for agencies adding UTM, click-ID, consent, landing-page, and first/last touch context to Typeform lead forms.

## What It Does

- Defines a Typeform hidden fields map for UTM values, landing-page URL, referrer, `gclid`, `msclkid`, `fbclid`, first/last touch hints, consent context, and source context.
- Normalizes a Typeform-style `form_response` payload into deterministic lead-attribution output.
- Maps answer refs such as `contact_name`, `phone`, `service_requested`, and `marketing_consent` into a reviewable local preview.
- Includes a small URL builder snippet for appending approved hidden fields to a Typeform URL.
- Provides local checks and a smoke test that compare the sample response against expected output.

It does not call the Typeform API, does not include OAuth, does not receive webhooks, does not read live form responses, does not write leads, does not send analytics events, does not store credentials, and is not positioned as a Typeform app or official integration. It is a setup and QA kit until real account testing exists.

## Folder

```text
integrations/typeform/adpages-lead-attribution-kit/
  config/field-map.json
  docs/setup-checklist.md
  examples/sample-response.json
  examples/sample-output.json
  snippets/hidden-field-url-builder.js
  scripts/check.mjs
  scripts/smoke.mjs
  src/lead-attribution.mjs
  package.json
  PRIVACY.md
  PUBLISH_BLOCKERS.md
  README.md
```

## Local Checks

From the repository root:

```sh
npm --prefix integrations/typeform/adpages-lead-attribution-kit run check
npm --prefix integrations/typeform/adpages-lead-attribution-kit run smoke
```

## Manual Setup Flow

1. Add the hidden field names from `config/field-map.json` to the Typeform lead form.
2. Use `snippets/hidden-field-url-builder.js` or an equivalent page script to append campaign values to the Typeform URL.
3. Submit a test response using a URL that contains UTM values, click IDs, landing-page URL, referrer, first/last touch hints, and consent context.
4. Export or copy the test response into `examples/sample-response.json` shape and run the local checks.
5. Compare the generated preview against the values intended for CRM, spreadsheet, email notification, or reporting tools before enabling any automation.

## Input Files

`config/field-map.json` is the setup blueprint. It intentionally uses Typeform answer refs and hidden-field names because each account can choose different labels and refs.

`examples/sample-response.json` is synthetic. It uses a Typeform-style `form_response` object with `hidden` and `answers` arrays.

`snippets/hidden-field-url-builder.js` is a dependency-free helper for building a Typeform URL with approved hidden-field keys.

## Generated Output Shape

The runtime returns:

- `typeform`: form ID, response ID, title, landed time, and submitted time.
- `respondent`: normalized contact answers.
- `lead`: normalized service, area, urgency, and message answers.
- `attribution`: UTM values, click IDs, landing page, referrer, first/last touch summaries, consent, and source context.
- `fieldValues`: deterministic key/value preview for implementation QA.
- `mappedFields`: ordered source map for response, answer, hidden, and derived fields.
- `humanSummary`: readable attribution note for sales or account review.
- `qualityChecklist`: pass, review, or missing states that force human QA.
- `missingRequired`: required fields that were blank.

## Publishing Position

This is publishable as a free Typeform attribution setup resource, agency checklist, or implementation template. It can earn useful links from Typeform setup guides, paid-search tracking resources, agency operations docs, and small-business marketing tool pages.

Monetizable later paths could include a hosted checker, screenshot walkthroughs, account-specific hidden-field audits, CRM export templates, or a real integration. Those require separate account testing, privacy review, support docs, and possibly Typeform partner or marketplace review.

## Publish Blockers

- This is not a Typeform app, OAuth integration, webhook receiver, or API client.
- Public listing copy, screenshots, icon, support URL, terms URL, hosted privacy URL, and submission metadata are not included.
- Real Typeform answer refs and hidden fields must be verified inside each target form.
- Any future live response reads, API calls, webhook processing, analytics calls, lead sync, or credential handling needs a separate privacy and security review.

## Publisher

Built by [AdPages from A1 Local](https://a1local.com.au/extensions/) as a free, dependency-light resource for local-service marketers, web designers, and small business site owners.
