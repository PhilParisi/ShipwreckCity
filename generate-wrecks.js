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

let generated = 0;

WRECKS.forEach(wreck => {
  const outPath = path.join(outDir, `${wreck.id}.html`);
  // The template is self-contained — it reads the wreck ID from the URL at runtime.
  // We just copy the template for each wreck so every page has a real URL.
  fs.writeFileSync(outPath, template);
  console.log(`  ✓  wrecks/${wreck.id}.html`);
  generated++;
});

console.log(`\n  Generated ${generated} wreck page(s).\n`);
