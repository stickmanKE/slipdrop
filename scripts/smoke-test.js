// Smoke test: runs the built bundle in jsdom and checks the main paths.
// Requires jsdom (devDependency). Run with: npm install && npm test
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const src = fs.readFileSync(path.join(__dirname, '../dist/slipdrop.js'), 'utf8');
const vc = new VirtualConsole(); // swallow jsdom's "window.print not implemented"
const dom = new JSDOM('<!doctype html><body></body>', { runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: vc });
const { window } = dom;
window.eval(src);
const SD = window.SlipDrop;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  // 1. buildReceipt inserts text, never HTML
  const r = SD.buildReceipt({
    business: { name: '<img src=x onerror=alert(1)>', lines: ['Mombasa'] },
    items: [{ name: 'Wash & fold', qty: 2, unit: '200.00', total: '400.00' }],
    totals: [{ label: 'TOTAL', value: '400.00', strong: true }],
    barcode: 'RCT-0001'
  });
  assert.strictEqual(r.querySelector('img'), null, 'HTML must be escaped');
  assert.ok(r.textContent.includes('2 × 200.00'));
  assert.ok(r.querySelector('.sd-r-strong'));
  console.log('ok  buildReceipt escapes HTML and renders rows');

  // 2. show() mounts, becomes ready, closes
  let ready = false, closed = false;
  const t = SD.show({
    amount: 'KES 400.00', detail: '1 item · Cash',
    receipt: r, print: 'manual',
    onReady: () => { ready = true; }, onClose: () => { closed = true; }
  });
  assert.ok(window.document.querySelector('.sd-toast'));
  assert.ok(window.document.getElementById('slipdrop-styles'), 'styles injected');
  await sleep(800);
  assert.ok(ready, 'onReady fired');
  assert.ok(t.el.classList.contains('sd-ready'));
  assert.strictEqual(t.el.querySelector('.sd-status').textContent, 'Receipt ready');
  t.close(true);
  assert.ok(closed);
  assert.strictEqual(window.document.querySelector('.sd-toast'), null);
  console.log('ok  show() mounts, reaches ready, closes');

  // 3. only one toast at a time
  SD.show({ receipt: '<p>a</p>', print: 'none' });
  SD.show({ receipt: '<p>b</p>', print: 'none' });
  assert.strictEqual(window.document.querySelectorAll('.sd-toast').length, 1);
  SD.dismiss();
  console.log('ok  a new toast replaces the old one');

  // 4. print() with copies builds one page per copy, with labels
  let frame;
  const origAppend = window.document.body.appendChild.bind(window.document.body);
  window.document.body.appendChild = (n) => { if (n.tagName === 'IFRAME') frame = n; return origAppend(n); };
  SD.print(r, { copies: 2, copyLabels: [null, 'DUPLICATE'], paper: '58mm' });
  const pages = frame.contentDocument.querySelectorAll('.sd-print-copy');
  assert.strictEqual(pages.length, 2);
  assert.ok(!pages[0].textContent.includes('DUPLICATE'));
  assert.ok(pages[1].textContent.includes('DUPLICATE'));
  console.log('ok  print() makes one page per copy and labels the duplicate');

  // 5. bad input fails loudly
  assert.throws(() => SD.show({}), /receipt/);
  console.log('ok  missing receipt throws a clear error');

  console.log('\nAll smoke tests passed.');
  window.close();
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
