package com.chainmind.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StockAdjustmentRequest {

    @NotNull(message = "Inventory record ID is required")
    private Long inventoryId;

    @NotBlank(message = "Adjustment type is required")
    private String type; // INCREASE, DECREASE, DAMAGE, CORRECTION

    @NotNull(message = "Quantity is required")
    private Integer quantity;

    private String notes;
}
