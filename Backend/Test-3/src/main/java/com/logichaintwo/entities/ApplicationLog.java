//package com.logichaintwo.entities;
//
//import java.time.LocalDateTime;
//
//import jakarta.persistence.Column;
//import jakarta.persistence.Entity;
//import jakarta.persistence.GeneratedValue;
//import jakarta.persistence.GenerationType;
//import jakarta.persistence.Id;
//import jakarta.persistence.Index;
//import jakarta.persistence.PrePersist;
//import jakarta.persistence.Table;
//import lombok.AllArgsConstructor;
//import lombok.Builder;
//import lombok.Data;
//import lombok.NoArgsConstructor;
//
//@Entity
//@Table(name = "application_logs", indexes = {
//    @Index(name = "idx_log_level", columnList = "level"),
//    @Index(name = "idx_log_timestamp", columnList = "timestamp"),
//    @Index(name = "idx_log_source", columnList = "source")
//})
//@Data
//@Builder
//@NoArgsConstructor
//@AllArgsConstructor
//public class ApplicationLog {
//    
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//    
//    @Column(nullable = false, length = 20)
//    private String level;
//    
//    @Column(nullable = false, columnDefinition = "TEXT")
//    private String message;
//    
//    @Column(length = 100)
//    private String source; 
//    
//    @Column(nullable = false)
//    private LocalDateTime timestamp;
//    
//    @Column(name = "user_id")
//    private Long userId;
//    
//    @Column(name = "username", length = 100)
//    private String username;
//    
//    @Column(name = "ip_address", length = 45)
//    private String ipAddress;
//    
//    @Column(length = 255)
//    private String endpoint; 
//    
//    @Column(name = "stack_trace", columnDefinition = "TEXT")
//    private String stackTrace; 
//    
//    @PrePersist
//    protected void onCreate() {
//        if (timestamp == null) {
//            timestamp = LocalDateTime.now();
//        }
//    }
//}