package com.logichaintwo.entities;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class OTPData {
    private String otp;
    private LocalDateTime expiresAt;
    private int attempts;
}
