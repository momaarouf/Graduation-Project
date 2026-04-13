-- Add read_at_utc column to messages table
ALTER TABLE messages ADD COLUMN read_at_utc TIMESTAMP WITH TIME ZONE;

-- Add index for unread count performance
CREATE INDEX idx_messages_unread ON messages(conversation_id, sender_id, read_at_utc) WHERE read_at_utc IS NULL;
