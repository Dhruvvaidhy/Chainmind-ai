package com.chainmind.notification.controller;

import com.chainmind.common.response.ApiResponse;
import com.chainmind.config.UserPrincipal;
import com.chainmind.notification.entity.Notification;
import com.chainmind.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "User & System Notifications APIs")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Get user notifications")
    public ResponseEntity<ApiResponse<List<Notification>>> getNotifications(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<Notification> notifications = notificationService.getNotifications(userPrincipal.getOrganizationId());
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark notification as read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        notificationService.markAsRead(userPrincipal.getOrganizationId(), id);
        return ResponseEntity.ok(ApiResponse.success(null, "Marked as read"));
    }

    @PostMapping("/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        notificationService.markAllAsRead(userPrincipal.getOrganizationId());
        return ResponseEntity.ok(ApiResponse.success(null, "All notifications marked as read"));
    }
}
