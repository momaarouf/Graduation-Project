-- =============================================================================
-- V18: Fix SMALLINT columns to INTEGER to match JPA entity field types
--
-- Problem: V1 created order_index (tour_map_points) and display_order
-- (tour_media) as SMALLINT. The TourMapPoint and TourMedia entities
-- declare these as Integer, which Hibernate maps to INTEGER.
-- Hibernate schema validation fails on startup with a type mismatch.
--
-- Fix: ALTER both columns to INTEGER. SMALLINT values are fully
-- compatible with INTEGER so no data is lost and no casting is needed.
-- =============================================================================

-- tour_map_points.order_index: SMALLINT → INTEGER
ALTER TABLE tour_map_points
    ALTER COLUMN order_index TYPE INTEGER;

-- tour_media.display_order: SMALLINT → INTEGER
ALTER TABLE tour_media
    ALTER COLUMN display_order TYPE INTEGER;