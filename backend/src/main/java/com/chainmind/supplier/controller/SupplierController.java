package com.chainmind.supplier.controller;

import com.chainmind.common.response.ApiResponse;
import com.chainmind.common.response.PagedResponse;
import com.chainmind.config.UserPrincipal;
import com.chainmind.supplier.dto.CreateSupplierRequest;
import com.chainmind.supplier.dto.SupplierDto;
import com.chainmind.supplier.dto.UpdateSupplierRequest;
import com.chainmind.supplier.service.SupplierService;
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
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
@Tag(name = "Suppliers", description = "Supplier management APIs")
public class SupplierController {

    private final SupplierService supplierService;

    @GetMapping
    @Operation(summary = "Get paginated suppliers", description = "Fetches suppliers with search and status filtering")
    public ResponseEntity<ApiResponse<PagedResponse<SupplierDto>>> getSuppliers(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        PagedResponse<SupplierDto> response = supplierService.getSuppliers(userPrincipal.getOrganizationId(), search, status, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/all")
    @Operation(summary = "Get all suppliers list", description = "Returns unpaginated list of suppliers for dropdown selection")
    public ResponseEntity<ApiResponse<List<SupplierDto>>> getAllSuppliers(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<SupplierDto> suppliers = supplierService.getAllSuppliers(userPrincipal.getOrganizationId());
        return ResponseEntity.ok(ApiResponse.success(suppliers));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get supplier by ID")
    public ResponseEntity<ApiResponse<SupplierDto>> getSupplierById(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        SupplierDto supplier = supplierService.getSupplierById(userPrincipal.getOrganizationId(), id);
        return ResponseEntity.ok(ApiResponse.success(supplier));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ORGANIZATION_ADMIN', 'SUPPLY_CHAIN_MANAGER')")
    @Operation(summary = "Create supplier")
    public ResponseEntity<ApiResponse<SupplierDto>> createSupplier(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreateSupplierRequest request) {
        SupplierDto supplier = supplierService.createSupplier(userPrincipal.getOrganizationId(), request);
        return ResponseEntity.ok(ApiResponse.success(supplier, "Supplier created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORGANIZATION_ADMIN', 'SUPPLY_CHAIN_MANAGER')")
    @Operation(summary = "Update supplier")
    public ResponseEntity<ApiResponse<SupplierDto>> updateSupplier(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestBody UpdateSupplierRequest request) {
        SupplierDto supplier = supplierService.updateSupplier(userPrincipal.getOrganizationId(), id, request);
        return ResponseEntity.ok(ApiResponse.success(supplier, "Supplier updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORGANIZATION_ADMIN', 'SUPPLY_CHAIN_MANAGER')")
    @Operation(summary = "Delete supplier")
    public ResponseEntity<ApiResponse<Void>> deleteSupplier(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        supplierService.deleteSupplier(userPrincipal.getOrganizationId(), id);
        return ResponseEntity.ok(ApiResponse.success(null, "Supplier deleted successfully"));
    }
}
