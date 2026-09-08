package com.chainmind.purchase.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderItemDto {
    private Long id;
    private Long productId;
    private String productName;
    private String productSku;
    private Integer quantity;
    private Integer receivedQuantity;
    private BigDecimal unitPrice;
    private BigDecimal tax;
    private BigDecimal totalPrice;
}
