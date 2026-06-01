# SafariHub - Travel & Tourism Marketplace

Welcome to **SafariHub**, a trust-first, Halal-friendly, Lebanon-first travel and tourism marketplace. This platform connects enthusiastic travelers with verified local guides, facilitating authentic experiences, secure bookings, and seamless communication.

## 🚀 Key Features

*   **Role-Based Access Control:** Distinct experiences for Travelers, Guides, and Administrators.
*   **Secure Authentication:** JWT-based auth with HttpOnly cookies for refresh tokens, Google OAuth2 integration, and robust email verification/password reset flows.
*   **Comprehensive Profiles:** Detailed traveler and guide profiles, including guide verification processes (National ID, credentials).
*   **Tour Management:** 
    *   Guides can create and manage "Tour Templates" and schedule "Tour Occurrences".
    *   Dynamic pricing, Halal-friendly indicators, and customizable itineraries.
*   **Booking Lifecycle:** End-to-end booking flow, from initial request to payment authorization, confirmation, and cancellation policies. Includes waitlist support.
*   **Real-Time Communication:** Built-in chat system using WebSockets for instant messaging between travelers and guides.
*   **Notification System:** In-app notifications (WebSocket-driven) and email alerts (Brevo SMTP) for critical events.
*   **Payments & Payouts:** Stripe integration for secure traveler payments and a structured payout system for guides, managed by admins.
*   **Dispute Resolution:** A dedicated "Dispute Court" for admins to handle conflicts (e.g., no-shows, quality issues) between travelers and guides.
*   **Reviews & Ratings:** Post-tour review system with helpfulness voting.
*   **Admin Dashboard:** Powerful tools for user management, verification approvals, dispute resolution, financial oversight, and system auditing.

## 🛠️ Technology Stack

**Backend**
*   **Framework:** Java Spring Boot
*   **Database:** PostgreSQL
*   **Migrations:** Flyway
*   **Security:** Spring Security, JWT, OAuth2
*   **Real-time:** Spring WebSocket (STOMP)
*   **Email:** Brevo SMTP

**Frontend**
*   **Framework:** Next.js 16 (App Router) + React 19
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS v4 + Framer Motion
*   **State Management/Data Fetching:** React Context, custom hooks, Axios (with interceptors)
*   **Maps:** Leaflet (react-leaflet)

## 📂 Project Structure

*   `backend/` - Spring Boot application source code.
*   `frontend/` - Next.js application source code.
*   `docs/` - Detailed technical documentation and Postman collections.
*   `.github/` - GitHub Actions and project instructions.

## ⚙️ Getting Started

### Prerequisites
*   Java 17+
*   Node.js 18+
*   PostgreSQL
*   Stripe Account (for payments)
*   Brevo Account (for emails)

### Backend Setup
1.  Navigate to the `backend/` directory.
2.  Configure your `application.properties` or `application.yml` with your database credentials, JWT secrets, Stripe keys, and SMTP settings.
3.  Run the application using Maven:
    ```bash
    ./mvnw spring-boot:run
    ```
    *Flyway will automatically run migrations on startup.*

### Frontend Setup
1.  Navigate to the `frontend/` directory.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env.local` file and configure your API URLs and public keys.
4.  Start the development server:
    ```bash
    npm run dev
    ```

## 📖 Documentation

For deep dives into specific system mechanics, please refer to the `docs/` folder:

*   [Concurrency & Locking](docs/CONCURRENCY.md)
*   [Time Management (UTC)](docs/TIME_MANAGEMENT.md)
*   [Booking Timeouts & Carts](docs/BOOKING_TIMEOUT.md)
*   [Notification System](docs/NOTIFICATIONS.md)
*   [Review Reminders](docs/Review-Reminder-Service.md)
*   [Soft Deletion Strategy](docs/Soft-Delete.md)

## 🤝 Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License.
