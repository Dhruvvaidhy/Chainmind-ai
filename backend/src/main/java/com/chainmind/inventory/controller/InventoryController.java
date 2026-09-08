package com.chainmind.inventory.controller;

import com.chainmind.common.response.ApiResponse;
import com.chainmind.common.response.PagedResponse;
import com.chainmind.config.UserPrincipal;
import com.chainmind.inventory.dto.*;
import com.chainmind.inventory.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory", description = "Stock level and movement APIs")
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    @Operation(summary = "Get paginated inventory levels")
    public ResponseEntity<ApiResponse<PagedResponse<InventoryDto>>> getInventory(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        PagedResponse<InventoryDto> response = inventoryService.getInventory(userPrincipal.getOrganizationId(), search, productId, warehouseId, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get inventory record by ID")
    public ResponseEntity<ApiResponse<InventoryDto>> getInventoryById(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        InventoryDto inventory = inventoryService.getInventoryById(userPrincipal.getOrganizationId(), id);
        return ResponseEntity.ok(ApiResponse.success(inventory));
    }

    @PostMapping("/adjust")
    @PreAuthorize("hasAnyRole('ORGANIZATION_ADMIN', 'WAREHOUSE_MANAGER', 'SUPPLY_CHAIN_MANAGER')")
    @Operation(summary = "Perform stock adjustment", description = "Adjusts stock levels and generates stock movement audit trail")
    public ResponseEntity<ApiResponse<InventoryDto>> adjustStock(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody StockAdjustmentRequest request) {
        InventoryDto inventory = inventoryService.adjustStock(userPrincipal.getOrganizationId(), userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(inventory, "Stock adjusted successfully"));
    }

    @GetMapping("/movements")
    @Operation(summary = "Get stock movement history")
    public ResponseEntity<ApiResponse<PagedResponse<StockMovementDto>>> getStockMovements(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) Long inventoryId,
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<StockMovementDto> response = inventoryService.getStockMovements(userPrincipal.getOrganizationId(), inventoryId, productId, type, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
