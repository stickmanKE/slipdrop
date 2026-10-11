# Contributing to SlipDrop

Thanks for helping improve SlipDrop.

## Development setup

Requirements: Node.js 18 or newer and npm.

```bash
git clone https://github.com/stickmanKE/slipdrop.git
cd slipdrop
npm install
npm run build
npm test
```

Edit `src/slipdrop.js` and `src/slipdrop.css`; `npm run build` regenerates the committed files in `dist/`. Do not edit only the generated bundle.

## Pull requests

- Describe the user-facing change and why it is needed.
- Keep the library framework-independent and free of runtime dependencies.
- Preserve accessibility, keyboard behavior, safe text rendering, and `prefers-reduced-motion` support.
- Test the demo and run `npm test` before opening a PR.
- Do not include secrets, real customer data, or proprietary third-party code.
