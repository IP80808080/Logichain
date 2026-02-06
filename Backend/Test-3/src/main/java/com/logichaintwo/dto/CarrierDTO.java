package com.logichaintwo.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CarrierDTO {
    private Long id;
    
    @NotBlank(message = "Carrier code is required")
    @Size(min = 2, max = 20, message = "Carrier code must be between 2 and 20 characters")
    private String carrierCode;
    
    @NotBlank(message = "Carrier name is required")
    @Size(min = 2, max = 100, message = "Carrier name must be between 2 and 100 characters")
    private String carrierName;
    
    @NotBlank(message = "Contact email is required")
    @Email(message = "Invalid email format")
    private String contactEmail;
    
    private LocalDateTime createdAt;
}