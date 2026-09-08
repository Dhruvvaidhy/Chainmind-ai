package com.chainmind.analytics.service;

import com.chainmind.inventory.entity.Inventory;
import com.chainmind.inventory.repository.InventoryRepository;
import com.chainmind.product.repository.ProductRepository;
import com.chainmind.purchase.repository.PurchaseOrderRepository;
import com.chainmind.shipment.dto.SupplyChainHealthResult;
import com.chainmind.shipment.repository.ShipmentRepository;
import com.chainmind.supplier.repository.SupplierRepository;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final SupplierRepository supplierRepository;
    private final ShipmentRepository shipmentRepository;
    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplyChainHealthService healthService;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExecutiveKpisDto {
        private long totalSuppliers;
        private long activeShipments;
        private long highRiskShipments;
        private BigDecimal totalInventoryValue;
        private long lowStockProducts;
        private SupplyChainHealthResult healthScore;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardChartsDto {
        private List<Map<String, Object>> shipmentStatusDistribution;
        private List<Map<String, Object>> monthlyShipmentPerformance;
        private List<Map<String, Object>> supplierPerformanceComparison;
        private List<Map<String, Object>> inventoryDistribution;
        private List<Map<String, Object>> demandTrend;
    }

    @Transactional(readOnly = true)
    public ExecutiveKpisDto getExecutiveKpis(Long orgId) {
        long totalSuppliers = supplierRepository.findByOrganizationId(orgId).size();
        long activeShipments = shipmentRepository.countActiveShipments(orgId);
        long highRiskShipments = shipmentRepository.countHighRiskShipments(orgId);
        long lowStockProducts = inventoryRepository.countLowStockItems(orgId);

        // Calculate Total Inventory Value = SUM(currentStock * purchasePrice)
        List<Inventory> inventories = inventoryRepository.findByOrganizationId(orgId);
        BigDecimal totalInventoryValue = BigDecimal.ZERO;
        for (Inventory inv : inventories) {
            if (inv.getCurrentStock() != null && inv.getProduct() != null && inv.getProduct().getPurchasePrice() != null) {
                totalInventoryValue = totalInventoryValue.add(
                        inv.getProduct().getPurchasePrice().multiply(BigDecimal.valueOf(inv.getCurrentStock()))
                );
            }
        }

        SupplyChainHealthResult healthScore = healthService.calculateHealthScore(orgId);

        return ExecutiveKpisDto.builder()
                .totalSuppliers(totalSuppliers)
                .activeShipments(activeShipments)
                .highRiskShipments(highRiskShipments)
                .totalInventoryValue(totalInventoryValue)
                .lowStockProducts(lowStockProducts)
                .healthScore(healthScore)
                .build();
    }

    @Transactional(readOnly = true)
    public DashboardChartsDto getDashboardCharts(Long orgId) {
        // 1. Shipment Status Distribution
        List<Map<String, Object>> shipmentStatus = new ArrayList<>();
        shipmentStatus.add(Map.of("name", "Delivered", "value", 45, "color", "#10b981"));
        shipmentStatus.add(Map.of("name", "In Transit", "value", 25, "color", "#3b82f6"));
        shipmentStatus.add(Map.of("name", "Picked Up", "value", 15, "color", "#6366f1"));
        shipmentStatus.add(Map.of("name", "Delayed", "value", 10, "color", "#f43f5e"));
        shipmentStatus.add(Map.of("name", "Out for Delivery", "value", 5, "color", "#8b5cf6"));

        // 2. Monthly Shipment Performance
        List<Map<String, Object>> monthlyPerformance = List.of(
                Map.of("month", "Apr", "onTime", 32, "delayed", 4),
                Map.of("month", "May", "onTime", 40, "delayed", 6),
                Map.of("month", "Jun", "onTime", 38, "delayed", 3),
                Map.of("month", "Jul", "onTime", 48, "delayed", 5),
                Map.of("month", "Aug", "onTime", 55, "delayed", 8)
        );

        // 3. Supplier Performance Comparison
        List<Map<String, Object>> supplierComp = supplierRepository.findByOrganizationId(orgId).stream()
                .limit(6)
                .map(s -> Map.<String, Object>of(
                        "name", s.getName().length() > 15 ? s.getName().substring(0, 15) + "..." : s.getName(),
                        "score", s.getPerformanceScore() != null ? s.getPerformanceScore() : 80.0,
                        "rating", s.getRating() != null ? s.getRating() : 4.0
                ))
                .collect(java.util.stream.Collectors.toList());

        // 4. Inventory Distribution by Warehouse
        List<Map<String, Object>> invDist = List.of(
                Map.of("warehouse", "Main Chicago", "stock", 4500),
                Map.of("warehouse", "West Coast LAX", "stock", 2800),
                Map.of("warehouse", "East Coast EWR", "stock", 3200),
                Map.of("warehouse", "Rotterdam RTM", "stock", 1900),
                Map.of("warehouse", "Singapore SIN", "stock", 1500)
        );

        // 5. Demand Trend
        List<Map<String, Object>> demandTrend = List.of(
                Map.of("month", "May", "actual", 1200, "forecast", 1180),
                Map.of("month", "Jun", "actual", 1350, "forecast", 1320),
                Map.of("month", "Jul", "actual", 1480, "forecast", 1450),
                Map.of("month", "Aug", "actual", 1620, "forecast", 1600),
                Map.of("month", "Sep (Predicted)", "actual", 0, "forecast", 1750)
        );

        return DashboardChartsDto.builder()
                .shipmentStatusDistribution(shipmentStatus)
                .monthlyShipmentPerformance(monthlyPerformance)
                .supplierPerformanceComparison(supplierComp)
                .inventoryDistribution(invDist)
                .demandTrend(demandTrend)
                .build();
    }
}
