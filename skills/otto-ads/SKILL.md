---
name: otto-ads
description: >-
  Use when the user wants to run OTTO Sponsored Product Ads through Backlane:
  list or create campaigns, change budgets or bids, pause campaigns, manage
  advertised products (targets) and keywords, or pull campaign, product and
  keyword performance reports. Requires the Backlane MCP server (tools
  `list_integrations`, `search`, `execute`) with an OTTO Market connection.
version: 0.2.0
homepage: https://app.getbacklane.com
repository: https://github.com/pschlieker/getbacklane
---

# OTTO Sponsored Product Ads

OTTO's advertising API runs through Backlane's `execute` tool like every other
OTTO call. Load the `backlane` skill first if you have not checked the
connection yet.

## Before you start

- Find the OTTO connection name in the `execute` tool description (e.g.
  `otto-main`). Paths are `/otto/<connection>/v1/sponsored-product-ads/...`
  and `/otto/<connection>/v1/spa-reporting/...`.
- Use `search` to read the exact request schema before the first write. It is
  the source of truth; this skill only covers the rules that are easy to get
  wrong.
- **Ads spend real money.** Before creating or changing a campaign, budget or
  bid, state the exact change (amounts in euros) and get the user's
  confirmation.
- If OTTO answers 401 or 403, the connection lacks the advertising
  permission. Call `list_integrations` and give the user the reconnect link.

## Money and names

- All amounts are **euro cents**: `{ "amount": 1099, "currency": "EUR" }` is
  10.99 EUR. The minimum budget or bid is 20 (0.20 EUR). Convert when talking
  to the user.
- Campaign names must not contain `$ § " # *` or parentheses, except a
  trailing number like `Summer (2)`.

## Every write is asynchronous

Creating, updating or deleting campaigns, targets and keywords returns
`202` with a change request, not the result:

```json
{ "changeRequest": { "requestId": "…", "status": "PENDING", "entityIds": null } }
```

Poll `GET /v1/sponsored-product-ads/change-requests/{requestId}` every few
seconds until `status` is no longer `PENDING`. `ACCEPTED` means it worked and
`entityIds` holds the new or changed IDs. Any other status means it failed:
show the user the details. Never report a write as done before it is
`ACCEPTED`.

Keep each `execute` call short: start the write in one call and poll in the
next one, rather than looping for minutes in a single call.

## Campaigns

| Task | Call |
|---|---|
| List | `GET /v1/sponsored-product-ads/campaigns` (`limit` up to 1000; follow `nextCursor` via `cursor`) |
| Get one | `GET /v1/sponsored-product-ads/campaigns/{campaignId}` |
| Create | `POST /v1/sponsored-product-ads/campaigns` |
| Change | `PATCH /v1/sponsored-product-ads/campaigns/{campaignId}` with only the fields to change |

Create body (all fields required except `endDate`):

```json
{
  "name": "Sofas autumn",
  "startDate": "2026-11-01",
  "endDate": "2026-11-30",
  "budget": { "amount": 1000, "currency": "EUR" },
  "budgetType": "DAILY",
  "pacing": "EVEN",
  "campaignType": "AUTOMATIC"
}
```

- `startDate` must be today or later. `budgetType` `LIFETIME` requires an
  `endDate`.
- `budgetType` and `campaignType` cannot be changed after creation.
- **Campaigns cannot be deleted.** To stop one, set `{ "status": "PAUSED" }`
  (other values: `ACTIVE`, `WAITING`).
- Backlane sends PATCH bodies as JSON Merge Patch: omitted fields stay
  unchanged, `null` clears a field (e.g. `"endDate": null` makes a campaign
  open-ended).

## Targets (advertised products)

Path: `/v1/sponsored-product-ads/campaigns/{campaignId}/targets`

- Create: `POST` with `{ "targets": [{ "sku": "…", "bid": { "amount": 50, "currency": "EUR" } }] }`.
  The `bid` is required for `AUTOMATIC` campaigns and ignored for `MANUAL`
  ones. Take SKUs from the user's OTTO products (`GET /v5/products`).
- List: `GET …/targets`. Get one: `GET …/targets/{targetId}`.
- Change bids: `PATCH …/targets` with `{ "targets": [{ "targetId": "…", "bid": {…} }] }`.
- Remove: `DELETE …/targets` with the IDs as a **query** array:
  `query: { targetIds: ["…", "…"] }` (no body).

## Keywords

Path: `/v1/sponsored-product-ads/campaigns/{campaignId}/targets/{targetId}/keywords`

Each keyword has `keyword`, `matchType` (`EXACT`, `PHRASE`, `BROAD`) and
`keywordType` (`POSITIVE`, `NEGATIVE`).

- **`AUTOMATIC` campaigns only accept `NEGATIVE` keywords** (to exclude
  searches). Positive keywords need a `MANUAL` campaign.
- `POSITIVE` keywords need a `bid`; `NEGATIVE` ones take none.
- Create: `POST` with `{ "keywords": [ … ] }` (up to 2,500 at once).
- Change: `PATCH` with `{ "keywords": [{ "keywordId": "…", … }] }`.
- Remove: `DELETE` with `query: { keywordIds: [ … ] }`.

## Performance

Quick look at one campaign or product:

- `GET /v1/spa-reporting/campaign-performance?campaignId=…`
- `GET /v1/spa-reporting/product-performance?campaignId=…&sku=…`

Both take optional `fromDate`/`toDate`. A 404 "Data not found" means the
campaign has no traffic data yet, not that it does not exist.

Reports (campaign, product or keyword) for longer periods or many campaigns:

1. `POST /v1/spa-reporting/{campaign|product|keyword}-performance`:

   ```json
   {
     "name": "October campaigns",
     "fromDate": "2026-10-01",
     "toDate": "2026-10-31",
     "configuration": {
       "columns": ["CAMPAIGN_ID", "TOTAL_VIEWS", "TOTAL_CLICKS", "TOTAL_COSTS", "TOTAL_SALES"],
       "format": "CSV"
     }
   }
   ```

   `columns` and `format` are required. Optional: `groupBy` (e.g.
   `EVENT_DATE_CET` for daily rows) and `filters`
   (`{ "column": "CAMPAIGN_ID", "operator": "=", "value": "…" }`). Check the
   allowed columns per report type with `search`.
2. Poll `GET /v1/spa-reporting/{kind}-performance/status?reportId=…` until
   `status` is `READY`.
3. `GET /v1/spa-reporting/reports/download?reportId=…` returns the CSV: read
   `text` to analyse it and give the user `file.downloadUrl` (valid 24 hours).

`TOTAL_COSTS` and `TOTAL_SALES` are in euro cents. When you report results,
convert to euros and show costs, sales and their ratio (ROAS = sales / costs).
