package com.logichaintwo.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.logichaintwo.enums.ReturnStatus;

import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReturnDTO {
	private Long id;

	@NotNull(message = "Order ID is required")
	@Positive(message = "Order ID must be positive")
	private Long orderId;

	@NotBlank(message = "Return number is required")
	private String returnNumber;

	@NotNull(message = "Return status is required")
	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private ReturnStatus returnStatus;

	@NotBlank(message = "Reason is required")
	@Size(min = 10, max = 500, message = "Reason must be between 10 and 500 characters")
	private String reason;

	@NotNull(message = "Refund amount is required")
	@DecimalMin(value = "0.01", message = "Refund amount must be greater than 0")
	private BigDecimal refundAmount;
	
	private Long processedBy;
    private LocalDateTime processedAt;
    private String processingNotes;
    private LocalDateTime updatedAt;

    private LocalDateTime requestedAt;
    private LocalDateTime createdAt;
	
	private OrderDTO order;
	
	
}