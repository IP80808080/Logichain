package com.logichaintwo.service;

import com.logichaintwo.dto.NotificationDTO;
import com.logichaintwo.entities.Notification;
import java.util.List;

public interface INotificationService {
    List<NotificationDTO> getAll();
    NotificationDTO getById(Long id);
    List<NotificationDTO> getByUserId(Long userId);
    NotificationDTO save(Notification notification);
    void delete(Long id);
}