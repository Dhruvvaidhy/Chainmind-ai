package com.chainmind.analytics.service;

import com.chainmind.inventory.repository.InventoryRepository;
import com.chainmind.shipment.dto.SupplyChainHealthResult;
import com.chainmind.shipment.repository.ShipmentRepository;
import com.chainmind.supplier.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SupplyChainHealthService {

    private final SupplierRepository supplierRepository;
    private final ShipmentRepository shipmentRepository;
    private final InventoryRepository inventoryRepository;

    @Transactional(readOnly = true)
    public SupplyChainHealthResult calculateHealthScore(Long orgId) {
        // 1. Supplier Performance Score (Average performance of active suppliers)
        var suppliers = supplierRepository.findByOrganizationId(orgId);
        double supplierScore = suppliers.stream()
                .mapToDouble(s -> s.getPerformanceScore() != null ? s.getPerformanceScore() : 80.0)
                .average()
                .orElse(80.0);

        // 2. Shipment Performance Score (Percentage of non-critical shipments)
        long totalActiveShipments = shipmentRepository.countActiveShipments(orgId);
        long highRiskShipments = shipmentRepository.countHighRiskShipments(orgId);
        double shipmentScore = 90.0;
        if (totalActiveShipments > 0) {
            shipmentScore = Math.max(0.0, 100.0 - ((double) highRiskShipments / totalActiveShipments * 100.0));
        }

        // 3. Inventory Health Score (Based on stockout & low stock count vs total inventory items)
        long totalInventory = inventoryRepository.count();
        long lowStockCount = inventoryRepository.countLowStockItems(orgId);
        long stockoutRiskCount = inventoryRepository.countStockoutRiskItems(orgId);
        double inventoryScore = 85.0;
        if (totalInventory > 0) {
            double penalty = ((lowStockCount * 10.0) + (stockoutRiskCount * 25.0)) / totalInventory * 10.0;
            inventoryScore = Math.max(30.0, Math.min(100.0, 100.0 - penalty));
        }

        // 4. Demand Stability Score
        double demandStabilityScore = 82.5;

        // Overall Weighted Health Score (25% each)
        double overallScore = (supplierScore * 0.25) + (shipmentScore * 0.25) + (inventoryScore * 0.25) + (demandStabilityScore * 0.25);
        overallScore = Math.round(overallScore * 10.0) / 10.0;

        String healthLevel = "GOOD";
        if (overallScore >= 91) healthLevel = "EXCELLENT";
        else if (overallScore >= 76) healthLevel = "GOOD";
        else if (overallScore >= 61) healthLevel = "FAIR";
        else if (overallScore >= 41) healthLevel = "POOR";
        else healthLevel = "CRITICAL";

        return SupplyChainHealthResult.builder()
                .supplierPerformanceScore(Math.round(supplierScore * 10.0) / 10.0)
                .shipmentPerformanceScore(Math.round(shipmentScore * 10.0) / 10.0)
                .inventoryHealthScore(Math.round(inventoryScore * 10.0) / 10.0)
                .demandStabilityScore(Math.round(demandStabilityScore * 10.0) / 10.0)
                .overallHealthScore(overallScore)
                .healthLevel(healthLevel)
                .build();
    }
}
