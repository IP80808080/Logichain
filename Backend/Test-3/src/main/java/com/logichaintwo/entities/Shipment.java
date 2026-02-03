package com.logichaintwo.entities;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.logichaintwo.enums.ShipmentStatus;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Entity
@Data
public class Shipment {
	 @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private Long id;

	    @NotBlank(message = "Tracking number is required")
	    @Column(unique = true, nullable = false)
	    private String trackingNumber;

	    @NotNull(message = "Order ID is required")
	    @Column(unique = true, nullable = false)
	    private Long orderId;

	    @NotNull(message = "Carrier ID is required")
	    @Column(nullable = false)
	    private Long carrierId;

	    @NotNull(message = "Shipment status is required")
	    @Enumerated(EnumType.STRING)
	    @Column(nullable = false, length = 30)
	    private ShipmentStatus shipmentStatus;

	    private String currentLocation;
	    private LocalDateTime estimatedDeliveryDate;
	    private LocalDateTime actualDeliveryDate;
	    private LocalDateTime createdAt = LocalDateTime.now();

	    @OneToOne
	    @JoinColumn(name = "orderId", insertable = false, updatable = false)
	    private Order order;

	    @ManyToOne
	    @JoinColumn(name = "carrierId", insertable = false, updatable = false)
	    private Carrier carrier;
	    
	    @OneToMany(mappedBy = "shipment", cascade = CascadeType.ALL, orphanRemoval = true)
	    private List<Notification> notifications = new ArrayList<>();
}
