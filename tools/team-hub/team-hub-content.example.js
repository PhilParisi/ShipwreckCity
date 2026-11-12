/**
 * ============================================================
 *  SHIPWRECK CITY — HUB CONTENT (private)
 *  The real copy of this file lives in private/team-hub-content.js,
 *  which git ignores. Edit that copy, then run:
 *      node tools/team-hub/build-team-hub.js
 *  See tools/team-hub/README.md.
 * ============================================================
 *
 *  timelineRange — the quarters the timeline shows, "YYYY-Q1" to "YYYY-Q4"
 *
 *  timeline — team milestones. Public events are pulled in from the Events
 *             page (js/events-data.js) automatically, so don't repeat them here.
 *    date   "2027-02-15" for a day, "2027-02" for a month, or "2027-Q1" for
 *           sometime in that quarter
 *    title  short label
 *    note   optional extra line
 *    who    optional list of people, e.g. ["Phil", "George"] or ["Everyone"].
 *           First names are fine. Each person sees it under "On the timeline"
 *           in their Tasks card.
 *
 *    To put people on a PUBLIC event, add an entry with "event" instead of
 *    "date": part of the event's title as it appears on the Events page.
 *      { event: "Maritime Archaeological Society", who: ["Phil", "Brenna"] }
 *
 *  team — one entry per team member, in the order they should appear
 *    summary    general role: a line describing what they do day to day
 *    note       optional status line shown at the top of their card,
 *               e.g. if they're away (their lists can then be left empty)
 *    priority   what they're focused on now
 *    simmering  on the back burner: ideas and things to get to later
 *    Each item in either list is
 *      - a plain string, shown as a simple bullet, or
 *      - { task, status, due, notes }
 *          status  "to do", "in progress" or "done"
 *          due     "YYYY-MM-DD" (optional)
 *          notes   list of bullet points under the task (optional)
 *          timeline  true to also show it on the timeline on its due date
 *
 *  principles — "Shipwreck City Guiding Principles", shown numbered
 *  guidelines — "Guidelines for Events and Project Socialization"
 *    Each item is either
 *      - a plain string, or
 *      - { title, text, points }   a heading, a sentence or two, and
 *                                  optional bullet points
 */

module.exports = {
  timelineRange: { from: "2026-Q4", to: "2027-Q4" },

  timeline: [
    { date: "2027-Q1", title: "Plan the 2027 field season", note: "Dive dates, boat time and permits.", who: ["Phil"] },
    { date: "2027-05",  title: "2027 field season begins", who: ["Everyone"] },
    { event: "An Evening with Shipwreck City", who: ["Phil"] }
  ],

  team: [
    {
      name: "Phil Parisi", role: "Founder",
      summary: "Leads the project: plans and pilots the ROV dives, dives the wrecks, and runs partnerships, events and the website.",
      priority: [
        { task: "Example task: replace with real ones", status: "to do", due: "2026-11-30", timeline: true, notes: ["Bullet notes go here", "Add as many as you like"] }
      ],
      simmering: [
        "Example idea for later"
      ]
    },
    {
      name: "Libbie Barnes", role: "Community Manager",
      summary: "Connects the project with museums and the community, and shapes public outreach and engagement.",
      priority: [],
      simmering: []
    },
    {
      name: "Evan Weber", role: "Digital Archivist",
      summary: "Reviews dive records and historical sources and turns them into the public archive and wreck write-ups.",
      priority: [],
      simmering: []
    },
    {
      name: "Brenna Thornley", role: "Maritime Archaeologist",
      summary: "Brings archaeological method to the fieldwork: survey, documentation, photogrammetry and site interpretation.",
      priority: [],
      simmering: []
    },
    {
      name: "Captain George Spano", role: "Boat Captain",
      summary: "Captains the boat for ROV deployments and keeps fieldwork on the water running safely.",
      priority: [],
      simmering: []
    }
  ],

  principles: [],

  guidelines: []
};
