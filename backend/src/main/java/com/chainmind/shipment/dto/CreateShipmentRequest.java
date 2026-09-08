package com.chainmind.shipment.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateShipmentRequest {

    private Long purchaseOrderId;

    @NotBlank(message = "Origin location is required")
    private String origin;

    @NotBlank(message = "Destination location is required")
    private String destination;

    @NotBlank(message = "Carrier name is required")
    private String carrier;

    private String trackingNumber;
    private LocalDateTime expectedDeliveryDate;
}
