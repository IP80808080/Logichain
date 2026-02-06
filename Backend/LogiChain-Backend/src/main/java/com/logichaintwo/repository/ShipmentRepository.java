package com.logichaintwo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.logichaintwo.entities.Shipment;

public interface ShipmentRepository extends JpaRepository<Shipment, Long> {
    Shipment findByOrderId(Long orderId);
    boolean existsByOrderId(Long orderId);
    Optional<Shipment> findByTrackingNumber(String trackingNumber);
}