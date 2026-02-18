package com.logichaintwo.service;

import java.util.List;

import org.apache.coyote.BadRequestException;

import com.logichaintwo.dto.ChangePasswordRequest;
import com.logichaintwo.dto.CreateUserRequest;
import com.logichaintwo.dto.UpdateProfileRequest;
import com.logichaintwo.dto.UpdateUserRequest;
import com.logichaintwo.dto.UserDTO;

public interface IUserService {
    List<UserDTO> getAll();
    UserDTO getById(Long id);
    UserDTO createUser(CreateUserRequest request);
    UserDTO updateUser(Long id, UpdateUserRequest request);
    void delete(Long id);
    boolean checkPassword(String rawPassword, String encodedPassword);
    UserDTO getByEmail(String email);
    UserDTO updateProfile(Long userId, UpdateProfileRequest request) throws BadRequestException;
    void changePassword(Long userId, ChangePasswordRequest request) throws BadRequestException;
}