# Timetable App — Frontend (Next.js)

This Next.js application is the user-facing portion of the Timetable Management System. It provides an Admin panel for managing schedules and a Student dashboard to view personal timetables.

## Features

- Admin Panel: create/edit/delete class sessions, detect time conflicts
- Student Dashboard: view classes by day, filter personal sessions
- Live preview on the home page for today's schedule
- Class metadata includes type and medium (Tamil/English)
- Responsive design and lightweight UI using CSS Modules

## Tech Stack

- Next.js (App Router)
- TypeScript
- CSS Modules
- Lucide React icons

## Prerequisites

- Node.js 18+ (recommended)
- Backend API running and reachable (see `backend/README.md`)

## Setup & Run

1. Install dependencies

```bash
cd frontend
npm install
```

2. Create `.env.local` in `frontend/` with the backend URL:

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

3. Start development server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Important Pages

- `/` — Home (live schedule preview)
- `/student` — Student dashboard (week view)
- `/admin-login` — Admin login
- `/admin` — Admin panel (requires login)

## How to add a class (Admin)

1. Login to the Admin panel
2. Click "Add Class"
3. Fill in: Category (External/Personal), Class Type (Theory/Revision/Paper Class), Medium (English/Tamil), Grade, Day, Location, Start/End time
4. Save — the backend validates time overlaps and returns errors if conflicts exist

## Frontend development notes

- State is managed with React hooks inside Next.js pages/components.
- Times are normalized to `HH:MM` for inputs; backend expects ISO date strings.
- When editing, the frontend fetches the authoritative record from the backend to avoid client-side mismatch.

## Building for Production

```bash
npm run build
npm start
```

## Deployment

- Set `NEXT_PUBLIC_BACKEND_URL` to the production API endpoint.
- Deploy to Vercel, Netlify, or any Node-capable host. Ensure environment variables are configured in the provider.

## Troubleshooting

- If the app shows CORS or network errors, ensure the backend is reachable and the URL in `.env.local` is correct.
- If token-based requests fail, check browser localStorage for a valid `token` value.

## Contributing

1. Follow existing TypeScript and CSS Module patterns
2. Run `npm run lint` before committing
3. Open PRs with clear descriptions and screenshots for UI changes

---

## Additional Features & Roadmap

Planned and recently added features to improve scheduling, notifications, and UX:

- **Calendar view with drag-and-drop** — Visual week/day calendar with drag-to-reschedule and resize-to-change-duration (added). Small edits persist to the backend via the existing `PUT /timetable/:id` endpoint. Priority: High.
- **Mobile-first responsive calendar** — Calendar automatically switches to a day view on small screens and uses compact controls for touch devices (added).
- **Event tooltips, modals and toasts** — Hover tooltips, event detail modal and short toast messages for success/error feedback (added).
- **Per-user notification preferences** — Allow users to choose email/WhatsApp/push and schedule reminders (planned). Backend changes: extend `User` model and notification scheduler.
- **CSV / iCal import & export** — Export timetable to `.csv` or `.ics` and import bulk schedules (planned). Implementation: backend endpoints + frontend import/export buttons.
- **Google/Outlook calendar sync (two-way)** — OAuth sync to push/pull events to users' calendars (planned, larger effort).
- **Recurring rules & exceptions** — Support recurring sessions (weekly/biweekly) and editing single-instance vs series (planned).
- **Administrative analytics & audit logs** — Usage dashboard, busiest hours, notification delivery stats, and change audit logs (planned).

If you want, I can update this README with implementation notes for any single feature (endpoints, model changes, and file paths), or open PR-ready changes for one of the "planned" items. Which feature should I document or implement next?
# Timetable App — Frontend (Next.js)

This Next.js application is the user-facing portion of the Timetable Management System. It provides an Admin panel for managing schedules and a Student dashboard to view personal timetables.

## Features

- Admin Panel: create/edit/delete class sessions, detect time conflicts
- Student Dashboard: view classes by day, filter personal sessions
- Live preview on the home page for today's schedule
- Class metadata includes type and medium (Tamil/English)
- Responsive design and lightweight UI using CSS Modules

## Tech Stack

- Next.js (App Router)
- TypeScript
- CSS Modules
- Lucide React icons

## Prerequisites

- Node.js 18+ (recommended)
- Backend API running and reachable (see `backend/README.md`)

## Setup & Run

1. Install dependencies

```bash
cd frontend
npm install
```

2. Create `.env.local` in `frontend/` with the backend URL:

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

3. Start development server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Important Pages

- `/` — Home (live schedule preview)
- `/student` — Student dashboard (week view)
- `/admin-login` — Admin login
- `/admin` — Admin panel (requires login)

## How to add a class (Admin)

1. Login to the Admin panel
2. Click "Add Class"
3. Fill in: Category (External/Personal), Class Type (Theory/Revision/Paper Class), Medium (English/Tamil), Grade, Day, Location, Start/End time
4. Save — the backend validates time overlaps and returns errors if conflicts exist

## Frontend development notes

- State is managed with React hooks inside Next.js pages/components.
- Times are normalized to `HH:MM` for inputs; backend expects ISO date strings.
- When editing, the frontend fetches the authoritative record from the backend to avoid client-side mismatch.

## Building for Production

```bash
npm run build
npm start
```

## Deployment

- Set `NEXT_PUBLIC_BACKEND_URL` to the production API endpoint.
- Deploy to Vercel, Netlify, or any Node-capable host. Ensure environment variables are configured in the provider.

## Troubleshooting

- If the app shows CORS or network errors, ensure the backend is reachable and the URL in `.env.local` is correct.
- If token-based requests fail, check browser localStorage for a valid `token` value.

## Contributing

1. Follow existing TypeScript and CSS Module patterns
2. Run `npm run lint` before committing
3. Open PRs with clear descriptions and screenshots for UI changes

---
If you'd like, I can also add example Postman collections or OpenAPI spec for the backend next.
