CREATE TABLE IF NOT EXISTS admin_audit_events (
                                                  id BIGSERIAL PRIMARY KEY,

                                                  admin_user_id BIGINT NOT NULL REFERENCES users(id),

                                                  action VARCHAR(80) NOT NULL,
                                                  target_type VARCHAR(40) NOT NULL,
                                                  target_id BIGINT NOT NULL,

                                                  summary VARCHAR(255) NOT NULL,
                                                  details_json TEXT NULL,

                                                  created_at_utc TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_events_admin_user_id ON admin_audit_events(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_events_target ON admin_audit_events(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_events_created_at ON admin_audit_events(created_at_utc);