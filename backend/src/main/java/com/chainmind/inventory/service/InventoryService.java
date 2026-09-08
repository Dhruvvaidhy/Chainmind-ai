package com.chainmind.inventory.service;

import com.chainmind.common.exception.BadRequestException;
import com.chainmind.common.exception.ResourceNotFoundException;
import com.chainmind.common.response.PagedResponse;
import com.chainmind.inventory.dto.*;
import com.chainmind.inventory.entity.Inventory;
import com.chainmind.inventory.entity.StockMovement;
import com.chainmind.inventory.repository.InventoryRepository;
import com.chainmind.inventory.repository.StockMovementRepository;
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
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final StockMovementRepository stockMovementRepository;

    @Transactional(readOnly = true)
    public PagedResponse<InventoryDto> getInventory(Long orgId, String search, Long productId, Long warehouseId, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Inventory> inventoryPage = inventoryRepository.findByOrganizationIdAndFilters(orgId, search, productId, warehouseId, pageable);
        List<InventoryDto> dtos = inventoryPage.getContent().stream().map(this::mapToDto).collect(Collectors.toList());

        return PagedResponse.<InventoryDto>builder()
                .content(dtos)
                .page(inventoryPage.getNumber())
                .size(inventoryPage.getSize())
                .totalElements(inventoryPage.getTotalElements())
                .totalPages(inventoryPage.getTotalPages())
                .last(inventoryPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public InventoryDto getInventoryById(Long orgId, Long id) {
        Inventory inventory = inventoryRepository.findByIdAndOrganizationId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory", "id", id));
        return mapToDto(inventory);
    }

    @Transactional
    public InventoryDto adjustStock(Long orgId, Long userId, StockAdjustmentRequest request) {
        Inventory inventory = inventoryRepository.findByIdAndOrganizationId(request.getInventoryId(), orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory", "id", request.getInventoryId()));

        int previousStock = inventory.getCurrentStock();
        int qty = request.getQuantity();
        int newStock = previousStock;

        switch (request.getType().toUpperCase()) {
            case "INCREASE":
            case "PURCHASE_RECEIPT":
                if (qty <= 0) throw new BadRequestException("Quantity must be positive for increase adjustment");
                newStock += qty;
                break;
            case "DECREASE":
                if (qty <= 0) throw new BadRequestException("Quantity must be positive for decrease adjustment");
                if (previousStock < qty) throw new BadRequestException("Insufficient current stock for decrease");
                newStock -= qty;
                break;
            case "DAMAGE":
                if (qty <= 0) throw new BadRequestException("Quantity must be positive for damage adjustment");
                if (previousStock < qty) throw new BadRequestException("Insufficient current stock for damage");
                newStock -= qty;
                inventory.setDamagedStock(inventory.getDamagedStock() + qty);
                break;
            case "CORRECTION":
                newStock = qty;
                break;
            default:
                throw new BadRequestException("Invalid stock adjustment type: " + request.getType());
        }

        inventory.setCurrentStock(newStock);
        inventory.recalculateAvailableStock();
        Inventory savedInventory = inventoryRepository.save(inventory);

        // Record stock movement audit history
        StockMovement movement = StockMovement.builder()
                .organization(savedInventory.getOrganization())
                .inventory(savedInventory)
                .product(savedInventory.getProduct())
                .warehouse(savedInventory.getWarehouse())
                .type(request.getType().toUpperCase())
                .quantity(request.getType().equalsIgnoreCase("DECREASE") || request.getType().equalsIgnoreCase("DAMAGE") ? -qty : qty)
                .previousQuantity(previousStock)
                .newQuantity(newStock)
                .referenceType("MANUAL_ADJUSTMENT")
                .notes(request.getNotes())
                .createdBy(userId)
                .build();

        stockMovementRepository.save(movement);

        return mapToDto(savedInventory);
    }

    @Transactional(readOnly = true)
    public PagedResponse<StockMovementDto> getStockMovements(Long orgId, Long inventoryId, Long productId, String type, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<StockMovement> pageResult = stockMovementRepository.findByOrganizationIdAndFilters(orgId, inventoryId, productId, type, pageable);

        List<StockMovementDto> dtos = pageResult.getContent().stream()
                .map(sm -> StockMovementDto.builder()
                        .id(sm.getId())
                        .inventoryId(sm.getInventory().getId())
                        .productId(sm.getProduct().getId())
                        .productName(sm.getProduct().getName())
                        .warehouseId(sm.getWarehouse().getId())
                        .warehouseName(sm.getWarehouse().getName())
                        .type(sm.getType())
                        .quantity(sm.getQuantity())
                        .previousQuantity(sm.getPreviousQuantity())
                        .newQuantity(sm.getNewQuantity())
                        .referenceType(sm.getReferenceType())
                        .referenceId(sm.getReferenceId())
                        .notes(sm.getNotes())
                        .createdAt(sm.getCreatedAt())
                        .createdBy(sm.getCreatedBy())
                        .build())
                .collect(Collectors.toList());

        return PagedResponse.<StockMovementDto>builder()
                .content(dtos)
                .page(pageResult.getNumber())
                .size(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .last(pageResult.isLast())
                .build();
    }

    public String calculateStockoutRiskStatus(Inventory inventory) {
        int avail = inventory.getAvailableStock() != null ? inventory.getAvailableStock() : 0;
        int safety = inventory.getSafetyStock() != null ? inventory.getSafetyStock() : 20;
        int reorder = inventory.getReorderLevel() != null ? inventory.getReorderLevel() : 50;

        if (avail <= 0 || avail <= safety) {
            return "HIGH_STOCKOUT_RISK";
        } else if (avail <= reorder) {
            return "LOW_STOCK";
        } else {
            return "NORMAL";
        }
    }

    public InventoryDto mapToDto(Inventory inventory) {
        inventory.recalculateAvailableStock();
        return InventoryDto.builder()
                .id(inventory.getId())
                .organizationId(inventory.getOrganization().getId())
                .productId(inventory.getProduct().getId())
                .productName(inventory.getProduct().getName())
                .productSku(inventory.getProduct().getSku())
                .warehouseId(inventory.getWarehouse().getId())
                .warehouseName(inventory.getWarehouse().getName())
                .currentStock(inventory.getCurrentStock())
                .reservedStock(inventory.getReservedStock())
                .availableStock(inventory.getAvailableStock())
                .incomingStock(inventory.getIncomingStock())
                .damagedStock(inventory.getDamagedStock())
                .reorderLevel(inventory.getReorderLevel())
                .safetyStock(inventory.getSafetyStock())
                .stockoutRiskStatus(calculateStockoutRiskStatus(inventory))
                .createdAt(inventory.getCreatedAt())
                .updatedAt(inventory.getUpdatedAt())
                .build();
    }
}
