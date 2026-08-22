/**
 * ============================================================
 *  SHIPWRECK CITY — EVENTS DATA
 *  Add new talks, lectures, and public events here — newest first.
 *  Used by events.html.
 * ============================================================
 *
 *  FIELDS:
 *  title       — event name
 *  month       — 3-letter month for the date badge (e.g. "SEP")
 *  day         — day of month for the date badge (e.g. "09")
 *  year        — full year for the date badge (e.g. "2026")
 *  time        — display time range (e.g. "6:30 – 8:30 PM")
 *  venue       — venue name
 *  address     — city/state, or null
 *  description — 1-3 sentence summary
 *  url         — link to the event page / registration
 *  ctaLabel    — text for the link button
 *  image       — path to a photo shown alongside the entry, or null
 *  imagePosition — "left" (default) or "right" — which side of the card the photo sits on
 */

const EVENTS = [
  {
    title: "Beneath the Surface — Exploring Seattle's Historical Shipwrecks",
    month: "SEP",
    day: "09",
    year: "2026",
    time: "6:30 – 8:30 PM",
    venue: "Cascadia Art Museum",
    address: "Edmonds, WA",
    image: "img/about-page/PhilROV.webp",
    description: "Over one hundred targets of interest (including barges, shipwrecks, and cars) lie at the bottom of Lake Union. Gaps remain in this chapter of Seattle’s maritime history, and the newly-founded Shipwreck City project is working to film never-before-seen wrecks with the help of Finn, a blue remote-controlled robot the size of a microwave. Hear stories from the Shipwreck City team as they build the most up-to-date Seattle shipwreck archive and work to uncover what lies just beneath the surface of our city’s beloved central lake.",
    url: "https://www.cascadiaartmuseum.org/lectures/",
    ctaLabel: "Learn More & Reserve →"
  },
  {
    title: "Lectures on Tap",
    month: "",
    day: "TBD",
    year: "Nov–Dec 2026",
    time: "Date & Time TBA",
    venue: "Location TBD",
    address: "Seattle, WA",
    image: "img/targets/lu069/primetime.webp",
    imagePosition: "right",
    description: "Lectures on Tap is a national event series that brings professors and experts into local bars for laid-back, 45-minute talks followed by audience Q&A over a drink. Shipwreck City is bringing its Lake Union shipwreck survey to a Seattle taproom near you — exact date and venue are still being finalized.",
    url: "https://lecturesontap.com/",
    ctaLabel: "Visit Lectures on Tap →"
  }
];
