package com.chainmind.warehouse.repository;

import com.chainmind.warehouse.entity.Warehouse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {
    Optional<Warehouse> findByIdAndOrganizationId(Long id, Long organizationId);

    List<Warehouse> findByOrganizationId(Long organizationId);

    @Query("SELECT w FROM Warehouse w WHERE w.organization.id = :orgId AND " +
           "(:search IS NULL OR LOWER(w.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(w.code) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(w.city) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Warehouse> findByOrganizationIdAndSearch(
            @Param("orgId") Long orgId,
            @Param("search") String search,
            Pageable pageable
    );
}
