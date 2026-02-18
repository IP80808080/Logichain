package com.logichaintwo.dto;

import java.time.LocalDateTime;

import com.logichaintwo.enums.ShipmentStatus;

import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentDTO {
    private Long id;
    
    @NotBlank(message = "Tracking number is required")
    private String trackingNumber;
    
    @NotNull(message = "Order ID is required")
    @Positive(message = "Order ID must be positive")
    private Long orderId;
    
    @NotNull(message = "Carrier ID is required")
    @Positive(message = "Carrier ID must be positive")
    private Long carrierId;
    
    @NotNull(message = "Shipment status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ShipmentStatus shipmentStatus;
    
    private String currentLocation;
    
    @Future(message = "Estimated delivery date must be in the future")
    private LocalDateTime estimatedDeliveryDate;
    
    private OrderDTO order; 
    private CarrierDTO carrier;
}