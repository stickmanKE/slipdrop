// static/js/checkout.js — plain JavaScript, no framework.
// Assumes slipdrop.js is loaded before this file and a CSRF token is in the page.

function csrfToken() {
  return document.querySelector('[name=csrfmiddlewaretoken]').value;
}

async function completeSale(saleId) {
  const res = await fetch(`/sales/${saleId}/complete/`, {
    method: 'POST',
    headers: { 'X-CSRFToken': csrfToken() },
  });
  if (!res.ok) {
    alert('The sale could not be completed. Check the connection and try again.');
    return;
  }
  const data = await res.json();

  SlipDrop.show({
    amount: data.amount,
    detail: data.detail,
    receipt: data.receipt_html,        // server-rendered, trusted markup
    paper: '80mm',
    copies: 2,                         // customer + business copy, one print job
    copyLabels: [null, 'BUSINESS COPY'],
    actions: [
      { label: 'Print again', action: 'print' },
      { label: 'New sale', action: 'close', primary: true, onClick: () => window.location.assign('/pos/') },
    ],
  });
}
