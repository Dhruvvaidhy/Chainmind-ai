package com.chainmind.shipment.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddShipmentEventRequest {

    @NotBlank(message = "Status is required")
    private String status;

    private String location;
    private String description;
}
