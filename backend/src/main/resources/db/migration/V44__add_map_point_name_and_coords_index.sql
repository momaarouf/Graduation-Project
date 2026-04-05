-- ============================================================================
-- V44__add_map_point_name_and_coords_index.sql
-- ============================================================================
-- PURPOSE: Enables the tour trail (route) feature on the map.
--
-- CHANGE 1: Add optional point_name to tour_map_points
--   Allows guides to label each waypoint on the route.
--   Example: "Start: Jbeil", "Byblos Roman Ruins", "End: Beirut"
--   Nullable — existing rows keep working without a label.
--
-- CHANGE 2: Add composite index on meeting coordinates in tour_templates
--   Powers bounding box queries (WHERE lat BETWEEN ? AND ? AND lng BETWEEN ? AND ?)
--   Partial index: only indexes PUBLISHED, non-deleted rows with coordinates set.
--   No PostGIS or extensions needed — plain BTREE on two DECIMAL columns.
-- ============================================================================

-- ── 1. Waypoint label ─────────────────────────────────────────────────────────
-- Optional human-readable name for each stop on the tour route.
-- The first waypoint (lowest order_index) is the start; the last is the end.
ALTER TABLE tour_map_points
    ADD COLUMN IF NOT EXISTS point_name VARCHAR(255);

-- ── 2. Spatial index for bounding box search ──────────────────────────────────
-- Covers the query pattern:
--   WHERE meeting_latitude  BETWEEN :minLat AND :maxLat
--     AND meeting_longitude BETWEEN :minLng AND :maxLng
--     AND status = 'PUBLISHED'
--     AND deleted_at_utc IS NULL
--
-- Partial index (WHERE clause) means only rows that are both searchable
-- and have coordinates are indexed — keeps the index small and fast.
CREATE INDEX IF NOT EXISTS idx_tour_templates_meeting_coords
    ON tour_templates (meeting_latitude, meeting_longitude)
    WHERE meeting_latitude  IS NOT NULL
        AND meeting_longitude IS NOT NULL
        AND status            = 'PUBLISHED'
        AND deleted_at_utc    IS NULL;