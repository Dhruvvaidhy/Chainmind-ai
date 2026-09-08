package com.chainmind.warehouse.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateWarehouseRequest {

    @NotBlank(message = "Warehouse name is required")
    private String name;

    private String location;
    private String city;
    private String country;

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    private String managerName;
    private String status;
}
