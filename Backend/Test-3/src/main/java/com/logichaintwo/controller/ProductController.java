package com.logichaintwo.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.logichaintwo.dto.ApiResponse;
import com.logichaintwo.dto.ProductDTO;
import com.logichaintwo.entities.Product;
import com.logichaintwo.exception.ResourceNotFoundException;
import com.logichaintwo.security.UserPrincipal;
import com.logichaintwo.service.ExternalLoggerService;
import com.logichaintwo.service.IProductService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {
    private final IProductService service;
    private final ExternalLoggerService logger;

    @GetMapping
    public ResponseEntity<ApiResponse> getAll() {
        logger.log("INFO", "Fetching all products");
        List<ProductDTO> products = service.getAll();
        logger.log("INFO", "Retrieved " + products.size() + " products");
        return ResponseEntity.ok(ApiResponse.success("Products retrieved successfully", products));
    }
    
    @GetMapping("/my")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'PRODUCT_MANAGER', 'WAREHOUSE_MANAGER')")
    public ResponseEntity<ApiResponse> getMyProducts(@AuthenticationPrincipal UserPrincipal principal) {
        Long userId = Long.parseLong(principal.getUserId());
        List<ProductDTO> products = service.getByCreatedBy(userId);
        
        return ResponseEntity.ok(ApiResponse.success("Success", products));
    }
    
    @GetMapping("/manager/{managerId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WAREHOUSE_MANAGER')")
    public ResponseEntity<ApiResponse> getProductsByManagerId(
            @PathVariable Long managerId,
            @AuthenticationPrincipal UserPrincipal principal) {
        
        Long currentUserId = Long.parseLong(principal.getUserId());
        logger.log("INFO", "ADMIN user " + currentUserId + " requesting products for manager ID: " + managerId);
        
        try {

            List<ProductDTO> products = service.getByCreatedBy(managerId);
            logger.log("INFO", "Retrieved " + products.size() + " products for manager " + managerId);
            return ResponseEntity.ok(ApiResponse.success(
                "Products for manager ID " + managerId + " retrieved successfully", 
                products
            ));
        } catch (ResourceNotFoundException e) {
            logger.log("WARN", "Manager ID " + managerId + " not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Manager not found"));
        } catch (Exception e) {
            logger.log("ERROR", "Error fetching products for manager " + managerId + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve products"));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getById(@PathVariable Long id) {
        logger.log("INFO", "Fetching product with ID: " + id);
        ProductDTO product = service.getById(id);
        if (product == null) {
            logger.log("WARN", "Product not found with ID: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Product not found"));
        }
        logger.log("INFO", "Product retrieved: " + product.getName());
        return ResponseEntity.ok(ApiResponse.success("Product retrieved successfully", product));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'PRODUCT_MANAGER')")
    public ResponseEntity<ApiResponse> create(@Valid @RequestBody Product product, @AuthenticationPrincipal UserPrincipal principal) {
        logger.log("INFO", "Creating new product: " + product.getName());
        Long currentUserId = Long.parseLong(principal.getUserId());
        product.setCreatedBy(currentUserId);
        logger.log("INFO", "Creating new product: " + product.getName() + " for user: " + currentUserId);
        ProductDTO created = service.save(product);
        logger.log("INFO", "Product created with ID: " + created.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Product created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'PRODUCT_MANAGER')")
    public ResponseEntity<ApiResponse> update(@PathVariable Long id, @Valid @RequestBody Product product) {
        logger.log("INFO", "Updating product with ID: " + id);
        product.setId(id);
        ProductDTO updated = service.save(product);
        logger.log("INFO", "Product updated: " + updated.getName());
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'PRODUCT_MANAGER')")
    public ResponseEntity<ApiResponse> delete(@PathVariable Long id) {
        logger.log("INFO", "Deleting product with ID: " + id);
        service.delete(id);
        logger.log("INFO", "Product deleted with ID: " + id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully"));
    }
}