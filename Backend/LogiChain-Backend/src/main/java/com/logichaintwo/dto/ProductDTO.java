package com.logichaintwo.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
	private Long id;

	@NotBlank(message = "SKU is required")
	@Size(min = 2, max = 50, message = "SKU must be between 2 and 50 characters")
	private String sku;

	@NotBlank(message = "Product name is required")
	@Size(min = 2, max = 200, message = "Product name must be between 2 and 200 characters")
	private String name;

	@NotNull(message = "Price is required")
	@DecimalMin(value = "0.01", message = "Price must be greater than 0")
	private BigDecimal price;

	@NotNull(message = "Weight is required")
	@DecimalMin(value = "0.01", message = "Weight must be greater than 0")
	private Double weight;
	private String category;
	private String imageUrl;

	private Long createdBy;

	private String createdByName;
	
	private Integer totalStock = 0;
    private Integer availableStock = 0;
    private Integer reservedStock = 0;


	private LocalDateTime createdAt;

	private LocalDateTime updatedAt;
}