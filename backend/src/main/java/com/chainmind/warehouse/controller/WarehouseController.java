package com.chainmind.warehouse.controller;

import com.chainmind.common.response.ApiResponse;
import com.chainmind.common.response.PagedResponse;
import com.chainmind.config.UserPrincipal;
import com.chainmind.warehouse.dto.*;
import com.chainmind.warehouse.service.WarehouseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/warehouses")
@RequiredArgsConstructor
@Tag(name = "Warehouses", description = "Warehouse management APIs")
public class WarehouseController {

    private final WarehouseService warehouseService;

    @GetMapping
    @Operation(summary = "Get paginated warehouses")
    public ResponseEntity<ApiResponse<PagedResponse<WarehouseDto>>> getWarehouses(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        PagedResponse<WarehouseDto> response = warehouseService.getWarehouses(userPrincipal.getOrganizationId(), search, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/all")
    @Operation(summary = "Get all warehouses list")
    public ResponseEntity<ApiResponse<List<WarehouseDto>>> getAllWarehouses(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<WarehouseDto> warehouses = warehouseService.getAllWarehouses(userPrincipal.getOrganizationId());
        return ResponseEntity.ok(ApiResponse.success(warehouses));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get warehouse by ID")
    public ResponseEntity<ApiResponse<WarehouseDto>> getWarehouseById(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        WarehouseDto warehouse = warehouseService.getWarehouseById(userPrincipal.getOrganizationId(), id);
        return ResponseEntity.ok(ApiResponse.success(warehouse));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ORGANIZATION_ADMIN', 'WAREHOUSE_MANAGER')")
    @Operation(summary = "Create warehouse")
    public ResponseEntity<ApiResponse<WarehouseDto>> createWarehouse(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreateWarehouseRequest request) {
        WarehouseDto warehouse = warehouseService.createWarehouse(userPrincipal.getOrganizationId(), request);
        return ResponseEntity.ok(ApiResponse.success(warehouse, "Warehouse created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORGANIZATION_ADMIN', 'WAREHOUSE_MANAGER')")
    @Operation(summary = "Update warehouse")
    public ResponseEntity<ApiResponse<WarehouseDto>> updateWarehouse(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestBody UpdateWarehouseRequest request) {
        WarehouseDto warehouse = warehouseService.updateWarehouse(userPrincipal.getOrganizationId(), id, request);
        return ResponseEntity.ok(ApiResponse.success(warehouse, "Warehouse updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORGANIZATION_ADMIN', 'WAREHOUSE_MANAGER')")
    @Operation(summary = "Delete warehouse")
    public ResponseEntity<ApiResponse<Void>> deleteWarehouse(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        warehouseService.deleteWarehouse(userPrincipal.getOrganizationId(), id);
        return ResponseEntity.ok(ApiResponse.success(null, "Warehouse deleted successfully"));
    }
}
