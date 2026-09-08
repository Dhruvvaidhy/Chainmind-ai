package com.chainmind.warehouse.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WarehouseDto {
    private Long id;
    private Long organizationId;
    private String name;
    private String code;
    private String location;
    private String city;
    private String country;
    private Integer capacity;
    private String managerName;
    private String status;
    private Integer usedCapacity;
    private Double utilizationPercentage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
