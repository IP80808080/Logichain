package com.logichaintwo.service;

import com.logichaintwo.dto.*;
import com.logichaintwo.entities.User;
import com.logichaintwo.enums.ApprovalStatus;
import com.logichaintwo.enums.Role;
import com.logichaintwo.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class UserServiceTest {

    @Autowired
    private IUserService userService;

    @Autowired
    private UserRepository userRepository;

    @Test
    void testGetAll() {
        List<UserDTO> users = userService.getAll();
        assertNotNull(users);
    }

    @Test
    void testCreateUser() {
        CreateUserRequest request = new CreateUserRequest();
        request.setUsername("testuser");
        request.setEmail("test@example.com");
        request.setPassword("password123");
        request.setRole(Role.CUSTOMER);
        
        UserDTO created = userService.createUser(request);
        assertNotNull(created);
    }

    @Test
    void testGetById() {
        User user = new User();
        user.setUsername("gettest");
        user.setEmail("get@test.com");
        user.setPassword("pass123");
        user.setRole(Role.CUSTOMER);
        user.setApprovalStatus(ApprovalStatus.APPROVED);
        user = userRepository.save(user);
        
        UserDTO found = userService.getById(user.getId());
        assertNotNull(found);
    }
}