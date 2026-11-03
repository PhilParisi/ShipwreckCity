# Dive sign-up setup

The sign-up page (`dive-signup.html`) stores nothing itself. The schedule and
sign-ups live in a private Google Sheet, and a small Google Apps Script
(`Code.gs`) answers the page.

**Never put the password in this repo.** It's public. The password goes only in
Script Properties (step 4).

## First-time setup (about 15–20 minutes)

1. **Create the Sheet.** In the Google account that should own the sign-ups,
   create a new Google Sheet named "Shipwreck City Dive Sign-Ups". Check its time
   zone under File → Settings (it should be Pacific).

2. **Add the script.** In the Sheet, open Extensions → Apps Script. Delete what's
   in the editor, paste in all of `Code.gs`, and save.

3. **Create the tabs.** In the editor's function dropdown, pick `setup` and click
   Run. Google asks for permission the first time; approve it. The Sheet now has
   `Slots` and `Signups` tabs.

4. **Set the password.** In Apps Script: Project Settings (gear icon) → Script
   Properties → Add script property.
   - Property: `PASSWORD`
   - Value: the password

5. **Publish it.** Deploy → New deployment → gear icon → Web app.
   - Execute as: **Me**
   - Who has access: **Anyone**

   "Anyone" means the page can reach the script. The script still returns nothing
   without the password. Click Deploy and copy the Web app URL (ends in `/exec`).

6. **Connect the page.** In `dive-signup.html`, set
   `const DIVE_API_URL = '...';` to that URL, commit, and push. The URL isn't
   secret; it's useless without the password.

## Using it

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

**Change the password:** edit `PASSWORD` in Script Properties. It takes effect
immediately, with no redeploy.

**Change Code.gs:** paste the new version, then Deploy → Manage deployments →
edit (pencil) → Version: New version → Deploy. Saving alone doesn't update the
live script. This keeps the same URL.

**Share with divers:** send the link `https://shipwreckcity.org/dive-signup` and
the password. Nothing on the public site links to it.
