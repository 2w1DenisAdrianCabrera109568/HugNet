package com.hugnet.user_service.dto;


import com.hugnet.user_service.entity.Rol;
import lombok.Data;

@Data
public class UserDTO {
    private Long userId;
    private String nombre;
    private String apellido;
    private String email;
    private Rol rol;
    private boolean activo;
}
