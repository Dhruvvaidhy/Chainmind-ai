package com.chainmind.audit.controller;

import com.chainmind.audit.entity.AuditLog;
import com.chainmind.audit.service.AuditLogService;
import com.chainmind.common.response.ApiResponse;
import com.chainmind.common.response.PagedResponse;
import com.chainmind.config.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
@Tag(name = "Audit Logs", description = "System activity and administrative audit log APIs")
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ORGANIZATION_ADMIN')")
    @Operation(summary = "Get administrative audit logs")
    public ResponseEntity<ApiResponse<PagedResponse<AuditLog>>> getAuditLogs(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        PagedResponse<AuditLog> response = auditLogService.getAuditLogs(userPrincipal.getOrganizationId(), page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
