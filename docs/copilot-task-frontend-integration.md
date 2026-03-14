# Copilot Task Prompt — Tie Backend to Frontend
Important: all code you write or modify must be professionally commented. Add clear comments for important logic, data flow, auth handling, retry behavior, route protection, and business-rule-sensitive decisions. Avoid useless comments on obvious syntax.
You are working on a monorepo graduation project called **Travel & Tourism Marketplace**.

Your job in this task is to **tie the existing Spring Boot backend to the existing Next.js frontend**.  
Do not redesign the product. Do not redo the backend milestone that is already finished.  
Work incrementally and professionally.

## Project context
- Backend: Java Spring Boot
- Frontend: Next.js (React, JavaScript)
- Database: PostgreSQL
- Auth:
  - JWT access token
  - refresh token in HttpOnly cookie
  - `/api/auth/refresh`
  - `/api/auth/logout`
  - `/api/auth/logout-all`
  - strong logout with `users.token_version`
- OAuth2 Google login exists
- Email verification and password reset already exist
- Guide verification workflow already exists
- Admin user lifecycle already exists
- Admin audit trail already exists

## Important assumptions
Assume backend endpoints are already working and tested in Postman.
Frontend now needs to be connected to them cleanly.

## Main objective
Implement the frontend integration layer and wire the required pages/components to the backend.

## Required work order

### Step 1 — inspect existing frontend structure
First inspect and summarize:
- current folder structure
- auth utilities
- api helpers
- login/signup pages
- dashboard routing
- profile forms
- admin pages
- any middleware or route guards

Then identify what is missing before editing.

### Step 2 — build or fix the API client
Create or improve a centralized API client / wrapper with these rules:
- attach `Authorization: Bearer <accessToken>` when available
- support `credentials: 'include'` where refresh cookie is needed
- when a protected request returns 401:
  - call `/api/auth/refresh`
  - obtain new access token
  - retry the original request once
- if refresh fails:
  - clear auth state
  - route to login when appropriate

Do not scatter this logic across many components.

### Step 3 — bootstrap session with `/api/auth/me`
On app load:
- restore access token if the project already stores it locally
- call `/api/auth/me` when appropriate
- resolve:
  - current user
  - role
  - travelerProfileId
  - guideProfileId
- route user to the correct area based on role and profile state

### Step 4 — wire auth pages
Connect:
- login page
- signup page
- logout action

Requirements:
- login stores access token in the current project’s chosen auth state
- refresh cookie remains backend-managed
- logout clears auth state and calls backend endpoint
- handle error messages clearly

### Step 5 — wire profile completion
Connect existing or create missing pages/forms for:
- Traveler complete profile
- Guide complete profile

Use backend DTO shapes.  
Do not guess payload names if existing frontend/backend helpers already define them.

### Step 6 — wire email verification and password reset
Implement or connect:
- request email verification code
- confirm email verification code
- forgot password request
- reset password with code

Requirements:
- clean forms
- loading and error states
- clear success messaging
- do not expose whether an email exists if backend intentionally returns generic responses

### Step 7 — wire guide verification submit flow
Implement or connect the Guide verification submission page:
- document type
- front image URL or placeholder input
- back image URL if required
- selfie image URL or placeholder input

Respect the rule:
- NATIONAL_ID requires back image

### Step 8 — wire admin pages
Implement or connect admin UI for:
- users list and actions:
  - suspend
  - activate
  - ban
  - deactivate
  - reactivate
- guide verification queues:
  - pending
  - rejected
  - approve
  - reject
  - override
- audit events list and filtering by target

### Step 9 — validate integration assumptions
Check these integration-critical details:
- frontend origin and backend CORS settings
- `credentials: 'include'` usage
- whether backend expects cookies on refresh/logout
- whether auth routes and payloads match frontend assumptions

If a mismatch exists, propose the smallest safe fix.

## Constraints
- Keep JavaScript frontend unless a file already uses TypeScript
- Do not perform a full folder rewrite
- Do not replace working patterns unnecessarily
- Do not leak secure fields
- Do not break role-based access
- Do not invent endpoints
- Do not remove refresh-cookie design
- Do not weaken security to “make it work”
- All new or modified code must include professional comments
- Comment important logic, not trivial syntax
- Especially comment:
  - auth bootstrap
  - refresh-token retry flow
  - access token storage behavior
  - logout cleanup
  - role-based routing
  - form submission handlers
  - admin action handlers
  - any backend compatibility fix
- If an existing file has little or no commenting, improve it only around the sections being changed; do not flood the file with unnecessary comments
## Deliverable expectations
When finished, provide:
1. a concise summary of what existed
2. the missing pieces you found
3. the exact files changed
4. what each changed file now does
5. any backend changes required for CORS/cookie compatibility
6. any remaining gaps before moving to Tour CRUD & Scheduling
7. confirmation that new and modified code was commented clearly
## Definition of done
This task is complete only when:
- login works from frontend
- auth state survives page refresh through refresh flow
- `/api/auth/me` restores the session correctly
- Traveler and Guide profile completion work
- email verification works from frontend
- password reset works from frontend
- guide verification submission works
- admin management pages work
- admin audit events are visible
- no insecure shortcuts were introduced

## Next task after this
Only after the above is complete, move to:
- TourTemplate CRUD
- TourOccurrence generation/listing
- public browsing/search/detail endpoints