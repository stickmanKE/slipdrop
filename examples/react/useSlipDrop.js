// useSlipDrop.js — a thin wrapper. SlipDrop is not a React component; it
// mounts itself on document.body, so there is nothing to render.
import { useCallback, useEffect } from 'react';
import SlipDrop from 'slipdrop';

export function useSlipDrop() {
  // Close the toast if the till screen unmounts mid-print.
  useEffect(() => () => SlipDrop.dismiss(), []);

  return useCallback((sale) => {
    return SlipDrop.show({
      amount: sale.amountLabel,
      detail: sale.detail,
      receipt: {
        business: sale.business,
        meta: sale.meta,
        items: sale.items,
        totals: sale.totals,
        barcode: sale.receiptNumber,
      },
    });
  }, []);
}

// Usage:
//   const showReceipt = useSlipDrop();
//   const onPay = async () => { const sale = await api.pay(cart); showReceipt(sale); };
