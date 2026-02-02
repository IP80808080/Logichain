package com.logichaintwo.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import com.logichaintwo.dto.LogRequest;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class ExternalLoggerService {

	private final RestTemplate restTemplate;

	private static final String LOGGER_URL = "http://localhost:5136/logs";

	public ExternalLoggerService(RestTemplate restTemplate) {
		this.restTemplate = restTemplate;
	}

	public void log(String level, String message) {
		try {
            LogRequest request = new LogRequest();
            request.setLevel(level);
            request.setMessage(message);
            request.setSource("SpringBoot-Backend");

            restTemplate.postForEntity(LOGGER_URL, request, Void.class);

        } catch (ResourceAccessException ex) {
            log.warn("External logger unavailable (connection refused). Falling back to local logging only.");
        } catch (Exception ex) {
            log.error("Unexpected error while sending log to external logger", ex);
        }
	}
}
