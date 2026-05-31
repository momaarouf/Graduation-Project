-- Allow target_id to be NULL for system-wide audit events (e.g. broadcast emails)
ALTER TABLE admin_audit_events ALTER COLUMN target_id DROP NOT NULL;
