package com.logichaintwo.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.logichaintwo.dto.ApiResponse;
import com.logichaintwo.dto.LoginRequest;
import com.logichaintwo.entities.User;
import com.logichaintwo.service.AuthService;
import com.logichaintwo.service.ExternalLoggerService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    
    private final ExternalLoggerService logger;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody User user) {
        log.info("=== REGISTER REQUEST RECEIVED ===");
        log.info("Username: {}", user.getUsername());
        log.info("Email: {}", user.getEmail());
        log.info("Role: {}", user.getRole());
        
        try {
            Map<String, Object> result = authService.register(user);
            logger.log("INFO", "REGISTER REQUEST RECEIVED: " + user.getUsername());
            String message = (String) result.get("message");
            logger.log("INFO", "Registration successful for user: " + user.getUsername());
            log.info("Registration successful for user: {}", user.getUsername());
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(message, result));
        } catch (IllegalArgumentException e) {
            log.error("Registration failed - validation error: {}", e.getMessage());
            logger.log("ERROR", "Registration validation failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Registration failed - unexpected error", e);
            logger.log("ERROR", "Registration unexpected error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@RequestBody LoginRequest loginRequest) {
        log.info("========================================");
        log.info("=== LOGIN REQUEST RECEIVED ===");
        log.info("Email: {}", loginRequest != null ? loginRequest.getEmail() : "NULL REQUEST");
        log.info("Password present: {}", loginRequest != null && loginRequest.getPassword() != null && !loginRequest.getPassword().isEmpty());
        log.info("========================================");
        
        try {
            if (loginRequest == null) {
                log.error("LoginRequest is NULL!");
                logger.log("ERROR", "LoginRequest is NULL!");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid request body"));
            }
            
            if (loginRequest.getEmail() == null || loginRequest.getEmail().trim().isEmpty()) {
                log.error("Email is null or empty");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Email is required"));
            }
            
            if (loginRequest.getPassword() == null || loginRequest.getPassword().trim().isEmpty()) {
                log.error("Password is null or empty");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Password is required"));
            }

            log.info("Calling authService.login()...");
            logger.log("INFO", "LOGIN REQUEST RECEIVED: " + loginRequest.getEmail());
            Map<String, Object> result = authService.login(
                loginRequest.getEmail(),
                loginRequest.getPassword()
            );
            
            log.info("Login successful for: {}", loginRequest.getEmail());
            log.info("Result keys: {}", result.keySet());
            
            ResponseEntity<ApiResponse> response = ResponseEntity.ok(
                ApiResponse.success("Login successful", result)
            );
            
            log.info("Returning response with status: {}", response.getStatusCode());
            logger.log("INFO", "Login successful for: " + loginRequest.getEmail());
            return response;
            
        } catch (DisabledException e) {
            log.error("Login failed - account disabled: {}", e.getMessage());
            logger.log("ERROR", "Login failed - account disabled: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(e.getMessage()));
        } catch (BadCredentialsException e) {
            log.error("Login failed - bad credentials: {}", e.getMessage());
            logger.log("ERROR", "Login failed - bad credentials: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Invalid email or password"));
        } catch (Exception e) {
            log.error("Login failed - unexpected error", e);
            log.error("Exception class: {}", e.getClass().getName());
            log.error("Exception message: {}", e.getMessage());
            logger.log("ERROR", "Login failed - unexpected error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Login failed: " + e.getMessage()));
        } finally {
            log.info("=== LOGIN REQUEST COMPLETED ===");
        }
    }
    
    // Test endpoint to verify controller is working
    @PostMapping("/test")
    public ResponseEntity<String> test(@RequestBody Map<String, String> body) {
        log.info("TEST endpoint called with body: {}", body);
        logger.log("INFO", "TEST endpoint called with body: " + body);
        return ResponseEntity.ok("Test successful. Received: " + body);
    }
}