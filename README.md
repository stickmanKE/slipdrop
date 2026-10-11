# SlipDrop

**Created and maintained by [Mark Mgharo](https://github.com/stickmanKE).**

[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Vanilla JavaScript](https://img.shields.io/badge/JavaScript-vanilla-f1e05a.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![No runtime dependencies](https://img.shields.io/badge/runtime%20dependencies-none-brightgreen.svg)](#features)

A receipt toast for POS and receipting web apps. When a sale completes, a status banner drops in, the receipt feeds out of it like paper from a thermal printer, and the receipt is sent to your printer.

- Plain JavaScript and CSS. No dependencies, no framework.
- Works in Django templates, Laravel, Rails, React, or a static page.
- Builds the receipt from data (safe against HTML injection) or accepts your own server-rendered HTML.
- Prints through a hidden frame, so your page layout never ends up on the paper. Supports 58 mm and 80 mm rolls and multiple copies in one job.
- Respects `prefers-reduced-motion`, closes with Esc, and never steals keyboard focus (barcode scanners keep working).

[Live demo](https://stickmanKE.github.io/slipdrop/demo/) · [Printing guide](docs/printing.md) · [Report a bug](https://github.com/stickmanKE/slipdrop/issues)

## Features

- Smooth premium toast entrance and receipt paper that reveals downward from the printer slot.
- Data-driven receipt layout, status states, print-again action, and multiple copies.
- 58 mm and 80 mm receipt widths, plus custom CSS widths.
- Vanilla JavaScript and CSS; no runtime framework or dependency required.
- Scoped CSS variables for theming, reduced-motion support, keyboard dismissal, and safe text rendering for structured receipt data.
- Integration examples for Django and React, plus guidance for browser printing.

## Install

**Copy the file.** Take `dist/slipdrop.js`. It carries its own styles.

```html
<script src="slipdrop.js"></script>
```

**From a CDN** (once the repo is public):

```html
<script src="https://cdn.jsdelivr.net/gh/stickmanKE/slipdrop@v1.0.0/dist/slipdrop.js"></script>
```

**With npm:**

```bash
npm install github:stickmanKE/slipdrop
```

```js
const SlipDrop = require('slipdrop'); // or: import SlipDrop from 'slipdrop'
```

If your site sets a strict `style-src` Content-Security-Policy, link `dist/slipdrop.css` yourself and turn off style injection:

```js
SlipDrop.configure({ injectStyles: false });
```

## Quick start

```js
SlipDrop.show({
  amount: 'KES 1,550.00',
  detail: '3 items · Cash',
  receipt: {
    business: { name: 'Corner Stationers', lines: ['Moi Avenue, Mombasa'] },
    meta: [{ label: 'Receipt', value: 'RCT-004182' }],
    items: [
      { name: 'Notebook A5', qty: 2, unit: '250.00', total: '500.00' },
      { name: 'Desk lamp',   qty: 1, unit: '600.00', total: '600.00' }
    ],
    totals: [{ label: 'TOTAL (KES)', value: '1,100.00', strong: true }],
    footer: ['Thank you for shopping with us'],
    barcode: 'RCT-004182'
  }
});
```

Call it from the success handler of your checkout request. Format currency yourself before passing it in.

## Receipt content

`receipt` accepts any of these:

| Value | Use it when |
| --- | --- |
| An options object (above) | You want SlipDrop to lay the receipt out. Every value is inserted as text, never HTML. |
| An HTML string | Your server already renders the receipt, e.g. a Django partial. Only pass markup you trust. |
| A DOM element | You have a receipt node on the page. It is cloned, so your original is untouched. |

### `buildReceipt` options

| Key | Shape |
| --- | --- |
| `badge` | String stamped at the top, e.g. `'DUPLICATE'` |
| `business` | `{ name, lines: [] }`. Put tax details in `lines`, e.g. `'KRA PIN: P000000000X'` |
| `meta` | `[{ label, value }]` such as receipt number, date, cashier |
| `items` | `[{ name, qty, unit, total, detail?, note? }]` |
| `totals` | `[{ label, value, strong? }]` such as subtotal, VAT, total |
| `payments` | `[{ label, value }]` such as cash tendered and change |
| `footer` | `[string]` |
| `barcode` | A string (drawn with [JsBarcode](https://github.com/lindell/JsBarcode) if it is on the page, otherwise shown as text), a DOM element, or `function (container) {}` |
| `barcodeCaption` | Text under the barcode |

You can also call `SlipDrop.buildReceipt(options)` on its own to get the element.

## Options for `SlipDrop.show`

| Option | Default | Notes |
| --- | --- | --- |
| `receipt` | required | See above |
| `title` | `'Sale complete'` | |
| `amount` | `''` | Shown large on the right |
| `detail` | `''` | Small line under the title |
| `paper` | `'80mm'` | `'58mm'`, `'80mm'`, or any CSS length |
| `position` | `'top-center'` | or `'top-right'` |
| `feedDuration` | `2400` | Milliseconds for the paper to feed out |
| `print` | `'auto'` | `'auto'` prints; `'manual'` waits for “Print again”; `'none'` never prints on its own |
| `printAt` | `'start'` | `'start'` runs the printer alongside the animation; `'end'` waits for it to finish |
| `printDelay` | `300` | Milliseconds after the feed begins, when `printAt` is `'start'` |
| `copies` | `1` | One page per copy, sent as a single job |
| `copyLabels` | `[]` | Stamp copies, e.g. `[null, 'SHOP COPY']` |
| `autoClose` | `0` | Milliseconds after ready. `0` keeps it open until dismissed. Pauses on hover |
| `actions` | Print again, Done | `[{ label, action: 'print' \| 'close', onClick(handle, event), primary }]` |
| `text` | | Override any string: `preparing`, `printing`, `printed`, `ready`, `printError`, `printAgain`, `done` |
| `container` | `document.body` | |
| `onReady`, `onPrint`, `onClose` | | Each receives the handle |

`show` returns a handle: `{ el, receipt, print(), close() }`. Only one toast shows at a time; a new one replaces the old.

Add your own button, for example to start the next sale:

```js
SlipDrop.show({
  receipt: myReceipt,
  actions: [
    { label: 'Print again', action: 'print' },
    { label: 'New sale', action: 'close', primary: true, onClick: () => startNewSale() }
  ]
});
```

### Other methods

- `SlipDrop.print(element, { copies, copyLabels, paper })` prints a receipt element without showing the toast.
- `SlipDrop.dismiss()` closes the current toast.
- `SlipDrop.configure({ injectStyles })`.

## Theming

Override these variables on `:root` or any ancestor:

```css
:root {
  --sd-slot: #1c2026;        /* banner background */
  --sd-text: #eef1f4;
  --sd-muted: #9aa4b0;
  --sd-led-busy: #ffb020;
  --sd-led-ready: #3ddc97;
  --sd-led-error: #ff6b5b;
  --sd-paper: #fcfcf9;       /* receipt paper */
  --sd-ink: #1a1c1f;
  --sd-ink-soft: #5b6168;
  --sd-font-ui: system-ui, sans-serif;
  --sd-font-receipt: ui-monospace, Consolas, monospace;
  --sd-toast-width: 360px;
  --sd-z: 2147483000;
}
```

## Printing

Browsers show a print dialog every time unless you set them up otherwise. For a till that prints silently, read the [printing guide](docs/printing.md). It covers Chrome kiosk printing, QZ Tray, setting the roll size, and what to do when the paper is long.

## Examples

- [`demo/index.html`](demo/index.html): the live demo.
- [`examples/django`](examples/django): a Django view that renders the receipt as a partial, and the checkout JavaScript that shows the toast.
- [`examples/react`](examples/react): a small hook.

## Develop

```bash
npm install
npm run build   # src/ -> dist/
npm test        # runs the jsdom smoke tests
```

Edit `src/slipdrop.js` and `src/slipdrop.css`, then build. `dist/` is committed so people can copy a single file.

## Browser support

Current Chrome, Edge, Firefox, and Safari. The paper's torn edge uses a CSS mask and `color-mix()`, so very old browsers lose that detail but everything else works.

## Author and license

SlipDrop is maintained by **Mark Mgharo**. The original SlipDrop source, documentation, and examples in this repository are released under the [MIT License](LICENSE), copyright © 2026 Mark Mgharo.

The projects listed below were used as public design/technical references for thermal-paper animation and receipt printing. They remain the property of their respective authors; this repository does not claim ownership of their projects or licenses, and their code should not be copied into SlipDrop without checking the applicable license first:

- [intframe/thermal-receipt](https://github.com/intframe/thermal-receipt) — scroll-driven thermal receipt animation for React (MIT).
- [aqkprogrammer/receipt-printer](https://github.com/aqkprogrammer/receipt-printer) — vanilla HTML/CSS/JavaScript checkout and tear-off demo.
- [parzibyte/print-receipt-thermal-printer](https://github.com/parzibyte/print-receipt-thermal-printer) — HTML/CSS/JavaScript receipt printing example (GPL-3.0).

## Contributing

Issues and pull requests are welcome. Please include clear reproduction steps for bugs and test the demo in a current browser. See [CONTRIBUTING.md](CONTRIBUTING.md).


### Receipt feed animation

SlipDrop keeps the receipt anchored at the printer mouth and animates the feed window downward with a smooth easing curve. This reveals the receipt from top to bottom, instead of translating the whole sheet into place. Reduced-motion preferences skip the animation and show the completed receipt.
