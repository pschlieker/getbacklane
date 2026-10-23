# Home24 product data

Home24-specific notes for the `mirakl-product-data` skill. PM11 and VL11 are
the source of truth; check them before relying on this list.

## Always-required base fields

| Attribute code | What it holds |
|---|---|
| `categoryMerchant` | H11 hierarchy code, e.g. `Dining tables`. Missing → error 1004. |
| `productIDMerchant` | Seller SKU |
| `ean13` | EAN |
| `productNameMerchant_de` | Short German product name. Home24 also fills `title` from it. |
| `brand` | VL11 code of the brand, not the label |
| `color` | VL11 code, e.g. `white` |
| `material` | VL11 code, e.g. `engineeredWood` |
| `mediaMainImage` | Main product image URL |
| `shippingCondition` | VL11 code, e.g. `disassembled` |
| `hasElectricItem` | `yes` / `no` |
| `weight` | Net weight without packaging, kg, 2 decimals |
| `width`, `depth`, `height` | Whole centimeters |
| `nameOfManufacturer` | GPSR: manufacturer name |
| `postalAddressOfManufacturer` | GPSR: manufacturer postal address |
| `eMailAddressOrURLOfManufacturer` | GPSR: manufacturer email or website |

Plus the category-specific requirements PM11 lists.

## Fields that are easy to drop

A full record usually also has a description, more images
(`mediaDetails01…`, `mediaMood01…`), care notes, series, room type and
category fields such as table-top material or extendable size. Include every
one the user has data for. Leaving them out deletes them.

## Mapping hints

| Home24 field | Typical source in the seller's data |
|---|---|
| `weight` | Net item weight without packaging (not the shipping weight) |
| `width` / `depth` / `height` | Product dimensions. For extendable tables, use the closed size. |
| `nameOfManufacturer` | Manufacturer name. Product data often has no address: see GPSR in the skill. |
| `brand` | Brand. It is often not the company name of the seller or manufacturer. |
| `color` | Main color |
| `material` | Main material or material composition |
| `shippingCondition` | Delivery state, e.g. flat-packed → `disassembled` |
| `hasElectricItem` | Rarely in product data. Infer only when clearly non-electric, and tell the user. |
| `mediaMainImage` | The first product (perspective) image, not a mood image |
