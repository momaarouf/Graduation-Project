-- V43: Add engagement fields for reviews (likes and replies)

-- 1. Add helpful_count to reviews table (denormalized for performance)
ALTER TABLE reviews ADD COLUMN helpful_count BIGINT DEFAULT 0;

-- 2. Create review_helpful_votes table to prevent duplicate votes per user
-- We use id as primary key for standard JPA compatibility, but keep review_id + user_id unique.
CREATE TABLE review_helpful_votes (
    id BIGSERIAL PRIMARY KEY,
    review_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    
    CONSTRAINT fk_helpful_review FOREIGN KEY (review_id) REFERENCES reviews (id) ON DELETE CASCADE,
    CONSTRAINT fk_helpful_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT uq_review_user_helpful UNIQUE (review_id, user_id)
);

-- Indexes for fast lookup
CREATE INDEX idx_helpful_votes_review_id ON review_helpful_votes(review_id);
CREATE INDEX idx_helpful_votes_user_id ON review_helpful_votes(user_id);
