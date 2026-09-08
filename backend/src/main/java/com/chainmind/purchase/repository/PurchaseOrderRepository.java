package com.chainmind.purchase.repository;

import com.chainmind.purchase.entity.PurchaseOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    Optional<PurchaseOrder> findByIdAndOrganizationId(Long id, Long organizationId);

    boolean existsByPoNumber(String poNumber);

    List<PurchaseOrder> findByOrganizationId(Long organizationId);

    @Query("SELECT po FROM PurchaseOrder po WHERE po.organization.id = :orgId AND " +
           "(:search IS NULL OR LOWER(po.poNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(po.supplier.name) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:status IS NULL OR po.status = :status) AND " +
           "(:supplierId IS NULL OR po.supplier.id = :supplierId)")
    Page<PurchaseOrder> findByOrganizationIdAndFilters(
            @Param("orgId") Long orgId,
            @Param("search") String search,
            @Param("status") String status,
            @Param("supplierId") Long supplierId,
            Pageable pageable
    );

    @Query("SELECT COUNT(po) FROM PurchaseOrder po WHERE po.organization.id = :orgId AND po.status = :status")
    long countByOrganizationIdAndStatus(@Param("orgId") Long orgId, @Param("status") String status);
}
