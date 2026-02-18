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
import com.logichaintwo.dto.CarrierDTO;
import com.logichaintwo.entities.Carrier;
import com.logichaintwo.service.ExternalLoggerService;
import com.logichaintwo.service.ICarrierService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/carriers")
@RequiredArgsConstructor
public class CarrierController {
	private final ICarrierService service;

	private final ExternalLoggerService logger;

	@GetMapping
	@PreAuthorize("hasAnyAuthority('ADMIN', 'WAREHOUSE_MANAGER')")
	public ResponseEntity<ApiResponse> getAll() {
		logger.log("INFO", "Fetching all carriers");
		List<CarrierDTO> carriers = service.getAll();
		logger.log("INFO", "Fetched " + carriers.size() + " carriers successfully");
		return ResponseEntity.ok(ApiResponse.success("Carriers retrieved successfully", carriers));
	}

	@GetMapping("/{id}")
	@PreAuthorize("hasAnyAuthority('ADMIN', 'WAREHOUSE_MANAGER')")
	public ResponseEntity<ApiResponse> getById(@PathVariable Long id) {
		logger.log("INFO", "Fetching carrier with ID: " + id);
		CarrierDTO carrier = service.getById(id);
		if (carrier != null) {
			logger.log("INFO", "Carrier retrieved successfully: ID " + id);
			return ResponseEntity.ok(ApiResponse.success("Carrier retrieved successfully", carrier));
		} else {
			logger.log("ERROR", "Carrier not found: ID " + id);
			return ResponseEntity.status(HttpStatus.NOT_FOUND)
					.body(ApiResponse.error("Carrier not found with ID: " + id));
		}
	}

	@PostMapping
	@PreAuthorize("hasAuthority('ADMIN')")
	public ResponseEntity<ApiResponse> create(@Valid @RequestBody Carrier carrier) {
		logger.log("INFO", "Creating new carrier: " + carrier.getCarrierName());
		CarrierDTO created = service.save(carrier);
		logger.log("INFO", "Carrier created successfully: ID " + created.getId());
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.success("Carrier created successfully", created));
	}

	@PutMapping("/{id}")
	@PreAuthorize("hasAuthority('ADMIN')")
	public ResponseEntity<ApiResponse> update(@PathVariable Long id, @Valid @RequestBody Carrier carrier) {
		logger.log("INFO", "Updating carrier ID: " + id);
		carrier.setId(id);
		CarrierDTO updated = service.save(carrier);
		logger.log("INFO", "Carrier updated successfully: ID " + updated.getId());
		return ResponseEntity.ok(ApiResponse.success("Carrier updated successfully", updated));
	}

	@DeleteMapping("/{id}")
	@PreAuthorize("hasAuthority('ADMIN')")
	public ResponseEntity<ApiResponse> delete(@PathVariable Long id) {
		logger.log("INFO", "Deleting carrier ID: " + id);
		service.delete(id);
		logger.log("INFO", "Carrier deleted successfully: ID " + id);
		return ResponseEntity.ok(ApiResponse.success("Carrier deleted successfully"));
	}
}