## Danh sách toàn bộ API hiện có trong hệ thống

### Module: ADMIN
#### AdminController.java
- **GET** `/api/admin/users`
- **GET** `/api/admin/shops`
- **GET** `/api/admin/shops/pending`
- **PATCH** `/api/admin/shops/{id}/approve`
- **PATCH** `/api/admin/users/{id}/ban`

#### DisputeController.java
- **POST** `/api/me/disputes`
- **GET** `/api/admin/disputes/pending`
- **GET** `/api/admin/disputes`
- **PATCH** `/api/admin/disputes/{id}/resolve`

### Module: CATALOG
#### CategoryController.java
- **GET** `/api/categories`

#### ProductController.java
- **GET** `/api/vendor/products`
- **POST** `/api/vendor/products`
- **PUT** `/api/vendor/products/{id}`
- **PATCH** `/api/vendor/products/{id}/status`
- **DELETE** `/api/vendor/products/{id}`

#### PublicProductController.java
- **GET** `/api/products`
- **GET** `/api/products/featured`
- **GET** `/api/products/{id}`
- **GET** `/api/products/{id}/recommendations`
- **GET** `/api/products/shops/{shopId}`

#### WishlistController.java
- **GET** `/api/wishlists`
- **POST** `/api/wishlists/{productId}`
- **GET** `/api/wishlists/{productId}/check`

### Module: CHAT
#### ChatController.java
- **POST** `/api/chat/rooms/shop/{shopId}`
- **GET** `/api/chat/rooms/me`
- **GET** `/api/chat/rooms/shop`
- **GET** `/api/chat/rooms/{roomId}/messages`
- **PATCH** `/api/chat/rooms/{roomId}/read`

### Module: FINANCE
#### AdminFinanceController.java
- **GET** `/api/admin/finance/withdrawals`
- **PATCH** `/api/admin/finance/withdrawals/{id}/approve`

#### AdminReportController.java
- **GET** `/api/admin/reports`
- **GET** `/api/admin/reports/daily`

#### PaymentController.java
- **POST** `/api/payment/vnpay/create-url`
- **GET** `/api/payment/vnpay/callback`
- **GET** `/api/payment/vnpay/ipn`

#### VendorReportController.java
- **GET** `/api/vendor/revenue/daily`

#### WalletController.java
- **GET** `/api/vendor/wallet`
- **POST** `/api/vendor/wallet/withdraw`

### Module: IAM
#### AddressController.java
- **GET** `/api/me/addresses`
- **POST** `/api/me/addresses`
- **PUT** `/api/me/addresses/{id}`
- **DELETE** `/api/me/addresses/{id}`
- **PATCH** `/api/me/addresses/{id}/default`

#### AuthController.java
- **POST** `/api/auth/register`
- **POST** `/api/auth/login`
- **POST** `/api/auth/social`
- **GET** `/api/auth/verify-email`
- **POST** `/api/auth/refresh`
- **POST** `/api/auth/forgot-password`
- **POST** `/api/auth/reset-password`

#### LoyaltyController.java
- **GET** `/api/me/loyalty`

#### ShopController.java
- **POST** `/api/shops/register`
- **GET** `/api/shops/me`
- **PUT** `/api/shops/me`
- **GET** `/api/shops/{id}`

#### UserController.java
- **GET** `/api/users/profile`
- **PUT** `/api/users/profile`
- **PUT** `/api/users/password`
- **PUT** `/api/users/pin`

### Module: NOTIFICATION
#### NewsletterController.java
- **POST** `/api/newsletter/subscribe`
- **POST** `/api/newsletter/admin/broadcast`

#### NotificationController.java
- **GET** `/api/me/notifications`
- **PATCH** `/api/me/notifications/{id}/read`
- **PATCH** `/api/me/notifications/read-all`
- **GET** `/api/me/notifications/unread-count`

### Module: REVIEW
#### ReviewController.java
- **POST** `/api/me/reviews`
- **GET** `/api/me/reviews/items`
- **GET** `/api/products/{productId}/reviews`
- **GET** `/api/vendor/reviews`
- **PATCH** `/api/vendor/reviews/{id}/reply`

### Module: SALES
#### AdminFlashSaleController.java
- **POST** `/api/admin/flash-sale`
- **GET** `/api/admin/flash-sale`
- **GET** `/api/admin/flash-sale/{eventId}`
- **PATCH** `/api/admin/flash-sale/items/{itemId}/approve`
- **PATCH** `/api/admin/flash-sale/items/{itemId}/reject`

#### AdminOrderController.java
- **POST** `/api/admin/orders/child/{id}/dispute-resolve`

#### AdminPlatformVoucherController.java
- **GET** `/api/admin/vouchers`
- **POST** `/api/admin/vouchers`
- **PATCH** `/api/admin/vouchers/{id}/stop`

#### AnalyticsController.java
- **GET** `/api/vendor/metrics/funnel`
- **GET** `/api/vendor/metrics/sku`

#### CartController.java
- **GET** `/api/cart`
- **POST** `/api/cart/items`
- **PUT** `/api/cart/items/{skuId}`
- **DELETE** `/api/cart/items/{skuId}`
- **DELETE** `/api/cart`

#### CheckoutController.java
- **POST** `/api/checkout`
- **GET** `/api/checkout/shipping-fee`

#### OrderController.java
- **GET** `/api/me/orders`
- **PATCH** `/api/me/orders/{id}/cancel`
- **PATCH** `/api/me/orders/{id}/complete`
- **GET** `/api/me/orders/{childOrderId}/tracking`
- **POST** `/api/me/orders/{childOrderId}/return`
- **GET** `/api/vendor/orders`
- **GET** `/api/vendor/statistics`
- **GET** `/api/vendor/funnel`
- **GET** `/api/vendor/sku-performance`
- **PATCH** `/api/vendor/orders/{id}/status`
- **POST** `/api/vendor/orders/{id}/ship`

#### PublicFlashSaleController.java
- **GET** `/api/public/flash-sale/active`

#### UserFlashSaleController.java
- **GET** `/api/me/flash-sale/usage`

#### UserVoucherController.java
- **GET** `/api/me/vouchers`
- **POST** `/api/me/vouchers/save`

#### VendorFlashSaleController.java
- **POST** `/api/vendor/flash-sale/{eventId}/register`
- **GET** `/api/vendor/flash-sale/{eventId}/my-items`
- **GET** `/api/vendor/flash-sale/events`

#### VendorVoucherController.java
- **GET** `/api/vendor/vouchers`
- **POST** `/api/vendor/vouchers`

#### VoucherController.java
- **GET** `/api/public/vouchers/validate`
- **GET** `/api/public/vouchers/platform`
- **GET** `/api/public/vouchers/shop/{shopId}`

### Module: SHARED
#### UploadController.java
- **POST** `/api/upload`

### Module: SHIPPING
#### GhnMasterDataController.java
- **GET** `/api/public/ghn/provinces`
- **GET** `/api/public/ghn/districts`
- **GET** `/api/public/ghn/wards`

#### GhnWebhookController.java
- **POST** `/api/webhook/ghn`

