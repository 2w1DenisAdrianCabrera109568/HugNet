package com.hugnet.user_service.dto.common;


import com.hugnet.user_service.dto.*;
import com.hugnet.user_service.entity.User;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class UserMapper {

    public UserDTO toDTO(User u) {
        if (u == null) return null;
        UserDTO dto = new UserDTO();
        dto.setUserId(u.getUserId());
        dto.setNombre(u.getNombre());
        dto.setApellido(u.getApellido());
        dto.setEmail(u.getEmail());
        dto.setRol(u.getRol());
        dto.setActivo(u.isActivo());
        return dto;
    }

    public List<UserDTO> toDTOList(List<User> users) {
        return users.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public User toEntity(CreateUserDTO dto) {
        if (dto == null) return null;
        return User.builder()
                .nombre(dto.getNombre())
                .apellido(dto.getApellido())
                .email(dto.getEmail())
                .password(dto.getPassword())
                .rol(dto.getRol())
                .activo(true)
                .build();
    }
}
