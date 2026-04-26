# TG FUN HUB

A production-ready social media platform built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, **MongoDB**, and **Redis**.

## Features (Phase 1)

- **Auth**: Register, email verification, login, logout, refresh token rotation, forgot/reset password
- **Security**: JWT HTTP-only cookies, bcrypt (12 rounds), rate limiting (5/15min), account lockout (10 fails)
- **Posts**: Create (text + up to 4 images), feed with infinite scroll (cursor-based), delete
- **Likes**: Toggle with optimistic UI updates
- **Comments**: Nested (max depth 2), create, delete
- **Profiles**: Avatar upload (Cloudinary), username, bio, private toggle
- **Settings**: Theme (light/dark/system), email notifications, change password
- **Design**: Minimal Apple/Notion inspired, black/white/gray only, dark mode, responsive

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| Database | MongoDB + Mongoose |
| Cache / Rate Limit | Redis |
| Auth | JWT (access 15m + refresh 7d) |
| State | Zustand |
| Server State | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Emails | Nodemailer |
| Images | Cloudinary |
| Animations | Framer Motion + Lenis |
| Icons | Lucide React |

## Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Redis (local or Upstash)
- Cloudinary account (free tier ok)
- Gmail App Password (for email)

### 1. Install dependencies

```bash
cd tgapp
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local`:
- `MONGODB_URI` — your MongoDB connection string
- `REDIS_URL` — your Redis URL
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — at least 32 random characters each
- SMTP settings — use a Gmail App Password
- Cloudinary keys — from your Cloudinary dashboard

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Test the app

1. Register at `/register`
2. Check email for verification link
3. Verify email and log in at `/login`
4. Create posts, like, comment!

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, register, verify-email, forgot/reset password
│   ├── (dashboard)/     # Feed, profile, settings (protected)
│   └── api/             # All API routes
├── components/
│   ├── ui/              # Button, Input, Card, Modal, Skeleton, ThemeToggle
│   ├── feed/            # PostCard, CreatePost, CommentSection, FeedSkeleton
│   ├── layout/          # Navbar, Sidebar, MobileBottomNav
│   └── shared/          # Loader, ImageUpload, Providers
├── hooks/               # useAuth, usePosts, useComments, useInfiniteScroll
├── lib/
│   ├── auth/            # JWT, bcrypt, middleware
│   ├── db/              # Mongoose, Redis, models
│   ├── email/           # Nodemailer
│   ├── utils/           # Rate limiting
│   └── validators/      # Zod schemas
├── store/               # Zustand (auth, theme)
├── types/               # TypeScript interfaces
└── middleware.ts         # Route protection
```

## Future Phases

- **Phase 2**: Reels / short video feed
- **Phase 3**: Real-time chat (Socket.IO)
- **Phase 4**: Voice/video calls (WebRTC)
- **Phase 5**: Video platform
- **Phase 6**: E-commerce (Razorpay)
- **Phase 7**: AI chat assistant

## License

MIT
