package com.chainmind.purchase.controller;

import com.chainmind.common.response.ApiResponse;
import com.chainmind.common.response.PagedResponse;
import com.chainmind.config.UserPrincipal;
import com.chainmind.purchase.dto.*;
import com.chainmind.purchase.service.PurchaseOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/purchase-orders")
@RequiredArgsConstructor
@Tag(name = "Purchase Orders", description = "Purchase Order management and item receiving APIs")
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    @GetMapping
    @Operation(summary = "Get paginated purchase orders")
    public ResponseEntity<ApiResponse<PagedResponse<PurchaseOrderDto>>> getPurchaseOrders(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        PagedResponse<PurchaseOrderDto> response = purchaseOrderService.getPurchaseOrders(userPrincipal.getOrganizationId(), search, status, supplierId, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get purchase order details")
    public ResponseEntity<ApiResponse<PurchaseOrderDto>> getPurchaseOrderById(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        PurchaseOrderDto po = purchaseOrderService.getPurchaseOrderById(userPrincipal.getOrganizationId(), id);
        return ResponseEntity.ok(ApiResponse.success(po));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ORGANIZATION_ADMIN', 'SUPPLY_CHAIN_MANAGER')")
    @Operation(summary = "Create new purchase order")
    public ResponseEntity<ApiResponse<PurchaseOrderDto>> createPurchaseOrder(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreatePurchaseOrderRequest request) {
        PurchaseOrderDto po = purchaseOrderService.createPurchaseOrder(userPrincipal.getOrganizationId(), userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(po, "Purchase order created successfully"));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ORGANIZATION_ADMIN', 'SUPPLY_CHAIN_MANAGER')")
    @Operation(summary = "Update purchase order status")
    public ResponseEntity<ApiResponse<PurchaseOrderDto>> updateStatus(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @RequestParam String status) {
        PurchaseOrderDto po = purchaseOrderService.updateStatus(userPrincipal.getOrganizationId(), id, status);
        return ResponseEntity.ok(ApiResponse.success(po, "PO status updated to " + status));
    }

    @PostMapping("/{id}/receive")
    @PreAuthorize("hasAnyRole('ORGANIZATION_ADMIN', 'SUPPLY_CHAIN_MANAGER', 'WAREHOUSE_MANAGER')")
    @Operation(summary = "Receive shipment items for PO", description = "Updates received quantities, updates warehouse inventory, and logs stock movements")
    public ResponseEntity<ApiResponse<PurchaseOrderDto>> receiveItems(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestBody ReceiveItemsRequest request) {
        PurchaseOrderDto po = purchaseOrderService.receiveItems(userPrincipal.getOrganizationId(), userPrincipal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success(po, "Items received and inventory updated successfully"));
    }
}
