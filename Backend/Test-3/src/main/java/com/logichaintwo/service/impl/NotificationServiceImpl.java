package com.logichaintwo.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.logichaintwo.dto.NotificationDTO;
import com.logichaintwo.entities.Notification;
import com.logichaintwo.exception.ResourceNotFoundException;
import com.logichaintwo.repository.NotificationRepository;
import com.logichaintwo.service.INotificationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements INotificationService {
    private final NotificationRepository repo;
    private final ModelMapper mapper;

    @Override
    public List<NotificationDTO> getAll() {
        return repo.findAll().stream()
                .map(e -> mapper.map(e, NotificationDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public NotificationDTO getById(Long id) {
        Notification notification = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
        return mapper.map(notification, NotificationDTO.class);
    }

    @Override
    public List<NotificationDTO> getByUserId(Long userId) {
        List<Notification> notifications = repo.findByUserId(userId);
        if (notifications.isEmpty()) {
            throw new ResourceNotFoundException("No notifications found for user id: " + userId);
        }
        return notifications.stream()
                .map(e -> mapper.map(e, NotificationDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public NotificationDTO save(Notification notification) {
        return mapper.map(repo.save(notification), NotificationDTO.class);
    }

    @Override
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Notification not found with id: " + id);
        }
        repo.deleteById(id);
    }
}