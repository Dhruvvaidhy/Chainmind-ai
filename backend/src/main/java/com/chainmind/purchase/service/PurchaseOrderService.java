package com.chainmind.purchase.service;

import com.chainmind.common.exception.BadRequestException;
import com.chainmind.common.exception.ResourceNotFoundException;
import com.chainmind.common.response.PagedResponse;
import com.chainmind.inventory.entity.Inventory;
import com.chainmind.inventory.entity.StockMovement;
import com.chainmind.inventory.repository.InventoryRepository;
import com.chainmind.inventory.repository.StockMovementRepository;
import com.chainmind.organization.entity.Organization;
import com.chainmind.organization.repository.OrganizationRepository;
import com.chainmind.product.entity.Product;
import com.chainmind.product.repository.ProductRepository;
import com.chainmind.purchase.dto.*;
import com.chainmind.purchase.entity.PurchaseOrder;
import com.chainmind.purchase.entity.PurchaseOrderItem;
import com.chainmind.purchase.repository.PurchaseOrderRepository;
import com.chainmind.supplier.entity.Supplier;
import com.chainmind.supplier.repository.SupplierRepository;
import com.chainmind.warehouse.entity.Warehouse;
import com.chainmind.warehouse.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final OrganizationRepository organizationRepository;
    private final WarehouseRepository warehouseRepository;
    private final InventoryRepository inventoryRepository;
    private final StockMovementRepository stockMovementRepository;

    @Transactional(readOnly = true)
    public PagedResponse<PurchaseOrderDto> getPurchaseOrders(Long orgId, String search, String status, Long supplierId, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<PurchaseOrder> poPage = purchaseOrderRepository.findByOrganizationIdAndFilters(orgId, search, status, supplierId, pageable);
        List<PurchaseOrderDto> dtos = poPage.getContent().stream().map(this::mapToDto).collect(Collectors.toList());

        return PagedResponse.<PurchaseOrderDto>builder()
                .content(dtos)
                .page(poPage.getNumber())
                .size(poPage.getSize())
                .totalElements(poPage.getTotalElements())
                .totalPages(poPage.getTotalPages())
                .last(poPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public PurchaseOrderDto getPurchaseOrderById(Long orgId, Long id) {
        PurchaseOrder po = purchaseOrderRepository.findByIdAndOrganizationId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", "id", id));
        return mapToDto(po);
    }

    @Transactional
    public PurchaseOrderDto createPurchaseOrder(Long orgId, Long userId, CreatePurchaseOrderRequest request) {
        Organization organization = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", "id", orgId));

        Supplier supplier = supplierRepository.findByIdAndOrganizationId(request.getSupplierId(), orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", request.getSupplierId()));

        String poNumber = "PO-2026-" + String.format("%03d", new Random().nextInt(999));

        BigDecimal subtotal = BigDecimal.ZERO;

        PurchaseOrder po = PurchaseOrder.builder()
                .organization(organization)
                .supplier(supplier)
                .poNumber(poNumber)
                .orderDate(LocalDate.now())
                .expectedDeliveryDate(request.getExpectedDeliveryDate() != null ? request.getExpectedDeliveryDate() : LocalDate.now().plusDays(14))
                .status("DRAFT")
                .notes(request.getNotes())
                .createdBy(userId)
                .build();

        for (CreatePurchaseOrderRequest.CreateItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findByIdAndOrganizationId(itemReq.getProductId(), orgId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", itemReq.getProductId()));

            BigDecimal unitPrice = BigDecimal.valueOf(itemReq.getUnitPrice());
            BigDecimal itemTotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            subtotal = subtotal.add(itemTotal);

            PurchaseOrderItem item = PurchaseOrderItem.builder()
                    .product(product)
                    .quantity(itemReq.getQuantity())
                    .receivedQuantity(0)
                    .unitPrice(unitPrice)
                    .tax(itemTotal.multiply(BigDecimal.valueOf(0.10))) // 10% tax
                    .totalPrice(itemTotal)
                    .build();

            po.addItem(item);
        }

        BigDecimal tax = subtotal.multiply(BigDecimal.valueOf(0.10));
        po.setSubtotal(subtotal);
        po.setTax(tax);
        po.setTotalAmount(subtotal.add(tax));

        return mapToDto(purchaseOrderRepository.save(po));
    }

    @Transactional
    public PurchaseOrderDto updateStatus(Long orgId, Long id, String newStatus) {
        PurchaseOrder po = purchaseOrderRepository.findByIdAndOrganizationId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", "id", id));

        validateStatusTransition(po.getStatus(), newStatus.toUpperCase());
        po.setStatus(newStatus.toUpperCase());

        if ("COMPLETED".equalsIgnoreCase(newStatus)) {
            po.setActualDeliveryDate(LocalDate.now());
        }

        return mapToDto(purchaseOrderRepository.save(po));
    }

    @Transactional
    public PurchaseOrderDto receiveItems(Long orgId, Long userId, Long id, ReceiveItemsRequest request) {
        PurchaseOrder po = purchaseOrderRepository.findByIdAndOrganizationId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", "id", id));

        if ("CANCELLED".equals(po.getStatus()) || "COMPLETED".equals(po.getStatus())) {
            throw new BadRequestException("Cannot receive items for a PO that is " + po.getStatus());
        }

        Warehouse warehouse = warehouseRepository.findByIdAndOrganizationId(request.getWarehouseId(), orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", request.getWarehouseId()));

        boolean allCompleted = true;
        boolean anyReceived = false;

        for (ReceiveItemsRequest.ReceiveItemDetail detail : request.getItems()) {
            PurchaseOrderItem item = po.getItems().stream()
                    .filter(i -> i.getId().equals(detail.getItemId()))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrderItem", "id", detail.getItemId()));

            int newlyReceived = detail.getReceivedQuantity();
            if (newlyReceived <= 0) continue;

            int totalReceived = item.getReceivedQuantity() + newlyReceived;
            if (totalReceived > item.getQuantity()) {
                throw new BadRequestException("Received quantity exceeds remaining quantity for product: " + item.getProduct().getName());
            }

            item.setReceivedQuantity(totalReceived);
            anyReceived = true;

            // Update warehouse inventory
            Product product = item.getProduct();
            Inventory inventory = inventoryRepository.findByProductIdAndWarehouseId(product.getId(), warehouse.getId())
                    .orElseGet(() -> Inventory.builder()
                            .organization(po.getOrganization())
                            .product(product)
                            .warehouse(warehouse)
                            .currentStock(0)
                            .reservedStock(0)
                            .availableStock(0)
                            .reorderLevel(product.getReorderLevel())
                            .safetyStock(product.getSafetyStock())
                            .build());

            int previousStock = inventory.getCurrentStock();
            int newStock = previousStock + newlyReceived;
            inventory.setCurrentStock(newStock);
            inventory.recalculateAvailableStock();
            Inventory savedInv = inventoryRepository.save(inventory);

            // Audit Stock Movement
            StockMovement movement = StockMovement.builder()
                    .organization(po.getOrganization())
                    .inventory(savedInv)
                    .product(product)
                    .warehouse(warehouse)
                    .type("PURCHASE_RECEIPT")
                    .quantity(newlyReceived)
                    .previousQuantity(previousStock)
                    .newQuantity(newStock)
                    .referenceType("PURCHASE_ORDER")
                    .referenceId(po.getId())
                    .notes("Received via PO " + po.getPoNumber())
                    .createdBy(userId)
                    .build();

            stockMovementRepository.save(movement);
        }

        // Recheck completion state
        for (PurchaseOrderItem item : po.getItems()) {
            if (item.getReceivedQuantity() < item.getQuantity()) {
                allCompleted = false;
                break;
            }
        }

        if (allCompleted) {
            po.setStatus("COMPLETED");
            po.setActualDeliveryDate(LocalDate.now());
        } else if (anyReceived) {
            po.setStatus("PARTIALLY_RECEIVED");
        }

        return mapToDto(purchaseOrderRepository.save(po));
    }

    private void validateStatusTransition(String currentStatus, String newStatus) {
        if (currentStatus.equals(newStatus)) return;
        if ("CANCELLED".equals(currentStatus)) {
            throw new BadRequestException("Cannot change status of a cancelled purchase order");
        }
        if ("COMPLETED".equals(currentStatus)) {
            throw new BadRequestException("Cannot change status of a completed purchase order");
        }
    }

    public PurchaseOrderDto mapToDto(PurchaseOrder po) {
        List<PurchaseOrderItemDto> itemDtos = po.getItems().stream()
                .map(i -> PurchaseOrderItemDto.builder()
                        .id(i.getId())
                        .productId(i.getProduct().getId())
                        .productName(i.getProduct().getName())
                        .productSku(i.getProduct().getSku())
                        .quantity(i.getQuantity())
                        .receivedQuantity(i.getReceivedQuantity())
                        .unitPrice(i.getUnitPrice())
                        .tax(i.getTax())
                        .totalPrice(i.getTotalPrice())
                        .build())
                .collect(Collectors.toList());

        return PurchaseOrderDto.builder()
                .id(po.getId())
                .organizationId(po.getOrganization().getId())
                .supplierId(po.getSupplier().getId())
                .supplierName(po.getSupplier().getName())
                .poNumber(po.getPoNumber())
                .orderDate(po.getOrderDate())
                .expectedDeliveryDate(po.getExpectedDeliveryDate())
                .actualDeliveryDate(po.getActualDeliveryDate())
                .status(po.getStatus())
                .subtotal(po.getSubtotal())
                .tax(po.getTax())
                .totalAmount(po.getTotalAmount())
                .notes(po.getNotes())
                .items(itemDtos)
                .createdAt(po.getCreatedAt())
                .updatedAt(po.getUpdatedAt())
                .build();
    }
}
