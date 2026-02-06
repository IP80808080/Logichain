package com.logichaintwo.security;

import java.util.Date;
import java.util.Map;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class JwtUtils {

	@Value("${jwt.expiration.time}")
	private long jwtExpirationTime;

	@Value("${jwt.secret}")
	private String jwtSecret;

	private SecretKey secretKey;

	@PostConstruct
	public void init() {
		log.info("Creating secret key");
		secretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes());
	}

	public String generateToken(UserPrincipal principal) {
		Date now = new Date();
		Date expiresAt = new Date(now.getTime() + jwtExpirationTime);

		return Jwts.builder().subject(principal.getEmail()).issuedAt(now).expiration(expiresAt)
				.claims(Map.of("user_id", String.valueOf(principal.getUserId()), "user_role", principal.getUserRole(), "username", principal.getDisplayUsername()))
				.signWith(secretKey).compact();
	}

	public Claims validateToken(String jwt) {
		return Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(jwt).getPayload();
	}
}