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
public class InventoryDto {
    private Long id;
    private Long organizationId;
    private Long productId;
    private String productName;
    private String productSku;
    private Long warehouseId;
    private String warehouseName;
    private Integer currentStock;
    private Integer reservedStock;
    private Integer availableStock;
    private Integer incomingStock;
    private Integer damagedStock;
    private Integer reorderLevel;
    private Integer safetyStock;
    private String stockoutRiskStatus; // NORMAL, LOW_STOCK, HIGH_STOCKOUT_RISK
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
