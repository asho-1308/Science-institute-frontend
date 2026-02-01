# Timetable App — Frontend (Next.js)

This Next.js application is the user-facing portion of the Timetable Management System. It provides an Admin panel for managing schedules and a Student dashboard to view personal timetables.

## Features

- **Admin Panel:** Create, edit, delete class sessions with real-time conflict detection
- **Student Dashboard:** View classes by day/week, filter by category, responsive calendar view
- **Home Page:** Live schedule preview for today, notice feed with images
- **Calendar View:** FullCalendar integration with drag-to-reschedule, resize-to-change-duration
- **Authentication:** JWT-based admin login with localStorage persistence
- **Responsive Design:** Mobile-first responsive calendar (day view on small screens)
- **Class Metadata:** Type (Theory/Revision/Paper), Medium (Tamil/English), Location, Teacher

## Project Architecture

### Directory Structure

```
frontend/
├── app/
│   ├── page.tsx                 # Home page (schedule preview + notices)
│   ├── layout.tsx               # Root layout with global styles
│   ├── globals.css              # Global CSS
│   ├── admin/
│   │   ├── page.tsx             # Admin dashboard (requires auth)
│   │   ├── admin.module.css
│   │   └── login/
│   │       └── page.tsx         # Admin login form
│   ├── admin-login/
│   │   ├── page.tsx             # Redirect to /admin/login
│   │   └── login.module.css
│   └── student/
│       ├── page.tsx             # Student timetable view
│       └── student.module.css
├── components/
│   ├── CalendarView.tsx         # FullCalendar wrapper component
│   └── calendar.module.css
├── types/
│   └── fullcalendar.d.ts        # TypeScript definitions for FullCalendar
├── config.ts                    # Backend API URL configuration
├── next.config.ts               # Next.js build configuration
├── tsconfig.json                # TypeScript configuration
└── public/                      # Static assets
```

### Data Flow & Architecture

**User Authentication Flow:**
1. User navigates to `/admin-login` (or `/admin/login`)
2. Submits credentials (username, password) to backend `/api/auth/login`
3. Backend returns JWT token
4. Frontend stores token in `localStorage` under key `token`
5. All subsequent requests include `Authorization: Bearer <token>` header
6. Protected routes check for valid token; redirect to login if missing

**Admin Dashboard Flow:**
1. Admin accesses `/admin` — checks localStorage for token
2. If authenticated, loads class list via GET `/api/timetable`
3. Admin creates class → POST `/api/timetable` with form data
4. Backend validates time overlaps; returns error if conflict detected
5. On success, calendar refreshes to show new class
6. Admin can drag classes to reschedule, or click to edit/delete

**Student Dashboard Flow:**
1. Student accesses `/student` — no authentication required
2. Fetches classes via GET `/api/timetable` (no auth header)
3. Calendar displays week view (day view on mobile)
4. Can filter by day or category (PERSONAL/EXTERNAL)

**Home Page Flow:**
1. Page loads, fetches today's classes and notices on mount
2. Real-time clock updates every second
3. Displays upcoming classes for the current day
4. Shows notice feed with images from Cloudinary
5. Users can click notices to view full details in modal

**Class/Notice Fetching:**
- GET `/api/timetable` — retrieve classes (frontend filters client-side)
- GET `/api/notices` — retrieve notices list with image URLs
- Requests sent with `NEXT_PUBLIC_BACKEND_URL` as base URL

### Component Hierarchy

```
Layout
├── Home Page
│   ├── Today's Schedule (fetch classes)
│   └── Notice Feed (fetch notices)
├── Admin
│   ├── Login Form (submit to /api/auth/login)
│   ├── Admin Dashboard
│   │   ├── CalendarView (FullCalendar)
│   │   ├── Add/Edit Class Form
│   │   └── Delete Confirmation Modal
│   └── Class List (from state)
├── Student
│   └── CalendarView (read-only week/day view)
└── Navigation (login/logout, page links)
```

### State Management

- **React Hooks** (`useState`, `useEffect`) — Local component state
- **localStorage** — Token persistence across sessions
- **Fetch API** — HTTP requests to backend
- **No external state library** — Intentionally lightweight

### API Integration

All requests route through the backend URL configured in `config.ts`:

```typescript
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
```

**Key Endpoints Used:**
- `POST /api/auth/login` — Admin login
- `GET /api/timetable` — List classes (supports `day`, `category` filters)
- `POST /api/timetable` — Create class (auth required)
- `PUT /api/timetable/:id` — Update class (auth required)
- `DELETE /api/timetable/:id` — Delete class (auth required)
- `GET /api/notices` — List notices
- `POST /api/notices` — Create notice with image (auth required)

### FullCalendar Integration

The `CalendarView` component:
- Displays classes as events in week/day view
- Supports drag-and-drop to reschedule events
- Supports resize to change event duration
- On drop/resize, sends PUT request to update backend
- Shows event details in tooltip/modal
- Responsive: switches to day view on small screens

## Tech Stack

- **Next.js** (v16+, App Router) — React framework with SSR/SSG
- **React** (v19+) — Component library with hooks
- **TypeScript** — Type-safe JavaScript
- **CSS Modules** — Scoped component styling (no tailwind per requirements)
- **FullCalendar** (v6+) — Interactive calendar library
- **Lucide React** — Icon library
- **Cloudinary** — Cloud image storage (notice images)
- **dotenv** — Environment variable management

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
