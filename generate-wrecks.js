#!/usr/bin/env node
/**
 * generate-wrecks.js
 *
 * Run this script whenever you add/edit/remove wrecks in wrecks-data.js.
 * It generates one HTML file per wreck in /wrecks/, named by wreck ID.
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

const templatePath = path.join(__dirname, 'wrecks/wreck-template.html');
const template     = fs.readFileSync(templatePath, 'utf8');
const outDir       = path.join(__dirname, 'wrecks');

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
  const title       = escapeHtml(`${wreck.name} — Shipwreck City`);
  const description = escapeHtml(wreck.tagline || `${wreck.name} — Shipwreck City`);
  const pageUrl      = `${SITE_URL}/wrecks/${wreck.id}`;
  const image        = wreck.hasPrimetime
    ? `${SITE_URL}/img/wrecks/${wreck.id}/primetime.jpg`
    : FALLBACK_OG_IMAGE;

  return `<title>${title}</title>
  <meta name="description" content="${description}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${image}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${image}">`;
}

let generated = 0;

WRECKS.forEach(wreck => {
  const outPath = path.join(outDir, `${wreck.id}.html`);
  // The template is self-contained — it reads the wreck ID from the URL at runtime —
  // but the <head> meta tags are swapped in here per-wreck so link previews work.
  const page = template.replace('<title>Loading...</title>', metaTagsFor(wreck));
  fs.writeFileSync(outPath, page);
  console.log(`  ✓  wrecks/${wreck.id}.html`);
  generated++;
});

console.log(`\n  Generated ${generated} wreck page(s).\n`);
