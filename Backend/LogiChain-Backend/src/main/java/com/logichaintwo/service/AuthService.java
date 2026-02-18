package com.logichaintwo.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.logichaintwo.entities.User;
import com.logichaintwo.enums.ApprovalStatus;
import com.logichaintwo.enums.Role;
import com.logichaintwo.repository.UserRepository;
import com.logichaintwo.security.JwtUtils;
import com.logichaintwo.security.UserPrincipal;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final AuthenticationManager authenticationManager;
	private final JwtUtils jwtUtils;

	public Map<String, Object> register(User user) {

		if (userRepository.existsByEmail(user.getEmail())) {
			throw new IllegalArgumentException("Email already exists");
		}

		if (userRepository.existsByUsername(user.getUsername())) {
			throw new IllegalArgumentException("Username already exists");
		}

		user.setPassword(passwordEncoder.encode(user.getPassword()));
		User saved = userRepository.save(user);

		Map<String, Object> response = new HashMap<>();
		response.put("id", saved.getId());
		response.put("username", saved.getUsername());
		response.put("email", saved.getEmail());
		response.put("role", saved.getRole());
		response.put("approvalStatus", saved.getApprovalStatus());

		if (saved.getRole() == Role.WAREHOUSE_MANAGER || saved.getRole() == Role.CUSTOMER_SUPPORT || saved.getRole() == Role.PRODUCT_MANAGER) {
			response.put("message", "Registration successful. Your account is pending approval from an administrator.");
		} else {
			response.put("message", "Registration successful. You can now login.");
		}

		return response;
	}

	public Map<String, Object> login(String email, String password) {

		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

		if (!isUserAllowedToLogin(user)) {
			String message = getLoginDenialMessage(user);
			throw new DisabledException(message);
		}

		Authentication auth = authenticationManager
				.authenticate(new UsernamePasswordAuthenticationToken(email, password));

		UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
		String token = jwtUtils.generateToken(principal);

		Map<String, Object> response = new HashMap<>();
		response.put("token", token);
		response.put("id", principal.getUserId());
		response.put("username", principal.getDisplayUsername());
		response.put("email", principal.getEmail());
		response.put("role", principal.getUserRole());
		response.put("approvalStatus", user.getApprovalStatus());
		response.put("message", "Login successful");

		return response;
	}

	private boolean isUserAllowedToLogin(User user) {
		Role role = user.getRole();
		ApprovalStatus approvalStatus = user.getApprovalStatus();

		if (role == Role.ADMIN || role == Role.CUSTOMER) {
			return true;
		}

		if (role == Role.WAREHOUSE_MANAGER || role == Role.CUSTOMER_SUPPORT || role == Role.PRODUCT_MANAGER) {
			return approvalStatus == ApprovalStatus.APPROVED;
		}

		return false;
	}

	private String getLoginDenialMessage(User user) {
		ApprovalStatus status = user.getApprovalStatus();

		switch (status) {
		case PENDING:
			return "Your account is pending approval. Please wait for an administrator to approve your account.";
		case REJECTED:
			String reason = user.getRejectionReason();
			if (reason != null && !reason.trim().isEmpty()) {
				return "Your account has been rejected. Reason: " + reason + ". Please contact an administrator.";
			}
			return "Your account has been rejected. Please contact an administrator for more information.";
		default:
			return "Your account is not active. Please contact an administrator.";
		}
	}
}
