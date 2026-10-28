#!/usr/bin/env node
/**
 * generate-wrecks.js
 *
 * Run this script whenever you add/edit/remove wrecks in wrecks-data.js.
 * It generates one HTML file per wreck in /lu-archive/, named by wreck ID.
 *
 * Usage:
 *   node generate-wrecks.js
 *
 * Or add to package.json scripts:
 *   "build": "node generate-wrecks.js"
 */

const fs   = require('fs');
const path = require('path');

// Load wreck data into scope
const dataFile = fs.readFileSync(path.join(__dirname, 'js/wrecks-data.js'), 'utf8');
let WRECKS, SITE_CONFIG;
const fn = new Function(dataFile + '\nreturn { WRECKS, SITE_CONFIG };');
({ WRECKS, SITE_CONFIG } = fn());

// buildNav()/buildFooter() from js/site.js, so the static nav/footer written into
// each page below are exactly what the site's script draws at runtime. site.js
// also touches the DOM when it loads, so run it against a do-nothing stub
// browser, with a production hostname so ROOT resolves to '' (root-relative links).
function loadSiteChrome() {
  const stub = new Proxy(function () {}, {
    get: (t, k) => (k === Symbol.toPrimitive ? () => '' : k === Symbol.iterator ? [][Symbol.iterator] : stub),
    apply: () => stub,
    construct: () => stub,
    set: () => true,
  });
  const document = new Proxy({}, {
    get: (t, k) => (k === 'querySelectorAll' ? () => [] : k === 'getElementById' || k === 'querySelector' ? () => null : stub),
  });
  const src = fs.readFileSync(path.join(__dirname, 'js/site.js'), 'utf8');
  return new Function('location', 'document', 'window', 'localStorage',
    `${src}\nreturn { buildNav, buildFooter, imageAltText, IMAGE_LICENSE };`)({ hostname: 'shipwreckcity.org' }, document, stub, stub);
}
const { buildNav, buildFooter, imageAltText, IMAGE_LICENSE } = loadSiteChrome();

// Every photo shown on a wreck page, as files inside img/targets/{id}/:
// the primetime image (if any) then the gallery, in .webp form.
function wreckImageFiles(wreck) {
  return [
    ...(wreck.hasPrimetime ? ['primetime.webp'] : []),
    ...(wreck.images || []).map(f => f.replace(/\.(png|jpe?g)$/i, '.webp')),
  ];
}

// Google Images license metadata (schema.org ImageObject) for each photo, so
// results can show a "Licensable" badge linking to the license terms. Values
// come from IMAGE_LICENSE in js/site.js.
function imageLicenseJsonLd(wreck) {
  const files = wreckImageFiles(wreck);
  if (!files.length) return '';
  const objects = files.map(f => ({
    '@context':          'https://schema.org',
    '@type':             'ImageObject',
    contentUrl:          `${SITE_URL}/img/targets/${wreck.id}/${f}`,
    name:                imageAltText(wreck, f),
    license:             IMAGE_LICENSE.url,
    acquireLicensePage:  IMAGE_LICENSE.acquirePage,
    creditText:          IMAGE_LICENSE.creditText,
    copyrightNotice:     IMAGE_LICENSE.copyrightNotice,
    creator:             { '@type': 'Organization', name: IMAGE_LICENSE.creator },
  }));
  return `\n  <script type="application/ld+json">${JSON.stringify(objects).replace(/</g, '\\u003c')}</script>`;
}

// Fill <div id="nav-mount"> / <div id="footer-mount"> with a static copy of the nav
// and footer, between STATIC-* markers so reruns replace rather than append. The
// page's own script still redraws both on load; this copy is for crawlers / no-JS.
const MOUNT_RE = {
  nav:    /<div id="nav-mount">(?:<!-- STATIC-NAV:START -->[\s\S]*?<!-- STATIC-NAV:END -->)?<\/div>/,
  footer: /<div id="footer-mount">(?:<!-- STATIC-FOOTER:START -->[\s\S]*?<!-- STATIC-FOOTER:END -->)?<\/div>/,
};
function withStaticChrome(html, activePage) {
  return html
    .replace(MOUNT_RE.nav,    () => `<div id="nav-mount"><!-- STATIC-NAV:START -->${buildNav(activePage)}\n<!-- STATIC-NAV:END --></div>`)
    .replace(MOUNT_RE.footer, () => `<div id="footer-mount"><!-- STATIC-FOOTER:START -->${buildFooter()}\n<!-- STATIC-FOOTER:END --></div>`);
}

const templatePath = path.join(__dirname, 'lu-archive/wreck-template.html');
const template     = fs.readFileSync(templatePath, 'utf8');
const outDir       = path.join(__dirname, 'lu-archive');

// Social/search crawlers (Slack, iMessage, Discord, Twitter, Facebook, Google)
// generally don't execute JavaScript, so the preview title/description/image
// have to be real, static tags in the HTML — not injected at runtime.
const SITE_URL          = 'https://shipwreckcity.org';
const FALLBACK_OG_IMAGE = `${SITE_URL}/img/og-image.jpg`;

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function metaTagsFor(wreck) {
  // Per-target SEO comes from the archive CSV's seo_title / seo_description columns
  // (carried into wrecks-data.js by tools/csv_to_wrecks_data.py).
  const title       = escapeHtml(wreck.seoTitle || `${wreck.name} — Shipwreck City`);
  const description = escapeHtml(wreck.seoDescription || wreck.tagline || `${wreck.name} — Shipwreck City`);
  const pageUrl      = `${SITE_URL}/lu-archive/${wreck.id}`;
  const image        = wreck.hasPrimetime
    ? `${SITE_URL}/img/targets/${wreck.id}/primetime.jpg`
    : FALLBACK_OG_IMAGE;

  if (!wreck.seoTitle || !wreck.seoDescription) {
    console.warn(`  ⚠ no seo_title/seo_description for ${wreck.id} — using auto-generated values. Fill them in the archive CSV.`);
  }

  return `<title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${pageUrl}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${image}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${image}">${imageLicenseJsonLd(wreck)}`;
}

// Keep these two helpers in step with statusLabel()/depthDisplay() in js/site.js.
const STATUS_LABELS = {
  'recently-explored':   'Recently Explored',
  'previously-explored': 'Previously Explored',
  'never-explored':      'Never Explored',
};
const statusLabel  = status => STATUS_LABELS[status] || status;
const depthDisplay = depth  => (depth ? `${depth} ft` : '—');

// ── Static page body ─────────────────────────────────────────────────────
// The template draws the whole page with JavaScript at runtime, which leaves
// the raw HTML with an empty <main>. Crawlers that don't run scripts (and
// Google's first pass) would see no content, so write the wreck's real text
// into <main id="wreck-page"> here. It mirrors the template's markup and
// classes so it looks the same; the template script then replaces it on load
// with the full interactive version (map, lightbox, footage, archive list).
// If the template's layout changes, update this to match.
const NO_RECORD = 'No record available from this source for this target';

function sourceLink(url) {
  return url
    ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(url)}</a>`
    : NO_RECORD;
}

function staticBodyFor(wreck, prev, next) {
  const name     = escapeHtml(wreck.name);
  const imgBase  = `../img/targets/${wreck.id}`;

  const overview = wreck.summarySections && wreck.summarySections.length
    ? wreck.summarySections.map(sec => `
            ${sec.heading ? `<div class="overview-subhead">${escapeHtml(sec.heading)}</div>` : ''}
            <p>${escapeHtml(sec.body)}</p>`).join('')
    : `
            <p>Description coming soon.</p>`;

  const gallery = (wreck.images || []).map(f => f.replace(/\.(png|jpe?g)$/i, '.webp'));

  const navItem = (w, dir, cls) => w
    ? `<a class="wreck-nav-item ${cls} has-image" href="../lu-archive/${w.id}" style="background-image:url('../img/targets/${w.id}/primetime.webp')">
          <div class="wreck-nav-dir">${dir}</div>
          <div class="wreck-nav-name">${escapeHtml(w.name)}</div>
        </a>`
    : `<div class="wreck-nav-item ${cls}" style="opacity:0.3;pointer-events:none">
          <div class="wreck-nav-dir">${dir}</div>
          <div class="wreck-nav-name">—</div>
        </div>`;

  return `
    <div class="wreck-hero">
      <div class="wreck-hero-grid"></div>
      <div class="wreck-hero-content split">
        <div class="wreck-hero-left">
          <div class="wreck-breadcrumb"><a href="../lu-archive">Archive</a> / <span class="wreck-breadcrumb-current">${escapeHtml(wreck.catalog)}</span></div>
          <div class="wreck-catalog-num">${escapeHtml(wreck.catalog)}</div>
          <h1 class="wreck-title">${name}</h1>
        </div>
      </div>
    </div>

    <div class="wreck-data-bar">
      <div class="wreck-data-item"><div class="wreck-data-label">Type</div><div class="wreck-data-val">${escapeHtml(wreck.type)}</div></div>
      <div class="wreck-data-item"><div class="wreck-data-label">Class</div><div class="wreck-data-val">${escapeHtml(wreck.class)}</div></div>
      <div class="wreck-data-item"><div class="wreck-data-label">Status</div><div class="wreck-data-val"><span class="status-dot status-${wreck.status}"></span>${escapeHtml(statusLabel(wreck.status))}</div></div>
      <div class="wreck-data-item"><div class="wreck-data-label">Depth</div><div class="wreck-data-val">${depthDisplay(wreck.depth)}</div></div>
      <div class="wreck-data-item"><div class="wreck-data-label">Dimensions</div><div class="wreck-data-val">${escapeHtml(wreck.dimensions || '—')}</div></div>
    </div>

    <div id="primetime-wrap" style="height:${wreck.hasPrimetime ? '100vh' : '380px'};background:${wreck.hasPrimetime ? '#020810' : 'var(--bg-deep)'};">${wreck.hasPrimetime ? `
      <div class="wreck-primetime-wrap">
        <img src="${imgBase}/primetime.webp" alt="${escapeHtml(imageAltText(wreck, 'primetime.webp'))}">
      </div>` : ''}
    </div>

    <div class="wreck-body">
      <div class="wreck-main">
        <div class="prose-section">
          <h3>Overview</h3>${overview}
        </div>
        <div class="prose-section">
          <h3>Links &amp; Resources</h3>
          <p><strong>Coastal Sensing &amp; Survey:</strong> ${sourceLink(wreck.css_url)}</p>
          <p><strong>DCS Films:</strong> ${sourceLink(wreck.dcs_url)}</p>
          <p><strong>Lake Union Virtual Museum:</strong> ${sourceLink(wreck.luvm_url)}</p>
        </div>
        <div id="gallery-wrap">${gallery.length ? `
          <div class="section-label" style="margin-top:40px;">Gallery</div>
          <div class="wreck-gallery">
            ${gallery.map((f, i) => `<img src="${imgBase}/${escapeHtml(f)}" alt="${escapeHtml(imageAltText(wreck, f))}" loading="lazy">`).join('\n            ')}
          </div>` : ''}
        </div>
      </div>

      <div class="wreck-aside">
        <div class="aside-label">Field data</div>
        <div class="aside-detail-row"><span>Catalog</span><span>${escapeHtml(wreck.catalog)}</span></div>
        <div class="aside-detail-row"><span>Vessel type</span><span>${escapeHtml(wreck.type)}</span></div>
        <div class="aside-detail-row"><span>Material</span><span>${escapeHtml(wreck.material)}</span></div>
        <div class="aside-detail-row"><span>Status</span><span>${escapeHtml(statusLabel(wreck.status))}</span></div>${wreck.depth ? `
        <div class="aside-detail-row"><span>Depth</span><span>${wreck.depth} ft</span></div>` : ''}${wreck.dimensions ? `
        <div class="aside-detail-row"><span>Dimensions</span><span>${escapeHtml(wreck.dimensions)}</span></div>` : ''}${wreck.diveDate ? `
        <div class="aside-detail-row"><span>ROV Dive Date</span><span>${escapeHtml(wreck.diveDate)}</span></div>` : ''}
        <div class="aside-detail-row"><span>Location</span><span style="text-align:right;max-width:160px;">${escapeHtml(wreck.location)}</span></div>
        <a class="aside-label" href="../lu-archive" style="margin-top:28px;display:block;text-decoration:none;">Target Archive</a>
      </div>
    </div>

    <div class="wreck-nav">
      ${navItem(prev, '← Previous', 'prev')}
      ${navItem(next, 'Next →', 'next')}
    </div>
  `;
}

const MAIN_PLACEHOLDER = '<main id="wreck-page"></main>';
if (!template.includes(MAIN_PLACEHOLDER)) {
  console.warn('  ⚠ <main id="wreck-page"></main> not found in the template — static page bodies not written.');
}

let generated = 0;

WRECKS.forEach((wreck, i) => {
  const outPath = path.join(outDir, `${wreck.id}.html`);
  // The template reads the wreck ID from the URL and draws the page at runtime, but the
  // <head> meta tags and a static copy of the page body are written in here per-wreck so
  // link previews and crawlers get real content without running any JavaScript.
  // (Function replacers: wreck text may contain "$", which a string replacement would mangle.)
  let page = template
    .replace('<title>Loading...</title>', () => metaTagsFor(wreck))
    .replace(MAIN_PLACEHOLDER, () => `<main id="wreck-page">${staticBodyFor(wreck, WRECKS[i - 1], WRECKS[i + 1])}</main>`);
  page = withStaticChrome(page, 'explore');
  fs.writeFileSync(outPath, page);
  console.log(`  ✓  lu-archive/${wreck.id}.html`);
  generated++;
});

console.log(`\n  Generated ${generated} wreck page(s).\n`);

// ── lu-archive.html static rows ──────────────────────────────────────────
// The archive table is drawn by JavaScript at runtime, which leaves the raw
// HTML with no links to the individual wreck pages. Write a plain row per
// target (with a real <a href>) between the STATIC-ROWS markers so crawlers
// can discover every page; the page's renderTable() replaces them on load.
const archivePath = path.join(__dirname, 'lu-archive.html');
const archiveHtml = fs.readFileSync(archivePath, 'utf8');
const ROWS_RE     = /(<!-- STATIC-ROWS:START -->)[\s\S]*?(<!-- STATIC-ROWS:END -->)/;

if (!ROWS_RE.test(archiveHtml)) {
  console.warn('  ⚠ STATIC-ROWS markers not found in lu-archive.html — static archive rows not written.');
} else {
  const rows = WRECKS.map(w => `      <tr>
        <td class="td-img"></td>
        <td class="td-catalog">${escapeHtml(w.catalog)}</td>
        <td><a href="lu-archive/${w.id}"><span class="td-name">${escapeHtml(w.name)}</span></a></td>
        <td><div class="td-desc">${escapeHtml(w.seoDescription || '')}</div></td>
        <td class="td-type">${escapeHtml(w.type)}</td>
        <td>${depthDisplay(w.depth)}</td>
        <td><span class="status-dot status-${w.status}"></span>${escapeHtml(statusLabel(w.status))}</td>
      </tr>`).join('\n');
  fs.writeFileSync(archivePath, archiveHtml.replace(ROWS_RE, (m, start, end) => `${start}\n${rows}\n${end}`));
  console.log(`  Wrote ${WRECKS.length} static rows into lu-archive.html.`);
}

// ── Static nav/footer in the top-level pages ─────────────────────────────
// Each page's active nav item comes from its own buildNav('<key>') call.
const topLevelPages = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));
let chromePages = 0;
topLevelPages.forEach(f => {
  const file = path.join(__dirname, f);
  const html = fs.readFileSync(file, 'utf8');
  if (!MOUNT_RE.nav.test(html) && !MOUNT_RE.footer.test(html)) return;   // e.g. 404.html, redirect pages
  const active = (html.match(/buildNav\('([^']*)'\)/) || [])[1] || '';
  const updated = withStaticChrome(html, active);
  if (updated !== html) fs.writeFileSync(file, updated);
  chromePages++;
});
console.log(`  Wrote static nav/footer into ${chromePages} top-level pages (+ every wreck page).`);

// ── "Last Update" stat on the project and press pages ────────────────────
// Any element marked data-archive-date shows the date of the current archive
// CSV (from ARCHIVE_CSV_FILENAME, e.g. target_master_archive_28Oct2026.csv →
// "28 Oct '26"), so it updates with every new archive instead of by hand.
const photosJs    = fs.readFileSync(path.join(__dirname, 'js/photos-data.js'), 'utf8');
const archiveName = (photosJs.match(/ARCHIVE_CSV_FILENAME\s*=\s*"([^"]+)"/) || [])[1] || '';
const archiveDate = archiveName.match(/(\d{1,2})([A-Za-z]+)(\d{4})/);
if (!archiveDate) {
  console.warn(`  ⚠ couldn't read a date from ARCHIVE_CSV_FILENAME ("${archiveName}") — "Last Update" not changed.`);
} else {
  const label = `${archiveDate[1]} ${archiveDate[2].slice(0, 1).toUpperCase()}${archiveDate[2].slice(1, 3).toLowerCase()} '${archiveDate[3].slice(2)}`;
  topLevelPages.forEach(f => {
    const file = path.join(__dirname, f);
    const html = fs.readFileSync(file, 'utf8');
    const updated = html.replace(/(<div class="[^"]*" data-archive-date>)[^<]*(<\/div>)/g, (m, open, close) => `${open}${label.replace(/'/g, '&#39;')}${close}`);
    if (updated !== html) fs.writeFileSync(file, updated);
  });
  console.log(`  "Last Update" set to ${label} (from ${archiveName}).`);
}

// ── Redirects from the pre-August-2026 addresses ─────────────────────────
// Wreck pages used to live at /wrecks/luNNN and the archive at /archive. They
// moved to /lu-archive/ on 2026-08-03, leaving the old addresses (which Google
// had indexed, and other sites may link to) returning 404. GitHub Pages can't
// send real 301s, so write a tiny forwarding page at each old address: an
// instant meta refresh plus a canonical link, which Google treats as a
// permanent redirect. Deliberately NOT noindex (that would tell Google to drop
// the page rather than follow it) and not listed in the sitemap.
function redirectPage(targetUrl, relativeTarget, label) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(label)} has moved — Shipwreck City</title>
  <!-- AUTO-GENERATED by generate-wrecks.js — old address kept as a redirect so existing links and search results keep working -->
  <link rel="canonical" href="${targetUrl}">
  <meta http-equiv="refresh" content="0; url=${relativeTarget}">
  <script>location.replace('${relativeTarget}' + location.search + location.hash);</script>
</head>
<body>
  <p>This page has moved to <a href="${relativeTarget}">${targetUrl.replace('https://', '')}</a>.</p>
</body>
</html>
`;
}

const oldWrecksDir = path.join(__dirname, 'wrecks');
if (!fs.existsSync(oldWrecksDir)) fs.mkdirSync(oldWrecksDir);
WRECKS.forEach(wreck => {
  fs.writeFileSync(
    path.join(oldWrecksDir, `${wreck.id}.html`),
    redirectPage(`${SITE_URL}/lu-archive/${wreck.id}`, `../lu-archive/${wreck.id}`, wreck.name)
  );
});
fs.writeFileSync(
  path.join(__dirname, 'archive.html'),
  redirectPage(`${SITE_URL}/lu-archive`, 'lu-archive', 'The archive')
);
console.log(`  Wrote ${WRECKS.length} redirects in wrecks/ and archive.html (old addresses → /lu-archive/).`);

// ── sitemap.xml ──────────────────────────────────────────────────────────
// Regenerated every time this script runs, so it can never drift out of
// sync with the live set of wreck pages.
//
// Each URL carries a <lastmod> date so Google can tell which pages changed
// (e.g. a newly added target) and recrawl those first. Google ignores
// lastmod if it's always "today", so a page's date only moves when its
// content actually changes: we keep a fingerprint of every page in
// data/sitemap-lastmod.json and bump the date only when the fingerprint
// differs. The shared nav/footer are left out of the fingerprint, so a nav
// tweak doesn't mark every page as changed. Commit that JSON file along with
// the pages so the dates carry over between builds.
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const STATIC_PAGES = ['', 'map', 'lu-archive', 'events', 'support', 'project', 'team', 'history', 'press', 'contact'];

const sitemapEntries = [
  ...STATIC_PAGES.map(slug => ({ url: `${SITE_URL}/${slug}`, file: `${slug || 'index'}.html` })),
  ...WRECKS.map(wreck => ({
    url:    `${SITE_URL}/lu-archive/${wreck.id}`,
    file:   `lu-archive/${wreck.id}.html`,
    images: wreckImageFiles(wreck).map(f => `${SITE_URL}/img/targets/${wreck.id}/${f}`),
  })),
];

const LASTMOD_PATH = path.join(__dirname, 'data/sitemap-lastmod.json');
const today        = new Date().toISOString().slice(0, 10);
const lastmodDb    = fs.existsSync(LASTMOD_PATH) ? JSON.parse(fs.readFileSync(LASTMOD_PATH, 'utf8')) : {};

// What counts as "content" for lastmod. Wreck pages share one template, so a
// change to the template's script would otherwise re-date all 112 pages even
// though nothing a reader or Google sees changed — for those, fingerprint only
// the <head> tags written per wreck plus the static <main> body. Hand-edited
// top-level pages fingerprint the whole file minus the shared nav/footer.
function pageContent(html, file) {
  if (file.startsWith('lu-archive/')) {
    const head = html.slice(html.indexOf('<title>'), html.indexOf('</head>'));
    const main = html.slice(html.indexOf('<main id="wreck-page">'), html.indexOf('</main>'));
    return head + main;
  }
  return html
    .replace(/<!-- STATIC-NAV:START -->[\s\S]*?<!-- STATIC-NAV:END -->/, '')
    .replace(/<!-- STATIC-FOOTER:START -->[\s\S]*?<!-- STATIC-FOOTER:END -->/, '');
}
function contentFingerprint(file) {
  const html = fs.readFileSync(path.join(__dirname, file), 'utf8');
  return crypto.createHash('sha1').update(pageContent(html, file)).digest('hex');
}

// First time a page is seen: use the date git last committed it (or today if
// it has uncommitted changes / git isn't available), rather than stamping
// every existing page with today's date.
function initialDate(file) {
  try {
    const dirty = execFileSync('git', ['status', '--porcelain', '--', file], { cwd: __dirname, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (dirty) return today;
    return execFileSync('git', ['log', '-1', '--format=%cs', '--', file], { cwd: __dirname, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() || today;
  } catch (e) {
    return today;
  }
}

const newLastmodDb = {};
let changedPages = [];
sitemapEntries.forEach(entry => {
  const hash = contentFingerprint(entry.file);
  const prev = lastmodDb[entry.url];
  let date;
  if (!prev)                  date = initialDate(entry.file);
  else if (prev.hash !== hash) { date = today; changedPages.push(entry.url); }
  else                        date = prev.lastmod;
  newLastmodDb[entry.url] = { lastmod: date, hash };
  entry.lastmod = date;
});
fs.writeFileSync(LASTMOD_PATH, JSON.stringify(newLastmodDb, null, 2) + '\n');

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${sitemapEntries.map(e => `  <url><loc>${e.url}</loc><lastmod>${e.lastmod}</lastmod>${(e.images || []).map(img => `
    <image:image><image:loc>${img}</image:loc></image:image>`).join('')}${e.images && e.images.length ? '\n  ' : ''}</url>`).join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemapXml);
const newPages = sitemapEntries.filter(e => !lastmodDb[e.url]).map(e => e.url);
console.log(`  Wrote sitemap.xml (${sitemapEntries.length} URLs, ${sitemapEntries.reduce((n, e) => n + (e.images || []).length, 0)} images).`);
if (Object.keys(lastmodDb).length) {
  if (newPages.length)     console.log(`    New pages (lastmod ${today}):\n      ${newPages.join('\n      ')}`);
  if (changedPages.length) console.log(`    Changed pages (lastmod ${today}):\n      ${changedPages.join('\n      ')}`);
  if (!newPages.length && !changedPages.length) console.log('    No page content changed — lastmod dates unchanged.');
}
console.log('');
