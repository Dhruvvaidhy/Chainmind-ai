package com.chainmind.analytics.controller;

import com.chainmind.analytics.service.DashboardService;
import com.chainmind.common.response.ApiResponse;
import com.chainmind.config.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Executive Dashboard KPIs and Chart APIs")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/kpis")
    @Operation(summary = "Get executive KPI summary")
    public ResponseEntity<ApiResponse<DashboardService.ExecutiveKpisDto>> getExecutiveKpis(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        DashboardService.ExecutiveKpisDto kpis = dashboardService.getExecutiveKpis(userPrincipal.getOrganizationId());
        return ResponseEntity.ok(ApiResponse.success(kpis));
    }

    @GetMapping("/charts")
    @Operation(summary = "Get executive dashboard charts data")
    public ResponseEntity<ApiResponse<DashboardService.DashboardChartsDto>> getDashboardCharts(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        DashboardService.DashboardChartsDto charts = dashboardService.getDashboardCharts(userPrincipal.getOrganizationId());
        return ResponseEntity.ok(ApiResponse.success(charts));
    }
}
