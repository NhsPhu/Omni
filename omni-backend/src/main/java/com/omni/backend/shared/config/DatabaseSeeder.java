package com.omni.backend.shared.config;

import com.omni.backend.catalog.adapter.persistence.entity.CategoryJpaEntity;
import com.omni.backend.catalog.adapter.persistence.repository.CategoryRepository;
import com.omni.backend.catalog.application.dto.ProductDto;
import com.omni.backend.catalog.application.dto.ProductImageDto;
import com.omni.backend.catalog.application.dto.ProductSkuDto;
import com.omni.backend.catalog.application.service.ProductService;
import com.omni.backend.iam.adapter.persistence.entity.ShopJpaEntity;
import com.omni.backend.iam.adapter.persistence.entity.UserJpaEntity;
import com.omni.backend.iam.adapter.persistence.repository.ShopRepository;
import com.omni.backend.iam.adapter.persistence.repository.UserRepository;
import com.omni.backend.iam.domain.Role;
import com.omni.backend.iam.domain.UserStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ShopRepository shopRepository;
    private final CategoryRepository categoryRepository;
    private final ProductService productService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            log.info("Database is already seeded. Skipping...");
            return;
        }

        log.info("Starting to seed database with mock data...");

        // 1. Create a Shop Owner User
        UserJpaEntity owner = UserJpaEntity.builder()
                .email("vendor@omni.com")
                .passwordHash(passwordEncoder.encode("123456"))
                .fullName("Omni Official Store")
                .role(Role.ROLE_VENDOR)
                .status(UserStatus.ACTIVE)
                .provider("LOCAL")
                .build();
        userRepository.save(owner);

        // 2. Create a Shop
        ShopJpaEntity shop = ShopJpaEntity.builder()
                .ownerId(owner.getId())
                .name("Omni Premium Store")
                .description("Cửa hàng chính hãng phân phối sản phẩm công nghệ")
                .address("Quận 1, TP. Hồ Chí Minh")
                .status("APPROVED")
                .build();
        shopRepository.save(shop);

        // 3. Create Categories
        CategoryJpaEntity catTech = CategoryJpaEntity.builder()
                .name("Điện thoại & Phụ kiện")
                .slug("dien-thoai-phu-kien")
                .sortOrder(1)
                .build();
        categoryRepository.save(catTech);

        CategoryJpaEntity catFashion = CategoryJpaEntity.builder()
                .name("Thời trang Nam")
                .slug("thoi-trang-nam")
                .sortOrder(2)
                .build();
        categoryRepository.save(catFashion);

        // 4. Create Products via ProductService (to ensure ES syncing)
        
        // Product 1
        ProductDto p1 = ProductDto.builder()
                .shopId(shop.getId())
                .categoryId(catTech.getId())
                .name("iPhone 15 Pro Max 256GB Chính hãng VN/A")
                .slug("iphone-15-pro-max-256gb")
                .description("Màn hình Super Retina XDR 6.7 inch. Titan bền bỉ. Camera chính 48MP.")
                .specs(Map.of("screen", "6.7 inch", "chip", "A17 Pro"))
                .status("ACTIVE")
                .images(List.of(
                        ProductImageDto.builder().imageUrl("https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-blue-thumbnew-600x600.jpg").isPrimary(true).sortOrder(1).build()
                ))
                .skus(List.of(
                        ProductSkuDto.builder().skuCode("IP15PM-BLUE").price(new BigDecimal("29990000")).originalPrice(new BigDecimal("34990000")).stockQuantity(150).attributes(Map.of("color", "Titan Xanh", "storage", "256GB")).build()
                ))
                .build();
        productService.createProduct(p1);

        // Product 2
        ProductDto p2 = ProductDto.builder()
                .shopId(shop.getId())
                .categoryId(catTech.getId())
                .name("Tai nghe Bluetooth AirPods Pro (Gen 2)")
                .slug("airpods-pro-gen-2")
                .description("Chống ồn chủ động xuất sắc. Chip H2. Thời lượng pin 30 giờ.")
                .specs(Map.of("battery", "30h", "type", "In-ear"))
                .status("ACTIVE")
                .images(List.of(
                        ProductImageDto.builder().imageUrl("https://cdn.tgdd.vn/Products/Images/54/289773/tai-nghe-bluetooth-airpods-pro-2-magsafe-charge-apple-mqd83-thumb-600x600.jpg").isPrimary(true).sortOrder(1).build()
                ))
                .skus(List.of(
                        ProductSkuDto.builder().skuCode("AP-PRO-2").price(new BigDecimal("5990000")).originalPrice(new BigDecimal("6990000")).stockQuantity(300).attributes(Map.of("color", "Trắng")).build()
                ))
                .build();
        productService.createProduct(p2);

        // Product 3
        ProductDto p3 = ProductDto.builder()
                .shopId(shop.getId())
                .categoryId(catTech.getId())
                .name("MacBook Air M2 13.6 inch 256GB")
                .slug("macbook-air-m2-256gb")
                .description("Thiết kế siêu mỏng nhẹ. Chip M2 mạnh mẽ.")
                .specs(Map.of("ram", "8GB", "ssd", "256GB", "screen", "13.6 inch"))
                .status("ACTIVE")
                .images(List.of(
                        ProductImageDto.builder().imageUrl("https://cdn.tgdd.vn/Products/Images/44/282827/macbook-air-m2-starlight-thumb-600x600.jpg").isPrimary(true).sortOrder(1).build()
                ))
                .skus(List.of(
                        ProductSkuDto.builder().skuCode("MBA-M2-SL").price(new BigDecimal("26990000")).originalPrice(new BigDecimal("29990000")).stockQuantity(50).attributes(Map.of("color", "Starlight")).build()
                ))
                .build();
        productService.createProduct(p3);

        log.info("Mock data successfully seeded!");
    }
}
