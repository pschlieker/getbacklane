# Mirakl customer service

Paths are `/mirakl/<connection>/api/...`. `shop_id` is set by Backlane if
the connection is bound to a shop.

**Use the inbox API (M10 to M14).** M01 (`/api/messages`) and the reason
shortcuts RE11, RE12 and RE14 are deprecated and return 410 Gone on Home24.
Use M11 for messages and RE01 for reason codes.

## Reason codes

`GET /api/reasons` (RE01) returns every reason as
`{ code, label, type, is_shop_right }`. Fetch it once per session, group by
`type` in code and return only the types you need:

| Type | Used for |
|---|---|
| `ORDER_MESSAGING`, `MESSAGING` | Topic of order threads |
| `OFFER_MESSAGING` | Topic of pre-sale product questions |
| `INCIDENT_OPEN` | Why the buyer opened an incident |
| `INCIDENT_CLOSE` | `reason_code` when you resolve an incident (OR64) |
| `REFUND`, `CANCELATION` | Refunds (OR28) and cancellations |
| `RETURN`, `RETURN_REJECTION`, `RETURN_NON_COMPLIANT` | Returns |

Labels are in the marketplace's language (German on Home24). Show the label
to the user, send the `code`.

## Threads

| Task | Call |
|---|---|
| List | `GET /api/inbox/threads` (M11) |
| Get one | `GET /api/inbox/threads/{thread_id}` (M10) |
| Reply | `POST /api/inbox/threads/{thread_id}/message` (M12) |
| New thread on an order | `POST /api/orders/{order_id}/threads` (OR43) |
| New thread with the operator | `POST /api/inbox/threads` (M14) |
| Download an attachment | `GET /api/inbox/threads/{attachment_id}/download` (M13) |

### Listing (M11)

- Seek pagination: `limit` (default 50) and `page_token` from the previous
  `next_page_token`; stop when it is absent.
- `with_messages: true` includes the last 100 messages per thread.
- `updated_since` (ISO date) for "what's new since yesterday".
- `entity_type` filters by what the thread is about: `MMP_ORDER` (an
  order), `MMP_OFFER` (a product question before purchase),
  `SELLER_OPERATOR` (between seller and marketplace). `entity_id` (comma
  separated) needs `entity_type`, e.g.
  `{ entity_type: "MMP_ORDER", entity_id: "order-123-A" }`.
- `sort: "date_updated,DESC"` for newest first.

### Thread fields

- `id`, `topic` (`{ type, value }`), `date_created`, `date_updated`.
- `entities: [{ id, type, label }]`: the order or offer. Use the order ID to
  fetch the order with OR11 (`order_ids`).
- `current_participants` and `authorized_participants`: `{ type, id,
  display_name }` with `type` `CUSTOMER`, `SHOP` or `OPERATOR`. Operators have
  no `id`.
- `messages[]`: `body`, `date_created`, `from` (`type`, `display_name`),
  `to`, `attachments: [{ id, name, size }]`.
- The thread needs a reply when the last message's `from.type` is
  `CUSTOMER` or `OPERATOR`.

### Reply (M12)

Multipart: Backlane builds the request from a JSON body.

```js
await codemode.request({
  method: "POST",
  path: `/mirakl/${conn}/api/inbox/threads/${threadId}/message`,
  body: {
    message_input: {
      body: "Guten Tag Herr Schmidt, …",
      to: [{ type: "CUSTOMER", id: customerId }],
    },
  },
});
```

- `body`: 3 to 50,000 characters.
- `to`: take `type` and `id` of the participant from the thread. Address the
  operator with `{ type: "OPERATOR" }` (no `id`). Send to both when the
  operator is already in the thread and should see the answer.
- `topic` is optional and changes the thread's topic.
- Attachments: `files: [{ name, content: { base64 }, contentType }]`. At most
  50 attachments across all threads of one order, 1,000 per seller for
  operator threads.
- A thread holds at most 1,000 messages.

### New thread on an order (OR43)

```js
body: {
  thread_input: {
    body: "…",
    to: ["CUSTOMER"],
    topic: { type: "REASON_CODE", value: "20" },
  },
}
```

`to` is a list of types (`CUSTOMER`, `OPERATOR`). `topic` is required: an
`ORDER_MESSAGING` code or `{ type: "FREE_TEXT", value: "…" }`. Use it to
contact the buyer first, e.g. about a delay. Check M11 with the order's
`entity_id` first so you don't open a second thread on the same order.

### New thread with the operator (M14)

`thread_input: { body, entity: { type: "SELLER_OPERATOR" }, topic }`. Use it
for questions to the marketplace itself, not for buyers.

## Incidents

An incident is a buyer complaint on an order line. Find them with OR11
`{ has_incident: true }`. The line's `order_line_state` is `INCIDENT_OPEN`.

- Answer the buyer in the order's thread (M12), then resolve the incident:
  `PUT /api/orders/{order_id}/lines/{line}/resolve_incident` (OR64) with
  `{ "reason_code": "<INCIDENT_CLOSE code>" }`.
- Pick the close reason with the user (Home24: e.g. 10 "Ersatzartikel
  erhalten", 11 "Vereinbarung mit dem Lieferanten getroffen"). Resolving
  without the buyer's problem being solved hurts the seller's rating.
- If the solution is money back, refund with OR28 (`PUT /api/orders/refund`)
  using a `REFUND` reason code, then resolve.

## Returns

| Task | Call |
|---|---|
| List | `GET /api/returns` (RT11, seek pagination) |
| Items still to return | `GET /api/returns/items_to_return` (RT12) |
| Accept or refuse a request | `PUT /api/returns/accept` (RT21) |
| Received | `PUT /api/returns/receive` (RT25) |
| Compliant or not | `PUT /api/returns/compliance` (RT26) |
| Close or cancel | `PUT /api/returns/close` (RT27), `PUT /api/returns/cancel` (RT29) |
| Return labels | `GET` / `POST /api/returns/return-labels` (RT52, RT51) |

RT21 body, up to 100 returns per call:

```json
{ "returns": [
  { "id": "R-123", "accepted": true },
  { "id": "R-124", "accepted": false, "rejection_reason_code": "RETURN_REJECTION_WINDOW_CLOSED" }
] }
```

Refusals need a `RETURN_REJECTION` code; non-compliant returns (RT26) a
`RETURN_NON_COMPLIANT` code.
