package com.logichaintwo.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

import com.logichaintwo.enums.TransactionType;

@Entity
@Data
public class InventoryTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long inventoryId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TransactionType transactionType;

    private Integer quantityChanged;
    private Long referenceId;
    private LocalDateTime timestamp = LocalDateTime.now();
    
    @ManyToOne
    @JoinColumn(name = "inventoryId", insertable = false, updatable = false)
    private Inventory inventory;
}
