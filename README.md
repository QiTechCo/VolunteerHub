# Volunteer Hub

On-domain volunteer wing for **Dimple Ajmera for Charlotte**. Public URLs live under `/volunteer` so a reverse proxy can serve `https://www.dimpleajmera.com/volunteer` without turning this into a second campaign homepage.

This beta is a clickable scaffold: register, take shifts (with capacity and waitlist), log hours after staff confirm attendance, and run the coordinator desk. Recommendation letters and credits are in the data model only — they are not in the UI.

## Demo logins

| Role | Email | Password |
| --- | --- | --- |
| Volunteer coordinator (`volunteer_director`) | `coordinator@volunteerhub.local` | `CharlotteHub!26` |
| Volunteer (Maya Chen — active, has hours) | `maya.chen@volunteerhub.local` | `Volunteer!26` |

Other seeded volunteers (`jordan.ellis`, `priya.shah`, `sam.ortiz`, `alex.rivera` @ `volunteerhub.local`) share `Volunteer!26`.

- Jordan: hot lead (registered, never shifted)
- Priya: waitlisted on the full poll-greeting shift
- Sam: lapsed (older completed shift)
- Alex: new (registered in the last few days)

## Run locally

Needs Node 20+. SQLite is the beta database so the app runs without hosted Postgres.

```bash
npm install
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```

Open [http://127.0.0.1:43147/volunteer](http://127.0.0.1:43147/volunteer).

Copy `.env.example` to `.env` and set `AUTH_SECRET` before any real deployment. The committed example is enough for local preview.

### Scripts

- `npm run dev` — Next.js on port **43147**, hostname `0.0.0.0`
- `npm run db:reset` — recreate SQLite and reseed demo people/shifts
- `npm run build` / `npm start` — production build on the same port

## What this beta includes

- Hub home (campaign volunteer copy + role cards)
- Shift board and shift detail, on-domain signup, per-role capacity, FIFO waitlist auto-advance on cancel
- Register / login (password; email magic links are not wired)
- Volunteer profile, documents (resume/CV/bio), my shifts, hours ledger
- Staff desk: people + segments, schedule CRUD, attendance, roles, settings
- Volunteer Hub lockup in the header (campaign-provided artwork)
- Day 1 training notebook at `/training` (People, Power, Purpose — Volunteer Organizing Intensive excerpts)
- Installable PWA (manifest + service worker, `display: standalone`, start URL `/volunteer`)
- Web Push opt-in for shift confirmations, waitlist seats, and reminders (VAPID; local Notification fallback if keys are missing)
- Offline copy of how-to, roles, login chrome, and Day 1 excerpts

## Install the app

1. Open [http://127.0.0.1:43147/volunteer](http://127.0.0.1:43147/volunteer) (or `/volunteer/install`).
2. **iPhone (Safari):** Share → Add to Home Screen. Keep the name Volunteer Hub. Open it from the new icon — that is required for iOS notifications.
3. **Android (Chrome):** Menu → Install app / Add to Home Screen.
4. **Desktop Chrome/Edge:** install icon in the address bar.

The start URL is `/volunteer`. The icon is the campaign Volunteer Hub lockup.

## Shift notifications

Log in, then **Profile** (volunteer) or **Settings** (coordinator) → Shift notifications → **Turn on** → allow the browser prompt → **Send a test ping**.

The same path fires when you take a shift, join a waitlist, get a waitlist seat, or when staff use **Ping upcoming shifts** (stand-in for a morning-of job).

If `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` are unset, the PWA still installs. Test ping uses a local notification through the service worker so you can see the chrome. Generate production keys with `npx web-push generate-vapid-keys`.

iOS Web Push only works from the Home Screen app (iOS 16.4+), not from a Safari tab.

## Offline

With the service worker installed, Hub keeps how-to-help, role cards, login/register chrome, and Day 1 excerpts on the device. The shift board and signup need a connection — you get a clear offline note, not a silent stale private roster. Volunteer profile data is not written into the shared offline fallback.

## Production notes

- Set `basePath` is already `/volunteer`.
- Swap Prisma `provider` to `postgresql` and `DATABASE_URL` when you leave SQLite.
- Put a reverse proxy in front of `www.dimpleajmera.com` for `/volunteer` and `/volunteer/*`. Do not leave a Squarespace page on that path.
- Transactional email is logged, not sent.
- Web Push uses VAPID. Rotate the demo keys in `.env` before any real campaign device list.

Paid for by The Committee to Elect Dimple Ajmera.
