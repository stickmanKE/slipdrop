/*!
 * SlipDrop — a receipt toast for POS and receipting web apps.
 * A status banner drops in, the receipt feeds out of it like paper from a
 * printer, and the receipt is sent to your printer.
 * Copyright (c) 2026 Mark Mgharo. MIT License.
 * https://github.com/stickmanKE/slipdrop
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(root);
  else root.SlipDrop = factory(root);
})(typeof self !== 'undefined' ? self : this, function (root) {
  'use strict';

  // Replaced with the contents of src/slipdrop.css by `npm run build`.
  var CSS = "/* SlipDrop — receipt toast. Theme it by overriding the --sd-* variables\n   on :root (or any ancestor of the toast). Everything else is scoped to\n   .sd-* classes so it will not leak into your app. */\n\n.sd-toast {\n  --_slot: var(--sd-slot, #1c2026);\n  --_slot-edge: var(--sd-slot-edge, #323a44);\n  --_text: var(--sd-text, #eef1f4);\n  --_muted: var(--sd-muted, #9aa4b0);\n  --_busy: var(--sd-led-busy, #ffb020);\n  --_ready: var(--sd-led-ready, #3ddc97);\n  --_error: var(--sd-led-error, #ff6b5b);\n  --_font-ui: var(--sd-font-ui, system-ui, -apple-system, \"Segoe UI\", Roboto, sans-serif);\n  --_led: var(--_busy);\n\n  position: fixed;\n  top: max(12px, env(safe-area-inset-top));\n  left: 50%;\n  z-index: var(--sd-z, 2147483000);\n  width: min(var(--sd-toast-width, 360px), calc(100vw - 24px));\n  box-sizing: border-box;\n  font-family: var(--_font-ui);\n  color: var(--_text);\n  opacity: 0;\n  transform: translate(-50%, -140%);\n  transition: transform 460ms cubic-bezier(0.16, 1, 0.3, 1), opacity 260ms ease;\n  pointer-events: none;\n}\n.sd-toast.sd-pos-top-right { left: auto; right: 12px; transform: translate(0, -140%); }\n.sd-toast.sd-in { opacity: 1; transform: translate(-50%, 0); pointer-events: auto; }\n.sd-toast.sd-pos-top-right.sd-in { transform: translate(0, 0); }\n.sd-toast.sd-busy { --_led: var(--_busy); }\n.sd-toast.sd-ready { --_led: var(--_ready); }\n.sd-toast.sd-error { --_led: var(--_error); }\n\n/* The slot: the printer mouth the paper comes out of */\n.sd-slot {\n  position: relative;\n  z-index: 2;\n  background: var(--_slot);\n  border-radius: 14px 14px 5px 5px;\n  padding: 12px 14px 0;\n  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.07);\n}\n/* Premium feed: keep the printer housing steady while the paper emerges. */\n.sd-feeding .sd-slot { box-shadow: 0 10px 28px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.07); }\n.sd-head { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 10px; }\n.sd-led {\n  width: 9px; height: 9px; border-radius: 50%;\n  background: var(--_led);\n  box-shadow: 0 0 0 3px color-mix(in srgb, var(--_led) 22%, transparent);\n}\n.sd-busy .sd-led { animation: sd-blink 900ms steps(1, end) infinite; }\n@keyframes sd-blink { 50% { opacity: 0.35; } }\n.sd-title { font-size: 14px; font-weight: 600; line-height: 1.25; }\n.sd-detail { font-size: 12px; line-height: 1.3; color: var(--_muted); }\n.sd-amount { font-size: 18px; font-weight: 650; line-height: 1; font-variant-numeric: tabular-nums; white-space: nowrap; }\n.sd-status { margin-top: 8px; font-size: 12px; line-height: 1.35; color: var(--_muted); min-height: 16px; transition: color 220ms ease; }\n.sd-error .sd-status { color: var(--_error); }\n\n.sd-actions-wrap { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 360ms cubic-bezier(0.22, 1, 0.36, 1); }\n.sd-ready .sd-actions-wrap,\n.sd-error .sd-actions-wrap { grid-template-rows: 1fr; }\n.sd-actions-clip { overflow: hidden; min-height: 0; }\n.sd-actions { display: flex; gap: 8px; padding-top: 10px; }\n.sd-btn {\n  flex: 1 1 0;\n  min-height: 38px;\n  padding: 0 14px;\n  font: 600 13px/1 var(--_font-ui);\n  color: var(--_text);\n  background: transparent;\n  border: 1px solid var(--_slot-edge);\n  border-radius: 9px;\n  cursor: pointer;\n}\n.sd-btn:hover { background: rgba(255, 255, 255, 0.07); }\n.sd-btn:focus-visible { outline: 2px solid var(--_ready); outline-offset: 2px; }\n.sd-btn-primary { background: var(--_text); color: var(--_slot); border-color: transparent; }\n.sd-btn-primary:hover { background: color-mix(in srgb, var(--_text) 88%, transparent); }\n\n/* Progress doubles as the mouth of the slot */\n.sd-bar { height: 3px; margin: 12px -14px 0; background: rgba(0, 0, 0, 0.45); border-radius: 0 0 5px 5px; overflow: hidden; }\n.sd-bar > i { display: block; height: 100%; background: var(--_led); transform-origin: left center; transform: scaleX(0); }\n\n/* The paper feed */\n.sd-feed {\n  position: relative;\n  z-index: 1;\n  width: var(--sd-paper-width, 302px);\n  max-width: 100%;\n  margin: 0 auto;\n  height: 0;\n  overflow: hidden;\n  clip-path: inset(0 -28px -28px -28px);\n}\n.sd-feed.sd-scroll { overflow-x: hidden; overflow-y: auto; clip-path: none; overscroll-behavior: contain; }\n.sd-paper {\n  /* The paper is stationary; the feed window below the slot reveals it. */\n  transform: translate3d(0, 0, 0);\n  transform-origin: top center;\n  filter: drop-shadow(0 8px 10px rgba(0, 0, 0, 0.16));\n}\n/* torn edge */\n.sd-paper::after {\n  content: \"\";\n  display: block;\n  height: 8px;\n  margin-top: -1px;\n  background: var(--sd-paper, #fcfcf9);\n  -webkit-mask: conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) 50% / 8px 100%;\n  mask: conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) 50% / 8px 100%;\n}\n\n/* The receipt itself */\n.sd-receipt {\n  --_paper: var(--sd-paper, #fcfcf9);\n  --_ink: var(--sd-ink, #1a1c1f);\n  --_ink-soft: var(--sd-ink-soft, #5b6168);\n  --_font-receipt: var(--sd-font-receipt, ui-monospace, \"SF Mono\", \"Cascadia Mono\", Consolas, \"Liberation Mono\", monospace);\n  box-sizing: border-box;\n  width: 100%;\n  padding: 14px 14px 8px;\n  background: var(--_paper);\n  color: var(--_ink);\n  font: 12px/1.45 var(--_font-receipt);\n  text-align: left;\n}\n.sd-r-badge { margin: 0 0 10px; padding: 3px 0; border: 1px solid var(--_ink); text-align: center; font-weight: 700; letter-spacing: 0.12em; }\n.sd-r-name { text-align: center; font-size: 14px; font-weight: 700; letter-spacing: 0.02em; }\n.sd-r-center { text-align: center; }\n.sd-r-rule { margin: 9px 0; border: 0; border-top: 1px dashed var(--_ink-soft); }\n.sd-r-row { display: flex; justify-content: space-between; gap: 12px; }\n.sd-r-row > span:last-child { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }\n.sd-r-item { margin-bottom: 5px; }\n.sd-r-item-name { overflow-wrap: anywhere; }\n.sd-r-item .sd-r-row { color: var(--_ink-soft); }\n.sd-r-strong { font-size: 13px; font-weight: 700; color: var(--_ink) !important; }\n.sd-r-note { font-size: 11px; color: var(--_ink-soft); }\n.sd-r-foot { text-align: center; font-size: 11px; color: var(--_ink-soft); }\n.sd-r-barcode { display: flex; flex-direction: column; align-items: center; gap: 3px; margin-top: 10px; }\n.sd-r-barcode svg { max-width: 100%; height: auto; }\n\n@media (prefers-reduced-motion: reduce) {\n  .sd-toast { transition: opacity 120ms ease; }\n  .sd-paper { will-change: auto; }\n  .sd-feeding .sd-slot { animation: none; }\n  .sd-busy .sd-led { animation: none; }\n  .sd-actions-wrap { transition: none; }\n}\n";

  var STYLE_ID = 'slipdrop-styles';
  var PAPER_WIDTHS = { '58mm': '219px', '80mm': '302px' };
  var ENTER_MS = 380;

  var config = { injectStyles: true };
  var current = null;

  var TEXT = {
    preparing: 'Preparing the receipt…',
    printing: 'Printing the receipt…',
    printed: 'Sent to printer',
    ready: 'Receipt ready',
    printError: 'Couldn’t reach the printer. Check it is on and has paper, then print again.',
    printAgain: 'Print again',
    done: 'Done'
  };

  var DEFAULTS = {
    receipt: null,          // Element | HTML string | buildReceipt() options
    title: 'Sale complete',
    amount: '',             // already formatted, e.g. "KES 1,550.00"
    detail: '',             // e.g. "3 items · Cash"
    container: null,        // defaults to document.body
    position: 'top-center', // 'top-center' | 'top-right'
    paper: '80mm',          // '58mm' | '80mm' | any CSS length
    feedDuration: 2100,     // ms the paper continuously scrolls out
    print: 'auto',          // 'auto' | 'manual' | 'none'
    printAt: 'start',       // 'start' (printer runs alongside animation) | 'end'
    printDelay: 300,        // ms after the feed starts, when printAt is 'start'
    copies: 1,              // printed in one job, one page per copy
    copyLabels: [],         // e.g. [null, 'DUPLICATE'] stamps copy 2
    autoClose: 0,           // ms after ready; 0 keeps it until dismissed
    actions: null,          // [{ label, action: 'print'|'close', onClick, primary }]
    text: {},               // override any string in TEXT
    onReady: null,
    onPrint: null,
    onClose: null
  };

  /* ---------- helpers ---------- */

  function h(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function injectStyles(doc) {
    if (!config.injectStyles || !CSS) return;
    doc = doc || document;
    if (doc.getElementById(STYLE_ID)) return;
    var s = doc.createElement('style');
    s.id = STYLE_ID;
    s.textContent = CSS;
    doc.head.appendChild(s);
  }

  function clamp(n, lo, hi) { return Math.min(hi, Math.max(lo, n)); }

  function prefersReducedMotion() {
    return !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function paperWidth(paper) { return PAPER_WIDTHS[paper] || paper || PAPER_WIDTHS['80mm']; }

  /* ---------- receipt builder ---------- */

  function row(label, value, strong) {
    var n = h('div', 'sd-r-row' + (strong ? ' sd-r-strong' : ''));
    n.appendChild(h('span', null, label));
    n.appendChild(h('span', null, value));
    return n;
  }

  function rule() { return h('hr', 'sd-r-rule'); }

  function renderBarcode(target, barcode, caption) {
    var box = h('div', 'sd-r-barcode');
    if (typeof barcode === 'function') {
      barcode(box);
    } else if (barcode && barcode.nodeType === 1) {
      box.appendChild(barcode.cloneNode(true));
    } else if (typeof barcode === 'string') {
      if (typeof root.JsBarcode === 'function') {
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        box.appendChild(svg);
        root.JsBarcode(svg, barcode, { format: 'CODE128', displayValue: false, height: 36, margin: 0, width: 1.6 });
      }
      if (!caption) caption = barcode;
    }
    if (caption) box.appendChild(h('div', 'sd-r-note', caption));
    target.appendChild(box);
  }

  /**
   * Build a receipt element from plain data. Every value is inserted as
   * text, never as HTML, so it is safe to pass customer-supplied strings.
   * Format money yourself (currency, decimals) before passing it in.
   */
  function buildReceipt(d) {
    d = d || {};
    var r = h('div', 'sd-receipt');
    if (d.badge) r.appendChild(h('div', 'sd-r-badge', d.badge));

    var b = d.business || {};
    if (b.name) r.appendChild(h('div', 'sd-r-name', b.name));
    (b.lines || []).forEach(function (l) { r.appendChild(h('div', 'sd-r-center', l)); });

    if (d.meta && d.meta.length) {
      r.appendChild(rule());
      d.meta.forEach(function (m) { r.appendChild(row(m.label, m.value)); });
    }

    if (d.items && d.items.length) {
      r.appendChild(rule());
      d.items.forEach(function (it) {
        var wrap = h('div', 'sd-r-item');
        wrap.appendChild(h('div', 'sd-r-item-name', it.name));
        var detail = it.detail;
        if (detail == null) {
          detail = it.qty != null && it.unit != null ? it.qty + ' × ' + it.unit : (it.qty != null ? String(it.qty) : '');
        }
        wrap.appendChild(row(detail, it.total));
        if (it.note) wrap.appendChild(h('div', 'sd-r-note', it.note));
        r.appendChild(wrap);
      });
    }

    if (d.totals && d.totals.length) {
      r.appendChild(rule());
      d.totals.forEach(function (t) { r.appendChild(row(t.label, t.value, t.strong)); });
    }

    if (d.payments && d.payments.length) {
      r.appendChild(rule());
      d.payments.forEach(function (p) { r.appendChild(row(p.label, p.value)); });
    }

    if (d.footer && d.footer.length) {
      r.appendChild(rule());
      d.footer.forEach(function (l) { r.appendChild(h('div', 'sd-r-foot', l)); });
    }

    if (d.barcode) renderBarcode(r, d.barcode, d.barcodeCaption);
    return r;
  }

  function toReceiptNode(r) {
    var n;
    if (r && r.nodeType === 1) {
      n = r.cloneNode(true); // never move the integrator's own node
      n.removeAttribute('hidden');
      n.style.display = '';
    } else if (typeof r === 'string') {
      n = h('div');
      n.innerHTML = r; // trusted markup, e.g. server-rendered receipt HTML
    } else if (r && typeof r === 'object') {
      n = buildReceipt(r);
    } else {
      throw new Error('SlipDrop: "receipt" must be an element, an HTML string, or buildReceipt() options.');
    }
    n.classList.add('sd-receipt');
    return n;
  }

  /* ---------- printing ---------- */

  function printCss(width) {
    return '@page{margin:0}' +
      'html,body{margin:0;padding:0;background:#fff}' +
      'body{width:' + width + '}' +
      '.sd-print-copy{width:' + width + ';break-after:page;page-break-after:always}' +
      '.sd-print-copy:last-child{break-after:auto;page-break-after:auto}' +
      '.sd-receipt{width:100%;-webkit-print-color-adjust:exact;print-color-adjust:exact}';
  }

  /**
   * Print a receipt element through a hidden iframe so the host page's
   * layout never ends up on the paper. Copies go out as one print job,
   * one page each. Set the roll size in the printer driver; the browser
   * cannot reliably set it for thermal printers.
   */
  function printReceipt(node, opts) {
    opts = opts || {};
    var copies = Math.max(1, parseInt(opts.copies, 10) || 1);
    var labels = opts.copyLabels || [];
    var width = paperWidth(opts.paper);

    var iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.tabIndex = -1;
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none';
    document.body.appendChild(iframe);

    var win = iframe.contentWindow;
    var doc = iframe.contentDocument || win.document;
    doc.open();
    doc.write('<!doctype html><html><head><meta charset="utf-8"><title>Receipt</title></head><body></body></html>');
    doc.close();

    if (config.injectStyles && CSS) {
      var st = doc.createElement('style');
      st.textContent = CSS;
      doc.head.appendChild(st);
    } else {
      // Styles come from your own bundle, so bring them into the print frame.
      Array.prototype.forEach.call(document.querySelectorAll('link[rel="stylesheet"],style'), function (n) {
        doc.head.appendChild(doc.importNode(n, true));
      });
    }
    var pst = doc.createElement('style');
    pst.textContent = printCss(width);
    doc.head.appendChild(pst);

    for (var i = 0; i < copies; i++) {
      var wrap = doc.createElement('div');
      wrap.className = 'sd-print-copy';
      var clone = doc.importNode(node, true);
      if (labels[i]) {
        var badge = doc.createElement('div');
        badge.className = 'sd-r-badge';
        badge.textContent = labels[i];
        clone.insertBefore(badge, clone.firstChild);
      }
      wrap.appendChild(clone);
      doc.body.appendChild(wrap);
    }

    // win.focus() is needed for some browsers to print the frame, so hand
    // focus back afterwards (keeps barcode-scanner inputs working).
    var previous = document.activeElement;
    var cleaned = false;
    function cleanup() {
      if (cleaned) return;
      cleaned = true;
      setTimeout(function () {
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        if (previous && previous !== document.body && typeof previous.focus === 'function') previous.focus();
      }, 200);
    }
    win.addEventListener('afterprint', cleanup);
    setTimeout(cleanup, 120000);

    win.focus();
    win.print();
  }

  /* ---------- the toast ---------- */

  function show(userOpts) {
    var o = Object.assign({}, DEFAULTS, userOpts || {});
    var T = Object.assign({}, TEXT, o.text || {});
    injectStyles(document);
    if (current) current.close(true);

    var receipt = toReceiptNode(o.receipt);
    var reduce = prefersReducedMotion();
    var timers = [];
    var state = { done: false, closed: false, printed: false, error: false };
    var animations = [];

    var el = h('div', 'sd-toast sd-busy sd-pos-' + o.position);
    el.style.setProperty('--sd-paper-width', paperWidth(o.paper));

    // slot
    var slot = h('div', 'sd-slot');
    var head = h('div', 'sd-head');
    var led = h('span', 'sd-led');
    led.setAttribute('aria-hidden', 'true');
    var txt = h('div', 'sd-text');
    txt.appendChild(h('div', 'sd-title', o.title));
    if (o.detail) txt.appendChild(h('div', 'sd-detail', o.detail));
    head.appendChild(led);
    head.appendChild(txt);
    head.appendChild(h('div', 'sd-amount', o.amount));

    var status = h('div', 'sd-status');
    status.setAttribute('role', 'status');

    var actionsWrap = h('div', 'sd-actions-wrap');
    var clip = h('div', 'sd-actions-clip');
    var actionsRow = h('div', 'sd-actions');
    clip.appendChild(actionsRow);
    actionsWrap.appendChild(clip);
    actionsWrap.inert = true;

    var bar = h('div', 'sd-bar');
    var fill = h('i');
    bar.appendChild(fill);

    slot.appendChild(head);
    slot.appendChild(status);
    slot.appendChild(actionsWrap);
    slot.appendChild(bar);

    // paper
    var feed = h('div', 'sd-feed');
    var paper = h('div', 'sd-paper');
    paper.appendChild(receipt);
    feed.appendChild(paper);

    el.appendChild(slot);
    el.appendChild(feed);
    (o.container || document.body).appendChild(el);

    function setStatus(s) { status.textContent = s; }
    function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }

    // measure, then cap the feed to the viewport
    var fullH = paper.offsetHeight;
    var maxH = Math.max(160, root.innerHeight - slot.offsetHeight - 120);
    var feedH = Math.min(fullH, maxH);
    // Start closed: the receipt is anchored just below the printer slot, and
    // the viewport grows downward as the paper feeds out.
    feed.style.height = '0px';

    /* actions */
    var handle = { el: el, receipt: receipt, print: doPrint, close: close };

    var actions = o.actions || [
      { label: T.printAgain, action: 'print' },
      { label: T.done, action: 'close', primary: true }
    ];
    actions.forEach(function (a) {
      var b = h('button', 'sd-btn' + (a.primary ? ' sd-btn-primary' : ''), a.label);
      b.type = 'button';
      b.addEventListener('click', function (e) {
        if (a.action === 'print') doPrint();
        else if (a.action === 'close') close();
        if (typeof a.onClick === 'function') a.onClick(handle, e);
      });
      actionsRow.appendChild(b);
    });

    /* printing */
    function doPrint() {
      state.error = false;
      el.classList.remove('sd-error');
      if (state.done) el.classList.add('sd-ready');
      try {
        printReceipt(receipt, { copies: o.copies, copyLabels: o.copyLabels, paper: o.paper });
        state.printed = true;
        if (state.done) setStatus(T.printed);
        if (typeof o.onPrint === 'function') o.onPrint(handle);
      } catch (err) {
        state.error = true;
        el.classList.remove('sd-ready');
        el.classList.add('sd-error');
        setStatus(T.printError);
        if (root.console) root.console.error('SlipDrop: print failed', err);
      }
    }

    /* feed lifecycle */
    function finish() {
      if (state.done || state.closed) return;
      state.done = true;
      // Commit final layout before cancelling animations. The paper itself
      // stays anchored at the printer mouth; only the clipping window grows.
      feed.style.height = feedH + 'px';
      animations.forEach(function (a) { try { a.cancel(); } catch (e) { /* ignore */ } });
      el.classList.remove('sd-feeding');
      feed.style.willChange = 'auto';
      fill.style.transform = 'scaleX(1)';
      if (fullH > feedH) feed.classList.add('sd-scroll');
      actionsWrap.inert = false;
      if (!state.error) {
        el.classList.remove('sd-busy');
        el.classList.add('sd-ready');
        setStatus(state.printed ? T.printed : T.ready);
      } else {
        el.classList.remove('sd-busy');
      }
      if (o.print === 'auto' && o.printAt === 'end' && !state.printed && !state.error) doPrint();
      if (typeof o.onReady === 'function') o.onReady(handle);
      if (o.autoClose > 0) armAutoClose();
    }

    function startFeed() {
      if (state.closed) return;
      if (reduce || typeof paper.animate !== 'function') { finish(); return; }
      // Smooth Premium feed: keep the top edge of the paper anchored at the
      // slot and grow the clipped window downward. This makes the receipt
      // visibly unroll out of the printer instead of sliding as a whole sheet.
      el.classList.add('sd-feeding');
      feed.style.willChange = 'height';
      var a = feed.animate(
        [
          { height: '0px', offset: 0 },
          { height: Math.max(1, feedH * 0.58) + 'px', offset: 0.58, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
          { height: Math.max(1, feedH * 0.91) + 'px', offset: 0.88, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
          { height: feedH + 'px', offset: 1 }
        ],
        { duration: o.feedDuration, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' }
      );
      var b = fill.animate(
        [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
        { duration: o.feedDuration, easing: 'linear', fill: 'forwards' }
      );
      animations.push(a, b);
      a.finished.then(finish, function () { /* cancelled */ });
      later(finish, o.feedDuration + 150); // safety net
    }

    /* auto close, paused while the pointer is over the toast */
    var autoTimer = null;
    function armAutoClose() {
      clearTimeout(autoTimer);
      autoTimer = setTimeout(function () { close(); }, o.autoClose);
    }
    el.addEventListener('pointerenter', function () { clearTimeout(autoTimer); });
    el.addEventListener('pointerleave', function () { if (state.done && o.autoClose > 0) armAutoClose(); });

    /* close */
    function onKey(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', onKey);

    function close(immediate) {
      if (state.closed) return;
      state.closed = true;
      timers.forEach(clearTimeout);
      clearTimeout(autoTimer);
      document.removeEventListener('keydown', onKey);
      if (current === handle) current = null;
      el.classList.remove('sd-in');
      function remove() { if (el.parentNode) el.parentNode.removeChild(el); }
      if (immediate === true || reduce) remove(); else setTimeout(remove, ENTER_MS + 40);
      if (typeof o.onClose === 'function') o.onClose(handle);
    }

    /* go */
    current = handle;
    setStatus(o.print === 'none' || o.print === 'manual' ? T.preparing : T.printing);
    root.requestAnimationFrame(function () {
      root.requestAnimationFrame(function () { el.classList.add('sd-in'); });
    });
    later(startFeed, ENTER_MS);
    if (o.print === 'auto' && o.printAt === 'start') later(doPrint, ENTER_MS + o.printDelay);

    return handle;
  }

  return {
    version: '1.0.0',
    show: show,
    buildReceipt: buildReceipt,
    print: printReceipt,
    configure: function (c) { Object.assign(config, c || {}); },
    dismiss: function () { if (current) current.close(); }
  };
});
