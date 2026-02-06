package com.logichaintwo.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.logichaintwo.dto.ApiResponse;
import com.logichaintwo.dto.OrderDTO;
import com.logichaintwo.entities.Order;
import com.logichaintwo.service.ExternalLoggerService;
import com.logichaintwo.service.IOrderService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {
	private final IOrderService service;

	private final ExternalLoggerService logger;

	@GetMapping
	@PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER_SUPPORT', 'WAREHOUSE_MANAGER')")
	public ResponseEntity<ApiResponse> getAll() {
		logger.log("INFO", "Fetching all orders");
		List<OrderDTO> orders = service.getAll();
		logger.log("INFO", "Retrieved " + orders.size() + " orders");
		return ResponseEntity.ok(ApiResponse.success("Orders retrieved successfully", orders));
	}

	@GetMapping("/{id}")
	@PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER_SUPPORT', 'WAREHOUSE_MANAGER', 'CUSTOMER')")
	public ResponseEntity<ApiResponse> getById(@PathVariable Long id) {
		logger.log("INFO", "Fetching order by ID: " + id);
		OrderDTO order = service.getById(id);
		logger.log("INFO", "Order retrieved: " + (order != null ? order.getId() : "NULL"));
		return ResponseEntity.ok(ApiResponse.success("Order retrieved successfully", order));
	}

	@GetMapping("/customer/{customerId}")
	@PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER_SUPPORT', 'CUSTOMER')")
	public ResponseEntity<ApiResponse> getByCustomer(@PathVariable Long customerId) {
		logger.log("INFO", "Fetching orders for customer ID: " + customerId);
		List<OrderDTO> orders = service.getByCustomerId(customerId);
		logger.log("INFO", "Retrieved " + orders.size() + " orders for customer " + customerId);
		return ResponseEntity.ok(ApiResponse.success("Orders retrieved successfully", orders));
	}

	@PostMapping
	@PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
	public ResponseEntity<ApiResponse> create(@Valid @RequestBody Order order) {
		logger.log("INFO", "Creating new order for customer ID: " + order.getCustomerId());
		OrderDTO created = service.save(order);
		logger.log("INFO",
				"Order created successfully with ID: " + created.getId() + " for customer: " + created.getCustomerId());
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.success("Order created successfully", created));
	}

	@PutMapping("/{id}")
	@PreAuthorize("hasAnyAuthority('ADMIN', 'WAREHOUSE_MANAGER')")
	public ResponseEntity<ApiResponse> update(@PathVariable Long id, @Valid @RequestBody Order order) {
		logger.log("INFO", "Updating order ID: " + id);
		order.setId(id);
		OrderDTO updated = service.save(order);
		logger.log("INFO", "Order updated: " + updated.getId());
		return ResponseEntity.ok(ApiResponse.success("Order updated successfully", updated));
	}

	@PatchMapping("/{id}/status")
	@PreAuthorize("hasAnyAuthority('ADMIN', 'WAREHOUSE_MANAGER', 'CUSTOMER_SUPPORT')")
	public ResponseEntity<ApiResponse> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> statusMap) {
		String newStatus = statusMap.get("status");
		logger.log("INFO", "Updating status of order ID " + id + " to " + newStatus);
		OrderDTO updated = service.updateStatus(id, newStatus);
		logger.log("INFO", "Order status updated for ID: " + updated.getId() + " -> " + newStatus);
		return ResponseEntity.ok(ApiResponse.success("Order status updated successfully", updated));
	}

	@DeleteMapping("/{id}")
	@PreAuthorize("hasAuthority('ADMIN')")
	public ResponseEntity<ApiResponse> delete(@PathVariable Long id) {
		logger.log("INFO", "Deleting order ID: " + id);
		service.delete(id);
		logger.log("INFO", "Order deleted ID: " + id);
		return ResponseEntity.ok(ApiResponse.success("Order deleted successfully"));
	}
}