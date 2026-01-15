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
