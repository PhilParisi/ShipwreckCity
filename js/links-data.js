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
    name: "DCS Films",
    url:  "http://www.dcsfilms.com/Site_4/DCS_Website.html",
    logo: "img/supporters-logo/dcslogo.jpg",
    type: "organization",
    note: "Advanced technical divers (Dan, Carl, and Scott) dedicated to underwater cinematography who shared their Seattle dive logs and shipwreck footage.",
    LOS: "This project will continue on the work of many local individuals to educate the future by diving into the past."
  },
  {
    name: "Coastal Sensing and Survey",
    url:  "https://www.coastalsensing.com/",
    logo: "img/supporters-logo/css.png",
    type: "organization",
    note: "Seattle-based survey company who established and made public the first comprehensive side scan sonar map of 98 targets in Lake Union."
  },  
  {
    name: "Blue Robotics",
    url:  "https://bluerobotics.com/",
    logo: "img/supporters-logo/br-logo.png",
    type: "organization",
    note: "Creators of BlueROV2 and BlueBoat — enabling marine robotic exploration through essential equipment donations and financial support."
  },
  {
    name: "Cerulean Sonar",
    url:  "https://ceruleansonar.com/",
    logo: "img/supporters-logo/cs-logo.png",
    type: "organization",
    note: "Sonar Solution Experts — donated side scan and multibeam equipment to 'see' through murky waters, in addition to financial support."
  },
  {
    name: "MOHAI",
    url:  "https://mohai.org",
    logo: "img/supporters-logo/MOHAI-logo.png",
    type: "organization",
    note: "Museum of History & Industry — letter of support acknowledging the archive's alignment with Seattle's broader maritime heritage mission.",
    LOS: "The Museum of History & Industry (MOHAI) supports the Shipwreck City Mapping Project for its contribution to documenting and preserving the layered history of Lake Union. The information gathered may serve as a valuable resource for future exhibitions, programming, and public interpretation. As a Lake Union Park institution, MOHAI is committed to the stewardship of this historical shared waterway and values projects that engage the community while expanding the historical record."
  },
  {
    name: "Puget Soundkeeper Alliance",
    url:  "https://pugetsoundkeeper.org",
    logo: "img/supporters-logo/psk_logo.png",
    type: "organization",
    note: "Letter of support recognizing the project's contribution to the documentation of Lake Union's environmental and historical record.",
    LOS: "Puget Soundkeeper Alliance supports Shipwreck City because documenting shipwrecks and other large objects submerged in Puget Sound both preserves maritime heritage and strengthens our understanding of underwater debris and its environmental impacts. Our collaboration with Phil Parisi in the past—identifying debris in South Lake Union and documenting sunken vessels in the Ship Canal—shows how exploration and storytelling can directly support more effective stewardship of Puget Sound."
  },
    {
    name: "Chesapeake Technology: SonarWiz",
    url:  "https://chesapeaketech.com/",
    logo: "img/supporters-logo/sonarwiz.png",
    type: "organization",
    note: "Sonar Data Processing - provided a free software license to process side scan sonar data to industry standards."
  },
  {
    name: "Boatworld Marinas",
    url:  "https://www.boatworldmarina.com/",
    logo: null,
    type: "marina",
    note: "Provided dock access for ROV dives on three wrecks along Westlake."
  },
  /*{
    name: "Libbie B.",
    url:  null,
    logo: null,
    type: "individual",
    note: "Historical curator, community connector, and project advisor who opened doors and elevated this project well-beyond its original means."
  },*/
  /*{
    name: "George S.",
    url:  null,
    logo: null,
    type: "individual",
    note: "Captain of a 16' Whaler, who allowed us to deploy ROVs on wrecks in central Lake Union."
  },*/
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
    note: "ROV copilot and ocean engineer who assisted with ROV deployments."
  }
];
