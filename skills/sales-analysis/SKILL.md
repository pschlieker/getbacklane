---
name: sales-analysis
description: >-
  Use when the user wants to analyse sales on OTTO Market, Kaufland or a
  Mirakl-based marketplace (e.g. Home24) through Backlane: bestsellers,
  revenue and units per product or channel, period comparisons (this week vs.
  last week, month over month), products that are ordered and then cancelled
  or returned most, products that sell on one marketplace but not on another,
  or seller KPIs. Read-only. Requires the Backlane MCP server (tools
  `list_integrations`, `search`, `execute`).
version: 0.4.0
homepage: https://app.getbacklane.com
repository: https://github.com/pschlieker/getbacklane
---

# Sales analysis across marketplaces

Answers "what sells, where, and what goes wrong after the sale" from the
marketplaces' own order data. Every call here is a read. Load the `backlane`
skill first if you have not checked the connections yet. Use `search` for the
exact schema before the first call to an operation.

Backlane sees orders, not costs. For margin or profit, ask the user for
purchase prices and fees, or use another tool connected in this session; never
estimate them.

## Before the first call

- **Scope.** Channels, period and measure (revenue, units, cancellations,
  returns). Default: all active connections, the last 30 days, gross revenue
  and units per product.
- **Connections.** Prefer `production` connections. Label sandbox or
  playground results as test data.
- **Aggregate in code.** Page through all orders in one `execute` call and
  return a summary: top N rows plus totals. Responses are capped at ~6,000
  tokens, so never return raw orders.
- **Match products across channels by EAN**, not SKU; SKUs often differ per
  marketplace.

## Where the numbers come from

| | OTTO | Kaufland | Mirakl |
|---|---|---|---|
| List | `GET /otto/<c>/v4/orders` | `GET /kaufland/<c>/v2/order-units` | OR11 `GET /mirakl/<c>/api/orders` |
| Period | `fromOrderDate`, `toOrderDate` | `ts_created_from_iso` (no upper bound: filter `ts_created_iso` in code) | `start_date`, `end_date` |
| Paging | `limit` ≤ 256, then `nextcursor` from the `next` link | `limit` + `offset` to `pagination.total` | `max` ≤ 100 + `offset` to `total_count` |
| Row | position item (one unit) | order unit (one unit) | order line (`quantity` units) |
| Product | `product.sku`, `product.ean`, `product.productTitle` | `id_offer`, `product.eans[]`, `product.title` | `offer_sku`, `product_sku`, `product_title` |
| Amount | `itemValueGrossPrice.amount`, **euros** | `revenue_gross` / `price`, **cents** | `total_price` (incl. shipping) or `price`, **currency units** |
| Cancelled | `CANCELLED_BY_PARTNER`, `CANCELLED_BY_MARKETPLACE` | `status: cancelled`, `cancel_reason` | `order_line_state: CANCELED` or `REFUSED`, `cancelations[]` |
| Returned | `RETURNED`; details in `/v3/returns` | `returned`, `returned_paid`; `/v2/return-units` | `REFUNDED`, `refunds[]`; RT11 `/api/returns` |

Rules that are easy to get wrong:

- **OTTO paging.** When you pass `nextcursor`, OTTO ignores every other
  parameter except `limit`. Take only the cursor string from the `next` link
  in `links`, not the whole URL.
- **Kaufland dates reject milliseconds.** Send `2026-08-04T19:19:05Z`;
  `...05.580Z` returns HTTP 400.
- **Units differ per platform** (see the table). Convert to one currency unit
  before you add channels together, and keep CZK and PLN storefronts apart
  from EUR.
- **Revenue counts only kept units.** Exclude cancelled items from revenue and
  report them separately. Returned items: report both gross and "net of
  returns" when the user asks about revenue.
- **Mirakl OR11** is meant for periodic use (recommended every 5 minutes for
  syncs). One paged read per analysis is fine; do not poll it.

## Kaufland reports (large periods)

For long periods, or when the user wants Kaufland's own figures, queue a
report instead of paging order units:

- `POST /kaufland/<c>/v2/reports/sales-new` with
  `body: { date_from: "2026-10-01", date_to: "2026-10-31" }` (dates only) and
  `query: { storefront }`.
- `POST /v2/reports/cancellations` (optional `cancellation_type`).
- Poll `GET /v2/reports/{id_report}` until `url` is set, then download it.
  Reports can stay queued for a long time. Tell the user and check back later
  instead of looping.
- The Kaufland playground has no reports (404 "not part of the playground").
  Use order units there.

## Mirakl seller KPIs

A21 `GET /mirakl/<c>/api/account/statistics` with `periods` (e.g.
`LAST_MONTH`, `LAST_THREE_MONTHS`, `ALL_SINCE_BEGINNING`) returns the shop's
`average_cart`, `cancelation_rate`, `incident_rate`, `late_shipment_rate`,
`approval_rate`, `grade` and more. It is limited to **once per day**: one
call per session at most, with every period you need in one comma-separated
`periods`. `null` means not enough data.

## Analyses

### Bestsellers and period comparison

Group by product (EAN, falling back to SKU) and channel: units, gross revenue,
orders. For a comparison, read both periods in the same script and add the
change in percent. Sort by revenue unless the user asked for units.

### Ordered, then cancelled or returned

Per product: units ordered, cancelled, returned, and the rates
(cancelled ÷ ordered, returned ÷ ordered). Only rank products with a
meaningful number of orders (say ≥ 5); a 100 % rate on one order is noise.
Group cancellations by reason (`cancel_reason`, Mirakl
`order_line_state_reason_code`) and returns by status and reason (Kaufland
`return-units`, Mirakl RT11). OTTO `/v3/returns` `details` holds the
acceptance or rejection reason and item condition, not why the buyer returned
it; say so instead of inventing return reasons. High cancellation by the
seller usually means stock or data problems: point to `listing-health` or the
stock figures.

### Sells here, not there (channel gaps)

1. Bestsellers per channel by EAN for the period.
2. For the top products on one channel, check whether the user has a live
   offer on the others: Kaufland `GET /v2/units` with `ean`, Mirakl OF21
   `GET /api/offers` with `product_id` or `sku`, OTTO
   `GET /v5/products/marketplace-status` with `sku` (an unknown SKU returns
   an empty list, not 404). If Kaufland answers 500 to the `ean` filter,
   retry once, then page `GET /v2/units` with `embedded: "products"` and match
   `product.eans` in code.
3. Report three groups: not listed there, listed but not live (hand over to
   `listing-health`), and live but not selling.

Do not claim a product "would sell" on another channel. Report the gap and
the evidence.

## Report

1. Period, channels, connections, and whether any was test data.
2. Totals per channel: orders, units, gross revenue, cancelled, returned.
3. The table the user asked for, top 10 to 20 rows, with EAN, title, channel
   and the measure. Amounts with currency.
4. What the numbers do not include: shipping (if excluded), costs, fees, and
   periods or channels that failed.
5. Offer a CSV via `asFile: true` when the full list is longer than the table.

## Common mistakes

| Mistake | Result |
|---|---|
| Adding Kaufland cents to OTTO euros | Revenue off by a factor of 100 |
| Counting OTTO or Mirakl orders instead of items/lines | Wrong units for multi-item orders |
| Cancelled items in revenue | Inflated sales |
| Matching channels by SKU | Same product counted as different products |
| Passing filters together with `nextcursor` on OTTO | Filters silently ignored |
| Milliseconds in Kaufland date filters | HTTP 400 |
| Calling A21 more than once a day | Mirakl rate limit |
| Estimating costs or margin | Made-up numbers |
