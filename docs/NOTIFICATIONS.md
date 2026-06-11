# Tourongo — Notification System

## Overview

Tourongo features a fully integrated, multi-channel alerting system ensuring all three user roles (Travelers, Guides, and Admins) receive instant updates on critical events.

Every notification flows through four channels simultaneously:
1. **In-App Database** — persisted in PostgreSQL, viewable in the notification feed
2. **WebSocket Push** — real-time bell badge increment via STOMP broker
3. **Browser Push API** — native OS popups when the tab is backgrounded
4. **Email** — transactional emails via Brevo HTTP REST API on critical state changes

---

## Backend Architecture

### `NotificationService`

Located at `com.travelmarket.backend.notification.service.NotificationService`. Core coordinator for all notification dispatch.

- **Persistence:** Saves to `notifications` table via `NotificationRepository`.
- **Real-Time Push:** Broadcasts over STOMP to `/topic/notifications/{userId}` via `SimpMessagingTemplate`.
- **In-App Only Variant:** `createNotificationInAppOnly()` — used by `ReviewReminderService` to avoid duplicate emails when a richer branded email was already sent separately.
- **Retrieval:** Paginated `GET /api/notifications` + unread count endpoint.

### Notification Types (Complete)

| Category | Types |
|----------|-------|
| Auth | `EMAIL_VERIFIED`, `PASSWORD_CHANGED`, `PROFILE_COMPLETED`, `SETUP_PASSWORD_REMINDER` |
| Verification | `VERIFICATION_SUBMITTED`, `VERIFICATION_APPROVED`, `VERIFICATION_REJECTED` |
| Bookings | `BOOKING_CREATED`, `BOOKING_CONFIRMED`, `BOOKING_CANCELLED`, `BOOKING_EXPIRED` |
| Payments | `PAYMENT_SUCCESS`, `PAYMENT_FAILED`, `PAYOUT_PROCESSED` |
| Reviews | `REVIEW_REMINDER` |
| Disputes | `DISPUTE_OPENED`, `DISPUTE_STATUS_CHANGED`, `DISPUTE_RESOLVED`, `DISPUTE_REJECTED` |
| Chat | `NEW_MESSAGE` |
| Admin | `SYSTEM_ALERT`, `ACCOUNT_SUSPENDED`, `ACCOUNT_REACTIVATED` |

### Services Emitting Notifications

- `AuthController` — security events (password reset, email verification)
- `GuideVerificationController` / `AdminGuideVerificationController` — KYC status updates
- `BookingService` — full booking lifecycle (created, confirmed, cancelled, expired)
- `StripePaymentService` — payment success/failure, payout processed
- `ChatService` — new message pings
- `ReviewReminderService` — 24h post-completion review nudge (in-app only)
- `DisputeService` — dispute opened, responded to, resolved, rejected
- `AdminUserService` — account suspensions and reactivations

---

## Frontend Architecture

### Hooks & Components

| Hook / Component | Purpose |
|------------------|---------|
| `useNotificationSocket.ts` | STOMP subscriber to `/topic/notifications/{userId}`. Prepends new notifications to state, increments unread badge. |
| `usePushNotifications.ts` | Wraps `Notification.requestPermission()`. Shows native OS popup when tab is backgrounded. |
| `useBadgeReset.ts` | Resets unread count to 0 when the notification panel is opened. |
| `NotificationBell.tsx` | Dropdown component in `Navigation.tsx`. Badge increments in real-time without page reload. |

### Features
- Real-time unread counter badge
- WebSocket-driven list prepending (no polling)
- REST fallback: `GET /api/notifications` loaded on page mount
- Ask-when-ready browser push permission prompting

---

## Flow Example: New Booking Created

1. Traveler clicks **Instant Book**
2. `BookingService.createBooking()` persists the booking snapshot
3. `notificationService.createNotification(guideUserId, BOOKING_CREATED, ...)` called
4. Entity saved in PostgreSQL `notifications` table
5. `SimpMessagingTemplate` broadcasts JSON over `/topic/notifications/{guideUserId}`
6. Guide's `useNotificationSocket` hook catches the STOMP message
7. Local React state prepends the notification, increments the red badge
8. `usePushNotifications` fires a native OS popup if the guide's tab is backgrounded
