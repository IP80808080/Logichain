package com.logichaintwo.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.apache.coyote.BadRequestException;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.logichaintwo.dto.ChangePasswordRequest;
import com.logichaintwo.dto.CreateUserRequest;
import com.logichaintwo.dto.UpdateProfileRequest;
import com.logichaintwo.dto.UpdateUserRequest;
import com.logichaintwo.dto.UserDTO;
import com.logichaintwo.entities.User;
import com.logichaintwo.enums.ApprovalStatus;
import com.logichaintwo.enums.Role;
import com.logichaintwo.exception.ResourceNotFoundException;
import com.logichaintwo.repository.UserRepository;
import com.logichaintwo.service.IUserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements IUserService {
	private final UserRepository repo;
	private final ModelMapper mapper;
	private final PasswordEncoder passwordEncoder;

	@Override
	public List<UserDTO> getAll() {
		return repo.findAll().stream().map(user -> mapper.map(user, UserDTO.class)).collect(Collectors.toList());
	}

	@Override
	public UserDTO getById(Long id) {
		User user = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
		return mapper.map(user, UserDTO.class);
	}

	@Override
	public UserDTO createUser(CreateUserRequest request) {
		if (repo.existsByUsername(request.getUsername())) {
			throw new IllegalArgumentException("Username already exists");
		}
		if (repo.existsByEmail(request.getEmail())) {
			throw new IllegalArgumentException("Email already exists");
		}

		User user = new User();
		user.setUsername(request.getUsername());
		user.setEmail(request.getEmail());
		user.setPassword(passwordEncoder.encode(request.getPassword()));
		user.setRole(request.getRole());
		user.setPhone(request.getPhone());
		if (user.getRole() == Role.WAREHOUSE_MANAGER || user.getRole() == Role.CUSTOMER_SUPPORT
				|| user.getRole() == Role.PRODUCT_MANAGER) {

			user.setApprovalStatus(ApprovalStatus.PENDING);
		} else {
			user.setApprovalStatus(ApprovalStatus.APPROVED);
			user.setApprovedAt(LocalDateTime.now());
			user.setApprovedBy(getCurrentUserId());
		}
		user.setCreatedAt(LocalDateTime.now());
		user.setUpdatedAt(LocalDateTime.now());

		User savedUser = repo.save(user);
		return mapper.map(savedUser, UserDTO.class);
	}

	@Override
	public UserDTO updateUser(Long id, UpdateUserRequest request) {
		User existingUser = repo.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

		if (request.getUsername() != null && !request.getUsername().equals(existingUser.getUsername())) {
			if (repo.existsByUsername(request.getUsername())) {
				throw new IllegalArgumentException("Username already exists");
			}
			existingUser.setUsername(request.getUsername());
		}

		if (request.getEmail() != null && !request.getEmail().equals(existingUser.getEmail())) {
			if (repo.existsByEmail(request.getEmail())) {
				throw new IllegalArgumentException("Email already exists");
			}
			existingUser.setEmail(request.getEmail());
		}

		if (request.getRole() != null) {
			existingUser.setRole(request.getRole());
		}

		if (request.getPhone() != null) {
			existingUser.setPhone(request.getPhone());
		}

		if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
			existingUser.setPassword(passwordEncoder.encode(request.getPassword()));
		}

		if (request.getApprovalStatus() != null) {
			existingUser.setApprovalStatus(request.getApprovalStatus());
			existingUser.setApprovedAt(LocalDateTime.now());

			Long currentUserId = getCurrentUserId();
			existingUser.setApprovedBy(currentUserId);

			if (request.getApprovalStatus() == ApprovalStatus.REJECTED) {
				existingUser.setRejectionReason(request.getRejectionReason());
			} else {
				existingUser.setRejectionReason(null);
			}
		}

		existingUser.setUpdatedAt(LocalDateTime.now());
		User savedUser = repo.save(existingUser);
		return mapper.map(savedUser, UserDTO.class);
	}

	@Override
	public void delete(Long id) {
		User user = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

		boolean hasLinkedRecords = repo.hasOrders(id);

		if (hasLinkedRecords) {
			user.setApprovalStatus(ApprovalStatus.REJECTED);
			user.setRejectionReason("Account deactivated: User has existing order history.");
			user.setUpdatedAt(LocalDateTime.now());
			repo.save(user);
		} else {
			repo.delete(user);
		}
	}

	@Override
	public boolean checkPassword(String rawPassword, String encodedPassword) {
		return passwordEncoder.matches(rawPassword, encodedPassword);
	}

	@Override
	public UserDTO getByEmail(String email) {
		User user = repo.findByEmail(email)
				.orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
		return mapper.map(user, UserDTO.class);
	}

	@Override
	@Transactional
	public UserDTO updateProfile(Long userId, UpdateProfileRequest request) throws BadRequestException {
		User user = repo.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));

		if (!user.getEmail().equals(request.getEmail())) {
			if (repo.existsByEmail(request.getEmail())) {
				throw new BadRequestException("Email already in use");
			}
			user.setEmail(request.getEmail());
		}

		if (!user.getUsername().equals(request.getUsername())) {
			if (repo.existsByUsername(request.getUsername())) {
				throw new BadRequestException("Username already in use");
			}
			user.setUsername(request.getUsername());
		}

		user.setPhone(request.getPhone());

		User updated = repo.save(user);
		return mapper.map(repo.save(user), UserDTO.class);
	}

	@Override
	@Transactional
	public void changePassword(Long userId, ChangePasswordRequest request) throws BadRequestException {
		User user = repo.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));

		if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
			throw new BadRequestException("Current password is incorrect");
		}

		if (request.getCurrentPassword().equals(request.getNewPassword())) {
			throw new BadRequestException("New password must be different from current password");
		}

		user.setPassword(passwordEncoder.encode(request.getNewPassword()));
		repo.save(user);
	}

	private Long getCurrentUserId() {
		try {
			Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
			if (authentication != null && authentication.getPrincipal() instanceof User) {
				User currentUser = (User) authentication.getPrincipal();
				return currentUser.getId();
			}

			return null;
		} catch (Exception e) {
			return null;
		}
	}
}