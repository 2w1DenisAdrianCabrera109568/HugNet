package com.hugnet.report_service.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true) // CRÍTICO: El user-service devuelve muchos datos sensibles que aquí no usas
public class UserData {
    private Long id;
    private String nombre;
    private String apellido;
    private String email;
}
