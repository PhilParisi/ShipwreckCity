# Shipwreck City

An interactive archive of Lake Union's sunken vessels (and beyond). Built as a static site for GitHub Pages.

---

## Quick start

```bash
# Clone your repo and open the folder
cd shipwreck-city

# Preview locally (requires Node.js)
npx serve . -p 3000
# → open http://localhost:3000
```

---

## Adding or editing a wreck

**All wreck data lives in one file: `js/wrecks-data.js`**

Open it, find the `WRECKS` array, and add a new entry:

```js
{
  id: "my-new-wreck",          // URL slug → /wrecks/my-new-wreck.html
  name: "The Mystery Vessel",
  catalog: "WR — 004",
  type: "Fishing Vessel",
  year: 1938,
  yearNote: null,              // e.g. "est." or "c." — or null
  depth: 33,
  coordinates: [47.6390, -122.3350],  // [lat, lng]
  location: "East basin, Lake Union",
  status: "documented",        // "documented" | "unidentified" | "partial"
  tagline: "A one-line teaser shown on the homepage card.",
  summary: "Paragraph shown at top of the wreck's detail page.",
  history: "Historical context paragraph.",
  discovery: "How/when it was found.",
  dimensions: "55ft × 16ft",   // or null
  footage: "https://www.youtube.com/embed/VIDEO_ID",  // or null
  images: ["img/my-new-wreck-hero.jpg"],              // or []
  featured: true
}
```

Then run:

```bash
node generate-wrecks.js
```

This creates `/wrecks/my-new-wreck.html`. That's it.

---

## Adding images

Put images in the `/img/` folder. Reference them in the wreck's `images` array:

```js
images: ["img/the-laurelhurst-01.jpg", "img/the-laurelhurst-02.jpg"]
```

The first image is used as the hero image on the wreck's detail page.

---

## Adding dive footage

Paste a YouTube or Vimeo **embed URL** (not the watch URL) into the `footage` field:

```js
// YouTube: use /embed/VIDEO_ID format
footage: "https://www.youtube.com/embed/dQw4w9WgXcQ"

// Vimeo: use /video/VIDEO_ID format
footage: "https://player.vimeo.com/video/123456789"
```

---

## Deploying to GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Set source to **GitHub Actions**

From then on, every push to `main` automatically:
- Runs `generate-wrecks.js` to build wreck pages
- Deploys the full site to GitHub Pages

Your site will be at: `https://YOUR-USERNAME.github.io/REPO-NAME/`

---

## Site structure

```
shipwreck-city/
├── index.html              ← Homepage (wreck grid + map)
├── map.html                ← Full map page
├── archive.html            ← Filterable table of all wrecks
├── about.html              ← About the project
├── css/
│   └── style.css           ← All styles
├── js/
│   ├── wrecks-data.js      ← ★ EDIT THIS to add/edit wrecks
│   └── site.js             ← Shared nav, footer, helpers
├── wrecks/
│   ├── wreck-template.html ← Template (do not rename)
│   ├── the-laurelhurst.html
│   ├── unknown-hull-02.html
│   └── the-portlander.html
├── img/                    ← Put wreck images here
├── generate-wrecks.js      ← Build script
├── package.json
└── .github/
    └── workflows/
        └── deploy.yml      ← Auto-deploy on push to main
```

---

## Customising site-wide settings

At the top of `js/wrecks-data.js`, edit `SITE_CONFIG`:

```js
const SITE_CONFIG = {
  title: "Shipwreck City",
  tagline: "An underwater archive of Seattle's sunken past.",
  location: "Lake Union · Seattle, WA",
  coordinates: [47.6380, -122.3383], // map center
  mapZoom: 14,
  social: {
    instagram: "@shipwreckcity",
    youtube: "",
    email: "hello@shipwreckcity.com"
  }
};
```
