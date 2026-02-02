package com.logichaintwo.entities;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ResetTokenData {
    private String token;
    private LocalDateTime expiresAt;
}
