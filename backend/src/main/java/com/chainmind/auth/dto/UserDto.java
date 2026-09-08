package com.chainmind.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private Long organizationId;
    private String organizationName;
    private String organizationCode;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String role;
    private Boolean active;
}
