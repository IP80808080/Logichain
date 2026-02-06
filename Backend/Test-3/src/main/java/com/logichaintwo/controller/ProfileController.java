package com.logichaintwo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.logichaintwo.dto.ApiResponse;
import com.logichaintwo.dto.ChangePasswordRequest;
import com.logichaintwo.dto.UpdateProfileRequest;
import com.logichaintwo.dto.UserDTO;
import com.logichaintwo.security.JwtUtils;
import com.logichaintwo.service.IUserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
public class ProfileController {
    
    private final IUserService userService;
    private final JwtUtils jwtUtil;

    @GetMapping
    public ResponseEntity<ApiResponse> getCurrentUserProfile(Authentication authentication) {
        try {
            String email = authentication.getName();
            UserDTO user = userService.getByEmail(email);
            return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", user));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to retrieve profile: " + e.getMessage()));
        }
    }

    @PutMapping
    public ResponseEntity<ApiResponse> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request) {
        try {
            String email = authentication.getName();
            UserDTO currentUser = userService.getByEmail(email);
            
            UserDTO updated = userService.updateProfile(currentUser.getId(), request);
            
            return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to update profile: " + e.getMessage()));
        }
    }


    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        try {
            String email = authentication.getName();
            UserDTO currentUser = userService.getByEmail(email);
            
            userService.changePassword(currentUser.getId(), request);
            
            return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to change password: " + e.getMessage()));
        }
    }
}
