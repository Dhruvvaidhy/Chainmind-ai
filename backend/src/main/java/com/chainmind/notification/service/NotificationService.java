package com.chainmind.notification.service;

import com.chainmind.common.exception.ResourceNotFoundException;
import com.chainmind.notification.entity.Notification;
import com.chainmind.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public List<Notification> getNotifications(Long orgId) {
        return notificationRepository.findByOrganizationIdOrderByCreatedAtDesc(orgId);
    }

    @Transactional
    public void markAsRead(Long orgId, Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));
        if (notification.getOrganization().getId().equals(orgId)) {
            notification.setRead(true);
            notificationRepository.save(notification);
        }
    }

    @Transactional
    public void markAllAsRead(Long orgId) {
        notificationRepository.markAllAsRead(orgId);
    }
}
