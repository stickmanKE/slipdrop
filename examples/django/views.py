# views.py — returns the finished sale plus the receipt as server-rendered HTML.
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from django.views.decorators.http import require_POST

from .models import Sale  # your model


@require_POST
def complete_sale(request, sale_id):
    sale = get_object_or_404(Sale, pk=sale_id)
    # ... take payment, update stock, mark the sale as paid ...

    receipt_html = render_to_string("sales/receipt_partial.html", {"sale": sale}, request=request)
    return JsonResponse({
        "ok": True,
        "amount": f"KES {sale.total:,.2f}",
        "detail": f"{sale.items.count()} items · {sale.get_payment_method_display()}",
        "receipt_html": receipt_html,
    })
