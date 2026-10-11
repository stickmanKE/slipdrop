// Zero-dependency build: inlines src/slipdrop.css into the JS bundle so
// dist/slipdrop.js is a single self-contained file, and copies the CSS
// out separately for projects with a strict style-src CSP.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'src/slipdrop.css'), 'utf8');
const js = fs.readFileSync(path.join(root, 'src/slipdrop.js'), 'utf8');

const marker = "/*__CSS__*/''";
if (!js.includes(marker)) throw new Error('CSS marker not found in src/slipdrop.js');

fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist/slipdrop.js'), js.replace(marker, JSON.stringify(css)));
fs.writeFileSync(path.join(root, 'dist/slipdrop.css'), css);
console.log('Built dist/slipdrop.js and dist/slipdrop.css');
