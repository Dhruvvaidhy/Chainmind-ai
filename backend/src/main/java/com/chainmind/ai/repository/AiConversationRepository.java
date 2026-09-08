package com.chainmind.ai.repository;

import com.chainmind.ai.entity.AiConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AiConversationRepository extends JpaRepository<AiConversation, Long> {
    List<AiConversation> findByOrganizationIdAndUserIdOrderByUpdatedAtDesc(Long organizationId, Long userId);

    Optional<AiConversation> findByIdAndOrganizationId(Long id, Long organizationId);
}
