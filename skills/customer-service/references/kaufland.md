# Kaufland customer service

Paths are `/kaufland/<connection>/v2/...`. `storefront` (`de`, `cz`, `sk`,
`pl`, `at`) defaults to the connection's storefront. Lists use `limit` and
`offset`. Rate limit: 111 requests per second per seller across all
endpoints.

The Kaufland playground has no tickets: on a playground connection these
endpoints return 404 "This endpoint is not part of the playground". Tell the
user that tickets only work on a live seller connection.

## Tickets

| Task | Call |
|---|---|
| List | `GET /v2/tickets` |
| Get one with messages | `GET /v2/tickets/{id_ticket}` with `query: { embedded: "messages,order_units,buyer,product,files" }` |
| All recent messages | `GET /v2/tickets/messages` (`ts_created_from_iso`, `sort: "ts_created_iso:desc"`) |
| Reply | `POST /v2/tickets/{id_ticket}/messages` |
| Close | `PATCH /v2/tickets/{id_ticket}/close` (no body) |
| Open a ticket about an order | `POST /v2/tickets` |

List filters: `status`, `open_reason`, `topic`, `id_buyer`,
`ts_created_from_iso`, `ts_updated_from_iso`, `fulfillment_type`, `sort`
(`ts_created_iso:desc` or `ts_updated_iso:desc`). Default `limit` is 30.

### Ticket fields

- `id_ticket` is a string starting with `001`.
- `status`: `opened`, `buyer_closed`, `seller_closed`, `both_closed`,
  `customer_service_closed_final`. Only `opened` needs work.
- `is_seller_responsible`: `true` means Kaufland expects the seller to act.
- `open_reason`: `product_not_as_described`, `product_defect`,
  `product_not_delivered`, `product_return`, `contact_other`.
- `topic`: finer category, e.g. `delivery_delayed`, `delivery_not_received`,
  `delivery_wrong_products`, `delivery_parts_missing`,
  `delivery_change_address`, `order_cancel`, `order_product_defect`,
  `return_check_status`, `return_request_label`, `invoice_needed`,
  `invoice_problem`, `product_properties`, `product_availability`,
  `other_question`. Can be `null`.
- `ids_order_units`: the order units the ticket is about. Fetch them with
  `GET /v2/order-units/{id_order_unit}` for status and tracking.
- Each message has `author.role` (`buyer`, `seller`, `system`,
  `customer_service`) and `text`. A ticket needs a reply when the last
  message is from `buyer` or `customer_service`.

### Reply body

```json
{ "text": "Guten Tag Frau Müller, …", "interim_notice": false }
```

- `text`: 1 to 65,535 characters, plain text.
- `interim_notice: true` marks an interim reply ("we are checking with the
  carrier") so the ticket stays open on Kaufland's side.
- Attachments: `ticket_message_files: [{ filename, mime_type, data }]` with
  `data` base64-encoded (e.g. an invoice PDF).

### Open a ticket

```json
{ "id_order_unit": [123456789], "reason": "product_not_delivered", "message": "…" }
```

`reason` takes the same values as `open_reason`. Use this only when the user
wants to contact the buyer about an order first.

## Returns

| Task | Call |
|---|---|
| List returns | `GET /v2/returns` |
| Get one | `GET /v2/returns/{id_return}` |
| List return units | `GET /v2/return-units` (`status`, `ts_created_from_iso`, `limit` up to 100) |
| Accept | `PATCH /v2/return-units/{id_return_unit}/accept` (no body) |
| Reject | `PATCH /v2/return-units/{id_return_unit}/reject` with `{ "message": "…" }` |
| Ask the buyer | `PATCH /v2/return-units/{id_return_unit}/clarify` with `{ "message": "…" }` |
| Mark as repaired | `PATCH /v2/return-units/{id_return_unit}/repair` |

Decisions are per return unit, not per return. The `message` on reject and
clarify is shown to the buyer: treat it like a reply and get approval.
Refunds are separate: `PATCH /v2/order-units/{id}/refund`, see `search`.
