ALTER TABLE shops 
    ADD COLUMN address TEXT,
    ADD COLUMN pickup_address TEXT,
    ADD COLUMN bank_account_number VARCHAR(50),
    ADD COLUMN bank_name VARCHAR(255),
    ADD COLUMN bank_account_name VARCHAR(255),
    ADD COLUMN rating DECIMAL(3, 2) DEFAULT 0.00,
    ADD COLUMN total_sales INTEGER DEFAULT 0,
    ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
