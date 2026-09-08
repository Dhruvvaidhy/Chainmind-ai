package com.chainmind.audit.service;

import com.chainmind.audit.entity.AuditLog;
import com.chainmind.audit.repository.AuditLogRepository;
import com.chainmind.common.response.PagedResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional(readOnly = true)
    public PagedResponse<AuditLog> getAuditLogs(Long orgId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AuditLog> logPage = auditLogRepository.findByOrganizationIdOrderByTimestampDesc(orgId, pageable);

        return PagedResponse.<AuditLog>builder()
                .content(logPage.getContent())
                .page(logPage.getNumber())
                .size(logPage.getSize())
                .totalElements(logPage.getTotalElements())
                .totalPages(logPage.getTotalPages())
                .last(logPage.isLast())
                .build();
    }
}
