package com.chainmind.purchase.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class CreatePurchaseOrderRequest {

    @NotNull(message = "Supplier is required")
    private Long supplierId;

    private LocalDate expectedDeliveryDate;
    private String notes;

    @NotEmpty(message = "Purchase order must contain at least one item")
    private List<CreateItemRequest> items;

    @Data
    public static class CreateItemRequest {
        @NotNull(message = "Product is required")
        private Long productId;

        @NotNull(message = "Quantity is required")
        private Integer quantity;

        @NotNull(message = "Unit price is required")
        private Double unitPrice;
    }
}
