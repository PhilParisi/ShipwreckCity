"""
csv_to_wrecks_data.py
Converts wreck_master_archive_*.csv to js/wrecks-data.js

Usage:
    python tools/csv_to_wrecks_data.py

Run from the ShipwreckCity project root. The script finds the most recent
CSV matching wreck_master_archive_*.csv and overwrites js/wrecks-data.js.
"""

import csv
import json
import re
import glob
import os
import shutil

# ── Config ────────────────────────────────────────────────────────────────────

SITE_CONFIG = {
    "title": "Shipwreck City",
    "tagline": "An underwater archive of Seattle's sunken past.",
    "location": "Lake Union · Seattle, WA",
    "coordinates": [47.6380, -122.3383],
    "mapZoom": 14,
    "social": {
        "instagram": "@philparisi_",
        "youtube": "https://www.youtube.com/@philparisi_",
        "email": "Phil.Parisi@RemoteCoastSystems.com"
    }
}

FOOTAGE_STATUS_MAP = {
    "first footage":    "recently-explored",
    "updated footage":  "recently-explored",
    "new footage":      "recently-explored",
    "historical footage": "previously-explored",
    "no footage":       "never-explored",
}

# target_description is written in these named sections, in this order.
# Any leading "Name: X (LU013)" / "Type: A | Class: B | Subclass: C" lines
# are front matter — redundant with the name/type already shown elsewhere
# on the page — and get stripped before the sections are split out.
SECTION_LABELS = ['Shipwreck City Data', 'Prior Research and Theories', 'Additional Context']

# Shown on the site whenever a spreadsheet cell is missing/NA, so the UI
# never has to special-case a blank field.
DASH = '—'

# ── Helpers ───────────────────────────────────────────────────────────────────

def slugify(text):
    """Turn a string into a URL-safe slug."""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_]+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text.strip('-')

def clean(val):
    """Return None if value is empty / NA / TBD / Unknown, else the stripped string."""
    if val is None:
        return None
    v = val.strip()
    if v.upper() in ('NA', 'N/A', 'TBD', 'UNKNOWN', ''):
        return None
    return v

def parse_depth(val):
    """Return depth as an int, or None."""
    v = clean(val)
    if v is None:
        return None
    # grab first number in the string
    m = re.search(r'[\d.]+', v)
    return int(float(m.group())) if m else None

def parse_coord(val):
    """Return a float coordinate, or None."""
    v = clean(val)
    if v is None:
        return None
    try:
        return float(v)
    except ValueError:
        return None

def parse_dimensions(val):
    """Return a cleaned dimension string, or None."""
    v = clean(val)
    if v is None:
        return None
    # normalise spacing around 'x'
    v = re.sub(r"\s*[xX×]\s*", " × ", v)
    return v

def strip_description_frontmatter(text):
    """Drop leading 'Name: X (LU013)' / 'Type: A | Class: B | Subclass: C' lines,
    stopping at the first real section label or prose line."""
    lines = text.split('\n')
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue
        if line in SECTION_LABELS:
            break
        if re.match(r'^Type:.*Subclass:', line):
            i += 1
            continue
        if re.search(r'\(LU\d+\)\s*$', line) or re.match(r'^LU\d+\s*[—-]', line):
            i += 1
            continue
        break
    return '\n'.join(lines[i:]).strip()

def make_short_blurb(text, limit=160):
    """First sentence of the given text, capped at `limit` chars."""
    lines = text.split('\n')
    i = 0
    while i < len(lines) and (not lines[i].strip() or lines[i].strip() in SECTION_LABELS):
        i += 1
    remainder = re.sub(r'\s+', ' ', '\n'.join(lines[i:])).strip()
    if not remainder:
        return None
    m = re.search(r'^.*?[.!?](?=\s|$)', remainder)
    sentence = m.group(0) if m else remainder
    if len(sentence) > limit:
        return sentence[:limit].rsplit(' ', 1)[0] + '…'
    return sentence

def make_summary_sections(row):
    """Split target_description into [{heading, body}] using SECTION_LABELS.
    Falls back to a single unlabeled section for plain/placeholder text."""
    desc = clean(row.get('target_description', ''))
    if not desc or desc.lower() in ('unknown', 'na', 'shipwreck'):
        return []
    body = strip_description_frontmatter(desc)
    pattern = re.compile(r'^(' + '|'.join(re.escape(l) for l in SECTION_LABELS) + r')\s*$', re.MULTILINE)
    matches = list(pattern.finditer(body))
    if not matches:
        text = re.sub(r'\s+', ' ', body).strip()
        return [{"heading": None, "body": text}] if text else []
    sections = []
    if matches[0].start() > 0:
        lead = re.sub(r'\s+', ' ', body[:matches[0].start()]).strip()
        if lead:
            sections.append({"heading": None, "body": lead})
    for idx, m in enumerate(matches):
        start = m.end()
        end = matches[idx + 1].start() if idx + 1 < len(matches) else len(body)
        text = re.sub(r'\s+', ' ', body[start:end]).strip()
        if text:
            sections.append({"heading": m.group(1), "body": text})
    return sections

def make_name(row):
    """Best display name: known target name → subtype → target_no."""
    name = clean(row.get('target_name', ''))
    if name and name.lower() not in ('unknown',):
        # strip surrounding quotes Excel sometimes adds
        name = name.strip('"').strip("'")
        return name
    sub = clean(row.get('subtype', ''))
    if sub:
        return sub
    return row.get('target_no', 'Unknown')

def make_id(row, name):
    """Always use the LU number as the URL slug for consistent naming."""
    return row.get('target_no', '').lower().replace(' ', '-')

def make_type(row):
    """Type (New) column value, or None if missing/NA."""
    return clean(row.get('Type (New)'))

def make_status(row):
    fs = (row.get('sc_current_footage_status') or '').strip().lower()
    return FOOTAGE_STATUS_MAP.get(fs, 'never-explored')

def make_tagline(row, name):
    """Short one-sentence blurb, used for the page's meta/og description only
    (not shown on cards — target_description is now full multi-paragraph text)."""
    desc = clean(row.get('target_description', ''))
    if desc and desc.lower() not in ('unknown', 'na', 'shipwreck'):
        blurb = make_short_blurb(strip_description_frontmatter(desc))
        if blurb:
            return blurb
    css = clean(row.get('css_description', ''))
    if css and css.lower() not in ('unknown', 'na', 'shipwreck'):
        blurb = make_short_blurb(css)
        if blurb:
            return blurb
    sub = clean(row.get('Class (New)', ''))
    if sub and sub.lower() not in ('unknown', 'na', 'shipwreck'):
        return sub
    return f"{name} — {make_type(row) or 'Unknown'}"

def make_location(row):
    """No dedicated location column — build from what we have."""
    return "Lake Union, Seattle"

def make_embed_url(url):
    """Convert a YouTube or Vimeo watch URL into an embeddable URL."""
    m = re.search(r'(?:v=|youtu\.be/)([A-Za-z0-9_-]{11})', url)
    if m:
        return f'https://www.youtube.com/embed/{m.group(1)}'
    m = re.search(r'vimeo\.com/(\d+)', url)
    if m:
        return f'https://player.vimeo.com/video/{m.group(1)}'
    return url

def make_footage_items(row):
    """Return a list of {label, url} embeds: Shipwreck City footage, then DCS scuba footage."""
    items = []
    sc = clean(row.get('sc_video_url', ''))
    if sc:
        items.append({"label": "Shipwreck City Footage", "url": make_embed_url(sc)})
    dcs = clean(row.get('dcs_video_url', ''))
    if dcs:
        for part in dcs.split(','):
            part = part.strip()
            if part:
                items.append({"label": "DCS Scuba Footage", "url": make_embed_url(part)})
    return items

def make_summary(row):
    v = clean(row.get('target_description', ''))
    if v and v.lower() not in ('unknown', 'na', 'shipwreck'):
        return v
    return None

# ── Main ──────────────────────────────────────────────────────────────────────

def find_csv():
    archive_dir = os.path.normpath(os.path.join(os.path.dirname(__file__), '..', 'data', 'archive'))
    pattern     = os.path.join(archive_dir, 'target_master_archive_*.csv')
    files       = glob.glob(pattern)
    if not files:
        raise FileNotFoundError("No target_master_archive_*.csv found in data/archive/.")
    return max(files, key=os.path.getmtime)  # most recent by modification time

IMG_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.gif'}

def prefer_webp(filenames):
    """Return one filename per basename, preferring .webp when both exist."""
    by_base = {}
    for fname in filenames:
        base, ext = os.path.splitext(fname)
        if ext.lower() not in IMG_EXTENSIONS:
            continue
        if base not in by_base or ext.lower() == '.webp':
            by_base[base] = fname
    return sorted(by_base.values())

def scan_images(slug, script_dir):
    """Scan img/targets/{slug}/ and return (hasPrimetime, gallery_files)."""
    img_dir = os.path.normpath(os.path.join(script_dir, '..', 'img', 'targets', slug))
    if not os.path.isdir(img_dir):
        return False, []
    deduped = prefer_webp(os.listdir(img_dir))
    has_primetime = False
    gallery = []
    for fname in deduped:
        name = os.path.splitext(fname)[0]
        if name.lower() == 'primetime':
            has_primetime = True
        else:
            gallery.append(fname)
    return has_primetime, gallery

def convert(csv_path):
    wrecks = []
    seen_ids = {}
    script_dir = os.path.dirname(os.path.abspath(__file__))

    with open(csv_path, newline='', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            target_no = (row.get('target_no') or '').strip()
            if not target_no:
                continue

            lat  = parse_coord(row.get('latitude'))
            lng  = parse_coord(row.get('longitude'))
            coords = [lat, lng] if (lat is not None and lng is not None) else None

            name = make_name(row)
            slug = make_id(row, name)

            # deduplicate slugs
            if slug in seen_ids:
                seen_ids[slug] += 1
                slug = f"{slug}-{seen_ids[slug]}"
            else:
                seen_ids[slug] = 1

            catalog = f"#{target_no.upper()}"
            has_primetime, images = scan_images(slug, script_dir)

            wreck = {
                "id":          slug,
                "name":        name,
                "catalog":     catalog,
                "type":        make_type(row) or DASH,
                "class":       clean(row.get('Class (New)')) or DASH,
                "material":    clean(row.get('Subclass (New)')) or DASH,
                "year":        None,
                "yearNote":    None,
                "depth":       parse_depth(row.get('water_depth_ft')),
                "coordinates": coords,
                "location":    make_location(row),
                "status":      make_status(row),
                "tagline":     make_tagline(row, name),
                "summary":     make_summary(row),
                "summarySections": make_summary_sections(row),
                "dimensions":  parse_dimensions(row.get('dimensions_ft')),
                "footageItems": make_footage_items(row),
                "hasPrimetime": has_primetime,
                "images":      images,
                "newTarget":   (row.get('sc_newly_uncovered_wreck') or '').strip().lower() == 'yes',
                "diveDuration": (lambda v: float(v) if v else None)(clean(row.get('sc_rov_dive_duration'))),
                "css_url":     clean(row.get('css_url')),
                "dcs_url":     clean(row.get('dcs_history_url')),
                "luvm_url":    clean(row.get('luvm_url')),
            }
            wrecks.append(wreck)

    return wrecks

def js_value(v, indent=6):
    """Render a Python value as a JS literal."""
    pad = ' ' * indent
    if v is None:
        return 'null'
    if isinstance(v, bool):
        return 'true' if v else 'false'
    if isinstance(v, (int, float)):
        return repr(v)
    if isinstance(v, str):
        escaped = (v.replace('\\', '\\\\').replace('"', '\\"').replace('`', '\\`').replace('${', '\\${')
                    .replace('\r\n', '\\n').replace('\n', '\\n').replace('\r', '\\n'))
        return f'"{escaped}"'
    if isinstance(v, list):
        if not v:
            return '[]'
        inner = ', '.join(js_value(i) for i in v)
        return f'[{inner}]'
    if isinstance(v, dict):
        inner = ', '.join(f'{k}: {js_value(val)}' for k, val in v.items())
        return f'{{{inner}}}'
    return repr(v)

def wreck_to_js(w):
    lines = ['  {']
    fields = [
        'id', 'name', 'catalog', 'type', 'class', 'material', 'year', 'yearNote',
        'depth', 'coordinates', 'location', 'status', 'tagline',
        'summary', 'summarySections', 'dimensions',
        'footageItems', 'hasPrimetime', 'images', 'newTarget', 'diveDuration',
        'css_url', 'dcs_url', 'luvm_url',
    ]
    for key in fields:
        val = w.get(key)
        lines.append(f'    {key}: {js_value(val)},')
    lines.append('  }')
    return '\n'.join(lines)

def site_config_to_js(cfg):
    lines = ['const SITE_CONFIG = {']
    lines.append(f'  title: "{cfg["title"]}",')
    lines.append(f'  tagline: "{cfg["tagline"]}",')
    lines.append(f'  location: "{cfg["location"]}",')
    coords = cfg["coordinates"]
    lines.append(f'  coordinates: [{coords[0]}, {coords[1]}], // map center')
    lines.append(f'  mapZoom: {cfg["mapZoom"]},')
    lines.append('  social: {')
    for k, v in cfg['social'].items():
        lines.append(f'    {k}: "{v}",')
    lines.append('  }')
    lines.append('};')
    return '\n'.join(lines)

def scan_photo_dir(folder_name, script_dir):
    """Return sorted list of image filenames in img/{folder_name}/, preferring .webp."""
    img_dir = os.path.normpath(os.path.join(script_dir, '..', 'img', folder_name))
    if not os.path.isdir(img_dir):
        return []
    return prefer_webp(os.listdir(img_dir))

def write_photos_js(script_dir, csv_path):
    fieldwork    = scan_photo_dir('main-fieldwork', script_dir)
    journey      = scan_photo_dir('supporters-page', script_dir)
    about        = scan_photo_dir('about-page', script_dir)
    csv_basename = os.path.basename(csv_path)

    lines = [
        '// AUTO-GENERATED by tools/csv_to_wrecks_data.py — do not edit by hand.',
        f'const FIELDWORK_PHOTOS    = {json.dumps(fieldwork)};',
        f'const JOURNEY_PHOTOS      = {json.dumps(journey)};',
        f'const ABOUT_PHOTOS        = {json.dumps(about)};',
        f'const ARCHIVE_CSV_FILENAME = {json.dumps(csv_basename)};',
    ]
    out = os.path.normpath(os.path.join(script_dir, '..', 'js', 'photos-data.js'))
    with open(out, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')
    print(f"Written: {out}  ({len(fieldwork)} fieldwork, {len(journey)} journey, {len(about)} about photos)")

def main():
    csv_path = find_csv()
    print(f"Reading: {csv_path}")
    wrecks = convert(csv_path)
    print(f"Parsed {len(wrecks)} wrecks.")

    script_dir = os.path.dirname(os.path.abspath(__file__))
    write_photos_js(script_dir, csv_path)

    out_path = os.path.join(os.path.dirname(__file__), '..', 'js', 'wrecks-data.js')
    out_path = os.path.normpath(out_path)

    header = """\
/**
 * ============================================================
 *  SHIPWRECK CITY — WRECK DATA CONFIG
 *  AUTO-GENERATED by tools/csv_to_wrecks_data.py
 *  Do not edit by hand — edit the CSV and re-run the script.
 * ============================================================
 *
 *  FIELDS:
 *  id          — unique slug, used in URLs: /archive/your-id.html
 *  name        — display name of the wreck
 *  catalog     — catalog number shown on cards (e.g. "WR — LU001")
 *  type        — CSV "Type (New)" column, or "—" if missing/NA
 *  class       — CSV "Class (New)" column, or "—" if missing/NA
 *  material    — CSV "Subclass (New)" column, or "—" if missing/NA
 *  year        — year sunk (or estimated)
 *  yearNote    — optional note like "est." or "c."
 *  depth       — depth in feet
 *  coordinates — [lat, lng] for map pin (decimal degrees)
 *  location    — human-readable location description
 *  status      — "documented" | "unidentified" | "partial"
 *  tagline     — one-sentence blurb used for meta/og description tags only
 *  summary     — full raw target_description text
 *  summarySections — target_description split into [{heading, body}] for the
 *               detail page's Overview (heading is null for unstructured text)
 *  dimensions  — e.g. "62ft × 18ft" or null
 *  footageItems — list of {label, url} YouTube/Vimeo embeds, or []
 *  images      — gallery filenames inside img/targets/{id}/ (e.g. ["01.jpg","02.jpg"])
 *               Homepage tile uses primetime.{jpg|png|webp} automatically — no entry needed here.
 */
"""

    wreck_js_entries = ',\n'.join(wreck_to_js(w) for w in wrecks)
    output = (
        header + '\n'
        + site_config_to_js(SITE_CONFIG) + '\n\n'
        + 'const WRECKS = [\n'
        + wreck_js_entries + '\n'
        + '];\n'
    )

    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(output)

    print(f"Written: {out_path}")
    print(f"  {len(wrecks)} wrecks, {sum(1 for w in wrecks if w['coordinates'])} with GPS coordinates.")

    # Copy the current CSV from data/archive/ up to data/ for the download link
    data_dir     = os.path.normpath(os.path.join(os.path.dirname(__file__), '..', 'data'))
    current_basename = os.path.basename(csv_path)
    dest = os.path.join(data_dir, current_basename)
    # Remove any stale dated CSVs from data/ (previous versions)
    for stale in glob.glob(os.path.join(data_dir, 'target_master_archive_*.csv')):
        if os.path.basename(stale) != current_basename:
            os.remove(stale)
            print(f"Removed stale: {stale}")
    shutil.copy2(csv_path, dest)
    print(f"Download copy: {dest}")

if __name__ == '__main__':
    main()
