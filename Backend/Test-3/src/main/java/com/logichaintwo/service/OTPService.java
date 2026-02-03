package com.logichaintwo.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.logichaintwo.entities.OTPData;
import com.logichaintwo.entities.ResetTokenData;

@Service
public class OTPService {

    @Value("${otp.expiration.minutes:5}")
    private int otpExpirationMinutes;

    @Value("${reset.token.expiration.minutes:15}")
    private int resetTokenExpirationMinutes;

    private final Map<String, OTPData> otpStore = new ConcurrentHashMap<>();
    private final Map<String, ResetTokenData> resetTokenStore = new ConcurrentHashMap<>();

    public String generateOTP() {
        SecureRandom random = new SecureRandom();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    public void storeOTP(String email, String otp) {
        OTPData otpData = new OTPData(
            otp,
            LocalDateTime.now().plusMinutes(otpExpirationMinutes),
            0
        );
        otpStore.put(email, otpData);
    }

    public boolean verifyOTP(String email, String otp) {
        OTPData otpData = otpStore.get(email);

        if (otpData == null) {
            return false;
        }

        // Check expiration
        if (LocalDateTime.now().isAfter(otpData.getExpiresAt())) {
            otpStore.remove(email);
            return false;
        }

        // Check attempts
        if (otpData.getAttempts() >= 3) {
            otpStore.remove(email);
            return false;
        }

        // Verify OTP
        if (!otpData.getOtp().equals(otp)) {
            otpData.setAttempts(otpData.getAttempts() + 1);
            return false;
        }

        // OTP verified successfully
        otpStore.remove(email);
        return true;
    }

    public String generateResetToken(String email) {
        String token = UUID.randomUUID().toString();
        ResetTokenData tokenData = new ResetTokenData(
            token,
            LocalDateTime.now().plusMinutes(resetTokenExpirationMinutes)
        );
        resetTokenStore.put(email, tokenData);
        return token;
    }

    public boolean verifyResetToken(String email, String token) {
        ResetTokenData tokenData = resetTokenStore.get(email);

        if (tokenData == null || !tokenData.getToken().equals(token)) {
            return false;
        }

        // Check expiration
        if (LocalDateTime.now().isAfter(tokenData.getExpiresAt())) {
            resetTokenStore.remove(email);
            return false;
        }

        return true;
    }

    public void clearResetToken(String email) {
        resetTokenStore.remove(email);
    }
}
