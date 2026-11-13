/**
 * Shipwreck City — Google Apps Script backend
 *
 * Runs attached to a private Google Sheet and answers two pages on the website:
 *   - dive-signup.html  dive slots and sign-ups (Slots and Signups tabs)
 *   - hub.html          the team's editable task list (Tasks and Changes tabs)
 * See SETUP.md in this folder.
 *
 * No secrets are in this file. This repo is public, so they live in Apps
 * Script's private Script Properties:
 *   PASSWORD  the dive sign-up password
 *   HUB_KEY   the hub's team key (from private/team-hub-api-key.txt). The hub
 *             page only learns it by unlocking with the hub password.
 *
 * What the website can get from this script:
 *   - nothing at all without the right password or key
 *   - dive page, with the password: upcoming slots and the NAMES signed up.
 *     Email addresses stay in the Sheet and are never sent to the website.
 *   - hub, with the key: the task list, and the ability to change it
 */

var SLOTS_SHEET   = 'Slots';
var SIGNUPS_SHEET = 'Signups';
var TASKS_SHEET   = 'Tasks';
var CHANGES_SHEET = 'Changes';

var SEND_CONFIRMATION_EMAIL = true;
var CONTACT_EMAIL = 'phil@shipwreckcity.org';

// Slow down guessing: after this many wrong attempts in the window,
// everything is refused until the window passes.
var MAX_FAILED_ATTEMPTS   = 20;
var FAILED_WINDOW_SECONDS = 600;

var MAX_NAME_LENGTH  = 80;
var MAX_EMAIL_LENGTH = 120;
var MAX_TASK_LENGTH  = 5000;   // generous; only there to stop a runaway paste

var TASK_HEADERS = ['ID', 'Person', 'List', 'Task', 'Status', 'Due', 'Notes', 'Timeline', 'Updated At', 'Updated By'];
var TASK_LISTS   = ['Priority', 'Simmering'];
var TASK_STATUS  = ['not started', 'in progress', 'done'];

var HUB_ACTIONS = { tasks: true, saveTask: true, deleteTask: true };

/** Run once from the editor: creates the tabs with their headers. */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheet_(ss, SLOTS_SHEET,   ['Date', 'Time', 'Location', 'Spots', 'Notes', 'Slot ID (auto)']);
  ensureSheet_(ss, SIGNUPS_SHEET, ['Signed Up At', 'Slot', 'Name', 'Email', 'Slot ID']);
  ensureSheet_(ss, TASKS_SHEET,   TASK_HEADERS);
  ensureSheet_(ss, CHANGES_SHEET, ['Time', 'Who', 'Action', 'Person', 'Task']);
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
 *   dive page: { action: 'list',   password }
 *              { action: 'signup', password, slotId, name, email }
 *   hub:       { action: 'tasks',      key }
 *              { action: 'saveTask',   key, editor, task }
 *              { action: 'deleteTask', key, editor, id }
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var req = JSON.parse(e.postData.contents);

    var authError = HUB_ACTIONS[req.action]
      ? checkSecret_('HUB_KEY', req.key, 'hub_failed')
      : checkSecret_('PASSWORD', req.password, 'failed');
    if (authError) return reply_({ ok: false, error: authError });

    // One request at a time, so two people can't both take the last spot
    // or overwrite each other's task edits.
    lock.waitLock(15000);

    if (req.action === 'list')       return reply_({ ok: true, slots: readSlots_().map(publicSlot_) });
    if (req.action === 'signup')     return reply_(signUp_(req));
    if (req.action === 'tasks')      return reply_({ ok: true, tasks: readTasks_() });
    if (req.action === 'saveTask')   return reply_(saveTask_(req));
    if (req.action === 'deleteTask') return reply_(deleteTask_(req));
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

/** Returns an error code, or null if the given secret matches the Script Property. */
function checkSecret_(property, given, failedKey) {
  var expected = PropertiesService.getScriptProperties().getProperty(property);
  if (!expected) return 'not_configured';

  var cache  = CacheService.getScriptCache();
  var failed = parseInt(cache.get(failedKey) || '0', 10);
  if (failed >= MAX_FAILED_ATTEMPTS) return 'locked';

  if (String(given || '') === expected) return null;

  cache.put(failedKey, String(failed + 1), FAILED_WINDOW_SECONDS);
  Utilities.sleep(1000);
  return 'wrong_password';
}

// ── Dive sign-up ─────────────────────────────────────────────────────────

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

// ── Hub tasks ────────────────────────────────────────────────────────────
// One row per task. The Tasks tab can also be edited directly: rows typed in
// without an ID get one the next time the hub loads.

function readTasks_() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var tz    = ss.getSpreadsheetTimeZone();
  var sheet = ss.getSheetByName(TASKS_SHEET);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  var range   = sheet.getRange(2, 1, lastRow - 1, TASK_HEADERS.length);
  var values  = range.getValues();
  var display = range.getDisplayValues();
  var tasks   = [];

  values.forEach(function (row, i) {
    var text = String(display[i][3] || '').trim();
    if (!text) return;

    var id = String(display[i][0] || '');
    if (!id) {
      id = Utilities.getUuid().slice(0, 8);
      sheet.getRange(i + 2, 1).setValue(id);
    }

    // Due may have been typed into the Sheet and turned into a date.
    var due = row[5] instanceof Date ? Utilities.formatDate(row[5], tz, 'yyyy-MM-dd') : String(display[i][5] || '').trim();
    var list   = TASK_LISTS.indexOf(display[i][2]) >= 0 ? display[i][2] : 'Priority';
    var status = normalizeStatus_(display[i][4]);

    tasks.push({
      id:        id,
      person:    display[i][1],
      list:      list,
      task:      text,
      status:    TASK_STATUS.indexOf(status) >= 0 ? status : 'not started',
      due:       /^\d{4}-\d{2}-\d{2}$/.test(due) ? due : '',
      notes:     String(display[i][6] || '').split('\n').map(function (n) { return n.trim(); }).filter(String),
      timeline:  String(display[i][7]).toUpperCase() === 'TRUE',
      updatedAt: display[i][8]
    });
  });
  return tasks;
}

/** Older rows may say "to do" or have no status; both mean "not started". */
function normalizeStatus_(s) {
  s = String(s || '').trim().toLowerCase();
  if (s === '' || s === 'to do' || s === 'todo') return 'not started';
  return s;
}

/** Row number (2+) of the task with this ID, or 0. */
function findTaskRow_(sheet, id) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2 || !id) return 0;
  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues();
  for (var i = 0; i < ids.length; i++) if (ids[i][0] === id) return i + 2;
  return 0;
}

function cleanEditor_(req) {
  return String(req.editor || '').trim().slice(0, MAX_NAME_LENGTH) || 'Team member';
}

function logChange_(who, action, person, task) {
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CHANGES_SHEET)
    .appendRow([new Date(), plainText_(who), action, plainText_(person), plainText_(task)]);
}

/**
 * Adds a task (no id) or replaces one. Deliberately forgiving: the only thing
 * refused is a task with no text. Anything unexpected is tidied rather than
 * rejected (unknown status → not started, unknown list → Priority, a due date
 * that isn't YYYY-MM-DD → none). Last save wins; the Changes tab and the
 * Sheet's version history are there to recover anything overwritten.
 */
function saveTask_(req) {
  var editor = cleanEditor_(req);
  var t      = req.task || {};
  var person = String(t.person || '').trim().slice(0, MAX_NAME_LENGTH);
  var list   = TASK_LISTS.indexOf(String(t.list || '')) >= 0 ? String(t.list) : 'Priority';
  var text   = String(t.task || '').trim().slice(0, MAX_TASK_LENGTH);
  var status = normalizeStatus_(t.status);
  var due    = String(t.due || '').trim();
  var notes  = (Array.isArray(t.notes) ? t.notes : []).map(function (n) { return String(n).trim().slice(0, MAX_TASK_LENGTH); }).filter(String);

  if (!text) return { ok: false, error: 'bad_task' };
  if (TASK_STATUS.indexOf(status) < 0) status = 'not started';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(due)) due = '';

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TASKS_SHEET);
  var id    = String(t.id || '');
  var row   = 0;
  if (id) {
    row = findTaskRow_(sheet, id);
    if (!row) return { ok: false, error: 'not_found', tasks: readTasks_() };
  } else {
    id  = Utilities.getUuid().slice(0, 8);
    row = sheet.getLastRow() + 1;
  }

  var values = [id, plainText_(person), list, plainText_(text), status, due,
                plainText_(notes.join('\n')), t.timeline ? 'TRUE' : 'FALSE', new Date().toISOString(), plainText_(editor)];
  var range = sheet.getRange(row, 1, 1, TASK_HEADERS.length);
  range.setNumberFormat('@');   // keep dates and TRUE/FALSE as typed, not converted
  range.setValues([values]);

  logChange_(editor, t.id ? 'edited' : 'added', person, text);
  return { ok: true, tasks: readTasks_() };
}

function deleteTask_(req) {
  var editor = cleanEditor_(req);

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TASKS_SHEET);
  var row   = findTaskRow_(sheet, String(req.id || ''));
  if (!row) return { ok: false, error: 'not_found', tasks: readTasks_() };

  var old = sheet.getRange(row, 1, 1, TASK_HEADERS.length).getDisplayValues()[0];
  sheet.deleteRow(row);
  logChange_(editor, 'deleted', old[1], old[3]);
  return { ok: true, tasks: readTasks_() };
}
