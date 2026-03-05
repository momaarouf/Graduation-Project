-- 1. users
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Traveler','Guide','Admin')),
    is_email_verified BOOLEAN DEFAULT FALSE,
    preferred_language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    full_name VARCHAR(120) NOT NULL,
    phone_e164 VARCHAR(20) NOT NULL UNIQUE,
    is_phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    last_login_at TIMESTAMP,
    created_at_utc TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at_utc TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at_utc TIMESTAMP
);

-- 2. traveler_profiles
CREATE TABLE traveler_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id),
    loyalty_tier VARCHAR(20) DEFAULT 'Bronze' CHECK (loyalty_tier IN ('Bronze','Silver','Gold','Platinum')),
    streak_count INT DEFAULT 0,
    review_reminder_enabled BOOLEAN DEFAULT TRUE,
    total_completed_trips INT DEFAULT 0,
    created_at_utc TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at_utc TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at_utc TIMESTAMP
);

-- 3. guide_profiles
CREATE TABLE guide_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id),
    id_verified BOOLEAN DEFAULT FALSE,
    id_verified_at_utc TIMESTAMP,
    whish_account VARCHAR(255),
    impact_score DECIMAL(5,2) DEFAULT 0,
    current_fee_multiplier DECIMAL(3,2) DEFAULT 1.0,
    total_guided_trips INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at_utc TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at_utc TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at_utc TIMESTAMP
);

-- 4. languages
CREATE TABLE languages (
    id SMALLSERIAL PRIMARY KEY,
    code VARCHAR(5) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL
);

-- 5. guide_languages
CREATE TABLE guide_languages (
    guide_id BIGINT NOT NULL REFERENCES guide_profiles(id),
    language_id SMALLINT NOT NULL REFERENCES languages(id),
    proficiency VARCHAR(20) CHECK (proficiency IN ('Beginner','Intermediate','Advanced')),
    PRIMARY KEY (guide_id, language_id)
);

-- 6. tour_templates
CREATE TABLE tour_templates (
    id BIGSERIAL PRIMARY KEY,
    guide_id BIGINT NOT NULL REFERENCES guide_profiles(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location_name VARCHAR(255),
    base_price DECIMAL(10,2) NOT NULL,
    min_capacity INT NOT NULL,
    max_capacity INT NOT NULL,
    instant_book BOOLEAN DEFAULT FALSE,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern VARCHAR(50),
    halal_badge BOOLEAN DEFAULT FALSE,
    created_at_utc TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at_utc TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at_utc TIMESTAMP
);

-- 7. tour_media
CREATE TABLE tour_media (
    id BIGSERIAL PRIMARY KEY,
    tour_template_id BIGINT NOT NULL REFERENCES tour_templates(id),
    media_type VARCHAR(20) CHECK (media_type IN ('Image','Video')),
    url VARCHAR(512) NOT NULL,
    display_order SMALLINT NOT NULL,
    created_at_utc TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at_utc TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. tour_occurrences
CREATE TABLE tour_occurrences (
    id BIGSERIAL PRIMARY KEY,
    template_id BIGINT NOT NULL REFERENCES tour_templates(id),
    start_time_utc TIMESTAMP NOT NULL,
    end_time_utc TIMESTAMP NOT NULL,
    region VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Scheduled' CHECK (status IN ('Scheduled','Completed','Cancelled','ForceMajeure')),
    confirmed_seats_count INT DEFAULT 0,
    waitlist_count INT DEFAULT 0,
    is_kill_switched BOOLEAN DEFAULT FALSE,
    created_at_utc TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at_utc TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at_utc TIMESTAMP
);

-- 9. tour_map_points (optional)
CREATE TABLE tour_map_points (
    id BIGSERIAL PRIMARY KEY,
    occurrence_id BIGINT NOT NULL REFERENCES tour_occurrences(id),
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    order_index SMALLINT NOT NULL,
    created_at_utc TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 10. pricing_rules (optional)
CREATE TABLE pricing_rules (
    id BIGSERIAL PRIMARY KEY,
    template_id BIGINT NOT NULL REFERENCES tour_templates(id),
    rule_type VARCHAR(50) CHECK (rule_type IN ('RushDay','Weekend','Holiday')),
    multiplier DECIMAL(3,2) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at_utc TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at_utc TIMESTAMP
);
-- 17. promo_codes
CREATE TABLE promo_codes (
                             id BIGSERIAL PRIMARY KEY,
                             guide_id BIGINT REFERENCES guide_profiles(id),
                             code VARCHAR(50) NOT NULL UNIQUE,
                             discount_percent DECIMAL(5,2) NOT NULL,
                             guide_funded BOOLEAN DEFAULT FALSE,
                             max_uses INT,
                             used_count INT DEFAULT 0,
                             expires_at_utc TIMESTAMP,
                             created_at_utc TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                             deleted_at_utc TIMESTAMP
);
-- 11. bookings
CREATE TABLE bookings (
    id BIGSERIAL PRIMARY KEY,
    occurrence_id BIGINT NOT NULL REFERENCES tour_occurrences(id),
    traveler_id BIGINT NOT NULL REFERENCES traveler_profiles(id),
    booking_mode VARCHAR(20) CHECK (booking_mode IN ('Instant','Request')),
    booking_type VARCHAR(20) DEFAULT 'Standard' CHECK (booking_type IN ('Standard','Private','Custom')),
    status VARCHAR(50) CHECK (status IN ('PendingPayment','PendingGuide','Confirmed','InProgress','Completed','Cancelled','Waitlisted','Expired')),
    people_count INT NOT NULL,
    final_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    waiver_signed BOOLEAN DEFAULT FALSE,
    qr_code VARCHAR(255) UNIQUE,
    promo_code_id BIGINT REFERENCES promo_codes(id),
    promo_discount_amount_snapshot DECIMAL(10,2),
    tier_discount_percent_snapshot DECIMAL(5,2),
    group_discount_percent_snapshot DECIMAL(5,2),
    base_price_snapshot DECIMAL(10,2),
    dynamic_multiplier_snapshot DECIMAL(3,2),
    cart_id UUID,
    cart_expires_at_utc TIMESTAMP,
    created_at_utc TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at_utc TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at_utc TIMESTAMP
);

-- 12. booking_status_history
CREATE TABLE booking_status_history (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL REFERENCES bookings(id),
    from_status VARCHAR(50),
    to_status VARCHAR(50) NOT NULL,
    changed_by_user_id BIGINT REFERENCES users(id),
    reason_code VARCHAR(100),
    note TEXT,
    created_at_utc TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 13. payments
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL UNIQUE REFERENCES bookings(id),
    provider_txn_id VARCHAR(255) UNIQUE,
    idempotency_key VARCHAR(255) UNIQUE,
    amount_authorized DECIMAL(10,2),
    amount_captured DECIMAL(10,2),
    amount_refunded DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) CHECK (status IN ('Authorized','Captured','RefundedPartial','RefundedFull','Failed','Released')),
    authorized_at_utc TIMESTAMP,
    captured_at_utc TIMESTAMP,
    refunded_at_utc TIMESTAMP,
    raw_provider_status VARCHAR(100),
    created_at_utc TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at_utc TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 14. payment_webhook_events
CREATE TABLE payment_webhook_events (
    id BIGSERIAL PRIMARY KEY,
    provider VARCHAR(50) NOT NULL,
    provider_event_id VARCHAR(255),
    provider_transaction_id VARCHAR(255),
    event_type VARCHAR(100),
    payload_json JSONB,
    received_at_utc TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at_utc TIMESTAMP,
    processing_status VARCHAR(50) DEFAULT 'Pending' CHECK (processing_status IN ('Pending','Processed','Failed','Duplicate')),
    error_message TEXT
);

-- 15. waitlist_entries
CREATE TABLE waitlist_entries (
    id BIGSERIAL PRIMARY KEY,
    occurrence_id BIGINT NOT NULL REFERENCES tour_occurrences(id),
    traveler_id BIGINT NOT NULL REFERENCES traveler_profiles(id),
    position INT NOT NULL,
    notified BOOLEAN DEFAULT FALSE,
    created_at_utc TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at_utc TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at_utc TIMESTAMP,
    UNIQUE (occurrence_id, traveler_id, deleted_at_utc)  -- note: partial index might be better but simple unique with nulls works in PG?
);

-- 16. reviews
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL UNIQUE REFERENCES bookings(id),
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    guide_reply TEXT,
    created_at_utc TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at_utc TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at_utc TIMESTAMP
);



-- 18. notifications
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    type VARCHAR(50) CHECK (type IN ('ReviewReminder','WaitlistPromotion','BookingUpdate','Promo','ForceMajeure','DisputeUpdate')),
    channel VARCHAR(20) CHECK (channel IN ('InApp','Email','SMS')),
    title VARCHAR(255),
    body TEXT,
    related_booking_id BIGINT REFERENCES bookings(id),
    related_occurrence_id BIGINT REFERENCES tour_occurrences(id),
    scheduled_at_utc TIMESTAMP,
    sent_at_utc TIMESTAMP,
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending','Sent','Failed','Cancelled')),
    created_at_utc TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at_utc TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);