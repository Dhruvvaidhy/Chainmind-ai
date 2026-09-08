package com.chainmind.shipment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentRiskFactorBreakdown {
    private Double supplierRiskPoints;
    private Double carrierRiskPoints;
    private Double routeRiskPoints;
    private Double timelineRiskPoints;
}
