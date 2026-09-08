package com.chainmind.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDto {
    private Long id;
    private Long organizationId;
    private Long supplierId;
    private String supplierName;
    private Long categoryId;
    private String categoryName;
    private String name;
    private String sku;
    private String description;
    private String unit;
    private BigDecimal purchasePrice;
    private Integer leadTimeDays;
    private Integer reorderLevel;
    private Integer safetyStock;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
