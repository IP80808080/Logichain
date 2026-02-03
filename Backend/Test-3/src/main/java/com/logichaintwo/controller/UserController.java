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
import com.logichaintwo.dto.CreateUserRequest;
import com.logichaintwo.dto.UpdateUserRequest;
import com.logichaintwo.dto.UserDTO;
import com.logichaintwo.service.ExternalLoggerService;
import com.logichaintwo.service.IUserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    private final IUserService service;
    
    private final ExternalLoggerService logger;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER_SUPPORT', 'WAREHOUSE_MANAGER')")
    public ResponseEntity<ApiResponse> getAll() {
        try {
            logger.log("INFO", "Fetching all users");
            List<UserDTO> users = service.getAll();
            logger.log("INFO", "Successfully retrieved " + users.size() + " users");
            return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
        } catch (Exception e) {
            logger.log("ERROR", "Failed to fetch all users: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve users: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER_SUPPORT')")
    public ResponseEntity<ApiResponse> getById(@PathVariable Long id) {
        try {
            logger.log("INFO", "Fetching user by ID: " + id);
            UserDTO user = service.getById(id);
            logger.log("INFO", "Successfully retrieved user: " + user.getUsername());
            return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", user));
        } catch (Exception e) {
            logger.log("ERROR", "Failed to fetch user by ID " + id + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve user: " + e.getMessage()));
        }
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse> create(@Valid @RequestBody CreateUserRequest request) {
        try {
            logger.log("INFO", "Creating new user: " + request.getUsername());
            UserDTO created = service.createUser(request);
            logger.log("INFO", "User created successfully: " + created.getUsername());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("User created successfully", created));
        } catch (Exception e) {
            logger.log("ERROR", "Failed to create user " + request.getUsername() + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create user: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse> update(@PathVariable Long id, @Valid @RequestBody UpdateUserRequest request) {
        try {
            logger.log("INFO", "Updating user ID: " + id);
            UserDTO updated = service.updateUser(id, request);
            logger.log("INFO", "User updated successfully: " + updated.getUsername());
            return ResponseEntity.ok(ApiResponse.success("User updated successfully", updated));
        } catch (Exception e) {
            logger.log("ERROR", "Failed to update user ID " + id + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update user: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse> delete(@PathVariable Long id) {
        try {
            logger.log("INFO", "Deleting user ID: " + id);
            service.delete(id);
            logger.log("INFO", "User deleted successfully: ID " + id);
            return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
        } catch (Exception e) {
            logger.log("ERROR", "Failed to delete user ID " + id + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete user: " + e.getMessage()));
        }
    }
}