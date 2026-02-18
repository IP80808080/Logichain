package com.logichaintwo.entities;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Entity
@Data
public class Carrier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Carrier code is required")
    @Size(min = 2, max = 20, message = "Carrier code must be between 2 and 20 characters")
    @Column(unique = true, nullable = false, length = 20)
    private String carrierCode;

    @NotBlank(message = "Carrier name is required")
    @Size(min = 2, max = 100, message = "Carrier name must be between 2 and 100 characters")
    @Column(nullable = false, length = 100)
    private String carrierName;

    @NotBlank(message = "Contact email is required")
    @Email(message = "Invalid email format")
    @Column(nullable = false)
    private String contactEmail;
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @OneToMany(mappedBy = "carrier", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Shipment> shipments = new ArrayList<>();
}
