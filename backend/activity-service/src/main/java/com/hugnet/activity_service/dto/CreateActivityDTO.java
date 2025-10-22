package com.hugnet.activity_service.dto;

import com.hugnet.activity_service.entity.ActivityStatus;
import com.hugnet.activity_service.entity.ActivityTipe;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateActivityDTO {
    private String titulo;
    private String description;
    private LocalDateTime fechaInicio; // "yyyy-MM-dd"
    private LocalDateTime fechaFin;
    private ActivityTipe tipoActividad;
    private ActivityStatus estado;
    private Long coordinadorId;
}
