package com.omni.backend.iam.adapter.web;

import com.omni.backend.iam.adapter.persistence.entity.UserAddressJpaEntity;
import com.omni.backend.iam.adapter.persistence.repository.UserAddressRepository;
import com.omni.backend.iam.application.dto.AddressDto;
import com.omni.backend.shared.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/me/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final UserAddressRepository addressRepository;

    private AddressDto mapToDto(UserAddressJpaEntity entity) {
        return AddressDto.builder()
                .id(entity.getId())
                .label(entity.getLabel())
                .receiverName(entity.getReceiverName())
                .receiverPhone(entity.getReceiverPhone())
                .province(entity.getProvince())
                .district(entity.getDistrict())
                .ward(entity.getWard())
                .detail(entity.getDetail())
                .isDefault(entity.getIsDefault())
                .ghnProvinceId(entity.getGhnProvinceId())
                .ghnDistrictId(entity.getGhnDistrictId())
                .ghnWardCode(entity.getGhnWardCode())
                .build();
    }

    @GetMapping
    public ResponseEntity<List<AddressDto>> getAddresses(@AuthenticationPrincipal CustomUserDetails userDetails) {
        List<UserAddressJpaEntity> addresses = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userDetails.getId());
        return ResponseEntity.ok(addresses.stream().map(this::mapToDto).collect(Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<AddressDto> createAddress(@AuthenticationPrincipal CustomUserDetails userDetails, @RequestBody AddressDto dto) {
        // If it's the first address or marked as default, unset others
        if (Boolean.TRUE.equals(dto.getIsDefault()) || addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userDetails.getId()).isEmpty()) {
            unsetOtherDefaults(userDetails.getId());
            dto.setIsDefault(true);
        } else {
            dto.setIsDefault(false);
        }

        UserAddressJpaEntity entity = UserAddressJpaEntity.builder()
                .userId(userDetails.getId())
                .label(dto.getLabel())
                .receiverName(dto.getReceiverName())
                .receiverPhone(dto.getReceiverPhone())
                .province(dto.getProvince())
                .district(dto.getDistrict())
                .ward(dto.getWard())
                .detail(dto.getDetail())
                .isDefault(dto.getIsDefault())
                .ghnProvinceId(dto.getGhnProvinceId())
                .ghnDistrictId(dto.getGhnDistrictId())
                .ghnWardCode(dto.getGhnWardCode())
                .build();

        return ResponseEntity.ok(mapToDto(addressRepository.save(entity)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AddressDto> updateAddress(@AuthenticationPrincipal CustomUserDetails userDetails, @PathVariable UUID id, @RequestBody AddressDto dto) {
        UserAddressJpaEntity entity = addressRepository.findByIdAndUserId(id, userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (Boolean.TRUE.equals(dto.getIsDefault()) && !Boolean.TRUE.equals(entity.getIsDefault())) {
            unsetOtherDefaults(userDetails.getId());
        }

        entity.setLabel(dto.getLabel());
        entity.setReceiverName(dto.getReceiverName());
        entity.setReceiverPhone(dto.getReceiverPhone());
        entity.setProvince(dto.getProvince());
        entity.setDistrict(dto.getDistrict());
        entity.setWard(dto.getWard());
        entity.setDetail(dto.getDetail());
        entity.setGhnProvinceId(dto.getGhnProvinceId());
        entity.setGhnDistrictId(dto.getGhnDistrictId());
        entity.setGhnWardCode(dto.getGhnWardCode());
        
        if (dto.getIsDefault() != null) {
            entity.setIsDefault(dto.getIsDefault());
        }

        return ResponseEntity.ok(mapToDto(addressRepository.save(entity)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(@AuthenticationPrincipal CustomUserDetails userDetails, @PathVariable UUID id) {
        UserAddressJpaEntity entity = addressRepository.findByIdAndUserId(id, userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Address not found"));
        addressRepository.delete(entity);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/default")
    public ResponseEntity<AddressDto> setDefault(@AuthenticationPrincipal CustomUserDetails userDetails, @PathVariable UUID id) {
        UserAddressJpaEntity entity = addressRepository.findByIdAndUserId(id, userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Address not found"));

        unsetOtherDefaults(userDetails.getId());
        
        entity.setIsDefault(true);
        return ResponseEntity.ok(mapToDto(addressRepository.save(entity)));
    }

    private void unsetOtherDefaults(UUID userId) {
        List<UserAddressJpaEntity> defaults = addressRepository.findByUserIdAndIsDefaultTrue(userId);
        for (UserAddressJpaEntity addr : defaults) {
            addr.setIsDefault(false);
        }
        addressRepository.saveAll(defaults);
    }
}
