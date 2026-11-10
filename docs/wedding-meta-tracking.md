# Wedding inquiry tracking

All successful forms posting to `/api/contact` return an opaque `inquiryId`.
The server reports `Lead` through Conversions API after successful email/webhook
delivery, and the thank-you page reports `Lead` with the same `ca-lead-<id>`.
Meta deduplicates the two channels by event name and event ID. Invalid forms,
honeypots, failed delivery and direct thank-you visits do not produce leads.

Production setup:
- Pixel / dataset: Canadian Weddings, `1110472461323039`.
- Set `META_CONVERSIONS_ACCESS_TOKEN` as a production-only Vercel Secret for
  `canadian-weddings`. Never expose it through `NEXT_PUBLIC_*`, logs or Git.
- Redeploy after configuring the secret. Without it, browser tracking continues;
  preview and local development never send server conversions.
- Optimize wedding ad sets for standard `Lead`, without an exact thank-you URL
  custom-conversion restriction. Do not change Christmas purchase conversions.

The server hashes normalized email and phone details with SHA-256. Browser/ad
cookies, IP and user agent support attribution when available. No click ID is
invented, and no wedding date, names, venue or message is sent. One bounded retry
uses the original event ID and event time. Logs contain only delivery status.

Reference: Meta's official Node Business SDK `serverside/server-event.js` and
`serverside/user-data.js`, and Conversions API deduplication documentation.
Graph version v26.0 matches the official SDK at implementation time.
