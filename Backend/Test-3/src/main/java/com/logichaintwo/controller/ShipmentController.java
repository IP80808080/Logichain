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
import com.logichaintwo.dto.ShipmentDTO;
import com.logichaintwo.entities.Shipment;
import com.logichaintwo.service.ExternalLoggerService;
import com.logichaintwo.service.IShipmentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/shipments")
@RequiredArgsConstructor
public class ShipmentController {
	private final IShipmentService service;

	private final ExternalLoggerService logger;

	@GetMapping
	@PreAuthorize("hasAnyAuthority('ADMIN', 'WAREHOUSE_MANAGER', 'CUSTOMER_SUPPORT')")
	public ResponseEntity<ApiResponse> getAll() {
		logger.log("INFO", "GET /shipments called to retrieve all shipments");
		List<ShipmentDTO> shipments = service.getAll();
		logger.log("INFO", "Retrieved " + shipments.size() + " shipments");
		return ResponseEntity.ok(ApiResponse.success("Shipments retrieved successfully", shipments));
	}

	@GetMapping("/{id}")
	@PreAuthorize("hasAnyAuthority('ADMIN', 'WAREHOUSE_MANAGER', 'CUSTOMER_SUPPORT', 'CUSTOMER')")
	public ResponseEntity<ApiResponse> getById(@PathVariable Long id) {
		logger.log("INFO", "GET /shipments/" + id + " called");
		ShipmentDTO shipment = service.getById(id);
		logger.log("INFO", "Shipment retrieved: ID " + shipment.getId());
		return ResponseEntity.ok(ApiResponse.success("Shipment retrieved successfully", shipment));
	}

	@GetMapping("/track/{trackingNumber}")
	@PreAuthorize("hasAnyAuthority('ADMIN', 'WAREHOUSE_MANAGER', 'CUSTOMER_SUPPORT', 'CUSTOMER')")
	public ResponseEntity<ApiResponse> trackShipment(@PathVariable String trackingNumber) {
		logger.log("INFO", "GET /shipments/track/" + trackingNumber + " called");
		ShipmentDTO shipment = service.findByTrackingNumber(trackingNumber);
		logger.log("INFO", "Tracking details retrieved for: " + trackingNumber);
		return ResponseEntity.ok(ApiResponse.success("Shipment tracking details retrieved", shipment));
	}

	@PostMapping
	@PreAuthorize("hasAnyAuthority('ADMIN', 'WAREHOUSE_MANAGER')")
	public ResponseEntity<ApiResponse> create(@Valid @RequestBody Shipment shipment) {
		logger.log("INFO", "POST /shipments called to create shipment: " + shipment.getTrackingNumber());
		ShipmentDTO created = service.save(shipment);
		logger.log("INFO", "Shipment created: ID " + created.getId());
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.success("Shipment created successfully", created));
	}

	@PutMapping("/{id}")
	@PreAuthorize("hasAnyAuthority('ADMIN', 'WAREHOUSE_MANAGER')")
	public ResponseEntity<ApiResponse> update(@PathVariable Long id, @Valid @RequestBody Shipment shipment) {
		logger.log("INFO", "PUT /shipments/" + id + " called to update shipment");
		shipment.setId(id);
		ShipmentDTO updated = service.save(shipment);
		logger.log("INFO", "Shipment updated: ID " + updated.getId());
		return ResponseEntity.ok(ApiResponse.success("Shipment updated successfully", updated));
	}

	@DeleteMapping("/{id}")
	@PreAuthorize("hasAuthority('ADMIN')")
	public ResponseEntity<ApiResponse> delete(@PathVariable Long id) {
		logger.log("INFO", "DELETE /shipments/" + id + " called");
		service.delete(id);
		logger.log("INFO", "Shipment deleted: ID " + id);
		return ResponseEntity.ok(ApiResponse.success("Shipment deleted successfully"));
	}
}