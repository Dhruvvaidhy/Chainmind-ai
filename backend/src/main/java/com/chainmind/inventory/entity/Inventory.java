package com.chainmind.inventory.entity;

import com.chainmind.organization.entity.Organization;
import com.chainmind.product.entity.Product;
import com.chainmind.warehouse.entity.Warehouse;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"product_id", "warehouse_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @Column(name = "current_stock")
    @Builder.Default
    private Integer currentStock = 0;

    @Column(name = "reserved_stock")
    @Builder.Default
    private Integer reservedStock = 0;

    @Column(name = "available_stock")
    @Builder.Default
    private Integer availableStock = 0;

    @Column(name = "incoming_stock")
    @Builder.Default
    private Integer incomingStock = 0;

    @Column(name = "damaged_stock")
    @Builder.Default
    private Integer damagedStock = 0;

    @Column(name = "reorder_level")
    @Builder.Default
    private Integer reorderLevel = 50;

    @Column(name = "safety_stock")
    @Builder.Default
    private Integer safetyStock = 20;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        recalculateAvailableStock();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        recalculateAvailableStock();
    }

    public void recalculateAvailableStock() {
        int curr = (this.currentStock != null) ? this.currentStock : 0;
        int res = (this.reservedStock != null) ? this.reservedStock : 0;
        this.availableStock = Math.max(0, curr - res);
    }
}
