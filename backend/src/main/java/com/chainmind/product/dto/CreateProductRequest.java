package com.chainmind.product.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateProductRequest {

    @NotNull(message = "Supplier is required")
    private Long supplierId;

    private Long categoryId;

    @NotBlank(message = "Product name is required")
    private String name;

    private String sku; // If blank, system auto-generates SKU

    private String description;
    private String unit = "PCS";

    @NotNull(message = "Purchase price is required")
    @Min(value = 0, message = "Price cannot be negative")
    private BigDecimal purchasePrice;

    private Integer leadTimeDays = 7;
    private Integer reorderLevel = 50;
    private Integer safetyStock = 20;
}
