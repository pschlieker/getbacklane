---
name: mirakl-product-data
description: >-
  Use when the user wants to check or fix product data on a Mirakl-based
  marketplace (e.g. Home24) through Backlane: products stuck unpublished,
  Catalog Manager errors or warnings (MCM-05000, MCM-05010, MCM-05012), a
  failed product import (P41, P42, P44, P47), missing attributes, GPSR
  manufacturer data, or re-sending product data. Requires the Backlane MCP
  server (tools `list_integrations`, `search`, `execute`) with a Mirakl
  connection.
version: 0.2.0
homepage: https://app.getbacklane.com
repository: https://github.com/pschlieker/getbacklane
---

# Validate and fix product data on Mirakl marketplaces

Mirakl product calls go through Backlane's `execute` tool like every other
call. Load the `backlane` skill first if you have not checked the connection
yet. Paths are `/mirakl/<connection>/api/...`. Use `search` to read the exact
schema of an operation before you call it.

Backlane only talks to the marketplace. **The product data comes from the
user**: a file they attach, another tool connected in this session (their
shop system, PIM or ERP), or answers in the chat. Ask where it lives before
you build anything.

## The one rule: P41 is a full replace

A P41 product import **replaces the whole product record**. Every attribute
that is not in the file is deleted on the marketplace: description, extra
images, care notes, series, and so on.

Never send a "patch" with only the fixed fields. Always send the complete
record: current data plus fixes. A file with only the corrected fields leaves
the product with nothing but those fields.

## Rate limits

| Call | Limit |
|---|---|
| P41 import | 1 per 15 minutes per seller. Batch all products into one file. |
| P42 import status, P51 import list | 1 per minute. Never call either twice in one `execute` script. |
| PM11, VL11, H11 | Hourly. Fetch once and reuse the result. |
| CM11 full export (no dates) | Every 4 hours. Filter by SKU for single checks. |

Plan calls so a window isn't wasted on an avoidable error. If a P41 is
throttled, tell the user when the next one is allowed. If you can schedule a
follow-up, schedule it for just after that time. Do not retry in a loop.

## 1. Validate: find what is wrong

1. **CM11** `GET /api/mcm/products/sources/status/export` returns status,
   errors and warnings per product. Omit `updated_since`/`updated_to` for a
   full export. Filter with `provider_unique_identifier` for one SKU. Add
   `asFile: true` for big catalogs.
2. Aggregate in code by `code | attribute_code | message` and count. Return
   only the summary.
3. Sort the findings:

   | Code | Meaning | Who fixes it |
   |---|---|---|
   | `MCM-05000` | Required attribute missing | Seller |
   | `MCM-05010` | Value not in the value list | Seller |
   | `MCM-05012` | Failed a script validation (e.g. textile composition required when main material is textile) | Seller |
   | `MCM-0L000` | Not published yet | Marketplace review |
   | `MCM-04014` | Needs operator review | Marketplace review |

   Tell the user plainly that the review codes clear only after the
   marketplace reviews the product. Nothing the seller sends removes them.
4. Import-level errors: **P51** lists imports, **P47** gives the
   transformation error report, **P44** the integration error report. They are
   empty if the seller never uploaded through P41. CM11 is the main source.

## 2. Get the source data

Ask the user which products to fix and where their data is. Then collect, per
product:

- Identifiers: SKU (`productIDMerchant` / shop SKU) and EAN.
- Every attribute they have, not just the ones with errors (see the rule
  above).
- Images as **stable, public URLs**. Signed or expiring links (e.g. S3
  presigned URLs) break once they expire.
- The marketplace category.

Get attribute meanings and units from PM11 (step 4). For Home24, see
`references/home24.md` for the usual fields and their pitfalls.

### Fill gaps

- **GPSR manufacturer data** (name, postal address, email or URL): take it
  from the user's data or the manufacturer's own imprint, and cross-check with
  the commercial register.
- **Never guess** GPSR data, dimensions, weights or materials. If no reliable
  source exists, ask the user. An inferred value (e.g. "no electrical parts"
  for a wooden table) must be stated to the user as an assumption.

## 3. Build the complete record

There is no full product sheet in the API for unpublished products:

- **P31** `GET /api/products?product_references=SHOP_SKU|<sku>` (or
  `EAN|<ean>`) returns data only for published products.
- **CM11** returns status only.
- **P46** `GET /api/products/imports/{import}/transformed_file` returns the
  last record sent through P41, in operator format. Use P51 to find the latest
  import that contains the SKU.

Build each row like this:

1. Start from the user's **full** product data, mapped to every marketplace
   attribute that has a value.
2. Overlay anything newer from the last P46 file for that SKU.
3. Overlay the fixes.
4. Show the user a diff before sending: fields added, fields changed, and
   fields that would be **dropped** compared with P46 or their source data.
   A dropped field is deleted on the marketplace.

## 4. Build the import file

- **PM11** `GET /api/products/attributes` gives the shop-format attribute
  codes. Add `all_operator_attributes=true` for type, unit and
  `requirement_level`.
- **VL11** `GET /api/values_lists` gives the allowed codes for LIST
  attributes. Send the **code**, not the label (e.g. `white`, not `Weiß`).
- **H11** `GET /api/hierarchies` gives the categories. The category column
  takes the hierarchy **code**.
- Include every attribute PM11 marks as required for the product's category.
- Format: UTF-8 CSV, `;` separator, every value in double quotes.

## 5. Send

- Writes are audited. Show the user the file (or the diff) and get a go-ahead
  before uploading.
- `POST /api/products/imports` with body
  `{ file: { name, content, contentType: "text/csv" } }`. Backlane builds the
  multipart request.
- Keep the returned import id. You need it for every later check.

## 6. Verify

1. **P42** `GET /api/products/imports/{import}` (max 1 per minute):
   - `transform_lines_in_error > 0`: read **P47**. Typical errors: `1004
     category could not be identified` (missing category column), `1000
     attribute X is required` (incomplete row).
   - `import_status: SENT`: passed transformation, waiting for integration.
     Check again later.
   - `COMPLETE` with `has_error_report`: read **P44**.
2. **P46** confirms exactly what was stored.
3. **CM11** for the SKU: the targeted errors should be gone. Review codes
   remain until the marketplace reviews the product.
4. Report to the user: the import id, which errors cleared, which remain, and
   what still waits on the marketplace.

## Common mistakes

| Mistake | Result |
|---|---|
| File contains only the fixed fields | Every other attribute is deleted |
| Category column missing or a label instead of the code | Error 1004 |
| Value-list label instead of code | Rejected value (`MCM-05010`) |
| Dimensions with decimals, weight in grams, or gross package weight | Wrong data or rejection; check PM11 units |
| Expiring image URLs | Images disappear after the link expires |
| Polling P42 in a loop inside one script | Rate limit hit, the window is wasted |
