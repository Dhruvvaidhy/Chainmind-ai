package com.chainmind.purchase.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class ReceiveItemsRequest {

    @NotNull(message = "Target warehouse is required for receiving stock")
    private Long warehouseId;

    @NotEmpty(message = "Item receipts list cannot be empty")
    private List<ReceiveItemDetail> items;

    @Data
    public static class ReceiveItemDetail {
        @NotNull(message = "Item ID is required")
        private Long itemId;

        @NotNull(message = "Received quantity is required")
        private Integer receivedQuantity;
    }
}
