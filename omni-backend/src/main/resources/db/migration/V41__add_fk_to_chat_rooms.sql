ALTER TABLE chat_rooms
ADD CONSTRAINT fk_chat_rooms_user FOREIGN KEY (user_id) REFERENCES users(id),
ADD CONSTRAINT fk_chat_rooms_shop FOREIGN KEY (shop_id) REFERENCES shops(id);
