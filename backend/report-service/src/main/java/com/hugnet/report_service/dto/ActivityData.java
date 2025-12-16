package com.hugnet.report_service.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ActivityData {
    private Long activityId;
    private String titulo;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin; // <--- Agregado para el filtro
    private String estado;
    private String tipoActividad;
}