package com.hugnet.user_service.service;

import com.hugnet.user_service.dto.CreateUserDTO;
import com.hugnet.user_service.dto.LoginResponseDTO;
//import com.hugnet.user_service.dto.UserBasicDTO;
import com.hugnet.user_service.dto.UserDTO;

import java.util.List;

public interface UserService {
    UserDTO registerUser(CreateUserDTO dto);
    LoginResponseDTO loginUser(String email, String password);
    List<UserDTO> getAll();
    UserDTO getById(Long id);
    UserDTO updateUser(Long id, UserDTO userDTO);
    void deleteUser(Long id);
    List<UserDTO> getByRol(String rol);
    void changeUserRole(Long userId, String newRoleName);
    //List<UserBasicDTO> findUsersByIds(List<Long> ids);
}
