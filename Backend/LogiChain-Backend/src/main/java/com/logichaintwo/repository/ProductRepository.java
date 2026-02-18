package com.logichaintwo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.logichaintwo.entities.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
    boolean existsBySku(String sku);
    List<Product> findByCreatedBy(Long userId);
    boolean existsByCreatedBy(Long userId); 
}