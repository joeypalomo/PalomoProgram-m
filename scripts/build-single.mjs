// Bundles the app into one self-contained HTML file (dist/PalomoProgram.html).
// ES module imports are flattened by concatenating modules in dependency order with exports rewritten.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const root = resolve(dirname(new URL(import.meta.url).pathname), '..');
const read = (p) => readFileSync(resolve(root, p), 'utf8');

// Dependency order (leaves first).
const order = ['js/data/guide.js', 'js/ui.js', 'js/logo.js', 'js/store.js', 'js/sheets.js', 'js/views/today.js', 'js/views/train.js', 'js/views/respond.js', 'js/views/pets.js', 'js/views/review.js', 'js/app.js'];

function flatten(src) {
  return src
    .replace(/^import\s+[^;]*?from\s+['"][^'"]+['"];?\s*$/gm, '')
    .replace(/^export\s+(const|let|function|class)\s+/gm, '$1 ')
    .replace(/^export\s+\{[^}]*\};?\s*$/gm, '');
}

const js = order.map((f) => `// ---- ${f} ----\n${flatten(read(f))}`).join('\n\n');
const css = read('css/app.css');
const logoSvg = read('assets/logo.svg');
const html = read('index.html')
  .replace(/<link rel="manifest"[^>]*>\s*/g, '')
  .replace(/<link rel="icon"[^>]*>/, `<link rel="icon" href="data:image/svg+xml;utf8,${encodeURIComponent(logoSvg)}">`)
  .replace(/<link rel="apple-touch-icon"[^>]*>\s*/g, '')
  .replace(/<link rel="stylesheet" href="\.\/css\/app\.css">/, `<style>\n${css}\n</style>`)
  .replace(/<script type="module" src="\.\/js\/app\.js"><\/script>/, `<script type="module">\n${js}\n</script>`);

mkdirSync(resolve(root, 'dist'), { recursive: true });
writeFileSync(resolve(root, 'dist/PalomoProgram.html'), html);
console.log(`dist/PalomoProgram.html written (${Math.round(html.length / 1024)} KB)`);
