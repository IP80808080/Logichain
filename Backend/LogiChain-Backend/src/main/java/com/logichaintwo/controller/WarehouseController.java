package com.logichaintwo.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.logichaintwo.dto.ApiResponse;
import com.logichaintwo.dto.WarehouseDTO;
import com.logichaintwo.entities.Warehouse;
import com.logichaintwo.service.ExternalLoggerService;
import com.logichaintwo.service.IWarehouseService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/warehouses")
@RequiredArgsConstructor
public class WarehouseController {
    private final IWarehouseService service;
    
    private final ExternalLoggerService logger;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WAREHOUSE_MANAGER')")
    public ResponseEntity<ApiResponse> getAll() {
    	logger.log("INFO", "Fetching all warehouses");
        List<WarehouseDTO> warehouses = service.getAll();
        logger.log("INFO", "Retrieved " + warehouses.size() + " warehouses");
        return ResponseEntity.ok(ApiResponse.success("Warehouses retrieved successfully", warehouses));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WAREHOUSE_MANAGER')")
    public ResponseEntity<ApiResponse> getById(@PathVariable Long id) {
    	logger.log("INFO", "Fetching warehouse with ID: " + id);
        WarehouseDTO warehouse = service.getById(id);
        logger.log("INFO", "Warehouse retrieved: " + (warehouse != null ? warehouse.getName() : "NULL"));
        return ResponseEntity.ok(ApiResponse.success("Warehouse retrieved successfully", warehouse));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse> create(@Valid @RequestBody Warehouse warehouse) {
    	logger.log("INFO", "Creating warehouse: " + warehouse.getName());
        WarehouseDTO created = service.save(warehouse);
        logger.log("INFO", "Warehouse created successfully: " + created.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Warehouse created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse> update(@PathVariable Long id, @Valid @RequestBody Warehouse warehouse) {
    	 logger.log("INFO", "Updating warehouse ID: " + id);
        warehouse.setId(id);
        WarehouseDTO updated = service.save(warehouse);
        logger.log("INFO", "Warehouse updated successfully: " + updated.getId());
        return ResponseEntity.ok(ApiResponse.success("Warehouse updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse> delete(@PathVariable Long id) {
    	 logger.log("INFO", "Deleting warehouse ID: " + id);
        service.delete(id);
        logger.log("INFO", "Warehouse deleted successfully: " + id);
        return ResponseEntity.ok(ApiResponse.success("Warehouse deleted successfully"));
    }
}