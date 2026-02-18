package com.logichaintwo.service;

import com.logichaintwo.dto.ShipmentDTO;
import com.logichaintwo.entities.Shipment;
import java.util.List;

public interface IShipmentService {
    List<ShipmentDTO> getAll();
    ShipmentDTO getById(Long id);
    ShipmentDTO save(Shipment shipment);
    void delete(Long id);
    ShipmentDTO findByTrackingNumber(String trackingNumber);
}