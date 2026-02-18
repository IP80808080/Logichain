package com.logichaintwo.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.logichaintwo.dto.ApiResponse;
import com.logichaintwo.dto.OTPRequest;
import com.logichaintwo.dto.OTPVerifyRequest;
import com.logichaintwo.dto.ResetPasswordRequest;
import com.logichaintwo.entities.User;
import com.logichaintwo.repository.UserRepository;
import com.logichaintwo.service.EmailService;
import com.logichaintwo.service.OTPService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class PasswordResetController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private OTPService otpService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse> forgotPassword(@Valid @RequestBody OTPRequest request) {
        try {
            String email = request.getEmail();

            Optional<User> userOpt = userRepository.findByEmail(email);
            if (!userOpt.isPresent()) {
                return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("User not found"));
            }

            String otp = otpService.generateOTP();
            otpService.storeOTP(email, otp);
            emailService.sendOTPEmail(email, otp);

            return ResponseEntity.ok(ApiResponse.success("OTP sent to your email"));

        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Error sending OTP: " + e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse> verifyOTP(@Valid @RequestBody OTPVerifyRequest request) {
        try {
            String email = request.getEmail();
            String otp = request.getOtp();

            boolean isValid = otpService.verifyOTP(email, otp);

            if (!isValid) {
                return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid or expired OTP"));
            }

            String resetToken = otpService.generateResetToken(email);

            Map<String, String> data = new HashMap<>();
            data.put("resetToken", resetToken);

            return ResponseEntity.ok(ApiResponse.success("OTP verified", data));

        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Error verifying OTP"));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            String email = request.getEmail();
            String resetToken = request.getResetToken();
            String newPassword = request.getNewPassword();

            boolean isValid = otpService.verifyResetToken(email, resetToken);

            if (!isValid) {
                return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid or expired token"));
            }

            Optional<User> userOpt = userRepository.findByEmail(email);
            if (!userOpt.isPresent()) {
                return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("User not found"));
            }

            User user = userOpt.get();
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);

            otpService.clearResetToken(email);

            return ResponseEntity.ok(ApiResponse.success("Password reset successful"));

        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Error resetting password"));
        }
    }
}