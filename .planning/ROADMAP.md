# TG FUN HUB — ROADMAP.md

## Milestone 1 — Phase 1: Core Platform

### Phase 1 — Project Scaffold & Infrastructure
**Goal:** Initialize Next.js 14 project with TypeScript, Tailwind, and all core dependencies. Set up folder structure, env files, MongoDB/Redis connections, and base configurations.

**Plans:**
1. Scaffold Next.js 14 project with TypeScript + Tailwind CSS
2. Install all Phase 1 dependencies
3. Create `.env.local`, `.env.example`
4. Configure `next.config.js`, `tailwind.config.ts`, `tsconfig.json`
5. Set up MongoDB connection (`lib/db/mongoose.ts`)
6. Set up Redis connection (`lib/db/redis.ts`)
7. Create all Mongoose schemas (User, Post, Like, Comment)
8. Configure base `globals.css` with design tokens

**Status:** ✅ COMPLETE

---

### Phase 2 — Authentication System
**Goal:** Full auth: register, email verification, login, logout, refresh tokens, password reset. Rate limiting and account lockout.

**Plans:**
1. JWT utilities (`lib/auth/jwt.ts`)
2. bcrypt utilities (`lib/auth/bcrypt.ts`)
3. Nodemailer email service (`lib/email/nodemailer.ts`)
4. Zod validation schemas (`lib/validators/auth.ts`)
5. Rate limiting utility (`lib/utils/rate-limit.ts`)
6. Auth middleware (`lib/auth/middleware.ts`)
7. Next.js middleware.ts (protected routes)
8. API routes: register, login, logout, refresh, verify-email, forgot-password, reset-password
9. Auth UI pages: login, register, verify-email, forgot-password, reset-password
10. Zustand auth store (`store/authStore.ts`)

**Status:** ✅ COMPLETE

---

### Phase 3 — User Profile & Settings
**Goal:** Profile page, edit profile (avatar upload, username, bio, private toggle), settings (theme, notifications, privacy, change password).

**Plans:**
1. User API routes (`api/users/[username]`, `api/users/profile`)
2. Upload API route (Cloudinary-ready)
3. Profile page (`(dashboard)/profile/[username]`)
4. Profile edit page (`(dashboard)/profile/edit`)
5. Settings page (`(dashboard)/settings`)
6. ImageUpload component
7. Theme store + toggle (`store/themeStore.ts`, `components/ui/ThemeToggle.tsx`)

**Status:** ✅ COMPLETE

---

### Phase 4 — Post System & Feed
**Goal:** Create/delete posts (text + images), feed with infinite scroll, post cards with stats.

**Plans:**
1. Post Zod validators (`lib/validators/post.ts`)
2. Posts API routes (GET feed, POST create, DELETE, like toggle)
3. Feed page (`(dashboard)/feed`)
4. CreatePost component
5. PostCard component
6. FeedSkeleton component
7. usePosts hook (TanStack Query + infinite scroll)
8. useInfiniteScroll hook

**Status:** ✅ COMPLETE

---

### Phase 5 — Like & Comment Systems
**Goal:** Like toggle with optimistic UI, comment CRUD with nested replies (max depth 2).

**Plans:**
1. Like API route (toggle)
2. Comments API routes (POST, DELETE)
3. LikeButton component (optimistic UI)
4. CommentSection component
5. useComments hook

**Status:** ✅ COMPLETE

---

### Phase 6 — Navigation & Layout
**Goal:** Responsive navbar, sidebar, mobile bottom nav, active route highlighting, dashboard layout.

**Plans:**
1. Dashboard layout (`(dashboard)/layout.tsx`)
2. Auth layout (`(auth)/layout.tsx`)
3. Navbar component
4. Sidebar component
5. MobileBottomNav component
6. Root layout + home page redirect

**Status:** ✅ COMPLETE

---

### Phase 7 — UI Polish & Performance
**Goal:** Lenis smooth scrolling, scroll animations, loading skeletons, error boundaries, toast notifications, full responsive polish.

**Plans:**
1. Lenis integration
2. Scroll animations (Framer Motion)
3. All Skeleton components
4. Error boundary + toast setup
5. Image optimization (next/image throughout)
6. Mobile responsiveness audit (iPhone SE → 1920×1080)
7. README.md

**Status:** ✅ COMPLETE


## Milestone 2 — Phase 2: Reels / Short Video Feed

### Phase 2.1 — Video Upload Infrastructure
**Goal:** Enable secure, optimized video uploading and storage using Cloudinary.

**Plans:**
1. Configure Cloudinary video upload presets for optimized delivery.
2. Create server-side route /api/upload/video handling chunked video uploads.
3. Validate video format (mp4, webm) and size limits (e.g., max 50MB).

**Status:** ✅ COMPLETE

---

### Phase 2.2 — Database & API Adjustments
**Goal:** Update schemas and APIs to support video posts (Reels).

**Plans:**
1. Update Post schema: add 	ype: 'text' | 'reel' and ideoUrl fields.
2. Update Zod validators for Reel creation.
3. Modify GET /api/posts or create GET /api/reels to fetch only video posts.

**Status:** ✅ COMPLETE

---

### Phase 2.3 — Reel Creation UI
**Goal:** Build the interface for users to upload and publish reels.

**Plans:**
1. Create /reels/create page or a modal.
2. Build video dropzone/upload component with progress bar.
3. Form for caption and submission.

**Status:** ✅ COMPLETE

---

### Phase 2.4 — Reels Feed UI (TikTok-style)
**Goal:** Implement full-screen, swipeable short video feed.

**Plans:**
1. Create /reels page route.
2. Build ReelPlayer component (Intersection Observer for auto-play/pause, tap to mute, looping).
3. Implement vertical snap-scrolling layout using CSS scroll snap or Lenis.
4. Overlay UI: Like, Comment, Share buttons on the right side.
5. Integrate with infinite scroll data fetching.

**Status:** ✅ COMPLETE

## Milestone 4 — Phase 4: Voice/Video Calls (WebRTC)

### Phase 4.1 — WebRTC Signaling Infrastructure
**Goal:** Update Socket.IO server to act as a signaling server for WebRTC.

**Plans:**
1. Add call_user, nswer_call, ice_candidate, end_call events to server.js.
2. Add incoming call modal/notification logic globally.

**Status:** ✅ COMPLETE

---

### Phase 4.2 — WebRTC Client Hook & Connection
**Goal:** Create React hooks to manage media devices and peer connections.

**Plans:**
1. Create useWebRTC.ts hook.
2. Handle getUserMedia for audio/video tracks.
3. Implement RTCPeerConnection creation, offer/answer flow, and ICE candidate exchange.
4. Configure public STUN servers.

**Status:** ✅ COMPLETE

---

### Phase 4.3 — Call UI Integration
**Goal:** Build the calling interface and integrate it into ActiveChat.

**Plans:**
1. Add Phone and Video buttons to ActiveChat.tsx header.
2. Create a full-screen CallOverlay component for active calls (with local/remote video grids).
3. Add mute audio / disable video controls.

**Status:** ✅ COMPLETE

## Milestone 5 — Phase 5: Video Platform

### Phase 5.1 — Schema & Video APIs
**Goal:** Extend post schema to support long-form videos with thumbnails and titles.

**Plans:**
1. Update Post schema type to include ideo.
2. Create /api/videos endpoints.
3. Add 	itle and 	humbnailUrl to post schema.

**Status:** ✅ COMPLETE

---

### Phase 5.2 — Video Browsing UI
**Goal:** Build a minimalist video catalog.

**Plans:**
1. Create /videos page.
2. Build a responsive video grid layout.
3. Implement infinite scroll for videos.

**Status:** ✅ COMPLETE

---

### Phase 5.3 — Video Player & Upload
**Goal:** Build the viewing experience and upload flow.

**Plans:**
1. Build custom LongVideoPlayer.tsx with controls.
2. Create /videos/[id] dedicated viewing route.
3. Create /videos/create upload route with thumbnail selection.

**Status:** ✅ COMPLETE

## Milestone 6 — Phase 6: E-commerce (Razorpay)

### Phase 6.1 — Database & Models
**Goal:** Create Product and Order models in MongoDB.

**Plans:**
1. Create Product schema.
2. Create Order schema.
3. Add Razorpay API keys to .env.local.

**Status:** ✅ COMPLETE

---

### Phase 6.2 — Payment Backend
**Goal:** Build Razorpay order creation and webhook verification APIs.

**Plans:**
1. Create /api/checkout to generate Razorpay order IDs.
2. Create /api/webhooks/razorpay to securely verify signatures using crypto.
3. Create /api/products to list items.

**Status:** ✅ COMPLETE

---

### Phase 6.3 — Storefront UI
**Goal:** Build the shopping interface.

**Plans:**
1. Create /shop route with product grid.
2. Create /shop/[id] detail page with Buy Now button.
3. Integrate Razorpay checkout popup (client-side script).

**Status:** ✅ COMPLETE

## Milestone 7 — Phase 7: AI Chat Assistant

### Phase 7.1 — AI Engine Setup
**Goal:** Integrate Google Gemini AI for intelligent platform assistance.

**Plans:**
1. Add GEMINI_API_KEY to .env.local.
2. Create /api/ai/chat endpoint using @google/generative-ai.
3. Define system prompt for the TG Fun Hub Assistant.

**Status:** ✅ COMPLETE

---

### Phase 7.2 — Assistant UI
**Goal:** Build a sleek, persistent AI chat interface.

**Plans:**
1. Create AIChatBot floating component.
2. Implement real-time streaming-like responses (or smooth typing effect).
3. Ensure minimalist design matches the rest of the app.

**Status:** ✅ COMPLETE