package com.logichaintwo.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.logichaintwo.dto.CarrierDTO;
import com.logichaintwo.entities.Carrier;
import com.logichaintwo.exception.ResourceNotFoundException;
import com.logichaintwo.repository.CarrierRepository;
import com.logichaintwo.service.ICarrierService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CarrierServiceImpl implements ICarrierService {
    private final CarrierRepository repo;
    private final ModelMapper mapper;

    @Override
    public List<CarrierDTO> getAll() {
        return repo.findAll().stream()
                .map(e -> mapper.map(e, CarrierDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public CarrierDTO getById(Long id) {
        Carrier carrier = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Carrier not found with id: " + id));
        return mapper.map(carrier, CarrierDTO.class);
    }

    @Override
    public CarrierDTO save(Carrier carrier) {
        return mapper.map(repo.save(carrier), CarrierDTO.class);
    }

    @Override
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Carrier not found with id: " + id);
        }
        repo.deleteById(id);
    }
}