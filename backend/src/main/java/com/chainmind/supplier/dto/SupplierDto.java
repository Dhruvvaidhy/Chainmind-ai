package com.chainmind.supplier.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierDto {
    private Long id;
    private Long organizationId;
    private String name;
    private String contactPerson;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String country;
    private Double rating;
    private Double performanceScore;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
