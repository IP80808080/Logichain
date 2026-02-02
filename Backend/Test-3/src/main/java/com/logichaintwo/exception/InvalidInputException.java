package com.logichaintwo.exception;

@SuppressWarnings("serial")
public class InvalidInputException extends RuntimeException {
	public InvalidInputException(String message) {
		super(message);
	}
}
