package com.logichaintwo.repository;

import com.logichaintwo.entities.Carrier;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CarrierRepository extends JpaRepository<Carrier, Long> {
}