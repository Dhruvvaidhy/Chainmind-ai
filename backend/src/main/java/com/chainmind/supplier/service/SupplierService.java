package com.chainmind.supplier.service;

import com.chainmind.common.exception.ResourceNotFoundException;
import com.chainmind.common.response.PagedResponse;
import com.chainmind.organization.entity.Organization;
import com.chainmind.organization.repository.OrganizationRepository;
import com.chainmind.supplier.dto.CreateSupplierRequest;
import com.chainmind.supplier.dto.SupplierDto;
import com.chainmind.supplier.dto.UpdateSupplierRequest;
import com.chainmind.supplier.entity.Supplier;
import com.chainmind.supplier.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final OrganizationRepository organizationRepository;

    @Transactional(readOnly = true)
    public PagedResponse<SupplierDto> getSuppliers(Long orgId, String search, String status, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Supplier> supplierPage = supplierRepository.findByOrganizationIdAndFilters(orgId, search, status, pageable);
        List<SupplierDto> dtos = supplierPage.getContent().stream().map(this::mapToDto).collect(Collectors.toList());

        return PagedResponse.<SupplierDto>builder()
                .content(dtos)
                .page(supplierPage.getNumber())
                .size(supplierPage.getSize())
                .totalElements(supplierPage.getTotalElements())
                .totalPages(supplierPage.getTotalPages())
                .last(supplierPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public List<SupplierDto> getAllSuppliers(Long orgId) {
        return supplierRepository.findByOrganizationId(orgId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SupplierDto getSupplierById(Long orgId, Long id) {
        Supplier supplier = supplierRepository.findByIdAndOrganizationId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));
        return mapToDto(supplier);
    }

    @Transactional
    public SupplierDto createSupplier(Long orgId, CreateSupplierRequest request) {
        Organization organization = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", "id", orgId));

        Supplier supplier = Supplier.builder()
                .organization(organization)
                .name(request.getName())
                .contactPerson(request.getContactPerson())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .city(request.getCity())
                .country(request.getCountry())
                .rating(request.getRating() != null ? request.getRating() : 4.0)
                .performanceScore(calculateInitialScore(request.getRating()))
                .status("ACTIVE")
                .build();

        return mapToDto(supplierRepository.save(supplier));
    }

    @Transactional
    public SupplierDto updateSupplier(Long orgId, Long id, UpdateSupplierRequest request) {
        Supplier supplier = supplierRepository.findByIdAndOrganizationId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));

        supplier.setName(request.getName());
        supplier.setContactPerson(request.getContactPerson());
        supplier.setEmail(request.getEmail());
        supplier.setPhone(request.getPhone());
        supplier.setAddress(request.getAddress());
        supplier.setCity(request.getCity());
        supplier.setCountry(request.getCountry());
        if (request.getRating() != null) {
            supplier.setRating(request.getRating());
            supplier.setPerformanceScore(calculateInitialScore(request.getRating()));
        }
        if (request.getStatus() != null) {
            supplier.setStatus(request.getStatus());
        }

        return mapToDto(supplierRepository.save(supplier));
    }

    @Transactional
    public void deleteSupplier(Long orgId, Long id) {
        Supplier supplier = supplierRepository.findByIdAndOrganizationId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));
        supplierRepository.delete(supplier);
    }

    private Double calculateInitialScore(Double rating) {
        if (rating == null) return 80.0;
        return Math.min(100.0, Math.max(0.0, rating * 20.0));
    }

    public SupplierDto mapToDto(Supplier supplier) {
        return SupplierDto.builder()
                .id(supplier.getId())
                .organizationId(supplier.getOrganization().getId())
                .name(supplier.getName())
                .contactPerson(supplier.getContactPerson())
                .email(supplier.getEmail())
                .phone(supplier.getPhone())
                .address(supplier.getAddress())
                .city(supplier.getCity())
                .country(supplier.getCountry())
                .rating(supplier.getRating())
                .performanceScore(supplier.getPerformanceScore())
                .status(supplier.getStatus())
                .createdAt(supplier.getCreatedAt())
                .updatedAt(supplier.getUpdatedAt())
                .build();
    }
}
