package com.logichaintwo.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.logichaintwo.dto.WarehouseDTO;
import com.logichaintwo.entities.Warehouse;
import com.logichaintwo.exception.ResourceNotFoundException;
import com.logichaintwo.repository.WarehouseRepository;
import com.logichaintwo.service.IWarehouseService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WarehouseServiceImpl implements IWarehouseService {
    private final WarehouseRepository repo;
    private final ModelMapper mapper;

    public List<WarehouseDTO> getAll() {
        return repo.findAll().stream()
                .map(e -> mapper.map(e, WarehouseDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public WarehouseDTO getById(Long id) {
        Warehouse warehouse = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with id: " + id));
        return mapper.map(warehouse, WarehouseDTO.class);
    }

    @Override
    public WarehouseDTO save(Warehouse warehouse) {
        return mapper.map(repo.save(warehouse), WarehouseDTO.class);
    }

    @Override
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Warehouse not found with id: " + id);
        }
        repo.deleteById(id);
    }
}