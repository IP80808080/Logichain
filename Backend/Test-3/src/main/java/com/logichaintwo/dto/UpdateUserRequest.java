package com.logichaintwo.dto;

import com.logichaintwo.enums.ApprovalStatus;
import com.logichaintwo.enums.Role;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @Email(message = "Invalid email format")
    private String email;

    @Enumerated(EnumType.STRING)
    private Role role;

    private String phone;

    // Password is optional for updates
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    // Approval fields
    @Enumerated(EnumType.STRING)
    private ApprovalStatus approvalStatus;

    private String rejectionReason;
}