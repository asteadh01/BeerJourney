# Batch Log

A two-person homebrew journey site. Public dashboard with recipes, brew-day
process, YouTube videos and open comments — plus a hidden `/login` for the
two brewers to write it all up. Built with Next.js (static export) and
Firebase (Auth, Firestore, Storage, Hosting).

Rename "Batch Log" throughout (`src/components/SiteNav.tsx`,
`src/app/layout.tsx` metadata, `package.json`) once you've picked a real
brand name.

## Stack

- Next.js App Router, static export (`output: "export"`) — no server needed,
  deploys straight to Firebase Hosting on the free Spark plan.
- Firebase Auth (email/password) — exactly two accounts, no public sign-up.
- Firestore — `brews` and `comments` collections.
- Firebase Storage — batch photos.

## First-time setup

1. **Create the Firebase project**
   - Go to the [Firebase console](https://console.firebase.google.com/) → Add project.
   - Add a Web app inside it, copy the config values into `.env.local` (copy
     `.env.local.example` first).
   - Enable **Authentication → Sign-in method → Email/Password**.
   - Enable **Firestore Database** (production mode) and **Storage**.

2. **Create the two brewer accounts**
   - In Authentication → Users, manually add two users (your email + your
     friend's), each with a password.
   - Open [`firestore.rules`](firestore.rules) and [`storage.rules`](storage.rules)
     and replace `brewer-one@example.com` / `brewer-two@example.com` with
     those two exact emails. This is what actually restricts writes to just
     the two of you — the `/login` page being unlinked from navigation is
     obscurity, not security.

3. **Install the Firebase CLI and connect the project**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```
   Edit `.firebaserc` and replace the project ID with your real Firebase
   project ID (shown in the console under Project settings).

4. **Install deps and run locally**
   ```bash
   npm install
   npm run dev
   ```
   Visit `http://localhost:3000` for the public site, `/login` to sign in.

5. **Deploy rules once, then deploy the site whenever you want to publish**
   ```bash
   firebase deploy --only firestore:rules,storage:rules
   npm run build
   firebase deploy --only hosting
   ```
   `npm run build` writes static files to `out/`, which `firebase.json`
   points Hosting at.

## Data model

- **`brews/{id}`** — one document per batch: title, style, ABV/IBU/OG/FG,
  malt bill, hop schedule, process steps, hero image URL, YouTube URL,
  `status` (`draft` | `published`). Only `published` brews show on the
  public site.
- **`comments/{id}`** — `brewId`, `name`, `text`, `createdAt`. Anyone can
  post (rate-limited only by Firestore rules' size checks); only the two
  brewers can delete, for moderation.

Photos: upload through Firebase Storage under `brews/` (rules cap each file
at 10MB) and paste the resulting download URL into a brew's "Hero image
URL" field in the admin form. A direct-upload button in the admin UI is a
natural next step once you're ready for it.

## Structure

```
src/
  app/
    page.tsx              public dashboard
    brew/page.tsx          beer detail (?slug=)
    process/, videos/, about/
    login/page.tsx          hidden sign-in
    admin/                  brewer-only (auth-gated in admin/layout.tsx)
      page.tsx               dashboard
      brews/                 list, new, edit
      comments/               moderation
  components/
    SiteNav.tsx
    admin/BrewForm.tsx
  lib/
    firebase.ts             client SDK init
    brews.ts                Firestore reads/writes
    types.ts, sampleBrews.ts, youtube.ts, useAuth.ts
```

## Design sketches

See `sketches/mockup.html` (or re-open the published Claude artifact) for
the four core screens this was built from: public dashboard, beer detail,
hidden login, and the admin panel.
