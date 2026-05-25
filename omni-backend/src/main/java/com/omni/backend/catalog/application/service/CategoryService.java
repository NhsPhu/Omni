package com.omni.backend.catalog.application.service;

import com.omni.backend.catalog.adapter.persistence.entity.CategoryJpaEntity;
import com.omni.backend.catalog.adapter.persistence.repository.CategoryRepository;
import com.omni.backend.catalog.application.dto.CategoryDto;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Cacheable("categories")
    @Transactional(readOnly = true)
    public List<CategoryDto> getCategoryTree() {
        List<CategoryJpaEntity> allCategories = categoryRepository.findAll();

        Map<UUID, List<CategoryJpaEntity>> categoriesByParent = allCategories.stream()
                .filter(cat -> cat.getParentId() != null)
                .collect(Collectors.groupingBy(CategoryJpaEntity::getParentId));

        return allCategories.stream()
                .filter(cat -> cat.getParentId() == null)
                .map(root -> buildCategoryDto(root, categoriesByParent))
                .collect(Collectors.toList());
    }

    private CategoryDto buildCategoryDto(CategoryJpaEntity entity, Map<UUID, List<CategoryJpaEntity>> categoriesByParent) {
        List<CategoryJpaEntity> childrenEntities = categoriesByParent.getOrDefault(entity.getId(), List.of());
        
        List<CategoryDto> childrenDtos = childrenEntities.stream()
                .map(child -> buildCategoryDto(child, categoriesByParent))
                .collect(Collectors.toList());

        return CategoryDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .slug(entity.getSlug())
                .iconUrl(entity.getIconUrl())
                .children(childrenDtos)
                .build();
    }
}
