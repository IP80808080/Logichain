package com.logichaintwo.service;

import com.logichaintwo.dto.InventoryDTO;
import com.logichaintwo.entities.Inventory;
import java.util.List;

public interface IInventoryService {
    List<InventoryDTO> getAll();
    InventoryDTO getById(Long id);
    List<InventoryDTO> getByProductId(Long productId);
    InventoryDTO save(Inventory inventory);
    void delete(Long id);
    List<InventoryDTO> getLowStock();
}