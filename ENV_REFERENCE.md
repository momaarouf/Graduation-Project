# Tourongo — Environment Variables Reference

Derived from the actual `application.properties` in the codebase. Every variable the backend reads.

---

## Backend — `application.properties`

```properties
# ─── Database ────────────────────────────────────────────────────────────────
spring.datasource.url=jdbc:postgresql://localhost:5432/travel_db
spring.datasource.username=YOUR_DB_USERNAME
spring.datasource.password=YOUR_DB_PASSWORD
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA — NEVER change ddl-auto to create or drop; schema is Flyway-only
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# ─── Flyway ──────────────────────────────────────────────────────────────────
spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=false
spring.flyway.locations=classpath:db/migration
spring.flyway.validate-migration-naming=true
spring.flyway.repair-on-migrate=true

# ─── Server ──────────────────────────────────────────────────────────────────
# IMPORTANT: Backend runs on 8081, not 8080
server.port=8081

# File upload limits (base64 video bodies)
spring.servlet.multipart.max-file-size=100MB
spring.servlet.multipart.max-request-size=100MB
server.tomcat.max-swallow-size=-1
server.tomcat.max-http-form-post-size=-1

# ─── JWT ─────────────────────────────────────────────────────────────────────
jwt.secret=YOUR_SECRET_KEY_MINIMUM_32_CHARACTERS
# Access token TTL in ms (900000 = 15 minutes)
jwt.expiration=900000
# Refresh token: 7 days default, 30 days with "remember me"

# ─── Google OAuth2 ───────────────────────────────────────────────────────────
spring.security.oauth2.client.registration.google.client-id=YOUR_GOOGLE_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_GOOGLE_CLIENT_SECRET
spring.security.oauth2.client.registration.google.scope=openid,profile,email

# Where backend redirects after OAuth success
app.oauth2.frontend-redirect=http://localhost:3000/auth/oauth-callback

# ─── Email Verification ───────────────────────────────────────────────────────
# Token/code TTL in minutes (6-digit code sent to email)
app.email-verification.ttl-minutes=30
# Dev mode: return the token in API response (set false in production)
app.email-verification.dev-return=false
app.password-reset.dev-return=false

# ─── Brevo REST API (Transactional Email) ────────────────────────────────────
# We bypassed standard SMTP to avoid cloud provider port blocks.
# EmailService.java now uses the Brevo HTTP API instead.
# It looks for 'brevo.api.key' but falls back to 'spring.mail.password' for backward compatibility.
brevo.api.key=YOUR_BREVO_API_KEY
# (If using Docker Compose, passing BREVO_PASSWORD to spring.mail.password still works)
app.mail.from=noreply@Tourongo.com
app.frontend.base-url=http://localhost:3000

# ─── Stripe ──────────────────────────────────────────────────────────────────
# Secret key (sk_test_... or sk_live_...)
stripe.secret-key=sk_test_REPLACE_ME

# Webhook signing secret from Stripe Dashboard → Developers → Webhooks
# Or from Stripe CLI: stripe listen --forward-to localhost:8081/api/payments/webhook
stripe.webhook-secret=whsec_REPLACE_ME

# Mock mode: true = simulate Stripe without real API calls (no keys needed)
# false = real Stripe (requires valid keys above)
stripe.mock-mode=true

# ─── Payout Settings ─────────────────────────────────────────────────────────
# Hours to hold funds in escrow after tour completion before releasing to guide
# Production: 48h | Demo: 0 (instant)
app.payout.freeze-hours=0

# ─── Loyalty System ──────────────────────────────────────────────────────────
# Tier thresholds (minimum completed bookings to reach tier)
app.loyalty.silver-min-trips=5
app.loyalty.gold-min-trips=10

# Discount percentages applied at booking time
app.loyalty.bronze-discount-pct=0
app.loyalty.silver-discount-pct=5
app.loyalty.gold-discount-pct=10

# Base platform commission rate (%) — before per-guide multiplier
app.loyalty.platform-fee-rate=10
```

---

## Frontend — No `.env` Required for Local Dev

The frontend proxies `/api/*` to `http://localhost:8081/api/*` via Next.js rewrites (configured in `next.config.ts`). **No environment file is needed for local development.**

For mobile testing on the same WiFi, run:
```bash
npm run dev:mobile    # Prints a QR code with your LAN IP
```

For production or custom setups, create `.env.local`:
```env
# Only needed if backend is NOT on localhost:8081
NEXT_PUBLIC_API_BASE_URL=https://your-backend.com
```

---

## Admin Account Setup

The admin account is not created via the public registration form (role=Admin is blocked). Create it directly:

```sql
-- Create admin user (BCrypt hash for "admin123" — change immediately)
INSERT INTO users (email, password_hash, role, is_active, email_verified, agreed_to_terms, agreed_to_privacy)
VALUES ('admin@Tourongo.com', '$2a$10$...', 'Admin', true, true, true, true);
```

Or use any BCrypt encoder to generate the hash for your chosen password.

---

## Production Checklist

Before deploying:
- [ ] `jwt.secret` is a cryptographically random, minimum 256-bit key
- [ ] `app.email-verification.dev-return=false` and `app.password-reset.dev-return=false`
- [ ] `stripe.mock-mode=false` and real `stripe.secret-key` (`sk_live_...`)
- [ ] `stripe.webhook-secret` from the production Stripe webhook endpoint (HTTPS required)
- [ ] `app.payout.freeze-hours=48` for production escrow
- [ ] `spring.jpa.show-sql=false` and `logging.level.org.hibernate.SQL=WARN`
- [ ] CORS origins in `SecurityConfig` restricted to your production domain
- [ ] HTTPS configured (Stripe webhooks require HTTPS)
- [ ] PostgreSQL: dedicated user with minimal privileges (not postgres superuser)
- [ ] `app.email-verification.ttl-minutes` set appropriately (30 min default)

---

## Scheduled Job Configuration

All jobs use hardcoded rates in their `@Scheduled` annotations. To change:

| Job | File | Default | Demo |
|-----|------|---------|------|
| PaymentTimeoutJob | `jobs/PaymentTimeoutJob.java` | `fixedRate = 60_000` (1 min) | `10_000` (10s) |
| ReviewReminderJob | `jobs/ReviewReminderJob.java` | `fixedRate = 3_600_000` (1h) | `10_000` (10s) |
| BookingStatusCleanupJob | `jobs/BookingStatusCleanupJob.java` | `fixedRate = 3_600_000` (1h) | |
| SuspensionCleanupJob | `jobs/SuspensionCleanupJob.java` | `fixedDelay = 60_000` (1 min) | |
| PayoutReleaseJob | `payment/jobs/PayoutReleaseJob.java` | `cron = "0 0 * * * *"` (hourly) | |

> ⚠️ Always revert demo rate changes before committing.
