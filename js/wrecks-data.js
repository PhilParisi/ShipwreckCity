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
 *  images      — gallery filenames inside img/wrecks/{id}/ (e.g. ["01.jpg","02.jpg"])
 *               Homepage tile uses primetime.{jpg|png|webp} automatically — no entry needed here.
 *  featured    — true = shown in homepage spotlight
 */

const SITE_CONFIG = {
  title: "Shipwreck City",
  tagline: "An underwater archive of Seattle's sunken past.",
  location: "Lake Union · Seattle, WA",
  coordinates: [47.6380, -122.3383], // map center
  mapZoom: 14,
  social: {
    instagram: "@philparisi_",   // e.g. "@shipwreckcity"
    youtube: "https://www.youtube.com/@philparisi_",
    email: "Phil.Parisi@RemoteCoastSystems.com"
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
  },
  {
    id: "the-resolute",
    name: "The Resolute",
    catalog: "WR — 004",
    type: "Pile Driver Barge",
    year: 1936,
    yearNote: null,
    depth: 35,
    coordinates: [47.6390, -122.3355],
    location: "East basin, Lake Union",
    status: "documented",
    tagline: "A sunken work barge, her pile-driving rig still upright.",
    summary: "The Resolute capsized during a heavy windstorm in November 1936, taking her crew's tools and most of her deck equipment to the bottom. Her iron pile-driving frame still stands vertically, creating an eerie artificial reef at 35 feet.",
    history: "Operated by the Puget Sound Harbor Works Co., the Resolute was a fixture on Lake Union throughout the 1920s and '30s, sinking dock pilings for the growing industrial waterfront. She was uninsured at the time of her loss.",
    discovery: "Located by commercial divers during a dock survey in 1998. Hull condition assessed as stable. Catalogued 2023.",
    dimensions: "80ft × 24ft",
    footage: null,
    images: [],
    featured: false
  },
  {
    id: "gasoline-tender-5",
    name: "Tender No. 5",
    catalog: "WR — 005",
    type: "Gasoline Launch",
    year: 1918,
    yearNote: null,
    depth: 12,
    coordinates: [47.6355, -122.3440],
    location: "West shoreline, Lake Union",
    status: "partial",
    tagline: "A shallow-water launch, hull intact but identity elusive.",
    summary: "Resting in just 12 feet of water along the west shore, Tender No. 5 is named for a partial registry plate recovered from her transom. She is one of the shallowest catalogued wrecks in the survey area, accessible to snorkelers.",
    history: "Small gasoline launches of this type were used extensively on Lake Union as crew tenders, supply runners, and pleasure craft in the early 20th century. The specific vessel's history prior to sinking remains unclear.",
    discovery: "First noted by a kayaker in 2018 during low-water conditions. Diving survey completed 2022.",
    dimensions: "26ft × 8ft",
    footage: null,
    images: [],
    featured: false
  },
  {
    id: "unknown-hull-06",
    name: "Unknown Hull",
    catalog: "WR — 006",
    type: "Unidentified",
    year: null,
    yearNote: "est. 1920s–30s",
    depth: 51,
    coordinates: [47.6402, -122.3310],
    location: "Deep channel, northeast quadrant",
    status: "unidentified",
    tagline: "The deepest wreck in the survey — identity unknown.",
    summary: "At 51 feet, this is the deepest wreck documented in the Lake Union survey. She is heavily silted and partially buried at the bow. Visibility at depth is typically under 5 feet. Only experienced divers should attempt.",
    history: "The construction indicates a medium-sized commercial vessel, possibly a small freighter or passenger barge. The deep channel she rests in was dredged repeatedly in the 1920s, which may explain the obscured wreckage.",
    discovery: "Detected via multibeam sonar in 2022. First physically dived in 2023. No identifying features recovered.",
    dimensions: null,
    footage: null,
    images: [],
    featured: false
  },
  {
    id: "the-westlake-ferry",
    name: "The Westlake",
    catalog: "WR — 007",
    type: "Passenger Ferry",
    year: 1929,
    yearNote: null,
    depth: 22,
    coordinates: [47.6330, -122.3370],
    location: "South basin, Lake Union",
    status: "partial",
    tagline: "A Depression-era ferry that never made her final crossing.",
    summary: "The Westlake operated a short passenger route across the south basin of Lake Union from 1924 until she was scuttled in 1929 after the operator went bankrupt. Her wooden superstructure has collapsed, but the steel-reinforced hull remains largely intact.",
    history: "The Westlake Ferry Co. ran a six-day-a-week crossing service for workers commuting between the Eastlake and Westlake neighborhoods before the Aurora Bridge made it obsolete. The company folded in the first year of the Depression.",
    discovery: "Long known to local divers as 'The Flat One' for her barge-like profile. Formally identified from property records in 2021.",
    dimensions: "54ft × 22ft",
    footage: null,
    images: [],
    featured: false
  },
  {
    id: "the-mrs-caldwell",
    name: "The Mrs. Caldwell",
    catalog: "WR — 008",
    type: "Steam Launch",
    year: 1911,
    yearNote: null,
    depth: 17,
    coordinates: [47.6420, -122.3450],
    location: "Northwest cove, Lake Union",
    status: "documented",
    tagline: "A private steam launch, sunk at anchor in a winter gale.",
    summary: "Named for the wife of her original owner, the Mrs. Caldwell is a well-preserved private steam launch resting at 17 feet. Her brass fittings have long since been recovered by divers, but her hull, boiler, and drive shaft remain in place.",
    history: "Commissioned in 1909 by a timber merchant named R.A. Caldwell for recreational use on Lake Union and Lake Washington. She sank at anchor during a severe November windstorm in 1911, just two years after her launch.",
    discovery: "Identified from a 1911 newspaper account of the sinking and confirmed by hull measurements in 2020.",
    dimensions: "38ft × 10ft",
    footage: null,
    images: [],
    featured: false
  }
];
