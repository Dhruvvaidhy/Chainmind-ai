package com.chainmind.warehouse.service;

import com.chainmind.common.exception.ResourceNotFoundException;
import com.chainmind.common.response.PagedResponse;
import com.chainmind.inventory.repository.InventoryRepository;
import com.chainmind.organization.entity.Organization;
import com.chainmind.organization.repository.OrganizationRepository;
import com.chainmind.warehouse.dto.*;
import com.chainmind.warehouse.entity.Warehouse;
import com.chainmind.warehouse.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final InventoryRepository inventoryRepository;
    private final OrganizationRepository organizationRepository;

    @Transactional(readOnly = true)
    public PagedResponse<WarehouseDto> getWarehouses(Long orgId, String search, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Warehouse> warehousePage = warehouseRepository.findByOrganizationIdAndSearch(orgId, search, pageable);
        List<WarehouseDto> dtos = warehousePage.getContent().stream().map(this::mapToDto).collect(Collectors.toList());

        return PagedResponse.<WarehouseDto>builder()
                .content(dtos)
                .page(warehousePage.getNumber())
                .size(warehousePage.getSize())
                .totalElements(warehousePage.getTotalElements())
                .totalPages(warehousePage.getTotalPages())
                .last(warehousePage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public List<WarehouseDto> getAllWarehouses(Long orgId) {
        return warehouseRepository.findByOrganizationId(orgId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WarehouseDto getWarehouseById(Long orgId, Long id) {
        Warehouse warehouse = warehouseRepository.findByIdAndOrganizationId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", id));
        return mapToDto(warehouse);
    }

    @Transactional
    public WarehouseDto createWarehouse(Long orgId, CreateWarehouseRequest request) {
        Organization organization = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", "id", orgId));

        Warehouse warehouse = Warehouse.builder()
                .organization(organization)
                .name(request.getName())
                .code(request.getCode().toUpperCase())
                .location(request.getLocation())
                .city(request.getCity())
                .country(request.getCountry())
                .capacity(request.getCapacity() != null ? request.getCapacity() : 10000)
                .managerName(request.getManagerName())
                .status("ACTIVE")
                .build();

        return mapToDto(warehouseRepository.save(warehouse));
    }

    @Transactional
    public WarehouseDto updateWarehouse(Long orgId, Long id, UpdateWarehouseRequest request) {
        Warehouse warehouse = warehouseRepository.findByIdAndOrganizationId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", id));

        warehouse.setName(request.getName());
        warehouse.setLocation(request.getLocation());
        warehouse.setCity(request.getCity());
        warehouse.setCountry(request.getCountry());
        if (request.getCapacity() != null) warehouse.setCapacity(request.getCapacity());
        warehouse.setManagerName(request.getManagerName());
        if (StringUtils.hasText(request.getStatus())) warehouse.setStatus(request.getStatus());

        return mapToDto(warehouseRepository.save(warehouse));
    }

    @Transactional
    public void deleteWarehouse(Long orgId, Long id) {
        Warehouse warehouse = warehouseRepository.findByIdAndOrganizationId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", id));
        warehouseRepository.delete(warehouse);
    }

    public WarehouseDto mapToDto(Warehouse warehouse) {
        Integer usedCapacity = inventoryRepository.sumCurrentStockByWarehouseId(warehouse.getId());
        if (usedCapacity == null) usedCapacity = 0;

        double utilization = 0.0;
        if (warehouse.getCapacity() != null && warehouse.getCapacity() > 0) {
            utilization = Math.min(100.0, Math.round(((double) usedCapacity / warehouse.getCapacity() * 100.0) * 10.0) / 10.0);
        }

        return WarehouseDto.builder()
                .id(warehouse.getId())
                .organizationId(warehouse.getOrganization().getId())
                .name(warehouse.getName())
                .code(warehouse.getCode())
                .location(warehouse.getLocation())
                .city(warehouse.getCity())
                .country(warehouse.getCountry())
                .capacity(warehouse.getCapacity())
                .managerName(warehouse.getManagerName())
                .status(warehouse.getStatus())
                .usedCapacity(usedCapacity)
                .utilizationPercentage(utilization)
                .createdAt(warehouse.getCreatedAt())
                .updatedAt(warehouse.getUpdatedAt())
                .build();
    }
}
