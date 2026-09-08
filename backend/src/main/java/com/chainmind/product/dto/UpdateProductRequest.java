package com.chainmind.product.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateProductRequest {

    @NotNull(message = "Supplier is required")
    private Long supplierId;

    private Long categoryId;

    @NotBlank(message = "Product name is required")
    private String name;

    private String description;
    private String unit;

    @NotNull(message = "Purchase price is required")
    @Min(value = 0, message = "Price cannot be negative")
    private BigDecimal purchasePrice;

    private Integer leadTimeDays;
    private Integer reorderLevel;
    private Integer safetyStock;
    private String status;
}
