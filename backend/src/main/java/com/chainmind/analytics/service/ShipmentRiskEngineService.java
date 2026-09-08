package com.chainmind.analytics.service;

import com.chainmind.shipment.dto.ShipmentRiskFactorBreakdown;
import com.chainmind.shipment.dto.ShipmentRiskResult;
import com.chainmind.shipment.entity.Shipment;
import com.chainmind.shipment.repository.ShipmentRepository;
import com.chainmind.supplier.entity.Supplier;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ShipmentRiskEngineService {

    public ShipmentRiskResult calculateShipmentRisk(Shipment shipment) {
        // Factor 1: Supplier Historical Delay Risk (Weight: 30%)
        double supplierRiskPoints = 15.0; // Baseline moderate risk
        Supplier supplier = shipment.getPurchaseOrder() != null ? shipment.getPurchaseOrder().getSupplier() : null;
        if (supplier != null && supplier.getPerformanceScore() != null) {
            // High score (95+) -> 5 points risk; Low score (60) -> 28 points risk
            double score = supplier.getPerformanceScore();
            supplierRiskPoints = Math.max(2.0, Math.min(30.0, (100.0 - score) * 0.7));
        }

        // Factor 2: Carrier Reliability (Weight: 20%)
        double carrierRiskPoints = 10.0;
        String carrier = shipment.getCarrier() != null ? shipment.getCarrier().toLowerCase() : "";
        if (carrier.contains("dhl") || carrier.contains("fedex")) {
            carrierRiskPoints = 4.0;
        } else if (carrier.contains("maersk") || carrier.contains("kuehne")) {
            carrierRiskPoints = 12.0;
        } else if (carrier.contains("db schenker") || carrier.contains("titan")) {
            carrierRiskPoints = 18.0;
        }

        // Factor 3: Route & Corridor Performance (Weight: 20%)
        double routeRiskPoints = 10.0;
        String origin = shipment.getOrigin() != null ? shipment.getOrigin().toLowerCase() : "";
        if (origin.contains("japan") || origin.contains("germany") || origin.contains("usa")) {
            routeRiskPoints = 5.0;
        } else if (origin.contains("taiwan") || origin.contains("china") || origin.contains("uk")) {
            routeRiskPoints = 16.0;
        } else if (origin.contains("india") || origin.contains("mexico")) {
            routeRiskPoints = 18.0;
        }

        // Factor 4: Timeline Risk (Days remaining vs expected duration) (Weight: 30%)
        double timelineRiskPoints = 10.0;
        if ("DELAYED".equalsIgnoreCase(shipment.getStatus())) {
            timelineRiskPoints = 30.0;
        } else if (shipment.getExpectedDeliveryDate() != null) {
            LocalDateTime now = LocalDateTime.now();
            if (now.isAfter(shipment.getExpectedDeliveryDate())) {
                timelineRiskPoints = 30.0;
            } else {
                long daysRemaining = java.time.Duration.between(now, shipment.getExpectedDeliveryDate()).toDays();
                if (daysRemaining <= 2) {
                    timelineRiskPoints = 25.0;
                } else if (daysRemaining <= 5) {
                    timelineRiskPoints = 15.0;
                } else {
                    timelineRiskPoints = 6.0;
                }
            }
        }

        double totalRiskScore = Math.min(100.0, Math.max(0.0, supplierRiskPoints + carrierRiskPoints + routeRiskPoints + timelineRiskPoints));

        String riskLevel = "LOW";
        if (totalRiskScore >= 80) {
            riskLevel = "CRITICAL";
        } else if (totalRiskScore >= 65) {
            riskLevel = "HIGH";
        } else if (totalRiskScore >= 40) {
            riskLevel = "MEDIUM";
        }

        ShipmentRiskFactorBreakdown breakdown = ShipmentRiskFactorBreakdown.builder()
                .supplierRiskPoints(Math.round(supplierRiskPoints * 10.0) / 10.0)
                .carrierRiskPoints(Math.round(carrierRiskPoints * 10.0) / 10.0)
                .routeRiskPoints(Math.round(routeRiskPoints * 10.0) / 10.0)
                .timelineRiskPoints(Math.round(timelineRiskPoints * 10.0) / 10.0)
                .build();

        String explanation = String.format(
                "Calculated Delay Risk Score is %.1f (%s). Supplier delay history contributed %.1f pts, Carrier reliability contributed %.1f pts, Route performance contributed %.1f pts, and Timeline factor contributed %.1f pts.",
                totalRiskScore, riskLevel, supplierRiskPoints, carrierRiskPoints, routeRiskPoints, timelineRiskPoints
        );

        return ShipmentRiskResult.builder()
                .shipmentId(shipment.getId())
                .shipmentNumber(shipment.getShipmentNumber())
                .riskScore(Math.round(totalRiskScore * 10.0) / 10.0)
                .riskLevel(riskLevel)
                .factorBreakdown(breakdown)
                .explanation(explanation)
                .build();
    }
}
