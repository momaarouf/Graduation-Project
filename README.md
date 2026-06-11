<div align="center">

<br/>

# 🌍 Tourongo

### Trust-first · Halal-friendly · Lebanon & Turkey Travel Marketplace

*A production-deployed travel marketplace built entirely from scratch.*

<br/>

[![Java 17](https://img.shields.io/badge/Java-17-ED8B00?style=flat&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot 3](https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F?style=flat&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?style=flat&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![Oracle Cloud](https://img.shields.io/badge/Oracle_Cloud-F80000?style=flat&logo=oracle&logoColor=white)](https://www.oracle.com/cloud/)

<br/>

</div>

---

## 📖 Overview

**Tourongo** is a production-deployed, full-stack travel marketplace for Halal-friendly tours in Lebanon and Turkey.

Built from the ground up as a graduation project (scored 95/100) and now live on custom infrastructure, this platform handles complex multi-role workflows (Travelers, Guides, Admins) and high-concurrency booking scenarios.

---

## 🛡️ Security Architecture

- **Stateless JWT & Session Invalidation:** Access tokens never touch cookies, refresh tokens never touch JavaScript. Token versioning enables instant global session invalidation across all devices.
- **Forced OAuth2 Resolution:** Google OAuth2 login prevents silent automatic re-authentication using cached Google sessions.
- **Method-Level RBAC:** Every backend endpoint is locked via Spring Security annotations.
- **Rate Limiting & Expiry Codes:** Brute force protection on sensitive endpoints. Time-limited 6-digit verification codes (15-min expiry).
- **Signed Direct-to-Cloud Uploads:** Cloudinary architecture where the backend generates cryptographic SHA-1 signatures. Raw images upload directly to Cloudinary and never pass through the Java server.
- **WAF & Edge Protection:** Nginx reverse proxy hides the backend behind Cloudflare WAF with DDoS protection at the edge.
- **Ransomware-Resistant Backups:** Isolated nightly backup vault on a completely separate server via rsync pull architecture. The main server has zero knowledge of the vault.

---

## ⚙️ Backend Systems

- **Pessimistic Locking:** Database locking on all booking mutations preventing race conditions on seat inventory under concurrent load.
- **Atomic Transactions:** Booking mutations with full rollback on payment failure — no partial state ever persists.
- **Deterministic FIFO Waitlist:** Automatic capacity-based seat promotion logic.
- **Time-Based State Transitions:** 15-minute cart lock and 48h payout escrow triggered by QR handshake check-in, handled by scheduled background jobs.
- **Dynamic Pricing Engine:** Computes weekend/holiday multipliers and group discounts dynamically at booking time.
- **Loyalty Tier Engine:** Bronze → Silver → Gold progression with automatic upgrade and discount injection.
- **Real-Time Communication:** WebSocket chat with message delivery/seen status, in-app notification system with email mirroring via Brevo REST API.
- **Audit & Dispute Resolution:** Full admin audit trail and 7-day post-completion dispute resolution window.

---

## 💻 Frontend & Infrastructure

- **Next.js 16 / React 19:** Server-side rendered frontend deployed on Vercel with automatic preview deployments.
- **Interactive UI:** Leaflet.js itinerary builder with click-to-place stops and live route rendering.
- **Infrastructure:** Oracle Cloud backend VMs with Docker Compose, Nginx, Certbot SSL, and Cloudflare WAF.
- **CI/CD:** GitHub Actions pipeline with automated SSH deploy on push to main.
- **Migrations:** Flyway database migrations for fully versioned, auditable schema changes.

---

## 📚 API Reference
*(Full Postman collection available in the repository root)*

- **Auth:** `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout-all`
- **Tours:** `/api/public/tours`, `/api/public/tours/{id}`, `/api/guide/tours`
- **Booking & Waitlist:** `/api/traveler/bookings`, `/api/traveler/waitlist`, `/api/guide/bookings/{id}/confirm`
- **Payments:** `/api/payments/create-session`, `/api/payments/webhook`
- **Real-time Chat & Notifications:** `/api/chat/initiate`, `/api/notifications/unread-count`, STOMP broker at `ws://localhost:8081/ws-chat`

---

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL 15+
- Docker

### Backend Setup
1. Clone the repository.
2. Setup your PostgreSQL database.
3. Configure `backend/src/main/resources/application.properties` with your credentials (JWT Secret, DB, Cloudinary, Brevo, Stripe, Google OAuth).
4. Run `./mvnw spring-boot:run`. Flyway will apply migrations automatically.

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Run `npm install`.
3. Run `npm run dev` to start the Next.js server. The frontend proxies `/api/*` to `http://localhost:8081` automatically.

---

<div align="center">
Designed and developed by <a href="https://github.com/mo-maarouf">Mohamad Maarouf</a>
</div>
