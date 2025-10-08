package com.hugnet.user_service.service;

import com.hugnet.user_service.DTO.CreateUserDTO;
import com.hugnet.user_service.DTO.UserDTO;
import com.hugnet.user_service.entity.User;

import java.util.List;
import java.util.Optional;

public interface UserService {
    UserDTO register(CreateUserDTO dto);
    UserDTO login(String email, String password);
    List<UserDTO> getAll();
    UserDTO getById(Long id);
    UserDTO update(Long id, UserDTO userDTO);
    void delete(Long id);
    List<UserDTO> getByRol(String rol);
}
