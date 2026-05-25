import { readFile } from "node:fs/promises";
import { buildTypeformHiddenFieldUrl } from "../snippets/hidden-field-url-builder.js";
import { createAttributionPlan, normalizeFieldMap, readJsonFile } from "../src/lead-attribution.mjs";

const root = new URL("../", import.meta.url);
const requiredFiles = [
  "README.md",
  "PRIVACY.md",
  "PUBLISH_BLOCKERS.md",
  "package.json",
  "config/field-map.json",
  "docs/setup-checklist.md",
  "examples/sample-response.json",
  "examples/sample-output.json",
  "snippets/hidden-field-url-builder.js",
  "src/lead-attribution.mjs",
  "scripts/check.mjs",
  "scripts/smoke.mjs"
];
const localSourceFiles = [
  "snippets/hidden-field-url-builder.js",
  "src/lead-attribution.mjs",
  "scripts/check.mjs",
  "scripts/smoke.mjs"
];
const networkPattern = new RegExp([
  "f" + "etch\\s*\\(",
  "XML" + "HttpRequest",
  "send" + "Beacon",
  "Web" + "Socket",
  "Event" + "Source",
  "node:" + "https",
  "node:" + "http",
  "api\\." + "typeform\\.com",
  "form_response" + "s/\\{"
].join("|"), "i");
const secretPattern = new RegExp([
  "TYPEFORM_" + "API_" + "TOKEN",
  "TYPEFORM_" + "CLIENT_" + "SECRET",
  "access_" + "tok" + "en",
  "refresh_" + "tok" + "en",
  "bearer\\s+[a-z0-9]"
].join("|"), "i");

async function main() {
  const contents = new Map();
  for (const file of requiredFiles) {
    const content = await readText(file);
    contents.set(file, content);
    assert(content.trim().length > 0, `${file} must not be empty`);
  }

  const packageJson = JSON.parse(contents.get("package.json"));
  assert(packageJson.private === true, "package.json must remain private");
  assert(packageJson.type === "module", "package.json must use type=module");
  assert(packageJson.scripts?.check, "package.json must define check script");
  assert(packageJson.scripts?.smoke, "package.json must define smoke script");
  assert(!packageJson.dependencies, "kit must not add runtime dependencies");
  assert(!packageJson.devDependencies, "kit must not add dev dependencies");

  const fieldMap = JSON.parse(contents.get("config/field-map.json"));
  const normalized = normalizeFieldMap(fieldMap);
  assert(normalized.fields.length >= 28, "field map should cover response, answer, hidden, consent, attribution, and review fields");
  assert(fieldMap.manualSetupOnly === true, "field map must be manual setup only");
  assert(fieldMap.requiresTypeformApi === false, "field map must avoid Typeform API requirements");
  assert(fieldMap.requiresOAuth === false, "field map must avoid OAuth requirements");
  assert(fieldMap.requiresSecrets === false, "field map must avoid secret requirements");
  assert(fieldMap.requiresWebhooks === false, "field map must avoid webhook requirements");
  assert(fieldMap.writesDataAutomatically === false, "field map must disclose no automatic writes");

  const sourceKinds = new Set(normalized.fields.map((field) => field.sourceKind));
  for (const sourceKind of ["response", "answer", "hidden", "derived"]) {
    assert(sourceKinds.has(sourceKind), `field map must include ${sourceKind} fields`);
  }

  const types = new Set(normalized.fields.map((field) => field.type));
  for (const type of ["identity", "qualification", "attribution", "consent", "review"]) {
    assert(types.has(type), `field map must include ${type} fields`);
  }

  const outputKeys = new Set(normalized.fields.map((field) => field.outputKey));
  for (const key of ["hidden_utm_source", "hidden_gclid", "hidden_msclkid", "hidden_fbclid", "derived_first_touch_summary", "derived_last_touch_summary", "derived_consent_status"]) {
    assert(outputKeys.has(key), `field map must include ${key}`);
  }

  const sampleResponse = await readJsonFile(new URL("examples/sample-response.json", root));
  const sampleOutput = await readJsonFile(new URL("examples/sample-output.json", root));
  const generated = createAttributionPlan({ response: sampleResponse, fieldMap });
  assert(generated.platform === sampleOutput.platform, "sample output platform must match generated platform");
  assert(generated.manualUseOnly === sampleOutput.manualUseOnly, "sample output manual flag must match generated output");
  assert(JSON.stringify(generated.typeform) === JSON.stringify(sampleOutput.typeform), "sample Typeform metadata must match generated output");
  assert(generated.humanSummary === sampleOutput.humanSummary, "sample human summary must match generated output");
  assert(JSON.stringify(generated.missingRequired) === JSON.stringify(sampleOutput.missingRequired), "sample missing required fields must match");
  assert(generated.missingRequired.length === 0, "sample response should not miss required fields");

  for (const [key, value] of Object.entries(sampleOutput.fieldValues)) {
    assert(generated.fieldValues[key] === value, `sample fieldValues.${key} must match generated output`);
  }

  const checklistStatuses = Object.fromEntries(generated.qualityChecklist.map((item) => [item.check, item.status]));
  assert(JSON.stringify(checklistStatuses) === JSON.stringify(sampleOutput.qualityChecklistStatuses), "quality checklist status snapshot must match sample output");
  assert(generated.qualityChecklist.some((item) => item.check === "Human QA" && item.status === "review"), "checklist must force human QA review");

  const hiddenUrl = buildTypeformHiddenFieldUrl("https://example.typeform.com/to/abc123?existing=1", {
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: "emergency-plumber-perth",
    landing_page_url: "https://exampleplumbing.com.au/emergency-plumber-perth",
    gclid: "test-gclid-123",
    firstTouch: {
      source: "google",
      medium: "cpc",
      campaign: "emergency-plumber-perth",
      timestamp: "2026-05-24T07:12:00Z"
    }
  });
  assert(hiddenUrl.includes("existing=1"), "hidden-field URL builder must preserve existing query params");
  assert(hiddenUrl.includes("utm_source=google"), "hidden-field URL builder must add UTM source");
  assert(hiddenUrl.includes("gclid=test-gclid-123"), "hidden-field URL builder must add gclid");
  assert(hiddenUrl.includes("first_touch_source=google"), "hidden-field URL builder must add first-touch fields");

  for (const file of localSourceFiles) {
    const content = contents.get(file);
    assert(!networkPattern.test(content), `${file} must not make Typeform or network calls`);
    assert(!secretPattern.test(content), `${file} must not contain credential handling`);
  }

  const source = contents.get("src/lead-attribution.mjs");
  assert(source.includes("form_response"), "source must handle Typeform form_response payloads");
  assert(source.includes("hidden"), "source must handle Typeform hidden fields");
  assert(source.includes("answers"), "source must handle Typeform answers");

  const readme = contents.get("README.md");
  assert(readme.includes("Typeform hidden fields"), "README must mention Typeform hidden fields");
  assert(readme.includes("does not call the Typeform API"), "README must disclose no Typeform API calls");
  assert(readme.includes("does not include OAuth"), "README must disclose no OAuth integration");
  assert(readme.includes("does not receive webhooks"), "README must disclose no webhook handling");

  const privacy = contents.get("PRIVACY.md");
  assert(privacy.includes("does not make network calls"), "PRIVACY must disclose network behavior");
  assert(privacy.includes("does not require Typeform API tokens"), "PRIVACY must disclose credential behavior");

  const blockers = contents.get("PUBLISH_BLOCKERS.md");
  assert(blockers.includes("not ready to be marketed as a Typeform app"), "publish blockers must identify current status");
  assert(blockers.includes("No automatic form-response reads, webhook handling, or lead writes"), "publish blockers must block automatic reads/writes");

  const setup = contents.get("docs/setup-checklist.md");
  assert(setup.includes("Hidden fields"), "setup checklist must include hidden-field setup");
  assert(setup.includes("UTM"), "setup checklist must include UTM setup");

  console.log(`typeform lead attribution kit check ok (${requiredFiles.length} files)`);
}

async function readText(file) {
  return readFile(new URL(file, root), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
