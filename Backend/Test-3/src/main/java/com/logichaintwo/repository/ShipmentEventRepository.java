package com.logichaintwo.repository;

import com.logichaintwo.entities.ShipmentEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ShipmentEventRepository extends JpaRepository<ShipmentEvent, Long> {
    List<ShipmentEvent> findByShipmentId(Long shipmentId);
}