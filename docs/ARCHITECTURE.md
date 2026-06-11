# Tourongo Architecture

This document outlines the high-level architecture of Tourongo.

## System Overview

Tourongo follows a modern, decoupled client-server architecture deployed on custom production infrastructure.

```mermaid
graph TD
    User[Browser / Mobile] -->|HTTPS| CF[Cloudflare WAF & CDN]
    CF -->|Proxied HTTPS| Nginx[Nginx Reverse Proxy]
    Nginx -->|localhost:8081| API[Spring Boot API - Docker]
    API -->|JDBC| DB[(PostgreSQL 15 - Docker)]
    Client[Next.js - Vercel] -->|HTTPS REST & WebSockets| CF

    subgraph "Oracle Cloud Free Tier - Ubuntu 22.04"
        Nginx
        API
        DB
    end

    subgraph "External Services"
        API -->|Brevo HTTP REST API| Brevo[Brevo Transactional Email]
        API -->|Stripe API| Stripe[Stripe Payment Gateway]
        Client -->|OAuth2| Google[Google Auth]
        Client -->|Direct Upload| Cloudinary[Cloudinary CDN]
        API -->|Signed Signature| Cloudinary
    end
```

## Backend Architecture (Spring Boot)

The backend follows a standard layered architecture.

```mermaid
graph TD
    Controllers[REST Controllers] --> Services[Business Logic Services]
    Services --> Repositories[JPA Repositories]
    Repositories --> Database[(PostgreSQL)]

    subgraph "Cross-Cutting Concerns"
        Security[Spring Security & JWT]
        Time[TimeService - UTC]
        WebSockets[STOMP Message Broker]
        Scheduler[Spring @Scheduled Jobs]
    end

    Controllers -.-> Security
    Services -.-> Time
    Services -.-> WebSockets
    Services -.-> Scheduler
```

### Key Components:
1.  **Controllers:** Handle incoming HTTP requests, validate basic input using DTOs, and route to appropriate services. Never contain business logic.
2.  **Services:** Contain the core business logic (Booking lifecycle, payment calculation, notification routing). All marked `@Transactional` when writing.
3.  **Repositories:** Interface with PostgreSQL using Spring Data JPA. All queries on soft-deletable entities include `AND entity.deletedAtUtc IS NULL`.
4.  **Scheduled Jobs:** 5 background jobs — `PaymentTimeoutJob`, `ReviewReminderJob`, `BookingStatusCleanupJob`, `SuspensionCleanupJob`, `PayoutReleaseJob`.

## Frontend Architecture (Next.js)

The frontend uses Next.js 16 App Router for robust role-based layouts and server-side rendering where appropriate. Deployed globally on Vercel.

```mermaid
graph TD
    AppRouter[App Router /app] --> Layouts[Role Layouts]
    Layouts --> Pages[Route Pages]

    Pages --> Components[UI Components /src/components]
    Pages --> Hooks[Custom Hooks /src/lib/hooks]

    Hooks --> Contexts[Contexts /src/lib/contexts]
    Hooks --> API[API Clients /src/lib/api]

    Contexts -.-> AuthContext
    Contexts -.-> FilterContext
    Contexts -.-> WishlistContext
```

### Key Components:
1.  **Role-Based Routing:** The `/app/dashboard` directory is split into `/traveler`, `/guide`, and `/admin`, each protected by Layout guards checking the AuthContext.
2.  **API Client:** A centralized Axios instance (`src/lib/api/client.ts`) handles request interception (injecting JWTs) and response interception (handling 401s and token refreshes automatically — concurrent 401s are queued).
3.  **Contexts:** React Context is used sparingly for global state — Auth (`AuthContext`), Search Filtering (`FilterContext`), Wishlist (`WishlistContext`), and multi-step Signup (`SignupContext`).

## Production Infrastructure

| Layer | Technology | Purpose |
|-------|------------|--------|
| DNS & Edge | Cloudflare | WAF, DDoS protection, instant DNS propagation |
| Frontend | Vercel | Next.js SSR + automatic preview deployments |
| Reverse Proxy | Nginx + Certbot | SSL termination, routes to Docker containers |
| Backend | Spring Boot on Oracle Cloud | Java API on Ubuntu 22.04 with 2GB Swap |
| Database | PostgreSQL 15 (Docker) | Self-hosted, persistent, no cold-start delay |
| Images | Cloudinary | Direct-to-cloud uploads, CDN delivery |
| Email | Brevo HTTP REST API | Bypasses SMTP port blocks on cloud providers |
| CI/CD | GitHub Actions | Auto-deploy on push to main via SSH |
| Backups | Oracle Vault VM (rsync pull) | Ransomware-isolated nightly DB snapshots |

## Database Schema (High-Level)

```mermaid
erDiagram
    USER ||--o{ TRAVELER_PROFILE : has
    USER ||--o{ GUIDE_PROFILE : has

    GUIDE_PROFILE ||--o{ TOUR_TEMPLATE : creates
    TOUR_TEMPLATE ||--o{ TOUR_OCCURRENCE : spawns
    TOUR_TEMPLATE ||--o{ TOUR_MEDIA : has

    TRAVELER_PROFILE ||--o{ BOOKING : makes
    TOUR_OCCURRENCE ||--o{ BOOKING : receives
    TRAVELER_PROFILE ||--o{ WAITLIST_ENTRY : joins

    BOOKING ||--o| PAYMENT : requires
    BOOKING ||--o| REVIEW : gets
    BOOKING ||--o| DISPUTE : may_have

    USER ||--o{ NOTIFICATION : receives
    USER ||--o{ CONVERSATION_PARTICIPANT : joins
    CONVERSATION_PARTICIPANT ||--o{ MESSAGE : sends
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant NextJS
    participant SpringBoot

    User->>NextJS: Submits Login Form
    NextJS->>SpringBoot: POST /api/auth/login
    SpringBoot-->>NextJS: { accessToken } + HttpOnly Cookie (refreshToken)
    NextJS->>NextJS: Store accessToken in AuthContext
    NextJS->>SpringBoot: GET /api/auth/me (with accessToken)
    SpringBoot-->>NextJS: { role, userId, travelerProfileId, guideProfileId }
    NextJS->>User: Redirect to Role Dashboard (/dashboard/traveler|guide|admin)
```

## Image Upload Flow (Cloudinary)

```mermaid
sequenceDiagram
    participant Frontend
    participant SpringBoot
    participant Cloudinary

    Frontend->>SpringBoot: GET /api/cloudinary/signature
    SpringBoot-->>Frontend: { signature, timestamp, apiKey }
    Frontend->>Cloudinary: POST (image + signature) directly
    Cloudinary-->>Frontend: { secure_url }
    Frontend->>SpringBoot: Save secure_url to DB (not the raw image)
```
