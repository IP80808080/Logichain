package com.logichaintwo.config;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.logichaintwo.entities.User;
import com.logichaintwo.enums.ApprovalStatus;
import com.logichaintwo.enums.Role;
import com.logichaintwo.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(1)
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.default-admin.email:admin@gmail.com}")
    private String defaultAdminEmail;

    @Value("${app.default-admin.username:admin}")
    private String defaultAdminUsername;

    @Value("${app.default-admin.password:admin123}")
    private String defaultAdminPassword;

    @Value("${app.default-admin.enabled:true}")
    private boolean defaultAdminEnabled;

    @Override
    public void run(String... args) throws Exception {
        if (defaultAdminEnabled) {
            createDefaultAdmin();
        } else {
            log.info("Default admin creation is disabled (app.default-admin.enabled=false)");
        }
    }

    
    private void createDefaultAdmin() {
        log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        log.info("Checking for default admin user...");

        if (userRepository.findByEmail(defaultAdminEmail).isPresent()) {
            log.info("Default admin user already exists with email: {}", defaultAdminEmail);
            log.info("   No action needed - skipping admin creation");
            log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            return;
        }

        if (userRepository.findByUsername(defaultAdminUsername).isPresent()) {
            log.info("Admin user already exists with username: {}", defaultAdminUsername);
            log.info("   No action needed - skipping admin creation");
            log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            return;
        }

        try {
            User adminUser = new User();
            adminUser.setUsername(defaultAdminUsername);
            adminUser.setEmail(defaultAdminEmail);
            adminUser.setPassword(passwordEncoder.encode(defaultAdminPassword));
            adminUser.setRole(Role.ADMIN);
            adminUser.setApprovalStatus(ApprovalStatus.APPROVED);
            adminUser.setPhone(null); 
            adminUser.setCreatedAt(LocalDateTime.now());
            adminUser.setUpdatedAt(LocalDateTime.now());
            adminUser.setApprovedAt(LocalDateTime.now());
            adminUser.setApprovedBy(null); 

            User savedAdmin = userRepository.save(adminUser);

            log.info("Successfully created default admin user:");
            log.info("   ┌─────────────────────────────────────────┐");
            log.info("   │  ID       : {}", savedAdmin.getId());
            log.info("   │  Email    : {}", defaultAdminEmail);
            log.info("   │  Username : {}", defaultAdminUsername);
            log.info("   │  Password : {} ", defaultAdminPassword);
            log.info("   │  Role     : {}", Role.ADMIN);
            log.info("   │  Status   : {}", ApprovalStatus.APPROVED);
            log.info("   └─────────────────────────────────────────┘");
            log.warn("   	 SECURITY WARNING: Please change the default password after first login!");
            log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        } catch (Exception e) {
            log.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            log.error("Failed to create default admin user: {}", e.getMessage());
            log.error("   Error details: ", e);
            log.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        }
    }
}
