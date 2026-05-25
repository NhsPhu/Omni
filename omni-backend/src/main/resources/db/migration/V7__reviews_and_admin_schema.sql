CREATE TABLE product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id),
    user_id UUID NOT NULL REFERENCES users(id),
    order_item_id UUID NOT NULL REFERENCES order_items(id), -- Bắt buộc phải mua mới được review
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    status VARCHAR(50) DEFAULT 'APPROVED', -- APPROVED, HIDDEN, REPORTED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_product_review UNIQUE (user_id, product_id, order_item_id)
);

CREATE TABLE review_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES product_reviews(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES child_orders(id),
    raised_by_user_id UUID NOT NULL REFERENCES users(id),
    reason TEXT NOT NULL,
    evidence_urls JSONB, -- Chứa mảng link ảnh/video
    status VARCHAR(50) NOT NULL, -- OPEN, IN_REVIEW, RESOLVED_CUSTOMER_WINS, RESOLVED_VENDOR_WINS, CLOSED
    admin_decision TEXT,
    refund_amount DECIMAL(15,2),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bổ sung các cột thống kê (sẽ dùng Trigger hoặc JPA để cập nhật)
ALTER TABLE products ADD COLUMN avg_rating DECIMAL(3,2) DEFAULT 0.00;
ALTER TABLE products ADD COLUMN review_count INTEGER DEFAULT 0;

-- Thêm cột tracking thời gian Admin xử lý Shop
ALTER TABLE shops ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE shops ADD COLUMN approved_by UUID REFERENCES users(id);
