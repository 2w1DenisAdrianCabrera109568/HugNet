package com.hugnet.report_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserRankingDTO {
    private Long userId;
    private String nombreCompleto;
    private String email;
    private Long cantidadEventos; // Cuántas veces participó
    private Integer puesto;       // 1º, 2º, 3º...
}