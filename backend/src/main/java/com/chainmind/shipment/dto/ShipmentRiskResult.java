package com.chainmind.shipment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentRiskResult {
    private Long shipmentId;
    private String shipmentNumber;
    private Double riskScore;
    private String riskLevel;
    private ShipmentRiskFactorBreakdown factorBreakdown;
    private String explanation;
}
