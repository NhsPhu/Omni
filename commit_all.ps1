$ErrorActionPreference = "Stop"

# 1. Product details: reviews & shop info
git add omni-backend/src/main/java/com/omni/backend/review/adapter/web/ReviewController.java
git add omni-backend/src/main/java/com/omni/backend/review/application/dto/ReviewResponseDto.java
git add omni-backend/src/main/java/com/omni/backend/catalog/application/dto/ProductDto.java
git add omni-backend/src/main/java/com/omni/backend/catalog/application/service/ProductService.java
git add 'omni-storefront/src/app/products/[id]/page.tsx'
git commit -m "feat(product): display shop details and reviews on product page"

# 2. Checkout & Orders: PIN logic, review modal after delivery, and shipping logic
git add omni-storefront/src/app/checkout/page.tsx
git add omni-storefront/src/app/orders/page.tsx
git add omni-backend/src/main/java/com/omni/backend/sales/adapter/web/CheckoutController.java
git add omni-backend/src/main/java/com/omni/backend/sales/application/dto/CheckoutRequest.java
git add omni-backend/src/main/java/com/omni/backend/sales/application/service/CheckoutService.java
git commit -m "feat(checkout): add security PIN, shipping calculation, and post-delivery reviews"

# 3. Dynamic images & Voucher fixes
git add omni-storefront/src/app/cart/page.tsx
git add omni-backend/src/main/java/com/omni/backend/sales/adapter/web/VoucherController.java
git add omni-backend/src/main/java/com/omni/backend/sales/adapter/persistence/repository/PlatformVoucherRepository.java
git commit -m "feat(cart): implement dynamic images and platform voucher validation"

# 4. Vendor dashboard & Stats
git add omni-dashboard/src/pages/Dashboard.tsx
git add omni-backend/src/main/java/com/omni/backend/finance/adapter/web/VendorReportController.java
git commit -m "fix(vendor): fix dashboard statistics API errors"

# 5. Seller registration & Google auth logic
git add omni-storefront/src/app/seller/register/page.tsx
git add omni-backend/src/main/java/com/omni/backend/iam/adapter/web/AuthController.java
git add omni-backend/src/main/java/com/omni/backend/iam/application/service/AuthService.java
git add omni-backend/src/main/java/com/omni/backend/iam/application/service/SocialAuthService.java
git add omni-backend/src/main/java/com/omni/backend/iam/application/port/in/AuthUseCase.java
git commit -m "feat(auth): require password setup for Google accounts before vendor registration"

# 6. Remaining updates
git add .
git commit -m "chore: miscellaneous updates and bug fixes across project"
