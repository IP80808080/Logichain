package com.logichaintwo.security;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.fasterxml.jackson.databind.ObjectMapper;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class CustomJwtFilter extends OncePerRequestFilter {

	private final JwtUtils jwtUtils;
	private final ObjectMapper objectMapper;

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		try {
			String authHeader = request.getHeader("Authorization");

			if (authHeader == null || !authHeader.startsWith("Bearer ")) {
				filterChain.doFilter(request, response);
				return;
			}

			log.debug("Processing JWT token for request: {}", request.getRequestURI());

			String jwt = authHeader.substring(7);

			Claims claims = jwtUtils.validateToken(jwt);

			String userId = claims.get("user_id", String.class);
			String username = claims.get("username", String.class);
			String role = claims.get("user_role", String.class);

			List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(role));

			UserPrincipal principal = new UserPrincipal(userId, claims.getSubject(), null, null, role, username);

			Authentication authentication = new UsernamePasswordAuthenticationToken(principal, null, authorities);

			SecurityContextHolder.getContext().setAuthentication(authentication);
			log.info("Auth stored in context");

			filterChain.doFilter(request, response);

		} catch (ExpiredJwtException e) {

			log.error("JWT token expired: {}", e.getMessage());
			handleException(response, "Token has expired", HttpServletResponse.SC_UNAUTHORIZED);

		} catch (MalformedJwtException e) {

			log.error("Malformed JWT token: {}", e.getMessage());
			handleException(response, "Invalid token format", HttpServletResponse.SC_UNAUTHORIZED);

		} catch (SignatureException e) {

			log.error("JWT signature validation failed: {}", e.getMessage());
			handleException(response, "Invalid token signature", HttpServletResponse.SC_UNAUTHORIZED);

		} catch (Exception e) {

			log.error("JWT authentication error: {}", e.getMessage(), e);
			handleException(response, "Authentication failed: " + e.getMessage(), HttpServletResponse.SC_UNAUTHORIZED);
		}
	}

	private void handleException(HttpServletResponse response, String message, int status) throws IOException {
		SecurityContextHolder.clearContext();
		response.setStatus(status);
		response.setContentType("application/json");

		String jsonResponse = String.format("{\"success\":false,\"message\":\"%s\",\"data\":null,\"timestamp\":\"%s\"}",
				message, java.time.LocalDateTime.now().toString());

		response.getWriter().write(jsonResponse);
	}
}