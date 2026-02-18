package com.logichaintwo.service;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.logichaintwo.dto.LogResponse;
import com.logichaintwo.repository.ApplicationLogRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ApplicationLogService {

    private final ApplicationLogRepository repository;
    private final ModelMapper modelMapper;

    public List<LogResponse> getAllLogs() {
    	return repository.findAllByOrderByTimestampAsc()
                .stream()
                .map(log -> modelMapper.map(log, LogResponse.class))
                .collect(Collectors.toList());
    }
}