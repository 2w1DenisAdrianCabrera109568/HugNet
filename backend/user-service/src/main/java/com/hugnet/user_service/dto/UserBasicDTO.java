package com.hugnet.user_service.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UserBasicDTO {
    private Long id;
    private String nombre;
    private String apellido;
    private String email;
}