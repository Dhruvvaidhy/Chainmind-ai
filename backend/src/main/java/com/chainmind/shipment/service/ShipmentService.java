package com.chainmind.shipment.service;

import com.chainmind.analytics.service.ShipmentRiskEngineService;
import com.chainmind.common.exception.ResourceNotFoundException;
import com.chainmind.common.response.PagedResponse;
import com.chainmind.organization.entity.Organization;
import com.chainmind.organization.repository.OrganizationRepository;
import com.chainmind.purchase.entity.PurchaseOrder;
import com.chainmind.purchase.repository.PurchaseOrderRepository;
import com.chainmind.shipment.dto.*;
import com.chainmind.shipment.entity.Shipment;
import com.chainmind.shipment.entity.ShipmentEvent;
import com.chainmind.shipment.repository.ShipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final OrganizationRepository organizationRepository;
    private final ShipmentRiskEngineService riskEngineService;

    @Transactional(readOnly = true)
    public PagedResponse<ShipmentDto> getShipments(Long orgId, String search, String status, String riskLevel, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Shipment> shipmentPage = shipmentRepository.findByOrganizationIdAndFilters(orgId, search, status, riskLevel, pageable);
        List<ShipmentDto> dtos = shipmentPage.getContent().stream().map(this::mapToDto).collect(Collectors.toList());

        return PagedResponse.<ShipmentDto>builder()
                .content(dtos)
                .page(shipmentPage.getNumber())
                .size(shipmentPage.getSize())
                .totalElements(shipmentPage.getTotalElements())
                .totalPages(shipmentPage.getTotalPages())
                .last(shipmentPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public ShipmentDto getShipmentById(Long orgId, Long id) {
        Shipment shipment = shipmentRepository.findByIdAndOrganizationId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment", "id", id));
        return mapToDto(shipment);
    }

    @Transactional
    public ShipmentDto createShipment(Long orgId, CreateShipmentRequest request) {
        Organization organization = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", "id", orgId));

        PurchaseOrder po = null;
        if (request.getPurchaseOrderId() != null) {
            po = purchaseOrderRepository.findByIdAndOrganizationId(request.getPurchaseOrderId(), orgId).orElse(null);
        }

        String shipmentNumber = "SHP-2026-" + String.format("%03d", new Random().nextInt(999));

        Shipment shipment = Shipment.builder()
                .organization(organization)
                .purchaseOrder(po)
                .shipmentNumber(shipmentNumber)
                .origin(request.getOrigin())
                .destination(request.getDestination())
                .carrier(request.getCarrier())
                .trackingNumber(request.getTrackingNumber() != null ? request.getTrackingNumber() : "TRK-" + (1000000 + new Random().nextInt(9000000)))
                .status("CREATED")
                .expectedDeliveryDate(request.getExpectedDeliveryDate() != null ? request.getExpectedDeliveryDate() : LocalDateTime.now().plusDays(10))
                .build();

        // Calculate risk
        ShipmentRiskResult riskResult = riskEngineService.calculateShipmentRisk(shipment);
        shipment.setDelayRiskScore(riskResult.getRiskScore());
        shipment.setRiskLevel(riskResult.getRiskLevel());

        // Add initial event
        shipment.addEvent(ShipmentEvent.builder()
                .status("CREATED")
                .location(request.getOrigin())
                .description("Shipment created and scheduled for pickup")
                .eventTime(LocalDateTime.now())
                .build());

        return mapToDto(shipmentRepository.save(shipment));
    }

    @Transactional
    public ShipmentDto addShipmentEvent(Long orgId, Long id, AddShipmentEventRequest request) {
        Shipment shipment = shipmentRepository.findByIdAndOrganizationId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment", "id", id));

        shipment.setStatus(request.getStatus().toUpperCase());

        if ("DELIVERED".equalsIgnoreCase(request.getStatus())) {
            shipment.setActualDeliveryDate(LocalDateTime.now());
        }

        // Recalculate risk score
        ShipmentRiskResult riskResult = riskEngineService.calculateShipmentRisk(shipment);
        shipment.setDelayRiskScore(riskResult.getRiskScore());
        shipment.setRiskLevel(riskResult.getRiskLevel());

        shipment.addEvent(ShipmentEvent.builder()
                .status(request.getStatus().toUpperCase())
                .location(request.getLocation() != null ? request.getLocation() : shipment.getDestination())
                .description(request.getDescription())
                .eventTime(LocalDateTime.now())
                .build());

        return mapToDto(shipmentRepository.save(shipment));
    }

    @Transactional(readOnly = true)
    public ShipmentRiskResult getShipmentRisk(Long orgId, Long id) {
        Shipment shipment = shipmentRepository.findByIdAndOrganizationId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment", "id", id));
        return riskEngineService.calculateShipmentRisk(shipment);
    }

    public ShipmentDto mapToDto(Shipment shipment) {
        List<ShipmentEventDto> eventDtos = shipment.getEvents().stream()
                .map(e -> ShipmentEventDto.builder()
                        .id(e.getId())
                        .shipmentId(e.getShipment().getId())
                        .status(e.getStatus())
                        .location(e.getLocation())
                        .description(e.getDescription())
                        .eventTime(e.getEventTime())
                        .build())
                .collect(Collectors.toList());

        return ShipmentDto.builder()
                .id(shipment.getId())
                .organizationId(shipment.getOrganization().getId())
                .purchaseOrderId(shipment.getPurchaseOrder() != null ? shipment.getPurchaseOrder().getId() : null)
                .poNumber(shipment.getPurchaseOrder() != null ? shipment.getPurchaseOrder().getPoNumber() : null)
                .shipmentNumber(shipment.getShipmentNumber())
                .origin(shipment.getOrigin())
                .destination(shipment.getDestination())
                .carrier(shipment.getCarrier())
                .trackingNumber(shipment.getTrackingNumber())
                .status(shipment.getStatus())
                .expectedDeliveryDate(shipment.getExpectedDeliveryDate())
                .actualDeliveryDate(shipment.getActualDeliveryDate())
                .delayRiskScore(shipment.getDelayRiskScore())
                .riskLevel(shipment.getRiskLevel())
                .events(eventDtos)
                .createdAt(shipment.getCreatedAt())
                .updatedAt(shipment.getUpdatedAt())
                .build();
    }
}
