---
name: new-target-seo
description: Set up SEO (title, meta description, image alt text) for a newly added ShipwreckCity target. Use whenever a new LUxxx target is added to the site.
---

# New-target SEO setup

ShipwreckCity's per-target SEO lives in the master archive CSV
(`data/archive/target_master_archive_<date>.csv`), in the `seo_title` and
`seo_description` columns. The pipeline carries them through:

    CSV  →  tools/csv_to_wrecks_data.py  →  js/wrecks-data.js (seoTitle, seoDescription)
         →  node generate-wrecks.js      →  lu-archive/luXXX.html <head> tags + sitemap.xml

`seo_title` becomes the page `<title>`, og:/twitter: title, and (at runtime,
in `lu-archive/wreck-template.html`) the image alt text. `seo_description`
becomes the meta/og:/twitter: description. There is no separate SEO file
any more — the old `js/seo-data.js` was retired in Oct 2026.

The master CSV is the user's own spreadsheet. If a new target's row already
has `seo_title`/`seo_description`, just run the pipeline. If they're blank,
draft them (steps below) and hand them to the user to paste into their
master sheet — don't silently invent values in their CSV.

Do this automatically whenever a new target (new LUxxx id) is added —
don't wait to be asked.

## Steps

1. **Read the target's data** in the CSV (or `js/wrecks-data.js`) for the
   new id: name, type, dimensions, depth, location, and the
   `target_description` sections (Shipwreck City Data / Prior Research and
   Theories / Additional Context). Only use facts actually present there —
   never invent history, dates, or provenance.

2. **Write a title**, ideally ≤60 characters (Google truncates around
   there), following the established pattern:

   `<Descriptor> | <Location>, Seattle, WA`

   - Descriptor: brief and concrete — e.g. `28' Wooden Boat`, `Metal Frame
     Debris`, `Lakebed Cables`. Use "Suspected" (not "possible") for
     targets whose `Type (New)` is `Undetermined`. Skip the word "Sunken"
     for debris fields/objects — just name the object. Don't call
     something a wreck/boat if it isn't one (e.g. a chest, cables, a
     structure).
   - Location suffix: `Lake Union, Seattle, WA` for nearly everything;
     `Ballard Ship Canal, Seattle, WA` only for targets actually located in
     the Ballard Ship Canal (LU099–LU101 are the only precedent so far —
     check the target's actual location, don't assume).

3. **Write a description**, ~70–160 characters, incorporating dimensions,
   depth, and location, plus a real historical detail if the target has one
   (e.g. prior military/commercial service). No invented facts. Match the
   user's edited tone: state what's there plainly. Avoid hedges like "not
   yet independently confirmed", "awaiting its first ROV dive", or "believed
   to rest" — the user removed these across the archive in Oct 2026. Where
   a caveat is genuinely needed, "not yet fully surveyed" is the accepted
   phrasing. End with a period.

4. **Check for collisions** against the other targets' `seo_title` /
   `seo_description` values in the CSV:
   - Exact-duplicate title or description.
   - Near-duplicate phrasing — if in doubt, diff the new description
     against a few similar existing ones (e.g. via
     `difflib.SequenceMatcher`); a ratio above ~0.90 means rewrite it with
     more varied language.

5. **Get the values into the CSV.** Give the drafted title/description to
   the user for their master sheet (or, if they ask, edit the CSV in
   `data/archive/` directly).

6. **Run the pipeline** from the project root:

   ```
   python3 tools/csv_to_wrecks_data.py
   node generate-wrecks.js
   ```

   Both scripts warn if any target is missing `seo_title`/`seo_description`
   — there should be zero warnings. Confirm the new page's `<title>`, meta
   description, canonical URL, and image alt text (grep the generated
   `lu-archive/luXXX.html`) reflect the CSV values.
