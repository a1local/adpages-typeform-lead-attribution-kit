import assert from "node:assert/strict";
import { buildTypeformHiddenFieldUrl } from "../snippets/hidden-field-url-builder.js";
import { createAttributionPlan, readJsonFile } from "../src/lead-attribution.mjs";

const root = new URL("../", import.meta.url);
const response = await readJsonFile(new URL("examples/sample-response.json", root));
const fieldMap = await readJsonFile(new URL("config/field-map.json", root));
const expected = await readJsonFile(new URL("examples/sample-output.json", root));

const generated = createAttributionPlan({ response, fieldMap });
const expectedFieldValues = Object.keys(expected.fieldValues);
const generatedSnapshot = Object.fromEntries(
  expectedFieldValues.map((key) => [key, generated.fieldValues[key]])
);
const checklistStatuses = Object.fromEntries(
  generated.qualityChecklist.map((item) => [item.check, item.status])
);

assert.equal(generated.platform, "typeform");
assert.equal(generated.manualUseOnly, true);
assert.deepEqual(generated.typeform, expected.typeform);
assert.deepEqual(generatedSnapshot, expected.fieldValues);
assert.deepEqual(checklistStatuses, expected.qualityChecklistStatuses);
assert.deepEqual(generated.missingRequired, []);
assert.equal(generated.humanSummary, expected.humanSummary);
assert.equal(generated.attribution.utm.source, "google");
assert.equal(generated.attribution.clickIds.gclid, "test-gclid-123");
assert.equal(generated.respondent.phone, "+61 400 000 123");
assert.equal(generated.lead.service, "Blocked drain");
assert.equal(generated.attribution.consent.status, "granted");
assert.equal(generated.qualityChecklist.length, 10);

const typeformUrl = buildTypeformHiddenFieldUrl("https://example.typeform.com/to/abc123", {
  utm_source: "google",
  utm_medium: "cpc",
  utm_campaign: "emergency-plumber-perth",
  landing_page_url: "https://exampleplumbing.com.au/emergency-plumber-perth",
  gclid: "test-gclid-123"
});

assert.match(typeformUrl, /^https:\/\/example\.typeform\.com\/to\/abc123\?/);
assert.match(typeformUrl, /utm_source=google/);
assert.match(typeformUrl, /gclid=test-gclid-123/);

console.log("typeform lead attribution kit smoke ok");
