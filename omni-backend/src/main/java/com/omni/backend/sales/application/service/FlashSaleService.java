package com.omni.backend.sales.application.service;

import com.omni.backend.catalog.adapter.persistence.entity.ProductImageJpaEntity;
import com.omni.backend.catalog.adapter.persistence.entity.ProductJpaEntity;
import com.omni.backend.catalog.adapter.persistence.entity.ProductSkuJpaEntity;
import com.omni.backend.catalog.adapter.persistence.repository.ProductImageRepository;
import com.omni.backend.catalog.adapter.persistence.repository.ProductRepository;
import com.omni.backend.catalog.adapter.persistence.repository.ProductSkuRepository;
import com.omni.backend.iam.adapter.persistence.entity.ShopJpaEntity;
import com.omni.backend.iam.adapter.persistence.repository.ShopRepository;
import com.omni.backend.sales.adapter.persistence.entity.FlashSaleEventJpaEntity;
import com.omni.backend.sales.adapter.persistence.entity.FlashSaleItemJpaEntity;
import com.omni.backend.sales.adapter.persistence.repository.FlashSaleEventRepository;
import com.omni.backend.sales.adapter.persistence.repository.FlashSaleItemRepository;
import com.omni.backend.sales.application.dto.FlashSaleEventDto;
import com.omni.backend.sales.application.dto.FlashSaleItemDto;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FlashSaleService {

    private final FlashSaleEventRepository eventRepository;
    private final FlashSaleItemRepository itemRepository;
    private final ProductRepository productRepository;
    private final ProductSkuRepository productSkuRepository;
    private final ProductImageRepository productImageRepository;
    private final ShopRepository shopRepository;

    // ═══════════════════════════════════════════════════════════════════
    // ADMIN: Event CRUD
    // ═══════════════════════════════════════════════════════════════════

    @Transactional
    public FlashSaleEventDto createEvent(FlashSaleEventDto dto) {
        FlashSaleEventJpaEntity entity = FlashSaleEventJpaEntity.builder()
                .title(dto.getTitle())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .maxItems(dto.getMaxItems() != null ? dto.getMaxItems() : 50)
                .status("UPCOMING")
                .bannerUrl(dto.getBannerUrl())
                .build();
        FlashSaleEventJpaEntity saved = eventRepository.save(entity);
        return mapEventToDto(saved);
    }

    public List<FlashSaleEventDto> getAllEvents() {
        return eventRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(e -> {
                    FlashSaleEventDto dto = mapEventToDto(e);
                    dto.setRegisteredCount(itemRepository.countByEventId(e.getId()));
                    dto.setApprovedCount(itemRepository.countByEventIdAndStatus(e.getId(), "APPROVED"));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public FlashSaleEventDto getEventDetail(UUID eventId) {
        FlashSaleEventJpaEntity event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Flash Sale Event not found"));
        FlashSaleEventDto dto = mapEventToDto(event);
        dto.setRegisteredCount(itemRepository.countByEventId(eventId));
        dto.setApprovedCount(itemRepository.countByEventIdAndStatus(eventId, "APPROVED"));
        List<FlashSaleItemJpaEntity> items = itemRepository.findByEventId(eventId);
        dto.setItems(items.stream().map(this::mapItemToDto).collect(Collectors.toList()));
        return dto;
    }

    // ═══════════════════════════════════════════════════════════════════
    // ADMIN: Approve / Reject items
    // ═══════════════════════════════════════════════════════════════════

    @Transactional
    public void approveItem(UUID itemId) {
        FlashSaleItemJpaEntity item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Flash Sale Item not found"));
        item.setStatus("APPROVED");
        itemRepository.save(item);
    }

    @Transactional
    public void rejectItem(UUID itemId) {
        FlashSaleItemJpaEntity item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Flash Sale Item not found"));
        item.setStatus("REJECTED");
        itemRepository.save(item);
    }

    // ═══════════════════════════════════════════════════════════════════
    // VENDOR: Register product into Flash Sale
    // ═══════════════════════════════════════════════════════════════════

    @Transactional
    public FlashSaleItemDto registerProduct(UUID eventId, FlashSaleItemDto dto, UUID shopId) {
        FlashSaleEventJpaEntity event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Flash Sale Event not found"));

        if ("ENDED".equals(event.getStatus())) {
            throw new RuntimeException("Flash Sale đã kết thúc, không thể đăng ký");
        }

        // Check duplicate
        itemRepository.findByEventIdAndProductIdAndSkuId(eventId, dto.getProductId(), dto.getSkuId())
                .ifPresent(existing -> { throw new RuntimeException("Sản phẩm này đã đăng ký trong Flash Sale"); });

        // Check max items
        long currentCount = itemRepository.countByEventId(eventId);
        if (event.getMaxItems() != null && currentCount >= event.getMaxItems()) {
            throw new RuntimeException("Flash Sale đã đầy slot đăng ký");
        }

        // Get original price from SKU
        ProductSkuJpaEntity sku = productSkuRepository.findById(dto.getSkuId())
                .orElseThrow(() -> new RuntimeException("SKU not found"));

        // Validate flash price < original price
        if (dto.getFlashPrice().compareTo(sku.getPrice()) >= 0) {
            throw new RuntimeException("Giá Flash Sale phải thấp hơn giá gốc");
        }

        // Validate flash stock <= available stock
        if (dto.getFlashStock() > sku.getStockQuantity()) {
            throw new RuntimeException("Số lượng Flash Sale không được vượt quá tồn kho (" + sku.getStockQuantity() + ")");
        }

        FlashSaleItemJpaEntity item = FlashSaleItemJpaEntity.builder()
                .eventId(eventId)
                .productId(dto.getProductId())
                .skuId(dto.getSkuId())
                .shopId(shopId)
                .flashPrice(dto.getFlashPrice())
                .originalPrice(sku.getPrice())
                .flashStock(dto.getFlashStock())
                .status("PENDING")
                .build();

        FlashSaleItemJpaEntity saved = itemRepository.save(item);
        return mapItemToDto(saved);
    }

    public List<FlashSaleItemDto> getVendorRegistrations(UUID eventId, UUID shopId) {
        return itemRepository.findByEventIdAndShopId(eventId, shopId).stream()
                .map(this::mapItemToDto)
                .collect(Collectors.toList());
    }

    // ═══════════════════════════════════════════════════════════════════
    // PUBLIC: Get active Flash Sale for storefront
    // ═══════════════════════════════════════════════════════════════════

    public FlashSaleEventDto getActiveEvent() {
        Optional<FlashSaleEventJpaEntity> activeOpt = eventRepository.findFirstByStatusOrderByStartTimeAsc("ACTIVE");
        if (activeOpt.isEmpty()) {
            // If no active, check for upcoming
            Optional<FlashSaleEventJpaEntity> upcomingOpt = eventRepository.findFirstByStatusOrderByStartTimeAsc("UPCOMING");
            if (upcomingOpt.isEmpty()) return null;
            FlashSaleEventDto dto = mapEventToDto(upcomingOpt.get());
            dto.setItems(Collections.emptyList());
            return dto;
        }

        FlashSaleEventJpaEntity event = activeOpt.get();
        FlashSaleEventDto dto = mapEventToDto(event);
        List<FlashSaleItemJpaEntity> approvedItems = itemRepository.findByEventIdAndStatus(event.getId(), "APPROVED");
        dto.setItems(approvedItems.stream().map(this::mapItemToDto).collect(Collectors.toList()));
        return dto;
    }

    // ═══════════════════════════════════════════════════════════════════
    // GLOBAL PRICING: Check active Flash Sale price for SKUs
    // ═══════════════════════════════════════════════════════════════════

    public BigDecimal getActiveFlashSalePrice(UUID skuId) {
        FlashSaleEventDto activeEvent = getActiveEvent();
        if (activeEvent == null || activeEvent.getItems() == null) return null;
        
        return activeEvent.getItems().stream()
                .filter(item -> item.getSkuId().equals(skuId) && item.getFlashStock() > item.getSoldCount())
                .findFirst()
                .map(FlashSaleItemDto::getFlashPrice)
                .orElse(null);
    }

    public Map<UUID, BigDecimal> getActiveFlashSalePrices(List<UUID> skuIds) {
        FlashSaleEventDto activeEvent = getActiveEvent();
        if (activeEvent == null || activeEvent.getItems() == null || skuIds == null || skuIds.isEmpty()) {
            return Collections.emptyMap();
        }

        return activeEvent.getItems().stream()
                .filter(item -> skuIds.contains(item.getSkuId()) && item.getFlashStock() > item.getSoldCount())
                .collect(Collectors.toMap(FlashSaleItemDto::getSkuId, FlashSaleItemDto::getFlashPrice, (existing, replacement) -> existing));
    }

    public Map<UUID, FlashSaleItemDto> getActiveFlashSaleItemsByProductIds(List<UUID> productIds) {
        FlashSaleEventDto activeEvent = getActiveEvent();
        if (activeEvent == null || activeEvent.getItems() == null || productIds == null || productIds.isEmpty()) {
            return Collections.emptyMap();
        }

        return activeEvent.getItems().stream()
                .filter(item -> productIds.contains(item.getProductId()) && item.getFlashStock() > item.getSoldCount())
                .collect(Collectors.toMap(FlashSaleItemDto::getProductId, item -> item, (existing, replacement) -> existing));
    }

    @Transactional
    public void recordFlashSalePurchase(UUID skuId, int quantity) {
        FlashSaleEventDto activeEvent = getActiveEvent();
        if (activeEvent == null) return;
        
        Optional<FlashSaleItemJpaEntity> itemOpt = flashSaleItemRepository.findByEventIdAndStatus(activeEvent.getId(), "APPROVED").stream()
                .filter(item -> item.getSkuId().equals(skuId))
                .findFirst();
                
        if (itemOpt.isPresent()) {
            FlashSaleItemJpaEntity item = itemOpt.get();
            if (item.getFlashStock() >= item.getSoldCount() + quantity) {
                item.setSoldCount(item.getSoldCount() + quantity);
                flashSaleItemRepository.save(item);
                
                // Clear cache so next getActiveEvent() fetches fresh soldCount
                clearActiveEventCache();
            } else {
                throw new RuntimeException("Flash Sale stock exceeded for SKU");
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // SCHEDULER: Auto-transition event statuses
    // ═══════════════════════════════════════════════════════════════════

    @Scheduled(fixedRate = 60000) // every 1 minute
    @Transactional
    public void transitionEventStatuses() {
        ZonedDateTime now = ZonedDateTime.now();

        // UPCOMING → ACTIVE (start_time <= now)
        List<FlashSaleEventJpaEntity> toActivate = eventRepository
                .findByStartTimeBeforeAndStatusIn(now, List.of("UPCOMING", "DRAFT"));
        for (FlashSaleEventJpaEntity e : toActivate) {
            if (e.getEndTime().isAfter(now)) {
                e.setStatus("ACTIVE");
                eventRepository.save(e);
            }
        }

        // ACTIVE → ENDED (end_time <= now)
        List<FlashSaleEventJpaEntity> toEnd = eventRepository
                .findByEndTimeBeforeAndStatus(now, "ACTIVE");
        for (FlashSaleEventJpaEntity e : toEnd) {
            e.setStatus("ENDED");
            eventRepository.save(e);
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // Mappers
    // ═══════════════════════════════════════════════════════════════════

    private FlashSaleEventDto mapEventToDto(FlashSaleEventJpaEntity e) {
        return FlashSaleEventDto.builder()
                .id(e.getId())
                .title(e.getTitle())
                .startTime(e.getStartTime())
                .endTime(e.getEndTime())
                .maxItems(e.getMaxItems())
                .status(e.getStatus())
                .bannerUrl(e.getBannerUrl())
                .createdAt(e.getCreatedAt())
                .build();
    }

    private FlashSaleItemDto mapItemToDto(FlashSaleItemJpaEntity item) {
        String productName = productRepository.findById(item.getProductId())
                .map(ProductJpaEntity::getName).orElse("Unknown");

        String productImage = productImageRepository.findByProductIdOrderBySortOrderAsc(item.getProductId())
                .stream().findFirst().map(ProductImageJpaEntity::getImageUrl).orElse(null);

        String shopName = shopRepository.findById(item.getShopId())
                .map(ShopJpaEntity::getName).orElse("Unknown");

        String skuCode = productSkuRepository.findById(item.getSkuId())
                .map(ProductSkuJpaEntity::getSkuCode).orElse("");

        return FlashSaleItemDto.builder()
                .id(item.getId())
                .eventId(item.getEventId())
                .productId(item.getProductId())
                .skuId(item.getSkuId())
                .shopId(item.getShopId())
                .flashPrice(item.getFlashPrice())
                .originalPrice(item.getOriginalPrice())
                .flashStock(item.getFlashStock())
                .soldCount(item.getSoldCount())
                .status(item.getStatus())
                .sortOrder(item.getSortOrder())
                .createdAt(item.getCreatedAt())
                .productName(productName)
                .productImage(productImage)
                .shopName(shopName)
                .skuCode(skuCode)
                .build();
    }
}
