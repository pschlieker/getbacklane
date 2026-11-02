---
name: daily-check
description: >-
  Use when the user wants a daily or morning check of their marketplace
  business on OTTO Market, Kaufland or a Mirakl-based marketplace (e.g.
  Home24) through Backlane: "what needs my attention today", "anything
  urgent", orders to ship or accept, overdue shipments, open returns, open
  tickets and incidents, offers out of stock, or a weekly status summary
  across all channels. Read-only triage that hands each item to the right
  skill. Requires the Backlane MCP server (tools `list_integrations`,
  `search`, `execute`).
version: 0.3.0
homepage: https://app.getbacklane.com
repository: https://github.com/pschlieker/getbacklane
---

# Daily marketplace check

One answer to "what needs my attention today?" across every connected
channel. Every call here is a read. Do not ship, accept, reply or change
anything during the check: list what is due and offer the next step.

Load the `backlane` skill first if you have not checked the connection yet.
Use `search` for the exact schema before the first call to an operation.

## Before the first call

- **Connections.** Call `list_integrations`. Check every connection with
  `status: "active"` unless the user named channels. Skip `disabled` ones and
  say so. If a connection is a `sandbox` or playground, label its section
  "test data", because nothing there is a real customer.
- **One script per platform.** Run the reads for a platform in one `execute`
  call with `Promise.all`, and wrap each request so one failure does not hide
  the rest:

  ```js
  const call = async (name, req, pick) => {
    try { return [name, pick(await codemode.request(req))]; }
    catch (e) { return [name, { error: String(e.message ?? e).slice(0, 200) }]; }
  };
  ```

- **Return counts and the few oldest items**, not raw responses. Responses
  are capped at ~6,000 tokens. Loop over pages in code when you need totals.
- **Dates.** Kaufland `*_iso` filters reject milliseconds: send
  `2026-11-01T06:00:00Z`, not `...06:00:00.000Z` (HTTP 400 "Timestamp must be
  provided in ISO 8601 format").

## What to check

| Area | OTTO (`/otto/<c>`) | Kaufland (`/kaufland/<c>`) | Mirakl (`/mirakl/<c>`) |
|---|---|---|---|
| Ship today | `GET /v4/orders` `fulfillmentStatus: PROCESSABLE` | `GET /v2/order-units` `status: need_to_be_sent` | OR11 `GET /api/orders` `order_state_codes: SHIPPING` |
| Accept first | `ANNOUNCED` items: not paid yet, do **not** ship | none | OR11 `order_state_codes: WAITING_ACCEPTANCE` |
| Returns | `GET /v3/returns` `status: ANNOUNCED`, `MISDIRECTED` | `GET /v2/return-units` `status: return_arrived`, `return_in_clarification` | RT11 `GET /api/returns` |
| Buyer messages | none in the API (Partner Connect only) | `GET /v2/tickets` `status: opened` | M11 `GET /api/inbox/threads` `updated_since` |
| Disputes | none | ticket `open_reason` | OR11 `has_incident: true` (lines in `INCIDENT_OPEN`) |
| Out of stock | `GET /v1/availability/quantities`, `quantity` 0 | `GET /v2/units`, `amount` 0 | OF21 `GET /api/offers`, `quantity` 0 |

Per platform:

- **OTTO.** Orders are cursor-paginated (`limit` up to 256). Follow the `next`
  link in `links` and pass only its `nextcursor` (plus `limit`). An order has
  `positionItems[]`, each with its own `fulfillmentStatus`; count items, not
  orders, and use `mode: "AT_LEAST_ONE"` if mixed orders matter. Overdue means
  `expectedDeliveryDate` is today or past and the item is still
  `PROCESSABLE`. `/v3/returns` answers `{ positionItems: [...] }` and pages
  with `page`. Quantities come as `resources.variations[]` (`sku`,
  `quantity`), paged via `links`.
- **Kaufland.** Pass `storefront` if the seller has several. Lists return
  `pagination.total`: use `limit: 1` when you only need the count. Overdue
  means `delivery_time_expires_iso` is past on a `need_to_be_sent` unit.
  Tickets: put `is_seller_responsible: true` on top.
- **Mirakl.** OR11 pages with `max` (≤ 100) and `offset` up to `total_count`.
  Overdue: `shipping_deadline` past on `SHIPPING`. Acceptance due:
  `acceptance_decision_date` on `WAITING_ACCEPTANCE`; missing it auto-refuses
  the order and hurts the shop's rating, so list these first. RT11 and M11
  page with `limit` + `page_token`. A thread needs a reply when its last
  message is from `CUSTOMER` or `OPERATOR` (`with_messages: true`).
- **Optional seller KPIs (Mirakl).** A21 `GET /api/account/statistics` with
  `periods: "LAST_MONTH"` gives `late_shipment_rate`, `incident_rate`,
  `cancelation_rate`, `grade` and similar. It is limited to **once per day**:
  call it only if the user wants KPIs and not more than once per session.
  `null` values mean too little data, not zero.

### Known test-environment gaps

- Kaufland playground: `/v2/tickets` and `/v2/reports` return 404 "not part
  of the playground". Report "not available in the playground" and continue.
- OTTO sandbox: `/v1/return-shipments` returns 503 on every call. Use
  `/v3/returns` instead.
- 401/403 on a Mirakl operation means this marketplace does not offer it to
  the key. Say so instead of guessing.

## Report

Lead with what has a deadline. Keep it short enough to read on a phone.

1. **Due today**, oldest first: acceptance deadlines (Mirakl), overdue and
   due shipments (all), returns waiting for a decision. One line each with
   channel, order or return ID, age and deadline.
2. **Waiting for a reply:** tickets, threads and incidents with count and the
   oldest age. Flag anything older than 24 hours.
3. **Stock:** offers at 0 per channel with count; list SKUs only if there are
   few.
4. **All clear** channels in one line ("Kaufland: nothing due").
5. Which connection each section came from, and which were test data or
   failed.
6. Next steps as offers, each handled by its skill:
   - replies, incidents, returns: `customer-service`
   - not-live or rejected products: `listing-health`
   - ads below target: `otto-ads`
   - sales trends and cancellations: `sales-analysis`

## Weekly mode

When the user asks for a weekly summary, add the last 7 days against the 7
days before, per channel: orders, units, gross revenue, cancellations and
returns. Use the `sales-analysis` skill for the numbers and keep the daily
sections above for what is still open.

## Common mistakes

| Mistake | Result |
|---|---|
| Shipping or replying during the check | Unreviewed writes to buyers and marketplaces |
| Counting OTTO orders instead of position items | Mixed orders reported as fully open or fully shipped |
| Treating OTTO `ANNOUNCED` as "ship now" | Shipping before payment is confirmed |
| Milliseconds in Kaufland date filters | HTTP 400 |
| One failing call aborting the script | No answer for the whole platform |
| Calling A21 repeatedly | Mirakl rate limit (once per day) |
| Reporting sandbox orders as real | False alarms |
