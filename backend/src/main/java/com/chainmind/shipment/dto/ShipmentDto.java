package com.chainmind.shipment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentDto {
    private Long id;
    private Long organizationId;
    private Long purchaseOrderId;
    private String poNumber;
    private String shipmentNumber;
    private String origin;
    private String destination;
    private String carrier;
    private String trackingNumber;
    private String status;
    private LocalDateTime expectedDeliveryDate;
    private LocalDateTime actualDeliveryDate;
    private Double delayRiskScore;
    private String riskLevel;
    private List<ShipmentEventDto> events;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
