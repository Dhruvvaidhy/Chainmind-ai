package com.chainmind.product.service;

import com.chainmind.common.exception.BadRequestException;
import com.chainmind.common.exception.ResourceNotFoundException;
import com.chainmind.common.response.PagedResponse;
import com.chainmind.organization.entity.Organization;
import com.chainmind.organization.repository.OrganizationRepository;
import com.chainmind.product.dto.*;
import com.chainmind.product.entity.Product;
import com.chainmind.product.entity.ProductCategory;
import com.chainmind.product.repository.ProductCategoryRepository;
import com.chainmind.product.repository.ProductRepository;
import com.chainmind.supplier.entity.Supplier;
import com.chainmind.supplier.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductCategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final OrganizationRepository organizationRepository;

    @Transactional(readOnly = true)
    public PagedResponse<ProductDto> getProducts(Long orgId, String search, Long supplierId, Long categoryId, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Product> productPage = productRepository.findByOrganizationIdAndFilters(orgId, search, supplierId, categoryId, pageable);
        List<ProductDto> dtos = productPage.getContent().stream().map(this::mapToDto).collect(Collectors.toList());

        return PagedResponse.<ProductDto>builder()
                .content(dtos)
                .page(productPage.getNumber())
                .size(productPage.getSize())
                .totalElements(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .last(productPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getAllProducts(Long orgId) {
        return productRepository.findByOrganizationId(orgId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductCategoryDto> getCategories(Long orgId) {
        return categoryRepository.findByOrganizationId(orgId).stream()
                .map(c -> ProductCategoryDto.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .description(c.getDescription())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductDto getProductById(Long orgId, Long id) {
        Product product = productRepository.findByIdAndOrganizationId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return mapToDto(product);
    }

    @Transactional
    public ProductDto createProduct(Long orgId, CreateProductRequest request) {
        Organization organization = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", "id", orgId));

        Supplier supplier = supplierRepository.findByIdAndOrganizationId(request.getSupplierId(), orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", request.getSupplierId()));

        ProductCategory category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId()).orElse(null);
        }

        String sku = request.getSku();
        if (!StringUtils.hasText(sku)) {
            sku = generateSku();
        } else if (productRepository.existsBySku(sku)) {
            throw new BadRequestException("SKU already exists: " + sku);
        }

        Product product = Product.builder()
                .organization(organization)
                .supplier(supplier)
                .category(category)
                .name(request.getName())
                .sku(sku)
                .description(request.getDescription())
                .unit(StringUtils.hasText(request.getUnit()) ? request.getUnit() : "PCS")
                .purchasePrice(request.getPurchasePrice())
                .leadTimeDays(request.getLeadTimeDays() != null ? request.getLeadTimeDays() : 7)
                .reorderLevel(request.getReorderLevel() != null ? request.getReorderLevel() : 50)
                .safetyStock(request.getSafetyStock() != null ? request.getSafetyStock() : 20)
                .status("ACTIVE")
                .build();

        return mapToDto(productRepository.save(product));
    }

    @Transactional
    public ProductDto updateProduct(Long orgId, Long id, UpdateProductRequest request) {
        Product product = productRepository.findByIdAndOrganizationId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        Supplier supplier = supplierRepository.findByIdAndOrganizationId(request.getSupplierId(), orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", request.getSupplierId()));

        ProductCategory category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId()).orElse(null);
        }

        product.setSupplier(supplier);
        product.setCategory(category);
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        if (StringUtils.hasText(request.getUnit())) product.setUnit(request.getUnit());
        product.setPurchasePrice(request.getPurchasePrice());
        if (request.getLeadTimeDays() != null) product.setLeadTimeDays(request.getLeadTimeDays());
        if (request.getReorderLevel() != null) product.setReorderLevel(request.getReorderLevel());
        if (request.getSafetyStock() != null) product.setSafetyStock(request.getSafetyStock());
        if (StringUtils.hasText(request.getStatus())) product.setStatus(request.getStatus());

        return mapToDto(productRepository.save(product));
    }

    @Transactional
    public void deleteProduct(Long orgId, Long id) {
        Product product = productRepository.findByIdAndOrganizationId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        productRepository.delete(product);
    }

    private String generateSku() {
        return "PRD-" + (1000 + new Random().nextInt(9000));
    }

    public ProductDto mapToDto(Product product) {
        return ProductDto.builder()
                .id(product.getId())
                .organizationId(product.getOrganization().getId())
                .supplierId(product.getSupplier().getId())
                .supplierName(product.getSupplier().getName())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : "Uncategorized")
                .name(product.getName())
                .sku(product.getSku())
                .description(product.getDescription())
                .unit(product.getUnit())
                .purchasePrice(product.getPurchasePrice())
                .leadTimeDays(product.getLeadTimeDays())
                .reorderLevel(product.getReorderLevel())
                .safetyStock(product.getSafetyStock())
                .status(product.getStatus())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
