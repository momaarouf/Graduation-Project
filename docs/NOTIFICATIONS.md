# Notification System Documentation

## Overview
The Travel Marketplace notification system is a fully integrated, multi-channel alerting system that ensures users (Travelers, Guides, and Admins) are instantly updated on critical events.

The system relies on an event-driven architecture, pushing notifications to:
1. **In-App Notification Database** (Viewable via the App UI)
2. **WebSocket Publisher** (Real-time bell updates)
3. **Browser Push API** (Foreground popups)
4. **Email Pipeline** (Via Brevo, integrated during critical state changes)

## Backend Architecture

### `NotificationService`
Located at `com.travelmarket.backend.notification.service.NotificationService`, this is the core notification coordinator.

- **Persistence**: Saves notifications via `NotificationRepository`.
- **Real-Time Push**: Emits a newly saved notification over the WebSocket broker using `SimpMessagingTemplate` on the topic `/topic/notifications/{userId}`.
- **Retrieval**: Provides paginated endpoints and unread counts for the frontend.

### Supported Notification Types
The `NotificationType` enum categorizes notification events:
- `ACCOUNT_CREATED`, `EMAIL_VERIFIED`, `PASSWORD_CHANGED`
- `VERIFICATION_SUBMITTED`, `VERIFICATION_APPROVED`, `VERIFICATION_REJECTED`
- `BOOKING_CREATED`, `BOOKING_CONFIRMED`, `BOOKING_CANCELLED`
- `PAYMENT_SUCCESS`, `PAYMENT_FAILED`
- `NEW_MESSAGE`, `SYSTEM_ALERT`

### Services Emitting Notifications
- `AuthController`: Security/Auth events (Password reset, email verification).
- `GuideVerificationController` / `AdminGuideVerificationController`: KYC document status updates.
- `BookingService`: Booking lifecycle (Requests, Cancellations, Confirmations).
- `StripePaymentService`: Payment status (Expired sessions, successful checkouts).
- `ChatService`: Instant messaging pings.

---

## Frontend Architecture

### State Management & Components
1. **`usePushNotifications.ts`**: Web-standard `Notification.requestPermission()` wrapper to handle browser push popups.
2. **`useNotificationSocket.ts`**: STOMP over SockJS wrapper that connects to `/ws-chat` and subscribes to `/topic/notifications/{userId}`. Updates the UI context dynamically.
3. **`NotificationBell.tsx`**: A dynamic dropdown component integrated into the `Navigation.tsx` navbar. Unread counts increment in real-time without reloading the page.

### Features
- Real-time Unread Counter Badge.
- WebSocket-driven list prepending.
- Seamless fallback to `getNotifications` REST polling on load.
- Ask-when-ready Foreground Push prompting context (e.g., Guide receives a message, prompt to allow notifications).

---

## Flow Example: New Booking Created
1. Traveler clicks **Instant Book**.
2. `BookingService.createBooking` executes and persists the snapshot.
3. `NotificationService.createNotification(guideUserId, BOOKING_CREATED, ...)` is called.
4. Entity is saved in PostgreSQL database.
5. `SimpMessagingTemplate` broadcasts JSON over `/topic/notifications/{guideUserId}`.
6. The Guide's `useNotificationSocket` hook catches the message over STOMP.
7. Local React state prepends the new message into the list and increments the red bubble count.
8. `usePushNotifications` checks if permission is 'granted' and displays a native macOS/Windows popup if the tab is backgrounded.
