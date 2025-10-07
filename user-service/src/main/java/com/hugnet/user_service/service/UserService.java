package com.hugnet.user_service.service;

import com.hugnet.user_service.entity.User;

import java.util.List;
import java.util.Optional;

public interface UserService {
    User registerUser(User user);
    Optional<User> login(String email, String password);
    List<User> findAllUsers();
    Optional<User> findById(Long id);
}
