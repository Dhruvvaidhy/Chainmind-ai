package com.chainmind.shipment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentEventDto {
    private Long id;
    private Long shipmentId;
    private String status;
    private String location;
    private String description;
    private LocalDateTime eventTime;
}
