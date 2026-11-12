# Hub

`hub.html` is a private page for the Shipwreck City team. It lives at
`https://shipwreckcity.org/hub` and nothing on the site links to it. It has:

- links to the team section (this page) and the field work dive sign-up
- a **Timeline** by quarter. Public events are read from `js/events-data.js`
  every time the page opens, so anything on the Events page appears there
  without a rebuild. Team milestones come from the private content file.
- **Tasks** for each team member, split into **Priority** and **Simmering**.
  Once the Google backend is connected (`tools/google-backend/SETUP.md`), the
  team edits these on the page and they're saved in the shared Google Sheet.
  Until then the page shows the lists from the private content file, read-only.
- **Shipwreck City Guiding Principles** and **Guidelines for Events and
  Project Socialization**

Names connect the timeline and the tasks. Put people on a milestone or a
public event with `who: [...]`, and it shows under "On the timeline" in their
Tasks card. Mark a task `timeline: true` and it appears on the timeline on its
due date with their name. Public events on the timeline link to their card on
the Events page. The build warns about names or event titles that don't match.

The site's code is public on GitHub, so the content can't sit in the page as
plain text. Instead it's written in a private file, encrypted with the team
password, and only the encrypted version is published. Without the password
the page shows nothing.

| File | In git? | What it is |
|---|---|---|
| `private/team-hub-content.js` | **No** | Timeline milestones and each member's tasks. Edit this. |
| `private/team-hub-password.txt` | **No** | The team password, on one line. |
| `private/team-hub-api-key.txt` | **No** | Created automatically. Sealed inside the hub so it can save task edits; the same value goes in the Apps Script's `HUB_KEY`. |
| `private/team-hub-salt.txt` | **No** | Created automatically. Not secret, but keep it so "Remember on this device" survives updates. |
| `hub.html` | Yes | The page, holding only the encrypted content. |

**Back up the `private/` folder somewhere else**, such as a private Google
Drive folder. Git ignores it, so it isn't on GitHub, and it exists only on this
computer.

## First-time setup

1. Create `private/team-hub-password.txt` and type the password on one line.
   It must be at least 12 characters. Anyone can download the page and try
   guesses offline, so a few random words strung together is best.
2. Edit `private/team-hub-content.js`. It explains its format at the top.
3. Run `node tools/team-hub/build-team-hub.js`.
4. Commit and push `hub.html`.
5. Send the team the link and the password.

## Updating it

Edit `private/team-hub-content.js`, run `node tools/team-hub/build-team-hub.js`,
then commit and push `hub.html`. Past timeline entries grey out by themselves,
and a "Today" marker shows where you are.

## Changing the password

Change `private/team-hub-password.txt`, rebuild, and push. Every device that
ticked "Remember on this device" will ask for the new password.

Old versions of `hub.html` stay in the git history, encrypted with the old
password. Someone who has the old password could still read the content as it
was at that time, but nothing added after the change.
