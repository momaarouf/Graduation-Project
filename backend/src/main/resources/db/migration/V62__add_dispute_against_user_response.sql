-- ============================================================================
-- V62: Add against_user_response to disputes table
-- ============================================================================

ALTER TABLE disputes 
ADD COLUMN against_user_response TEXT;
