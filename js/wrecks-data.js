/**
 * ============================================================
 *  SHIPWRECK CITY — WRECK DATA CONFIG
 *  Edit this file to add, remove, or update wreck entries.
 *  Each wreck automatically gets its own page, map pin,
 *  and listing card on the homepage.
 * ============================================================
 *
 *  FIELDS:
 *  id          — unique slug, used in URLs: /wrecks/your-id.html
 *  name        — display name of the wreck
 *  catalog     — catalog number shown on cards (e.g. "WR — 001")
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
 *  images      — array of image paths or URLs (first = hero)
 *  featured    — true = shown in homepage spotlight
 */

const SITE_CONFIG = {
  title: "Shipwreck City",
  tagline: "An underwater archive of Seattle's sunken past.",
  location: "Lake Union · Seattle, WA",
  coordinates: [47.6380, -122.3383], // map center
  mapZoom: 14,
  social: {
    instagram: "",   // e.g. "@shipwreckcity"
    youtube: "",
    email: ""
  }
};

const WRECKS = [
  {
    id: "the-laurelhurst",
    name: "The Laurelhurst",
    catalog: "WR — 001",
    type: "Steam Tug",
    year: 1923,
    yearNote: null,
    depth: 28,
    coordinates: [47.6412, -122.3420],
    location: "Northwest quadrant, Lake Union",
    status: "documented",
    tagline: "A century-old steam tug resting upright on the silted floor.",
    summary: "The Laurelhurst is one of the most intact wrecks in Lake Union. She rests upright at 28 feet, her wheelhouse collapsed but hull largely intact. Visibility is typically 8–12 feet. A favorite of local divers.",
    history: "Built in 1901 at the Moran Brothers yard in Seattle, the Laurelhurst spent two decades hauling log booms across Lake Union and through the Ship Canal. She was decommissioned after a boiler fire in 1922 and scuttled the following year by her owner, a Mr. H.P. Whitmore of Eastlake.",
    discovery: "First documented by sport divers in 1987. Side-scan sonar confirmed identity in 2019 via recovered bell with partial name stamp.",
    dimensions: "62ft × 18ft",
    footage: null,
    images: [],
    featured: true
  },
  {
    id: "unknown-hull-02",
    name: "Unknown Hull",
    catalog: "WR — 002",
    type: "Unidentified",
    year: null,
    yearNote: "est. 1910s",
    depth: 42,
    coordinates: [47.6368, -122.3361],
    location: "Central basin, Lake Union",
    status: "unidentified",
    tagline: "A deep, anonymous hull — identity still unknown.",
    summary: "This vessel sits at 42 feet in the central basin, obscured by heavy silt and low visibility. Construction details suggest pre-1920s origin. No identifying markings have been recovered.",
    history: "The hull's construction method — double-planked cedar over steam-bent oak frames — is consistent with small commercial vessels built in the Puget Sound region between 1900 and 1925. The bow configuration suggests a workboat or small ferry.",
    discovery: "Discovered during a 2021 side-scan sonar survey of the lake bed. First dived in spring 2022. Remains unidentified.",
    dimensions: null,
    footage: null,
    images: [],
    featured: false
  },
  {
    id: "the-portlander",
    name: "The Portlander",
    catalog: "WR — 003",
    type: "Cargo Vessel",
    year: 1941,
    yearNote: null,
    depth: 19,
    coordinates: [47.6344, -122.3398],
    location: "South shoreline, Lake Union",
    status: "documented",
    tagline: "A WWII-era cargo vessel, lost to fire at her moorings.",
    summary: "The Portlander burned at her dock on the south shore in the summer of 1941 and sank in place. She lies in only 19 feet of water, heavily burned and broken, but recognizable. Her cargo hold is open and navigable.",
    history: "The Portlander was a small inter-lake cargo vessel, used primarily to ferry coal and building materials between Lake Union yards. She was owned by the Cascade Fuel Company of South Lake Union. The cause of the 1941 fire was never officially determined.",
    discovery: "Wellknown to local divers for decades. First formally catalogued for this project in 2023.",
    dimensions: "48ft × 14ft",
    footage: null,
    images: [],
    featured: true
  }
];
