package com.chainmind.analytics.controller;

import com.chainmind.analytics.service.DemandForecastingService;
import com.chainmind.analytics.service.SupplyChainHealthService;
import com.chainmind.common.response.ApiResponse;
import com.chainmind.config.UserPrincipal;
import com.chainmind.shipment.dto.DemandForecastResult;
import com.chainmind.shipment.dto.SupplyChainHealthResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Supply Chain Intelligence & Forecasting APIs")
public class AnalyticsController {

    private final SupplyChainHealthService healthService;
    private final DemandForecastingService demandForecastingService;

    @GetMapping("/health")
    @Operation(summary = "Get supply chain health score")
    public ResponseEntity<ApiResponse<SupplyChainHealthResult>> getHealthScore(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        SupplyChainHealthResult health = healthService.calculateHealthScore(userPrincipal.getOrganizationId());
        return ResponseEntity.ok(ApiResponse.success(health));
    }

    @GetMapping("/demand/{productId}")
    @Operation(summary = "Get product demand forecast")
    public ResponseEntity<ApiResponse<DemandForecastResult>> getDemandForecast(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long productId) {
        DemandForecastResult forecast = demandForecastingService.forecastDemandForProduct(userPrincipal.getOrganizationId(), productId);
        return ResponseEntity.ok(ApiResponse.success(forecast));
    }
}
