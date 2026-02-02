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
import com.logichaintwo.dto.InventoryDTO;
import com.logichaintwo.entities.Inventory;
import com.logichaintwo.service.ExternalLoggerService;
import com.logichaintwo.service.IInventoryService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
public class InventoryController {
	private final IInventoryService service;

	private final ExternalLoggerService logger;

	@GetMapping
	@PreAuthorize("hasAnyAuthority('ADMIN', 'WAREHOUSE_MANAGER', 'PRODUCT_MANAGER')")
	public ResponseEntity<ApiResponse> getAll() {
		logger.log("INFO", "Fetching all inventory items");
		List<InventoryDTO> inventory = service.getAll();
		logger.log("INFO", "Inventory retrieved successfully, count: " + inventory.size());
		return ResponseEntity.ok(ApiResponse.success("Inventory retrieved successfully", inventory));
	}

	@GetMapping("/{id}")
	@PreAuthorize("hasAnyAuthority('ADMIN', 'WAREHOUSE_MANAGER', 'PRODUCT_MANAGER')")
	public ResponseEntity<ApiResponse> getById(@PathVariable Long id) {
		logger.log("INFO", "Fetching inventory by ID: " + id);
		InventoryDTO inventory = service.getById(id);
		logger.log("INFO", "Inventory retrieved successfully for ID: " + id);
		return ResponseEntity.ok(ApiResponse.success("Inventory retrieved successfully", inventory));
	}

	@GetMapping("/low-stock")
	@PreAuthorize("hasAnyAuthority('ADMIN', 'WAREHOUSE_MANAGER', 'PRODUCT_MANAGER')")
	public ResponseEntity<ApiResponse> getLowStock() {
		logger.log("INFO", "Fetching low-stock inventory items");
		List<InventoryDTO> lowStockItems = service.getLowStock();
		logger.log("INFO", "Low stock inventory retrieved, count: " + lowStockItems.size());
		return ResponseEntity.ok(ApiResponse.success("Low stock inventory retrieved", lowStockItems));
	}

	@GetMapping("/product/{productId}")
	@PreAuthorize("hasAnyAuthority('ADMIN', 'WAREHOUSE_MANAGER', 'PRODUCT_MANAGER')")
	public ResponseEntity<ApiResponse> getByProduct(@PathVariable Long productId) {
		logger.log("INFO", "Fetching inventory by product ID: " + productId);
		List<InventoryDTO> inventory = service.getByProductId(productId);
		logger.log("INFO",
				"Inventory retrieved successfully for product ID: " + productId + ", count: " + inventory.size());
		return ResponseEntity.ok(ApiResponse.success("Inventory retrieved successfully", inventory));
	}

	@PostMapping
	@PreAuthorize("hasAnyAuthority('ADMIN', 'WAREHOUSE_MANAGER', 'PRODUCT_MANAGER')")
	public ResponseEntity<ApiResponse> create(@Valid @RequestBody Inventory inventory) {
		logger.log("INFO", "Creating inventory for product ID: " + inventory.getProductId());
		InventoryDTO created = service.save(inventory);
		logger.log("INFO", "Inventory created successfully for product ID: " + inventory.getProductId());
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.success("Inventory created successfully", created));
	}

	@PutMapping("/{id}")
	@PreAuthorize("hasAnyAuthority('ADMIN', 'WAREHOUSE_MANAGER', 'PRODUCT_MANAGER')")
	public ResponseEntity<ApiResponse> update(@PathVariable Long id, @Valid @RequestBody Inventory inventory) {
		logger.log("INFO", "Updating inventory ID: " + id);
		inventory.setId(id);
		InventoryDTO updated = service.save(inventory);
		logger.log("INFO", "Inventory updated successfully for ID: " + id);
		return ResponseEntity.ok(ApiResponse.success("Inventory updated successfully", updated));
	}

	@DeleteMapping("/{id}")
	@PreAuthorize("hasAnyAuthority('ADMIN', 'WAREHOUSE_MANAGER')")
	public ResponseEntity<ApiResponse> delete(@PathVariable Long id) {
		logger.log("INFO", "Deleting inventory ID: " + id);
		service.delete(id);
		logger.log("INFO", "Inventory deleted successfully for ID: " + id);
		return ResponseEntity.ok(ApiResponse.success("Inventory deleted successfully"));
	}
}