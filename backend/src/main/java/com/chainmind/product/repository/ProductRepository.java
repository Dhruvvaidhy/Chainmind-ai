package com.chainmind.product.repository;

import com.chainmind.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findByIdAndOrganizationId(Long id, Long organizationId);

    List<Product> findByOrganizationId(Long organizationId);

    boolean existsBySku(String sku);

    @Query("SELECT p FROM Product p WHERE p.organization.id = :orgId AND " +
           "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:supplierId IS NULL OR p.supplier.id = :supplierId) AND " +
           "(:categoryId IS NULL OR p.category.id = :categoryId)")
    Page<Product> findByOrganizationIdAndFilters(
            @Param("orgId") Long orgId,
            @Param("search") String search,
            @Param("supplierId") Long supplierId,
            @Param("categoryId") Long categoryId,
            Pageable pageable
    );
}
