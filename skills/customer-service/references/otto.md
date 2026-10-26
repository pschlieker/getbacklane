# OTTO Market customer service

OTTO's partner API has **no buyer messaging**. Customer questions and
complaints are answered in OTTO Partner Connect. Say so plainly when the user
asks to read or answer OTTO messages, and offer what the API does cover:
returns.

Paths are `/otto/<connection>/v3/returns...`.

## List returns

`GET /v3/returns` with `query: { status, limit, page }`:

- `status`: `ANNOUNCED` (buyer announced a return), `ACCEPTED`, `REJECTED`,
  `MISDIRECTED` (arrived at the wrong partner). Case-insensitive.
- `limit` up to 50; increase `page` until a page comes back short.
- The response is `{ positionItems: [...] }`. Each item has
  `positionItemId` and `salesOrderId`, which the decision calls need.

Parcel tracking for returns: `GET /v1/return-shipments` and
`GET /v1/return-shipments/carriers/{carrier}/trackingnumbers/{trackingNumber}`.

## Accept or reject

Up to 200 items per request. Both calls change what the buyer is refunded:
confirm each batch with the user.

Accept: `POST /v3/returns/acceptance`

```json
{ "positionItems": [
  { "positionItemId": "…", "salesOrderId": "…", "reason": "RETURN_RECEIVED", "condition": "A" }
] }
```

`reason`: `RETURN_RECEIVED`, `STATUS_SENT_BY_ACCIDENT`,
`CANCEL_REQUEST_BY_CUSTOMER`, `REFUND_AFTER_AFFIDAVIT`, `COMPLAINT`,
`SHIPMENT_LOST`, `RETURN_LOST`, `UNDELIVERABLE`. `condition` (A to E) is
optional.

Reject: `POST /v3/returns/rejection` with the same shape. `reason` is
required: `THIRD_PARTY_ITEM`, `WRONG_ITEM`, `EXCHANGE`,
`DAMAGE_TO_THE_HYGIENE_SEAL`, `ITEM_DAMAGED`, `RETURN_PERIOD_EXCEEDED`,
`ITEM_NOT_IN_THE_PARCEL`.

Return addresses and carriers are managed under `/v2/returns-warehouse/...`;
see `search`.
