package com.chainmind.inventory.repository;

import com.chainmind.inventory.entity.StockMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
    List<StockMovement> findByInventoryIdOrderByCreatedAtDesc(Long inventoryId);

    @Query("SELECT sm FROM StockMovement sm WHERE sm.organization.id = :orgId AND " +
           "(:inventoryId IS NULL OR sm.inventory.id = :inventoryId) AND " +
           "(:productId IS NULL OR sm.product.id = :productId) AND " +
           "(:type IS NULL OR sm.type = :type)")
    Page<StockMovement> findByOrganizationIdAndFilters(
            @Param("orgId") Long orgId,
            @Param("inventoryId") Long inventoryId,
            @Param("productId") Long productId,
            @Param("type") String type,
            Pageable pageable
    );
}
