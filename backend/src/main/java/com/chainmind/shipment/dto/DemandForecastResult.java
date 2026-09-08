package com.chainmind.shipment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DemandForecastResult {
    private Long productId;
    private String productName;
    private Integer predictedDemand;
    private Double confidence;
    private String trend; // INCREASING, STABLE, DECREASING
    private Integer recommendedStockLevel;
    private List<MonthlyQuantity> historicalDemand;
    private List<MonthlyPredictedQuantity> forecastData;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MonthlyQuantity {
        private String month;
        private Integer quantity;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MonthlyPredictedQuantity {
        private String month;
        private Integer predictedQuantity;
    }
}
