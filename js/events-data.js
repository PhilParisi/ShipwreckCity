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
 *  time        — display time range (e.g. "6:30 – 8:30 PM"), or null to hide
 *  venue       — venue name
 *  address     — city/state, or null
 *  description — 1-3 sentence summary
 *  url         — link to the event page / registration (omit to hide the button)
 *  ctaLabel    — text for the link button
 *  image       — path to a photo shown alongside the entry, or null
 *  imagePosition — "left" (default) or "right" — which side of the card the photo sits on
 *  badge       — short access/notice label(s) shown on the card (e.g. "Members Only"). A string, an array of strings, or null
 *  recap       — optional array of { src, alt, caption } photos shown along the bottom of the card (e.g. event recap photos)
 *  past        — true if the event has already happened (shows in the Previous Events section)
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
    badge: ["Past Event", "Sold Out"],
    past: true,
    recap: [
      { src: "img/events/cascadia_phillibbiestart.webp", alt: "Phil Parisi and Libbie Barnes in front of the 'Beneath the Surface' title slide", caption: "Opening remarks — \"Beneath the Surface,\" by Phil and Libbie" },
      { src: "img/events/cascadia_phil61.webp",          alt: "Phil Parisi presenting a slide reading 'How many wrecks? 61 and counting...'", caption: "61 wrecks documented, and counting" },
      { src: "img/events/cascadia_evantable.webp",       alt: "Evan Weber speaking with attendees at the Shipwreck City info table", caption: "Evan discussing the archive with attendees" },
      { src: "img/events/cascadia_phillibbie.webp",      alt: "Phil Parisi and Libbie Barnes in front of a 'Thank you, ShipwreckCity.org' closing slide", caption: "\"Thank you, ShipwreckCity.org\"" }
    ],
    description: "Over one hundred targets of interest (including barges, shipwrecks, and cars) lie at the bottom of Lake Union. Gaps remain in this chapter of Seattle’s maritime history, and the newly-founded Shipwreck City project is working to film never-before-seen wrecks with the help of Finn, a blue remote-controlled robot the size of a microwave. Hear stories from the Shipwreck City team as they build the most up-to-date Seattle shipwreck archive and work to uncover what lies just beneath the surface of our city’s beloved central lake.",
  },
  {
    title: "Igniter Evening: Mysteries from the Deep",
    month: "NOV",
    day: "05",
    year: "2026",
    time: "6:00 – 9:00 PM",
    venue: "Pacific Science Center",
    address: "200 Sue Bird Court N, Seattle, WA",
    image: "img/events/pacsci_mysteries-deep.webp",
    badge: "Private Event",
    description: "Shipwreck City joins Pacific Science Center's private Igniter Evening, celebrating their <em>Mysteries from the Deep: Exploring Underwater Archaeology</em> exhibition, to share how underwater robotics are uncovering the shipwrecks and submerged history hidden beneath Lake Union.",
    url: "https://pacificsciencecenter.org/events/igniter-mysteries-event/",
    ctaLabel: "View Event Details →"
  },
  {
    title: "Lectures on Tap",
    month: "NOV",
    day: "10",
    year: "2026",
    time: "6:30 – 8:30 PM",
    venue: "Old Stove Brewing (Ship Canal)",
    address: "600 W Nickerson St, Seattle, WA",
    image: "img/targets/lu069/primetime.webp",
    imagePosition: "right",
    description: "Lectures on Tap is a national event series that brings professors and experts into local bars for laid-back, 45-minute talks followed by audience Q&A over a drink. Shipwreck City is bringing its Lake Union shipwreck survey to Old Stove Brewing's Ship Canal taproom.",
    url: "https://www.eventbrite.com/e/lectures-on-tap-beneath-lake-union-seattles-hidden-shipwrecks-tickets-2003224777234",
    ctaLabel: "Get Tickets →"
  },
  {
    title: "An Evening with Shipwreck City",
    month: "MAR",
    day: "03",
    year: "2027",
    time: "7:00 PM",
    venue: "Seattle Yacht Club",
    address: "Portage Bay, Seattle, WA",
    image: "img/about-page/IMG_5683.webp",
    badge: "Members Only",
    description: "Phil Parisi brings the Shipwreck City project to Seattle Yacht Club's Portage Bay clubhouse for an evening exploring the sunken vessels resting beneath Lake Union and the surrounding waterways.",
    url: "https://www.seattleyachtclub.org/",
    ctaLabel: "Learn More →"
  }
];
