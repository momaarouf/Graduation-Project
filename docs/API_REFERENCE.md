# Tourongo API Reference

This document provides a high-level overview of the available REST API endpoints in the Tourongo backend.

> **Note:** All protected endpoints require a valid JWT Bearer token in the `Authorization: Bearer <token>` header.

## Authentication (`/api/auth`)

### Core Auth
- `POST /register` — Register a new user (Traveler or Guide). Returns JWT.
- `POST /login` — Authenticate user. Returns JWT + sets HttpOnly refresh cookie.
- `POST /refresh` — Rotate refresh token, issue new JWT.
- `POST /logout` — Invalidate current session (revoke refresh token).
- `POST /logout-all` — Invalidate all sessions across all devices (increments tokenVersion).
- `GET /me` — Get current user profile: `{ userId, email, role, travelerProfileId, guideProfileId }`.

### Email Verification
- `POST /email/verify/request` — Send 6-digit verification code to email.
- `POST /email/verify/confirm-code` — Confirm with `{ email, code }`.
- `POST /email/verify/confirm-token` — Confirm with `{ token }`.

### Password Management
- `POST /password/forgot` — Send 8-digit reset code to email (expires in 15 min).
- `POST /password/reset` — Reset password with `{ token: "<8-digit-code>", newPassword }`.
- `POST /password/change` — Change password with `{ currentPassword, newPassword }` (authenticated).
- `POST /password/setup/request` — OAuth users: send 6-digit code to set a password.
- `POST /password/setup/confirm` — Confirm password setup with `{ code, newPassword }`.

---

## User Profiles (`/api/traveler`, `/api/guide`)

- `POST /traveler/profile/complete` — Complete traveler profile (name, bio, location, etc.).
- `PUT /traveler/profile` — Update traveler profile.
- `POST /guide/profile/complete` — Complete guide profile.
- `PUT /guide/profile` — Update guide profile.

---

## Guide Verification (`/api/guide/verification`)

- `POST /submit` — Submit KYC documents (National ID requires front + back image) for admin review.
- `GET /status` — Check current verification status.

---

## Tours (`/api/public/tours`, `/api/guide/tours`)

### Public (No Auth)
- `GET /api/public/tours` — Browse and search tours. Supports filters: location, date range, price, language, etc.
- `GET /api/public/tours/{id}` — Full public detail of a specific Tour Template, including occurrences.

### Guide (Auth: Guide)
- `POST /api/guide/tours` — Create a new Tour Template (starts as DRAFT).
- `PUT /api/guide/tours/{id}` — Update a Tour Template.
- `DELETE /api/guide/tours/{id}` — Soft-delete a Tour Template.
- `POST /api/guide/tours/{id}/submit` — Submit for admin review (DRAFT → PENDING_REVIEW).
- `POST /api/guide/tours/{id}/pause` — Pause a published tour.
- `POST /api/guide/tours/{id}/resume` — Resume a paused tour.
- `POST /api/guide/tours/{id}/occurrences` — Generate scheduled dates (Occurrences) for a template.
- `DELETE /api/guide/tours/{id}/occurrences/{occurrenceId}` — Remove a future occurrence.

---

## Bookings (`/api/traveler/bookings`, `/api/guide/bookings`)

- `POST /api/traveler/bookings` — Create a booking (Instant Book or Request to Book).
- `GET /api/traveler/bookings` — List all bookings for the current traveler.
- `GET /api/traveler/bookings/{id}` — Get booking detail including payment deadline countdown.
- `POST /api/traveler/bookings/{id}/cancel` — Cancel a booking (refund per cancellation policy).
- `GET /api/guide/bookings` — List all bookings for the guide's tours.
- `POST /api/guide/bookings/{id}/confirm` — Accept a Request-to-Book request.
- `POST /api/guide/bookings/{id}/reject` — Reject a Request-to-Book request.
- `POST /api/guide/bookings/checkin-by-qr/{qrToken}` — QR scan handshake: Confirmed → InProgress.
- `POST /api/guide/bookings/{id}/complete` — Mark tour as Completed.

---

## Waitlist (`/api/traveler/waitlist`)

- `POST /api/traveler/waitlist` — Join the waitlist for a full occurrence.
- `DELETE /api/traveler/waitlist/{id}` — Leave the waitlist.
- `GET /api/traveler/waitlist` — List active waitlist entries.

---

## Payments & Payouts (`/api/payments`, `/api/guide/wallet`)

- `POST /api/payments/create-session` — Create a Stripe Checkout session for a PendingPayment booking.
- `POST /api/payments/webhook` — Stripe webhook receiver (checkout.session.completed).
- `POST /api/payments/mock/confirm/{sessionId}` — Simulate payment success (mock mode only).
- `GET /api/guide/wallet` — View guide's balance, pending payouts, and payout history.
- `GET /api/guide/wallet/payouts` — Detailed payout records.

---

## Cloudinary (`/api/cloudinary`)

- `GET /api/cloudinary/signature` — Generate a server-signed upload signature. Used by the frontend to upload images directly to Cloudinary without passing through the Java server.

---

## Reviews (`/api/traveler/reviews`, `/api/public/tours`)

- `POST /api/traveler/bookings/{id}/review` — Submit a review for a completed booking.
- `GET /api/public/tours/{id}/reviews` — Browse public reviews for a tour.

---

## Disputes (`/api/disputes`)

- `POST /api/disputes` — Open a dispute on a completed booking (within 7-day window).
- `GET /api/disputes` — List current user's disputes.
- `POST /api/disputes/{id}/respond` — Submit a response to an active dispute.

---

## Real-Time Chat & Notifications (`/api/chat`, `/api/notifications`)

- `POST /api/chat/initiate` — Start or find a conversation between a traveler and guide.
- `GET /api/chat/conversations` — List all active conversations.
- `GET /api/chat/conversations/{id}/messages` — Load paginated message history.
- `POST /api/chat/conversations/{id}/messages` — Send a message.
- `PUT /api/chat/conversations/{id}/read` — Mark all messages as read.
- `GET /api/notifications` — Get notification feed (paginated).
- `GET /api/notifications/unread-count` — Get unread badge count.
- `PUT /api/notifications/read-all` — Mark all as read.
- **WebSocket:** STOMP over SockJS at `/ws-chat`. Topics: `/topic/chat/{conversationId}`, `/topic/notifications/{userId}`.

---

## Admin (`/api/admin`)

### User Management
- `GET /api/admin/users` — List all users (supports `?email=` filter).
- `GET /api/admin/users/{id}` — Get user detail.
- `PATCH /api/admin/users/{id}/suspend` — Temporarily suspend with `{ reason, untilUtc? }`.
- `PATCH /api/admin/users/{id}/activate` — Activate a user.
- `PATCH /api/admin/users/{id}/ban` — Permanently ban with `{ reason }`.
- `PATCH /api/admin/users/{id}/deactivate` — Deactivate an account.
- `PATCH /api/admin/users/{id}/reactivate` — Reactivate a deactivated account.

### Guide Verification
- `GET /api/admin/guide-verifications/pending` — List guides awaiting verification.
- `GET /api/admin/guide-verifications/rejected` — List rejected verifications.
- `PATCH /api/admin/guide-verifications/{id}/approve` — Approve a guide's credentials.
- `PATCH /api/admin/guide-verifications/{id}/reject?reason=...` — Reject with reason.
- `PATCH /api/admin/guide-verifications/{id}/approve-override?note=...` — Override-approve with note.

### Audit & Disputes
- `GET /api/admin/audit` — View immutable admin audit trail (supports `?targetUserId=` filter).
- `GET /api/admin/disputes` — View all open disputes.
- `POST /api/admin/disputes/{id}/resolve` — Resolve a dispute with decision + optional refund.
- `POST /api/admin/disputes/{id}/reject` — Reject a dispute.

### Payouts
- `GET /api/admin/payouts` — View all guide payout records.
- `POST /api/admin/payouts/{paymentId}/retry` — Manually retry a failed payout.
