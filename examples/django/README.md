# Django example

1. Copy `dist/slipdrop.js` into `static/js/`, and load it in your POS template before `checkout.js`.
2. Add `receipt_partial.html` to `templates/sales/` and adjust the field names to your models.
3. Add the view from `views.py` and a URL such as `path("sales/<int:sale_id>/complete/", views.complete_sale)`.
4. Call `completeSale(saleId)` from your Pay button.

The partial reuses SlipDrop's receipt classes (`sd-r-*`), so the toast and the printed page share one layout. Django auto-escapes the values, so the HTML string is safe to pass as `receipt`.

For silent printing on the till computer, see [`docs/printing.md`](../../docs/printing.md).
