# Privacy Notes

This kit is intentionally local-only.

- It does not make network calls.
- It does not call the Typeform API.
- It does not require Typeform API tokens, OAuth tokens, client secrets, refresh tokens, webhook secrets, or workspace credentials.
- It does not receive, poll, create, update, delete, sync, enrich, or transmit live Typeform responses.
- It does not write files during normal checks.
- It reads local JSON examples and produces in-memory preview data for QA.

The sample response in `examples/` is synthetic. Replace it only with scrubbed test data that contains no unnecessary personal information.

If this later becomes a live Typeform integration, the privacy model must be rewritten around actual data flows, account permissions, OAuth scopes or token handling, webhook validation, retention, deletion, support access, incident response, and marketplace or partner review requirements.
