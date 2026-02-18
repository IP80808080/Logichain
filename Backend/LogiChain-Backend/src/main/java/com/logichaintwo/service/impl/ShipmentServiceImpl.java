package com.logichaintwo.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.logichaintwo.dto.ShipmentDTO;
import com.logichaintwo.entities.Shipment;
import com.logichaintwo.exception.ResourceNotFoundException;
import com.logichaintwo.repository.ShipmentRepository;
import com.logichaintwo.service.IShipmentService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ShipmentServiceImpl implements IShipmentService {
    private final ShipmentRepository repo;
    private final ModelMapper mapper;

    public List<ShipmentDTO> getAll() {
        return repo.findAll().stream()
                .map(e -> mapper.map(e, ShipmentDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public ShipmentDTO getById(Long id) {
        Shipment shipment = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with id: " + id));
        return mapper.map(shipment, ShipmentDTO.class);
    }
    
    @Override
    public ShipmentDTO findByTrackingNumber(String trackingNumber) {
        Shipment shipment = repo.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with tracking number: " + trackingNumber));
        return mapper.map(shipment, ShipmentDTO.class);
    }

    @Override
    public ShipmentDTO save(Shipment shipment) {
        return mapper.map(repo.save(shipment), ShipmentDTO.class);
    }

    @Override
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Shipment not found with id: " + id);
        }
        repo.deleteById(id);
    }
}