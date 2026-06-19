-- Add missing index for AI chat sessions
CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_user_status ON ai_chat_sessions(user_id, shop_id, status);

-- Add missing index for AI chat messages to speed up loading history
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_session ON ai_chat_messages(session_id, created_at ASC);

-- Add missing composite index for customer orders
CREATE INDEX IF NOT EXISTS idx_parent_orders_user_status ON parent_orders(user_id, status, created_at DESC);

-- Add missing composite index for shop orders
CREATE INDEX IF NOT EXISTS idx_child_orders_shop_status ON child_orders(shop_id, status, created_at DESC);
