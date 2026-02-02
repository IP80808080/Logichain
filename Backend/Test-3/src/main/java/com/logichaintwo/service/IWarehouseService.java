package com.logichaintwo.service;

import com.logichaintwo.dto.WarehouseDTO;
import com.logichaintwo.entities.Warehouse;
import java.util.List;

public interface IWarehouseService {
    List<WarehouseDTO> getAll();
    WarehouseDTO getById(Long id);
    WarehouseDTO save(Warehouse warehouse);
    void delete(Long id);
}