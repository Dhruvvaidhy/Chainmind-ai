package com.chainmind.warehouse.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateWarehouseRequest {

    @NotBlank(message = "Warehouse name is required")
    private String name;

    @NotBlank(message = "Warehouse code is required")
    private String code;

    private String location;
    private String city;
    private String country;

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity = 10000;

    private String managerName;
}
