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
import com.logichaintwo.dto.ReturnDTO;
import com.logichaintwo.entities.Return;
import com.logichaintwo.service.ExternalLoggerService;
import com.logichaintwo.service.IReturnService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/returns")
@RequiredArgsConstructor
public class ReturnController {
	private final IReturnService service;

	private final ExternalLoggerService logger;

	@GetMapping
	@PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER_SUPPORT', 'CUSTOMER')")
	public ResponseEntity<ApiResponse> getAll() {
		logger.log("INFO", "Fetching all returns");
		List<ReturnDTO> returns = service.getAll();
		logger.log("INFO", "Successfully retrieved all returns: count=" + returns.size());
		return ResponseEntity.ok(ApiResponse.success("Returns retrieved successfully", returns));
	}

	@GetMapping("/{id}")
	@PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER_SUPPORT', 'CUSTOMER')")
	public ResponseEntity<ApiResponse> getById(@PathVariable Long id) {
		logger.log("INFO", "Fetching return with ID=" + id);
		ReturnDTO returnEntity = service.getById(id);
		logger.log("INFO", "Successfully retrieved return ID=" + id);
		return ResponseEntity.ok(ApiResponse.success("Return retrieved successfully", returnEntity));
	}

	@PostMapping
	@PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
	public ResponseEntity<ApiResponse> create(@Valid @RequestBody Return returnEntity) {
		logger.log("INFO", "Creating new return for product/order: " + returnEntity);
		ReturnDTO created = service.save(returnEntity);
		logger.log("INFO", "Return created successfully: ID=" + created.getId());
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.success("Return created successfully", created));
	}

	@PutMapping("/{id}")
	@PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER_SUPPORT')")
	public ResponseEntity<ApiResponse> update(@PathVariable Long id, @Valid @RequestBody Return returnEntity) {
		logger.log("INFO", "Updating return ID=" + id);
		returnEntity.setId(id);
		ReturnDTO updated = service.save(returnEntity);
		logger.log("INFO", "Return updated successfully: ID=" + id);
		return ResponseEntity.ok(ApiResponse.success("Return updated successfully", updated));
	}

	@DeleteMapping("/{id}")
	@PreAuthorize("hasAuthority('ADMIN')")
	public ResponseEntity<ApiResponse> delete(@PathVariable Long id) {
		logger.log("INFO", "Deleting return ID=" + id);
		service.delete(id);
		logger.log("INFO", "Return deleted successfully: ID=" + id);
		return ResponseEntity.ok(ApiResponse.success("Return deleted successfully"));
	}
}