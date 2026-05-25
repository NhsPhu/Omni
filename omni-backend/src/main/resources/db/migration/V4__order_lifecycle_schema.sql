CREATE TABLE order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    order_type VARCHAR(20) NOT NULL, -- PARENT, CHILD
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by_user_id UUID, -- NULL means system/automated
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE return_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_order_id UUID NOT NULL REFERENCES child_orders(id),
    user_id UUID NOT NULL REFERENCES users(id),
    reason TEXT NOT NULL,
    images_json JSONB,
    status VARCHAR(50) NOT NULL, -- PENDING, APPROVED, REJECTED
    refund_amount DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
