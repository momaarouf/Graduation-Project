# SafariHub API Reference

This document provides a high-level overview of the available REST API endpoints in the SafariHub backend.

> **Note:** All protected endpoints require a valid JWT Bearer token in the `Authorization` header.

## Authentication (`/api/auth`)
*   `POST /register` - Register a new user (Traveler or Guide).
*   `POST /login` - Authenticate user, returns JWT and sets HttpOnly refresh cookie.
*   `POST /refresh` - Rotate refresh token and issue new JWT.
*   `POST /logout` - Invalidate current session.
*   `POST /logout-all` - Invalidate all sessions across all devices.
*   `GET /me` - Get current user profile and role.

## User Profiles (`/api/traveler`, `/api/guide`)
*   `POST /traveler/profile/complete` - Complete traveler profile.
*   `PUT /traveler/profile` - Update traveler profile.
*   `POST /guide/profile/complete` - Complete guide profile.
*   `PUT /guide/profile` - Update guide profile.

## Guide Verification (`/api/guide/verification`)
*   `POST /submit` - Submit documents (e.g., National ID) for admin review.
*   `GET /status` - Check current verification status.

## Tours (`/api/tours`, `/api/guide/tours`)
*   `GET /api/tours` - Publicly browse and search tours (supports filters).
*   `GET /api/tours/{id}` - Get full public details of a specific tour.
*   `POST /api/guide/tours` - Create a new Tour Template (Guide only).
*   `PUT /api/guide/tours/{id}` - Update a Tour Template.
*   `POST /api/guide/tours/{id}/occurrences` - Generate specific dates (Occurrences) for a template.

## Bookings (`/api/bookings`)
*   `POST /` - Request or Instant-Book a tour occurrence.
*   `GET /my-bookings` - List all bookings for the current user.
*   `POST /{id}/cancel` - Cancel a booking (rules apply based on time to tour).

## Payments & Payouts (`/api/payments`, `/api/admin/payouts`)
*   `POST /api/payments/intent` - Create a Stripe PaymentIntent for a booking.
*   `GET /api/guide/earnings` - View guide balance and past payouts.
*   `POST /api/admin/payouts/{guideId}` - Process a manual payout to a guide.

## Communication (`/api/chat`, `/api/notifications`)
*   `GET /api/chat/conversations` - List user's active chats.
*   `GET /api/chat/conversations/{id}/messages` - Load message history.
*   `GET /api/notifications` - Get user's notification feed.
*   `PUT /api/notifications/read-all` - Mark all notifications as read.

## Admin Actions (`/api/admin`)
*   `GET /users` - List all users (with search/filter).
*   `PATCH /users/{id}/suspend` - Temporarily suspend a user.
*   `PATCH /users/{id}/ban` - Permanently ban a user.
*   `GET /guide-verifications/pending` - List guides awaiting verification.
*   `PATCH /guide-verifications/{id}/approve` - Approve a guide's credentials.
*   `GET /audit` - View system audit logs (user actions, admin actions).
