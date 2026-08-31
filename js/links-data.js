/**
 * ============================================================
 *  SHIPWRECK CITY — LINKS & SUPPORTERS DATA
 *  Add all external links here. Used on the main page
 *  (supporter logos) and the Support page (full listings).
 * ============================================================
 *
 *  SUPPORTER FIELDS:
 *  name    — display name
 *  url     — external link (use "#" as placeholder if unknown)
 *  logo    — path relative to site root, or null if no logo
 *  type    — "marina" | "organization" | "individual"
 *  note    — short description shown on the Support page
 */

const SUPPORTERS = [
  {
    name: "Lake Union Virtual Museum",
    url:  "http://www.lakeunionhistory.org/Home.html",
    logo: "img/supporters-logo/luvm.webp",
    type: "organization",
    note: "Online museum dedicated to the history of Lake Union — a foundational inspiration for Shipwreck City's mission to document the lake's sunken heritage.",
    LOS:  "I am excited to see that Phil Parisi and Shipwreck City are continuing the work of exploring the shipwrecks of Lake Union. They are bringing passion and curiosity, together with expertise in un-manned submersibles, to document these shipwrecks and the lake bottom more thoroughly and vividly than has ever been done before. I look forward to new discoveries and new videos from Shipwreck City.",
    LOSAttrib: "Vaun Raymond, Creator"
  },
  {
    name: "United Indians of All Tribes Foundation",
    url:  "https://unitedindians.org",
    logo: "img/supporters-logo/uiatf.webp",
    type: "organization",
    note: "Stewards of the Northwest Native Canoe Center in South Lake Union — formally endorsed Shipwreck City's work mapping the environmental and cultural history of the lake.",
    LOS:  "As the stewards of the Northwest Native Canoe Center in South Lake Union, the United Indians of All Tribes Foundation is committed to working with all willing community stakeholders to gain an evolving understanding of current environmental conditions around the lake. We fully support Shipwreck City for mapping the lake like nobody else has.",
    LOSAttrib: "Michael Tulee, CEO"
  },
  {
    name: "DCS Films",
    url:  "http://www.dcsfilms.com/Site_4/DCS_Website.html",
    logo: "img/supporters-logo/dcslogo.webp",
    type: "organization",
    note: "Advanced technical divers (Dan, Carl, and Scott) dedicated to underwater cinematography who shared their Seattle dive logs and shipwreck footage.",
    LOS: "This project will continue on the work of many local individuals to educate the future by diving into the past.",
    LOSAttrib: "Dan Warter, President"
  },
  {
    name: "Museum of History & Industry (MOHAI)",
    url:  "https://mohai.org",
    logo: "img/supporters-logo/MOHAI-logo.webp",
    type: "organization",
    note: "Museum of History & Industry — letter of support acknowledging the archive's alignment with Seattle's broader maritime heritage mission.",
    LOS: "The Museum of History & Industry (MOHAI) supports the Shipwreck City Mapping Project for its contribution to documenting and preserving the layered history of Lake Union. The information gathered may serve as a valuable resource for future exhibitions, programming, and public interpretation. As a Lake Union Park institution, MOHAI is committed to the stewardship of this historical shared waterway and values projects that engage the community while expanding the historical record.",
    LOSAttrib: "Libbie Barnes, Associate Curator of Exhibits and Engagement"
  },
  {
    name: "Coastal Sensing and Survey",
    url:  "https://www.coastalsensing.com/",
    logo: "img/supporters-logo/css.webp",
    type: "organization",
    note: "Seattle-based survey company who established and made public the first comprehensive side scan sonar map of 98 targets in Lake Union."
  },
  {
    name: "Blue Robotics",
    url:  "https://bluerobotics.com/",
    logo: "img/supporters-logo/br-logo.webp",
    type: "organization",
    note: "Creators of BlueROV2 and BlueBoat — enabling marine robotic exploration through essential equipment donations and financial support."
  },
  {
    name: "Cerulean Sonar",
    url:  "https://ceruleansonar.com/",
    logo: "img/supporters-logo/cs-logo.webp",
    type: "organization",
    note: "Sonar Solution Experts — donated side scan and multibeam equipment to 'see' through murky waters, in addition to financial support."
  },
  {
    name: "Puget Soundkeeper Alliance",
    url:  "https://pugetsoundkeeper.org",
    logo: "img/supporters-logo/psk_logo.webp",
    type: "organization",
    note: "Letter of support recognizing the project's contribution to the documentation of Lake Union's environmental and historical record.",
    LOS: "Puget Soundkeeper Alliance supports Shipwreck City because documenting shipwrecks and other large objects submerged in Puget Sound both preserves maritime heritage and strengthens our understanding of underwater debris and its environmental impacts. Our collaboration with Phil Parisi in the past—identifying debris in South Lake Union and documenting sunken vessels in the Ship Canal—shows how exploration and storytelling can directly support more effective stewardship of Puget Sound.",
    LOSAttrib: "Anna Bachman, Clean Water Program Director"
  },
    {
    name: "Chesapeake Technology: SonarWiz",
    url:  "https://chesapeaketech.com/",
    logo: "img/supporters-logo/sonarwiz.webp",
    type: "organization",
    note: "Sonar Data Processing - provided a free software license to process side scan sonar data to industry standards."
  },
  {
    name: "Floating Homes Association",
    url:  "https://www.seattlefloatinghomes.org/",
    logo: "img/supporters-logo/floatinghomesassoc.webp",
    type: "organization",
    note: "Residents of Lake Union who have propelled Shipwreck City with key collaborations, novel introductions, and opening doors across Seattle's community.",
    LOS: "On behalf of the Floating Homes Association, I am writing to express our enthusiastic support for Shipwreck City and its mission to document the submerged maritime history of Lake Union, the Ship Canal, and the broader Puget Sound region. As an organization whose members live directly on these waters, understanding and preserving the history beneath us is central to who we are.",
    LOSAttrib: "Stafford Green, President of Seattle's Floating Homes Association"
  },
  {
    name: "Boatworld Marinas",
    url:  "https://www.boatworldmarina.com/",
    logo: null,
    type: "marina",
    note: "Provided dock access for ROV dives on three wrecks along Westlake."
  },
  {
    name: "David B. Williams",
    url:  null,
    logo: null,
    type: "individual",
    note: "Renowned Seattle author who assisted with ROV deployments and shared our story in his newsletter."
  },  
  {
    name: "Sean B.",
    url:  null,
    logo: null,
    type: "individual",
    note: "Captain of a 54' Cruiser, who allowed us to deploy ROVs on wrecks along the Ship Canal."
  },
  {
    name: "Anna B.",
    url:  null,
    logo: null,
    type: "individual",
    note: "Local marine expert who shared extensive knowledge of derelict vessels and organized several field outings."
  },
  {
    name: "Shawn A.",
    url:  null,
    logo: null,
    type: "individual",
    note: "ROV copilot and scuba expert who assisted with ROV deployments."
  },
  {
    name: "James M.",
    url:  null,
    logo: null,
    type: "individual",
    note: "ROV copilot and ocean engineer who assisted with ROV deployments and shootings stills."
  },
  {
    name: "Nani W.",
    url:  null,
    logo: null,
    type: "individual",
    note: "Ocean advocate and earth scientist who assisted with ROV deployments and videography."
  },
  {
    name: "Priya S.",
    url:  null,
    logo: null,
    type: "individual",
    note: "Software engineering consultant who assisted with ROV deployments and videography."
  },
  {
    name: "Dalton D. and Nick G.",
    url:  null,
    logo: null,
    type: "individual",
    note: "News reporter and videographer from Seattle's King 5 News who gave this project a voice far greater than our own."
  },
  {
    name: "Rick O.",
    url:  null,
    logo: null,
    type: "individual",
    note: "Local Lake Union rower and retired investigative journalist who featured our work in a Seattle newsletter." 
  },
  {
    name: "Luka O.",
    url:  null,
    logo: null,
    type: "individual",
    note: "ROV copilot and University of Washington engineering student who assited with ROV deployments."
  },
];
