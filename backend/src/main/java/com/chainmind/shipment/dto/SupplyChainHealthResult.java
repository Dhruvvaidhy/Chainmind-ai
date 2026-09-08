package com.chainmind.shipment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplyChainHealthResult {
    private Double supplierPerformanceScore;
    private Double shipmentPerformanceScore;
    private Double inventoryHealthScore;
    private Double demandStabilityScore;
    private Double overallHealthScore;
    private String healthLevel; // CRITICAL, POOR, FAIR, GOOD, EXCELLENT
}
