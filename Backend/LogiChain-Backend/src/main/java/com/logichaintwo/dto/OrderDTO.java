package com.logichaintwo.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.logichaintwo.enums.OrderStatus;
import com.logichaintwo.enums.PaymentStatus;

import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {
	private Long id;

	@NotBlank(message = "Order number is required")
	private String orderNumber;

	@NotNull(message = "Customer ID is required")
	@Positive(message = "Customer ID must be positive")
	private Long customerId;

	@NotNull(message = "Order status is required")
	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private OrderStatus orderStatus;

	@NotNull(message = "Payment status is required")
	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private PaymentStatus paymentStatus;

	@NotNull(message = "Total amount is required")
	@DecimalMin(value = "0.01", message = "Total amount must be greater than 0")
	private BigDecimal totalAmount;

	@NotBlank(message = "Shipping address is required")
	private String shippingAddress;

	@NotBlank(message = "Billing address is required")
	private String billingAddress;

	private LocalDateTime orderDate;

	private LocalDateTime createdAt;

	private CustomerInfo customer;

	@Data
	@Builder
	@NoArgsConstructor
	@AllArgsConstructor
	public static class CustomerInfo {
		private Long id;
		private String username;
		private String email;
		private String phone;
	}
}