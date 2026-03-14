# Copilot Instructions — Travel & Tourism Marketplace

## Project identity
This repository is a graduation project that is intended to become a real product after university.

Product: **Travel & Tourism Marketplace**  
Core positioning:
- Trust-first
- Halal-friendly tourism
- Lebanon-first, with expansion path to Turkey and beyond
- Built brick-by-brick with scalability in mind

## Fixed stack
- Backend: Java Spring Boot
- Frontend: Next.js (React, JavaScript for now)
- Database: PostgreSQL
- Migrations: Flyway
- Auth: JWT access token + refresh token in HttpOnly cookie
- OAuth: Google OAuth2
- Email: Brevo SMTP
- IDE: VS Code
- Repo layout:
  - `backend/`
  - `frontend/`
  - `docs/`
  - `.github/`

## Roles
- Traveler
- Guide
- Admin

## Core engineering principles
- Do not re-decide product fundamentals unless explicitly asked
- Preserve existing architecture and extend it cleanly
- Prefer small, production-minded changes over broad rewrites
- Keep code readable, modular, and easy to maintain
- Use DTOs and explicit payload shapes
- Never expose sensitive backend fields such as `passwordHash`
- Keep role gating strict:
  - `/api/admin/**` => Admin only
  - `/api/guide/**` => Guide only
  - `/api/traveler/**` => Traveler only
- All times are stored in UTC in the backend and converted on the frontend
- Use soft deletes; do not hard delete critical business data
- Never commit secrets; use environment variables

## Product rules that must be preserved
- Instant Book: payment => booking CONFIRMED
- Request to Book: payment authorized => booking PENDING_GUIDE
- 24h request timeout => auto refund
- Cancellation:
  - more than 48h before tour => 100% refund minus platform fee
  - 24–48h => 50% refund
  - less than 24h => no refund
- If `min_capacity` is not met 48h before tour => auto cancel + full refund
- Waitlist promotion must be safe and deterministic
- QR handshake marks booking completed
- Completed booking starts 48h payout freeze
- Traveler can report no-show within 48h after tour
- Payout is frozen until admin resolves dispute
- 15-minute cart lock
- Pessimistic locking for booking-critical operations

## UX and design intent
- Clean, modern, trust-first interface
- Light mode and dark mode
- Public pages should be SEO-friendly
- Private areas are dashboard-heavy
- Color psychology:
  - Blue => trust, primary actions
  - Green => success, verified state
  - Orange => CTA / discovery / adventure
  - Gold => loyalty / premium
  - Red => destructive actions / danger / alerts

## Backend facts already implemented
Assume these are already built unless the user explicitly says otherwise:
- Register/login with JWT access tokens
- Refresh tokens in HttpOnly cookie with rotation
- `/api/auth/refresh`
- `/api/auth/logout`
- `/api/auth/logout-all`
- Strong logout using `users.token_version` + JWT claim `tv`
- Google OAuth2 login
- Profile completion endpoints for Traveler and Guide
- Manual guide verification workflow
- Admin user lifecycle:
  - suspend
  - activate
  - ban
  - deactivate
  - reactivate
- Email verification via code
- Password reset via code
- Brevo SMTP transactional email
- In-memory rate limiting
- Admin audit trail

## Current implementation priority
The current priority is **frontend integration with the existing backend**, not redesigning the backend.

When working on the current priority, prefer this order:
1. API client / fetch wrapper / axios wrapper
2. Auth bootstrap using `/api/auth/me`
3. Login / signup wiring
4. Profile completion forms
5. Email verification UI
6. Password reset UI
7. Guide verification submission UI
8. Admin management pages
9. Only after frontend is tied correctly: move to Tour CRUD & Scheduling

## Frontend integration rules
When implementing auth integration:
- Access token may be stored in memory or local storage depending on current project structure
- Refresh token remains in HttpOnly cookie
- All refresh-sensitive requests must use credentials included
- On 401 from protected API:
  - call `/api/auth/refresh` with credentials
  - update access token
  - retry original request once
- Logout must:
  - call backend logout endpoint
  - clear local access token
  - clear user/auth state
  - route appropriately

## Required frontend capabilities for this phase
Ensure or implement:
- `/login`
- `/signup`
- app bootstrap using `/api/auth/me`
- Traveler complete profile page
- Guide complete profile page
- Email verification request + confirm code UI
- Forgot password + reset password UI
- Guide verification submit page
- Admin users management page
- Admin guide verification queue page
- Admin audit events page

## CORS / cookie expectations
When debugging auth integration:
- Frontend should call backend with credentials included where needed
- Backend must allow frontend origin with credentials
- Do not suggest insecure wildcard CORS with credentials

## Coding standards
### Frontend
- Prefer reusable hooks and utilities over duplicated fetch logic
- Keep forms typed/documented even in JS where possible
- Centralize API calls
- Avoid scattered hardcoded endpoints
- Handle loading, success, and error states clearly
- Do not silently swallow backend errors
- Preserve role-based routing behavior
- Prefer incremental changes over rewriting working pages

### Backend-related adjustments
Only make backend changes if required for integration, such as:
- CORS fixes
- cookie settings
- response payload alignment
- small DTO corrections
Do not refactor working auth modules unless necessary.

## Output style when acting as an agent
When asked to implement:
- First inspect the relevant files
- State what exists
- Identify integration gaps
- Then make minimal targeted edits
- Summarize changed files and why
- Flag any backend/frontend contract mismatch explicitly

## What not to do
- Do not invent endpoints that are not aligned with the backend
- Do not leak secure fields
- Do not replace refresh-cookie auth with insecure alternatives
- Do not remove role boundaries
- Do not change core business rules
- Do not convert the whole frontend to TypeScript unless explicitly requested
- Do not do broad styling rewrites during backend/frontend integration tasks

## Preferred next backend step after integration
After frontend integration is complete, the next backend milestone is:
- TourTemplate CRUD
- TourOccurrence generation/listing
- Public browsing/search/detail endpoints

## Definition of done for current integration phase
The phase is complete when:
- User can login and stay logged in across refresh using refresh cookie flow
- `/api/auth/me` correctly restores session state
- Traveler and Guide can complete profile from frontend
- User can request and confirm email verification code
- User can request and complete password reset
- Guide can submit verification documents/details
- Admin can manage users
- Admin can review guide verification queues
- Admin can view audit events
- No sensitive fields are exposed
- Role gating still works correctly

## Commenting requirements
All code written or modified by Copilot must be commented professionally.

### Rules
- Add clear comments for non-obvious logic
- Comment auth flow, refresh retry flow, route guards, role checks, and backend integration points
- Comment business-rule-sensitive logic such as:
  - role-based redirects
  - refresh token retry behavior
  - profile completion checks
  - admin action handlers
  - guide verification rules
- Do not add useless comments that restate trivial syntax
- Prefer concise, meaningful comments above blocks or functions
- For complex functions, include:
  - purpose
  - inputs
  - important side effects
- For API helpers, explain:
  - when credentials are included
  - when Authorization header is attached
  - when refresh is attempted
  - when logout/clear-auth fallback happens
- For backend changes, comment:
  - CORS decisions
  - cookie/security-related behavior
  - DTO mapping where it prevents sensitive leaks

### Style examples
Good:
- `// Retry the original request once after obtaining a fresh access token.`
- `// Prevent non-admin users from accessing moderation actions even if the page is reached manually.`
- `// Use credentials here so the browser sends the refresh token cookie.`

Bad:
- `// Set variable`
- `// Loop through array`
- `// Return response`

### Minimum expectation
If Copilot writes or edits a non-trivial file, the result should be understandable to a human reviewer without guessing the intent of important logic.