---
name: listing-health
description: >-
  Use when the user asks whether products are live or sellable on OTTO Market,
  Kaufland or a Mirakl-based marketplace (e.g. Home24) through Backlane: new
  products not showing up, listings rejected, restricted, blocked or offline,
  missing mandatory fields or GPSR data per item and channel, "why is this
  SKU/EAN not online", or a listing status overview across channels. Requires
  the Backlane MCP server (tools `list_integrations`, `search`, `execute`).
version: 0.2.0
homepage: https://app.getbacklane.com
repository: https://github.com/pschlieker/getbacklane
---

# Listing health across marketplaces

Answers "is it live, and if not, why?" per product and channel. Every call
here is a read. Load the `backlane` skill first if you have not checked the
connections yet. Use `search` for the exact schema before the first call to
an operation.

## Live means two things

A product sells only when **both** the product and the offer are fine. Check
both, or you will report products as live that nobody can buy.

| Channel | Product side | Offer side |
|---|---|---|
| OTTO | `marketplace-status` is `ONLINE` | `active-status` true, quantity > 0, price set |
| Kaufland | product by EAN `is_valid`, not `is_blocked` | `units/status` `is_live` |
| Mirakl | CM11 `status` is `LIVE` | an offer exists in OF21 with stock |

## Before the first call

- **Scope.** Use the channels and products the user named. If they named
  none, ask (SKUs, EANs, "everything new this week").
- **Connections.** `list_integrations` shows each connection's
  `environment`. Prefer `production`; if you check a `sandbox` or playground,
  say so in the answer, because "live" there is not the real shop. With
  several connections per platform, name the one you used.
- **Empty shops.** Read the total first (`limit: 1`, then
  `pagination.total` / `total_count`). If a shop has 0 offers, report
  "nothing is listed on this channel" once instead of a failure per product.
- **404s are answers.** `codemode.request` returns the parsed body and
  **throws** on any non-2xx, with the status in the message
  (`OTTO 404 on GET ...`). Several 404s below mean "never sent" or "none", so
  wrap each call:

  ```js
  const call = async (req) => {
    try { return { ok: true, data: await codemode.request(req) }; }
    catch (e) { const m = String(e); return { ok: false, status: Number(m.match(/ (\d{3}) on /)?.[1]), error: m.slice(0, 300) }; }
  };
  ```

Match products across channels by **EAN**. Aggregate in code and return
summaries: responses are capped at ~6,000 tokens.

## OTTO

Paths `/otto/<connection>/...`, paginated with `page` and `limit`; follow
the `next` link until it is missing.

1. **Find the SKU.** Calls take OTTO's `sku`. `/v5/products` has **no EAN
   filter**: if you only have EANs, scan `GET /v5/products` (`limit` 100) and
   map `ean` → `sku`. An unknown `sku` there returns 200 with an empty list.
2. **Status, many products:** `GET /v5/products/marketplace-status`
   (`limit` up to 1000). Filter with `marketPlaceStatus: ["REJECTED",
   "RESTRICTED"]` (array) or `sku`. Each item has `status` (`PENDING`,
   `ONLINE`, `RESTRICTED`, `REJECTED`, `INACTIVE`), `errors` and
   `information` (each `code` + `title`), and a `shop` link. Group by error
   code.
3. **Status, one product:** `GET /v5/products/{sku}/marketplace-status`.
4. **Offer side:** `GET /v5/products/{sku}/active-status`,
   `GET /v1/availability/quantities/{sku}`, `GET /v5/products/{sku}/prices`
   (lists: `/v5/products/active-status` with `limit` up to 100,
   `/v1/availability/quantities`, `/v5/products/prices`). Prices are plain
   euros (`750` = 750.00 EUR), unlike the ads API.
5. **404 means "never sent", not "rejected"** on all of the single-SKU calls
   above and on `/v5/products/prices?sku=`. `/v5/products/content-changes`
   answers 404 "page not found" when there are simply no changes.
6. **Recent changes:** `fromDate` on `marketplace-status` filters by when the
   *status* last changed, not by creation date.
7. **A delivery the user just sent:** `GET /v5/products/update-tasks/{processUuid}`,
   then `/failed` for the rejected products. An unknown UUID returns
   `state: "pending"` forever, not 404. Only poll a UUID you got from an
   actual POST, and respect `pingAfter`.

## Kaufland

Paths `/kaufland/<connection>/v2/...`.

1. **Storefronts:** `GET /v2/info/storefront` lists the seller's storefronts.
   Any other `storefront` answers 400 `storefront-not-configured`.
2. **Offers:** `GET /v2/units` with `storefront`, filtered by `ean` or
   `id_product`. Add `embedded: "products"` (plural) for product data
   including EANs. Retry a 500 once.
3. **Why not live:** `POST /v2/units/status`, `query: { storefront }`, body
   `{ unit_ids: [...] }`, **at most 20 per call**: loop in batches. Each entry
   has `is_live` and `reasons[]` (`reason`, `reason_description`, optional
   `details_url`), e.g. `product_data_incomplete`, `gpsr_info_needed`,
   `stock_update_needed`, `offer_paused`, `price_check_needed`. New reasons
   appear without notice: show `reason_description` for unknown ones.
   Unknown IDs come back as entries with `status_code: 404`; the call itself
   succeeds. 500/503 are safe to retry.
4. **Product side:** `GET /v2/products/ean/{ean}` with `storefront` gives
   `is_valid`, `is_blocked`, `blocked_reasons`. This is Kaufland's **shared
   catalog** entry, possibly built from other sellers' data: it proves the
   product exists, not that the user's data is fine. 404 means Kaufland does
   not know the EAN.
5. **The seller's own data:** `GET /v2/product-data/status/{ean}` with
   `locale` (e.g. `de-DE`). 404 means the seller never sent data for that EAN.
6. **Whole catalog:** `POST /v2/reports/invalid-items` with `storefront`
   lists offers that cannot go live for missing product data. Reports are
   queued: poll `GET /v2/reports/{id_report}` until `url` is set. It can stay
   `NEW` for a long time; tell the user and check back later instead of
   looping. `product-data-import-file-errors` needs `id_file_import` in the
   body.

Not the seller's catalog: `GET /v2/assortment-coverage/insights` lists
products Kaufland wants sellers to add (hundreds of thousands). Never count
them as the user's listings.

## Mirakl

Paths `/mirakl/<connection>/api/...`.

1. **Status:** CM11 `GET /api/mcm/products/sources/status/export`.
   - One product by shop SKU: `provider_unique_identifier: "<sku>"`.
   - By EAN: `unique_identifier: "EAN-13|<ean>"`. A bare EAN fails with 400
     `MCM-06001`.
   - **`{ status: 204 }` means no product source: never sent.**
   - Many products: filter `status` (`LIVE`, `NOT_LIVE`).
   - A full export (no filter, no dates) is allowed **once every 4 hours**:
     add `asFile: true`, aggregate in the same script and keep the result for
     the session. `updated_since` gives a delta (max every 5 minutes).
     Filtered single-product calls were not throttled in testing.
2. **Read both `errors` and `warnings`.** Missing required attributes
   (`MCM-05000`) and value-list errors (`MCM-05010`) arrive in `warnings`;
   `errors` often holds only `MCM-0L000` (not published yet). Group by
   `code` + `attribute_code` and count.
3. **Who fixes it:** `MCM-05000`/`05010`/`05012` are seller data.
   `MCM-0L000` and `MCM-04014` clear only after the marketplace reviews the
   product.
4. **Offer side:** OF21 `GET /api/offers` (`max` up to 100, `offset`; filter
   `sku` or `product_id`). No offer means not sellable, even for a `LIVE`
   product.
5. **Recent imports:** P51 `GET /api/products/imports` (max 1 per minute).
   `has_transformation_error_report: true` → P47
   `.../{import}/transformation_error_report` (CSV with an `errors` column per
   line). P44 `.../error_report` answers 404 when `has_error_report` is false.

To fix Mirakl product data, use the `mirakl-product-data` skill.

## Report

1. Which connection per channel, and whether it is a sandbox.
2. One line per channel: products checked, live, not live.
3. Not-live reasons grouped by cause with counts, largest first, e.g.
   "749 missing GPSR manufacturer data (nameOfManufacturer,
   postalAddressOfManufacturer, eMailAddressOrURLOfManufacturer)".
4. For each cause: who fixes it (seller data, offer/stock, marketplace review)
   and the next step.
5. A product × channel table only when the user asked about specific products.
6. Give `file.downloadUrl` for any export the user may want (valid 24 hours).

## Common mistakes

| Mistake | Result |
|---|---|
| Checking only the product status | "Live" products without offer, stock or price |
| Reading only CM11 `errors` | Missing attributes are reported as "just not published" |
| Letting a thrown 404 abort the script | No answer; wrap calls and treat 404 as "never sent" or "none" |
| Bare EAN in CM11 `unique_identifier` | 400 `MCM-06001`; use `EAN-13|<ean>` |
| Kaufland `products/ean` valid → "our data is fine" | Shared catalog entry; check `product-data/status` |
| Counting `assortment-coverage` rows | Hundreds of thousands of products that are not the user's |
| More than 20 IDs in `units/status` | Request rejected |
| A second full CM11 export within 4 hours | Rate limit hit |
| Polling a guessed OTTO `processUuid` | Stays `pending` forever |
| Sandbox results reported as the live shop | Wrong conclusions |
