package com.chainmind.supplier.repository;

import com.chainmind.supplier.entity.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    Optional<Supplier> findByIdAndOrganizationId(Long id, Long organizationId);

    List<Supplier> findByOrganizationId(Long organizationId);

    @Query("SELECT s FROM Supplier s WHERE s.organization.id = :orgId AND " +
           "(:search IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(s.contactPerson) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(s.email) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:status IS NULL OR s.status = :status)")
    Page<Supplier> findByOrganizationIdAndFilters(
            @Param("orgId") Long orgId,
            @Param("search") String search,
            @Param("status") String status,
            Pageable pageable
    );
}
