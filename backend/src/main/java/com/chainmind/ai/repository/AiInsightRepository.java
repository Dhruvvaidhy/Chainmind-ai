package com.chainmind.ai.repository;

import com.chainmind.ai.entity.AiInsight;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiInsightRepository extends JpaRepository<AiInsight, Long> {
    List<AiInsight> findByOrganizationIdOrderByCreatedAtDesc(Long organizationId);

    Page<AiInsight> findByOrganizationId(Long organizationId, Pageable pageable);
}
