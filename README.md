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

## Production notes

- Set `basePath` is already `/volunteer`.
- Swap Prisma `provider` to `postgresql` and `DATABASE_URL` when you leave SQLite.
- Put a reverse proxy in front of `www.dimpleajmera.com` for `/volunteer` and `/volunteer/*`. Do not leave a Squarespace page on that path.
- Transactional email is logged, not sent.

Paid for by The Committee to Elect Dimple Ajmera.
