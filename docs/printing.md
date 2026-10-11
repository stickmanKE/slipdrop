# Printing with SlipDrop

SlipDrop sends the receipt to the browser's print system through a hidden frame. That part is easy. Making the printer behave like a till printer (no dialog, right paper size, no wasted paper) depends on how the browser and printer are set up.

## Why the dialog appears

Web pages are not allowed to talk to printers directly, so the browser shows its print dialog for every job. There are three ways to deal with that.

### Option 1: Chrome kiosk printing (simplest)

Best when the till runs on one dedicated computer.

1. Install the printer's driver and set it as the **default printer** in the operating system.
2. Start Chrome with the `--kiosk-printing` flag. On Windows, edit the shortcut's Target:

   ```
   "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk-printing http://localhost:8000
   ```

   Close every Chrome window before launching from the new shortcut, or the flag is ignored.
3. Print jobs now go straight to the default printer with no dialog.

Edge accepts the same flag. Because it prints without asking, only use it on a till browser, not on a machine you browse the web with.

### Option 2: QZ Tray

Best when you need several printers, raw receipt-printer commands, or a cash drawer to open. [QZ Tray](https://qz.io) is a small desktop app your page talks to. SlipDrop does not depend on it; use `handle.receipt` (the receipt element) as the source for whatever QZ Tray needs, and set `print: 'none'` so SlipDrop only does the animation.

### Option 3: A local print agent

A small service on the till computer (for example a Python or Node app listening on `localhost`) that receives the sale ID and prints it. This gives the most control and one more thing to maintain. Use `print: 'none'` and call your agent from `onReady`.

## Paper size

Set the roll size in the **printer driver preferences** (for example “80 mm x Receipt” or the driver's equivalent). Browsers cannot reliably set this for thermal printers.

SlipDrop sets the page margin to zero and the receipt width to match `paper` (`'58mm'` or `'80mm'`). If text is cut off at the edges, the printer's printable width is probably a little narrower than the paper. Try a custom width such as `paper: '72mm'` on an 80 mm roll.

## Copies

`copies: 2` prints two pages in one job. The printer cuts after each page if its driver is set to cut per page. Use `copyLabels: [null, 'SHOP COPY']` to mark the second copy so it is obvious which one the business keeps.

## When it does not print

SlipDrop shows “Couldn't reach the printer…” if the browser refuses to start the job. Browsers do not report whether paper actually came out, so a jam or an empty roll will not trigger this message. The toast keeps a **Print again** button for that reason.

Checklist:

- The printer is on, connected, and has paper.
- It is the default printer (kiosk printing only uses the default).
- Chrome was launched with `--kiosk-printing` from a fresh start.
- Pop-up and print permissions are not blocked for the site.

## Turning printing off

```js
SlipDrop.show({ receipt, print: 'manual' }); // waits for “Print again”
SlipDrop.show({ receipt, print: 'none' });   // never prints by itself
```

## Long receipts

If the receipt is taller than the screen, the toast caps its height and the paper becomes scrollable once it has finished feeding. Printing always uses the full receipt.
