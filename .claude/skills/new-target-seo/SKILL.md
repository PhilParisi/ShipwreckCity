---
name: new-target-seo
description: Rebuild the ShipwreckCity wreck pages and set up SEO (title, meta description, image alt text) from the master archive CSV. Use whenever a new target_master_archive CSV is added or updated, or a new LUxxx target is added to the site.
---

# New archive / new-target rebuild and SEO

ShipwreckCity's per-target SEO lives in the master archive CSV
(`data/archive/target_master_archive_<date>.csv`), in the `seo_title` and
`seo_description` columns. The pipeline carries them through:

    CSV  →  tools/csv_to_wrecks_data.py  →  js/wrecks-data.js (seoTitle, seoDescription)
         →  node generate-wrecks.js      →  lu-archive/luXXX.html (one real page per target:
                                             <head> tags + static copy of the page content)
                                          →  lu-archive.html (static table row + link per target)
                                          →  per-photo alt text + Google Images license data
                                             (JSON-LD) in each wreck page, from imageAltText() and
                                             IMAGE_LICENSE in js/site.js
                                          →  sitemap.xml, listing every photo under its page, with a <lastmod> per page (date only
                                             changes when that page's content changes; fingerprints
                                             kept in data/sitemap-lastmod.json — commit it too)
                                          →  static nav + footer in every page (built from
                                             buildNav()/buildFooter() in js/site.js, between
                                             STATIC-NAV / STATIC-FOOTER markers — rerun the build
                                             after changing NAV_LINKS)
                                          →  "Last Update" stat on project.html / press.html
                                             (any data-archive-date element), set from the
                                             current archive CSV's filename date
                                          →  wrecks/luXXX.html + archive.html (redirects from the
                                             pre-Aug-2026 addresses to /lu-archive/; never edit or
                                             delete these by hand, and keep them out of the sitemap)

Nothing runs on its own: the pages are only (re)built when those two
commands run. So **whenever a new or updated `target_master_archive_*.csv`
appears in `data/archive/` — new targets or not — run the pipeline (step 6)
without waiting to be asked**, then report what changed. The static page
content and archive rows exist so crawlers can read every target without
JavaScript; a stale build means Google sees stale text.

`seo_title` becomes the page `<title>`, og:/twitter: title, and (at runtime,
in `lu-archive/wreck-template.html`) the image alt text. `seo_description`
becomes the meta/og:/twitter: description. There is no separate SEO file
any more — the old `js/seo-data.js` was retired in Oct 2026.

The master CSV is the user's own spreadsheet. If a new target's row already
has `seo_title`/`seo_description`, just run the pipeline. If they're blank,
draft them (steps below) and **propose them to the user**. Never write to
the master CSV without the user explicitly asking for that edit.

Do the SEO steps automatically whenever a new target (new LUxxx id) is
added — don't wait to be asked. For a new archive CSV with no new targets,
skip to step 6. (For new targets, the image/webp steps in the saved
new-target workflow notes still apply too.)

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

5. **Propose the values to the user** and stop there. They add them to
   their master sheet. Only edit `data/archive/target_master_archive_*.csv`
   yourself if the user explicitly asks you to make that specific edit.

6. **Run the pipeline** from the project root:

   ```
   python3 tools/csv_to_wrecks_data.py
   node generate-wrecks.js
   ```

   Both scripts warn if any target is missing `seo_title`/`seo_description`
   — there should be zero warnings. `generate-wrecks.js` should report one
   page per target, the same number of static rows written into
   `lu-archive.html`, and the sitemap URL count. Then confirm, for each new
   or changed target:
   - `lu-archive/luXXX.html` exists and its `<title>`, meta description and
     canonical URL reflect the CSV values;
   - the raw HTML inside `<main id="wreck-page">` contains the target's
     name, write-up and (if it has one) primetime image with alt text — i.e.
     the static content was written, not just the head tags;
   - `lu-archive.html` has a static row linking to `lu-archive/luXXX`
     between the `STATIC-ROWS` markers, and `sitemap.xml` lists the page.

   If the wreck page layout in `lu-archive/wreck-template.html` was changed,
   mirror it in `staticBodyFor()` in `generate-wrecks.js` before rebuilding.
   The rebuilt pages still need to be committed and pushed by the user to go
   live — together with `data/sitemap-lastmod.json`, or the next build will
   re-date pages.

   The build ends by listing **New pages** and **Changed pages** (those whose
   sitemap `<lastmod>` moved to today). Hand that list to the user as the
   Search Console step: after they push, Request indexing for the new wreck
   pages (and any important changed ones), ~10/day. If it says "No page
   content changed", tell them no Search Console step is needed.
