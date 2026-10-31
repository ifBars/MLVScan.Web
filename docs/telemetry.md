# Website and API telemetry

Browser diagnostics are explicitly opt-in, recorded as `mlvscan_scan_run_completed` with
`consumer=web`. Consent is a local allowed/declined value, never a lasting installation ID.
No event is emitted merely by visiting a page or accepting/declining. Each completed scan run
uses a new random distinct ID. Repeated scans cannot be deduplicated into users or installations.

The pure summary uses fixed Core-derived allowlists. Refresh with
`bun scripts/sync-telemetry-categories.ts` and verify with `--check`. Unknown values map to fixed
categories; the property count is capped. No sample names, hashes, evidence, code, account IDs,
full URLs or query strings enter the event. No SDK autocapture, replay, cookies or person profiles.
The browser sends no credentials or referrer. As a network provider PostHog sees the connection;
location enrichment is disabled and the event IP is zeroed. Requests time out without retry.

Configure VITE_POSTHOG_PROJECT_TOKEN (public ingestion token), VITE_POSTHOG_REGION (us/eu) and
VITE_TELEMETRY_ENVIRONMENT (development/staging/production). Missing/invalid settings disable
sending. Environment labels are reporting filters, not access boundaries. Production reports
must filter environment=production. Do not turn unique distinct-ID counts into user metrics:
use event counts for runs, sum(result_count) for assembly observations, and weekly event counts
for weekly activity. Findings and submission categories do not prove maliciousness or a false positive.

The /submit form independently requires per-file consent and sends files only to the private API.
It works when analytics are declined. Successful explicitly opted-in website submissions produce
one server-side `mlvscan_private_review_received` event, consumer=api, with count/category and an opaque `submission_reference` equal to the private receipt UUID.
It contains no file hash, source URL, notes, account identity or file contents. No second
client receipt event is sent. Cloudflare Analytics Engine operational metrics remain separate;
enterprise/attestation/account traffic is not forwarded to PostHog.

Validation: web tests include projection privacy, opt-out, fresh IDs, failed transport, private
submission consent and no-public-fallback. API tests include endpoint isolation and credential-free
CORS. Development uses explicit benign fixtures; no real sample is uploaded for telemetry tests.

Verified on 2026-10-30: 179 website tests passed, 11 targeted API unit tests passed, and three
Workers private-review integration tests passed. Website/API builds and type checks passed.
Playwright verified desktop/mobile presentation, hosted sample submission, local-only WASM
scanning, a successful PostHog capture, and no PostHog request after opting out. A submission
also succeeded with diagnostics declined. A Workers-only redirect incompatibility was caught
live and fixed with manual redirects; redirects are rejected without following or retrying.
PostHog confirmed consumer=web development and staging captures and a consumer=api staging
receipt. In that earlier validation, canary notes, hashes, filenames and receipt IDs were absent from diagnostic payloads.
Test submissions from this pass were deleted. No production deployment was performed.

Receipt schema v2 adds only the random submission_reference, not a user identifier or access token. It joins to the private record reviewId; existing schema-v1 events cannot be joined retroactively. Diagnostics consent v2 requests renewed permission from previous opt-ins; previous declines remain declined. Older API clients with consent v1 continue sending count/category only. The in-place scan review form reuses the selected file (whole ZIP for archive scans), requires per-file upload consent and does not attach the scan report.
