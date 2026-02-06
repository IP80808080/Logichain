package com.logichaintwo.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.logichaintwo.dto.ApiResponse;
import com.logichaintwo.dto.LogResponse;
import com.logichaintwo.service.ApplicationLogService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/logs")
@RequiredArgsConstructor
public class ApplicationLogController {

	private final ApplicationLogService logService;

	@GetMapping
	@PreAuthorize("hasAuthority('ADMIN')")
	public ResponseEntity<ApiResponse> getAll() {
		List<LogResponse> logs = logService.getAllLogs();
		return ResponseEntity.ok(ApiResponse.success("Logs retrieved successfully", logs));
	}
}