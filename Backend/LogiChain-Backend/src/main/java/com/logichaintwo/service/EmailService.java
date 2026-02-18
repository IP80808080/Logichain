package com.logichaintwo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;

@Service
public class EmailService {

    @Value("${resend.api.key}")
    private String resendApiKey;

    @Value("${resend.from.email}")
    private String fromEmail;

    public void sendOTPEmail(String toEmail, String otp) throws ResendException {
        Resend resend = new Resend(resendApiKey);

        String htmlContent = buildEmailTemplate(otp);

        CreateEmailOptions params = CreateEmailOptions.builder()
            .from(fromEmail)
            .to(toEmail)
            .subject("Password Reset OTP")
            .html(htmlContent)
            .build();

        CreateEmailResponse response = resend.emails().send(params);

        if (response == null) {
            throw new ResendException("Failed to send email");
        }
    }

    private String buildEmailTemplate(String otp) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        background-color: #f4f4f4; 
                        padding: 20px; 
                    }
                    .container { 
                        max-width: 600px; 
                        margin: 0 auto; 
                        background: white; 
                        padding: 30px; 
                        border-radius: 10px; 
                    }
                    .otp-code { 
                        font-size: 28px; 
                        font-weight: bold; 
                        color: #667eea; 
                        text-align: center; 
                        padding: 20px; 
                        background: #f0f0f0; 
                        border-radius: 5px; 
                        margin: 20px 0; 
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Password Reset Request</h2>
                    <p>Hello,</p>
                    <p>You requested to reset your password. Use the OTP below:</p>
                    <div class="otp-code">%s</div>
                    <p><strong>This OTP will expire in 5 minutes.</strong></p>
                    <p>If you didn't request this, please ignore this email.</p>
                </div>
            </body>
            </html>
            """, otp);
    }
}