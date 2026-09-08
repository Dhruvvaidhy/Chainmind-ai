package com.chainmind.shipment.repository;

import com.chainmind.shipment.entity.Shipment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {
    Optional<Shipment> findByIdAndOrganizationId(Long id, Long organizationId);

    List<Shipment> findByOrganizationId(Long organizationId);

    @Query("SELECT s FROM Shipment s WHERE s.organization.id = :orgId AND " +
           "(:search IS NULL OR LOWER(s.shipmentNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(s.carrier) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(s.trackingNumber) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:status IS NULL OR s.status = :status) AND " +
           "(:riskLevel IS NULL OR s.riskLevel = :riskLevel)")
    Page<Shipment> findByOrganizationIdAndFilters(
            @Param("orgId") Long orgId,
            @Param("search") String search,
            @Param("status") String status,
            @Param("riskLevel") String riskLevel,
            Pageable pageable
    );

    @Query("SELECT COUNT(s) FROM Shipment s WHERE s.organization.id = :orgId AND s.status IN ('CREATED', 'PICKED_UP', 'IN_TRANSIT', 'DELAYED', 'OUT_FOR_DELIVERY')")
    long countActiveShipments(@Param("orgId") Long orgId);

    @Query("SELECT COUNT(s) FROM Shipment s WHERE s.organization.id = :orgId AND s.riskLevel IN ('HIGH', 'CRITICAL') AND s.status NOT IN ('DELIVERED', 'CANCELLED')")
    long countHighRiskShipments(@Param("orgId") Long orgId);
}
