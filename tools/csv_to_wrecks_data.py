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
    """Use subtype if informative, else type column."""
    sub = clean(row.get('subtype', ''))
    typ = clean(row.get('type', ''))
    if sub and sub.lower() not in ('unknown', 'shipwreck'):
        return sub
    return typ or 'Unknown'

def make_status(row):
    fs = (row.get('sc_current_footage_status') or '').strip().lower()
    return FOOTAGE_STATUS_MAP.get(fs, 'never-explored')

def make_tagline(row, name):
    """Short one-liner for cards."""
    desc = clean(row.get('target_description', ''))
    sub  = clean(row.get('subtype', ''))
    css  = clean(row.get('css_notes', ''))
    # prefer the most descriptive available field
    for candidate in (desc, css, sub):
        if candidate and candidate.lower() not in ('unknown', 'na', 'shipwreck'):
            return candidate
    return f"{name} — {make_type(row)}"

def make_location(row):
    """No dedicated location column — build from what we have."""
    return "Lake Union, Seattle"

# ── Main ──────────────────────────────────────────────────────────────────────

def find_csv():
    archive_dir = os.path.normpath(os.path.join(os.path.dirname(__file__), '..', 'data', 'archive'))
    pattern     = os.path.join(archive_dir, 'target_master_archive_*.csv')
    files       = sorted(glob.glob(pattern))
    if not files:
        raise FileNotFoundError("No target_master_archive_*.csv found in data/archive/.")
    return files[-1]   # most recent by filename sort

IMG_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.gif'}

def scan_images(slug, script_dir):
    """Scan img/wrecks/{slug}/ and return (hasPrimetime, gallery_files)."""
    img_dir = os.path.normpath(os.path.join(script_dir, '..', 'img', 'wrecks', slug))
    if not os.path.isdir(img_dir):
        return False, []
    has_primetime = False
    gallery = []
    for fname in sorted(os.listdir(img_dir)):
        name, ext = os.path.splitext(fname)
        if ext.lower() not in IMG_EXTENSIONS:
            continue
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
                "type":        make_type(row),
                "subtype":     clean(row.get('subtype')),
                "year":        None,
                "yearNote":    None,
                "depth":       parse_depth(row.get('depth_ft')),
                "coordinates": coords,
                "location":    make_location(row),
                "status":      make_status(row),
                "tagline":     make_tagline(row, name),
                "summary":     "NA",
                "history":     "NA",
                "discovery":   "NA",
                "dimensions":  parse_dimensions(row.get('dimensions_ft')),
                "footage":     None,
                "hasPrimetime": has_primetime,
                "images":      images,
                "featured":    False,
                "newTarget":   (row.get('sc_newly_uncovered') or '').strip().lower() == 'yes',
                "diveDuration": (lambda v: float(v) if v else None)(clean(row.get('sc_rov_dive_duration'))),
                "css_url":     clean(row.get('css_url')),
                "dcs_url":     clean(row.get('dcs_url')),
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
        escaped = v.replace('\\', '\\\\').replace('"', '\\"').replace('`', '\\`').replace('${', '\\${')
        return f'"{escaped}"'
    if isinstance(v, list):
        if not v:
            return '[]'
        inner = ', '.join(js_value(i) for i in v)
        return f'[{inner}]'
    return repr(v)

def wreck_to_js(w):
    lines = ['  {']
    fields = [
        'id', 'name', 'catalog', 'type', 'subtype', 'year', 'yearNote',
        'depth', 'coordinates', 'location', 'status', 'tagline',
        'summary', 'history', 'discovery', 'dimensions',
        'footage', 'hasPrimetime', 'images', 'featured', 'newTarget', 'diveDuration',
        'css_url', 'dcs_url',
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
    """Return sorted list of image filenames in img/{folder_name}/."""
    img_dir = os.path.normpath(os.path.join(script_dir, '..', 'img', folder_name))
    if not os.path.isdir(img_dir):
        return []
    return sorted(
        f for f in os.listdir(img_dir)
        if os.path.splitext(f)[1].lower() in IMG_EXTENSIONS
    )

def write_photos_js(script_dir, csv_path):
    fieldwork    = scan_photo_dir('main-fieldwork', script_dir)
    journey      = scan_photo_dir('supporters-page', script_dir)
    csv_basename = os.path.basename(csv_path)

    lines = [
        '// AUTO-GENERATED by tools/csv_to_wrecks_data.py — do not edit by hand.',
        f'const FIELDWORK_PHOTOS    = {json.dumps(fieldwork)};',
        f'const JOURNEY_PHOTOS      = {json.dumps(journey)};',
        f'const ARCHIVE_CSV_FILENAME = {json.dumps(csv_basename)};',
    ]
    out = os.path.normpath(os.path.join(script_dir, '..', 'js', 'photos-data.js'))
    with open(out, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')
    print(f"Written: {out}  ({len(fieldwork)} fieldwork, {len(journey)} journey photos)")

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
 *  id          — unique slug, used in URLs: /wrecks/your-id.html
 *  name        — display name of the wreck
 *  catalog     — catalog number shown on cards (e.g. "WR — LU001")
 *  type        — vessel type label
 *  year        — year sunk (or estimated)
 *  yearNote    — optional note like "est." or "c."
 *  depth       — depth in feet
 *  coordinates — [lat, lng] for map pin (decimal degrees)
 *  location    — human-readable location description
 *  status      — "documented" | "unidentified" | "partial"
 *  tagline     — one-line description shown on cards
 *  summary     — longer paragraph for the wreck's detail page
 *  history     — background/historical context paragraph
 *  discovery   — how/when it was found paragraph
 *  dimensions  — e.g. "62ft × 18ft" or null
 *  footage     — YouTube or Vimeo embed URL, or null
 *  images      — gallery filenames inside img/wrecks/{id}/ (e.g. ["01.jpg","02.jpg"])
 *               Homepage tile uses primetime.{jpg|png|webp} automatically — no entry needed here.
 *  featured    — true = shown in homepage spotlight
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
