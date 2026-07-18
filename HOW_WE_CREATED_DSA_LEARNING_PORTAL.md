# How We Created the DSA Learning Portal

This document explains the DSA Learning Portal project in plain language: what it was meant to do, how the idea evolved across our Codex tasks, how the files work together, and what the current portal can do.

## 1. Original Goal

The portal was created as a training platform for new interns at DSA, a CA private firm.

The first requirement was:

- Interns should be able to create an account, log in, and watch training videos one by one.
- Admin should be able to control the training material.
- The portal should contain 12 Loom videos of around 5 minutes each.
- Each video should have related resources under that specific video.
- Interns should have access to AI Assistant Yash / Notebook LLM style support when they get stuck.
- The dashboard should show the intern name, welcome note, progress bar, video access, and AI assistant access.
- The dashboard should also show a short Loom guide explaining how to use the DSA Learning Portal.
- Admin should be able to sign out interns after they leave the firm.
- Intern account details should be available for admin records.

The portal was built as a lightweight local web app, so it can run on the computer without needing a full database or backend system.

## 2. The Main Threads We Used

Codex showed these relevant project tasks:

| Task | Purpose |
| --- | --- |
| Create DSA design system skill | Created a reusable design-system guide for a professional CA learning portal. |
| Build intern learning portal | Built the first working version of the portal with login, dashboard, videos, resources, AI assistant, and admin controls. |
| Update intern account records | Improved admin account handling, intern records, CSV export, sign-out blocking, and password reset behavior. |
| Document portal build | This current documentation task, created to explain the whole project clearly. |
| Improve video completion flow | Added accurate video duration timers, locked lesson completion until the required watch time passes, and added confetti after completion. |
| Add dashboard portal guide | Added the Loom guide video beside the learner progress card on the dashboard. |

The older task reader did not expose the full internal turn-by-turn history for every task, so this document uses the available task summaries plus the actual project files as the source of truth.

## 3. Design System Direction

Before building the portal UI, we created the `DSA Learning Portal Design System` skill.

Its purpose was to make the portal feel:

- Professional and trustworthy for a CA private firm.
- Calm and structured, not like a marketing landing page.
- Easy for interns and admins to scan quickly.
- Focused on study momentum: interns should always know what to continue next.

The design system defined rules for:

- Colors
- Typography
- Spacing
- Cards
- Buttons
- Navigation
- Forms
- Progress states
- Admin and learner page layouts

The current CSS uses a warm DSA-themed palette and follows much of the structure: sidebar navigation, compact cards, progress states, admin panels, lesson layout, and responsive mobile behavior.

## 4. Current Project Structure

```text
DSA Learning Portal/
  index.html
  package.json
  README.md
  server.js
  Start DSA Learning Portal.bat
  vercel.json

  src/
    main.js
    styles.css

  data/
    videos.json

  tools/
    sync_videos.py

  assets/
    learning-hero.png
    resources/
      GST Working Template for B2B.xlsx
      GST Offline Tools CSV File Template.csv
```

## 5. What Each Important File Does

### `index.html`

This is the entry point of the portal.

It loads:

- `src/styles.css` for the visual design.
- `src/main.js` for the entire app behavior.

It contains only one root element:

```html
<div id="root"></div>
```

The JavaScript fills this root with the login screen, dashboard, video page, lesson page, assistant page, or admin controls.

### `src/main.js`

This is the main brain of the portal.

It handles:

- Admin login.
- Intern signup and login.
- Password reset.
- Blocking signed-out interns from creating another account with the same email.
- Dashboard rendering.
- Dashboard portal guide video rendering.
- Video library rendering.
- Individual lesson page rendering.
- Loom video embed conversion.
- Progress tracking.
- Locked video completion after the required watch time.
- Confetti celebration after clicking OK on a completed video.
- Admin editing of video links and lesson notes.
- Admin adding resources.
- Admin uploading resource files into browser storage.
- Intern account list.
- CSV export of intern name, email ID, and password.
- AI Assistant Yash link.

The fixed admin login currently is:

```text
Email: admin@dsafirm.com
Password: admin123
```

### `src/styles.css`

This file controls the complete look and layout of the portal.

It includes styles for:

- Login / signup page.
- Hero image and authentication panel.
- Sidebar navigation.
- Dashboard cards.
- Dashboard guide video card.
- Progress bar.
- Video grid.
- Lesson player layout.
- Watch progress gate and locked OK button.
- Confetti completion animation.
- Resource rows.
- AI assistant panel.
- Admin controls.
- Intern account rows.
- Mobile responsiveness.

### `server.js`

This is a very small local server.

It serves the project files at:

```text
http://127.0.0.1:5173
```

It also tries to refresh `data/videos.json` by running:

```text
tools/sync_videos.py
```

That refresh happens when the browser requests:

```text
/data/videos.json
```

### `tools/sync_videos.py`

This helper script reads video titles and Loom URLs from this Excel file:

```text
C:\Users\123pr\Desktop\DSA LP VIDEOS FILE.xlsx
```

It reads the sheet:

```text
GST VIDEOS
```

It starts from row 6 and writes the cleaned video data into:

```text
data/videos.json
```

Important detail: if `videos.json` already has summaries or resources for a video title, the sync script preserves those summaries and resources.

### `data/videos.json`

This is the current video content library.

It contains 12 GST training videos with their actual Loom durations. These durations are important because the LMS uses them to decide when the OK completion button should unlock.

| No. | Video | Unlock duration |
| --- | --- | --- |
| 1 | GST login with client credentials | 1:44 |
| 2 | Making a working for a client | 4:26 |
| 3 | Feeding working in GSTR-1 for B2B | 3:04 |
| 4 | Debit and credit note entry | 3:11 |
| 5 | B2C feeding | 3:25 |
| 6 | HSN filing | 3:43 |
| 7 | Document issued filing | 3:18 |
| 8 | Create summary | 2:41 |
| 9 | Introduction to GSTR-3B | 5:00 |
| 10 | Download and install GST Offline Tool | 3:19 |
| 11 | Download GSTR-1 working template in CSV format | 2:14 |
| 12 | Upload working in Offline Tool, download JSON, and upload to GST portal | 4:14 |

The video topics are:

1. GST login with client credentials.
2. Making a working for a client.
3. Feeding working in GSTR-1 for B2B.
4. Debit and credit note entry.
5. B2C feeding.
6. HSN filing.
7. Document issued filing.
8. Create summary.
9. Introduction to GSTR-3B.
10. Download and install GST Offline Tool.
11. Download GSTR-1 working template in CSV format.
12. Upload working in Offline Tool, download JSON, and upload to GST portal.

Some videos also include resources such as:

- GST login page link.
- GST Working Template for B2B Excel file.
- GST Offline Tools CSV File Template.
- GST return help links.

### `assets/`

This folder contains the visual and downloadable resources:

- `learning-hero.png`: the image used on the login screen.
- `assets/resources/GST Working Template for B2B.xlsx`: downloadable Excel resource for interns.
- `assets/resources/GST Offline Tools CSV File Template.csv`: downloadable CSV resource for interns.

### `Start DSA Learning Portal.bat`

This is the easiest way to run the portal locally.

It:

- Goes to the project folder.
- Runs the video sync script.
- Starts the Node server.
- Opens the portal in the browser.

### `vercel.json`

This file prepares the project for static hosting on Vercel.

It serves:

- `index.html`
- `src/**`
- `assets/**`
- `data/**`

Because the app is mostly frontend-based, it can be hosted as a static app. However, the Excel sync behavior from `server.js` is local-only and does not automatically run on a static Vercel deployment.

## 6. How the App Works

### Login and Signup

When the portal opens, the user sees the authentication screen.

There are two modes:

- Login
- Create account

Admin can log in with the fixed admin credentials. Interns can create their own accounts.

Intern account details are stored in the browser using `localStorage`.

### Browser Storage

The portal stores information locally in the browser, using keys like:

| Storage key | Purpose |
| --- | --- |
| `dsa_lessons` | Current lesson/video list and resources. |
| `dsa_interns` | Intern accounts. |
| `dsa_session` | Currently logged-in user. |
| `dsa_completed` | Completed videos per intern email. |
| `dsa_watch_progress` | Watched time per intern email and lesson. |

This means data is saved in that browser on that computer. It is not a shared cloud database.

After the Supabase update, deployed intern accounts can also sync through the shared online database using the `/api/interns` Vercel API route. Browser storage remains useful as a local fallback, but the intended deployed flow is:

- Any intern signs up from any laptop or IP address.
- The portal sends that account to the Supabase-backed API.
- Admin Controls reads the shared intern list from Supabase.
- Admin can see all deployed intern accounts in one place.

### Dashboard

After login, interns see:

- Their name.
- Welcome message.
- Course progress.
- Number of completed videos.
- Next lesson.
- A Loom guide video called `How to use DSA Learning Portal`.
- Button to continue to videos.
- Card for Videos Page.
- Card for AI Assistant Yash.

The guide video is embedded beside the learning progress card on desktop. On smaller screens, it stacks below the progress card so the dashboard remains easy to read.

The guide video link is:

```text
https://www.loom.com/share/6dcbd61b938c4206b869abb03c449f90
```

### Videos Page

The Videos Page shows all lesson cards.

Each card shows:

- Lesson number.
- Video title.
- Duration.
- Number of resources.
- Completion status.

Clicking a card opens the lesson page.

### Lesson Page

The lesson page has three main areas:

- Left: learning path with all videos.
- Center: Loom video player, summary, mark complete button, and resources.
- Right: AI Assistant Yash panel.

The Loom share URLs are converted into Loom embed URLs automatically.

For example:

```text
https://www.loom.com/share/...
```

becomes:

```text
https://www.loom.com/embed/...
```

Under the video, the portal shows a watch progress gate. It tells the intern how much of the required video time has been watched and how much time remains before completion can be confirmed.

### Progress Tracking

When an intern opens a lesson page, the portal starts tracking watched time for that intern and that lesson. The watched time is saved in `dsa_watch_progress`.

The OK completion button stays locked until the saved watched time reaches the required video duration. Each lesson uses its actual Loom duration, not a fixed 5-minute timer.

When the required time is reached:

- The watch gate changes to a ready state.
- The locked button becomes an `OK` button.
- The intern can click `OK`.
- Confetti appears on screen.
- The lesson ID is saved under that intern's email in `dsa_completed`.

The progress percentage is calculated as:

```text
completed lessons / total lessons
```

### AI Assistant Yash

The portal links to:

```text
https://chatgpt.com/g/g-6a5354a7412c8191af5748f47ff577fe-yash
```

This gives interns a direct support path when they are stuck during training.

### Admin Controls

Admin gets an extra sidebar item:

```text
Admin Controls
```

From there, admin can:

- Edit Loom video links.
- Edit lesson summaries.
- Add resource links.
- Upload resource files.
- Remove resources.
- See intern accounts.
- Sign out interns.
- Export intern account CSV.

In the deployed version, the intern list is intended to come from Supabase through the secure Vercel API route. This is what allows admin to see intern accounts created from different devices and locations.

### Intern Account Export

The export button creates:

```text
dsa-intern-accounts-google-sheet.csv
```

The export includes only:

- Name
- Email ID
- Password

The admin screen itself shows more details, including:

- Active status.
- Joined date.
- Signed-out date.
- Password reset date.

This matches the later account-records request: the CSV should stay focused on the repository of intern login details, while the admin screen can show operational status and history.

When Supabase is configured on Vercel, this export uses the synced shared intern list, so it can include interns who created accounts from other laptops or IP addresses.

### Signing Out Interns

When admin signs out an intern:

- The intern becomes inactive.
- The sign-out date is saved.
- The intern cannot log in anymore.
- The same email cannot be used to create another active account again.

### Password Reset

The portal includes a password reset form.

The current implementation simulates confirmation locally:

- Intern enters email ID.
- Intern enters a new password.
- If the account exists and is active, the password is updated.
- The reset date is saved.

There is no real email service connected yet.

## 7. Why We Chose This Architecture

The project was built to be simple, fast, and usable without a complex setup.

The architecture is:

- Plain HTML.
- Plain CSS.
- Plain JavaScript.
- Tiny Node server for local file serving.
- JSON file for synced video data.
- Browser `localStorage` for accounts and progress.
- Python helper for reading the Excel video source.

This kept the portal easy to run locally and easy to understand.

The tradeoff is that it is not yet a secure multi-user production system. For a real firm-wide deployment, accounts, passwords, progress, uploads, and admin permissions should eventually move to a proper backend and database.

The video completion gate also has an important technical detail: Loom embeds do not give this simple frontend portal a reliable direct "video ended" event. Because of that, the portal uses a required watch-time timer based on each video's real Loom duration. It saves the watched time locally and updates it using elapsed time while the lesson page is open.

## 8. Current Limitations

The current version works as a local learning portal, but these are important limitations:

- Intern accounts can sync through Supabase when Vercel has `DATABASE_URL` configured, but local browser storage is still used as a fallback when the API is unavailable.
- Passwords are stored as plain text in local browser storage.
- The admin credentials are hard-coded in `src/main.js`.
- File uploads are saved as browser data URLs, which can hit browser storage limits.
- The password reset flow does not send a real email.
- Data is local to the browser and computer unless manually exported or moved.
- The Excel sync depends on the local file path `C:\Users\123pr\Desktop\DSA LP VIDEOS FILE.xlsx`.
- Static hosting on Vercel will not automatically run the local Python sync script.
- The video completion gate is based on time spent on the lesson page, because Loom iframe embeds do not expose a dependable direct completion event to this static app.

Important deployment note: the Supabase direct connection string must be saved privately in Vercel as `DATABASE_URL`. It should never be committed into GitHub or placed directly in frontend JavaScript.

## 9. How To Run The Portal

The easiest method is:

```text
Double-click Start DSA Learning Portal.bat
```

Then open:

```text
http://127.0.0.1:5173
```

Another method is:

```text
npm start
```

Then open:

```text
http://127.0.0.1:5173
```

## 10. How To Update Videos

The intended content flow is:

1. Update the Excel sheet `DSA LP VIDEOS FILE.xlsx`.
2. Make sure video titles and Loom URLs are in the `GST VIDEOS` sheet.
3. Run the portal locally.
4. The sync script refreshes `data/videos.json`.
5. The app loads the latest JSON data into the lesson list.

If you manually edit summaries and resources in `data/videos.json`, the sync script tries to preserve them by matching the video title.

If you update or replace a Loom video, also update its `durationSeconds` value in `data/videos.json` and the matching default video entry in `src/main.js`. This keeps the LMS OK button unlock timing correct.

## 11. How To Update Resources

Resources can be added in two ways:

- Admin can add a link resource from the Admin Controls page.
- Admin can upload a file resource from the Admin Controls page.

For permanent project resources, files can also be placed under:

```text
assets/resources/
```

Then they can be referenced in `data/videos.json`.

## 12. Future Improvements

The next natural improvements would be:

- Replace browser storage with a real database.
- Add secure password hashing.
- Add real email-based password reset.
- Add proper admin authentication.
- Add Google Sheets or database sync for intern records.
- Add a backend upload system for resources.
- Add roles for admin, mentor, and intern.
- Add quiz support after each video.
- Add deeper video-player integration if a future video provider exposes reliable watched/completed events.
- Add certificates or completion reports.
- Add deployment-ready backend hosting.

## 13. Summary

We created the DSA Learning Portal in stages:

1. First, we defined the product idea: an intern learning portal for DSA training.
2. Then we created a design system so the portal would feel professional and consistent.
3. Then we built the frontend experience: login, dashboard, videos, lesson page, resources, progress, and AI assistant.
4. Then we added admin controls for managing videos, resources, and intern accounts.
5. Then we improved account handling: CSV export, sign-out blocking, and password reset behavior.
6. Then we improved lesson completion so the OK button unlocks only after the required watch time and celebrates completion with confetti.
7. Then we added a dashboard Loom guide showing interns how to use the DSA Learning Portal.
8. Finally, we documented the whole project here so the build process and current structure are easier to understand.

The portal is now a working local training app for DSA interns, especially focused on GST onboarding videos and resources.
