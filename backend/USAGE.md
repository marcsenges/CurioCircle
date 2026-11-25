# Optional usage statistics (beta)

The app sends no usage requests before the user enables the unchecked usage setting. Disabling it stops future requests, including after reload. No offline replay, no identifier, no cookies, no names, no answers, no question IDs, no referrer or full URL in payloads. Only fixed event and dimension strings. Cloudflare necessarily processes technical connection data; the database holds aggregate daily counters (UTC) in the EU, not individual event rows. Aggregate counts older than 365 days are pruned on incoming usage requests. Existing totals cannot be linked back to a person for individual deletion. This does not establish legal compliance by itself.

## Definitions
- app_open: one consenting page load, including the current page when consent is granted; not unique users.
- round_start: first answer or skip in a newly generated deck or after reopening.
- answer / skip: button actions, not answer contents or people.
- qr_open / whatsapp_open / link_open / share_open: consenting page opens with the corresponding shared public source marker. Old untagged links, actual scans and WhatsApp deliveries cannot be measured.
- whatsapp_click: opening the invitation action, not proof of delivery.
- link_copy: successful Clipboard API copy of the invitation link, not manual fallback.
- share_success: successful native share API resolution, not delivery.
- install: browser appinstalled event, available only on supported platforms.
- language: selected language at counted open or change.
- category: one count per category in an applied selection, no combined profiles.

Counts are best-effort. Consent, offline use, failed requests and platform support limit coverage. No deduplication IDs; the global hourly cap limits writes but is not comprehensive bot protection. The private administration report includes the daily and cumulative counters; no public statistics endpoint. Feedback receipts remain entirely separate.

Before a general public launch, review the complete privacy notice, controller/contact details, hosting agreements and retention schedule.
