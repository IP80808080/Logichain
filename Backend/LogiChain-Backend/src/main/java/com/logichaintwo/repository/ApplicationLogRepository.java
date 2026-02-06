package com.logichaintwo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.logichaintwo.entities.ApplicationLog;

@Repository
public interface ApplicationLogRepository extends JpaRepository<ApplicationLog, Long> {
	List<ApplicationLog> findAllByOrderByTimestampAsc();
}