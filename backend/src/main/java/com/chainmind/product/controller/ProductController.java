package com.chainmind.product.controller;

import com.chainmind.common.response.ApiResponse;
import com.chainmind.common.response.PagedResponse;
import com.chainmind.config.UserPrincipal;
import com.chainmind.product.dto.*;
import com.chainmind.product.service.ProductService;
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
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "Product catalog APIs")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "Get paginated products", description = "Fetches products with search, supplier, and category filters")
    public ResponseEntity<ApiResponse<PagedResponse<ProductDto>>> getProducts(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        PagedResponse<ProductDto> response = productService.getProducts(userPrincipal.getOrganizationId(), search, supplierId, categoryId, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/all")
    @Operation(summary = "Get all products list", description = "Returns unpaginated products list for dropdowns")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getAllProducts(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<ProductDto> products = productService.getAllProducts(userPrincipal.getOrganizationId());
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/categories")
    @Operation(summary = "Get product categories list")
    public ResponseEntity<ApiResponse<List<ProductCategoryDto>>> getCategories(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<ProductCategoryDto> categories = productService.getCategories(userPrincipal.getOrganizationId());
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID")
    public ResponseEntity<ApiResponse<ProductDto>> getProductById(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        ProductDto product = productService.getProductById(userPrincipal.getOrganizationId(), id);
        return ResponseEntity.ok(ApiResponse.success(product));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ORGANIZATION_ADMIN', 'SUPPLY_CHAIN_MANAGER')")
    @Operation(summary = "Create product")
    public ResponseEntity<ApiResponse<ProductDto>> createProduct(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreateProductRequest request) {
        ProductDto product = productService.createProduct(userPrincipal.getOrganizationId(), request);
        return ResponseEntity.ok(ApiResponse.success(product, "Product created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORGANIZATION_ADMIN', 'SUPPLY_CHAIN_MANAGER')")
    @Operation(summary = "Update product")
    public ResponseEntity<ApiResponse<ProductDto>> updateProduct(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestBody UpdateProductRequest request) {
        ProductDto product = productService.updateProduct(userPrincipal.getOrganizationId(), id, request);
        return ResponseEntity.ok(ApiResponse.success(product, "Product updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORGANIZATION_ADMIN', 'SUPPLY_CHAIN_MANAGER')")
    @Operation(summary = "Delete product")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        productService.deleteProduct(userPrincipal.getOrganizationId(), id);
        return ResponseEntity.ok(ApiResponse.success(null, "Product deleted successfully"));
    }
}
