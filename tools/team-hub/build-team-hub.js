/**
 * Builds the private hub page (hub.html).
 *
 * The site's code is public, so the hub's content can't sit in the page as
 * plain text. This script reads it from private/team-hub-content.js (ignored
 * by git), encrypts it with the team password, and writes only the encrypted
 * result into hub.html. The page decrypts it in the browser once the
 * right password is typed in.
 *
 * Usage:   node tools/team-hub/build-team-hub.js [page.html]
 * Password: private/team-hub-password.txt, or the TEAM_HUB_PASSWORD env var.
 * See README.md in this folder.
 */

const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');
const vm     = require('vm');

const ROOT          = path.join(__dirname, '..', '..');
const PRIVATE_DIR   = path.join(ROOT, 'private');
const CONTENT_FILE  = path.join(PRIVATE_DIR, 'team-hub-content.js');
const PASSWORD_FILE = path.join(PRIVATE_DIR, 'team-hub-password.txt');
const SALT_FILE     = path.join(PRIVATE_DIR, 'team-hub-salt.txt');
const API_KEY_FILE  = path.join(PRIVATE_DIR, 'team-hub-api-key.txt');
const EXAMPLE_FILE  = path.join(__dirname, 'team-hub-content.example.js');
const PAGE_FILE     = process.argv[2] ? path.resolve(process.argv[2]) : path.join(ROOT, 'hub.html');

// Must match what hub.html expects.
const ITERATIONS   = 600000;
const MIN_PASSWORD = 12;
const PAYLOAD_RE   = /(<!-- TEAM-HUB-PAYLOAD:START -->)[\s\S]*?(<!-- TEAM-HUB-PAYLOAD:END -->)/;

function fail(msg) {
  console.error('\n  ' + msg + '\n');
  process.exit(1);
}

// First run: start the private content file from the example.
if (!fs.existsSync(CONTENT_FILE)) {
  if (!fs.existsSync(PRIVATE_DIR)) fs.mkdirSync(PRIVATE_DIR);
  fs.copyFileSync(EXAMPLE_FILE, CONTENT_FILE);
  console.log('  Created private/team-hub-content.js from the example. Edit it, then run this again.');
  process.exit(0);
}

const password = process.env.TEAM_HUB_PASSWORD ||
  (fs.existsSync(PASSWORD_FILE) ? fs.readFileSync(PASSWORD_FILE, 'utf8').replace(/[\r\n]+$/, '') : '');
if (!password) {
  fail('No password. Put it on a single line in private/team-hub-password.txt (see tools/team-hub/README.md).');
}
if (password.length < MIN_PASSWORD) {
  fail(`The password must be at least ${MIN_PASSWORD} characters. Anyone can download the encrypted page and try guesses offline, so a few random words strung together is best.`);
}

delete require.cache[require.resolve(CONTENT_FILE)];
const content = require(CONTENT_FILE);
if (!Array.isArray(content.timeline)) fail('private/team-hub-content.js needs a "timeline" list (it can be empty: timeline: []).');
if (!Array.isArray(content.team))     fail('private/team-hub-content.js needs a "team" list.');
['principles', 'guidelines'].forEach(key => {
  if (content[key] != null && !Array.isArray(content[key])) fail(`"${key}" in private/team-hub-content.js should be a list: ${key}: [ ... ]`);
});
const QUARTER_RE = /^\d{4}-Q[1-4]$/;
const range = content.timelineRange || {};
if (!QUARTER_RE.test(range.from || '') || !QUARTER_RE.test(range.to || '')) fail('timelineRange needs from and to, like { from: "2026-Q4", to: "2027-Q4" }.');

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const warnings = [];
// Names in "who" must match a team member (first name, full name or "Everyone").
const nameMatches = w => {
  w = String(w).trim().toLowerCase();
  return w === 'everyone' || w === 'all' ||
    content.team.some(m => { const full = String(m.name).toLowerCase(); return w === full || full.split(/\s+/).indexOf(w) >= 0; });
};

// Public event titles, to check "event" assignments against.
let eventTitles = [];
try {
  const sandbox = {};
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'js/events-data.js'), 'utf8') + '\nthis.EVENTS = EVENTS;', sandbox);
  eventTitles = sandbox.EVENTS.map(e => String(e.title).toLowerCase());
} catch (e) {
  warnings.push(`couldn't read js/events-data.js to check event names (${e.message})`);
}

content.timeline.forEach((e, i) => {
  const label = e.event ? `event "${e.event}"` : `"${e.title || ''}"`;
  if (e.event) {
    if (eventTitles.length && !eventTitles.some(t => t.indexOf(String(e.event).toLowerCase()) >= 0)) warnings.push(`timeline #${i + 1}: no event on the Events page has "${e.event}" in its title`);
  } else if (!/^\d{4}-(\d{2}(-\d{2})?|Q[1-4])$/.test(e.date || '')) {
    warnings.push(`timeline #${i + 1} (${label}): date "${e.date || ''}" should be YYYY-MM-DD, YYYY-MM or YYYY-Q1`);
  }
  [].concat(e.who || []).forEach(w => { if (!nameMatches(w)) warnings.push(`timeline #${i + 1} (${label}): "${w}" doesn't match anyone on the team`); });
});
content.team.forEach(m => (m.priority || []).concat(m.simmering || []).forEach(t => {
  if (t && typeof t === 'object' && t.due && !DATE_RE.test(t.due)) warnings.push(`${m.name}: due "${t.due}" on "${t.task || ''}" isn't YYYY-MM-DD`);
  if (t && typeof t === 'object' && t.timeline && !t.due) warnings.push(`${m.name}: "${t.task || ''}" has timeline: true but no due date, so it can't go on the timeline`);
}));

// The salt stays the same between builds so "Remember on this device" keeps
// working after an update. It isn't secret; it's published in the page.
let salt;
if (fs.existsSync(SALT_FILE)) {
  salt = Buffer.from(fs.readFileSync(SALT_FILE, 'utf8').trim(), 'hex');
} else {
  salt = crypto.randomBytes(16);
  fs.writeFileSync(SALT_FILE, salt.toString('hex') + '\n');
}

// The team key lets the hub save task edits to the Google Sheet. It's sealed
// inside the encrypted content, so only someone who unlocks the hub has it,
// and the same value goes in the Apps Script's HUB_KEY Script Property.
let apiKeyCreated = false;
if (!fs.existsSync(API_KEY_FILE)) {
  fs.writeFileSync(API_KEY_FILE, crypto.randomBytes(24).toString('hex') + '\n');
  apiKeyCreated = true;
}
const apiKey = fs.readFileSync(API_KEY_FILE, 'utf8').trim();

const plaintext = JSON.stringify({
  apiKey:        apiKey,
  updated:       new Date().toISOString(),
  timelineRange: range,
  timeline:      content.timeline,
  team:          content.team,
  principles:    content.principles || [],
  guidelines:    content.guidelines || [],
});

const key    = crypto.pbkdf2Sync(password, salt, ITERATIONS, 32, 'sha256');
const iv     = crypto.randomBytes(12);
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
const data   = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final(), cipher.getAuthTag()]);   // Web Crypto expects the tag on the end

const payload = {
  v:    1,
  iter: ITERATIONS,
  salt: salt.toString('base64'),
  iv:   iv.toString('base64'),
  data: data.toString('base64'),
};

const page = fs.readFileSync(PAGE_FILE, 'utf8');
if (!PAYLOAD_RE.test(page)) fail(`Couldn't find the TEAM-HUB-PAYLOAD markers in ${path.relative(ROOT, PAGE_FILE)}.`);
fs.writeFileSync(PAGE_FILE, page.replace(PAYLOAD_RE, (m, start, end) =>
  `${start}\n<script id="team-hub-payload" type="application/json">${JSON.stringify(payload)}</script>\n${end}`));

warnings.forEach(w => console.warn('  ⚠ ' + w));
if (apiKeyCreated) console.log('  Created private/team-hub-api-key.txt. Its contents go in the Apps Script as the HUB_KEY Script Property (see tools/google-backend/SETUP.md).');
const count = key => content.team.reduce((n, m) => n + (m[key] || []).length, 0);
console.log(`  Encrypted ${content.timeline.length} timeline entries, ${count('priority')} priority and ${count('simmering')} simmering items for ${content.team.length} team members into ${path.relative(ROOT, PAGE_FILE)}.`);
