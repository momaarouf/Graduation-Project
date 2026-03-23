-- V36: Add wishlist_items table for traveler and guide favorites
CREATE TABLE wishlist_items (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    tour_template_id BIGINT NOT NULL REFERENCES tour_templates(id),
    created_at_utc TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_tour_wishlist UNIQUE (user_id, tour_template_id)
);

CREATE INDEX idx_wishlist_user ON wishlist_items(user_id);
CREATE INDEX idx_wishlist_tour ON wishlist_items(tour_template_id);
