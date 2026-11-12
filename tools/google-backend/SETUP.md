# Google backend setup

One private Google Sheet, with one Google Apps Script attached, serves two pages:

- **Dive sign-up** (`dive-signup.html`): dive slots and who's signed up
- **Hub** (`hub.html`): the team's editable Tasks

The pages store nothing themselves. Everything lives in the Sheet, and the
script (`Code.gs`) answers the pages.

**Never put a password or key in this repo.** It's public. They go only in
Script Properties (step 4).

## First-time setup (about 15–20 minutes)

1. **Open the Sheet.** Use the Google Sheet you set up for this. Check its
   time zone under File → Settings (it should be Pacific).

2. **Add the script.** In the Sheet, open Extensions → Apps Script. Delete what's
   in the editor, paste in all of `Code.gs`, and save.

3. **Create the tabs.** In the editor's function dropdown, pick `setup` and click
   Run. Google asks for permission the first time; approve it. The Sheet now has
   `Slots`, `Signups`, `Tasks` and `Changes` tabs. Running it again is safe; it
   never touches tabs that already have content.

4. **Add the secrets.** In Apps Script: Project Settings (gear icon) → Script
   Properties → Add script property. Add two:
   - `PASSWORD`: the dive sign-up password
   - `HUB_KEY`: the contents of `private/team-hub-api-key.txt` on Phil's
     computer (open it in a text editor and copy the single line). This is
     **not** the hub password. It's a separate random key, sealed inside the
     hub, that lets the hub save task edits.

5. **Publish it.** Deploy → New deployment → gear icon → Web app.
   - Execute as: **Me**
   - Who has access: **Anyone**

   "Anyone" means the pages can reach the script. The script still returns
   nothing without the password or key. Click Deploy and copy the Web app URL
   (ends in `/exec`).

6. **Connect the pages.** In `js/team-api-config.js`, set
   `const TEAM_API_URL = '...';` to that URL, commit, and push. Both pages read
   it from there. The URL isn't secret; it's useless without the password or key.

7. **Re-add the starting tasks.** Once connected, the hub's Tasks come only
   from the Sheet, which starts empty. Add any tasks from the old saved copy
   with "+ Add" on the hub (for example Evan's DARE-LES item).

## Dive sign-up

**Add a slot:** add a row to the `Slots` tab.

| Date | Time | Location | Spots | Notes | Slot ID (auto) |
|---|---|---|---|---|---|
| 3/13/2027 | 9:00 AM | South Lake Union | 4 | Meet at the dock | *(leave blank)* |

- Date and Spots are required. A row missing either doesn't appear.
- Leave Slot ID blank; it fills in automatically. Don't edit it afterward, since
  it links the slot to its sign-ups.
- Past dates disappear from the page but stay in the Sheet.

**See who signed up:** the `Signups` tab has everyone's name and email.

**Remove someone:** delete their row in `Signups`. The spot reopens.

**Share with divers:** send the link `https://shipwreckcity.org/dive-signup` and
the password. Nothing on the public site links to it.

## Hub tasks

Team members edit tasks on the hub itself: "+ Add" under Priority or Simmering,
and "Edit" on any task. Each person picks their name under "Editing as" once
per device. Every change is recorded in the `Changes` tab with who and when.

You can also edit the `Tasks` tab directly:

| Column | What goes in it |
|---|---|
| ID | Leave blank for new rows; it fills in. Don't change it afterward. |
| Person | Full name as on the hub, e.g. `Evan Weber` |
| List | `Priority` or `Simmering` |
| Task | The text |
| Status | `to do`, `in progress`, `done`, or blank for a plain bullet point |
| Due | `2027-02-10` (optional) |
| Notes | Bullet points, one per line (Ctrl+Enter for a new line in a cell) |
| Timeline | `TRUE` to show it on the timeline (needs a Due date) |
| Updated At / By | Filled in by the hub |

To undo a mistake, use File → Version history in the Sheet.

## Changing things later

**Change the dive password:** edit `PASSWORD` in Script Properties. It takes
effect immediately, with no redeploy.

**Change the hub's team key:** delete `private/team-hub-api-key.txt`, rebuild
the hub (`node tools/team-hub/build-team-hub.js`), put the new key in `HUB_KEY`,
and push `hub.html`.

**Change Code.gs:** paste the new version, then Deploy → Manage deployments →
edit (pencil) → Version: New version → Deploy. Saving alone doesn't update the
live script. This keeps the same URL.
