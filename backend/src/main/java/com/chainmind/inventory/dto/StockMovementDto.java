package com.chainmind.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockMovementDto {
    private Long id;
    private Long inventoryId;
    private Long productId;
    private String productName;
    private Long warehouseId;
    private String warehouseName;
    private String type;
    private Integer quantity;
    private Integer previousQuantity;
    private Integer newQuantity;
    private String referenceType;
    private Long referenceId;
    private String notes;
    private LocalDateTime createdAt;
    private Long createdBy;
}
