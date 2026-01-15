# Timetable App Frontend

A modern React/Next.js frontend for the Timetable Management System.

## Features

- **Admin Panel**: Manage class schedules with an intuitive interface
- **Student Dashboard**: View personalized class timetables
- **Live Schedule Preview**: Real-time display of today's classes
- **Responsive Design**: Works on desktop and mobile devices
- **Class Management**: Add, edit, and delete class sessions
- **Category Support**: Personal tuition and external institute classes
- **Class Types**: Theory, Revision, and Paper Class support
- **Medium Support**: Tamil and English medium classes

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules
- **Icons**: Lucide React
- **State Management**: React Hooks

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend server running (see backend README)

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the frontend directory:
   ```
   NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```
frontend/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin panel pages
│   ├── student/           # Student dashboard
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── config.ts              # Configuration constants
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript configuration
```

## Pages

- **Home (`/`)**: Landing page with live schedule preview
- **Student Dashboard (`/student`)**: View weekly schedule by day
- **Admin Login (`/admin-login`)**: Admin authentication
- **Admin Panel (`/admin`)**: Full timetable management interface

## Features Overview

### Admin Panel
- Add new class sessions with detailed information
- Edit existing classes
- Delete classes with confirmation
- Filter by category (Personal/External)
- Set class types (Theory/Revision/Paper Class)
- Choose medium (Tamil/English)
- Time conflict detection
- Visual schedule overview

### Student Dashboard
- View classes by day of the week
- Filter personal tuition classes
- Clean, card-based layout
- Time and location information

### Home Page
- Live preview of today's schedule
- Quick navigation to student/admin views
- Real-time clock display

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Environment Variables

- `NEXT_PUBLIC_BACKEND_URL`: Backend API URL (default: http://localhost:5000)

## Styling

The application uses CSS Modules for component-scoped styling with a clean, modern design featuring:

- Responsive grid layouts
- Color-coded badges for class types and mediums
- Smooth animations and transitions
- Mobile-first approach
- Consistent typography and spacing

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow the existing code style
2. Use TypeScript for type safety
3. Test on multiple screen sizes
4. Ensure accessibility compliance
