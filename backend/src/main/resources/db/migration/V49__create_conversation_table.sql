CREATE TABLE conversations (
    id BIGSERIAL PRIMARY KEY,
    traveler_id BIGINT NOT NULL,
    guide_id BIGINT NOT NULL,
    tour_id BIGINT NOT NULL,
    booking_id BIGINT,

    created_at_utc TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at_utc TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT fk_conversations_traveler FOREIGN KEY (traveler_id) REFERENCES users(id),
    CONSTRAINT fk_conversations_guide FOREIGN KEY (guide_id) REFERENCES users(id),
    CONSTRAINT fk_conversations_tour FOREIGN KEY (tour_id) REFERENCES tour_templates(id),
    CONSTRAINT fk_conversations_booking FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

CREATE INDEX idx_conversations_traveler ON conversations(traveler_id);
CREATE INDEX idx_conversations_guide ON conversations(guide_id);
