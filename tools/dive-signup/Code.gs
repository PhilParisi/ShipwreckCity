/**
 * Shipwreck City — dive sign-up backend (Google Apps Script)
 *
 * Runs attached to a private Google Sheet and answers requests from
 * dive-signup.html on the website. See SETUP.md in this folder.
 *
 * The password is NOT in this file. This repo is public, so it lives in
 * Apps Script's private Script Properties under the key PASSWORD.
 *
 * What the website can get from this script:
 *   - nothing at all without the password
 *   - with the password: upcoming slots and the NAMES signed up for each
 * Email addresses stay in the Sheet and are never sent to the website.
 */

var SLOTS_SHEET   = 'Slots';
var SIGNUPS_SHEET = 'Signups';

var SEND_CONFIRMATION_EMAIL = true;
var CONTACT_EMAIL = 'phil@shipwreckcity.org';

// Slow down password guessing: after this many wrong attempts in the window,
// everything is refused until the window passes.
var MAX_FAILED_ATTEMPTS   = 20;
var FAILED_WINDOW_SECONDS = 600;

var MAX_NAME_LENGTH  = 80;
var MAX_EMAIL_LENGTH = 120;

/** Run once from the editor: creates the two tabs with their headers. */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheet_(ss, SLOTS_SHEET,   ['Date', 'Time', 'Location', 'Spots', 'Notes', 'Slot ID (auto)']);
  ensureSheet_(ss, SIGNUPS_SHEET, ['Signed Up At', 'Slot', 'Name', 'Email', 'Slot ID']);
}

function ensureSheet_(ss, name, headers) {
  var sheet = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * All requests arrive here as POST with a JSON body:
 *   { action: 'list',   password }
 *   { action: 'signup', password, slotId, name, email }
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var req = JSON.parse(e.postData.contents);

    var authError = checkPassword_(req.password);
    if (authError) return reply_({ ok: false, error: authError });

    // One request at a time, so two people can't both take the last spot.
    lock.waitLock(15000);

    if (req.action === 'list')   return reply_({ ok: true, slots: readSlots_().map(publicSlot_) });
    if (req.action === 'signup') return reply_(signUp_(req));
    return reply_({ ok: false, error: 'bad_request' });
  } catch (err) {
    console.error(err);
    return reply_({ ok: false, error: 'server_error' });
  } finally {
    lock.releaseLock();
  }
}

function reply_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Returns an error code, or null if the password is right. */
function checkPassword_(password) {
  var expected = PropertiesService.getScriptProperties().getProperty('PASSWORD');
  if (!expected) return 'not_configured';

  var cache  = CacheService.getScriptCache();
  var failed = parseInt(cache.get('failed') || '0', 10);
  if (failed >= MAX_FAILED_ATTEMPTS) return 'locked';

  if (String(password || '') === expected) return null;

  cache.put('failed', String(failed + 1), FAILED_WINDOW_SECONDS);
  Utilities.sleep(1000);
  return 'wrong_password';
}

/**
 * Upcoming slots, soonest first, each with everyone signed up (emails
 * included, for server-side use only — see publicSlot_).
 * Rows without a usable date or spot count are skipped; past dates are hidden.
 */
function readSlots_() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var tz    = ss.getSpreadsheetTimeZone();
  var sheet = ss.getSheetByName(SLOTS_SHEET);
  var today = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var range   = sheet.getRange(2, 1, lastRow - 1, 6);
  var values  = range.getValues();
  var display = range.getDisplayValues();   // Time as shown; raw time cells shift by minutes when formatted

  var signups = readSignups_();
  var slots   = [];

  values.forEach(function (row, i) {
    var date  = row[0] instanceof Date ? row[0] : new Date(row[0]);
    var spots = parseInt(row[3], 10);
    if (!row[0] || isNaN(date.getTime()) || !(spots > 0)) return;

    var id = String(row[5] || '');
    if (!id) {
      id = Utilities.getUuid().slice(0, 8);
      sheet.getRange(i + 2, 6).setValue(id);
    }

    var sortDate = Utilities.formatDate(date, tz, 'yyyy-MM-dd');
    if (sortDate < today) return;

    slots.push({
      id:       id,
      sortDate: sortDate,
      date:     Utilities.formatDate(date, tz, 'EEE, MMM d, yyyy'),
      time:     display[i][1],
      location: display[i][2],
      notes:    display[i][4],
      spots:    spots,
      signups:  signups[id] || []
    });
  });

  return slots.sort(function (a, b) {
    return a.sortDate < b.sortDate ? -1 : a.sortDate > b.sortDate ? 1 : 0;
  });
}

/** { slotId: [{ name, email }, ...] } */
function readSignups_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SIGNUPS_SHEET);
  var bySlot  = {};
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return bySlot;

  sheet.getRange(2, 1, lastRow - 1, 5).getDisplayValues().forEach(function (row) {
    var id = row[4];
    if (!id) return;
    (bySlot[id] = bySlot[id] || []).push({ name: row[2], email: row[3] });
  });
  return bySlot;
}

/** What the website may see. Keep emails out of this. */
function publicSlot_(s) {
  return {
    id:       s.id,
    date:     s.date,
    time:     s.time,
    location: s.location,
    notes:    s.notes,
    spots:    s.spots,
    names:    s.signups.map(function (p) { return p.name; })
  };
}

function signUp_(req) {
  var name  = String(req.name  || '').trim();
  var email = String(req.email || '').trim();
  if (!name || name.length > MAX_NAME_LENGTH) return { ok: false, error: 'bad_name' };
  if (email.length > MAX_EMAIL_LENGTH || !/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(email)) {
    return { ok: false, error: 'bad_email' };
  }

  var slots = readSlots_();
  var slot  = slots.filter(function (s) { return s.id === String(req.slotId); })[0];
  if (!slot) return { ok: false, error: 'no_slot', slots: slots.map(publicSlot_) };

  if (slot.signups.length >= slot.spots) return { ok: false, error: 'full', slots: slots.map(publicSlot_) };

  var already = slot.signups.some(function (p) { return p.email.toLowerCase() === email.toLowerCase(); });
  if (already) return { ok: false, error: 'duplicate', slots: slots.map(publicSlot_) };

  var label = slot.date + (slot.time ? ', ' + slot.time : '');
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SIGNUPS_SHEET)
    .appendRow([new Date(), label, plainText_(name), plainText_(email), slot.id]);
  slot.signups.push({ name: name, email: email });

  var emailed = false;
  if (SEND_CONFIRMATION_EMAIL) emailed = sendConfirmation_(name, email, slot, label);

  return { ok: true, emailed: emailed, slots: slots.map(publicSlot_) };
}

/** Stops typed text like "=SUM(...)" from being run as a Sheet formula. */
function plainText_(text) {
  return /^[=+\-@\t\r]/.test(text) ? "'" + text : text;
}

/** A failed email must not undo a successful sign-up. */
function sendConfirmation_(name, email, slot, label) {
  try {
    var lines = ['Hi ' + name + ',', '', "You're signed up for a Shipwreck City dive:", '', '  ' + label];
    if (slot.location) lines.push('  ' + slot.location);
    if (slot.notes)    lines.push('  ' + slot.notes);
    lines.push('', 'Need to cancel or change? Email ' + CONTACT_EMAIL + '.', '', 'Shipwreck City');
    MailApp.sendEmail({
      to:      email,
      subject: 'Shipwreck City dive sign-up: ' + label,
      body:    lines.join('\n'),
      name:    'Shipwreck City',
      replyTo: CONTACT_EMAIL
    });
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}
