package com.chainmind.inventory.repository;

import com.chainmind.inventory.entity.Inventory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByIdAndOrganizationId(Long id, Long organizationId);

    Optional<Inventory> findByProductIdAndWarehouseId(Long productId, Long warehouseId);

    List<Inventory> findByOrganizationId(Long organizationId);

    List<Inventory> findByOrganizationIdAndProductId(Long organizationId, Long productId);

    @Query("SELECT SUM(i.currentStock) FROM Inventory i WHERE i.warehouse.id = :warehouseId")
    Integer sumCurrentStockByWarehouseId(@Param("warehouseId") Long warehouseId);

    @Query("SELECT i FROM Inventory i WHERE i.organization.id = :orgId AND " +
           "(:productId IS NULL OR i.product.id = :productId) AND " +
           "(:warehouseId IS NULL OR i.warehouse.id = :warehouseId) AND " +
           "(:search IS NULL OR LOWER(i.product.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(i.product.sku) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Inventory> findByOrganizationIdAndFilters(
            @Param("orgId") Long orgId,
            @Param("search") String search,
            @Param("productId") Long productId,
            @Param("warehouseId") Long warehouseId,
            Pageable pageable
    );

    @Query("SELECT COUNT(i) FROM Inventory i WHERE i.organization.id = :orgId AND i.availableStock <= i.reorderLevel")
    long countLowStockItems(@Param("orgId") Long orgId);

    @Query("SELECT COUNT(i) FROM Inventory i WHERE i.organization.id = :orgId AND i.availableStock <= i.safetyStock")
    long countStockoutRiskItems(@Param("orgId") Long orgId);
}
