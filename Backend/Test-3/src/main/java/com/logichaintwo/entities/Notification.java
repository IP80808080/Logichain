package com.logichaintwo.entities;

import java.time.LocalDateTime;

import com.logichaintwo.enums.NotificationChannel;
import com.logichaintwo.enums.NotificationStatus;
import com.logichaintwo.enums.NotificationType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Entity
@Data
public class Notification {
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "User ID is required")
    @Column(nullable = false)
    private Long userId;

    private Long orderId;
    private Long shipmentId;

    @NotNull(message = "Notification type is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private NotificationType notificationType;

    @NotNull(message = "Channel is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NotificationChannel channel;

    @NotBlank(message = "Message is required")
    @Size(min = 1, max = 1000, message = "Message must be between 1 and 1000 characters")
    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NotificationStatus status;

    private LocalDateTime sentAt;
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "userId", insertable = false, updatable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "orderId", insertable = false, updatable = false)
    private Order order;

    @ManyToOne
    @JoinColumn(name = "shipmentId", insertable = false, updatable = false)
    private Shipment shipment;
}
