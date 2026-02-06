package com.logichaintwo.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

import com.logichaintwo.enums.NotificationType;

@Entity
@Data
public class NotificationTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true)
    private String templateName;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private NotificationType notificationType;
    
    private String subject;
    
    @Column(columnDefinition = "TEXT")
    private String bodyTemplate;
    
    private LocalDateTime createdAt = LocalDateTime.now();
}
