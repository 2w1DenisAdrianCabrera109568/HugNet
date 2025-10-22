package com.hugnet.user_service.dto;
import com.hugnet.user_service.entity.Rol;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponseDTO {
    private Long userId;
    private String email;
    private Rol rol;
    private String token;
}