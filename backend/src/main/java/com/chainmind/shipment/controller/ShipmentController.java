package com.chainmind.shipment.controller;

import com.chainmind.common.response.ApiResponse;
import com.chainmind.common.response.PagedResponse;
import com.chainmind.config.UserPrincipal;
import com.chainmind.shipment.dto.*;
import com.chainmind.shipment.service.ShipmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/shipments")
@RequiredArgsConstructor
@Tag(name = "Shipments", description = "Shipment tracking and delay risk scoring APIs")
public class ShipmentController {

    private final ShipmentService shipmentService;

    @GetMapping
    @Operation(summary = "Get paginated shipments")
    public ResponseEntity<ApiResponse<PagedResponse<ShipmentDto>>> getShipments(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String riskLevel,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        PagedResponse<ShipmentDto> response = shipmentService.getShipments(userPrincipal.getOrganizationId(), search, status, riskLevel, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get shipment details & tracking events")
    public ResponseEntity<ApiResponse<ShipmentDto>> getShipmentById(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        ShipmentDto shipment = shipmentService.getShipmentById(userPrincipal.getOrganizationId(), id);
        return ResponseEntity.ok(ApiResponse.success(shipment));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ORGANIZATION_ADMIN', 'SUPPLY_CHAIN_MANAGER')")
    @Operation(summary = "Create shipment")
    public ResponseEntity<ApiResponse<ShipmentDto>> createShipment(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreateShipmentRequest request) {
        ShipmentDto shipment = shipmentService.createShipment(userPrincipal.getOrganizationId(), request);
        return ResponseEntity.ok(ApiResponse.success(shipment, "Shipment created successfully"));
    }

    @PostMapping("/{id}/events")
    @PreAuthorize("hasAnyRole('ORGANIZATION_ADMIN', 'SUPPLY_CHAIN_MANAGER', 'WAREHOUSE_MANAGER')")
    @Operation(summary = "Add shipment tracking event")
    public ResponseEntity<ApiResponse<ShipmentDto>> addShipmentEvent(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestBody AddShipmentEventRequest request) {
        ShipmentDto shipment = shipmentService.addShipmentEvent(userPrincipal.getOrganizationId(), id, request);
        return ResponseEntity.ok(ApiResponse.success(shipment, "Tracking event added successfully"));
    }

    @GetMapping("/{id}/risk-analysis")
    @Operation(summary = "Get explainable shipment delay risk calculation")
    public ResponseEntity<ApiResponse<ShipmentRiskResult>> getShipmentRisk(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        ShipmentRiskResult riskResult = shipmentService.getShipmentRisk(userPrincipal.getOrganizationId(), id);
        return ResponseEntity.ok(ApiResponse.success(riskResult));
    }
}
