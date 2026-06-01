# SafariHub Architecture

This document outlines the high-level architecture of SafariHub.

## System Overview

SafariHub follows a modern, decoupled client-server architecture.

```mermaid
graph TD
    Client[Next.js Client App] -->|HTTPS REST & WebSockets| API[Spring Boot API]
    API -->|JDBC| DB[(PostgreSQL Database)]
    
    subgraph "External Services"
        API -->|SMTP| Brevo[Brevo Email Service]
        API -->|API| Stripe[Stripe Payment Gateway]
        Client -->|OAuth2| Google[Google Auth]
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
        Time[TimeService (UTC)]
        WebSockets[STOMP Message Broker]
    end
    
    Controllers -.-> Security
    Services -.-> Time
    Services -.-> WebSockets
```

### Key Components:
1.  **Controllers:** Handle incoming HTTP requests, validate basic input using DTOs, and route to appropriate services.
2.  **Services:** Contain the core business logic (Booking lifecycle, payment calculation, notification routing).
3.  **Repositories:** Interface with PostgreSQL using Spring Data JPA.
4.  **Scheduled Jobs:** Background processes for tasks like payment timeouts (`PaymentTimeoutJob`) and review reminders (`ReviewReminderJob`).

## Frontend Architecture (Next.js)

The frontend uses Next.js 16 App Router for robust role-based layouts and server-side rendering where appropriate.

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
```

### Key Components:
1.  **Role-Based Routing:** The `/app/dashboard` directory is split into `/traveler`, `/guide`, and `/admin`, each protected by Layout guards checking the AuthContext.
2.  **API Client:** A centralized Axios instance (`src/lib/api/client.ts`) handles request interception (injecting JWTs) and response interception (handling 401s and token refreshes automatically).
3.  **Contexts:** React Context is used sparingly for global state like Authentication (`AuthContext`) and Search Filtering (`FilterContext`).

## Database Schema (High-Level)

```mermaid
erDiagram
    USER ||--o{ TRAVELER_PROFILE : has
    USER ||--o{ GUIDE_PROFILE : has
    
    GUIDE_PROFILE ||--o{ TOUR_TEMPLATE : creates
    TOUR_TEMPLATE ||--o{ TOUR_OCCURRENCE : spawns
    
    TRAVELER_PROFILE ||--o{ BOOKING : makes
    TOUR_OCCURRENCE ||--o{ BOOKING : receives
    
    BOOKING ||--o| PAYMENT : requires
    BOOKING ||--o| REVIEW : gets
    
    USER ||--o{ NOTIFICATION : receives
    USER ||--o{ MESSAGE : sends/receives
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
    SpringBoot-->>NextJS: { role, userId, ... }
    NextJS->>User: Redirect to Role Dashboard
```
