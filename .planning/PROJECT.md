# TG FUN HUB — PROJECT.md

## What This Is

A full-scale, production-ready social media web application built with Next.js 14+ (App Router), TypeScript, Tailwind CSS, MongoDB, and Redis. Phase 1 delivers a complete authentication system, user profiles, and a post/feed system. Future phases add reels, real-time chat, voice/video calls, a video platform, e-commerce, and an AI assistant.

## Core Value

A clean, minimal, Apple/Notion-inspired social platform that is performant, secure, and scalable for millions of users — starting with a solid Phase 1 foundation.

## Context

- **Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, MongoDB (Mongoose), Redis, JWT, bcrypt, Nodemailer, Cloudinary, Zustand, TanStack Query, Zod, react-hook-form, Framer Motion, Lenis
- **Design System:** Black/white/neutral gray only. No gradients. No glowing/neon. Clean, minimal, Apple/Notion inspired. Light + Dark mode with persistence.
- **Performance targets:** Initial bundle <150KB, FCP <0.9s, LCP <2.0s, CLS <0.1
- **Security:** JWT access (15min) + refresh (7d) in HTTP-only cookies, bcrypt (12 rounds), email verification, rate limiting (5/15min), account lockout (10 fails), XSS/injection protection, Helmet headers, CORS
- **Workspace:** e:\tgfunhub

## Requirements

### Validated

(None yet — ship to validate)

### Active

#### Phase 1 — Core Platform
- [x] Next.js 14 project scaffold with TypeScript + Tailwind CSS
- [x] MongoDB connection (Mongoose) with User, Post, Like, Comment schemas
- [x] Redis connection for sessions and rate limiting
- [x] JWT authentication: register, login, logout, refresh token rotation
- [x] Email verification via Nodemailer (required before login)
- [x] Password reset flow (forgot → email → reset form)
- [x] Rate limiting (5 attempts/15min) and account lockout (10 fails)
- [x] Protected routes middleware (Next.js middleware.ts)
- [x] User profile: avatar upload (Cloudinary-ready), username, bio, private toggle
- [x] Settings page: theme, notifications, privacy, change password
- [x] Post CRUD: create (text 280 chars + up to 4 images), delete own
- [x] Feed: chronological, newest first, infinite scroll with cursor pagination
- [x] Like system with optimistic UI updates
- [x] Comment system: basic, nested max depth 2, max 500 chars
- [x] Comment delete (own only)
- [x] Responsive navbar (desktop) + mobile bottom navigation
- [x] Active route highlighting
- [x] Light/Dark mode toggle with localStorage persistence
- [x] Smooth scrolling with Lenis
- [x] Subtle scroll animations (fade-in, slide-up)
- [x] Loading skeletons for all async operations
- [x] Error boundaries + toast notifications
- [x] .env.local / .env.example configuration

#### Phase 2+ (Structure ready, NOT implemented)
- [x] Reels / short videos (Phase 2)
- [x] Real-time chat Socket.IO (Phase 3)
- [x] Voice/video calls WebRTC (Phase 4)
- [x] Video platform (Phase 5)
- [x] E-commerce Razorpay (Phase 6)
- [x] AI chat assistant (Phase 7)

### Out of Scope (Phase 1)

- WebRTC / Socket.IO — Phase 3+
- E-commerce — Phase 6
- AI assistant — Phase 7
- Gradients, glowing/neon effects — FORBIDDEN by design spec
- `any` TypeScript type — FORBIDDEN

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js 14 App Router | Modern RSC, server actions, built-in routing | — Pending |
| MongoDB + Mongoose | Flexible schema, great for social data | — Pending |
| Redis for rate limiting | Fast in-memory, distributed rate limiting | — Pending |
| Zustand for auth state | Lightweight, no boilerplate vs Redux | — Pending |
| TanStack Query | Powerful server state, caching, infinite scroll | — Pending |
| Cursor-based pagination | Scalable vs offset, consistent with new posts | — Pending |
| HTTP-only cookies for JWT | XSS protection for tokens | — Pending |
| bcrypt 12 rounds | Security vs performance tradeoff | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition:**
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions

---
*Last updated: 2026-04-25 after initialization*
