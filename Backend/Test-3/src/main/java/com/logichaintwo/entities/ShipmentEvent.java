package com.logichaintwo.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

import com.logichaintwo.enums.EventType;

@Entity
@Data
public class ShipmentEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long shipmentId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EventType eventType;

    private String location;
    private Double latitude;
    private Double longitude;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private LocalDateTime eventTimestamp = LocalDateTime.now();
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @ManyToOne
    @JoinColumn(name = "shipmentId", insertable = false, updatable = false)
    private Shipment shipment;
}
