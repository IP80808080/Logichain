package com.logichaintwo.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.logichaintwo.dto.InventoryDTO;
import com.logichaintwo.entities.Inventory;
import com.logichaintwo.exception.ResourceNotFoundException;
import com.logichaintwo.repository.InventoryRepository;
import com.logichaintwo.service.IInventoryService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements IInventoryService {
    private final InventoryRepository repo;
    private final ModelMapper mapper;
    private static final int LOW_STOCK_THRESHOLD = 10;

    @Override
    public List<InventoryDTO> getAll() {
        return repo.findAll().stream()
                .map(e -> mapper.map(e, InventoryDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public InventoryDTO getById(Long id) {
        Inventory inventory = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found with id: " + id));
        return mapper.map(inventory, InventoryDTO.class);
    }

    @Override
    public List<InventoryDTO> getByProductId(Long productId) {
        List<Inventory> inventories = repo.findByProductId(productId);
        if (inventories.isEmpty()) {
            throw new ResourceNotFoundException("No inventory found for product id: " + productId);
        }
        return inventories.stream()
                .map(e -> mapper.map(e, InventoryDTO.class))
                .collect(Collectors.toList());
    }
    
    @Override
    public List<InventoryDTO> getLowStock() {
        List<Inventory> lowStockItems = repo.findByQuantityLessThan(LOW_STOCK_THRESHOLD);
        return lowStockItems.stream()
                .map(e -> mapper.map(e, InventoryDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public InventoryDTO save(Inventory inventory) {
        return mapper.map(repo.save(inventory), InventoryDTO.class);
    }

    @Override
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Inventory not found with id: " + id);
        }
        repo.deleteById(id);
    }
}