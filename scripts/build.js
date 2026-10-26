// Scan prototypes/*.html -> dist/ + manifest.json. Dependency-free.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const srcDir = path.join(root, 'prototypes');
const dist = path.join(root, 'dist');
const RESERVED = ['index', 'manifest'];

function fail(msg) {
  console.error(`build error: ${msg}`);
  process.exit(1);
}

const meta = (html, name) => {
  const m = html.match(new RegExp(`<meta\\s+name=["']proto:${name}["']\\s+content=["']([^"']*)["']`, 'i'));
  return m ? m[1].trim() : '';
};

const files = fs.existsSync(srcDir) ? fs.readdirSync(srcDir).filter((f) => f.endsWith('.html')) : [];
if (!files.length) fail('no prototypes/*.html found');

const seen = new Set();
const items = files.map((file) => {
  const slug = file.slice(0, -'.html'.length);
  if (RESERVED.includes(slug)) fail(`slug "${slug}" is reserved (${RESERVED.join(', ')})`);
  if (seen.has(slug)) fail(`duplicate slug "${slug}"`);
  seen.add(slug);

  const html = fs.readFileSync(path.join(srcDir, file), 'utf8');
  const title = (html.match(/<title>([^<]*)<\/title>/i) || [])[1]?.trim() || slug;
  const date = meta(html, 'date');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) fail(`${file}: <meta name="proto:date" content="YYYY-MM-DD"> is required`);
  const tags = meta(html, 'tags').split(',').map((t) => t.trim()).filter(Boolean);
  return { slug, file, title, desc: meta(html, 'desc'), date, tags };
});

items.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist);
for (const { file } of items) fs.copyFileSync(path.join(srcDir, file), path.join(dist, file));
fs.copyFileSync(path.join(root, 'landing', 'index.html'), path.join(dist, 'index.html'));
fs.writeFileSync(path.join(dist, 'manifest.json'), JSON.stringify(items, null, 2));
fs.writeFileSync(path.join(dist, '.nojekyll'), '');
fs.writeFileSync(path.join(dist, 'robots.txt'), 'User-agent: *\nDisallow: /\n');

console.log(`built ${items.length} prototype(s) -> dist/`);
